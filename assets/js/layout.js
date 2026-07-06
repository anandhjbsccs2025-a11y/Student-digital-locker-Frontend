/* Shared layout injector for dashboard pages */
const STUDENT_MENU_BASE = [
  ['student-dashboard.html','fa-th-large','Dashboard'],
  ['profile.html','fa-user','Profile'],
  // Removed Personal Documents from dashboard/sidebar as requested.
  ['online-certificates.html','fa-cloud','Online Certificates'],
  ['offline-certificates.html','fa-folder-open','Offline Certificates'],
  ['academic-certificates.html','fa-graduation-cap','Academic Certificates'],
];


const STUDENT_MENU = STUDENT_MENU_BASE;
const TEACHER_MENU = [
  ['teacher-dashboard.html','fa-th-large','Dashboard'],
  ['add-student.html','fa-user-plus','Add Student'],
  ['search-student.html','fa-search','Search Student'],
  ['teacher-profile.html','fa-user','Profile'],
];


function renderLayout(){
  const app = document.querySelector('[data-layout]');
  if(!app) return;
  const role = app.getAttribute('data-layout'); // 'student' | 'teacher'

  // ---- Role Guard (client-side) ----
  let user = {};
  try {
    user = JSON.parse(localStorage.getItem('sl_user')||'{}');
  } catch (err) {
    console.warn('Layout user init failed:', err);
  }
  const loggedRole = user.role;
  if(loggedRole && loggedRole !== role){
    // Prevent cross-portal access
    location.href = loggedRole === 'teacher' ? 'teacher-dashboard.html' : 'student-dashboard.html';
    return;
  }

  let menu = role==='teacher' ? TEACHER_MENU : STUDENT_MENU;
  const name = user.name || (role==='teacher'?'Teacher':'Student');

  const sidebar = `
    <aside class="sl-sidebar">
      <a class="sl-brand" href="${role==='teacher'?'teacher-dashboard.html':'student-dashboard.html'}">
        <i class="fas fa-graduation-cap"></i> Student Locker
      </a>
      <nav>
        ${menu.map(([h,i,l])=>`<a class="nav-item" href="${h}"><i class="fas ${i}"></i>${l}</a>`).join('')}
        <a class="nav-item" href="#" onclick="event.preventDefault();slLogout()"><i class="fas fa-sign-out-alt"></i>Logout</a>
      </nav>
    </aside>
    <div class="sl-backdrop"></div>
  `;
  const navbar = `
    <header class="sl-navbar">
      <button class="icon-btn d-lg-none" id="sidebarToggle" aria-label="Menu"><i class="fas fa-bars"></i></button>
      <div class="sl-brand d-lg-none"><i class="fas fa-graduation-cap"></i></div>
      <div class="d-none d-md-block">
        <strong>Welcome, ${role==='teacher'?'Prof. ':''}<span data-user-name>${name}</span></strong>
        <div class="text-muted" style="font-size:.85rem">${role==='teacher'?'Teacher':'Student'} Portal</div>
      </div>
      <div class="spacer"></div>
      <select class="form-select form-select-sm lang-select" aria-label="Language">
        <option value="en">EN</option>
        <option value="hi">HI</option>
        <option value="ta">TA</option>
        <option value="te">TE</option>
      </select>
      <button class="icon-btn theme-toggle" type="button" onclick="slSetTheme(document.body.classList.contains('dark-mode') ? 'light' : 'dark')" aria-label="Toggle theme"><i class="fas fa-sun"></i><i class="fas fa-moon"></i></button>
      <a href="${role==='teacher'?'teacher-profile.html':'profile.html'}" class="icon-btn" aria-label="Profile"><i class="fas fa-user-circle" style="font-size:1.4rem"></i></a>
    </header>
  `;

  const content = app.innerHTML;
  app.classList.add('sl-app');
  app.innerHTML = sidebar + `<main class="sl-main">${navbar}<div class="sl-content">${content}</div></main>`;

  const langSelect = app.querySelector('.lang-select');
  if(langSelect){
    const savedLang = localStorage.getItem('sl_lang') || 'en';
    langSelect.value = savedLang;
    langSelect.addEventListener('change', ()=>{
      localStorage.setItem('sl_lang', langSelect.value);
      document.documentElement.lang = langSelect.value;
      // app.js defines slToast; guard to avoid ReferenceError if script load order differs.
      if(typeof slToast === 'function') slToast('Language updated', 'success');
    });
  }
}

document.addEventListener('DOMContentLoaded', renderLayout);
