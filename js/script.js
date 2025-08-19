// ------------------- Global Variables -------------------
let taskCounter = 1;                  // Unique ID for tasks
let inProgress = 0, completed = 0;    // Counters for task stats

// Priority mapping (lower = higher priority)
const priorityOrder = { High: 1, Medium: 2, Low: 3 };

// ------------------- Data Structures -------------------

// Stack (LIFO)
class TaskStack {
  constructor() { this.stack = []; }
  push(task) { this.stack.push(task); }
  pop() { return this.stack.pop(); }
}

// Queue (FIFO)
class TaskQueue {
  constructor() { this.queue = []; }
  enqueue(task) { this.queue.push(task); }
  dequeue() { return this.queue.shift(); }
}

// Priority Queue (sorted by priority)
class PriorityQueue {
  constructor() { this.items = []; }
  enqueue(task) {
    this.items.push(task);
    this.items.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  }
  dequeue() { return this.items.shift(); }
}

// Instances
let taskStack = new TaskStack();
let taskQueue = new TaskQueue();
let pq = new PriorityQueue();
let taskList = []; // Master list of all tasks

// ------------------- Core Functions -------------------

// Update stats at the top
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
    added: Date.now(), // timestamp
    due,
    priority,
    status: false // false = not completed
  };

  // Add into all data structures
  taskStack.push(task);
  taskQueue.enqueue(task);
  pq.enqueue(task);

  // Stack behavior: insert at the start of list
  taskList.unshift(task);

  inProgress++;
  renderTasks();
}

// Render all tasks into the table
function renderTasks() {
  const tbody = document.querySelector("#taskTable tbody");
  tbody.innerHTML = "";

  taskList.forEach((t, i) => {
    if (!t.status) {
      const row = document.createElement("tr");
      const addedDate = new Date(t.added).toISOString().split("T")[0];
      row.innerHTML = `
        <td><input type="checkbox" onchange="moveToCompleted(this, ${i})"></td>
        <td>${t.name}</td>
        <td>${t.desc}</td>
        <td>${t.due}</td>
        <td>${addedDate}</td>
        <td class="priority-${t.priority}">${t.priority}</td>
        <td style="text-align:center;">
          <button class="remove-btn" onclick="removeTask(${t.id})">×</button>
        </td>
      `;
      tbody.appendChild(row);
    }
  });

  updateStats();
}

// Move task to Completed list
function moveToCompleted(checkbox, index) {
  if (checkbox.checked) {
    const task = taskList[index];
    task.status = true;
    completed++;
    inProgress--;

    // Clone into Completed Modal
    const clone = document.createElement("tr");
    const addedDate = new Date(task.added).toISOString().split("T")[0];
    clone.innerHTML = `
      <td>${task.name}</td>
      <td>${task.desc}</td>
      <td>${task.due}</td>
      <td>${addedDate}</td>
      <td class="priority-${task.priority}">${task.priority}</td>
      <td style="text-align:center;">
        <button class="remove-btn" onclick="removeTask(${task.id})">×</button>
      </td>
    `;
    document.getElementById("completedModalBody").appendChild(clone);

    renderTasks();
  }
}

// Remove a task everywhere
function removeTask(id) {
  // Remove from master list
  const indexList = taskList.findIndex(t => t.id === id);
  if (indexList > -1) {
    const task = taskList.splice(indexList, 1)[0];
    if (!task.status) inProgress--;
    renderTasks();
    updateStats();
  }

  // Remove from data structures
  taskStack.stack = taskStack.stack.filter(t => t.id !== id);
  taskQueue.queue = taskQueue.queue.filter(t => t.id !== id);
  pq.items = pq.items.filter(t => t.id !== id);

  // Remove from Completed Modal
  document.querySelectorAll("#completedModalBody tr").forEach(row => {
    if (row.innerHTML.includes(`removeTask(${id})`)) row.remove();
  });
}

// Sort by priority
function sortByPriority() {
  taskList = [...pq.items].filter(t => !t.status);
  renderTasks();
}

// Sort by date added (always by timestamp ascending, no toggle)
function sortByAdded() {
  taskList.sort((a, b) => a.added - b.added);
  renderTasks();
}

// Show completed tasks in modal
function toggleCompleted() {
  const completedModal = document.getElementById("completedModal");
  const completedModalBody = document.getElementById("completedModalBody");
  completedModalBody.innerHTML = "";

  taskList.forEach(t => {
    if (t.status) {
      const addedDate = new Date(t.added).toISOString().split("T")[0];
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${t.name}</td>
        <td>${t.desc}</td>
        <td>${t.due}</td>
        <td>${addedDate}</td>
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

// ------------------- Modal & Form Logic -------------------

// Add Task Modal
const modal = document.getElementById("taskModal");
const span = document.querySelector(".close");
const form = document.getElementById("taskForm");

function openTaskDialog() { modal.style.display = "block"; }
span.onclick = () => modal.style.display = "none";
window.onclick = (e) => { if (e.target === modal) modal.style.display = "none"; }

// Form submission
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

// Close Completed Modal
document.getElementById("completedClose").onclick = () => {
  document.getElementById("completedModal").style.display = "none";
};
window.addEventListener("click", (e) => {
  const completedModal = document.getElementById("completedModal");
  if (e.target === completedModal) completedModal.style.display = "none";
});

// Prevent selecting past due dates
const taskDueInput = document.getElementById("taskDue");
const today = new Date().toISOString().split("T")[0];
taskDueInput.setAttribute("min", today);

// Loader animation
window.addEventListener("load", () => {
  const loader = document.getElementById("loader");
  setTimeout(() => {
    loader.style.opacity = "0";
    loader.style.transition = "opacity 0.5s ease";
    setTimeout(() => loader.style.display = "none", 500);
  }, 1200);
});

// Initialize stats
updateStats();
