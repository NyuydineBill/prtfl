An AI prototype can impress a room in an afternoon: a notebook, a prompt, ten hand-picked examples, and it looks like magic. Then real users arrive with inputs nobody imagined, the provider has a slow day, costs creep up, and someone asks how you know the new prompt is better than the old one. This guide covers the gap between those two moments.

It is model-agnostic on purpose. Providers and model names change every few months; the engineering around them does not. Most of what follows is ordinary software practice (interfaces, timeouts, tests, monitoring, staged rollouts) applied to a component that is slow, costly and probabilistic.

> [!NOTE]
> Code is Python for illustration, and the `client` object stands in for whichever provider SDK you use. Timings and costs in the figures are illustrative, chosen to show the shape of a problem rather than to describe any particular model.

## 1. Why prototypes lie

A prototype is tested on the inputs its author thought of. Production is tested on everyone else's. The usual surprises:

- **Inputs are messier.** Empty fields, other languages, pasted HTML, a 40-page document where you expected a paragraph.
- **Outputs vary.** The same prompt gives slightly different answers, and occasionally a badly wrong one.
- **Latency is a product feature.** Eight seconds felt fine in a demo. It feels broken in a form.
- **Cost scales with usage** and with prompt length, which tends to grow quietly.
- **"Better" is unmeasured.** Without an evaluation set, every prompt change is a guess.
- **Some users are adversarial.** People will try to make your feature say or do things you did not intend.

None of these are new problems. They are ordinary engineering problems, which is good news: the usual tools work.

## 2. Treat the model as a dependency, not the architecture

From your system's point of view, a model is an external service that is slow, sometimes unavailable, charges per call and returns text that may or may not be what you asked for. Design around it the way you would around any third-party API.

```figure
ai-service-layer
```

Put every model call behind **one internal interface** in your codebase. That seam is where retries, logging, caching, provider switching and cost limits are added once, instead of in fifteen places.

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
            max_output_tokens=400,
            timeout=20,
        )
        return parse_and_validate(raw, Summary)
```

The rest of the application asks for a `Summary`. It does not know or care which provider, model or prompt produced it, and its tests can use a fake `Summarizer` that never calls a model.

## 3. Model integration

### Prompts are code

- Keep prompts in version control, not pasted into a dashboard.
- Give each prompt a **version** and log it with every call. When quality drops, you need to know which prompt produced which output.
- Separate fixed instructions from user content, and mark user content clearly so it reads as data.
- Review prompt changes like code changes, with evaluation results attached (chapter 5).

### Ask for structure

If code consumes the output, do not parse free text with regular expressions. Most providers support **structured output**: you supply a JSON Schema and the response is constrained to follow it. Use it, and still validate on your side, because "usually valid" is not "always valid."

```python
from typing import Literal
from pydantic import BaseModel, Field, ValidationError

class Classification(BaseModel):
    category: Literal["billing", "bug", "feature_request", "other"]
    urgency: int = Field(ge=1, le=5)
    reason: str

try:
    result = Classification.model_validate_json(raw_output)
except ValidationError as err:
    result = None  # retry once with err in the prompt, then fall back
