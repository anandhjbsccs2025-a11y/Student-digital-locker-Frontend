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
  const isTeacher = !!document.querySelector('[data-layout="teacher"]');


  // Removed student "Locker health" insights per new requirements.
  // Teacher insights remain unchanged.
  if(!isTeacher){
    // Do not render the insights block for student dashboards.
    return;
  }

  const pendingApprovals = getStudents().filter(s=>!s.verified).length;
  const title = 'Verification queue';
  const summary = `${pendingApprovals} students awaiting review`;
  const note = 'Keep the approval flow fast and organized.';
  const stats = [`${pendingApprovals} pending`, `${totalDocs} files tracked`];



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
    {id:1, name:'Aarav Kumar', reg:'CS21001', dept:'BSC CS', year:'III-A', joiningYear:2025, graduationYear:2028, batchYear:'2025 - 2028', currentAcademicYear:'III Year', email:'aarav@college.edu', verified:true},
    {id:2, name:'Diya Sharma', reg:'IT21014', dept:'BSC IT', year:'III-B', joiningYear:2025, graduationYear:2028, batchYear:'2025 - 2028', currentAcademicYear:'III Year', email:'diya@college.edu', verified:false},
    {id:3, name:'Rohan Verma', reg:'AI21033', dept:'AI&ML', year:'II-A', joiningYear:2026, graduationYear:2029, batchYear:'2026 - 2029', currentAcademicYear:'II Year', email:'rohan@college.edu', verified:true},
    {id:4, name:'Isha Patel', reg:'CSDA21050', dept:'CSDA', year:'II-B', joiningYear:2026, graduationYear:2029, batchYear:'2026 - 2029', currentAcademicYear:'II Year', email:'isha@college.edu', verified:false},
  ];
  localStorage.setItem(STUD_KEY, JSON.stringify(seed));
  return seed;
}
function saveStudents(list){
  // Normalize/remap to current schema (remove legacy UMIS if present)
  const normalized = (list||[]).map(s => {
    const { umis, ...rest } = s || {};
    return rest;
  });
  localStorage.setItem(STUD_KEY, JSON.stringify(normalized))
}
