// ---------- 1. Constants ----------
const API_URL = "https://jsonplaceholder.typicode.com/posts";

// ---------- 2. Element selection ----------
const loadBtn    = document.querySelector("#load-btn");
const statusEl   = document.querySelector("#status");
const noteForm   = document.querySelector("#note-form");
const titleInput = document.querySelector("#title-input");
const bodyInput  = document.querySelector("#body-input");
const submitBtn  = document.querySelector("#submit-btn");
const notesList  = document.querySelector("#notes-list");

// ---------- 3. Status helpers ----------
function showStatus(message, type) {
  statusEl.textContent = message;
  statusEl.className = type; // "success" or "error" or ""
}

// ---------- 4. Reusable request function ----------
async function request(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }
  return response;
}

// ---------- 5. Render one note as a list item ----------
function createNoteItem(note) {
  const li = document.createElement("li");
  li.classList.add("note-item");
  li.dataset.id = note.id;

  const title = document.createElement("strong");
  title.textContent = note.title;

  const body = document.createElement("p");
  body.textContent = note.body || "";

  const meta = document.createElement("span");
  meta.classList.add("note-meta");
  meta.textContent = `ID: ${note.id}`;

  // DELETE button
  const delBtn = document.createElement("button");
  delBtn.textContent = "Delete";
  delBtn.classList.add("delete-btn");
  delBtn.addEventListener("click", () => deleteNote(note.id, li, delBtn));

  li.appendChild(title);
  li.appendChild(body);
  li.appendChild(meta);
  li.appendChild(delBtn);

  return li;
}

// ---------- 6. GET — load 10 notes ----------
loadBtn.addEventListener("click", async () => {
  loadBtn.disabled = true;
  showStatus("Loading notes...", "");

  try {
    const response = await request(`${API_URL}?_limit=10`);
    const notes = await response.json();

    notesList.innerHTML = "";

    if (notes.length === 0) {
      const li = document.createElement("li");
      li.textContent = "No notes found.";
      notesList.appendChild(li);
      showStatus("No notes to display.", "");
      return;
    }

    notes.forEach((note) => {
      notesList.appendChild(createNoteItem(note));
    });

    showStatus(`Loaded ${notes.length} notes from the server.`, "success");
  } catch (error) {
    showStatus(
      "Could not load notes. Please check your connection and try again.",
      "error"
    );
    console.error(error);
  } finally {
    loadBtn.disabled = false;
  }
});

// ---------- 7. POST — create a note ----------
noteForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const title = titleInput.value.trim();
  const body  = bodyInput.value.trim();

  // Validation
  if (title.length === 0) {
    showStatus("Title is required.", "error");
    titleInput.focus();
    return;
  }
  if (title.length > 100) {
    showStatus("Title must be 100 characters or fewer.", "error");
    titleInput.focus();
    return;
  }

  submitBtn.disabled = true;
  showStatus("Creating note...", "");

  try {
    const response = await request(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, body, userId: 1 }),
    });

    const newNote = await response.json();

    // Add new note to the TOP of the list
    const li = createNoteItem(newNote);
    notesList.prepend(li);

    showStatus(
      `Note created (status ${response.status}, id ${newNote.id}).`,
      "success"
    );

    // Clear the form
    noteForm.reset();
    titleInput.focus();
  } catch (error) {
    showStatus("Could not create note. Please try again.", "error");
    console.error(error);
  } finally {
    submitBtn.disabled = false;
  }
});

// ---------- 8. DELETE — remove a note ----------
/*
 * NOTE: JSONPlaceholder simulates DELETE requests — it returns
 * status 200 but does not actually remove the note from its server.
 * Notes you create via POST also get id 101 every time and are not
 * stored permanently. We handle this by removing the note from the
 * DOM on a successful response, giving the user the expected experience
 * even though the server has not truly deleted anything.
 */
async function deleteNote(id, listItem, btn) {
  btn.disabled = true;
  showStatus("Deleting note...", "");

  try {
    await request(`${API_URL}/${id}`, { method: "DELETE" });
    listItem.remove();
    showStatus(`Note ${id} deleted successfully.`, "success");
  } catch (error) {
    showStatus(`Could not delete note ${id}. Please try again.`, "error");
    btn.disabled = false;
    console.error(error);
  }
}