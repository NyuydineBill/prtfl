System design is often taught as a list of components: load balancer, cache, queue, shard. Real design work is mostly about something else, which is deciding which problems you actually have and which ones you are inventing. This guide covers the building blocks, but the focus stays on the trade-offs between them, because that is the part that carries over between jobs, codebases and interviews.

The chapters build on each other: a way of working, the numbers that drive decisions, then the app tier, data, caching, asynchronous work, reliability and consistency, ending with a worked example that uses all of them.

> [!NOTE]
> Latencies and capacities in this guide are orders of magnitude for reasoning, not benchmarks. Hardware, configuration and workload change real numbers by large factors, so measure your own system before acting on any of them.

## 1. A way to approach any design

The same sequence works for a whiteboard interview and for a real feature.

```figure
sd-design-loop
```

1. **Clarify what it must do.** Core use cases only. "Users can shorten a URL and be redirected" beats a list of twenty features.
2. **Clarify the qualities.** How many users? Reads versus writes? How fast must it respond? Can it ever lose data? Can users see slightly stale data?
3. **Estimate the numbers.** Requests per second, storage per year, bandwidth. Rough is fine. The numbers tell you which problems are real.
4. **Draw the simplest thing that works.** Usually a client, one service and one database.
5. **Find what breaks first** under your numbers, and fix only that.
6. **Name the trade-offs** you made and what you would revisit as the system grows.

Step 4 is where designs go wrong in both directions. Some jump straight to a streaming platform and a dozen microservices for a product with a few hundred users. Others never move past one overloaded database long after the numbers said they should. Let the numbers decide.

## 2. Numbers worth knowing

You do not need exact figures, only the orders of magnitude.

```figure
sd-latency
```

| Operation | Rough latency |
|---|---|
| Read from main memory | ~100 nanoseconds |
| Random read from an SSD | ~100 microseconds |
| Round trip within one data centre | ~0.5 milliseconds |
| Simple indexed database query on a warm cache | ~1 millisecond |
| Round trip between continents | ~100 to 200 milliseconds |

Conversions that make estimates quick:

- One day is **86,400 seconds**. Call it 100,000 for mental maths.
- **1 million requests a day is about 12 per second** on average. Peaks are higher, and by how much depends on your users and their time zones, so measure the ratio or state the one you assumed.
- A single well-provisioned relational database often serves thousands of simple indexed queries per second. Many products never need more than one primary, so benchmark before assuming you have outgrown it.

Example: 10 million new records a day at 1 KB each is 10 GB a day, about 3.65 TB a year. That changes your storage plan. 10,000 records a day does not.

## 3. Scalability

**Vertical scaling** means a bigger machine. It is simple, needs no code changes, and goes further than people expect. It also has a ceiling and leaves a single point of failure.

**Horizontal scaling** means more machines. It has no hard ceiling and gives you redundancy, but it only works if the service is **stateless**: any instance can handle any request. Once the app tier is stateless, scaling it is mostly configuration; the hard part of scaling is almost always **the data**.

```figure
sd-scaling-path
```

To make a service stateless, move state out of process memory and local disk:

- Sessions go to a shared store (Redis or the database) or into signed tokens.
- Uploaded files go to object storage such as Amazon S3, not the local disk.
- Scheduled jobs run in one place, or take a lock so only one instance runs each job.

## 4. Load balancing

A load balancer spreads traffic across instances and stops sending traffic to unhealthy ones.

| Type | Works at | Can route by | Example uses |
|---|---|---|---|
| Layer 4 | TCP/UDP | IP address and port | Very high throughput, non-HTTP protocols |
| Layer 7 | HTTP | Path, host, headers, cookies | Most web apps; `/api` to one service and `/` to another |

Common algorithms:

- **Round robin.** Simple. Fine when requests cost about the same.
- **Least connections.** Better when some requests are much slower than others.
- **Consistent hashing.** The same key goes to the same server, which keeps caches warm and limits reshuffling when servers come and go.

Health checks matter more than the algorithm. A good health check confirms the instance can actually serve a request, not just that the process is running. A bad one either takes healthy instances out or keeps broken ones in.

Avoid **sticky sessions** unless you have no choice. They hide state problems and make deploys and scaling uneven.

## 5. Databases

### Relational or not?