```

### Choose the smallest model that passes your evals

Larger models are usually slower and cost more per token. Many production tasks (classification, extraction, routing, short rewrites) work well on smaller, faster models. Establish a quality baseline with a capable model, then try cheaper ones against the same evaluation set. Routing easy requests to a small model and hard ones to a large model is a common pattern.

### Retrieval, when the model needs your data

If answers depend on your documents, give the model the relevant passages at request time (retrieval-augmented generation, or RAG) rather than hoping it memorised them. Retrieval quality caps answer quality: if the right passage is not retrieved, the model cannot use it. Evaluate retrieval separately from generation, so you know which half to fix when an answer is wrong.

## 4. Inference APIs in practice

```figure
ai-request-path
```

### Budgets

- **Input tokens:** trim, summarise or chunk long inputs, and set a hard maximum.
- **Output tokens:** set a maximum so a rambling response cannot run up the bill or the clock.
- **Per-user and per-tenant limits:** without them, one user with a script can spend a month's budget overnight.

### Timeouts

Set a timeout on every call, chosen from your user experience rather than the SDK default. If a response is only useful within 10 seconds, waiting 60 helps nobody.

### Streaming

For anything a person reads, stream the response; time to first token shapes perceived speed far more than total time. Check the whole path supports it, since some proxies and serverless platforms buffer responses unless configured not to.

### Async for heavy work

Long documents, batch processing and multi-step agent workflows belong in a background job, not an HTTP request. Return `202 Accepted`, process in a worker, and notify on completion. Several providers also offer batch APIs at lower prices for work that is not time-sensitive.

### Rate limits

Providers limit requests and tokens per minute. Handle `429` responses with backoff, honour `Retry-After`, and put a queue in front of the model for bulk jobs so you control the rate instead of the provider rejecting you.

## 5. Evaluation

Evaluation is the step most often skipped and the one that matters most. Without it you cannot tell an improvement from a regression, and every model upgrade is a gamble.

```figure
ai-eval-loop
```

### Build a golden dataset

Start with real examples, anonymised. A few dozen well-chosen cases is enough to begin; the set grows every time production finds something new. Cover:

- Typical cases
- Edge cases: empty, very long, other languages, ambiguous
- Known past failures, so they never come back
- Adversarial inputs: attempts to override instructions or extract the prompt

For each, write down what a good output looks like. Sometimes that is an exact answer, sometimes a rubric.

### Pick scoring methods that fit the task

| Task type | How to score |
|---|---|
| Classification, extraction | Exact match; precision and recall per field |
| Structured output | Schema validity rate plus field accuracy |
| Retrieval | Did the right document appear in the top results? |
| Open-ended text | A rubric scored by people, or by a model acting as judge and spot-checked by people |
| Safety | Rate of refusals on harmful inputs, and rate of wrong refusals on legitimate ones |

A model acting as judge scales well, but calibrate it: have people score a sample and check the judge agrees. Published research on model judges has documented biases such as favouring longer answers and favouring whichever answer is shown first.

### Make it a gate

Run the evaluation suite in CI whenever a prompt, model, retrieval setting or parser changes, and fail the build when a score drops below its threshold. Treat a prompt change without evaluation results the way you would treat a code change without tests.

### Keep learning from production

Offline evaluation tells you about the cases you thought of. Production tells you about the rest. Feed real failures, complaints and thumbs-down examples back into the golden set on a regular schedule.

## 6. Monitoring

Log every model call with enough detail to debug it later:

- Request ID, user or tenant ID (or a hash of it), feature name
- Model, prompt version, parameters
- Input and output, subject to your privacy rules
- Token counts and computed cost
- Latency: time to first token and total
- Outcome: success, timeout, validation failure, fallback used, refused

Dashboards worth having for any AI feature:

- **Latency** at p50, p95 and p99
- **Error and fallback rates**, by type
- **Validation failure rate**: outputs that did not match the schema
- **Cost** per day, per feature and per tenant
- **User feedback**: ratings, edits, regenerations, abandonment

Alert on sudden changes. A jump in validation failures usually means the model, the provider or your inputs changed.

> [!WARNING]
> Prompts and outputs often contain personal data. Decide what you log, redact what you can, set retention limits, restrict who can read the logs, and check your provider's data retention and training terms before sending customer data.

## 7. Latency

```figure
ai-latency
```

In rough order of impact:

1. **Stream** the output.
2. **Use a smaller model** where evaluations show it is good enough.
3. **Shorten the prompt.** Long instructions and stuffed context cost time on every call. Many providers also offer prompt caching for a repeated prefix, which reduces latency and cost when instructions are long and stable.
4. **Cache results** for repeated identical inputs, keyed on input plus prompt version plus model.
5. **Run independent calls in parallel** instead of in a chain.
6. **Precompute.** If a summary can be generated when a document is uploaded, do not generate it when someone opens the page.
7. **Ask for less output.** Request exactly what you need.

## 8. Failure handling

Plan for each failure explicitly.

```figure
ai-failures
```

**Fallbacks do not have to be AI.** A rule-based classifier, a keyword search, or simply "we couldn't generate a summary, here is the original" are all valid. The worst fallback is a spinner that never ends.

**Kill switch.** Put every AI feature behind a flag you can turn off without a deploy.

## 9. Security

```figure
ai-trust-boundary
```

- **Prompt injection is real.** Any text the model reads (user input, documents, web pages, emails, tool results) can contain instructions. Prompting alone cannot fully prevent it, so limit what a manipulated model is able to do.
- **Least privilege for tools.** If the model can call functions, give it the narrowest set it needs, read-only where possible. Scope every tool call to the current user's permissions, enforced in your code, never in the prompt.
- **Confirm consequential actions.** Sending email, deleting data, spending money: show the user what is about to happen and ask.
- **Treat model output as untrusted input.** Escape it before rendering it as HTML. Never pass it straight into SQL, a shell or `eval`.
- **Keep secrets out of prompts.** Assume the system prompt can be extracted.

> [!STANDARD]
> The **OWASP Top 10 for LLM Applications (2025)** lists these risks with mitigations: prompt injection (LLM01), improper output handling (LLM05), excessive agency (LLM06), system prompt leakage (LLM07) and unbounded consumption (LLM10) map directly onto this chapter and chapter 11.

## 10. Responsible deployment

- **A person decides high-stakes outcomes.** In hiring, lending, medical, legal or anything else that significantly affects someone, the model can assist, rank or draft, and a person decides. Make review easy, and record who approved what.
- **Be honest with users.** Label AI-generated content and features, and tell people when they are talking to a bot. In some jurisdictions this is a legal requirement; the EU AI Act's transparency obligations are one example.
- **Check for uneven performance.** Evaluate across the languages, regions and user groups that matter for your product. An average accuracy can hide a group for whom the feature mostly fails.
- **Give users control.** Let them edit, reject, report and opt out.
- **Roll out gradually**, with a gate between stages.
- **Write it down.** A short page per feature: what it does, which model and prompt version, known limitations, how it was evaluated, and who owns it.

```figure
ai-rollout
```

## 11. Cost control

- Track cost per call, per feature and per tenant from day one. It is much harder to add later.
- Set budgets and alerts both at the provider and in your own code.
- Cache, trim prompts, and use smaller models where evaluations allow.
- Move non-urgent work to batch processing.
- Price your product with real usage numbers, including your heaviest users.

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

The model is often the easy part. Shipping it well comes down to everything around it: measurement, guardrails, and the unglamorous plumbing that keeps a probabilistic component from making the rest of the product unreliable.

## References and further reading

### Security and risk

- OWASP, [Top 10 for LLM Applications 2025](https://genai.owasp.org/llm-top-10/)
- OWASP, [LLM01:2025 Prompt Injection](https://genai.owasp.org/llmrisk/llm01-prompt-injection/)
- NIST, [AI Risk Management Framework (AI RMF 1.0)](https://www.nist.gov/itl/ai-risk-management-framework), NIST AI 100-1, 2023
- NIST, [Generative AI Profile](https://doi.org/10.6028/NIST.AI.600-1), NIST AI 600-1, 2024
- European Union, [Regulation (EU) 2024/1689 (the AI Act)](https://eur-lex.europa.eu/eli/reg/2024/1689/oj). Article 50 covers transparency obligations.

### Evaluation and retrieval

- Lianmin Zheng et al., [Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena](https://arxiv.org/abs/2306.05685) (NeurIPS 2023). Documents position, verbosity and self-preference biases in model judges.
- Patrick Lewis et al., [Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks](https://arxiv.org/abs/2005.11401) (NeurIPS 2020). The paper that named RAG.

### Engineering practice

- OpenTelemetry, [Semantic conventions for generative AI](https://opentelemetry.io/docs/specs/semconv/gen-ai/). A vendor-neutral vocabulary for tracing model calls.
- [JSON Schema](https://json-schema.org/), the format most structured-output features accept.
- [Pydantic documentation](https://docs.pydantic.dev/latest/), used for validation in chapter 3.
- Amazon Builders' Library, [Timeouts, retries, and backoff with jitter](https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/)
- Google, [Site Reliability Engineering: Service Level Objectives](https://sre.google/sre-book/service-level-objectives/)

## Quick reference

A one-page summary of the practices in this guide. In the PDF edition it sits on its own page so it can be printed and kept nearby.

```figure
ai-quick-reference
```
