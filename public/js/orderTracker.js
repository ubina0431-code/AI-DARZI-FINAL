// AI Darzi — 13-Stage Order Timeline & Tracker Module

const ALL_13_STAGES = [
  'New Order',
  'Reviewing',
  'Quotation Sent',
  'Accepted',
  'Fabric Received',
  'Cutting',
  'Stitching',
  'Quality Check',
  'Ready',
  'Picked Up',
  'Out for Delivery',
  'Delivered',
  'Completed'
];

let userOrders = [];

async function fetchOrders() {
  const container = document.getElementById('ordersListContainer');
  if (!container) return;

  try {
    const url = window.apiUrl ? window.apiUrl('/api/orders') : '/api/orders';
    const res = await fetch(url);
    const result = await res.json();
    if (result.success && result.data) {
      userOrders = result.data;
      renderOrders(userOrders);
    }
  } catch (error) {
    console.error('Error fetching orders:', error);
  }
}

function renderOrders(orders) {
  const container = document.getElementById('ordersListContainer');
  if (!container) return;

  if (orders.length === 0) {
    container.innerHTML = `
      <div class="panel-card" style="text-align: center; padding: 3rem;">
        <div style="font-size: 3rem; margin-bottom: 0.5rem;">🧵</div>
        <h3>No tailoring orders yet</h3>
        <p style="color: var(--text-muted); margin: 0.5rem 0 1.5rem 0;">Ready to tailor your next suit from home without physical visits?</p>
        <button class="btn btn-primary" onclick="window.navigateTo('design')">Create Design & Order</button>
      </div>
    `;
    return;
  }

  container.innerHTML = '';
  orders.forEach(order => {
    container.appendChild(createOrderCard(order));
  });
}

function createOrderCard(order) {
  const card = document.createElement('div');
  card.className = 'timeline-card';

  const currentStageIndex = ALL_13_STAGES.indexOf(order.status);
  const activeIdx = currentStageIndex >= 0 ? currentStageIndex : 0;

  // Render 13 stages horizontal bar
  const stagesHtml = ALL_13_STAGES.map((st, idx) => {
    let stateClass = '';
    if (idx < activeIdx) stateClass = 'completed';
    else if (idx === activeIdx) stateClass = 'active';

    const stageNumber = idx + 1;
    return `
      <div class="stage-step ${stateClass}">
        <div class="stage-icon">${idx < activeIdx ? '✓' : stageNumber}</div>
        <div class="stage-label">${st}</div>
      </div>
    `;
  }).join('');

  const statusNotesHtml = (order.statusHistory || []).slice(-2).reverse().map(h => `
    <div style="font-size: 0.82rem; color: var(--text-secondary); margin-bottom: 0.35rem;">
      <span style="color: var(--gold-600); font-weight: 700;">● ${h.status}</span>: ${h.note} 
      <span style="color: var(--text-muted);">(${new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})</span>
    </div>
  `).join('');

  card.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem; border-bottom: 1px solid var(--border-subtle); padding-bottom: 1rem;">
      <div>
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <h3 style="font-family: var(--font-heading); color: var(--primary-800); font-size: 1.3rem;">Order #${order.orderNumber}</h3>
          <span class="spec-badge" style="background: var(--gold-100); color: #785A0D; font-weight: 700;">
            Stage ${activeIdx + 1}/13: ${order.status}
          </span>
        </div>
        <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 0.2rem;">
          Tailor: <strong>${order.tailorName}</strong> • Garment: <strong>${order.garmentType}</strong>
        </p>
      </div>

      <div style="text-align: right;">
        <div style="font-size: 1.15rem; font-weight: 800; color: var(--primary-800);">PKR ${(order.pricing?.total || 3450).toLocaleString()}</div>
        <span style="font-size: 0.78rem; color: var(--text-muted); text-transform: uppercase;">${order.payment?.method?.replace(/_/g, ' ') || 'COD'}</span>
      </div>
    </div>

    <!-- 13 Stages Timeline Bar -->
    <div class="stages-tracker">
      ${stagesHtml}
    </div>

    <!-- Order Notes & Action Buttons -->
    <div style="background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 1rem; margin-top: 1rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
      <div style="flex: 1; min-width: 250px;">
        <strong style="font-size: 0.85rem; color: var(--primary-800); display: block; margin-bottom: 0.35rem;">Live Stitching Updates:</strong>
        ${statusNotesHtml || '<span style="font-size: 0.82rem; color: var(--text-muted);">Awaiting workshop update...</span>'}
      </div>
      <div style="display: flex; gap: 0.5rem;">
        <button class="btn btn-outline-dark btn-sm" onclick='window.openOrderSheetModal(${JSON.stringify(order.tailorOrderSheet || generateFallbackSheet(order))})'>
          📋 Tailor Order Sheet
        </button>
        <button class="btn btn-primary btn-sm" onclick="window.startChatWithTailor('${order.tailorId}', '${(order.tailorName || '').replace(/'/g, "\\'")}')">
          💬 Chat with Tailor
        </button>
      </div>
    </div>
  `;

  return card;
}

function generateFallbackSheet(order) {
  return `TAILOR ORDER SHEET
Order #: ${order.orderNumber}
Customer: ${order.customerName} (${order.customerPhone})
Garment: ${order.garmentType}
Tailor: ${order.tailorName}
Measurements:
- Length: ${order.measurements?.kameezLength || 40}"
- Teera: ${order.measurements?.teera || 15}"
- Chest: ${order.measurements?.chest || 38}"
- Waist: ${order.measurements?.waist || 32}"
- Trouser Length: ${order.measurements?.trouserLength || 38}"
- Paincha: ${order.measurements?.paincha || 6.5}"
Design: ${order.designTitle || 'Custom Suit'}`;
}

function openOrderSheetModal(text) {
  const modal = document.getElementById('orderSheetModal');
  const box = document.getElementById('orderSheetModalText');
  box.innerText = text;
  modal.style.display = 'flex';
}

function closeOrderSheetModal() {
  document.getElementById('orderSheetModal').style.display = 'none';
}

function copyOrderSheet() {
  const text = document.getElementById('orderSheetModalText').innerText;
  navigator.clipboard.writeText(text).then(() => {
    window.showToast('Tailor order sheet copied to clipboard!');
  });
}

function printOrderSheet() {
  window.print();
}

// Global exports
window.fetchOrders = fetchOrders;
window.openOrderSheetModal = openOrderSheetModal;
window.closeOrderSheetModal = closeOrderSheetModal;
window.copyOrderSheet = copyOrderSheet;
window.printOrderSheet = printOrderSheet;
window.getUserOrders = () => userOrders;
window.ALL_13_STAGES = ALL_13_STAGES;
