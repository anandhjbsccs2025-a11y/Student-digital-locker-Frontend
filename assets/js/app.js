/* Student Details Locker - Shared App JS */
(function(){
  // Apply saved theme
  try {
    const theme = localStorage.getItem('sl_theme') || 'light';
    if(theme === 'dark') document.body.classList.add('dark-mode');
  } catch (err) {
    console.warn('Theme init failed:', err);
  }
})();

function syncThemeToggle(){
  const toggle = document.querySelector('.theme-toggle');
  if(!toggle) return;
  const isDark = document.body.classList.contains('dark-mode');
  toggle.classList.toggle('active', isDark);
  toggle.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
}

// ---- Toast ----
function slToast(msg, type='info'){
  const t = document.createElement('div');
  t.className = 'sl-toast ' + type;
  t.innerHTML = `<i class="fas fa-${type==='success'?'check-circle':type==='error'?'times-circle':'info-circle'} me-2"></i>${msg}`;
  document.body.appendChild(t);
  requestAnimationFrame(()=>t.classList.add('show'));
  setTimeout(()=>{ t.classList.remove('show'); setTimeout(()=>t.remove(), 300); }, 2800);
}

// ---- Loader ----
function slLoader(show){
  let l = document.getElementById('sl-full-loader');
  if(!l){
    l = document.createElement('div');
    l.id = 'sl-full-loader';
    l.className = 'full-loader';
    l.innerHTML = '<span class="loader"></span>';
    document.body.appendChild(l);
  }
  l.classList.toggle('show', !!show);
}

// ---- Password visibility toggle ----
document.addEventListener('click', (e)=>{
  const btn = e.target.closest('.toggle-pw');
  if(!btn) return;
  const input = btn.parentElement?.querySelector('input');
  if(!input) return;
  input.type = input.type === 'password' ? 'text' : 'password';
  btn.innerHTML = input.type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
});

// ---- Sidebar toggle ----
document.addEventListener('click', (e)=>{
  const sidebar = document.querySelector('.sl-sidebar');
  const backdrop = document.querySelector('.sl-backdrop');
  if(e.target.closest('#sidebarToggle')){
    sidebar?.classList.toggle('open');
    backdrop?.classList.toggle('show');
  }
  if(e.target.classList.contains('sl-backdrop')){
    sidebar?.classList.remove('open');
    e.target.classList.remove('show');
  }
});

// ---- Logout ----
function slLogout(){
  localStorage.removeItem('sl_user');
  slToast('Logged out successfully', 'success');
  setTimeout(()=>location.href='index.html', 600);
}

function slSetTheme(mode){
  document.body.classList.add('theme-switching');
  document.body.classList.toggle('dark-mode', mode==='dark');
  try {
    localStorage.setItem('sl_theme', mode);
  } catch (err) {
    console.warn('Theme save failed:', err);
  }
  syncThemeToggle();
  setTimeout(()=>document.body.classList.remove('theme-switching'), 450);
}

// Mark active sidebar link
document.addEventListener('DOMContentLoaded', ()=>{
  const page = location.pathname.split('/').pop();
  document.querySelectorAll('.sl-sidebar a.nav-item').forEach(a=>{
    if(a.getAttribute('href') === page) a.classList.add('active');
  });
  // Personalize welcome
  let user = {};
  try {
    user = JSON.parse(localStorage.getItem('sl_user') || '{}');
  } catch (err) {
    console.warn('User profile init failed:', err);
  }
  document.querySelectorAll('[data-user-name]').forEach(el=>{
    el.textContent = user.name || 'Student';
  });
  syncThemeToggle();
  document.body.classList.add('page-ready');
});

// ---- Page transition ----
document.addEventListener('click', (e)=>{
  const link = e.target.closest('a[href]');
  if(!link) return;
  const href = link.getAttribute('href') || '';
  if(!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('javascript:')) return;
  const isExternal = /^https?:/i.test(href);
  if(isExternal) return;
  const target = new URL(href, window.location.href);
  if(target.origin !== window.location.origin) return;
  if(link.target || href === window.location.pathname.split('/').pop()) return;
  e.preventDefault();
  document.body.classList.add('page-transitioning');
  setTimeout(()=>{ window.location.href = href; }, 180);
});
