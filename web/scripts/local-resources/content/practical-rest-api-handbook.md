Most API problems are not clever bugs. They are small inconsistencies that pile up: one endpoint returns `200` with an error inside, another uses `camelCase` while its neighbour uses `snake_case`, pagination works three different ways. Each one is minor. Together they make an API slow to learn and easy to misuse.

This handbook collects sensible defaults so those decisions are made once. Each chapter explains what HTTP itself already defines, what the common conventions are, and where you still have to choose. Use it as a reference: skim the figures, copy the patterns, and break the rules only when you can say why.

> [!NOTE]
> Examples use a fictional project-management API at `api.example.com`. Code is illustrative and trimmed for clarity; adapt names, limits and formats to your own system.

## 1. What REST means in practice

REST is an architectural style described by Roy Fielding in his 2000 doctoral dissertation. It defines a set of constraints: client and server are separate, every request is **stateless** (it carries everything the server needs), responses say whether they are **cacheable**, components can be **layered** (proxies, gateways, caches) without clients noticing, and everything is accessed through a **uniform interface** of resources and representations. Code on demand is an optional sixth constraint.

When people say "REST API" today, they usually mean something more modest: an HTTP API organised around resources, using HTTP methods, status codes and headers the way the HTTP specification defines them. That is the meaning this handbook uses. It matters because every client library, proxy, cache, load balancer and monitoring tool between you and your users already understands HTTP semantics. Following them gets you that whole ecosystem for free. Fighting them means each of those tools quietly does the wrong thing.

> [!STANDARD]
> HTTP semantics (methods, status codes, headers, conditional requests) are defined in **RFC 9110**, and caching in **RFC 9111**. When this handbook says "the specification", it means these two documents.

## 2. The request and response lifecycle

Before designing endpoints, it helps to picture everything a single request passes through.

```figure
http-lifecycle
```

Three things in that picture shape the rest of the handbook:

- **Statelessness.** Each request carries its own credentials and context. Any server instance can handle it, which is what makes horizontal scaling and retries possible.
- **Order of checks.** Authenticate, authorize, validate, then act. Running checks in that order means you never do expensive or irreversible work for a request that was always going to fail, and you never leak information to callers who should not see it.
- **Correlation.** A request ID assigned at the edge and passed through every layer (and returned to the client) turns "it failed for me" into a single log search.

## 3. Resources and URLs

A REST API is organised around **resources** (things) rather than actions. The URL names the thing, the HTTP method says what you want to do with it.

```http
GET    /projects                 list projects
POST   /projects                 create a project
GET    /projects/42              fetch one project
PATCH  /projects/42              update part of it
DELETE /projects/42              remove it
GET    /projects/42/members      list a sub-collection
```

Conventions that keep URLs predictable:

- **Plural nouns** for collections: `/users`, `/invoices`.
- **No verbs in paths** for normal CRUD. `/createUser` is a smell; `POST /users` says the same thing.
- **Nest one level, maybe two.** `/projects/42/members` is fine. `/orgs/1/projects/42/members/7/roles` is a sign the client should just call `/members/7`.
- **Lowercase, hyphenated paths**: `/payment-methods`, not `/paymentMethods`.
- **Actions that are not CRUD** are allowed when forcing them into a resource would be silly. Model them as a sub-resource with `POST`: `POST /invoices/42/send`, `POST /builds/9/cancel`.
- **Query strings are for reading**, not for changing state: filters, sorting, pagination, field selection.

## 4. HTTP methods

```figure
http-methods
```

**Safe** means the client is not asking for a change of state. **Idempotent** means sending the same request twice has the same intended effect as sending it once. Those two properties are what make retries safe, which matters the moment you have flaky mobile networks, timeouts, or a proxy that retries on your behalf.

Points worth remembering:

- `GET` must never change data. Crawlers, link previewers, prefetchers and caches will call it.
- `PUT` replaces the whole representation. If the client omits a field, that field should be reset. If that is not what you want, you want `PATCH`.
- `PUT` can also create a resource when the client chooses its identifier (`PUT /settings/theme`). Return `201 Created` in that case.
- `DELETE` on something already deleted can return `204` or `404`. Pick one and document it. `404` lets clients tell the difference.

### Two standard formats for PATCH

`PATCH` (RFC 5789) only says "apply these changes"; the format of the changes is up to you. Two standards exist, and using one saves you inventing a third:

| Format | Media type | How it works | Good for |
|---|---|---|---|
| JSON Merge Patch (RFC 7396) | `application/merge-patch+json` | Send a partial object. Fields present are set, `null` removes a field | Most CRUD updates. Simple for clients |
| JSON Patch (RFC 6902) | `application/json-patch+json` | Send a list of operations: `add`, `remove`, `replace`, `move`, `copy`, `test` | Precise edits to arrays, conditional updates |

