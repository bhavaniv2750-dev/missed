
const $ = (id) => document.getElementById(id);
let currentFindings = [];

$("chatFile").addEventListener("change", analyzeSelectedFile);
$("analyzeBtn").addEventListener("click", analyzeReviewedConversation);
$("urgencyFilter").addEventListener("change", renderFilteredFindings);

async function analyzeSelectedFile(event) {
  const chatFile = event.currentTarget;
  const fileStatus = $("fileStatus");
  const file = chatFile.files?.[0];
  if (!file) return;
  chatFile.value = "";
  $("reviewArea").classList.add("hidden");
  $("analyzeBtn").disabled = true;
  $("chatInput").value = "";

  if (file.size > 2 * 1024 * 1024) {
    fileStatus.textContent = "File too large. Choose a TXT file under 2 MB.";
    return;
  }

  try {
    fileStatus.textContent = "Reading conversation...";

    const text = await file.text();

    if (!text.trim()) {
      fileStatus.textContent = "This file contains no readable messages.";
      return;
    }

    const messages = parseMessages(text);

    if (!messages.length) {
      fileStatus.textContent = "No messages found in this file.";
      return;
    }

    $("chatInput").value = formatMessages(messages);
    $("reviewArea").classList.remove("hidden");
    $("analyzeBtn").disabled = false;
    fileStatus.textContent =
      `${messages.length} messages parsed from ${file.name}. Review them, then analyze.`;
  } catch (error) {
    fileStatus.textContent =
      "Could not read this file. Please try a plain-text TXT export.";
    console.error("Failed to analyze conversation file.", error);
  }
}

function analyzeReviewedConversation() {
  const text = $("chatInput").value.trim();
  if (!text) {
    $("fileStatus").textContent = "Add or import conversation messages before analyzing.";
    $("chatInput").focus();
    return;
  }

  const messages = parseMessages(text);
  if (!messages.length) {
    $("fileStatus").textContent = "No messages found in this conversation.";
    return;
  }

  $("fileStatus").textContent = `Analyzing ${messages.length} messages...`;
  const findings = extractFindings(messages);
  const changes = detectChanges(messages);
  renderResults(findings, messages.length, changes);
  $("fileStatus").textContent =
    `Analysis complete · ${messages.length} messages processed locally`;
}

function formatMessages(messages) {
  return messages
    .map(message => {
      if (!message.time) return message.text;
      return `[${message.time}] ${message.sender}: ${message.text}`;
    })
    .join("\n\n");
}

function parseMessages(text) {
  const lines = text.replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n").split("\n");
  const messagePatterns = [
    /^\[([^\]]+)\]\s*([^:]+):\s*(.*)$/,
    /^(\d{1,2}[/-]\d{1,2}[/-]\d{2,4},?\s+\d{1,2}:\d{2}(?:\s?[AP]M)?)\s+-\s+([^:]+):\s*(.*)$/i,
    /^(\d{4}-\d{1,2}-\d{1,2}[, ]+\d{1,2}:\d{2}(?::\d{2})?)\s+-\s+([^:]+):\s*(.*)$/,
    /^(\d{1,2}:\d{2}(?:\s?[AP]M)?)\s+-\s+([^:]+):\s*(.*)$/i
  ];
  const messages = [];
  let parsedHeaders = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const match = messagePatterns
      .map(pattern => trimmed.match(pattern))
      .find(Boolean);

    if (match) {
      messages.push({
        id: messages.length,
        time: match[1],
        sender: match[2].trim(),
        text: match[3]
      });
      parsedHeaders++;
    } else if (messages.length) {
      messages[messages.length - 1].text += `\n${trimmed}`;
    } else {
      messages.push({
        id: messages.length,
        time: "",
        sender: "Unknown sender",
        text: trimmed
      });
    }
  }

  if (parsedHeaders === 0) {
    return lines
      .map(line => line.trim())
      .filter(Boolean)
      .map((line, index) => ({
        id: index,
        time: "",
        sender: "Unknown sender",
        text: line
      }));
  }

  return messages;
}

function detectChanges(messages) {
  const changeAlerts = [];

  for (let i = 0; i < messages.length; i++) {
    const current = messages[i].text;

    const isUpdate =
      /\b(update|correction|moved to|changed to|instead of|ignore the earlier)\b/i
        .test(current);

    if (!isUpdate) continue;

    const topic = inferTopic(current);
    if (!topic) continue;

    const previous = messages
      .slice(0, i)
      .filter(m => inferTopic(m.text) === topic);

    if (previous.length) {
      changeAlerts.push({
        topic,
        oldMessage: previous[previous.length - 1].text,
        newMessage: current
      });
    }
  }

  return changeAlerts;
}

