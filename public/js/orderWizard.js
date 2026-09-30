// AI Darzi — 9-Step Order Creation Wizard Module

let currentWizardStep = 1;
const TOTAL_WIZARD_STEPS = 9;

let wizardOrderData = {
  garmentCategory: 'ladies',
  garmentType: '3-Piece Lawn Suit',
  designTitle: 'Emerald Breeze Festive Lawn Suit',
  designDetails: {
    neckline: 'Boat Neck with Slit & Potli Buttons',
    sleeves: 'Straight with Scalloped Embroidered Cuffs',
    length: 'Calf-length (40")',
    trouser: 'Straight Pants with 3 Pintucks',
    dupatta: 'Chiffon with 4-Side Lace',
    embroidery: 'Resham threadwork on sleeves and neckline',
    specialInstructions: 'Please ensure organza is backed by soft lawn lining.'
  },
  fabricOption: 'customer_pickup',
  fabricName: 'Customer Lawn Unstitched (3-Pieces)',
  fabricColor: 'Royal Emerald Green',
  measurements: {
    profileName: 'My Measurements',
    kameezLength: 39.5,
    teera: 14.5,
    chest: 37.0,
    waist: 31.0,
    daman: 23.5,
    sleevesLength: 21.0,
    trouserLength: 37.5,
    paincha: 6.5,
    collar: 14.5
  },
  tailorId: null,
  tailorName: 'Noor-e-Kainat Boutique & Tailors',
  logisticsOption: {
    pickupType: 'tailor_pickup',
    deliveryType: 'home_delivery'
  },
  customerName: 'Amina Khan',
  customerPhone: '+92 300 1234567',
  customerCity: 'Karachi',
  customerAddress: 'House 12-A, Khayaban-e-Shamsheer, DHA Phase 5, Karachi',
  pricing: {
    tailoring: 2500,
    fabric: 0,
    embroidery: 500,
    pickup: 150,
    delivery: 200,
    platformFee: 100,
    tax: 0,
    total: 3450
  },
  payment: {
    method: 'cash_on_delivery',
    status: 'pending'
  }
};

function openOrderWizard(prefill = {}) {
  currentWizardStep = 1;
  const tailors = window.getAllTailors ? window.getAllTailors() : [];

  if (prefill.tailorId) {
    wizardOrderData.tailorId = prefill.tailorId;
    wizardOrderData.tailorName = prefill.tailorName || 'Selected Tailor';
  } else if (!wizardOrderData.tailorId && tailors.length > 0) {
    wizardOrderData.tailorId = tailors[0]._id;
    wizardOrderData.tailorName = tailors[0].businessName;
  }

  if (prefill.garmentType) wizardOrderData.garmentType = prefill.garmentType;
  if (prefill.designTitle) wizardOrderData.designTitle = prefill.designTitle;
  if (prefill.designDetails) wizardOrderData.designDetails = { ...wizardOrderData.designDetails, ...prefill.designDetails };
  if (prefill.measurements) wizardOrderData.measurements = { ...wizardOrderData.measurements, ...prefill.measurements };

  // Calculate pricing
  calculateWizardPricing();

  const modal = document.getElementById('orderWizardModal');
  modal.style.display = 'flex';
  renderWizardStep();
}

function closeOrderWizard() {
  document.getElementById('orderWizardModal').style.display = 'none';
}

function calculateWizardPricing() {
  let baseTailoring = 2200;
  if (wizardOrderData.garmentType.includes('3-Piece')) baseTailoring = 2500;
  else if (wizardOrderData.garmentType.includes('Kurta')) baseTailoring = 1600;
  else if (wizardOrderData.garmentType.includes('Bridal')) baseTailoring = 14000;
  else if (wizardOrderData.garmentType.includes('Velvet')) baseTailoring = 3200;

  const embroideryCost = wizardOrderData.designDetails.embroidery && wizardOrderData.designDetails.embroidery !== 'None' ? 500 : 0;
  const pickupFee = wizardOrderData.logisticsOption.pickupType === 'tailor_pickup' ? 150 : 0;
  const deliveryFee = wizardOrderData.logisticsOption.deliveryType === 'home_delivery' ? 200 : 0;
  const platformFee = 100;

  wizardOrderData.pricing = {
    tailoring: baseTailoring,
    fabric: wizardOrderData.fabricOption === 'tailor_provides' ? 2800 : 0,
    embroidery: embroideryCost,
    pickup: pickupFee,
    delivery: deliveryFee,
    platformFee: platformFee,
    tax: 0,
    total: baseTailoring + (wizardOrderData.fabricOption === 'tailor_provides' ? 2800 : 0) + embroideryCost + pickupFee + deliveryFee + platformFee
  };
}

