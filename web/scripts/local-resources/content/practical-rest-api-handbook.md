Most API problems I have had to clean up were not clever bugs. They were small inconsistencies that piled up: one endpoint returns `200` with an error inside, another uses `camelCase` while its neighbour uses `snake_case`, pagination works three different ways. This handbook is the set of defaults I reach for so those decisions get made once.

Treat it as a reference. Skim the tables, copy the patterns, and break the rules only when you can say why.

## 1. Resources and URLs

A REST API is organised around **resources** (things) rather than actions. The URL names the thing, the HTTP method says what you want to do with it.

```
GET    /projects                 list projects
POST   /projects                 create a project
GET    /projects/42              fetch one project
PATCH  /projects/42              update part of it
DELETE /projects/42              remove it
GET    /projects/42/members      list a sub-collection
```

Rules I follow:

- **Plural nouns** for collections: `/users`, `/invoices`.
- **No verbs in paths** for normal CRUD. `/createUser` is a smell.
- **Nest one level, maybe two.** `/projects/42/members` is fine. `/orgs/1/projects/42/members/7/roles` is a sign the client should just call `/members/7`.
- **Lowercase, hyphenated paths**: `/payment-methods`, not `/paymentMethods`.
- **Actions that are not CRUD** are allowed when forcing them into a resource would be silly. I write them as a sub-resource with `POST`: `POST /invoices/42/send`, `POST /builds/9/cancel`.

## 2. HTTP methods

| Method | Use it for | Safe | Idempotent | Typical success |
|---|---|---|---|---|
| `GET` | Read a resource or collection | Yes | Yes | `200` |
| `POST` | Create, or trigger an action | No | No | `201` or `202` |
| `PUT` | Replace a resource completely | No | Yes | `200` or `204` |
| `PATCH` | Change some fields | No | Not guaranteed | `200` |
| `DELETE` | Remove a resource | No | Yes | `204` |
| `HEAD` | Same as `GET`, headers only | Yes | Yes | `200` |
| `OPTIONS` | Discover allowed methods, CORS preflight | Yes | Yes | `204` |

**Safe** means the request should not change server state. **Idempotent** means sending it twice has the same effect as sending it once. Those two properties are what make retries safe, which matters the moment you have flaky mobile networks or a load balancer that retries for you.

A few things worth remembering:

- `GET` must never change data. Crawlers, prefetchers and caches will call it.
- `PUT` replaces the whole thing. If the client omits a field, that field should be reset. If that is not what you want, you want `PATCH`.
- `DELETE` on something already deleted can return `204` or `404`. Pick one and be consistent. I usually return `404` so clients can tell the difference.

## 3. Status codes that actually matter

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
| `401 Unauthorized` | Not authenticated. Missing or invalid credentials |
| `403 Forbidden` | Authenticated, but not allowed to do this |
| `404 Not Found` | Resource does not exist (or you do not want to reveal that it does) |
| `405 Method Not Allowed` | Path exists, method does not. Send an `Allow` header |
| `409 Conflict` | Request conflicts with current state: duplicate email, version mismatch |
| `412 Precondition Failed` | An `If-Match` check failed |
| `415 Unsupported Media Type` | Wrong `Content-Type` |
| `422 Unprocessable Content` | Well formed, but fails business validation |
| `429 Too Many Requests` | Rate limited. Send `Retry-After` |

### Server errors

| Code | When |
|---|---|
| `500 Internal Server Error` | Something broke on your side |
| `502 Bad Gateway` | An upstream service returned garbage |
| `503 Service Unavailable` | Overloaded or in maintenance. `Retry-After` helps |
| `504 Gateway Timeout` | An upstream service did not answer in time |

The two pairs people mix up most:

- **401 vs 403.** 401 means "who are you?" 403 means "I know who you are, and no."
- **400 vs 422.** 400 means I could not even parse what you sent. 422 means I understood it, and it is not valid (end date before start date, quantity below zero). Some teams use 400 for both. That is fine as long as the error body tells the client what went wrong.

And one rule with no exceptions: **never return `200` with an error inside the body.** Clients, proxies and monitoring all trust the status code.

## 4. Request and response structure

### Pick conventions and write them down

