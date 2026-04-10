const STORAGE_KEY = 'braindump-entries';
const THEME_KEY = 'braindump-theme';
const input = document.getElementById('input');
const addBtn = document.getElementById('addBtn');
const entriesEl = document.getElementById('entries');
const themeToggle = document.getElementById('themeToggle');

let memoryStore = null;
let storageAvailable = true;
try {
  const t = '__test__';
  localStorage.setItem(t, t);
  localStorage.removeItem(t);
} catch {
  storageAvailable = false;
  memoryStore = [];
}

function loadEntries() {
  if (!storageAvailable) return memoryStore;
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveEntries(entries) {
  if (!storageAvailable) {
    memoryStore = entries;
    return;
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch (e) {
    storageAvailable = false;
    memoryStore = entries;
  }
}

function formatDate(ts) {
  const d = new Date(ts);
  return d.toLocaleString('sk-SK', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

function render() {
  const entries = loadEntries();
  if (entries.length === 0) {
    entriesEl.innerHTML = '<div class="empty">Zatial ziadne poznamky</div>';
    return;
  }
  entriesEl.innerHTML = '';
  entries.forEach(entry => {
    const div = document.createElement('div');
    div.className = 'entry';

    const text = document.createElement('div');
    text.className = 'entry-text';
    text.textContent = entry.text;

    const date = document.createElement('div');
    date.className = 'entry-date';
    date.textContent = formatDate(entry.createdAt);

    const del = document.createElement('button');
    del.className = 'delete-btn';
    del.textContent = '×';
    del.title = 'Zmazat';
    del.onclick = () => deleteEntry(entry.id);

    div.appendChild(text);
    div.appendChild(date);
    div.appendChild(del);
    entriesEl.appendChild(div);
  });
}

function addEntry() {
  const text = input.value.trim();
  if (!text) return;
  const entries = loadEntries();
  entries.unshift({
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
    text,
    createdAt: Date.now()
  });
  saveEntries(entries);
  input.value = '';
  render();
  input.focus();
}

function deleteEntry(id) {
  const entries = loadEntries().filter(e => e.id !== id);
  saveEntries(entries);
  render();
}

function getStoredTheme() {
  try { return localStorage.getItem(THEME_KEY); } catch { return null; }
}
function setStoredTheme(theme) {
  try { localStorage.setItem(THEME_KEY, theme); } catch {}
}
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
}

const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
const initialTheme = getStoredTheme() || (prefersDark ? 'dark' : 'light');
applyTheme(initialTheme);

themeToggle.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  setStoredTheme(next);
});

addBtn.addEventListener('click', addEntry);
input.addEventListener('keydown', e => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') addEntry();
});

render();
