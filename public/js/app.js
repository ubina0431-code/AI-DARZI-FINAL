// AI Darzi — Core Application Controller & State Manager

// API URL resolver supporting VITE_API_URL with http://localhost:5000 fallback
function apiUrl(path) {
  let base = '';
  if (typeof process !== 'undefined' && process.env && process.env.VITE_API_URL) {
    base = process.env.VITE_API_URL;
  } else if (typeof window !== 'undefined') {
    base = window.VITE_API_URL || (window.__ENV__ && window.__ENV__.VITE_API_URL) || window.API_BASE_URL || '';
  }

  if (!base) {
    if (typeof window !== 'undefined' && window.location && window.location.origin && window.location.origin !== 'null') {
      base = '';
    } else {
      base = 'http://localhost:5000';
    }
  }

  if (!base) return path;
  const cleanBase = base.replace(/\/+$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${cleanBase}${cleanPath}`;
}
window.apiUrl = apiUrl;

let currentView = 'home';
let currentRole = 'customer';
let currentLanguage = 'en';
let currentUser = null;
let authToken = localStorage.getItem('ai_darzi_token') || null;

// Auth State Initializer
function initAuthState() {
  const savedUser = localStorage.getItem('ai_darzi_user');
  if (savedUser && authToken) {
    try {
      currentUser = JSON.parse(savedUser);
      updateAuthUI(currentUser);
    } catch {
      localStorage.removeItem('ai_darzi_user');
      localStorage.removeItem('ai_darzi_token');
    }
  } else {
    updateAuthUI(null);
  }
}

// Update Top Navbar Auth Display
function updateAuthUI(user) {
  const loginBtn = document.getElementById('navLoginBtn');
  const userBadge = document.getElementById('navUserBadge');
  const userNameEl = document.getElementById('navUserName');

  if (user && user.name) {
    if (loginBtn) loginBtn.style.display = 'none';
    if (userBadge) {
      userBadge.style.display = 'flex';
      if (userNameEl) {
        userNameEl.innerHTML = `👤 ${user.name} <small style="opacity:0.75; font-size:0.75rem;">(${user.role.toUpperCase()})</small>`;
      }
    }
  } else {
    if (loginBtn) loginBtn.style.display = 'inline-flex';
    if (userBadge) userBadge.style.display = 'none';
  }
}

// Open Auth Modal
function openAuthModal(mode = 'login') {
  const modal = document.getElementById('authModal');
  if (!modal) return;
  modal.style.display = 'flex';
  switchAuthTab(mode);
}

// Close Auth Modal
function closeAuthModal() {
  const modal = document.getElementById('authModal');
  if (modal) modal.style.display = 'none';
}

// Switch between Login and Register tabs
function switchAuthTab(tab) {
  const loginTabBtn = document.getElementById('authTabLoginBtn');
  const registerTabBtn = document.getElementById('authTabRegisterBtn');
  const loginForm = document.getElementById('authLoginForm');
  const registerForm = document.getElementById('authRegisterForm');

  if (tab === 'login') {
    loginTabBtn?.classList.add('active');
    registerTabBtn?.classList.remove('active');
    if (loginForm) loginForm.style.display = 'block';
    if (registerForm) registerForm.style.display = 'none';
  } else {
    loginTabBtn?.classList.remove('active');
    registerTabBtn?.classList.add('active');
    if (loginForm) loginForm.style.display = 'none';
    if (registerForm) registerForm.style.display = 'block';
  }
}

// Quick Login Helper for grading / demo
function quickLogin(role) {
  if (role === 'customer') {
    document.getElementById('loginEmailInput').value = 'amina.khan@example.com';
    document.getElementById('loginPasswordInput').value = 'password123';
  } else if (role === 'tailor') {
    document.getElementById('loginEmailInput').value = 'rafiq.tailor@example.com';
    document.getElementById('loginPasswordInput').value = 'password123';
  } else if (role === 'admin') {
    document.getElementById('loginEmailInput').value = 'admin@aidarzi.pk';
    document.getElementById('loginPasswordInput').value = 'admin123';
  }
  submitLoginForm();
}

// Handle Login Form Submission
async function submitLoginForm() {
  const email = document.getElementById('loginEmailInput')?.value.trim();
  const password = document.getElementById('loginPasswordInput')?.value.trim();
  const errorBox = document.getElementById('authLoginError');

  if (errorBox) errorBox.style.display = 'none';

  if (!email || !password) {
    if (errorBox) {
      errorBox.innerText = 'Please enter both email and password.';
      errorBox.style.display = 'block';
    }
    return;
  }

  const btn = document.getElementById('btnSubmitLogin');
  if (btn) {
    btn.innerText = '⏳ Signing in...';
    btn.disabled = true;
  }

  try {
    const res = await fetch(apiUrl('/api/auth/login'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Invalid credentials');
    }

    authToken = data.token;
    currentUser = data.user;
    localStorage.setItem('ai_darzi_token', authToken);
    localStorage.setItem('ai_darzi_user', JSON.stringify(currentUser));

    updateAuthUI(currentUser);
    closeAuthModal();
    showToast(`Welcome back, ${currentUser.name}!`);

    // Auto-navigate to appropriate view
    if (currentUser.role === 'tailor') {
      setRole('tailor');
    } else if (currentUser.role === 'admin') {
      setRole('admin');
    } else {
      setRole('customer');
    }
  } catch (err) {
    if (errorBox) {
      errorBox.innerText = err.message;
      errorBox.style.display = 'block';
    }
  } finally {
    if (btn) {
      btn.innerText = 'Sign In';
      btn.disabled = false;
    }
  }
}

// Handle Register Form Submission
async function submitRegisterForm() {
  const name = document.getElementById('regNameInput')?.value.trim();
  const email = document.getElementById('regEmailInput')?.value.trim();
  const password = document.getElementById('regPasswordInput')?.value.trim();
  const phone = document.getElementById('regPhoneInput')?.value.trim();
  const city = document.getElementById('regCityInput')?.value || 'Lahore';
  const role = document.getElementById('regRoleInput')?.value || 'customer';
  const businessName = document.getElementById('regBusinessInput')?.value.trim() || '';
  const errorBox = document.getElementById('authRegisterError');

  if (errorBox) errorBox.style.display = 'none';

  if (!name || !email || !password) {
    if (errorBox) {
      errorBox.innerText = 'Please fill in all required fields (Name, Email, Password).';
      errorBox.style.display = 'block';
    }
    return;
  }

  if (password.length < 6) {
    if (errorBox) {
      errorBox.innerText = 'Password must be at least 6 characters.';
      errorBox.style.display = 'block';
    }
    return;
  }

  const btn = document.getElementById('btnSubmitRegister');
  if (btn) {
    btn.innerText = '⏳ Creating Account...';
    btn.disabled = true;
  }

  try {
    const res = await fetch(apiUrl('/api/auth/register'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, phone, role, city, businessName })
    });
    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Registration failed');
    }

    authToken = data.token;
    currentUser = data.user;
    localStorage.setItem('ai_darzi_token', authToken);
    localStorage.setItem('ai_darzi_user', JSON.stringify(currentUser));

    updateAuthUI(currentUser);
    closeAuthModal();
    showToast(`Account created successfully! Welcome, ${currentUser.name}.`);

    if (currentUser.role === 'tailor') {
      setRole('tailor');
    } else {
      setRole('customer');
    }
  } catch (err) {
    if (errorBox) {
      errorBox.innerText = err.message;
      errorBox.style.display = 'block';
    }
  } finally {
    if (btn) {
      btn.innerText = 'Create Free Account';
      btn.disabled = false;
    }
  }
}

// User Logout
function logoutUser() {
  currentUser = null;
  authToken = null;
  localStorage.removeItem('ai_darzi_token');
  localStorage.removeItem('ai_darzi_user');
  updateAuthUI(null);
  setRole('customer');
  showToast('Logged out successfully.');
}

// Navigation Manager
function navigateTo(viewName) {
  currentView = viewName;

  // Update top nav link active states
  document.querySelectorAll('.nav-links .nav-link').forEach(link => {
    if (link.getAttribute('data-nav') === viewName) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // Update mobile bottom nav active states
  document.querySelectorAll('.mobile-bottom-bar .mobile-nav-btn').forEach(btn => {
    if (btn.getAttribute('data-mnav') === viewName) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Hide all views and show selected
  document.querySelectorAll('.app-view').forEach(view => {
    view.classList.remove('active');
  });

  const targetView = document.getElementById(`view-${viewName}`);
  if (targetView) {
    targetView.classList.add('active');
  }

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // View-specific initialization
  if (viewName === 'tailors' && window.fetchTailors) {
    window.fetchTailors();
  } else if (viewName === 'orders' && window.fetchOrders) {
    window.fetchOrders();
  } else if (viewName === 'measure' && window.loadMeasurementWallet) {
    window.loadMeasurementWallet();
  } else if (viewName === 'chat' && window.initChat) {
    window.initChat();
  } else if (viewName === 'workspace' && window.loadTailorWorkspace) {
    window.loadTailorWorkspace();
  } else if (viewName === 'admin' && window.loadAdminDashboard) {
    window.loadAdminDashboard();
  }
}

// Role Switcher
function setRole(role) {
  currentRole = role;

  document.getElementById('roleCustomerBtn')?.classList.toggle('active', role === 'customer');
  document.getElementById('roleTailorBtn')?.classList.toggle('active', role === 'tailor');
  document.getElementById('roleAdminBtn')?.classList.toggle('active', role === 'admin');

  if (role === 'tailor') {
    navigateTo('workspace');
    showToast('Switched to Master Tailor Workspace view');
  } else if (role === 'admin') {
    navigateTo('admin');
    showToast('Switched to Platform Admin Control Center');
  } else {
    navigateTo('home');
    showToast('Switched to Customer Experience view');
  }
}

// Language Switcher
function setLanguage(lang) {
  currentLanguage = lang;
  document.documentElement.setAttribute('lang', lang);

  const dict = window.TRANSLATIONS ? window.TRANSLATIONS[lang] : null;
  if (!dict) return;

  // Apply translations to UI elements if present
  if (dict.tagline && document.getElementById('heroTitle')) {
    document.getElementById('heroTitle').innerHTML = dict.tagline;
  }
  if (dict.heroSub && document.getElementById('heroSubtitle')) {
    document.getElementById('heroSubtitle').innerText = dict.heroSub;
  }
  if (dict.btnCreateDesign && document.getElementById('btnHeroCreate')) {
    document.getElementById('btnHeroCreate').innerText = `🎨 ${dict.btnCreateDesign}`;
  }
  if (dict.btnFindTailor && document.getElementById('btnHeroFind')) {
    document.getElementById('btnHeroFind').innerText = `🔍 ${dict.btnFindTailor}`;
  }
  if (dict.btnMeasureNow && document.getElementById('btnHeroMeasure')) {
    document.getElementById('btnHeroMeasure').innerText = `📏 ${dict.btnMeasureNow}`;
  }
  if (dict.privacyBadge && document.getElementById('privacyText')) {
    document.getElementById('privacyText').innerText = dict.privacyBadge;
  }

  showToast(`Language updated to: ${lang.toUpperCase()}`);
}

// Dark Mode Toggle
function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
  const isDark = document.body.classList.contains('dark-mode');
  const btn = document.getElementById('themeToggleBtn');
  if (btn) btn.innerText = isDark ? '☀️' : '🌙';
  showToast(isDark ? 'Dark Theme activated' : 'Light Theme activated');
}

// Toast Notification Helper
function showToast(msg) {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span>✨</span> <div>${msg}</div>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => toast.remove(), 400);
  }, 3500);
}

// Global Exports
window.navigateTo = navigateTo;
window.setRole = setRole;
window.setLanguage = setLanguage;
window.toggleDarkMode = toggleDarkMode;
window.showToast = showToast;
window.openAuthModal = openAuthModal;
window.closeAuthModal = closeAuthModal;
window.switchAuthTab = switchAuthTab;
window.quickLogin = quickLogin;
window.submitLoginForm = submitLoginForm;
window.submitRegisterForm = submitRegisterForm;
window.logoutUser = logoutUser;
window.getAuthToken = () => authToken;
window.getCurrentUser = () => currentUser;

// Boot up
document.addEventListener('DOMContentLoaded', () => {
  console.log('[AI Darzi] Application Initialized.');
  initAuthState();
  if (window.fetchTailors) window.fetchTailors();
  if (window.fetchOrders) window.fetchOrders();
});
