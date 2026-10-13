# QuickNotes System Design

A full API client and system design project built during
the Web Foundations course at PLP Academy.

---

## Description

QuickNotes is a note-taking application that connects to a
REST API to load, create and delete notes. This project
demonstrates how a browser-based app talks to a backend API
using fetch, async/await and proper error handling.

The docs folder contains the full system design for scaling
QuickNotes to 1 million users.

---

## How to Run the API Client

1. Clone this repository:

git clone https://github.com/B-m2005/quicknotes-system-design
cd quicknotes-system-design

2. Open index.html in your browser directly
   or use Live Server in VS Code.

3. Click Load notes to fetch notes from the API.

4. Fill in the form and click Add Note to create a note.

5. Click Delete on any note to remove it.

No installation or server required.
Runs entirely in the browser.

---

## Project Structure

quicknotes-system-design/
├── index.html        — the main page
├── api.js            — all API logic (GET, POST, DELETE)
├── style.css         — page styling
├── README.md         — this file
└── docs/
    ├── api-design.md      — REST API endpoints and errors
    ├── data-model.md      — database tables and SQL
    └── architecture.md    — system diagram and scaling plan

---

## Documents

- API Design: docs/api-design.md
  REST endpoints, request and response examples and error codes

- Data Model: docs/data-model.md
  Database tables, relationships, SQL queries and justification

- Architecture: docs/architecture.md
  System diagram, load estimates, request flows and trade-offs

---

## What I Learned

1. How fetch and async/await work together — every API
   request needs try/catch to handle network failures
   gracefully, and finally to re-enable buttons even
   when something goes wrong.

2. Why textContent matters — using textContent instead
   of innerHTML when displaying user data prevents
   cross-site scripting attacks where a malicious title
   could inject JavaScript into the page.

3. The difference between reading and writing data — GET
   requests are cheap and can be cached; POST and DELETE
   requests change state and must never be cached, which
   directly affects how you design the architecture.

4. How to design a REST API — every endpoint has a clear
   method, path and status code; errors follow a consistent
   format so the frontend always knows how to handle them.

5. How systems scale — adding a cache and a read replica
   can reduce database load by over 90%, which is why
   read-heavy systems like QuickNotes need both.

---

## Technologies Used

- HTML5
- CSS3
- JavaScript (fetch, async/await)
- JSONPlaceholder API (https://jsonplaceholder.typicode.com)

---

## Author

Brian Marsh
GitHub: https://github.com/B-m2005
PLP Academy — Web Foundations 2026
