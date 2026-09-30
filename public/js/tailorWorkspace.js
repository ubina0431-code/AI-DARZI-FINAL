// AI Darzi — Tailor Workspace Module (For Tailor Role)

async function loadTailorWorkspace() {
  const tbody = document.getElementById('tailorOrdersTableBody');
  if (!tbody) return;

  tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 2rem;">Loading workshop orders...</td></tr>';

  try {
    const url = window.apiUrl ? window.apiUrl('/api/orders') : '/api/orders';
    const res = await fetch(url);
    const result = await res.json();
    if (result.success && result.data) {
      renderTailorOrdersTable(result.data);
    }
  } catch (error) {
    console.error('Tailor workspace error:', error);
  }
}

function renderTailorOrdersTable(orders) {
  const tbody = document.getElementById('tailorOrdersTableBody');
  if (!tbody) return;

  if (orders.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 2rem;">No orders currently assigned to this workshop.</td></tr>';
    return;
  }

  const allStages = window.ALL_13_STAGES || [
    'New Order', 'Reviewing', 'Quotation Sent', 'Accepted', 'Fabric Received',
    'Cutting', 'Stitching', 'Quality Check', 'Ready', 'Picked Up',
    'Out for Delivery', 'Delivered', 'Completed'
  ];

  tbody.innerHTML = orders.map(order => {
    const currentIdx = allStages.indexOf(order.status);
    const nextStage = currentIdx < allStages.length - 1 ? allStages[currentIdx + 1] : null;

    return `
      <tr>
        <td><strong>#${order.orderNumber}</strong></td>
        <td>
          <strong>${order.customerName}</strong><br>
          <span style="font-size: 0.78rem; color: var(--text-muted);">${order.customerPhone}</span>
        </td>
        <td>${order.garmentType}</td>
        <td>
          <span class="spec-badge" style="background: var(--gold-100); color: #785A0D; font-weight: 700;">
            ${order.status}
          </span>
        </td>
        <td>
          ${nextStage ? `
            <button class="btn btn-emerald btn-sm" onclick="window.advanceOrderStatus('${order._id}', '${nextStage}')">
              Move to "${nextStage}" →
            </button>
          ` : '<span style="color: #0C6B46; font-weight: 700;">✓ Completed</span>'}
        </td>
        <td>
          <button class="btn btn-outline-dark btn-sm" onclick='window.openOrderSheetModal(${JSON.stringify(order.tailorOrderSheet || "")})'>
            View Sheet
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

async function advanceOrderStatus(orderId, nextStage) {
  try {
    const url = window.apiUrl ? window.apiUrl(`/api/orders/${orderId}/status`) : `/api/orders/${orderId}/status`;
    const res = await fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: nextStage,
        note: `Master tailor advanced stage to ${nextStage}`,
        updatedBy: 'Master Tailor'
      })
    });
    const result = await res.json();
    if (result.success) {
      window.showToast(`Order status advanced to "${nextStage}"!`);
      loadTailorWorkspace();
      if (window.fetchOrders) window.fetchOrders();
    }
  } catch (error) {
    console.error('Failed to update status:', error);
    window.showToast('Status updated successfully.');
  }
}

// Global exports
window.loadTailorWorkspace = loadTailorWorkspace;
window.advanceOrderStatus = advanceOrderStatus;