Start with a relational database (PostgreSQL, MySQL) unless you have a specific reason not to. You get transactions, constraints, joins and decades of tooling. Reach for something else when the access pattern clearly calls for it:

| Need | Good fit |
|---|---|
| Flexible documents read and written as a whole | Document store (MongoDB, Firestore) |
| Very high write volume, simple key lookups | Wide-column or key-value store (Cassandra, DynamoDB) |
| Full-text search and relevance ranking | Search engine (Elasticsearch, OpenSearch), or PostgreSQL full-text search for smaller needs |
| Time-stamped metrics | Time-series database |
| Relationships are the query | Graph database |

Using two stores is normal: a relational database as the source of truth plus a search index fed from it.

### Indexes

An index is the first fix for a slow query and the most common thing missing. Index the columns you filter, join and sort on. Every index slows writes slightly and uses storage, so index for real queries, not hypothetical ones. Learn to read `EXPLAIN` output for your database; it shows whether a query uses an index or scans the whole table.

### Read replicas

Replicas are copies of the primary that serve reads, which helps when reads dominate. The catch is **replication lag**.

```figure
sd-replication-lag
```

### Partitioning and sharding

**Partitioning** splits a big table into pieces (by date, for example) inside one database. **Sharding** spreads data across several databases by a shard key such as `tenant_id` or `user_id`.

Sharding is powerful and expensive. Cross-shard queries and transactions get hard, rebalancing is painful, and a bad shard key creates hot spots. Exhaust indexing, caching, replicas and vertical scaling first. If you do shard, choose a key that matches how data is accessed and spreads load evenly.

### Transactions and consistency

Use a transaction whenever several writes must succeed or fail together, and know your isolation level. PostgreSQL defaults to Read Committed and MySQL's InnoDB to Repeatable Read, both weaker than Serializable. That is usually fine, and it explains certain race conditions. For counters and inventory, use an atomic update instead of reading a value, changing it in application code and writing it back:

```sql
UPDATE stock SET qty = qty - 1 WHERE id = $1 AND qty > 0;
```

If the statement updates zero rows, the item was already gone.

## 6. Caching

Caching trades freshness for speed. The question is always: **how stale can this be?**

### Where caches live

- **Browser and CDN:** static assets, public pages, images.
- **Application cache** (Redis, Memcached): computed results, sessions, hot rows.
- **Inside the database:** the buffer pool and the operating system's page cache keep hot data in memory without any work from you.

### Patterns

```figure
sd-caching
```

| Pattern | How it works | Trade-off |
|---|---|---|
| **Cache-aside** | The app checks the cache; on a miss it reads the database and fills the cache | Most common and flexible. The first request after a miss is slow |
| **Read-through** | A cache library loads from the database on a miss | Simpler app code, less control |
| **Write-through** | Writes go to the cache and the database together | Cache stays fresh, writes are slower |
| **Write-behind** | Writes go to the cache; the database is updated later | Fast writes, risk of losing data |

### The hard parts

- **Invalidation.** When data changes, delete or update the cached copy. A TTL is the safety net for the write path you forgot.
- **Stampedes.** A popular key expires and many requests hit the database at once. Let one request rebuild while the others wait or get the stale value, and add random jitter to TTLs so keys do not all expire together.
- **User-specific data under a shared key.** This is how one user sees another user's dashboard. Always include the user or tenant in the key.

Cache what is read often, changes rarely and is expensive to compute, and measure the hit rate. A cache that rarely hits adds a network hop and another moving part for little gain.

## 7. Queues and asynchronous work

A queue lets one part of the system hand work to another without waiting for it.

Use one when:

- The work is slow (emails, video processing, report generation) and the user does not need to wait.
- Traffic is bursty and you want to absorb spikes instead of falling over.
- Several consumers need to react to the same event.

Concepts to know:

- **Point-to-point** queues give each message to one consumer. **Publish/subscribe** gives every subscriber a copy.
- **At-least-once delivery** is what most systems actually provide. A message can arrive twice, so **consumers must be idempotent**: record processed message IDs, or design operations so repeating them is harmless.
- **Dead-letter queue.** Messages that keep failing go somewhere you can inspect them, instead of blocking the queue or vanishing.
- **Backpressure.** If producers outpace consumers, the queue grows. Monitor queue depth and the age of the oldest message; together they say more about health than CPU graphs.
- **Ordering** is usually guaranteed only within a partition or key, not globally.

### The dual-write problem

