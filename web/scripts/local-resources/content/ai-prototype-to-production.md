An AI prototype can impress a room in an afternoon. A notebook, a prompt, ten hand-picked examples, and it looks like magic. Then real users arrive with inputs nobody imagined, the provider has a slow day, costs creep up, and someone asks how you know the new prompt is better than the old one. This guide covers the gap between those two moments. It is model-agnostic on purpose: providers and model names change every few months, and the engineering does not.

## 1. Why prototypes lie

A prototype is tested on the inputs its author thought of. Production is tested on everyone else's. The most common surprises:

- **Inputs are messier.** Empty fields, other languages, pasted HTML, a 40-page document where you expected a paragraph.
- **Outputs vary.** The same prompt gives slightly different answers, and once in a while a badly wrong one.
- **Latency is a product feature.** Eight seconds felt fine in a demo. It feels broken in a form.
- **Cost scales with usage**, and with prompt length, which tends to grow quietly.
- **"Better" is unmeasured.** Without an evaluation set, every prompt change is a guess.
- **Users are adversarial sometimes.** People will try to make your feature say or do things you did not intend.

None of these are AI-specific problems. They are ordinary engineering problems, which is good news: the usual tools work.

## 2. Treat the model as a dependency, not the architecture

The model is an unreliable, slow, expensive external service that returns text. Design around it like you would any third-party API.

```
Client
  │
  ▼
Your API ──► AI service layer ──► Model provider(s)
  │              │
  │              ├── prompt templates (versioned)
  │              ├── input validation and trimming
  │              ├── output parsing and validation
  │              ├── retries, timeouts, fallbacks
  │              └── logging, metrics, cost tracking
  ▼
Database / queue
```

Put every model call behind **one internal interface** in your codebase. That single seam is where you add retries, logging, caching, provider switching and cost limits, once, instead of in fifteen places.

```python
from dataclasses import dataclass

@dataclass
class Summary:
    title: str
    bullets: list[str]
    confidence: float

class Summarizer:
    def __init__(self, client, model: str, prompt_version: str):
        self.client = client
        self.model = model
        self.prompt_version = prompt_version

    def summarize(self, text: str) -> Summary:
        text = trim_to_budget(text, max_tokens=6000)
        raw = self.client.generate(
            model=self.model,
            prompt=render_prompt("summarize", self.prompt_version, text=text),
            response_schema=SUMMARY_SCHEMA,
            timeout=20,
        )
        return parse_and_validate(raw, Summary)
```

The rest of the application asks for a `Summary`. It does not know or care which provider, model or prompt produced it.

## 3. Model integration

### Prompts are code

- Keep prompts in version control, not pasted into a dashboard.
- Give each one a **version** and log that version with every call. When quality drops, you need to know which prompt produced which output.
- Separate the fixed instructions from user content. Mark user content clearly so the model can tell them apart.
- Review prompt changes like code changes, with evaluation results attached (see section 5).

### Ask for structure

If your code consumes the output, do not parse free text with regular expressions. Most providers now support **structured output**: you supply a JSON schema and the response follows it. Use it, and still validate on your side, because "usually valid" is not "always valid."

```python
from pydantic import BaseModel, Field, ValidationError

class Classification(BaseModel):
    category: str = Field(pattern="^(billing|bug|feature_request|other)$")
    urgency: int = Field(ge=1, le=5)
    reason: str

try:
    result = Classification.model_validate_json(raw_output)
except ValidationError:
    result = None  # retry once with the error, then fall back
```

### Choose the smallest model that passes your evals

Bigger models are slower and cost more. Many production tasks (classification, extraction, routing, short rewrites) work well on smaller, faster models. Start with a capable model to establish a quality baseline, then try cheaper ones against the same evaluation set. Routing easy requests to a small model and hard ones to a large model is a common, effective pattern.

### Retrieval, when the model needs your data

If answers depend on your documents, give the model the relevant pieces at request time (retrieval-augmented generation) instead of hoping it memorised them. The retrieval step is usually where quality is won or lost. Most "the AI is wrong" bugs I have looked at in RAG systems were really "we retrieved the wrong chunks." Evaluate retrieval separately from generation.