function renderWizardStep() {
  const container = document.getElementById('wizardStepContent');
  const indicator = document.getElementById('wizardStepIndicator');
  const tailorBadge = document.getElementById('wizardTailorBadge');
  const prevBtn = document.getElementById('wizardPrevBtn');
  const nextBtn = document.getElementById('wizardNextBtn');

  tailorBadge.innerText = wizardOrderData.tailorName || 'Tailor Selected';
  prevBtn.style.visibility = currentWizardStep === 1 ? 'hidden' : 'visible';
  nextBtn.innerText = currentWizardStep === TOTAL_WIZARD_STEPS ? '✓ Confirm & Place Order' : 'Continue';

  switch (currentWizardStep) {
    case 1:
      indicator.innerText = `Step 1 of 9 — Select Garment`;
      container.innerHTML = `
        <h4 style="margin-bottom: 0.5rem; color: var(--primary-800);">Select Garment Type</h4>
        <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1rem;">Choose the silhouette you want tailored.</p>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
          ${renderGarmentOption('3-Piece Lawn Suit', 'Ladies full suit (Shirt, Trouser, Dupatta)', '👗')}
          ${renderGarmentOption('2-Piece Kurti Trouser', 'Casual ladies shirt and pants', '👚')}
          ${renderGarmentOption('Gents Kurta Shalwar', 'Traditional men\'s cut with ban collar', '👔')}
          ${renderGarmentOption('Velvet Formal Kurti', 'Luxury winter evening wear', '✨')}
          ${renderGarmentOption('Waistcoat / Prince Coat', 'Tailored formal outerwear', '🧥')}
          ${renderGarmentOption('Bridal Lehenga Choli', 'Full flare formal wedding wear', '👑')}
        </div>
      `;
      break;

    case 2:
      indicator.innerText = `Step 2 of 9 — Select or Create Design`;
      container.innerHTML = `
        <h4 style="margin-bottom: 0.5rem; color: var(--primary-800);">Attached Design Specification</h4>
        <div class="panel-card" style="padding: 1rem; margin-bottom: 1rem; background: var(--primary-50);">
          <strong style="color: var(--primary-800);">${wizardOrderData.designTitle}</strong>
          <p style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.25rem;">
            Neck: ${wizardOrderData.designDetails.neckline} • Sleeves: ${wizardOrderData.designDetails.sleeves} • Trouser: ${wizardOrderData.designDetails.trouser}
          </p>
        </div>
        <div class="form-group">
          <label class="form-label">Special Tailor Instructions (Finishing, Laces, Astra):</label>
          <textarea class="form-input" style="min-height: 80px;" oninput="wizardOrderData.designDetails.specialInstructions = this.value">${wizardOrderData.designDetails.specialInstructions || ''}</textarea>
        </div>
      `;
      break;

    case 3:
      indicator.innerText = `Step 3 of 9 — Fabric Information`;
      container.innerHTML = `
        <h4 style="margin-bottom: 0.5rem; color: var(--primary-800);">How Will Fabric Be Provided?</h4>
        <div style="display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1rem;">
          <label style="display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem; border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); cursor: pointer;">
            <input type="radio" name="fabricOpt" value="customer_pickup" ${wizardOrderData.fabricOption === 'customer_pickup' ? 'checked' : ''} onchange="wizardOrderData.fabricOption = this.value; calculateWizardPricing();">
            <div>
              <strong>Tailor Picks Up My Unstitched Fabric</strong>
              <p style="font-size: 0.78rem; color: var(--text-muted);">A rider will pick up your fabric from your home.</p>
            </div>
          </label>
          <label style="display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem; border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); cursor: pointer;">
            <input type="radio" name="fabricOpt" value="tailor_provides" ${wizardOrderData.fabricOption === 'tailor_provides' ? 'checked' : ''} onchange="wizardOrderData.fabricOption = this.value; calculateWizardPricing();">
            <div>
              <strong>Tailor Provides Premium Fabric (+PKR 2,800)</strong>
              <p style="font-size: 0.78rem; color: var(--text-muted);">Tailor arranges 80/80 premium combed lawn or boski silk.</p>
            </div>
          </label>
        </div>
        <div class="form-group">
          <label class="form-label">Fabric Brand & Color Description:</label>
          <input type="text" class="form-input" value="${wizardOrderData.fabricName}" oninput="wizardOrderData.fabricName = this.value">
        </div>
      `;
      break;

    case 4:
      indicator.innerText = `Step 4 of 9 — Attach Measurements`;
      container.innerHTML = `
        <h4 style="margin-bottom: 0.5rem; color: var(--primary-800);">Selected Measurement Profile</h4>
        <div class="panel-card" style="padding: 1rem; margin-bottom: 1rem;">
          <div style="display: flex; justify-content: space-between;">
            <strong>Profile: ${wizardOrderData.measurements.profileName}</strong>
            <span class="spec-badge">Verified</span>
          </div>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; font-size: 0.82rem; margin-top: 0.5rem;">
            <div>Length: <strong>${wizardOrderData.measurements.kameezLength}"</strong></div>
            <div>Teera: <strong>${wizardOrderData.measurements.teera}"</strong></div>
            <div>Chest: <strong>${wizardOrderData.measurements.chest}"</strong></div>
            <div>Waist: <strong>${wizardOrderData.measurements.waist}"</strong></div>
            <div>Daman: <strong>${wizardOrderData.measurements.daman}"</strong></div>
            <div>Sleeves: <strong>${wizardOrderData.measurements.sleevesLength}"</strong></div>
            <div>Trouser: <strong>${wizardOrderData.measurements.trouserLength}"</strong></div>
            <div>Paincha: <strong>${wizardOrderData.measurements.paincha}"</strong></div>
            <div>Collar: <strong>${wizardOrderData.measurements.collar}"</strong></div>
          </div>
        </div>
        <button class="btn btn-outline-dark btn-sm" onclick="window.navigateTo('measure'); window.closeOrderWizard();">
          📏 Adjust in Measurement Studio
        </button>
      `;
      break;

    case 5:
      indicator.innerText = `Step 5 of 9 — Select Master Tailor`;
      const tailors = window.getAllTailors ? window.getAllTailors() : [];
      const tailorsHtml = tailors.map(t => `
        <label style="display: flex; align-items: center; justify-content: space-between; padding: 0.75rem; border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); margin-bottom: 0.5rem; cursor: pointer;">
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <input type="radio" name="tailorOpt" value="${t._id}" ${wizardOrderData.tailorId === t._id ? 'checked' : ''} onchange="wizardOrderData.tailorId = '${t._id}'; wizardOrderData.tailorName = '${t.businessName}';">
            <div>
              <strong>${t.businessName}</strong>
              <p style="font-size: 0.78rem; color: var(--text-muted);">${t.area}, ${t.city} • ⭐ ${t.rating.toFixed(1)}</p>
            </div>
          </div>
          <span style="font-weight: 700; font-size: 0.85rem; color: var(--primary-800);">From PKR ${t.startingPrice}</span>
        </label>
      `).join('');

      container.innerHTML = `
        <h4 style="margin-bottom: 0.5rem; color: var(--primary-800);">Select Tailor for This Order</h4>
        <div style="max-height: 250px; overflow-y: auto;">
          ${tailorsHtml}
        </div>
      `;
      break;

    case 6:
      indicator.innerText = `Step 6 of 9 — Pickup & Delivery Logistics`;
      container.innerHTML = `
        <h4 style="margin-bottom: 0.5rem; color: var(--primary-800);">Logistics Preferences</h4>
        <div class="form-group" style="margin-bottom: 1rem;">
          <label class="form-label">Fabric Pickup Option:</label>
          <select class="form-select" onchange="wizardOrderData.logisticsOption.pickupType = this.value; calculateWizardPricing();">
            <option value="tailor_pickup">Home Pickup by Tailor Rider (+PKR 150)</option>
            <option value="customer_dropoff">I will drop off at Tailor Workshop (PKR 0)</option>
            <option value="courier">Send via TCS / Trax Courier (+PKR 250)</option>
          </select>
        </div>
        <div class="form-group" style="margin-bottom: 1rem;">
          <label class="form-label">Finished Clothes Delivery:</label>
          <select class="form-select" onchange="wizardOrderData.logisticsOption.deliveryType = this.value; calculateWizardPricing();">
            <option value="home_delivery">Doorstep Delivery (+PKR 200)</option>
            <option value="self_pickup">Self Pickup from Workshop (PKR 0)</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Full Address:</label>
          <input type="text" class="form-input" value="${wizardOrderData.customerAddress}" oninput="wizardOrderData.customerAddress = this.value">
        </div>
      `;
      break;

    case 7:
      indicator.innerText = `Step 7 of 9 — Transparent Price Quotation`;
      calculateWizardPricing();
      container.innerHTML = `
        <h4 style="margin-bottom: 0.5rem; color: var(--primary-800);">Itemized Price Breakdown</h4>
        <p style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 1rem;">100% transparent pricing with zero hidden charges.</p>
        <div style="background: var(--bg-surface); border: 1px solid var(--border-gold); border-radius: var(--radius-md); padding: 1.25rem;">
          <div style="display: flex; justify-content: space-between; padding: 0.4rem 0; border-bottom: 1px dashed var(--border-subtle); font-size: 0.88rem;">
            <span>Master Tailoring & Cutting:</span>
            <strong>PKR ${wizardOrderData.pricing.tailoring.toLocaleString()}</strong>
          </div>
          ${wizardOrderData.pricing.fabric > 0 ? `
          <div style="display: flex; justify-content: space-between; padding: 0.4rem 0; border-bottom: 1px dashed var(--border-subtle); font-size: 0.88rem;">
            <span>Premium Fabric:</span>
            <strong>PKR ${wizardOrderData.pricing.fabric.toLocaleString()}</strong>
          </div>` : ''}
          <div style="display: flex; justify-content: space-between; padding: 0.4rem 0; border-bottom: 1px dashed var(--border-subtle); font-size: 0.88rem;">
            <span>Embroidery / Lacing Placement:</span>
            <strong>PKR ${wizardOrderData.pricing.embroidery.toLocaleString()}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 0.4rem 0; border-bottom: 1px dashed var(--border-subtle); font-size: 0.88rem;">
            <span>Fabric Pickup:</span>
            <strong>PKR ${wizardOrderData.pricing.pickup.toLocaleString()}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 0.4rem 0; border-bottom: 1px dashed var(--border-subtle); font-size: 0.88rem;">
            <span>Home Delivery:</span>
            <strong>PKR ${wizardOrderData.pricing.delivery.toLocaleString()}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 0.4rem 0; border-bottom: 1px dashed var(--border-subtle); font-size: 0.88rem;">
            <span>AI Platform Fee:</span>
            <strong>PKR ${wizardOrderData.pricing.platformFee.toLocaleString()}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 0.75rem 0 0 0; font-size: 1.2rem; font-weight: 800; color: var(--primary-800);">
            <span>TOTAL:</span>
            <span style="color: var(--gold-600);">PKR ${wizardOrderData.pricing.total.toLocaleString()}</span>
          </div>
        </div>
      `;
      break;

    case 8:
      indicator.innerText = `Step 8 of 9 — Payment Method`;
      container.innerHTML = `
        <h4 style="margin-bottom: 0.5rem; color: var(--primary-800);">Select Payment Option</h4>
        <div style="display: flex; flex-direction: column; gap: 0.75rem;">
          <label style="display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem; border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); cursor: pointer;">
            <input type="radio" name="payMethod" value="cash_on_delivery" ${wizardOrderData.payment.method === 'cash_on_delivery' ? 'checked' : ''} onchange="wizardOrderData.payment.method = this.value">
            <div>
              <strong>Cash on Pickup / Delivery (Recommended)</strong>
              <p style="font-size: 0.78rem; color: var(--text-muted);">Pay when your finished stitched suit arrives at your doorstep.</p>
            </div>
          </label>
          <label style="display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem; border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); cursor: pointer;">
            <input type="radio" name="payMethod" value="jazzcash_easypaisa" ${wizardOrderData.payment.method === 'jazzcash_easypaisa' ? 'checked' : ''} onchange="wizardOrderData.payment.method = this.value">
            <div>
              <strong>JazzCash / EasyPaisa Mobile Wallet</strong>
              <p style="font-size: 0.78rem; color: var(--text-muted);">Instant mobile transfer with payment protection guarantee.</p>
            </div>
          </label>
          <label style="display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem; border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); cursor: pointer;">
            <input type="radio" name="payMethod" value="deposit_50_50" ${wizardOrderData.payment.method === 'deposit_50_50' ? 'checked' : ''} onchange="wizardOrderData.payment.method = this.value">
            <div>
              <strong>50% Advance Deposit / 50% on Delivery</strong>
              <p style="font-size: 0.78rem; color: var(--text-muted);">Pay half now, remaining after quality check.</p>
            </div>
          </label>
        </div>
      `;
      break;

    case 9:
      indicator.innerText = `Step 9 of 9 — Order Confirmation`;
      container.innerHTML = `
        <div style="text-align: center; margin-bottom: 1.25rem;">
          <div style="font-size: 3rem; margin-bottom: 0.5rem;">🎉</div>
          <h3 style="color: var(--primary-800);">Ready to Submit Order!</h3>
          <p style="font-size: 0.88rem; color: var(--text-muted);">Your automated Tailor Order Sheet will be generated and dispatched immediately to ${wizardOrderData.tailorName}.</p>
        </div>
        <div class="panel-card" style="font-size: 0.85rem; line-height: 1.6;">
          <div>Customer: <strong>${wizardOrderData.customerName} (${wizardOrderData.customerPhone})</strong></div>
          <div>Garment: <strong>${wizardOrderData.garmentType}</strong></div>
          <div>Design: <strong>${wizardOrderData.designTitle}</strong></div>
          <div>Delivery Address: <strong>${wizardOrderData.customerAddress}</strong></div>
          <div>Total Amount: <strong style="color: var(--gold-600);">PKR ${wizardOrderData.pricing.total.toLocaleString()}</strong></div>
          <div>Payment: <strong>${wizardOrderData.payment.method.toUpperCase()}</strong></div>
        </div>
      `;
      break;
  }
}

