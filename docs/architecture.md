# QuickNotes Architecture

---

## Functional Requirements

- Users can register and log in
- Users can create, read, update and delete their own notes
- Users can tag notes and filter by tag
- Notes load in under 2 seconds on a normal connection

## Non-Functional Requirements

- System must handle 1 million registered users
- 99.9% uptime (less than 9 hours downtime per year)
- All passwords hashed, all traffic over HTTPS
- Data must not be lost if one server goes down

---

## Load Estimates (1 Million Users)

### Assumptions
- 10% active daily = 100,000 daily active users
- Each active user reads 20 notes per day
- Each active user writes 2 notes per day
- Average note size = 2 KB
- Active hours = 18 hours per day

### Reads per second
100,000 users x 20 reads = 2,000,000 reads/day
divided by (18 x 3,600) = ~31 reads/second average
Peak (x5) = ~155 reads/second

### Writes per second
100,000 users x 2 writes = 200,000 writes/day
divided by 64,800 = ~3 writes/second average
Peak (x5) = ~15 writes/second

### Storage per year
200,000 notes/day x 2 KB = 400,000 KB = ~400 MB/day
400 MB x 365 = ~146 GB/year

This system is READ-HEAVY.
Reads are roughly 10x more frequent than writes.

---

## Architecture Diagram

                [ USER BROWSER ]
                       |
                       | HTTPS
                       v
                    [ DNS ]
              (resolves quicknotes.co.ke
               to the CDN IP address)
                       |
                       v
                    [ CDN ]
              (caches static files:
               HTML, CSS, JS, images)
                       |
               cache miss only
                       v
               [ LOAD BALANCER ]
              (distributes requests
               across app servers)
                /             \
               v               v
        [ APP SERVER 1 ]  [ APP SERVER 2 ]
        (handles API          (handles API
         requests,             requests,
         auth, logic)          auth, logic)
               |                   |
               v                   v
            [ CACHE (Redis) ]
          (stores frequent reads:
           user note lists,
           session tokens)
               |
      cache miss only
               |
        +------+------+
        v             v
 [ PRIMARY DB ]  [ READ REPLICA ]
 (all writes)    (all read queries)
        |
        | on POST /notes
        v
     [ QUEUE ]
 (holds background
  jobs safely)
        |
        v
    [ WORKER ]
 (sends email
  notifications,
  processes exports)



---

## Component Explanations

| Component | Problem It Solves |
|-----------|------------------|
| **DNS** | Translates the domain name quicknotes.co.ke into an IP address so browsers can find the server |
| **CDN** | Serves static files from a server close to the user so the app loads fast globally |
| **Load Balancer** | Spreads incoming API requests across multiple app servers so no single server is overwhelmed |
| **App Servers (x2)** | Run the business logic — handle authentication, note CRUD and API responses |
| **Cache (Redis)** | Stores frequent read results in memory so the database is not hit on every request |
| **Primary Database** | Stores all data permanently — users, notes, tags — and handles all write operations |
| **Read Replica** | A copy of the database that handles all read queries, protecting the primary from read traffic |
| **Queue** | Holds background jobs so the API responds instantly without waiting |
| **Worker** | Picks jobs off the queue and processes them independently from the main request flow |

---

## Request Flow — GET /notes

1. Browser sends GET /notes to CDN
2. CDN passes to Load Balancer (not cached — user data)
3. Load Balancer routes to App Server 1
4. App Server checks Cache for this user's notes
5. Cache HIT — return notes immediately (fast path)
6. Cache MISS — App Server queries Read Replica
7. Read Replica returns notes
8. App Server stores result in Cache for next time
9. App Server returns JSON to browser

---

## Request Flow — POST /notes

1. Browser sends POST /notes with { title, body }
2. Load Balancer routes to App Server 2
3. App Server validates the request (title required)
4. App Server writes new note to Primary Database
5. Primary Database replicates the write to Read Replica
6. App Server invalidates the user's Cache entry
   so next GET returns fresh data
7. App Server pushes notification job to Queue
8. Worker picks job and sends email confirmation
9. App Server returns 201 Created and new note JSON

---

## Trade-offs

### Trade-off 1 — Cache Staleness vs Speed

Choice: Cache note lists for 60 seconds.

Benefit: Reads are served from memory, protecting the
database from 155 requests per second at peak.

Cost: A note created on one device may not appear
immediately on another device until the cache expires.

Acceptable because: A 60-second delay on a personal
notes app is invisible to most users.

### Trade-off 2 — Two App Servers vs One

Choice: Run at least two app servers behind a load balancer.

Benefit: If one server crashes, the load balancer
routes all traffic to the other. No downtime for users.

Cost: More infrastructure to manage and pay for.

Acceptable because: 99.9% uptime is a requirement,
and a single app server is a single point of failure.

---

## Single Points of Failure — How We Avoid Them

| Component | Risk | Solution |
|-----------|------|----------|
| **App Server** | Crash takes down the API | Two app servers behind load balancer |
| **Database** | Crash causes data loss | Primary and Read Replica with daily backups |
| **Load Balancer** | Crash blocks all traffic | Managed load balancer with automatic failover |
| **CDN** | Outage slows static files | CDN providers have global redundancy built in |