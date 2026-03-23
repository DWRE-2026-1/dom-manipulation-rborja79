const taskForm = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");
const taskList = document.getElementById("task-list");
const taskCounter = document.getElementById("task-counter");
const clearCompletedBtn = document.getElementById("clear-completed-btn");
const selectAllBtn = document.getElementById("select-all-btn");
const clearSelectionBtn = document.getElementById("clear-selection-btn");
const completeSelectedBtn = document.getElementById("complete-selected-btn");
const uncompleteSelectedBtn = document.getElementById("uncomplete-selected-btn");
const deleteSelectedBtn = document.getElementById("delete-selected-btn");
const taskTemplate = document.getElementById("task-template");

const STORAGE_KEY = "react-class-todo-list";

let tasks = loadTasks();

renderTasks();
updateCounter();

taskForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const text = taskInput.value.trim();
    if (!text) return;

    const newTask = {
        id: crypto.randomUUID(),
        text,
        completed: false,
        selected: false
    };

    tasks.unshift(newTask);
    saveTasks();
    renderTasks();
    updateCounter();
    taskForm.reset();
    taskInput.focus();
});

clearCompletedBtn.addEventListener("click", () => {
    tasks = tasks.filter((task) => !task.completed);
    saveTasks();
    renderTasks();
    updateCounter();
});

selectAllBtn.addEventListener("click", () => {
    tasks = tasks.map((task) => ({ ...task, selected: true }));
    saveTasks();
    renderTasks();
});

clearSelectionBtn.addEventListener("click", () => {
    tasks = tasks.map((task) => ({ ...task, selected: false }));
    saveTasks();
    renderTasks();
});

completeSelectedBtn.addEventListener("click", () => {
    tasks = tasks.map((task) =>
        task.selected ? { ...task, completed: true } : task
    );
    saveTasks();
    renderTasks();
    updateCounter();
});

uncompleteSelectedBtn.addEventListener("click", () => {
    tasks = tasks.map((task) =>
        task.selected ? { ...task, completed: false } : task
    );
    saveTasks();
    renderTasks();
    updateCounter();
});

deleteSelectedBtn.addEventListener("click", () => {
    tasks = tasks.filter((task) => !task.selected);
    saveTasks();
    renderTasks();
    updateCounter();
});

function renderTasks() {
    taskList.innerHTML = "";

    tasks.forEach((task) => {
        const taskNode = taskTemplate.content.cloneNode(true);

        const item = taskNode.querySelector(".task-item");
        const card = taskNode.querySelector(".task-card");
        const selectCheckbox = taskNode.querySelector(".task-select");
        const textElement = taskNode.querySelector(".task-text");
        const editInput = taskNode.querySelector(".task-edit-input");
        const content = taskNode.querySelector(".task-content");
        const completeBtn = taskNode.querySelector(".complete-btn");
        const deleteBtn = taskNode.querySelector(".delete-btn");

        item.dataset.id = task.id;
        textElement.textContent = task.text;
        editInput.value = task.text;
        selectCheckbox.checked = task.selected;

        card.classList.toggle("completed", task.completed);
        card.classList.toggle("selected", task.selected);

        completeBtn.textContent = task.completed ? "Reactivar" : "Completar";
        completeBtn.classList.toggle("is-completed", task.completed);

        selectCheckbox.addEventListener("change", () => {
            updateTask(task.id, { selected: selectCheckbox.checked });
        });

        completeBtn.addEventListener("click", () => {
            updateTask(task.id, { completed: !task.completed });
            updateCounter();
        });

        deleteBtn.addEventListener("click", () => {
            tasks = tasks.filter((currentTask) => currentTask.id !== task.id);
            saveTasks();
            renderTasks();
            updateCounter();
        });

        content.addEventListener("dblclick", () => {
            startEditing(textElement, editInput);
        });

        content.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                event.preventDefault();
                startEditing(textElement, editInput);
            }
        });

        editInput.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                event.preventDefault();
                finishEditing(task.id, textElement, editInput);
            }

            if (event.key === "Escape") {
                cancelEditing(textElement, editInput, task.text);
            }
        });

        editInput.addEventListener("blur", () => {
            finishEditing(task.id, textElement, editInput);
        });

        taskList.appendChild(taskNode);
    });
}

function startEditing(textElement, editInput) {
    textElement.classList.add("hidden");
    editInput.classList.remove("hidden");
    editInput.focus();
    editInput.select();
}

function finishEditing(taskId, textElement, editInput) {
    const newValue = editInput.value.trim();

    if (!newValue) {
        const currentTask = tasks.find((task) => task.id === taskId);
        cancelEditing(textElement, editInput, currentTask?.text ?? "");
        return;
    }

    updateTask(taskId, { text: newValue });
    textElement.classList.remove("hidden");
    editInput.classList.add("hidden");
}

function cancelEditing(textElement, editInput, originalValue) {
    editInput.value = originalValue;
    textElement.classList.remove("hidden");
    editInput.classList.add("hidden");
}

function updateTask(taskId, updates) {
    tasks = tasks.map((task) =>
        task.id === taskId ? { ...task, ...updates } : task
    );
    saveTasks();
    renderTasks();
}

function updateCounter() {
    const pendingTasks = tasks.filter((task) => !task.completed).length;
    taskCounter.textContent =
        pendingTasks === 1
            ? "1 tarea pendiente"
            : `${pendingTasks} tareas pendientes`;
}

function saveTasks() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function loadTasks() {
    const savedTasks = localStorage.getItem(STORAGE_KEY);
    if (!savedTasks) return [];

    try {
        return JSON.parse(savedTasks);
    } catch {
        return [];
    }
}