```http
PATCH /projects/prj_8f2a
Content-Type: application/merge-patch+json

{ "name": "Website relaunch (phase 2)", "due_date": null }
```

> [!WARNING]
> Merge Patch cannot set a field to `null` (null means "remove"), and it replaces arrays wholesale. If your data model needs either, use JSON Patch for that endpoint.

## 5. Status codes

```figure
status-codes
```

You do not need all of them. You need these, used consistently.

### Success

| Code | When |
|---|---|
| `200 OK` | Normal success with a body |
| `201 Created` | A resource was created. Include a `Location` header pointing to it |
| `202 Accepted` | Work was queued and will finish later. Return a way to check status |
| `204 No Content` | Success, nothing to return (common for `DELETE`) |
| `304 Not Modified` | Conditional `GET` and the client's cached copy is still valid |

### Client errors

| Code | When |
|---|---|
| `400 Bad Request` | Malformed request: broken JSON, wrong types, missing required parameter |
| `401 Unauthorized` | Not authenticated. Missing or invalid credentials. Must include `WWW-Authenticate` |
| `403 Forbidden` | Authenticated, but not allowed to do this |
| `404 Not Found` | Resource does not exist (or you do not want to reveal that it does) |
| `405 Method Not Allowed` | Path exists, method does not. Must include an `Allow` header |
| `409 Conflict` | Request conflicts with current state: duplicate email, version mismatch |
| `410 Gone` | The resource existed and has been removed deliberately |
| `412 Precondition Failed` | An `If-Match` or `If-Unmodified-Since` check failed |
| `415 Unsupported Media Type` | Wrong `Content-Type` |
| `422 Unprocessable Content` | Well formed, but fails validation |
| `428 Precondition Required` | You require a conditional request (for example `If-Match`) and it was missing |
| `429 Too Many Requests` | Rate limited. Send `Retry-After` |

### Server errors

| Code | When |
|---|---|
| `500 Internal Server Error` | Something broke on your side |
| `502 Bad Gateway` | An upstream service returned an invalid response |
| `503 Service Unavailable` | Overloaded or in maintenance. `Retry-After` helps |
| `504 Gateway Timeout` | An upstream service did not answer in time |

The two pairs people mix up most:

- **401 vs 403.** 401 means "who are you?" 403 means "I know who you are, and no." Despite its name, 401 is about authentication.
- **400 vs 422.** 400 means the server could not make sense of what you sent. 422 means it understood the request and the content is not valid (end date before start date, quantity below zero). Some teams use 400 for both. That is acceptable as long as the error body tells the client exactly what went wrong.

> [!WARNING]
> Never return `200` with an error inside the body. Clients, proxies, caches, retry logic and monitoring all trust the status code. A failed request reported as success is cached, not retried, and invisible on dashboards.

## 6. Request and response structure

### Pick conventions and write them down

- **Field naming:** `snake_case` or `camelCase`, one of them, everywhere. A practical rule is to match the language most of your consumers write in. Consistency matters more than the choice.
- **Timestamps:** RFC 3339 (a profile of ISO 8601) in UTC, `"2026-11-17T09:30:00Z"`. Never local time without an offset. Never a display string like `"Nov 17"`.
- **IDs:** return them as strings, even if they are integers in the database. It keeps the door open for UUIDs or prefixed IDs, and JavaScript numbers lose precision above 2^53, so 64-bit integer IDs can silently change in browser clients.
- **Money:** integer minor units plus a currency, `{"amount": 1999, "currency": "USD"}`, or a decimal string. Never binary floating point.
- **Enums:** lowercase strings, `"status": "pending"`. Document every value, and tell clients to tolerate values they do not recognise.
- **Nulls:** decide whether absent fields are omitted or sent as `null`, and apply the decision everywhere.

### Single resource

```json
{
  "id": "prj_8f2a",
  "name": "Website relaunch",
  "status": "active",
  "owner_id": "usr_31c9",
  "created_at": "2026-10-02T14:11:08Z",
  "updated_at": "2026-11-15T08:42:51Z"
}
```

### Collection

Wrap lists in an object. A bare array leaves no room for pagination metadata, and adding it later is a breaking change.

```json
{
  "data": [
    { "id": "prj_8f2a", "name": "Website relaunch" },
    { "id": "prj_91be", "name": "Mobile app" }
  ],
  "next_cursor": "eyJpZCI6InByal85MWJlIn0",
  "has_more": true
}
```