## 4. Inference APIs in practice

### Budgets

- **Input tokens:** trim, summarise or chunk long inputs. Set a hard maximum.
- **Output tokens:** set a max so a rambling response cannot run up the bill or the clock.
- **Per-user and per-tenant limits:** one user with a script can otherwise spend your monthly budget overnight.

### Timeouts

Set a timeout on every call. Pick it from your user experience, not from the provider's defaults. If a response is only useful within 10 seconds, waiting 60 does nobody any good.

### Streaming

For anything a person reads, stream the response. Time to first token matters more to perceived speed than total time. Make sure your whole stack supports it (some proxies and serverless platforms buffer responses unless told otherwise).

### Async for heavy work

Long documents, batch processing and multi-step agent workflows belong in a background job, not an HTTP request. Return `202 Accepted`, process in a worker, notify on completion. Many providers also offer batch APIs at lower prices for work that is not time-sensitive.

### Rate limits

Providers rate limit by requests and by tokens. Handle `429` responses with backoff, respect `Retry-After`, and put a queue in front of the model for bulk jobs so you control the rate instead of the provider rejecting you.

## 5. Evaluation

This is the step most teams skip and the one that matters most. Without evals you cannot tell improvement from regression, and every model upgrade is a gamble.

### Build a golden dataset

Start with **50 to 200 real examples** (anonymised) covering:

- Typical cases
- Edge cases: empty, very long, other languages, ambiguous
- Known past failures, so they never come back
- Adversarial inputs: attempts to override instructions or extract the prompt

For each, write down what a good output looks like. Sometimes that is an exact answer. Sometimes it is a rubric.

### Pick scoring methods that fit the task

| Task type | How to score |
|---|---|
| Classification, extraction | Exact match, precision and recall per field |
| Structured output | Schema validity rate plus field accuracy |
| Retrieval | Did the right document appear in the top results? |
| Open-ended text | Rubric scored by humans, or by a model acting as judge, spot-checked by humans |
| Safety | Rate of refusals on bad inputs, rate of wrong refusals on good inputs |

Using a model as a judge is useful and scalable, but calibrate it: have people score a sample and check the judge agrees with them. Judges have biases too, such as preferring longer answers.

### Make it a gate

Run the eval suite in CI whenever a prompt, model, retrieval setting or parsing step changes. Fail the build when scores drop below a threshold. Treat a prompt change without eval results the way you would treat a code change without tests.

```
prompt v12 → v13
  classification accuracy   0.91 → 0.94   ✓
  schema validity           1.00 → 1.00   ✓
  avg latency (p50)         1.8s → 2.1s   ⚠
  avg cost per call         $0.0021 → $0.0024
  regressions               2 examples (see report)
```

### Keep learning from production

Offline evals tell you what you tested. Production tells you what you missed. Feed real failures, user complaints and thumbs-down examples back into the golden set every week or two.

## 6. Monitoring

Log every model call with enough detail to debug it later:

- Request ID, user or tenant ID (or a hash), feature name
- Model, prompt version, parameters
- Input and output (subject to your privacy rules, see below)
- Token counts and computed cost
- Latency: time to first token and total
- Outcome: success, timeout, validation failure, fallback used, refused

Dashboards I want for any AI feature:

- **Latency** at p50, p95 and p99
- **Error and fallback rates** by type
- **Validation failure rate** (outputs that did not match the schema)
- **Cost** per day, per feature, per tenant
- **User feedback** signals: thumbs up and down, edits, regenerations, abandonment

Alert on sudden changes. A spike in validation failures often means the provider changed something, or your inputs did.

**Privacy.** Prompts and outputs often contain personal data. Decide what you log, redact what you can, set retention limits, restrict who can read the logs, and check your provider's data retention and training policies before sending customer data.

## 7. Latency

In rough order of impact:

