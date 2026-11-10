document.addEventListener("DOMContentLoaded", () => {
  const contactForm = document.getElementById("contactMessageForm");
  if (contactForm) {
    const status = document.getElementById("contactFormStatus");
    contactForm.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!contactForm.reportValidity()) {
        status.textContent =
          "Please check the highlighted fields and complete the form.";
        return;
      }
      status.textContent =
        "Your message has been sent. This is a Demo. ";
      contactForm.reset();
    });
  }

  const form = document.getElementById("taskForm");
  if (!form) return;
  const KEY = "sholaMustaphaAcademicTasks",
    title = document.getElementById("taskTitle"),
    due = document.getElementById("taskDue"),
    notes = document.getElementById("taskNotes"),
    id = document.getElementById("taskId"),
    save = document.getElementById("saveTask"),
    cancel = document.getElementById("cancelEdit"),
    list = document.getElementById("taskList");
  let tasks = [];
  let filter = "all";
  try {
    tasks = JSON.parse(localStorage.getItem(KEY) || "[]");
    if (!Array.isArray(tasks)) tasks = [];
  } catch {
    tasks = [];
  }
  const persist = () => localStorage.setItem(KEY, JSON.stringify(tasks));
  const esc = (s) =>
    String(s).replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#039;",
        })[c],
    );
  const reset = () => {
    form.reset();
    id.value = "";
    save.textContent = "Add task +";
    cancel.classList.add("hidden");
  };
  function render() {
    const done = tasks.filter((t) => t.completed).length;
    document.getElementById("totalCount").textContent = tasks.length;
    document.getElementById("doneCount").textContent = done;
    document.getElementById("todoCount").textContent = tasks.length - done;
    const shown = tasks.filter(
      (t) =>
        filter === "all" ||
        (filter === "active" && !t.completed) ||
        (filter === "completed" && t.completed),
    );
    document.getElementById("taskCountLabel").textContent =
      shown.length + " " + (shown.length === 1 ? "task" : "tasks");
    if (!shown.length) {
      list.innerHTML =
        '<p class="empty">' +
        (tasks.length
          ? "Nothing in this filter."
          : "No tasks yet. Add your first task above.") +
        "</p>";
      return;
    }
    list.innerHTML = shown
      .map(
        (t) =>
          `<article class="task-item ${t.completed ? "completed" : ""}"><input type="checkbox" data-action="toggle" data-id="${t.id}" ${t.completed ? "checked" : ""} aria-label="Mark task complete"><div class="task-main"><strong>${esc(t.title)}</strong>${t.notes ? `<p>${esc(t.notes)}</p>` : ""}${t.due ? `<p>Due: ${esc(t.due)}</p>` : ""}</div><div class="task-actions"><button data-action="edit" data-id="${t.id}">Edit</button><button data-action="delete" data-id="${t.id}">Delete</button></div></article>`,
      )
      .join("");
  }
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = title.value.trim();
    if (!name) return;
    if (id.value) {
      const t = tasks.find((x) => x.id === id.value);
      if (t)
        Object.assign(t, {
          title: name,
          due: due.value,
          notes: notes.value.trim(),
        });
    } else
      tasks.unshift({
        id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
        title: name,
        due: due.value,
        notes: notes.value.trim(),
        completed: false,
      });
    persist();
    reset();
    render();
  });
  cancel.addEventListener("click", reset);
  list.addEventListener("click", (e) => {
    const b = e.target.closest("button[data-action]");
    if (!b) return;
    const t = tasks.find((x) => x.id === b.dataset.id);
    if (!t) return;
    if (b.dataset.action === "delete") {
      tasks = tasks.filter((x) => x.id !== t.id);
      persist();
      render();
    } else {
      id.value = t.id;
      title.value = t.title;
      due.value = t.due || "";
      notes.value = t.notes || "";
      save.textContent = "Save changes ↗";
      cancel.classList.remove("hidden");
      title.focus();
    }
  });
  list.addEventListener("change", (e) => {
    if (e.target.matches('input[data-action="toggle"]')) {
      const t = tasks.find((x) => x.id === e.target.dataset.id);
      if (t) {
        t.completed = e.target.checked;
        persist();
        render();
      }
    }
  });
  document.querySelectorAll(".filter").forEach((b) =>
    b.addEventListener("click", () => {
      filter = b.dataset.filter;
      document
        .querySelectorAll(".filter")
        .forEach((x) => x.classList.toggle("active", x === b));
      render();
    }),
  );
  render();
});
