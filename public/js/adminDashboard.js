// AI Darzi — Admin Dashboard & Moderation Module

async function loadAdminDashboard() {
  try {
    const url = window.apiUrl ? window.apiUrl('/api/admin/metrics') : '/api/admin/metrics';
    const res = await fetch(url);
    const result = await res.json();
    if (result.success && result.data) {
      const m = result.data;
      const gmvEl = document.getElementById('adminGmv');
      const revEl = document.getElementById('adminRev');
      const tailorsEl = document.getElementById('adminTailors');
      if (gmvEl) gmvEl.innerText = `PKR ${(m.gmvPKR || 485000).toLocaleString()}`;
      if (revEl) revEl.innerText = `PKR ${(m.platformRevenuePKR || 48500).toLocaleString()}`;
      if (tailorsEl) tailorsEl.innerText = `${m.totalTailors || 5} Registered`;
    }

    loadAdminTailorsTable();
  } catch (error) {
    console.error('Admin metrics error:', error);
  }
}

async function loadAdminTailorsTable() {
  const tbody = document.getElementById('adminTailorsTableBody');
  if (!tbody) return;

  try {
    const url = window.apiUrl ? window.apiUrl('/api/admin/tailors') : '/api/admin/tailors';
    const res = await fetch(url);
    const result = await res.json();
    if (result.success && result.data) {
      tbody.innerHTML = result.data.map(tailor => `
        <tr>
          <td><strong>${tailor.businessName}</strong></td>
          <td>${tailor.masterTailorName}</td>
          <td>${tailor.city}</td>
          <td>⭐ ${tailor.rating.toFixed(1)}</td>
          <td>${tailor.completedOrders}</td>
          <td>
            <span class="spec-badge" style="background: ${tailor.verified ? '#E6F8F0' : '#FDE8E8'}; color: ${tailor.verified ? '#0C6B46' : '#9B1C1C'};">
              ${tailor.verified ? '✓ Verified' : 'Pending Verification'}
            </span>
          </td>
          <td>
            <button class="btn btn-outline-dark btn-sm" onclick="window.toggleAdminTailorVerify('${tailor._id}')">
              ${tailor.verified ? 'Revoke Badge' : 'Approve & Verify'}
            </button>
          </td>
        </tr>
      `).join('');
    }
  } catch (error) {
    console.error('Error loading admin tailors:', error);
  }
}

async function toggleAdminTailorVerify(tailorId) {
  try {
    const url = window.apiUrl ? window.apiUrl(`/api/admin/tailors/${tailorId}/verify`) : `/api/admin/tailors/${tailorId}/verify`;
    const res = await fetch(url, {
      method: 'PATCH'
    });
    const result = await res.json();
    if (result.success) {
      window.showToast(`Updated verification status for tailor!`);
      loadAdminTailorsTable();
      if (window.fetchTailors) window.fetchTailors();
    }
  } catch (error) {
    console.error('Error toggling tailor verify:', error);
  }
}

// Global exports
window.loadAdminDashboard = loadAdminDashboard;
window.toggleAdminTailorVerify = toggleAdminTailorVerify;
