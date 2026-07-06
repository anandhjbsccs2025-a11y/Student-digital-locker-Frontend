/* Login + registration handlers */
function handleLogin(formId, role){
  const form = document.getElementById(formId);
  if(!form) return;
  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    const emailInput = form.elements.email;
    const passwordInput = form.elements.password;
    if(!emailInput || !passwordInput) return slToast('Please fill in the login form', 'error');
    const email = (emailInput.value || '').trim();
    const pw = passwordInput.value || '';
    if(!isEmail(email)) return slToast('Please enter a valid email', 'error');
    if(pw.length < 6) return slToast('Password must be at least 6 characters', 'error');
    slLoader(true);
    setTimeout(()=>{
      slLoader(false);
      const name = email.split('@')[0].replace(/[._]/g,' ').replace(/\b\w/g, c=>c.toUpperCase());
      try {
        localStorage.setItem('sl_user', JSON.stringify({name, email, role}));
      } catch (err) {
        console.warn('Login save failed:', err);
      }
      slToast('Login successful', 'success');
      setTimeout(()=>location.href = role==='teacher' ? 'teacher-dashboard.html' : 'student-dashboard.html', 500);
    }, 900);
  });
}

function handleRegister(formId){
  const form = document.getElementById(formId);
  if(!form) return;
  const pw = form.elements.password;
  const meter = form.querySelector('.pw-meter');
  if(pw && meter) bindStrengthMeter(pw, meter);
  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    const fullName = (form.elements.fullName?.value || '').trim();
    const registerNumber = (form.elements.registerNumber?.value || '').trim();
    const department = (form.elements.department?.value || '').trim();
    const year = (form.elements.year?.value || '').trim();
    const umis = (form.elements.umis?.value || '').trim();
    const email = (form.elements.email?.value || '').trim();
    const mobile = (form.elements.mobile?.value || '').trim();
    const password = form.elements.password?.value || '';
    const confirmPassword = form.elements.confirmPassword?.value || '';

    if(!fullName || fullName.length < 3) return slToast('Enter your full name', 'error');
    if(!registerNumber) return slToast('Register number required', 'error');
    if(!department) return slToast('Select a department', 'error');
    if(!umis) return slToast('UMIS number required', 'error');
    if(!isEmail(email)) return slToast('Enter a valid college email', 'error');
    if(!isMobile(mobile)) return slToast('Enter a valid 10-digit mobile', 'error');
    if(password !== confirmPassword) return slToast('Passwords do not match', 'error');
    if(passwordStrength(password) < 2) return slToast('Password too weak', 'error');

    // Save personal details immediately so profile can become read-only.
    try {
      const profile = {
        name: fullName,
        reg: registerNumber,
        dept: department,
        cls: year,
        umis,
        mob: mobile,
        email,
      };
      localStorage.setItem('sl_profile', JSON.stringify(profile));
      localStorage.setItem('sl_profile_completed', JSON.stringify(true));
    } catch (err) {
      console.warn('Profile save failed:', err);
    }

    slLoader(true);
    setTimeout(()=>{
      slLoader(false);
      slToast('Registration successful! Redirecting to login...', 'success');
      setTimeout(()=>location.href='index.html', 900);
    }, 900);
  });
}

// ---- Teacher Registration ----
function handleTeacherRegister(formId){
  const form = document.getElementById(formId);
  if(!form) return;

  const pw = form.elements.password;
  const meter = form.querySelector('.pw-meter');
  if(pw && meter) bindStrengthMeter(pw, meter);

  form.addEventListener('submit', (e)=>{
    e.preventDefault();

    const fullName = (form.elements.fullName?.value || '').trim();
    const teacherId = (form.elements.teacherId?.value || '').trim();
    const email = (form.elements.email?.value || '').trim();
    const phone = (form.elements.phone?.value || '').trim();
    const department = (form.elements.department?.value || '').trim();
    const designation = (form.elements.designation?.value || '').trim();
    const password = form.elements.password?.value || '';
    const confirmPassword = form.elements.confirmPassword?.value || '';

    if(!fullName || fullName.length < 3) return slToast('Enter teacher full name', 'error');
    if(!teacherId) return slToast('Teacher ID required', 'error');
    if(!isEmail(email)) return slToast('Enter a valid email address', 'error');
    if(!isMobile(phone)) return slToast('Enter a valid 10-digit phone number', 'error');
    if(!department) return slToast('Select a department', 'error');
    if(!designation || designation.length < 2) return slToast('Enter designation', 'error');
    if(password !== confirmPassword) return slToast('Passwords do not match', 'error');
    if(passwordStrength(password) < 2) return slToast('Password too weak', 'error');

    let teachers = [];
    try {
      teachers = JSON.parse(localStorage.getItem('sl_teacher_users') || '[]');
      if(!Array.isArray(teachers)) teachers = [];
    } catch (err) {
      teachers = [];
    }

    const emailLower = (email || '').toLowerCase();
    const idLower = (teacherId || '').toLowerCase();
    const exists = teachers.some(t => (t.email || '').toLowerCase() === emailLower || (t.teacherId || '').toLowerCase() === idLower);
    if(exists) return slToast('Teacher account already exists', 'error');

    teachers.push({
      fullName,
      teacherId,
      email,
      phone,
      department,
      designation,
      password, // demo app stores plaintext in localStorage
      createdAt: Date.now(),
    });

    try {
      localStorage.setItem('sl_teacher_users', JSON.stringify(teachers));
    } catch (err) {
      console.warn('Teacher register save failed:', err);
      return slToast('Failed to save teacher account', 'error');
    }

    slLoader(true);
    setTimeout(()=>{
      slLoader(false);
      slToast('Teacher registration successful! Redirecting to login...', 'success');
      setTimeout(()=>location.href='teacher-login.html', 900);
    }, 900);
  });
}

function handleTeacherLogin(formId){
  const form = document.getElementById(formId);
  if(!form) return;

  form.addEventListener('submit', (e)=>{
    e.preventDefault();

    const emailInput = form.elements.email;
    const passwordInput = form.elements.password;
    if(!emailInput || !passwordInput) return slToast('Please fill in the login form', 'error');

    const email = (emailInput.value || '').trim();
    const pw = passwordInput.value || '';

    if(!isEmail(email)) return slToast('Please enter a valid email', 'error');
    if(pw.length < 6) return slToast('Invalid password', 'error');

    let teachers = [];
    try {
      teachers = JSON.parse(localStorage.getItem('sl_teacher_users') || '[]');
      if(!Array.isArray(teachers)) teachers = [];
    } catch (err) {
      teachers = [];
    }

    const emailLower = email.toLowerCase();
    const user = teachers.find(t => (t.email || '').toLowerCase() === emailLower && (t.password || '') === pw);
    if(!user) return slToast('Invalid teacher credentials', 'error');

    slLoader(true);
    setTimeout(()=>{
      slLoader(false);
      try {
        localStorage.setItem('sl_user', JSON.stringify({
          name: user.fullName,
          email: user.email,
          role: 'teacher',
          teacherId: user.teacherId,
        }));
      } catch (err) {
        console.warn('Teacher login save failed:', err);
      }
      slToast('Login successful', 'success');
      setTimeout(()=>location.href='teacher-dashboard.html', 500);
    }, 900);
  });
}

