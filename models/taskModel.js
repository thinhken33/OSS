const fs = require("fs/promises");
const path = require("path");

const DATA_DIR = path.join(__dirname, "..", "data");
const DATA_FILE = path.join(DATA_DIR, "tasks.json");

async function ensureDataFile() {
  await fs.mkdir(DATA_DIR, { recursive: true });

  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, "[]", "utf8");
  }
}

async function readTasks() {
  await ensureDataFile();
  const raw = await fs.readFile(DATA_FILE, "utf8");
  return JSON.parse(raw || "[]");
}

async function writeTasks(tasks) {
  await fs.writeFile(DATA_FILE, JSON.stringify(tasks, null, 2), "utf8");
}

async function getAllTasks() {
  return await readTasks();
}

async function getTaskById(id) {
  const tasks = await readTasks();
  return tasks.find((task) => task.id === id) || null;
}

async function addTask(newTask) {
  const tasks = await readTasks();
  tasks.unshift(newTask);
  await writeTasks(tasks);
  return newTask;
}

async function updateTask(id, updatedTask) {
  const tasks = await readTasks();
  const index = tasks.findIndex((task) => task.id === id);

  if (index === -1) {
    return null;
  }

  tasks[index] = updatedTask;
  await writeTasks(tasks);
  return updatedTask;
}

async function deleteTask(id) {
  const tasks = await readTasks();
  const filteredTasks = tasks.filter((task) => task.id !== id);

  if (filteredTasks.length === tasks.length) {
    return false;
  }

  await writeTasks(filteredTasks);
  return true;
}

module.exports = {
  getAllTasks,
  getTaskById,
  addTask,
  updateTask,
  deleteTask
};