- **Field naming:** `snake_case` or `camelCase`, one of them, everywhere. I use `snake_case` when the backend is Python, `camelCase` when the main consumers are JavaScript apps. The choice matters less than consistency.
- **Timestamps:** ISO 8601 in UTC, `"2026-11-17T09:30:00Z"`. Never local time without an offset. Never a formatted string like `"Nov 17"`.
- **IDs:** return them as strings, even if they are integers in the database. It saves you when you move to UUIDs, and JavaScript cannot represent 64-bit integers precisely.
- **Money:** integer minor units plus a currency, `{"amount": 1999, "currency": "USD"}`. Floats and money do not mix.
- **Enums:** lowercase strings, `"status": "pending"`. Document every possible value.
- **Nulls:** decide whether absent fields are omitted or sent as `null`, and do not change your mind per endpoint.

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

I wrap lists in an object. A bare array leaves no room for pagination metadata later, and adding it becomes a breaking change.

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

{ "id": "prj_8f2a", "name": "Website relaunch", "status": "active", ... }
```

Return the full created resource. It saves the client a second request and shows them server-generated fields like `id` and `created_at`.

## 5. Error handling

Good errors are the cheapest developer experience improvement you can make. Every error from your API should have the same shape. There is a standard for this, **Problem Details (RFC 9457)**, served as `application/problem+json`:

```json
{
  "type": "https://api.example.com/errors/validation",
  "title": "Your request has invalid fields.",
  "status": 422,
  "detail": "2 fields failed validation.",
  "instance": "/projects",
  "errors": [
    { "field": "name", "code": "required", "message": "Name is required." },
    { "field": "due_date", "code": "in_past", "message": "Due date cannot be in the past." }
  ],
  "request_id": "req_7Hc2kQ"
}
```

What makes this useful:

- **A stable machine-readable code** (`type`, or per-field `code`). Clients branch on codes, never on message text, because you will reword messages.
- **A human message** that a developer can read in a log.
- **Field-level errors** so a form can highlight the right input.
- **A `request_id`** that also appears in your server logs. When someone reports a bug, this turns a guessing game into a log search.

What to leave out: stack traces, SQL, internal hostnames. Log those, do not return them.

## 6. Authentication

| Approach | Good for | Watch out for |
|---|---|---|
| Session cookie | Your own web app on the same site | CSRF protection, `SameSite`, `HttpOnly`, `Secure` flags |
| API key | Server to server, developer integrations | Keys leak into git. Support rotation and scoping |
| OAuth 2.0 access token (Bearer) | Third-party access, mobile apps, SSO | Use a proven library or provider. Do not hand-roll flows |
| JWT as bearer token | Stateless verification across services | Hard to revoke. Keep them short-lived and use refresh tokens |

Send tokens in the header, never in the URL (URLs end up in logs and browser history):

```http
Authorization: Bearer eyJhbGciOi...
```

Practical rules:

- **HTTPS everywhere.** No exceptions for "internal" APIs.
- **Return `401` with a `WWW-Authenticate` header** when credentials are missing or invalid.
- **Authorisation is per object, not just per endpoint.** Checking "is this user logged in" is not enough. Check "can this user see project 42." Broken object-level authorisation tops the OWASP API Security list year after year for a reason.
- **Short-lived access tokens, longer refresh tokens,** and a way to revoke refresh tokens when a device is lost.
- **Scope API keys** (read only, single project) and show them only once at creation.

## 7. Pagination, filtering and sorting

### Offset pagination

```
GET /projects?limit=20&offset=40
```

Easy to build and easy to jump to "page 5". The problems show up at scale: large offsets get slow because the database still walks past every skipped row, and items shift between pages when data changes underneath you.

### Cursor pagination

```
GET /projects?limit=20
GET /projects?limit=20&cursor=eyJpZCI6InByal85MWJlIn0
```

The cursor encodes where the last page ended (usually the sort key plus the id as a tie-breaker). The query becomes `WHERE (created_at, id) < (:last_created_at, :last_id) ORDER BY created_at DESC, id DESC LIMIT 21`. Fetch one extra row to know whether `has_more` is true.

My default: **cursor pagination for anything that can grow** (feeds, logs, transactions), offset for small admin tables where people want page numbers. Always set a maximum `limit` on the server.

### Filtering and sorting

```
GET /projects?status=active&owner_id=usr_31c9
GET /projects?created_after=2026-01-01T00:00:00Z
GET /projects?sort=-created_at,name
```

The `-` prefix for descending is a common, readable convention. Only allow filtering and sorting on fields you have indexed, or you are offering a slow query to anyone who asks.

## 8. Idempotency for POST

Mobile clients time out, retry, and accidentally create two orders. The fix is an **idempotency key**: the client generates a unique value per logical operation and sends it with the request.

```http
POST /payments
Idempotency-Key: 4f7d3c1e-8a7b-4c39-9d1e-2b6f0a1c5e44
```

The server stores the key with the result. If the same key arrives again, it returns the stored response instead of doing the work twice. Keep keys for a sensible window (24 hours is common) and scope them per user. Anything that moves money or sends messages deserves this.

## 9. Versioning

Two mainstream options:

| Style | Example | Notes |
|---|---|---|
| URL path | `/v1/projects` | Obvious, easy to route, easy to test in a browser |
| Header | `Accept: application/vnd.example.v2+json` or a custom `API-Version` header | Cleaner URLs, harder to debug by eye |

I default to the URL path for public APIs because it is boring and everyone understands it.

More important than the mechanism is knowing **what counts as breaking**:

**Not breaking** (ship freely):

- Adding a new endpoint
- Adding an optional request field
- Adding a field to a response
- Adding a new enum value, *if* you told clients to handle unknown values

**Breaking** (needs a new version or a migration plan):

- Removing or renaming a field
- Changing a field's type or format
- Making an optional field required
- Changing the meaning of a status code or default behaviour

When you do deprecate, announce it, send a `Deprecation` and `Sunset` header on the old version, and watch your logs until traffic drops to zero before you turn it off.

## 10. Caching and concurrency

**Conditional requests** let clients skip downloading data they already have:

```http
GET /projects/prj_8f2a
If-None-Match: "a1b2c3"
```

If the `ETag` still matches, return `304 Not Modified` with no body.

The same `ETag` protects against lost updates. Two people edit the same record; the second save should not silently overwrite the first:

```http
PATCH /projects/prj_8f2a
If-Match: "a1b2c3"
```

If the resource changed since that version, return `412 Precondition Failed` and let the client refetch and merge.

Use `Cache-Control` deliberately. `private, no-store` for user-specific or sensitive data. `public, max-age=300` for things that genuinely can be shared.

## 11. Rate limiting

Every public API needs limits, and clients need to see them. Return `429` with a `Retry-After` header when they are exceeded, and expose the current state on normal responses too. Many APIs use headers along these lines:

```http
RateLimit-Limit: 100
RateLimit-Remaining: 37
RateLimit-Reset: 42
```

Limit per API key or user, not just per IP, otherwise a whole office behind one NAT shares a bucket.

## 12. Long-running work

If a request takes more than a few seconds (report generation, video processing, bulk imports), do not hold the connection open.

```http
POST /exports
HTTP/1.1 202 Accepted
Location: /exports/exp_55d1

