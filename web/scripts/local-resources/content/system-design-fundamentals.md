System design gets taught as a list of components: load balancer, cache, queue, shard. Real design work is mostly about something else, which is deciding which problems you actually have and which ones you are inventing. This guide covers the building blocks, but I have tried to keep the focus on the trade-offs, because that is the part that transfers between jobs, codebases and interviews.

## 1. How I approach any design

I use the same sequence whether it is a whiteboard interview or a real feature at work.

1. **Clarify what it must do.** Core use cases only. "Users can shorten a URL and be redirected" beats a list of twenty features.
2. **Clarify the qualities.** How many users? Reads versus writes? How fast must it respond? Can it ever lose data? Can users see slightly stale data?
3. **Estimate the numbers.** Requests per second, storage per year, bandwidth. Rough is fine. The numbers tell you which problems are real.
4. **Draw the simplest thing that works.** Usually a client, one service, one database.
5. **Find what breaks first** under your numbers, and fix only that.
6. **Name the trade-offs** you made and what you would revisit as the system grows.

Step 4 is where most people go wrong, in both directions. Interview candidates jump straight to Kafka and twelve microservices. Working engineers sometimes never move past one overloaded database. Let the numbers decide.

## 2. Numbers worth knowing

You do not need exact figures, just the orders of magnitude.

| Operation | Rough latency |
|---|---|
| Read from memory | ~100 nanoseconds |
| Random read from SSD | ~100 microseconds |
| Round trip within one data centre | ~0.5 milliseconds |
| Simple indexed database query on a warm cache | ~1 millisecond |
| Round trip between continents | ~100 to 200 milliseconds |

And some conversions I use constantly:

- One day is about **86,400 seconds**, so call it 100,000 for quick maths.
- **1 million requests a day is roughly 12 per second** on average. Peaks are often 3 to 10 times the average.
- A single well-tuned relational database on decent hardware handles **thousands of simple queries per second**. Many products never outgrow that.

Example: 10 million new records a day at 1 KB each is 10 GB a day, about 3.6 TB a year. That changes your storage plan. 10,000 records a day does not.

## 3. Scalability

**Vertical scaling** means a bigger machine. It is simple, needs no code changes, and takes you further than people expect. It also has a ceiling and leaves you with a single point of failure.

**Horizontal scaling** means more machines. It has no hard ceiling and gives you redundancy, but it only works if your service is **stateless**: any instance can handle any request.

To make a service stateless, move state out of process memory:

- Sessions go to a shared store (Redis or the database) or into signed tokens.
- Uploaded files go to object storage (S3, Azure Blob), not the local disk.
- Scheduled jobs run in one place, or use a lock so only one instance runs each job.

Once the app tier is stateless, scaling it is mostly a configuration change. The hard part of scaling is almost always **the data**.

## 4. Load balancing

A load balancer spreads traffic across instances and stops sending traffic to unhealthy ones.

| Type | Works at | Can route by | Example uses |
|---|---|---|---|
| Layer 4 | TCP/UDP | IP and port | Very high throughput, non-HTTP protocols |
| Layer 7 | HTTP | Path, host, headers, cookies | Most web apps, `/api` to one service and `/` to another |

Common algorithms:

- **Round robin.** Simple. Fine when requests cost about the same.
- **Least connections.** Better when some requests are slow.
- **Consistent hashing.** Same key goes to the same server, useful for caches.

Health checks matter more than the algorithm. A good health check confirms the instance can actually serve a request, not just that the process is running. A bad one either takes healthy instances out or keeps broken ones in.

Avoid **sticky sessions** unless you have no choice. They hide state problems and make deploys and scaling uneven.

## 5. Databases

### Relational or not?

Start with a relational database (PostgreSQL, MySQL) unless you have a specific reason not to. You get transactions, constraints, joins and decades of tooling. Reach for something else when the access pattern clearly calls for it:

| Need | Good fit |
|---|---|
| Flexible documents read as a whole | Document store (MongoDB, Firestore) |
| Huge write volume, simple key lookups | Wide-column or key-value (Cassandra, DynamoDB) |
| Full-text search, relevance ranking | Search engine (Elasticsearch, OpenSearch, or Postgres full-text for smaller needs) |
| Time-stamped metrics | Time-series database |
| Relationships are the query | Graph database |

Using two stores is normal: Postgres as the source of truth plus a search index fed from it.

### Indexes

An index is the first fix for a slow query and the most common thing missing. Index the columns you filter, join and sort on. Every index makes writes slightly slower and uses storage, so index for real queries, not hypothetical ones. Learn to read `EXPLAIN` output for your database. It is one of the highest-value skills on this page.

### Read replicas