### Creating

```http
POST /projects
Content-Type: application/json

{ "name": "Website relaunch" }
```

```http
HTTP/1.1 201 Created
Location: /projects/prj_8f2a
Content-Type: application/json

{ "id": "prj_8f2a", "name": "Website relaunch", "status": "active", "created_at": "2026-11-17T09:30:00Z" }
```

Return the full created resource. It saves the client a second request and shows server-generated fields like `id` and `created_at`.

## 7. Error handling

Good errors are the cheapest developer-experience improvement available. Every error from your API should have the same shape, and there is a standard for it: **Problem Details for HTTP APIs (RFC 9457)**, served as `application/problem+json`.

```figure
error-anatomy
```

What makes this shape useful:

- **A stable, machine-readable `type`.** Clients branch on it, never on message text, because messages get reworded and translated.
- **A human `title` and `detail`** that a developer can read in a log or an error toast.
- **Field-level errors** so a form can highlight the right input.
- **A way to correlate** the response with your logs. Here the `instance` URI embeds the request ID; a separate `request_id` extension member works too.

What to leave out: stack traces, SQL, internal hostnames, and anything that confirms the existence of data the caller cannot see. Log those, do not return them.

> [!TIP]
> Make `type` a URL that resolves to a short documentation page for that problem. Developers who hit the error can open it and read how to fix it.

## 8. Authentication and authorization

**Authentication** answers "who is calling?" **Authorization** answers "may they do this, to this object?" APIs need both on every request.

| Approach | Good for | Watch out for |
|---|---|---|
| Session cookie | Your own web app on the same site | CSRF protection, plus `SameSite`, `HttpOnly` and `Secure` cookie attributes |
| API key | Server to server, developer integrations | Keys leak into repositories and logs. Support scoping, rotation and revocation |
| OAuth 2.0 access token (Bearer) | Third-party access, mobile and single-page apps, single sign-on | Use a proven library or identity provider. Do not hand-roll the flows |
| JWT as an access token | Verifying tokens without a database lookup | Hard to revoke before expiry. Keep them short-lived |

```figure
auth-flow
```

Send tokens in the `Authorization` header, never in the URL. URLs end up in server logs, browser history and `Referer` headers, and RFC 6750 advises against the query-parameter method for exactly that reason.

```http
GET /v1/projects
Authorization: Bearer eyJhbGciOi...
```

Practical rules:

- **HTTPS everywhere.** No exceptions for "internal" APIs.
- **Return `401` with a `WWW-Authenticate` header** when credentials are missing or invalid. RFC 9110 requires the header.
- **Authorize per object, not just per endpoint.** Checking "is this user logged in" is not enough. Check "may this user see project 42". Broken Object Level Authorization is ranked first in the OWASP API Security Top 10, in both the 2019 and 2023 editions.
- **Short-lived access tokens, longer-lived refresh tokens,** and a way to revoke refresh tokens when a device is lost.
- **Validate JWTs properly:** check the signature with an algorithm you expect (never accept `none`), and check `exp`, `iss` and `aud`. RFC 8725 lists the pitfalls.
- **Scope API keys** (read only, single project) and show the secret only once, at creation.

## 9. Pagination, filtering and sorting

```figure
pagination
```

### Offset pagination

```http
GET /projects?limit=20&offset=40
```

Easy to build and supports "jump to page 5". The costs appear at scale: large offsets get slow because the database still reads past every skipped row, and items shift between pages when data changes underneath the reader.

### Cursor pagination

```http
GET /projects?limit=20
GET /projects?limit=20&cursor=eyJpZCI6InByal85MWJlIn0
```

The cursor encodes where the last page ended, usually the sort key plus a unique tie-breaker such as the ID. The query seeks directly to that point:

```sql
SELECT id, name, created_at
FROM projects
WHERE (created_at, id) < (:last_created_at, :last_id)
ORDER BY created_at DESC, id DESC
LIMIT 21;  -- one extra row tells you whether has_more is true
```

Treat cursors as opaque: encode them (base64 is common), and do not let clients build them by hand, so you can change the format later.

A sensible default is **cursor pagination for anything that can grow** (feeds, logs, transactions, sync endpoints) and offset pagination for small admin tables where people want page numbers. Whichever you choose, **set a maximum `limit` on the server.**

### Filtering and sorting

```http
GET /projects?status=active&owner_id=usr_31c9
GET /projects?created_after=2026-01-01T00:00:00Z
GET /projects?sort=-created_at,name
```

A `-` prefix for descending order is a common, readable convention. Only allow filtering and sorting on fields that are indexed, or you are offering a slow query to anyone who asks.