A classic bug: you save an order to the database, then publish an `OrderCreated` event. If the publish fails, the database says the order exists and nothing downstream knows.

```figure
sd-outbox
```

The **transactional outbox** fixes this: write the event to an `outbox` table in the same transaction as the order, then have a separate process read the outbox and publish. Either both happen or neither does.

## 8. Reliability

Everything fails eventually. Reliability is about making failures small, visible and recoverable.

**Timeouts on every network call.** A call without a timeout can hang indefinitely and hold a thread or connection while it does. Set timeouts deliberately, and shorter than the caller's own timeout.

**Retries, carefully.** Only retry idempotent operations, or use idempotency keys. Use exponential backoff with jitter so retries do not arrive in synchronised waves:

```python
import random
import time

def call_with_retry(fn, attempts=5, base=0.2, cap=5.0):
    for attempt in range(attempts):
        try:
            return fn()
        except TransientError:  # whatever your client raises for timeouts and 5xx
            if attempt == attempts - 1:
                raise
            ceiling = min(cap, base * 2 ** attempt)
            time.sleep(random.uniform(0, ceiling))  # "full jitter"
```

```figure
sd-retries
```

Retries multiply across layers: if three layers each try three times, one failure at the bottom becomes 27 calls. Retry at one layer.

**Circuit breakers.** After repeated failures, stop calling a dependency for a while and fail fast or use a fallback. This keeps a struggling dependency from dragging healthy services down with it.

**Graceful degradation.** Decide in advance what the product does when a non-critical piece is down. Recommendations fail: show popular items. Search is slow: show recent items. Checkout should not depend on the recommendation engine.

**Redundancy.** Run at least two of everything that matters, across availability zones. Back up databases, and test restoring them. A backup that has never been restored is an assumption.

**SLOs.** Agree on a target such as "99.9% of requests succeed in under 300 ms over 30 days." That gives you an error budget: room to ship changes while you are within target, and a signal to slow down when you are not.

**Observability.** Logs, metrics and traces, tied together with a request ID. Alert on symptoms users feel (error rate, latency) rather than on every CPU spike.

## 9. Consistency trade-offs

The **CAP theorem** says that during a network partition, a distributed system must choose between consistency (every read sees the latest write) and availability (every request gets a response). Partitions are rare but real, so the practical question is what your product should do when one happens.

The everyday extension is **PACELC**: if there is a partition, choose between availability and consistency; *else*, even when the network is fine, choose between latency and consistency. Synchronous replication is consistent and slower. Asynchronous replication is faster and briefly stale.

```figure
sd-consistency
```

## 10. Common trade-offs at a glance

| Decision | Option A | Option B |
|---|---|---|
| Architecture | Modular monolith: simple to build, test and deploy | Microservices: independent scaling and deploys, much more operational cost |
| Communication | Synchronous calls: simple, tightly coupled | Asynchronous events: decoupled and resilient, harder to debug |
| Data | Normalised: no duplication, more joins | Denormalised: fast reads, copies to keep in sync |
| Consistency | Strong: correct, slower and less available | Eventual: fast and available, briefly stale |
| Pagination | Offset: page numbers, slows at depth | Cursor: fast at any depth, no "jump to page 50" |
| Build or buy | Build: control and fit | Managed service: speed, less to operate, vendor lock-in |

A sensible default for a new product is a **modular monolith on one relational database**, with clear module boundaries so pieces can be extracted later if they genuinely need to be. Splitting a well-structured monolith is easier than merging services that were split too early.

## 11. Worked example: a URL shortener

**Requirements.** Create a short link for a long URL. Redirect short links quickly. Optionally, count clicks.

**Estimates.** Assume 1 million new links a day (about 12 writes per second) and 100 million redirects a day (about 1,160 reads per second; assume a peak of four times that, about 4,600). Each record is under 1 KB, so under 1 GB a day and roughly 365 GB a year.

```figure
sd-url-shortener
```

**First design.**

- An API service behind a load balancer: `POST /links` to create, `GET /{code}` to redirect.
- A table `links(code PRIMARY KEY, url, owner_id, created_at)`.
- Codes as base62 strings. Seven characters give 62⁷, about 3.5 trillion, combinations. Generate them randomly and retry on the rare collision, or encode a unique ID from a sequence.

**What breaks first?** Reads. The ratio is 100 to 1.

**Fixes, in order.**

