let drafts = [];
let currentDraft = null;

async function loadDrafts() {
  const response = await fetch("/drafts");
  const data = await response.json();

  drafts = data.drafts || [];

  renderConversationList();

  if (drafts.length > 0) {
    selectDraft(drafts[0].id);
  } else {
    document.getElementById("content").innerHTML = `
      <div class="empty">
        No drafts available.
      </div>
    `;
  }
}

function renderConversationList() {
  const container =
    document.getElementById("conversationList");

  if (drafts.length === 0) {
    container.innerHTML = `
      <div class="empty-small">
        No conversations.
      </div>
    `;
    return;
  }

  container.innerHTML = drafts.map(draft => `
    <div
      class="conversation ${
        currentDraft?.id === draft.id ? "selected" : ""
      }"
      onclick="selectDraft('${draft.id}')"
    >
      <strong>
        ${escapeHtml(draft.email?.from || "Unknown sender")}
      </strong>

      <small>
        ${escapeHtml(
          draft.email?.subject || "No subject"
        )}
      </small>
    </div>
  `).join("");
}

function selectDraft(id) {
  currentDraft = drafts.find(
    draft => draft.id === id
  );

  if (!currentDraft) return;

  renderConversationList();
  renderDraft();
}

function renderDraft() {
  const email = currentDraft.email || {};

  document.getElementById("panelTitle").textContent =
    email.subject || "Inbox message";

  document.getElementById("panelSubtitle").textContent =
    email.from || "Unknown sender";

  document.getElementById("content").innerHTML = `
    <div class="message-user">
      ${escapeHtml(email.body || "")}
    </div>

    <div class="message-ai">
      <strong>AI Knowledge Assistant</strong>

      <pre>${escapeHtml(
        currentDraft.answer || ""
      )}</pre>
    </div>
  `;

  document.getElementById("detailFrom").textContent =
    email.from || "—";

  document.getElementById("detailSubject").textContent =
    email.subject || "—";

  document.getElementById("detailStatus").textContent =
    currentDraft.status || "—";

  renderSources(currentDraft.sources || []);
}

function renderSources(sources) {
  const container =
    document.getElementById("sources");

  if (!sources.length) {
    container.innerHTML = `
      <div class="empty-small">
        No sources available.
      </div>
    `;
    return;
  }

  container.innerHTML = sources.map(source => `
    <div class="source">
      <strong>${escapeHtml(source.title)}</strong>

      <div>
        ${escapeHtml(
          source.category || "Knowledge Base"
        )}
      </div>

      <a
        href="${source.url}"
        target="_blank"
      >
        Open source ↗
      </a>
    </div>
  `).join("");
}

async function approveCurrent() {
  if (!currentDraft) return;

  const response = await fetch(
    `/drafts/${currentDraft.id}/approve`,
    {
      method: "POST"
    }
  );

  const data = await response.json();

  if (!response.ok) {
    alert(data.error || "Approval failed");
    return;
  }

  updateDraftInMemory(data.draft);

  alert("Draft approved.");
}

async function rejectCurrent() {
  if (!currentDraft) return;

  const response = await fetch(
    `/drafts/${currentDraft.id}/reject`,
    {
      method: "POST"
    }
  );

  const data = await response.json();

  if (!response.ok) {
    alert(data.error || "Rejection failed");
    return;
  }

  updateDraftInMemory(data.draft);

  alert("Draft rejected.");
}

async function editCurrent() {
  if (!currentDraft) return;

  const aiMessage = document.querySelector(".message-ai");

  if (!aiMessage) return;

  aiMessage.innerHTML = `
    <strong>Edit AI Response</strong>

    <textarea
      id="editAnswer"
      class="edit-textarea"
    >${escapeHtml(currentDraft.answer || "")}</textarea>

    <div class="edit-actions">
      <button
        class="action primary"
        onclick="saveEditedDraft()"
      >
        ✓ Save Changes
      </button>

      <button
        class="action"
        onclick="cancelEdit()"
      >
        Cancel
      </button>
    </div>
  `;

  const textarea = document.getElementById("editAnswer");

  if (textarea) {
    textarea.focus();
    textarea.setSelectionRange(
      textarea.value.length,
      textarea.value.length
    );
  }
}

function cancelEdit() {
  renderDraft();
}

async function saveEditedDraft() {
  if (!currentDraft) return;

  const textarea =
    document.getElementById("editAnswer");

  if (!textarea) return;

  const answer = textarea.value.trim();

  if (!answer) {
    alert("Response cannot be empty.");
    return;
  }

  const response = await fetch(
    `/drafts/${currentDraft.id}/edit`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ answer })
    }
  );

  const data = await response.json();

  if (!response.ok) {
    alert(data.error || "Edit failed");
    return;
  }

  updateDraftInMemory(data.draft);

  alert("Draft saved.");
}

function escalateCurrent() {
  if (!currentDraft) {
    alert("Select a draft first.");
    return;
  }

  alert(
    "Escalation recorded for human review."
  );
}

function updateDraftInMemory(updatedDraft) {
  drafts = drafts.map(draft =>
    draft.id === updatedDraft.id
      ? updatedDraft
      : draft
  );

  currentDraft = updatedDraft;

  renderConversationList();
  renderDraft();
}

function showSection(section) {
  if (section === "chat") {
    showChat();
    return;
  }

  if (section === "drafts" || section === "inbox") {
    loadDrafts();
  }
}

function showChat() {
  document.getElementById("panelTitle").textContent =
    "Knowledge Chat";

  document.getElementById("panelSubtitle").textContent =
    "Ask Task 1 Knowledge Brain";

  document.getElementById("content").innerHTML = `
    <div id="chatMessages">
      <div class="message-ai">
        Hello! Ask me a question about the
        Brilliant Directories knowledge base.
      </div>
    </div>

    <div class="chat-input">
      <textarea
        id="chatQuestion"
        placeholder="Type a message or ask a question..."
      ></textarea>

      <button
        class="send-btn"
        onclick="sendQuestion()"
      >
        Send
      </button>
    </div>
  `;

  document.getElementById("sources").innerHTML = `
    <div class="empty-small">
      Sources will appear after a question.
    </div>
  `;
}

async function sendQuestion() {
  const input =
    document.getElementById("chatQuestion");

  if (!input || !input.value.trim()) {
    return;
  }

  const question = input.value.trim();

  const messages =
    document.getElementById("chatMessages");

  messages.innerHTML += `
    <div class="message-user">
      ${escapeHtml(question)}
    </div>
  `;

  input.value = "";

  messages.innerHTML += `
    <div class="message-ai" id="loading">
      Searching the knowledge base...
    </div>
  `;

  const response = await fetch("/query", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      query: question
    })
  });

  const data = await response.json();

  document.getElementById("loading")?.remove();

  messages.innerHTML += `
    <div class="message-ai">
      <pre>${escapeHtml(
        data.answer || "No answer available."
      )}</pre>
    </div>
  `;

  renderSources(data.sources || []);
}

function filterDrafts() {
  const search =
    document.getElementById("search").value
      .toLowerCase();

  document.querySelectorAll(".conversation")
    .forEach(item => {
      item.style.display =
        item.textContent
          .toLowerCase()
          .includes(search)
          ? "block"
          : "none";
    });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

loadDrafts();
