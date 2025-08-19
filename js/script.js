// --- Task Management ---
let taskCounter = 1;
let inProgress = 0, completed = 0;

// Priority order for queue/priority queue
const priorityOrder = { High: 1, Medium: 2, Low: 3 };

// ------------------- Data Structures -------------------

// 1. Stack (LIFO)
class TaskStack {
  constructor() { this.stack = []; }
  push(task) { this.stack.push(task); }
  pop() { return this.stack.pop(); }
  peek() { return this.stack[this.stack.length - 1]; }
  isEmpty() { return this.stack.length === 0; }
}

// 2. Queue (FIFO)
class TaskQueue {
  constructor() { this.queue = []; }
  enqueue(task) { this.queue.push(task); }
  dequeue() { return this.queue.shift(); }
  front() { return this.queue[0]; }
  isEmpty() { return this.queue.length === 0; }
}

// 3. Priority Queue
class PriorityQueue {
  constructor() { this.items = []; }
  enqueue(task) {
    this.items.push(task);
    this.items.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  }
  dequeue() { return this.items.shift(); }
  peek() { return this.items[0]; }
  isEmpty() { return this.items.length === 0; }
}

// --------------------------------------------------------
// Instances
let taskStack = new TaskStack();
let taskQueue = new TaskQueue();
let pq = new PriorityQueue();
let taskList = []; // used for rendering

// ------------------- Core Functions -------------------

// Update task stats
function updateStats() {
  document.getElementById("stats").textContent =
    `Tasks: ${taskList.filter(t => !t.status).length} | Completed: ${completed} | In Progress: ${inProgress}`;
}

// Add a new task
function addTask(name, desc, due, priority) {
  const task = {
    id: taskCounter++,
    name,
    desc,
    added: new Date().toISOString().split("T")[0],
    due,
    priority,
    status: false
  };

  taskStack.push(task);
  taskQueue.enqueue(task);
  pq.enqueue(task);
  taskList.push(task);

  inProgress++;
  renderTasks();
}

// Render tasks
function renderTasks() {
  const tbody = document.querySelector("#taskTable tbody");
  tbody.innerHTML = "";

  taskList.forEach((t, i) => {
    if (!t.status) {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td><input type="checkbox" onchange="moveToCompleted(this, ${i})"></td>
        <td>${t.name}</td>
        <td>${t.desc}</td>
        <td>${t.added}</td>
        <td>${t.due}</td>
        <td class="priority-${t.priority}">${t.priority}</td>
        <td style="text-align:center;">
          <button class="remove-btn" onclick="removeTask(${t.id})">×</button>
        </td>
      `;
      tbody.appendChild(row);
    }
  });

  updateStats();
  checkIfEmpty();
}

// Move task to completed
function moveToCompleted(checkbox, index) {
  if (checkbox.checked) {
    const task = taskList[index];
    task.status = true;
    completed++;
    inProgress--;

    const clone = document.createElement("tr");
    clone.innerHTML = `
      <td>${task.name}</td>
      <td>${task.desc}</td>
      <td>${task.added}</td>
      <td>${task.due}</td>
      <td class="priority-${task.priority}">${task.priority}</td>
      <td style="text-align:center;">
        <button class="remove-btn" onclick="removeTask(${task.id})">×</button>
      </td>
    `;
    document.getElementById("completedModalBody").appendChild(clone);

    renderTasks();
  }
}

// ------------------- Sorting -------------------
function sortByStack() {
  taskList = [...taskStack.stack].filter(t => !t.status);
  renderTasks();
}

function sortByPriority() {
  taskList = [...pq.items].filter(t => !t.status);
  renderTasks();
}

function setSort(type) {
  if (type === 'stack') sortByStack();
  else if (type === 'priority') sortByPriority();
}

// ------------------- Extra Features -------------------
function undoTask() {
  const lastTask = taskStack.pop();
  if (lastTask) removeTask(lastTask.id);
}

function processNextTask() {
  const task = taskQueue.dequeue();
  if (task) moveToCompleted({ checked: true }, taskList.indexOf(task));
}

function processUrgentTask() {
  const urgent = pq.dequeue();
  if (urgent) moveToCompleted({ checked: true }, taskList.indexOf(urgent));
}

// ------------------- Modal & Form -------------------
const modal = document.getElementById("taskModal");
const span = document.querySelector(".close");
const form = document.getElementById("taskForm");

function openTaskDialog() { modal.style.display = "block"; }
span.onclick = () => modal.style.display = "none";
window.onclick = (e) => { if (e.target === modal) modal.style.display = "none"; }

form.addEventListener("submit", function(e) {
  e.preventDefault();
  const name = document.getElementById("taskName").value.trim();
  const desc = document.getElementById("taskDesc").value.trim();
  const priority = document.getElementById("taskPriority").value;
  const due = document.getElementById("taskDue").value;

  if (!name || !desc || !due) {
    alert("Please fill in all fields!");
    return;
  }

  addTask(name, desc, due, priority);
  form.reset();
  modal.style.display = "none";
});

// --- Completed Tasks Modal ---
function toggleCompleted() {
  const completedModal = document.getElementById("completedModal");
  const completedModalBody = document.getElementById("completedModalBody");

  completedModalBody.innerHTML = "";
  taskList.forEach(t => {
    if (t.status) {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${t.name}</td>
        <td>${t.desc}</td>
        <td>${t.added}</td>
        <td>${t.due}</td>
        <td class="priority-${t.priority}">${t.priority}</td>
        <td style="text-align:center;">
          <button class="remove-btn" onclick="removeTask(${t.id})">×</button>
        </td>
      `;
      completedModalBody.appendChild(row);
    }
  });

  completedModal.style.display = "block";
}