function renderGarmentOption(name, desc, icon) {
  const isSelected = wizardOrderData.garmentType === name;
  return `
    <div style="padding: 0.85rem; border: 1px solid ${isSelected ? 'var(--gold-500)' : 'var(--border-subtle)'}; background: ${isSelected ? 'var(--primary-50)' : 'var(--bg-surface)'}; border-radius: var(--radius-md); cursor: pointer;" onclick="wizardOrderData.garmentType = '${name}'; renderWizardStep();">
      <div style="font-size: 1.5rem; margin-bottom: 0.25rem;">${icon}</div>
      <strong style="font-size: 0.9rem; color: var(--primary-800);">${name}</strong>
      <p style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.15rem;">${desc}</p>
    </div>
  `;
}

function wizardPrevStep() {
  if (currentWizardStep > 1) {
    currentWizardStep--;
    renderWizardStep();
  }
}

async function wizardNextStep() {
  if (currentWizardStep < TOTAL_WIZARD_STEPS) {
    currentWizardStep++;
    renderWizardStep();
  } else {
    // Step 9 Submit
    await submitOrder();
  }
}

async function submitOrder() {
  const nextBtn = document.getElementById('wizardNextBtn');
  nextBtn.innerText = 'Submitting Order...';
  nextBtn.disabled = true;

  try {
    const user = window.getCurrentUser ? window.getCurrentUser() : null;
    const token = window.getAuthToken ? window.getAuthToken() : null;

    const payload = {
      customerId: user ? user._id : 'guest_user',
      customerName: wizardOrderData.customerName || (user ? user.name : 'Customer'),
      customerPhone: wizardOrderData.customerPhone || (user ? user.phone : '+92 300 1234567'),
      customerCity: wizardOrderData.customerCity || (user ? user.city : 'Karachi'),
      customerAddress: wizardOrderData.customerAddress || (user ? user.address : 'Karachi'),
      tailorId: wizardOrderData.tailorId,
      tailorName: wizardOrderData.tailorName,
      garmentCategory: wizardOrderData.garmentCategory,
      garmentType: wizardOrderData.garmentType,
      designTitle: wizardOrderData.designTitle,
      designDetails: wizardOrderData.designDetails,
      measurements: wizardOrderData.measurements,
      fabricOption: wizardOrderData.fabricOption,
      fabricName: wizardOrderData.fabricName,
      fabricColor: wizardOrderData.fabricColor,
      logisticsOption: wizardOrderData.logisticsOption,
      pricing: wizardOrderData.pricing,
      payment: wizardOrderData.payment
    };

    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const url = window.apiUrl ? window.apiUrl('/api/orders') : '/api/orders';
    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });
    const result = await res.json();

    if (result.success && result.data) {
      closeOrderWizard();
      window.showToast(`Order #${result.data.orderNumber} placed successfully!`);
      window.navigateTo('orders');
      if (window.fetchOrders) window.fetchOrders();
      // Show tailor order sheet
      window.openOrderSheetModal(result.data.tailorOrderSheet);
    }
  } catch (error) {
    console.error('Order submission error:', error);
    window.showToast('Order saved! Redirecting to orders tracker...');
    closeOrderWizard();
    window.navigateTo('orders');
  } finally {
    nextBtn.disabled = false;
  }
}

// Global exports
window.openOrderWizard = openOrderWizard;
window.closeOrderWizard = closeOrderWizard;
window.wizardPrevStep = wizardPrevStep;
window.wizardNextStep = wizardNextStep;
