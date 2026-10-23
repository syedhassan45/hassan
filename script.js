const messagesEl = document.getElementById("messages");
const formEl = document.getElementById("chat-form");
const inputEl = document.getElementById("input");
const sendBtn = document.getElementById("send-btn");
const clearBtn = document.getElementById("clear-btn");

const WELCOME_TEXT = "Assalam o Alaikum! Main aap ki kya madad kar sakta hoon?";

// Poori baat-cheet ki history (server ko har baar bhejte hain)
let history = [];
let isLoading = false;

function addMessage(text, type) {
  const el = document.createElement("div");
  el.className = `message message--${type}`;
  el.textContent = text; // textContent use karne se HTML inject nahi ho sakta
  messagesEl.appendChild(el);
  scrollToBottom();
  return el;
}

function addTypingIndicator() {
  const el = document.createElement("div");
  el.className = "message message--bot";
  el.setAttribute("aria-label", "Jawab likha ja raha hai");
  el.innerHTML = '<span class="typing"><span></span><span></span><span></span></span>';
  messagesEl.appendChild(el);
  scrollToBottom();
  return el;
}

function scrollToBottom() {
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function setLoading(state) {
  isLoading = state;
  sendBtn.disabled = state;
  inputEl.disabled = state;
  if (!state) inputEl.focus();
}

function autoResizeInput() {
  inputEl.style.height = "auto";
  inputEl.style.height = `${inputEl.scrollHeight}px`;
}

function resetChat() {
  history = [];
  messagesEl.innerHTML = "";
  addMessage(WELCOME_TEXT, "bot");
}

async function sendMessage(text) {
  history.push({ role: "user", text });
  addMessage(text, "user");
  setLoading(true);
  const typingEl = addTypingIndicator();

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: history }),
    });

    const data = await response.json();
    typingEl.remove();

    if (!response.ok) {
      throw new Error(data.error || "Kuch ghalat ho gaya.");
    }

    history.push({ role: "model", text: data.reply });
    addMessage(data.reply, "bot");
  } catch (error) {
    typingEl.remove();
    history.pop(); // fail hone wala user message history se hata dein
    addMessage(error.message || "Network ka masla hai. Dobara try karein.", "error");
  } finally {
    setLoading(false);
  }
}

formEl.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = inputEl.value.trim();
  if (!text || isLoading) return;

  inputEl.value = "";
  autoResizeInput();
  sendMessage(text);
});

// Enter dabane se message jaye, Shift+Enter se nayi line
inputEl.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    formEl.requestSubmit();
  }
});

inputEl.addEventListener("input", autoResizeInput);
clearBtn.addEventListener("click", resetChat);

resetChat();