document.getElementById("completedClose").onclick = () => {
  document.getElementById("completedModal").style.display = "none";
};

window.addEventListener("click", (e) => {
  const completedModal = document.getElementById("completedModal");
  if (e.target === completedModal) completedModal.style.display = "none";
});

// ------------------- Utilities -------------------

// Show "No Tasks" if empty
function checkIfEmpty() {
  const tbody = document.querySelector("#taskTable tbody");
  const noTasksMessage = document.getElementById("noTasksMessage");
  noTasksMessage.style.display = tbody.children.length === 0 ? "block" : "none";
}

// Prevent past due dates
const taskDueInput = document.getElementById("taskDue");
const today = new Date().toISOString().split("T")[0];
taskDueInput.setAttribute("min", today);

// Loader
window.addEventListener("load", () => {
  const loader = document.getElementById("loader");
  setTimeout(() => {
    loader.style.opacity = "0";
    loader.style.transition = "opacity 0.5s ease";
    setTimeout(() => loader.style.display = "none", 500);
  }, 1200);
});

// Init
document.addEventListener("DOMContentLoaded", () => {
  updateStats();
  checkIfEmpty();
});

// ------------------- Delete Confirmation Modal -------------------
let taskToDelete = null;

// Open delete modal instead of confirm()
function removeTask(id) {
  taskToDelete = id;
  document.getElementById("deleteModal").style.display = "block";
}

// Confirm delete
document.getElementById("confirmDelete").onclick = () => {
  if (taskToDelete !== null) {
    const indexList = taskList.findIndex(t => t.id === taskToDelete);
    if (indexList > -1) {
      const task = taskList.splice(indexList, 1)[0];

      // ✅ Fix counters correctly
      if (task.status) {
        completed--;
      } else {
        inProgress--;
      }

      renderTasks();
      updateStats();
    }

    // Remove from data structures
    taskStack.stack = taskStack.stack.filter(t => t.id !== taskToDelete);
    taskQueue.queue = taskQueue.queue.filter(t => t.id !== taskToDelete);
    pq.items = pq.items.filter(t => t.id !== taskToDelete);

    // Remove from completed modal
    const completedRows = document.querySelectorAll("#completedModalBody tr");
    completedRows.forEach(row => {
      if (row.innerHTML.includes(`removeTask(${taskToDelete})`)) row.remove();
    });

    taskToDelete = null;
    document.getElementById("deleteModal").style.display = "none";
  }
};

// Cancel delete
document.getElementById("cancelDelete").onclick = () => {
  taskToDelete = null;
  document.getElementById("deleteModal").style.display = "none";
};

// Close when clicking outside modal
window.onclick = (e) => {
  const deleteModal = document.getElementById("deleteModal");
  if (e.target === deleteModal) {
    deleteModal.style.display = "none";
    taskToDelete = null;
  }
};
