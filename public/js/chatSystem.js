// AI Darzi — Chat & Multilingual Darzi AI Assistant Module

let currentChatMode = 'ai'; // 'ai' or 'tailor'
let activeChatTailorId = null;
let activeChatTailorName = 'Madam Kainat';

const aiChatHistory = [
  {
    sender: 'model',
    text: 'Assalam-o-Alaikum! Main aapka AI Darzi Assistant hoon. Boliye, aaj aapke liye kya silwana ya design karna hai? Aap mujh se Eid designs, kapray ke gaz (yardage), ya measurements ke baray mein Roman Urdu, Urdu ya English mein pooch sakte hain.'
  }
];

const tailorChatHistory = [
  {
    sender: 'customer',
    text: 'Assalam-o-Alaikum Madam Kainat, please ensure the organza border on the sleeves is lined with soft lawn so it is comfortable to wear.'
  },
  {
    sender: 'tailor',
    text: 'Walaikum Assalam Amina baji! Ji bilkul, hum hamesha organza borders ke neeche skin-friendly pure lawn astra lagatay hain. Stitching shuru ho chuki hai aur InshaAllah 3 din mein deliver ho jaye ga.'
  }
];

function switchChatTab(mode, tailorId, tailorName) {
  currentChatMode = mode;
  const aiBtn = document.getElementById('chatTabAIBtn');
  const tailorBtn = document.getElementById('chatTabTailorBtn');
  const title = document.getElementById('activeChatTitle');
  const subtitle = document.getElementById('activeChatSubtitle');
  const pills = document.getElementById('chatQuickPills');

  if (mode === 'ai') {
    aiBtn.className = 'btn btn-sm btn-primary';
    tailorBtn.className = 'btn btn-sm btn-outline-dark';
    title.innerText = 'Darzi AI Concierge';
    subtitle.innerText = 'Multilingual (English, Roman Urdu, Urdu)';
    pills.style.display = 'flex';
    renderMessages(aiChatHistory);
  } else {
    tailorBtn.className = 'btn btn-sm btn-primary';
    aiBtn.className = 'btn btn-sm btn-outline-dark';
    if (tailorName) activeChatTailorName = tailorName;
    if (tailorId) activeChatTailorId = tailorId;
    title.innerText = `${activeChatTailorName} (Master Workshop)`;
    subtitle.innerText = 'Direct In-App Tailor Messaging';
    pills.style.display = 'none';
    renderMessages(tailorChatHistory);
  }
}

function scrollToBottom() {
  const container = document.getElementById('chatMessagesBox');
  if (!container) return;
  // Use requestAnimationFrame so the DOM has painted before we measure scrollHeight
  requestAnimationFrame(() => {
    container.scrollTop = container.scrollHeight;
  });
}

function renderMessages(messages) {
  const container = document.getElementById('chatMessagesBox');
  if (!container) return;
  container.innerHTML = '';

  messages.forEach(msg => {
    const bubble = document.createElement('div');
    const isOutgoing = msg.sender === 'user' || msg.sender === 'customer';
    bubble.className = `message-bubble ${isOutgoing ? 'outgoing' : 'incoming'}`;
    bubble.innerText = msg.text;
    container.appendChild(bubble);
  });

  scrollToBottom();
}

async function sendMessage() {
  const input = document.getElementById('chatTextInput');
  const text = input.value.trim();
  if (!text) return;

  input.value = '';

  if (currentChatMode === 'ai') {
    aiChatHistory.push({ sender: 'user', text });
    renderMessages(aiChatHistory);

    // Show temporary typing indicator
    const container = document.getElementById('chatMessagesBox');
    const typingBubble = document.createElement('div');
    typingBubble.className = 'message-bubble incoming';
    typingBubble.id = 'aiTypingBubble';
    typingBubble.innerText = 'Darzi AI is thinking in Roman Urdu / English...';
    container.appendChild(typingBubble);
    scrollToBottom();

    try {
      const activeDesign = window.getActiveDesign ? window.getActiveDesign() : {};
      const activeMeasurements = window.getActiveMeasurements ? window.getActiveMeasurements() : {};

      const url = window.apiUrl ? window.apiUrl('/api/chat/assistant') : '/api/chat/assistant';
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: aiChatHistory,
          context: {
            role: 'customer',
            garment: activeDesign.garmentType || '3-Piece Lawn Suit',
            measurements: activeMeasurements,
            tailorName: activeChatTailorName
          }
        })
      });
      const result = await res.json();

      const typingEl = document.getElementById('aiTypingBubble');
      if (typingEl) typingEl.remove();

      if (result.success && result.data?.reply) {
        aiChatHistory.push({ sender: 'model', text: result.data.reply });
      } else {
        aiChatHistory.push({
          sender: 'model',
          text: 'Assalam-o-Alaikum! Aapka sawal bohot behtareen hai. Main aapko recommend karunga ke lawn suit mein halki lace lagwayein aur teera ka naap 14.5 se 15 inches standard rakhein.'
        });
      }
      renderMessages(aiChatHistory);
    } catch (error) {
      console.error('Chat error:', error);
      const typingEl = document.getElementById('aiTypingBubble');
      if (typingEl) typingEl.remove();
      aiChatHistory.push({
        sender: 'model',
        text: 'Aapka message mil gaya hai. Eid ke liye 3 piece lawn suit mein resham work aur straight pants bohot shandaar lagengi.'
      });
      renderMessages(aiChatHistory);
    }
  } else {
    // Tailor direct message
    tailorChatHistory.push({ sender: 'customer', text });
    renderMessages(tailorChatHistory);

    // Simulated quick master tailor acknowledgment
    setTimeout(() => {
      tailorChatHistory.push({
        sender: 'tailor',
        text: 'Ji baji, message note kar liya hai. Hum poori koshish karein gay ke aapki marzi ke mutabiq exact cutting aur finishing ho.'
      });
      renderMessages(tailorChatHistory);
      scrollToBottom();
    }, 1200);
  }
}

function sendPredefinedMessage(msg) {
  document.getElementById('chatTextInput').value = msg;
  sendMessage();
}

function generateChatOrderBrief() {
  const briefText = `ORDER BRIEF GENERATED BY DARZI AI:
Customer: Amina Khan
Recommended Garment: 3-Piece Festive Lawn Suit
Fabric Required: 4.5 Gaz (3 gaz shirt + 2.5 gaz trouser)
Key Specs Discussed:
- Boat neck with potli button slit
- Straight sleeves with soft organza astra backing
- Straight trousers with 3 fine pintucks
- Pre-shrink fabric before master cut`;

  window.openOrderSheetModal(briefText);
  window.showToast('Generated concise Order Brief from chat!');
}

// Global exports
window.switchChatTab = switchChatTab;
window.sendMessage = sendMessage;
window.sendPredefinedMessage = sendPredefinedMessage;
window.generateChatOrderBrief = generateChatOrderBrief;
window.initChat = () => renderMessages(aiChatHistory);