## 10. Idempotency for POST

`POST` is not idempotent, so a client that times out and retries can create two orders or two payments. The fix is an **idempotency key**: the client generates a unique value per logical operation and sends it with the request.

```http
POST /payments
Idempotency-Key: 4f7d3c1e-8a7b-4c39-9d1e-2b6f0a1c5e44
Content-Type: application/json

{ "amount": 1999, "currency": "USD", "source": "card_123" }
```

The server stores the key together with the result. If the same key arrives again, it returns the stored response instead of repeating the work. Details that matter:

- **Scope keys** to the authenticated client, so two customers cannot collide.
- **Store the request fingerprint** with the key, and reject a reused key that arrives with a different body (`422` or `409`).
- **Handle concurrent duplicates**: if the first request is still running, the second should wait or receive `409`, not run in parallel.
- **Expire keys** after a sensible window. Stripe, for example, documents that keys may be removed once they are at least 24 hours old.

> [!STANDARD]
> The `Idempotency-Key` header is being standardised by the IETF HTTPAPI working group (draft-ietf-httpapi-idempotency-key-header). Several large payment APIs already use the same pattern.

Anything that moves money, sends messages or creates records a user would notice twice deserves an idempotency key.

## 11. Versioning and deprecation

```figure
versioning
```

The three mainstream styles are shown in the figure. URL path versioning is the most common choice for public APIs because it is visible and easy to route, test and cache. Header-based and date-based versions suit APIs that change in many small steps.

More important than the mechanism is knowing **what counts as breaking**. Additive changes (new endpoints, new optional fields, new response fields) can ship in place, provided clients were told to ignore fields they do not recognise. Removing, renaming, retyping or changing the meaning of anything needs a new version or a migration plan.

When you retire something:

1. Announce it, with a date and a migration guide.
2. Mark responses from the old version with `Deprecation` (RFC 9745) and `Sunset` (RFC 8594) headers, and a `Link` to the guide.
3. Watch traffic per client and contact the stragglers directly.
4. Turn it off only when traffic is close to zero.

## 12. Caching and concurrency

**Conditional requests** let clients skip downloading data they already have:

```http
GET /projects/prj_8f2a
If-None-Match: "a1b2c3"
```

If the `ETag` still matches, the server answers `304 Not Modified` with no body.

The same `ETag` protects against **lost updates**. Two people edit the same record; the second save should not silently overwrite the first:

```http
PATCH /projects/prj_8f2a
If-Match: "a1b2c3"
Content-Type: application/merge-patch+json

{ "status": "archived" }
```

If the resource changed since that version, return `412 Precondition Failed` and let the client refetch and merge. To require clients to send `If-Match` on risky endpoints, reject unconditional writes with `428 Precondition Required`.

Use `Cache-Control` deliberately:

| Data | Header |
|---|---|
| User-specific or sensitive | `Cache-Control: no-store` |
| Per-user, safe to keep in the browser briefly | `Cache-Control: private, max-age=60` |
| Public and shared | `Cache-Control: public, max-age=300` |
| Fine to reuse, but check first | `Cache-Control: no-cache` plus an `ETag` |

## 13. Rate limiting

Every public API needs limits, and clients need to see them. When a limit is exceeded, return `429 Too Many Requests` (RFC 6585) with a `Retry-After` header saying when to try again.

It also helps to expose the current state on normal responses. There is no final standard yet, so conventions vary:

```http
# Widely used de facto convention (GitHub's REST API uses this family of headers)
X-RateLimit-Limit: 5000
X-RateLimit-Remaining: 4987
X-RateLimit-Reset: 1767225600

# The IETF draft (draft-ietf-httpapi-ratelimit-headers) is converging on two fields
RateLimit-Policy: "default";q=100;w=60
RateLimit: "default";r=37;t=42
```

Whatever you choose, document it. Limit per API key or user, not only per IP address, otherwise everyone behind one office network or mobile carrier gateway shares a bucket.

## 14. Long-running work

If a request takes more than a few seconds (report generation, media processing, bulk imports), do not hold the connection open. Accept the work, hand back a status resource, and let the client check on it.

```http
POST /exports
HTTP/1.1 202 Accepted
Location: /exports/exp_55d1

GET /exports/exp_55d1
{ "id": "exp_55d1", "status": "processing", "progress": 0.4 }

GET /exports/exp_55d1
{ "id": "exp_55d1", "status": "completed", "download_url": "https://files.example.com/exp_55d1.csv" }
```

Offer webhooks as well if clients would otherwise poll aggressively, and sign webhook payloads so receivers can verify they came from you.

## 15. Documentation with OpenAPI