function extractFindings(messages) {
  const findings = [];
  const changedTopics = new Set();

  // Pass 1: detect changes before processing earlier messages.
  for (const m of messages) {
    if (/\b(update|updated|correction|corrected|instead|moved|changed|no longer|ignore the earlier|not \d)/i.test(m.text)) {
      const topic = inferTopic(m.text);
      if (topic) changedTopics.add(topic);
    }
  }

  // Pass 2: classify messages.
  for (const m of messages) {
    const t = m.text;
    const topic = inferTopic(t);
    let type = "";
    let title = "";
    let priority = "followup";
    let reason = "";
    let action = false;

    if (/\b(ignore the earlier|instead of|not \d|moved to|changed to|update:|correction:|no longer)\b/i.test(t)) {
      type = "changed";
      title = "Decision or detail changed";
      priority = "critical";
      reason = "This message may supersede an earlier instruction. Verify the latest value.";
      action = true;
    } else if (/\b(deadline|due by|submit by|upload by|closes at|before \d|by \d|due today)\b/i.test(t)) {
      type = "deadline";
      title = "Deadline or time-sensitive requirement";
      priority = /\b(today|urgent|closes|deadline)\b/i.test(t)
        ? "critical" : "important";
      reason = "A time-sensitive requirement was mentioned. Confirm its exact deadline.";
      action = true;
    } else if (/\b(can someone|who is|who's|anyone know|please confirm|can you confirm|are they ready|checking in|did you)\b/i.test(t)) {
      type = "question";
      title = "Question or reply may be pending";
      priority = "important";
      reason = "Check whether this request has been answered later in the conversation.";
      action = true;
    } else if (/\b(i will|i'll|i can|i promise|i shall|i am going to)\b/i.test(t)) {
      type = "commitment";
      title = "Commitment or promised task";
      priority = "followup";
      reason = "A person has offered or promised to do something. Track completion if relevant.";
      action = true;
    } else if (/\b(please|must|required|need to|don't forget|do not forget)\b/i.test(t)) {
      type = "request";
      title = "Action requested";
      priority = "important";
      reason = "This message contains a request or requirement.";
      action = true;
    } else {
      continue;
    }

    // Acknowledge obvious completion/follow-up messages.
    if (/\b(done|completed|fixed|sent them|attaching them now|looks good now|submitted)\b/i.test(t)) {
      priority = "followup";
      title = "Completion update";
      reason = "This appears to report progress or completion. Verify if needed.";
    }

    // Do not treat a superseded deadline as the latest value.
    if (type === "deadline" && topic && changedTopics.has(topic)) {
      if (!/\b(update|correction|changed|instead|moved|not \d|closes at)\b/i.test(t)) {
        priority = "followup";
        reason = "A later message may have changed this detail. Check the newer message.";
      }
    }

    findings.push({
      ...m, type, title, priority, reason, action, topic
    });
  }

  // Remove duplicate cards for identical source text.
  const unique = [...new Map(
    findings.map(f => [f.text, f])
  ).values()];

  const rank = { critical: 0, important: 1, followup: 2 };
  unique.sort((a, b) => rank[a.priority] - rank[b.priority]);

  return unique;
}

function inferTopic(text) {
  const t = text.toLowerCase();
  if (/report|pdf|portal|submission/.test(t)) return "report";
  if (/meeting|review|lab \d/.test(t)) return "meeting";
  if (/slide|presentation/.test(t)) return "presentation";
  if (/demo video|video requirements/.test(t)) return "demo";
  if (/test results|testing/.test(t)) return "testing";
  if (/venue|hall/.test(t)) return "venue";
  return "";
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function renderResults(findings, messageCount, changeAlerts = []) {
  $("emptyState").classList.add("hidden");
  $("summaryStats").classList.remove("hidden");
  $("status").textContent = "Analysis complete";

  const urgent = findings.filter(f => f.priority === "critical").length;
  const actions = findings.filter(f => f.action).length;

  $("summaryStats").innerHTML = `
    <div class="stat"><strong>${messageCount}</strong><span>Messages scanned</span></div>
    <div class="stat"><strong>${findings.length}</strong><span>Findings</span></div>
    <div class="stat"><strong>${urgent}</strong><span>High-priority flags</span></div>
  `;
  currentFindings = findings;
  $("urgencyFilterContainer").classList.remove("hidden");

  $("changesSection").classList.toggle(
    "hidden", changeAlerts.length === 0
  );

  $("changesList").innerHTML = changeAlerts.map(change => `
    <div class="result-card critical">
      <span class="tag">POSSIBLE CHANGE · ${escapeHTML(change.topic)}</span>
      <p><strong>Earlier:</strong> ${escapeHTML(change.oldMessage)}</p>
      <p><strong>Latest:</strong> ${escapeHTML(change.newMessage)}</p>
      <p>Verify that the latest instruction replaces the earlier one.</p>
    </div>
  `).join("");

  renderFilteredFindings();
}

function renderFilteredFindings() {
  const priority = $("urgencyFilter").value;
  const findings = priority === "all"
    ? currentFindings
    : currentFindings.filter(f => f.priority === priority);

  $("results").innerHTML = findings.length
    ? findings.map((f, i) => `
    <article class="result-card ${f.priority}">
      <div class="result-top">
        <div>
          <span class="tag">${escapeHTML(f.type)} · ${escapeHTML(f.priority)}</span>
          <h3>${escapeHTML(f.title)}</h3>
        </div>
        <span class="tag">${escapeHTML(f.time)}</span>
      </div>
      <p>${escapeHTML(f.reason)}</p>
      <div class="evidence">
        <strong>Source evidence</strong><br>
        ${escapeHTML(f.sender)}: ${escapeHTML(f.text)}
      </div>
      <button class="complete-btn" data-index="${i}">
        Mark as handled ✓
      </button>
    </article>
    `).join("")
    : `<p class="filter-empty">No ${escapeHTML(priority)} findings.</p>`;

  document.querySelectorAll(".complete-btn").forEach(button => {
    button.addEventListener("click", () => {
      const card = button.closest(".result-card");
      card.classList.toggle("done");
      const done = card.classList.contains("done");
      button.textContent = done ? "Handled ✓" : "Mark as handled ✓";
    });
  });
}
