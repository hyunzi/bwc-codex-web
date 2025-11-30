const form = document.getElementById("quote-form");
const list = document.getElementById("quotes");
const shareOutput = document.getElementById("share-output");
const formError = document.getElementById("form-error");
const moodButtons = Array.from(document.querySelectorAll('[data-mood]'));
const MOOD_LIMIT = 3;
const SHARE_CACHE_KEY = "mini-readers-share-card";
const sharePlaceholder = shareOutput.innerHTML;

const messages = {
  passageRequired: "마음에 남은 문장을 입력해주세요.",
  noteOrMoodRequired: "감정 태그 또는 메모 중 하나는 반드시 입력해주세요.",
  submitFailed: "기록 저장에 실패했어요. 잠시 후 다시 시도해주세요.",
  listFailed: "기록을 불러오는 중 문제가 발생했어요.",
  emptyList: "아직 기록이 없습니다. 첫 감정을 남겨보세요!",
  shareFailed: "공유 카드를 불러오지 못했어요.",
};

moodButtons.forEach((button) => {
  button.addEventListener("click", () => toggleMood(button));
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const passage = form.passage.value.trim();
  const note = form.note.value.trim();
  const moods = getSelectedMoods();

  if (!passage) {
    showFormError(messages.passageRequired);
    form.passage.focus();
    return;
  }

  if (!note && moods.length === 0) {
    showFormError(messages.noteOrMoodRequired);
    return;
  }

  hideFormError();

  const response = await fetch("/api/quotes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ passage, note: note || null, moods }),
  }).catch(() => null);

  if (!response || !response.ok) {
    showFormError(messages.submitFailed);
    return;
  }

  form.reset();
  resetMoodSelection();
  await loadQuotes();
});

async function loadQuotes() {
  list.innerHTML = "";
  const response = await fetch("/api/quotes").catch(() => null);
  if (!response || !response.ok) {
    appendMessage(list, messages.listFailed);
    return;
  }
  const quotes = await response.json();
  if (quotes.length === 0) {
    appendMessage(list, messages.emptyList);
    return;
  }

  quotes.forEach((quote) => {
    const item = document.createElement("li");
    const text = document.createElement("p");
    text.className = "quote-text";
    text.textContent = quote.passage;
    item.appendChild(text);

    const moodRow = buildMoodRow(quote.moods);
    if (moodRow) {
      item.appendChild(moodRow);
    }

    if (quote.note) {
      const note = document.createElement("p");
      note.className = "quote-note";
      note.textContent = quote.note;
      item.appendChild(note);
    }

    const meta = document.createElement("p");
    meta.className = "quote-meta";
    meta.textContent = formatDate(quote.createdAt);
    item.appendChild(meta);

    const actions = document.createElement("div");
    actions.className = "quote-actions";
    const button = document.createElement("button");
    button.type = "button";
    button.className = "ghost";
    button.textContent = "공유 카드 만들기";
    button.addEventListener("click", () => showShare(quote.id));
    actions.appendChild(button);
    item.appendChild(actions);
    list.appendChild(item);
  });
}

async function showShare(id) {
  const response = await fetch(`/api/quotes/${id}/share`).catch(() => null);
  if (!response || !response.ok) {
    handleShareError(messages.shareFailed);
    return;
  }
  const payload = await response.json();
  renderShareCard(payload);
}

function toggleMood(button) {
  const isActive = button.getAttribute("aria-pressed") === "true";
  if (!isActive && getSelectedMoods().length >= MOOD_LIMIT) {
    showFormError(`감정 태그는 최대 ${MOOD_LIMIT}개까지 선택할 수 있어요.`);
    return;
  }
  const nextState = !isActive;
  button.setAttribute("aria-pressed", String(nextState));
  button.classList.toggle("active", nextState);
  hideFormError();
}

function getSelectedMoods() {
  return moodButtons
    .filter((btn) => btn.getAttribute("aria-pressed") === "true")
    .map((btn) => btn.dataset.mood);
}

function resetMoodSelection() {
  moodButtons.forEach((btn) => {
    btn.setAttribute("aria-pressed", "false");
    btn.classList.remove("active");
  });
}

function showFormError(message) {
  if (!formError) return;
  formError.textContent = message;
  formError.hidden = !message;
}

function hideFormError() {
  if (!formError) return;
  formError.hidden = true;
  formError.textContent = "";
}

function appendMessage(container, text) {
  const item = document.createElement("li");
  item.className = "placeholder";
  item.textContent = text;
  container.appendChild(item);
}

