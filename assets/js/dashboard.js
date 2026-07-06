/* Dashboard-specific interactions */

// ---- Document store (localStorage) ----
const DOC_KEY = 'sl_docs';
function getDocs(){ try{return JSON.parse(localStorage.getItem(DOC_KEY)||'[]')}catch(e){return []} }
function saveDocs(list){ localStorage.setItem(DOC_KEY, JSON.stringify(list)) }
function addDoc(doc){
  const l = getDocs();
  const next = Object.assign({
    id:Date.now().toString(36) + Math.random().toString(36).slice(2),
    uploaded:new Date().toISOString(),
    status:'Uploaded'
  }, doc);
  l.push(next);
  saveDocs(l);
  syncDocMetadata(next, 'upsert');
  return next;
}
function updateDoc(id, updates){
  const l = getDocs();
  const index = l.findIndex(d=>String(d.id)===String(id));
  if(index === -1) return null;
  l[index] = Object.assign({}, l[index], updates, {updated:new Date().toISOString(), status:'Updated'});
  saveDocs(l);
  syncDocMetadata(l[index], 'upsert');
  return l[index];
}
function deleteDoc(id){
  const existing = getDocs().find(d=>String(d.id)===String(id));
  saveDocs(getDocs().filter(d=>String(d.id)!==String(id)));
  if(existing) syncDocMetadata(existing, 'delete');
}
function countByCategory(cat){ return getDocs().filter(d=>d.category===cat).length }

function syncDocMetadata(doc, action){
  const bridge = window.StudentLockerFirebase;
  if(!bridge || typeof bridge.syncDocumentMetadata !== 'function') return;
  bridge.syncDocumentMetadata(doc, action).catch(()=>{});
}

// Render count badges on dashboard cards
document.addEventListener('DOMContentLoaded', ()=>{
  document.querySelectorAll('[data-doc-count]').forEach(el=>{
    const cat = el.getAttribute('data-doc-count');
    el.textContent = countByCategory(cat) + ' documents';
  });
});

// ---- Student store (teacher side) ----
const STUD_KEY = 'sl_students';
function getStudents(){
  try{
    const s = JSON.parse(localStorage.getItem(STUD_KEY)||'null');
    if(s) return normalizeStudents(s);
  }catch(e){}
  const seed = [
    {id:1, name:'Aarav Kumar', reg:'CS21001', dept:'BSC CS', year:'III-A', joiningYear:2025, graduationYear:2028, batchYear:'2025 - 2028', currentAcademicYear:'III Year', email:'aarav@college.edu'},
    {id:2, name:'Diya Sharma', reg:'IT21014', dept:'BSC IT', year:'III-B', joiningYear:2025, graduationYear:2028, batchYear:'2025 - 2028', currentAcademicYear:'III Year', email:'diya@college.edu'},
    {id:3, name:'Rohan Verma', reg:'AI21033', dept:'AI&ML', year:'II-A', joiningYear:2026, graduationYear:2029, batchYear:'2026 - 2029', currentAcademicYear:'II Year', email:'rohan@college.edu'},
    {id:4, name:'Isha Patel', reg:'CSDA21050', dept:'CSDA', year:'II-B', joiningYear:2026, graduationYear:2029, batchYear:'2026 - 2029', currentAcademicYear:'II Year', email:'isha@college.edu'},
  ];
  localStorage.setItem(STUD_KEY, JSON.stringify(seed));
  return seed;
}
function saveStudents(list){
  const normalized = normalizeStudents(list);
  localStorage.setItem(STUD_KEY, JSON.stringify(normalized))
}

function normalizeStudents(list){
  const blockedFields = ['umis', 'ver' + 'ified'];
  return (list||[]).map(s => {
    const next = Object.assign({}, s);
    blockedFields.forEach(field => delete next[field]);
    return next;
  });
}