1. **Stream** the output.
2. **Use a smaller model** where evals show it is good enough.
3. **Shorten the prompt.** Long system prompts and stuffed context cost time on every call. Many providers also offer prompt caching for repeated prefixes, which cuts both latency and cost when your instructions are long and stable.
4. **Cache results** for repeated identical inputs, keyed on input plus prompt version plus model.
5. **Run independent calls in parallel** instead of a chain.
6. **Precompute.** If a summary can be generated when a document is uploaded, do not generate it when someone opens the page.
7. **Reduce output length.** Ask for exactly what you need.

## 8. Failure handling

Plan for each failure explicitly.

| Failure | Response |
|---|---|
| Timeout or `5xx` from provider | Retry with backoff once or twice, then fall back |
| `429` rate limited | Back off, honour `Retry-After`, queue if bulk |
| Output fails schema validation | Retry once with the validation error in the prompt, then fall back |
| Output is valid but low confidence | Route to human review or show with a clear caveat |
| Provider outage | Switch to a secondary provider or model, or degrade the feature |
| Content refused | Show a helpful message, log it, check whether it was a false refusal |

**Fallbacks** do not have to be AI. A rule-based classifier, a keyword search, or simply "we couldn't generate a summary, here is the original" are all valid. The worst fallback is a spinner that never ends.

**Kill switch.** Every AI feature should be behind a flag you can turn off without a deploy.

## 9. Security

- **Prompt injection is real.** Any text the model reads (user input, documents, web pages, emails) can contain instructions. You cannot fully prevent it with prompting alone. Limit the damage instead.
- **Least privilege for tools.** If the model can call functions, give it the narrowest set it needs. Read-only where possible. Scope every tool call to the current user's permissions, enforced in your code, not in the prompt.
- **Confirm before consequential actions.** Sending email, deleting data, spending money: show the user what is about to happen and ask.
- **Treat model output as untrusted input.** Escape it before rendering as HTML. Never pass it straight into SQL, shell commands or `eval`.
- **Keep secrets out of prompts.** Assume the system prompt can be extracted.

## 10. Responsible deployment

- **Human in the loop for high-stakes decisions.** Hiring, lending, medical, legal, anything that significantly affects a person: the model can assist, rank or draft, and a person decides. Make reviewing easy, and record who approved what.
- **Be honest with users.** Label AI-generated content and features. Tell people when they are talking to a bot.
- **Check for uneven performance.** Evaluate across languages, regions and user groups that matter for your product. An average accuracy can hide a group for whom the feature mostly fails.
- **Give users control.** Let them edit, reject, report and opt out.
- **Roll out gradually.** Internal users, then a small percentage, then everyone. Compare metrics at each step.
- **Write it down.** A short page per feature: what it does, which model and prompt version, known limitations, how it was evaluated, who owns it.

## 11. Cost control

- Track cost per call, per feature and per tenant from day one. It is hard to add later.
- Set budgets and alerts at the provider and in your own code.
- Cache, trim prompts, and use smaller models where evals allow.
- Move non-urgent work to batch processing.
- Price your product with real usage numbers, including the heavy users.

## Production readiness checklist

- [ ] All model calls go through one internal interface
- [ ] Prompts are versioned in git and the version is logged with each call
- [ ] Structured outputs are validated against a schema
- [ ] Input and output token limits are enforced
- [ ] Every call has a timeout, retries use backoff, and there is a fallback
- [ ] A golden evaluation set exists and runs in CI
- [ ] Latency, errors, validation failures and cost are on a dashboard with alerts
- [ ] Logging respects privacy rules and retention limits
- [ ] Tools follow least privilege, and consequential actions need confirmation
- [ ] Model output is escaped and never executed
- [ ] High-stakes decisions have a human reviewer
- [ ] AI features are labelled for users
- [ ] The feature is behind a flag with a kill switch
- [ ] Per-user rate limits and spending limits are in place
- [ ] A one-page description of the feature and its limitations exists

The model is usually the easy part. Shipping it well comes down to everything around it: measurement, guardrails, and the unglamorous plumbing that keeps a probabilistic component from making the rest of your product unreliable.