function buildMoodRow(moods) {
  if (!moods || moods.length === 0) {
    return null;
  }
  const row = document.createElement("div");
  row.className = "chip-row";
  moods.forEach((mood) => {
    const chip = document.createElement("span");
    chip.className = "chip";
    chip.textContent = `#${mood}`;
    row.appendChild(chip);
  });
  return row;
}

function renderShareCard(payload, options = {}) {
  const { persist = true } = options;
  shareOutput.innerHTML = "";
  shareOutput.classList.remove("placeholder");

  const title = document.createElement("p");
  title.className = "share-title";
  title.textContent = payload.title;
  shareOutput.appendChild(title);

  const blockquote = document.createElement("blockquote");
  blockquote.textContent = payload.passage;
  shareOutput.appendChild(blockquote);

  const moods = buildMoodRow(payload.moods);
  if (moods) {
    shareOutput.appendChild(moods);
  }

  const note = document.createElement("p");
  note.className = "share-note";
  note.textContent = payload.note && payload.note.trim().length > 0 ? payload.note : "감정 태그로만 기록했어요.";
  shareOutput.appendChild(note);

  const signature = document.createElement("p");
  signature.className = "share-signature";
  signature.textContent = payload.signature;
  shareOutput.appendChild(signature);

  const actions = document.createElement("div");
  actions.className = "share-actions";
  const copyButton = document.createElement("button");
  copyButton.type = "button";
  copyButton.className = "ghost";
  copyButton.textContent = "카드 텍스트 복사";
  copyButton.addEventListener("click", () => copyShare(payload, copyButton));
  actions.appendChild(copyButton);
  shareOutput.appendChild(actions);

  updateShareMessage("");
  if (persist) {
    persistShareCard(payload);
  }
}

async function copyShare(payload, button) {
  const parts = [payload.title, "", payload.passage];
  if (payload.moods && payload.moods.length) {
    parts.push("", payload.moods.map((m) => `#${m}`).join(" "));
  }
  if (payload.note) {
    parts.push("", payload.note);
  }
  parts.push("", payload.signature);
  const text = parts.filter(Boolean).join("\n").replace(/\n{3,}/g, "\n\n");
  try {
    await navigator.clipboard.writeText(text);
    button.textContent = "복사 완료!";
    setTimeout(() => (button.textContent = "카드 텍스트 복사"), 1800);
  } catch (error) {
    window.prompt("아래 내용을 복사해주세요.", text);
  }
}

function formatDate(value) {
  if (!value) return "";
  try {
    const formatter = new Intl.DateTimeFormat("ko-KR", {
      dateStyle: "medium",
      timeStyle: "short",
    });
    return formatter.format(new Date(value));
  } catch (error) {
    return value;
  }
}

function resetSharePlaceholder(message) {
  clearPersistedShareCard();
  shareOutput.classList.add("placeholder");
  shareOutput.innerHTML = message
    ? `<p>${message}</p><p class="muted">감정 태그와 메모가 함께 포함돼요.</p>`
    : sharePlaceholder;
  updateShareMessage("");
}

function handleShareError(message) {
  const cached = getPersistedShareCard();
  if (cached) {
    renderShareCard(cached, { persist: false });
    updateShareMessage(message);
    return;
  }
  resetSharePlaceholder(message);
}

function updateShareMessage(message) {
  let status = shareOutput.querySelector(".share-status");
  if (!message || !message.trim()) {
    if (status) {
      status.remove();
    }
    return;
  }
  if (!status) {
    status = document.createElement("p");
    status.className = "share-status muted";
    shareOutput.appendChild(status);
  }
  status.textContent = message;
}

function persistShareCard(payload) {
  try {
    localStorage.setItem(SHARE_CACHE_KEY, JSON.stringify(payload));
  } catch (error) {
    console.warn("Failed to save share card", error);
  }
}

function getPersistedShareCard() {
  try {
    const raw = localStorage.getItem(SHARE_CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.warn("Failed to read share card", error);
    return null;
  }
}

function clearPersistedShareCard() {
  try {
    localStorage.removeItem(SHARE_CACHE_KEY);
  } catch (error) {
    console.warn("Failed to clear share card", error);
  }
}

function restoreShareCard() {
  const cached = getPersistedShareCard();
  if (cached) {
    renderShareCard(cached, { persist: false });
  }
}

restoreShareCard();
loadQuotes();
