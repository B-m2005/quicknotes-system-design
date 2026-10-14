# QuickNotes Data Model

---

## Entities

### users
| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT |
| email | TEXT | NOT NULL UNIQUE |
| password_hash | TEXT | NOT NULL |
| full_name | TEXT | NOT NULL |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |

### notes
| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT |
| user_id | INTEGER | NOT NULL, FOREIGN KEY → users(id) |
| title | TEXT | NOT NULL |
| body | TEXT | |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |

### tags
| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT |
| name | TEXT | NOT NULL UNIQUE |

### note_tags
| Column | Type | Constraints |
|--------|------|-------------|
| note_id | INTEGER | NOT NULL, FOREIGN KEY → notes(id) |
| tag_id | INTEGER | NOT NULL, FOREIGN KEY → tags(id) |
| PRIMARY KEY | | (note_id, tag_id) |

---

## Relationships

**users → notes** is one-to-many: one user can have many notes,
but each note belongs to exactly one user.

**notes ↔ tags** is many-to-many: one note can have many tags
(personal, work, study) and one tag can belong to many notes.
A direct link between notes and tags is not possible in SQL,
so the join table note_tags is needed. Each row in note_tags
represents one note-tag pair.

---

## CREATE TABLE Statements

```sql
CREATE TABLE users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  email         TEXT    NOT NULL UNIQUE,
  password_hash TEXT    NOT NULL,
  full_name     TEXT    NOT NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notes (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id    INTEGER NOT NULL,
  title      TEXT    NOT NULL,
  body       TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE tags (
  id   INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE note_tags (
  note_id INTEGER NOT NULL,
  tag_id  INTEGER NOT NULL,
  PRIMARY KEY (note_id, tag_id),
  FOREIGN KEY (note_id) REFERENCES notes(id),
  FOREIGN KEY (tag_id)  REFERENCES tags(id)
);
```

---

## Example SQL Queries

### 1. Get all notes for a user
```sql
SELECT id, title, body, created_at
FROM notes
WHERE user_id = 7
ORDER BY created_at DESC;
```

### 2. Get all notes with their tags (JOIN)
```sql
SELECT n.id, n.title, t.name AS tag
FROM notes n
JOIN note_tags nt ON n.id = nt.note_id
JOIN tags t       ON t.id = nt.tag_id
WHERE n.user_id = 7;
```

### 3. Count notes per tag
```sql
SELECT t.name, COUNT(nt.note_id) AS note_count
FROM tags t
LEFT JOIN note_tags nt ON t.id = nt.tag_id
GROUP BY t.id, t.name
ORDER BY note_count DESC;
```

---

## Index

```sql
CREATE INDEX idx_notes_user_id ON notes(user_id);
```

This index speeds up the very common query of fetching all
notes for a given user. Without it the database scans every
row in the notes table; with it, it jumps straight to that
user's rows.

---

## SQL or NoSQL?

SQL is the right choice for QuickNotes. The data has a clear,
fixed structure — users own notes, notes have tags — and the
relationships between them are enforced by foreign keys, which
prevents orphaned notes or broken tag links. Queries such as
filtering notes by tag or counting notes per user are expressed
cleanly with JOIN and GROUP BY. A NoSQL store such as MongoDB
would make these cross-collection queries harder and would give
up referential integrity that a notes application depends on.