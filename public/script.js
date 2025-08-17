const body = document.body;
const toggleBtn = document.getElementById("themeToggle");
const input = document.getElementById("userInput");
const button = document.getElementById("sendBtn");
const chatArea = document.querySelector(".chat-area");
const inputKeyApi = document.getElementById("inputApiKey");

// Salvar chave API
inputKeyApi.addEventListener("keydown", function(event) {
  if (event.key == "Enter") {
    const chaveAPI = inputKeyApi.value.trim();
    if (chaveAPI) {
      localStorage.setItem("OPEN_API_KEY", chaveAPI);
      alert("Chave salva com sucesso!");
      inputKeyApi.value = "";
    }
  }
})

// Enviar mensagem
button.addEventListener("click", async() => {
  const textoUsuario = input.value.trim();
  if (!textoUsuario) return;

  const chave = localStorage.getItem("OPEN_API_KEY");
  if (!chave) {
    alert("Por favor, insira sua chave da API antes de enviar mensagens.");
    return;
  }

  let mensagens = JSON.parse(localStorage.getItem('conteudoUsuario')) || [];
  mensagens.push(textoUsuario);
  localStorage.setItem('conteudoUsuario', JSON.stringify(mensagens));

  chatArea.innerHTML += `
    <div class="message user">
      <div class="text">${textoUsuario}</div>
      <div class="avatar">👤</div>
    </div>
  `;
  
  copy();
  input.value = "";

  try {
    const response = await fetch('/mensagem', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chave: chave, mensagem: textoUsuario })
    });

    const data = await response.json();
    const respostaIA = data.resposta;

    let respostas = JSON.parse(localStorage.getItem('conteudoIA')) || [];
    respostas.push(respostaIA);
    localStorage.setItem('conteudoIA', JSON.stringify(respostas));

    chatArea.innerHTML += `
      <div class="message bot">
        <div class="avatar">
          <img src="imgs/lily.jpg" alt="Avatar do Assistente">
        </div>
        <div class="text">${respostaIA}</div>
      </div>
    `;
  } catch(error) {
    console.error("Erro:", error)
  }
});

// Exportar PDF
document.getElementById("exportBtn").addEventListener("click", () => {
  const element = document.getElementById("chatArea");
  html2pdf().from(element).save("chat.pdf");
})

// Copiar mensagem
function copy() {
  const msgUser = document.querySelectorAll(".message.user");
  msgUser.forEach(msg => {
    if (!msg.querySelector(".copy-btn")) {
      const btn = document.createElement("button");
      btn.className = "copy-btn";
      btn.innerHTML = `<img id="imgCopy" src="./imgs/copyBlack.svg">`;
      msg.appendChild(btn);
    }
  })
}

function copyToClipboard(button) {
  const messageText = button.parentElement.textContent.replace('📋', '').trim();
  navigator.clipboard.writeText(messageText).then(() => {
    button.textContent = '✅'; 
    setTimeout(() => {
      button.textContent = '📋';
    }, 1500);
  }).catch(err => {
    console.error('Erro ao copiar:', err);
  });
}

// Carregar histórico no chat ao abrir
window.addEventListener('DOMContentLoaded', () => {
  const mensagens = JSON.parse(localStorage.getItem('conteudoUsuario') || '[]');
  const respostas = JSON.parse(localStorage.getItem('conteudoIA') || '[]');

  for (let i=0; i < mensagens.length; i++) {
    chatArea.innerHTML += `
      <div class="message user">
        <div class="text">${mensagens[i]}</div>
        <div class="avatar">👤</div>
      </div>
    `;
    if (respostas[i]) {
      chatArea.innerHTML += `
        <div class="message bot">
          <div class="avatar">
            <img src="imgs/lily.jpg" alt="Avatar do Assistente">
          </div>
          <div class="text">${respostas[i]}</div>
        </div>
      `;
    }
    copy();
  }
});

// Tema
function toggleTheme() {
  body.classList.toggle("dark-mode");
  updateIcon();
  saveThemePreference();
}

function updateIcon() {
  if (body.classList.contains("dark-mode")) {
    toggleBtn.textContent = "☀️";
    document.querySelectorAll(".copy-btn img").forEach(img => {
      img.src = "./imgs/copy.svg"; 
    });
  } else {
    toggleBtn.textContent = "🌙";
    document.querySelectorAll(".copy-btn img").forEach(img => {
      img.src = "./imgs/copyBlack.svg";
    });
  }
}

function saveThemePreference() {
  if (body.classList.contains("dark-mode")) {
    localStorage.setItem("theme", "dark");
  } else {
    localStorage.setItem("theme", "light");
  }
}

function loadThemePreference() {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    body.classList.add("dark-mode");
  } else {
    body.classList.remove("dark-mode");
  }
}

window.onload = () => {
  loadThemePreference();
  updateIcon(); 
};

// Contador de caracteres
const userInput = document.getElementById('userInput');
const charCount = document.getElementById('charCount');
const sendBtn = document.getElementById('sendBtn');
const maxLength = 200;

userInput.addEventListener('input', () => {
  const currentLength = userInput.value.length;
  charCount.textContent = `${currentLength} / ${maxLength}`;
});

sendBtn.addEventListener('click', () => {
  userInput.value = '';                      
  charCount.textContent = `0 / ${maxLength}`;
});

// -----------------------------
// Novo: Modal de histórico
// -----------------------------
const historyBtn = document.getElementById("historyBtn");
const historyModal = document.getElementById("historyModal");
const closeHistory = document.getElementById("closeHistory");
const historyList = document.getElementById("historyList");

historyBtn.addEventListener("click", () => {
  historyList.innerHTML = ""; 
  
  const mensagens = JSON.parse(localStorage.getItem('conteudoUsuario') || '[]');
  const respostas = JSON.parse(localStorage.getItem('conteudoIA') || '[]');

  if (mensagens.length === 0) {
    historyList.innerHTML = "<p>Nenhuma conversa salva.</p>";
  } else {
    for (let i = 0; i < mensagens.length; i++) {
      const userMsg = document.createElement("div");
      userMsg.className = "history-msg user";
      userMsg.innerHTML = `<strong>Você:</strong> ${mensagens[i]}`;
      historyList.appendChild(userMsg);

      if (respostas[i]) {
        const botMsg = document.createElement("div");
        botMsg.className = "history-msg bot";
        botMsg.innerHTML = `<strong>Lily:</strong> ${respostas[i]}`;
        historyList.appendChild(botMsg);
      }
    }
  }

  historyModal.style.display = "block";
});

closeHistory.addEventListener("click", () => {
  historyModal.style.display = "none";
});

window.addEventListener("click", (event) => {
  if (event.target === historyModal) {
    historyModal.style.display = "none";
  }
});

