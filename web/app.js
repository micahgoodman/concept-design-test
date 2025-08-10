const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

async function fetchJSON(url, opts = {}) {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...opts,
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  const text = await res.text();
  return text ? JSON.parse(text) : undefined;
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleString();
}

async function loadRequests() {
  const list = await fetchJSON("/api/requests");
  renderRequests(Array.isArray(list) ? list : []);
}

function renderRequests(items) {
  const container = $("#requests");
  container.innerHTML = "";
  const tpl = $("#card-template");
  items.forEach((it) => {
    const node = tpl.content.firstElementChild.cloneNode(true);
    $(".title", node).textContent = it.title;
    $(".description", node).textContent = it.description;
    $(".badge", node).textContent = it.status;
    $(".badge", node).classList.toggle("closed", it.status === "CLOSED");
    $(".meta", node).textContent = `${it.owner} • ${formatDate(it.createdAt)}`;

    const closeBtn = $(".close", node);
    closeBtn.disabled = it.status === "CLOSED";
    closeBtn.addEventListener("click", async () => {
      try {
        await fetchJSON(`/api/requests/${it.request}/close`, { method: "POST" });
        await loadRequests();
      } catch (e) {
        alert(`Failed to close: ${e.message}`);
      }
    });

    const delBtn = $(".delete", node);
    delBtn.addEventListener("click", async () => {
      if (!confirm("Delete this request?")) return;
      try {
        await fetchJSON(`/api/requests/${it.request}`, { method: "DELETE" });
        await loadRequests();
      } catch (e) {
        alert(`Failed to delete: ${e.message}`);
      }
    });

    container.appendChild(node);
  });
}

function wireForm() {
  const form = $("#create-form");
  form.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    const title = $("#title").value.trim();
    const description = $("#description").value.trim();
    if (!title || !description) return;
    try {
      await fetchJSON("/api/requests", {
        method: "POST",
        body: JSON.stringify({ title, description }),
      });
      form.reset();
      await loadRequests();
    } catch (e) {
      alert(`Failed to create: ${e.message}`);
    }
  });
}

window.addEventListener("DOMContentLoaded", async () => {
  wireForm();
  await loadRequests();
});
