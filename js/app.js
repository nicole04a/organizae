const STORAGE_KEY = 'organizae_tarefas';

let tasks = [];
let currentFilter = 'todas';
let editingId = null;

const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const taskPriority = document.getElementById('task-priority');
const submitBtn = document.getElementById('submit-btn');
const cancelBtn = document.getElementById('cancel-btn');
const feedbackEl = document.getElementById('feedback');

const taskList = document.getElementById('task-list');
const emptyMessage = document.getElementById('empty-message');
const filterButtons = document.querySelectorAll('.filter-btn');

const countTotal = document.getElementById('count-total');
const countPending = document.getElementById('count-pending');
const countCompleted = document.getElementById('count-completed');

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function loadTasks() {
  const data = localStorage.getItem(STORAGE_KEY);
  if (data) {
    tasks = JSON.parse(data);
  }
}

function showFeedback(message) {
  feedbackEl.textContent = message;
}

function updateCounters() {
  let completed = 0;

  for (let i = 0; i < tasks.length; i++) {
    if (tasks[i].completed) {
      completed++;
    }
  }

  countTotal.textContent = tasks.length;
  countCompleted.textContent = completed;
  countPending.textContent = tasks.length - completed;
}

function renderTasks() {
  updateCounters();
  taskList.innerHTML = '';

  const filtered = [];
  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];
    if (currentFilter === 'todas') {
      filtered.push(task);
    } else if (currentFilter === 'pendentes' && !task.completed) {
      filtered.push(task);
    } else if (currentFilter === 'concluidas' && task.completed) {
      filtered.push(task);
    }
  }

  if (filtered.length === 0) {
    emptyMessage.style.display = 'block';
    return;
  }

  emptyMessage.style.display = 'none';

  for (let i = 0; i < filtered.length; i++) {
    const task = filtered[i];

    const li = document.createElement('li');
    li.className = 'task-item ' + task.priority;
    if (task.completed) {
      li.classList.add('completed');
    }

    const leftDiv = document.createElement('div');
    leftDiv.className = 'task-left';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.completed;
    checkbox.onchange = function () {
      toggleTask(task.id);
    };

    const titleSpan = document.createElement('span');
    titleSpan.className = 'task-title';
    titleSpan.textContent = task.title;

    const prioritySpan = document.createElement('span');
    prioritySpan.className = 'priority-label';
    prioritySpan.textContent = task.priority;

    leftDiv.appendChild(checkbox);
    leftDiv.appendChild(titleSpan);
    leftDiv.appendChild(prioritySpan);

    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'task-actions';

    const editBtn = document.createElement('button');
    editBtn.type = 'button';
    editBtn.className = 'action-btn';
    editBtn.textContent = 'Editar';
    editBtn.onclick = function () {
      startEdit(task.id);
    };

    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'action-btn delete';
    deleteBtn.textContent = 'Excluir';
    deleteBtn.onclick = function () {
      deleteTask(task.id);
    };

    actionsDiv.appendChild(editBtn);
    actionsDiv.appendChild(deleteBtn);

    li.appendChild(leftDiv);
    li.appendChild(actionsDiv);
    taskList.appendChild(li);
  }
}

function toggleTask(id) {
  for (let i = 0; i < tasks.length; i++) {
    if (tasks[i].id === id) {
      tasks[i].completed = !tasks[i].completed;
      break;
    }
  }
  saveTasks();
  renderTasks();
  showFeedback('Status da tarefa atualizado.');
}

function startEdit(id) {
  for (let i = 0; i < tasks.length; i++) {
    if (tasks[i].id === id) {
      editingId = id;
      taskInput.value = tasks[i].title;
      taskPriority.value = tasks[i].priority;
      submitBtn.textContent = 'Salvar';
      cancelBtn.hidden = false;
      taskInput.focus();
      showFeedback('Editando tarefa...');
      break;
    }
  }
}

function cancelEdit() {
  editingId = null;
  taskInput.value = '';
  taskPriority.value = 'media';
  submitBtn.textContent = 'Adicionar';
  cancelBtn.hidden = true;
  showFeedback('');
}

function deleteTask(id) {
  const confirmed = confirm('Deseja realmente excluir esta tarefa?');
  if (!confirmed) return;

  const newList = [];
  for (let i = 0; i < tasks.length; i++) {
    if (tasks[i].id !== id) {
      newList.push(tasks[i]);
    }
  }

  tasks = newList;
  if (editingId === id) {
    cancelEdit();
  }

  saveTasks();
  renderTasks();
  showFeedback('Tarefa excluída.');
}

taskForm.onsubmit = function (event) {
  event.preventDefault();

  const title = taskInput.value.trim();
  const priority = taskPriority.value;

  if (title === '') return;

  if (editingId !== null) {
    for (let i = 0; i < tasks.length; i++) {
      if (tasks[i].id === editingId) {
        tasks[i].title = title;
        tasks[i].priority = priority;
        break;
      }
    }
    cancelEdit();
    showFeedback('Tarefa atualizada com sucesso!');
  } else {
    const newTask = {
      id: Date.now(),
      title: title,
      priority: priority,
      completed: false
    };
    tasks.push(newTask);
    taskInput.value = '';
    showFeedback('Tarefa adicionada com sucesso!');
  }

  saveTasks();
  renderTasks();
};

cancelBtn.onclick = function () {
  cancelEdit();
};

for (let i = 0; i < filterButtons.length; i++) {
  filterButtons[i].onclick = function () {
    for (let j = 0; j < filterButtons.length; j++) {
      filterButtons[j].classList.remove('active');
    }
    this.classList.add('active');
    currentFilter = this.getAttribute('data-filter');
    renderTasks();
  };
}

loadTasks();
renderTasks();