GET /exports/exp_55d1
{ "id": "exp_55d1", "status": "processing", "progress": 0.4 }

GET /exports/exp_55d1
{ "id": "exp_55d1", "status": "completed", "download_url": "..." }
```

Offer a webhook as well if clients would otherwise poll aggressively.

## 13. Documentation

Write an **OpenAPI** spec, either by hand or generated from code, and treat it as part of the API. A spec gives you interactive docs, client generation and contract tests almost for free. Every endpoint should document its parameters, every possible status code, and an example request and response that actually works.

## Design checklist

Before I call an endpoint done, I run through this:

- [ ] URL is a noun, plural, lowercase, at most two levels of nesting
- [ ] Method matches the semantics (safe and idempotent where it should be)
- [ ] Success and error status codes are correct and documented
- [ ] Errors follow the shared error shape with a stable code and a `request_id`
- [ ] Authentication is required, and authorisation is checked per object
- [ ] Lists are paginated with a server-side maximum
- [ ] Filters and sorts only touch indexed fields
- [ ] Timestamps are ISO 8601 UTC, IDs are strings, money is in minor units
- [ ] `POST` endpoints with side effects accept an idempotency key
- [ ] Rate limits apply and are visible in headers
- [ ] The change is not breaking, or it ships under a new version
- [ ] OpenAPI spec and examples are updated

None of this is glamorous. That is the point. A predictable API lets the people building on it spend their time on their product instead of on your quirks.