Copies of the primary that serve reads. Great when reads dominate, which is most products. The catch is **replication lag**: a user saves their profile, the next page reads from a replica that has not caught up, and their change seems to vanish. Common fix: read your own writes from the primary for a short window after a write.

### Partitioning and sharding

**Partitioning** splits a big table into pieces (by date, for example) inside one database. **Sharding** spreads data across multiple databases by a shard key, such as `tenant_id` or `user_id`.

Sharding is powerful and expensive. Cross-shard queries and transactions get hard, rebalancing is painful, and a bad shard key creates hot spots. Exhaust indexing, caching, replicas and vertical scaling first. If you do shard, choose a key that matches how data is accessed and spreads load evenly.

### Transactions and consistency

Use transactions whenever several writes must succeed or fail together. Know your isolation level. Most databases default to something weaker than "fully serialisable," which is usually fine, but it explains certain race conditions. For counters and inventory, use atomic updates (`UPDATE stock SET qty = qty - 1 WHERE id = ? AND qty > 0`) instead of read-then-write in application code.

## 6. Caching

Caching trades freshness for speed. The question is always: **how stale can this be?**

### Where caches live

- **Browser and CDN:** static assets, public pages, images.
- **Application cache** (Redis, Memcached): computed results, sessions, hot database rows.
- **Database cache:** buffer pools and query caches you get for free.

### Patterns

| Pattern | How it works | Trade-off |
|---|---|---|
| **Cache-aside** | App checks cache, on a miss reads the DB and fills the cache | Most common and flexible. First request after a miss is slow |
| **Read-through** | Cache library loads from the DB on a miss | Simpler app code, less control |
| **Write-through** | Writes go to cache and DB together | Cache always fresh, slower writes |
| **Write-behind** | Writes go to cache, DB is updated later | Fast writes, risk of loss |

### The hard parts

- **Invalidation.** When data changes, delete or update the cached copy. A short TTL is the safety net for when you forget a path.
- **Stampedes.** A popular key expires and a thousand requests hit the database at once. Fixes: let one request rebuild while others wait or serve stale data, and add random jitter to TTLs so keys do not all expire together.
- **Caching user-specific data under a shared key.** This is how one user sees another user's dashboard. Always include the user or tenant in the key.

Cache what is read often, changes rarely and is expensive to compute. Measure hit rate. A cache with a 20% hit rate is mostly adding latency and complexity.

## 7. Queues and asynchronous work

A queue lets one part of the system hand work to another without waiting.

Use one when:

- The work is slow (emails, video processing, report generation) and the user does not need to wait.
- Traffic is bursty and you want to absorb spikes instead of falling over.
- Several consumers need to react to the same event.

Concepts to know:

- **Point-to-point queue** (one consumer handles each message) versus **publish/subscribe** (every subscriber gets a copy).
- **At-least-once delivery** is what most systems actually give you. A message can arrive twice, so **consumers must be idempotent**. Store processed message IDs or design operations so repeating them is harmless.
- **Dead-letter queue.** Messages that keep failing go somewhere you can inspect them instead of blocking everything or vanishing.
- **Backpressure.** If producers are faster than consumers, the queue grows. Monitor queue depth and age of the oldest message. Those two numbers tell you more than CPU graphs do.
- **Ordering** is usually only guaranteed within a partition or key, not globally.

### The dual-write problem

A classic bug: you save an order to the database, then publish an `OrderCreated` event. If the publish fails, the database says the order exists and nobody downstream knows. The **outbox pattern** fixes this: write the event to an `outbox` table in the same transaction as the order, then a separate process reads the outbox and publishes. Either both happen or neither does.

## 8. Reliability

Everything fails eventually. Reliability is about making failures small, visible and recoverable.

**Timeouts on every network call.** A call with no timeout is a request that can hang forever and take your threads with it. Set them deliberately, shorter than the caller's own timeout.

**Retries, carefully.** Only retry idempotent operations, or use idempotency keys. Use exponential backoff with jitter so retries do not arrive in synchronised waves:

```python
import random, time

def call_with_retry(fn, attempts=5, base=0.2, cap=5.0):
    for attempt in range(attempts):
        try:
            return fn()
        except TransientError:
            if attempt == attempts - 1:
                raise
            delay = min(cap, base * 2 ** attempt)
            time.sleep(random.uniform(0, delay))  # "full jitter"
```

Retries multiply load across layers. If three layers each retry three times, one failure becomes 27 calls. Retry at one layer.

**Circuit breakers.** After repeated failures, stop calling a dependency for a while and fail fast or use a fallback. This keeps a sick dependency from taking healthy services down with it.

