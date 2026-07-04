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
    const email = (form.elements.email?.value || '').trim();
    const mobile = (form.elements.mobile?.value || '').trim();
    const password = form.elements.password?.value || '';
    const confirmPassword = form.elements.confirmPassword?.value || '';
    if(!fullName || fullName.length < 3) return slToast('Enter your full name', 'error');
    if(!registerNumber) return slToast('Register number required', 'error');
    if(!department) return slToast('Select a department', 'error');
    if(!isEmail(email)) return slToast('Enter a valid college email', 'error');
    if(!isMobile(mobile)) return slToast('Enter a valid 10-digit mobile', 'error');
    if(password !== confirmPassword) return slToast('Passwords do not match', 'error');
    if(passwordStrength(password) < 2) return slToast('Password too weak', 'error');
    slLoader(true);
    setTimeout(()=>{
      slLoader(false);
      slToast('Registration successful! Redirecting to login...', 'success');
      setTimeout(()=>location.href='index.html', 900);
    }, 900);
  });
}