Describe the API in an **OpenAPI** document, written by hand or generated from code, and treat it as part of the product. A spec gives you interactive reference docs, client SDK generation, mock servers and contract tests from one source. OpenAPI 3.1 is fully aligned with JSON Schema 2020-12, so the same schemas can validate requests in your server.

Every operation should document its parameters, request body, every status code it can return, the error shape, and at least one example request and response that actually works. Run a linter over the spec in CI so naming and pagination conventions stay consistent as the API grows.

## Design checklist

Run through this before an endpoint ships:

- [ ] URL is a noun, plural, lowercase, at most two levels of nesting
- [ ] Method matches the semantics (safe and idempotent where it should be)
- [ ] Success and error status codes are correct and documented
- [ ] Errors use the shared Problem Details shape with a stable `type`
- [ ] Authentication is required, and authorization is checked per object
- [ ] Lists are paginated with a server-side maximum
- [ ] Filters and sorts only touch indexed fields
- [ ] Timestamps are RFC 3339 UTC, IDs are strings, money is in minor units
- [ ] `POST` endpoints with side effects accept an idempotency key
- [ ] Rate limits apply and are visible to clients
- [ ] Writes that can conflict support `If-Match`
- [ ] The change is additive, or it ships under a new version with a deprecation plan
- [ ] The OpenAPI document and examples are updated

None of this is glamorous. That is the point. A predictable API lets the people building on it spend their time on their product instead of on your quirks.

## References and further reading

### Standards

- [RFC 9110: HTTP Semantics](https://www.rfc-editor.org/rfc/rfc9110). Methods, status codes, headers, conditional requests.
- [RFC 9111: HTTP Caching](https://www.rfc-editor.org/rfc/rfc9111). `Cache-Control`, freshness and validation.
- [RFC 5789: PATCH Method for HTTP](https://www.rfc-editor.org/rfc/rfc5789)
- [RFC 7396: JSON Merge Patch](https://www.rfc-editor.org/rfc/rfc7396) and [RFC 6902: JSON Patch](https://www.rfc-editor.org/rfc/rfc6902)
- [RFC 9457: Problem Details for HTTP APIs](https://www.rfc-editor.org/rfc/rfc9457)
- [RFC 6585: Additional HTTP Status Codes](https://www.rfc-editor.org/rfc/rfc6585). `428` and `429`.
- [RFC 3339: Date and Time on the Internet](https://www.rfc-editor.org/rfc/rfc3339) and [RFC 8259: JSON](https://www.rfc-editor.org/rfc/rfc8259)
- [RFC 6749: OAuth 2.0](https://www.rfc-editor.org/rfc/rfc6749), [RFC 6750: Bearer Token Usage](https://www.rfc-editor.org/rfc/rfc6750) and [RFC 7636: PKCE](https://www.rfc-editor.org/rfc/rfc7636)
- [RFC 9700: Best Current Practice for OAuth 2.0 Security](https://www.rfc-editor.org/rfc/rfc9700)
- [RFC 7519: JSON Web Token](https://www.rfc-editor.org/rfc/rfc7519) and [RFC 8725: JWT Best Current Practices](https://www.rfc-editor.org/rfc/rfc8725)
- [RFC 9745: The Deprecation HTTP Response Header Field](https://www.rfc-editor.org/rfc/rfc9745) and [RFC 8594: The Sunset HTTP Header Field](https://www.rfc-editor.org/rfc/rfc8594)
- [IETF draft: The Idempotency-Key HTTP Header Field](https://datatracker.ietf.org/doc/draft-ietf-httpapi-idempotency-key-header/)
- [IETF draft: RateLimit header fields for HTTP](https://datatracker.ietf.org/doc/draft-ietf-httpapi-ratelimit-headers/)
- [OpenAPI Specification](https://spec.openapis.org/oas/latest.html)

### Background and guidance

- [Roy Fielding: Architectural Styles and the Design of Network-based Software Architectures, chapter 5](https://ics.uci.edu/~fielding/pubs/dissertation/rest_arch_style.htm). The original description of REST.
- [OWASP API Security Top 10 (2023)](https://owasp.org/API-Security/editions/2023/en/0x11-t10/)
- [MDN Web Docs: HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP). Clear reference pages for every method, status code and header.
- [Stripe API: Idempotent requests](https://docs.stripe.com/api/idempotent_requests). A well-documented production implementation.
- [GitHub REST API: Rate limits](https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api). A widely used example of rate-limit headers.

## Quick reference

A one-page summary of the defaults in this handbook. In the PDF edition it sits on its own page so it can be printed and kept nearby.

```figure
rest-quick-reference
```
