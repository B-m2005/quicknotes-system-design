# QuickNotes API Design

Base URL: https://api.quicknotes.co.ke/v1
All requests and responses use JSON.
Authentication: Bearer token in Authorization header.

---

## Endpoints

| Method | Path | Description | Success Status |
|--------|------|-------------|----------------|
| GET | /notes | List all notes for the authenticated user | 200 OK |
| GET | /notes/{id} | Get one note by ID | 200 OK |
| POST | /notes | Create a new note | 201 Created |
| PATCH | /notes/{id} | Update a note's title or body | 200 OK |
| DELETE | /notes/{id} | Delete a note | 204 No Content |
| GET | /notes?tag=work | List notes filtered by tag | 200 OK |
| POST | /auth/register | Register a new user | 201 Created |
| POST | /auth/login | Login and receive a token | 200 OK |

---

## Request and Response Examples

### POST /notes — Create a note

**Request body:**
```json
{
  "title": "Buy groceries",
  "body": "Milk, bread, eggs and butter",
  "tags": ["personal"]
}
```

**Response body (201 Created):**
```json
{
  "id": 42,
  "title": "Buy groceries",
  "body": "Milk, bread, eggs and butter",
  "userId": 7,
  "tags": ["personal"],
  "createdAt": "2026-10-13T08:30:00Z",
  "updatedAt": "2026-10-13T08:30:00Z"
}
```

---

### GET /notes — List notes

**Response body (200 OK):**
```json
{
  "notes": [
    {
      "id": 42,
      "title": "Buy groceries",
      "body": "Milk, bread, eggs and butter",
      "tags": ["personal"],
      "createdAt": "2026-10-13T08:30:00Z"
    },
    {
      "id": 41,
      "title": "Finish assignment",
      "body": "Complete Day 7 before midnight",
      "tags": ["study"],
      "createdAt": "2026-10-12T14:00:00Z"
    }
  ],
  "total": 2
}
```

---

## Error Codes

| Code | Meaning | Example |
|------|---------|---------|
| 400 | Bad Request | Title missing or over 100 characters |
| 401 | Unauthorized | No token provided or token expired |
| 403 | Forbidden | Trying to delete another user's note |
| 404 | Not Found | GET /notes/99999 — note does not exist |
| 500 | Internal Server Error | Database connection failed |

**Example error body:**
```json
{
  "error": {
    "status": 404,
    "message": "Note not found.",
    "path": "/notes/99999",
    "timestamp": "2026-10-13T08:30:00Z"
  }
}
```