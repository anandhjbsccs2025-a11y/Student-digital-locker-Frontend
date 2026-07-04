/* Dashboard-specific interactions */

// ---- Document store (localStorage) ----
const DOC_KEY = 'sl_docs';
function getDocs(){ try{return JSON.parse(localStorage.getItem(DOC_KEY)||'[]')}catch(e){return []} }
function saveDocs(list){ localStorage.setItem(DOC_KEY, JSON.stringify(list)) }
function addDoc(doc){ const l = getDocs(); l.push(Object.assign({id:Date.now(), uploaded:new Date().toISOString()}, doc)); saveDocs(l); return l }
function deleteDoc(id){ saveDocs(getDocs().filter(d=>d.id!==id)) }
function countByCategory(cat){ return getDocs().filter(d=>d.category===cat).length }

// Render count badges on dashboard cards
document.addEventListener('DOMContentLoaded', ()=>{
  document.querySelectorAll('[data-doc-count]').forEach(el=>{
    const cat = el.getAttribute('data-doc-count');
    el.textContent = countByCategory(cat) + ' documents';
  });

  renderDashboardInsights();
});

function renderDashboardInsights(){
  const hero = document.querySelector('.welcome-hero');
  if(!hero) return;

  const existing = document.querySelector('.sl-insights');
  if(existing) existing.remove();

  const docs = getDocs();
  const totalDocs = docs.length;
  const categories = ['personal','online','offline','academic'];
  const filledCategories = categories.filter(c=>countByCategory(c)>0).length;
  const pendingApprovals = getStudents().filter(s=>!s.verified).length;
  const isTeacher = !!document.querySelector('[data-layout="teacher"]');

  // Removed student "Locker health" insights per new requirements.
  // Teacher insights remain unchanged.
  const title = isTeacher ? 'Verification queue' : '';
  const summary = isTeacher
    ? `${pendingApprovals} students awaiting review`
    : '';
  const note = isTeacher
    ? 'Keep the approval flow fast and organized.'
    : '';
  const stats = isTeacher
    ? [`${pendingApprovals} pending`, `${totalDocs} files tracked`]
    : [];

  if(!isTeacher){
    // Do not render the insights block for student dashboards.
    return;
  }


  hero.insertAdjacentHTML('afterend', `
    <div class="sl-insights">
      <div class="insight-copy">
        <h5>${title}</h5>
        <p>${summary} • ${note}</p>
        <div class="chart-wrap" aria-label="Usage chart">
          ${[40, 70, 55, 82].map((h, idx)=>`<div class="chart-bar" style="height:${h}%"></div>`).join('')}
        </div>
      </div>
      <div class="insight-stats">
        ${stats.map(s=>`<span class="mini-stat">${s}</span>`).join('')}
      </div>
    </div>
  `);
}

// ---- Student store (teacher side) ----
const STUD_KEY = 'sl_students';
function getStudents(){
  try{
    const s = JSON.parse(localStorage.getItem(STUD_KEY)||'null');
    if(s) return s;
  }catch(e){}
  const seed = [
    {id:1, name:'Aarav Kumar', reg:'CS21001', dept:'BSC CS', year:'III-A', umis:'UMIS100001', email:'aarav@college.edu', verified:true},
    {id:2, name:'Diya Sharma', reg:'IT21014', dept:'BSC IT', year:'III-B', umis:'UMIS100002', email:'diya@college.edu', verified:false},
    {id:3, name:'Rohan Verma', reg:'AI21033', dept:'AI&ML', year:'II-A', umis:'UMIS100003', email:'rohan@college.edu', verified:true},
    {id:4, name:'Isha Patel', reg:'CSDA21050', dept:'CSDA', year:'II-B', umis:'UMIS100004', email:'isha@college.edu', verified:false},
  ];
  localStorage.setItem(STUD_KEY, JSON.stringify(seed));
  return seed;
}
function saveStudents(list){ localStorage.setItem(STUD_KEY, JSON.stringify(list)) }