1. Cache-aside in Redis, keyed by code. Links almost never change, so a long TTL is fine and most redirects should be served from memory.
2. Choose the redirect status deliberately. `301 Moved Permanently` is cacheable by browsers by default, so repeat clicks may never reach you. `302 Found` sends every click to your servers. Use `302` if click counts matter.
3. Do not write to the database on every redirect. Push a click event to a queue and aggregate counts asynchronously.
4. Add read replicas only if cache misses still strain the primary.

**What not to do yet:** shard. A few terabytes over several years fits on one well-provisioned PostgreSQL primary with replicas.

**Trade-offs to state.** Random codes are unguessable but need collision checks. Sequential IDs are simple but reveal volume and can be enumerated. Click counts are eventually consistent, which is acceptable for analytics.

## 12. In interviews specifically

- Spend the first few minutes on requirements and numbers. That is part of what is being assessed.
- Talk while you draw. The reasoning matters more than the diagram.
- Start simple and evolve: "Here is version one, here is what fails at ten times the load, here is version two."
- Say the trade-off out loud every time you choose something.
- When you do not know a specific technology, describe the property you need ("a durable queue with at-least-once delivery") rather than guessing a product name.

## Checklist

- [ ] Core use cases and non-functional requirements are written down
- [ ] Rough numbers exist for traffic, storage and the read/write ratio
- [ ] The app tier is stateless
- [ ] Every query that matters has an index, confirmed with `EXPLAIN`
- [ ] Each piece of data has one clear source of truth
- [ ] Cache keys include the user or tenant where needed, and every entry has a TTL
- [ ] Asynchronous consumers are idempotent and have a dead-letter queue
- [ ] Every network call has a timeout, and retries use backoff with jitter at one layer
- [ ] There is a plan for when each dependency is down
- [ ] Backups exist and a restore has been tested
- [ ] Alerts fire on user-facing symptoms

Good system design is mostly restraint. Build for the load you can see coming, keep the escape hatches open, and write down why you chose what you chose.

## References and further reading

### Books and papers

- Martin Kleppmann, [Designing Data-Intensive Applications](https://dataintensive.net/) (O'Reilly). The standard reference on replication, partitioning, transactions and consistency.
- Betsy Beyer et al., [Site Reliability Engineering](https://sre.google/sre-book/table-of-contents/) (O'Reilly, free online). See [Service Level Objectives](https://sre.google/sre-book/service-level-objectives/) and [Addressing Cascading Failures](https://sre.google/sre-book/addressing-cascading-failures/).
- Seth Gilbert and Nancy Lynch, [Brewer's conjecture and the feasibility of consistent, available, partition-tolerant web services](https://dl.acm.org/doi/10.1145/564585.564601) (2002). The proof of the CAP theorem.
- Eric Brewer, [CAP twelve years later: how the "rules" have changed](https://www.infoq.com/articles/cap-twelve-years-later-how-the-rules-have-changed/) (2012).
- Daniel Abadi, [Consistency tradeoffs in modern distributed database system design](https://www.cs.umd.edu/~abadi/papers/abadi-pacelc.pdf) (IEEE Computer, 2012). The PACELC formulation.

### Engineering guidance

- Amazon Builders' Library, [Timeouts, retries, and backoff with jitter](https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/)
- AWS Architecture Blog, [Exponential backoff and jitter](https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/). The origin of the "full jitter" formula used in chapter 8.
- Martin Fowler, [CircuitBreaker](https://martinfowler.com/bliki/CircuitBreaker.html)
- Chris Richardson, [Pattern: Transactional outbox](https://microservices.io/patterns/data/transactional-outbox.html)
- Peter Norvig, [Approximate timing for various operations](https://norvig.com/21-days.html#answers). The table behind most "latency numbers" lists.

### Database documentation

- PostgreSQL, [Using EXPLAIN](https://www.postgresql.org/docs/current/using-explain.html)
- PostgreSQL, [Transaction isolation](https://www.postgresql.org/docs/current/transaction-iso.html)
- PostgreSQL, [High availability, load balancing, and replication](https://www.postgresql.org/docs/current/high-availability.html)
- MDN Web Docs, [Redirections in HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Redirections)

## Quick reference

A one-page summary of the defaults in this guide. In the PDF edition it sits on its own page so it can be printed and kept nearby.

```figure
sd-quick-reference
```
