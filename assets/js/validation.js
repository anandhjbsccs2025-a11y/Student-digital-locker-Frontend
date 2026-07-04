/* Reusable validators */
function isEmail(v){return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v||'')}
function isMobile(v){return /^[6-9]\d{9}$/.test(v||'')}
function passwordStrength(v){
  let s = 0;
  if(!v) return 0;
  if(v.length >= 6) s++;
  if(v.length >= 10) s++;
  if(/[A-Z]/.test(v) && /[a-z]/.test(v)) s++;
  if(/\d/.test(v)) s++;
  if(/[^A-Za-z0-9]/.test(v)) s++;
  return Math.min(s,4);
}
function bindStrengthMeter(input, meter){
  if(!input || !meter) return;
  const bar = meter.querySelector('.bar');
  if(!bar) return;
  input.addEventListener('input', ()=>{
    const s = passwordStrength(input.value);
    const pct = [0,25,50,75,100][s];
    const color = ['#e11d48','#e11d48','#f59e0b','#3b82f6','#16a34a'][s];
    bar.style.width = pct + '%';
    bar.style.background = color;
  });
}
