// AI Darzi — Tailor Marketplace Module

let allTailors = [];
let currentCategoryFilter = 'All';

async function fetchTailors() {
  try {
    const url = window.apiUrl ? window.apiUrl('/api/tailors') : '/api/tailors';
    const res = await fetch(url);
    const result = await res.json();
    if (result.success && result.data) {
      allTailors = result.data;
      renderTailors(allTailors);
      renderHomeFeaturedTailors(allTailors.slice(0, 3));
    }
  } catch (error) {
    console.error('Error fetching tailors:', error);
  }
}

function renderTailors(tailors) {
  const container = document.getElementById('tailorsMarketplaceGrid');
  if (!container) return;

  if (tailors.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 3rem; background: var(--bg-card); border-radius: var(--radius-md);">
        <h3>No tailors match your search criteria</h3>
        <p style="color: var(--text-muted); margin-top: 0.5rem;">Try adjusting the city or category filter.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = '';
  tailors.forEach(tailor => {
    container.appendChild(createTailorCard(tailor));
  });
}

function renderHomeFeaturedTailors(tailors) {
  const container = document.getElementById('homeFeaturedTailors');
  if (!container) return;
  container.innerHTML = '';
  tailors.forEach(tailor => {
    container.appendChild(createTailorCard(tailor));
  });
}

function createTailorCard(tailor) {
  const card = document.createElement('div');
  card.className = 'tailor-card';

  const coverUrl = tailor.coverImage || 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1000&q=80';
  const avatarUrl = tailor.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80';

  const specialtiesHtml = (tailor.specialties || []).slice(0, 3).map(s => 
    `<span class="spec-badge">${s}</span>`
  ).join('');

  card.innerHTML = `
    <div class="tailor-cover" style="background-image: url('${coverUrl}');">
      ${tailor.verified ? '<div class="tailor-badge-verified">✓ Verified Master</div>' : ''}
    </div>
    <div class="tailor-avatar-wrap">
      <img src="${avatarUrl}" alt="${tailor.masterTailorName}" class="tailor-avatar">
      <div class="tailor-rating-pill">
        ⭐ ${tailor.rating.toFixed(1)} <span style="font-size: 0.72rem; color: var(--text-muted);">(${tailor.reviewCount || 42})</span>
      </div>
    </div>
    <div class="tailor-body">
      <h3 class="tailor-name">${tailor.businessName}</h3>
      <div class="tailor-location">
        📍 ${tailor.area}, ${tailor.city}
      </div>
      <div class="tailor-specialties">
        ${specialtiesHtml}
      </div>
      <p style="font-size: 0.82rem; color: var(--text-secondary); line-height: 1.4; margin-bottom: 0.85rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
        ${tailor.bio || 'Master tailor specializing in precision cuts, designer catalogs, and flawless finishes.'}
      </p>
      <div class="tailor-footer-meta">
        <div class="price-tag-wrap">
          Starting from<br>
          <span class="price-tag-value">PKR ${tailor.startingPrice.toLocaleString()}</span>
        </div>
        <div class="tailor-actions">
          <button class="btn btn-outline-dark btn-sm" onclick="window.openTailorStorefront('${tailor._id}')">
            Storefront
          </button>
          <button class="btn btn-primary btn-sm" onclick="window.bookTailorDirectly('${tailor._id}', '${escapeQuotes(tailor.businessName)}')">
            Book Now
          </button>
        </div>
      </div>
    </div>
  `;
  return card;
}

function escapeQuotes(str) {
  return (str || '').replace(/'/g, "\\'");
}

// Filtering tailors
function filterTailors() {
  const search = (document.getElementById('tailorSearchInput')?.value || '').toLowerCase();
  const city = document.getElementById('cityFilter')?.value || 'All';
  const sort = document.getElementById('sortFilter')?.value || 'rating';
  const pickupOnly = document.getElementById('pickupFilter')?.checked || false;

  let filtered = allTailors.filter(t => {
    const matchesSearch = !search || 
      t.businessName.toLowerCase().includes(search) || 
      t.masterTailorName.toLowerCase().includes(search) ||
      t.area.toLowerCase().includes(search) ||
      (t.specialties || []).some(s => s.toLowerCase().includes(search));

    const matchesCity = city === 'All' || t.city.toLowerCase() === city.toLowerCase();
    const matchesCategory = currentCategoryFilter === 'All' || (t.categories || []).includes(currentCategoryFilter.toLowerCase());
    const matchesPickup = !pickupOnly || t.pickupAvailable === true;

    return matchesSearch && matchesCity && matchesCategory && matchesPickup;
  });

  // Sort
  if (sort === 'rating') {
    filtered.sort((a, b) => b.rating - a.rating);
  } else if (sort === 'price_asc') {
    filtered.sort((a, b) => a.startingPrice - b.startingPrice);
  } else if (sort === 'orders') {
    filtered.sort((a, b) => b.completedOrders - a.completedOrders);
  }

  renderTailors(filtered);
}

function setCategoryFilter(category, btnElement) {
  currentCategoryFilter = category;
  document.querySelectorAll('.filter-chips .chip').forEach(c => c.classList.remove('active'));
  if (btnElement) btnElement.classList.add('active');
  filterTailors();
}

// Open Tailor Storefront Modal
async function openTailorStorefront(tailorId) {
  const modal = document.getElementById('tailorStorefrontModal');
  const container = document.getElementById('tailorStorefrontContent');
  modal.style.display = 'flex';
  container.innerHTML = '<div style="text-align: center; padding: 3rem;">Loading tailor storefront...</div>';

  try {
    const url = window.apiUrl ? window.apiUrl(`/api/tailors/${tailorId}`) : `/api/tailors/${tailorId}`;
    const res = await fetch(url);
    const result = await res.json();
    if (result.success && result.data) {
      const t = result.data;
      
      const servicesHtml = (t.services || []).map(s => `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 0; border-bottom: 1px dashed var(--border-subtle);">
          <div>
            <strong>${s.name}</strong>
            <p style="font-size: 0.78rem; color: var(--text-muted);">${s.description} • Turnaround: ${s.turnaroundDays} days</p>
          </div>
          <div style="font-weight: 800; color: var(--primary-800);">PKR ${s.basePrice.toLocaleString()}</div>
        </div>
      `).join('');

      const portfolioHtml = (t.portfolio || []).map(p => `
        <div style="border-radius: var(--radius-md); overflow: hidden; border: 1px solid var(--border-subtle); background: var(--bg-surface);">
          <img src="${p.image}" alt="${p.title}" style="width: 100%; height: 160px; object-fit: cover;">
          <div style="padding: 0.75rem;">
            <strong style="font-size: 0.85rem; display: block;">${p.title}</strong>
            <p style="font-size: 0.75rem; color: var(--text-muted);">${p.description}</p>
          </div>
        </div>
      `).join('');

      const reviewsHtml = (t.reviews || []).map(r => `
        <div style="background: var(--bg-main); padding: 0.85rem 1rem; border-radius: var(--radius-sm); margin-bottom: 0.75rem;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
            <strong style="font-size: 0.85rem;">${r.customerName}</strong>
            <span style="color: var(--gold-600); font-size: 0.8rem;">⭐ ${r.rating} / 5</span>
          </div>
          <p style="font-size: 0.82rem; color: var(--text-secondary);">${r.comment}</p>
        </div>
      `).join('') || '<p style="font-size: 0.85rem; color: var(--text-muted);">No written reviews yet. Be the first to review!</p>';

      container.innerHTML = `
        <div style="display: flex; gap: 1.25rem; align-items: center; border-bottom: 1px solid var(--border-subtle); padding-bottom: 1.25rem; margin-bottom: 1.25rem;">
          <img src="${t.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80'}" alt="${t.businessName}" style="width: 80px; height: 80px; border-radius: var(--radius-full); object-fit: cover; border: 2px solid var(--gold-500);">
          <div>
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <h2 style="font-family: var(--font-heading); font-size: 1.5rem; color: var(--primary-800);">${t.businessName}</h2>
              ${t.verified ? '<span class="spec-badge" style="background: var(--gold-100); color: #785A0D;">✓ Verified Master</span>' : ''}
            </div>
            <p style="font-size: 0.88rem; color: var(--text-muted);">Master Cutter: ${t.masterTailorName} • ${t.area}, ${t.city}</p>
            <div style="display: flex; gap: 1rem; font-size: 0.82rem; margin-top: 0.35rem;">
              <span>⭐ <strong>${t.rating.toFixed(1)}</strong> (${t.reviewCount} reviews)</span>
              <span>🧵 <strong>${t.completedOrders}</strong> orders completed</span>
              <span>⏱️ <strong>${t.turnaroundDays} days</strong> avg turnaround</span>
            </div>
          </div>
        </div>

        <p style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 1.5rem; line-height: 1.5;">
          ${t.bio}
        </p>

        <!-- Services & Price Matrix -->
        <h3 class="panel-title" style="font-size: 1.15rem; margin-bottom: 0.75rem;">Services & Pricing Matrix</h3>
        <div style="margin-bottom: 1.5rem;">
          ${servicesHtml}
        </div>

        <!-- Portfolio Gallery -->
        <h3 class="panel-title" style="font-size: 1.15rem; margin-bottom: 0.75rem;">Recent Stitching Portfolio</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
          ${portfolioHtml}
        </div>

        <!-- Verified Reviews -->
        <h3 class="panel-title" style="font-size: 1.15rem; margin-bottom: 0.75rem;">Verified Customer Reviews</h3>
        <div style="margin-bottom: 1.5rem;">
          ${reviewsHtml}
        </div>

        <div style="display: flex; gap: 0.75rem; justify-content: flex-end; border-top: 1px solid var(--border-subtle); padding-top: 1rem;">
          <button class="btn btn-outline-dark" onclick="window.startChatWithTailor('${t._id}', '${escapeQuotes(t.masterTailorName)}')">
            💬 Chat with Tailor
          </button>
          <button class="btn btn-primary" onclick="window.bookTailorDirectly('${t._id}', '${escapeQuotes(t.businessName)}')">
            🪡 Book Stitching Order
          </button>
        </div>
      `;
    }
  } catch (error) {
    console.error('Storefront load error:', error);
  }
}

function closeTailorStorefront() {
  document.getElementById('tailorStorefrontModal').style.display = 'none';
}

function bookTailorDirectly(tailorId, tailorName) {
  closeTailorStorefront();
  window.openOrderWizard({
    tailorId,
    tailorName
  });
}

function startChatWithTailor(tailorId, tailorName) {
  closeTailorStorefront();
  window.navigateTo('chat');
  window.switchChatTab('tailor', tailorId, tailorName);
}

// Global exports
window.fetchTailors = fetchTailors;
window.filterTailors = filterTailors;
window.setCategoryFilter = setCategoryFilter;
window.openTailorStorefront = openTailorStorefront;
window.closeTailorStorefront = closeTailorStorefront;
window.bookTailorDirectly = bookTailorDirectly;
window.startChatWithTailor = startChatWithTailor;
window.getAllTailors = () => allTailors;