**Graceful degradation.** Decide in advance what the product does when a non-critical piece is down. Recommendations fail, show popular items. Search is slow, show recent items. The checkout should not depend on the recommendation engine.

**Redundancy.** Run at least two of everything that matters, across availability zones. Back up databases, and test restoring them. An untested backup is a hope, not a backup.

**SLOs.** Agree on a target such as "99.9% of requests succeed in under 300 ms over 30 days." That gives you an error budget: room to ship changes when you are well within target, a signal to slow down when you are not.

**Observability.** Logs, metrics and traces, tied together with a request ID. Alert on symptoms users feel (error rate, latency) rather than every CPU spike.

## 9. Consistency trade-offs

The **CAP theorem** says that during a network partition, a distributed system must choose between consistency (everyone sees the latest write) and availability (every request gets an answer). Partitions are rare but real, so the practical question is what your product should do when one happens.

The more everyday version is **PACELC**: even when there is no partition, you trade latency against consistency. Synchronous replication is consistent and slower. Asynchronous replication is faster and briefly stale.

Decide per feature, not per system:

- Bank balance, inventory, seat booking: **strong consistency**.
- Like counts, view counts, feeds, search results: **eventual consistency** is fine.

## 10. Common trade-offs at a glance

| Decision | Option A | Option B |
|---|---|---|
| Architecture | Modular monolith: simple to build, test and deploy | Microservices: independent scaling and deploys, much more operational cost |
| Communication | Synchronous calls: simple, tightly coupled | Async events: decoupled and resilient, harder to debug |
| Data | Normalised: no duplication, more joins | Denormalised: fast reads, must keep copies in sync |
| Consistency | Strong: correct, slower and less available | Eventual: fast and available, briefly stale |
| Pagination | Offset: page numbers, slows at depth | Cursor: fast at any depth, no "jump to page 50" |
| Build or buy | Build: control and fit | Managed service: speed, less to operate, vendor lock-in |

My default for a new product is a **modular monolith on one relational database**, with clear module boundaries so pieces can be extracted later if they truly need to be. Splitting is easier than merging.

## 11. Worked example: a URL shortener

**Requirements.** Create a short link for a long URL. Redirect short links quickly. Optional: count clicks.

**Estimates.** Say 1 million new links a day (~12 writes/second) and 100 million redirects a day (~1,200 reads/second, peaks maybe 5,000). Each record is under 1 KB, so about 1 GB a day, a few hundred GB per year.

**First design.**

- An API service behind a load balancer: `POST /links` to create, `GET /{code}` to redirect.
- A relational table `links(code PRIMARY KEY, url, owner_id, created_at)`.
- Codes generated as base62 strings. Seven characters gives about 3.5 trillion combinations. Generate randomly and retry on the rare collision, or encode a unique ID from a sequence.

**What breaks first?** Reads. The ratio is 100 to 1.

**Fixes, in order.**

1. Cache-aside in Redis keyed by code. Links almost never change, so hit rates will be very high and a long TTL is fine.
2. Return `301` (permanent, cacheable by browsers) or `302` (temporary, every click reaches you). Choose `302` if click analytics matter.
3. Do not write to the database on every redirect for analytics. Push a click event to a queue and aggregate counts asynchronously.
4. Add read replicas if cache misses still strain the primary.

**What I would not do yet:** shard the database. A few TB over several years fits on one well-provisioned Postgres instance with replicas.

**Trade-offs to mention.** Random codes are unguessable but need collision checks. Sequential IDs are simple but reveal volume and are enumerable. Click counts will be eventually consistent, which is acceptable for analytics.

## 12. In interviews specifically

- Spend the first few minutes on requirements and numbers. Interviewers watch for this.
- Talk while you draw. They are grading your reasoning, not the diagram.
- Start simple and evolve. "Here is v1, here is what fails at 10x, here is v2."
- Say the trade-off out loud every time you choose something.
- When you do not know a specific technology, describe the property you need ("a durable queue with at-least-once delivery") rather than bluffing a product name.

## Checklist

- [ ] Core use cases and non-functional requirements are written down
- [ ] Rough numbers for traffic, storage and read/write ratio exist
- [ ] The app tier is stateless
- [ ] Every query that matters has an index
- [ ] There is a clear source of truth for each piece of data
- [ ] Caches have keys that include the user or tenant where needed, and a TTL
- [ ] Async consumers are idempotent and have a dead-letter queue
- [ ] Every network call has a timeout, and retries use backoff with jitter
- [ ] There is a plan for when each dependency is down
- [ ] Backups exist and a restore has been tested
- [ ] Alerts fire on user-facing symptoms

Good system design is mostly restraint. Build for the load you can see coming, keep the escape hatches open, and write down why you chose what you chose.
