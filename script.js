// ===============================
// script.js
// ===============================

// Local storage key
const STORAGE_KEY = "notices";
let notices = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notices));
}

function render(data = notices) {
  const tbody = document.querySelector("#noticeTable tbody");
  const emptyMsg = document.getElementById("emptyMsg");
  tbody.innerHTML = "";

  if (data.length === 0) {
    emptyMsg.style.display = "block";
    return;
  }
  emptyMsg.style.display = "none";

  data.forEach((n, i) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><input type="checkbox" class="selectRow" data-index="${i}"></td>
      <td data-label="Title">${n.title}</td>
      <td data-label="Dept">${n.department}</td>
      <td data-label="Date">${n.date || "-"}</td>
      <td data-label="Tags">${n.tags || "-"}</td>
      <td data-label="Files">${n.files?.length || 0}</td>
      <td data-label="Action"><button class="action-btn" onclick="removeNotice(${i})">🗑 Remove</button></td>
    `;
    tbody.appendChild(tr);
  });
}

// Add notice
document.getElementById("noticeForm").addEventListener("submit", async e => {
  e.preventDefault();
  const title = document.getElementById("title").value.trim();
  const department = document.getElementById("department").value;
  const date = document.getElementById("date").value;
  const tags = document.getElementById("tags").value.trim();
  const content = document.getElementById("content").value.trim();
  const files = document.getElementById("attachment").files;

  let fileData = [];
  for (let f of files) {
    const base64 = await toBase64(f);
    fileData.push({ name: f.name, size: f.size, type: f.type, data: base64 });
  }

  notices.push({ title, department, date, tags, content, files: fileData });
  save();
  render();
  e.target.reset();
});

function toBase64(file) {
  return new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onload = () => res(reader.result);
    reader.onerror = err => rej(err);
    reader.readAsDataURL(file);
  });
}

// Remove notice
function removeNotice(i) {
  if (confirm("Remove this notice?")) {
    notices.splice(i, 1);
    save();
    render();
  }
}

// Clear all
document.getElementById("clearAll").addEventListener("click", () => {
  if (confirm("Clear ALL notices?")) {
    notices = [];
    save();
    render();
  }
});

// Search filter
document.getElementById("search").addEventListener("input", e => {
  const q = e.target.value.toLowerCase();
  const filtered = notices.filter(
    n =>
      n.title.toLowerCase().includes(q) ||
      n.tags.toLowerCase().includes(q) ||
      n.department.toLowerCase().includes(q)
  );
  render(filtered);
});

// Select all checkbox
document.getElementById("selectAll").addEventListener("change", e => {
  document.querySelectorAll(".selectRow").forEach(cb => (cb.checked = e.target.checked));
});

// Pack selected
document.getElementById("packSelected").addEventListener("click", () => {
  const selected = Array.from(document.querySelectorAll(".selectRow:checked"))
    .map(cb => notices[cb.dataset.index]);

  if (selected.length === 0) {
    alert("Select at least one notice to pack.");
    return;
  }
  downloadJSON(selected, "selected_notices.json");
});

// Export all
document.getElementById("exportAll").addEventListener("click", () => {
  if (notices.length === 0) {
    alert("No notices to export.");
    return;
  }
  downloadJSON(notices, "all_notices.json");
});

function downloadJSON(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// Initial render
render();
