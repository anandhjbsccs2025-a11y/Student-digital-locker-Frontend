/* Renders category document pages */
function formatSize(bytes){
  if(!bytes) return '0 KB';
  const units = ['B','KB','MB','GB'];
  const i = Math.min(Math.floor(Math.log(bytes)/Math.log(1024)), units.length - 1);
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

function renderDocPage(category, tiles){
  const grid = document.getElementById('docGrid');
  const docs = getDocs().filter(d=>d.category===category);
  const labels = {
    personal: {title:'Personal Documents', desc:'Keep your personal records and identification files secure.'},
    online: {title:'Online Certificates', desc:'Store your digital certificates and e-documents in one place.'},
    offline: {title:'Offline Certificates', desc:'Manage physical certificates and verification documents.'},
    academic: {title:'Academic Certificates', desc:'Track marksheets, hall tickets, and academic proof.'}
  };
  const label = labels[category] || {title:'Documents', desc:'Manage your uploaded files.'};

  grid.innerHTML = `
    <div class="doc-page-shell">
      <div class="sl-card doc-summary-card">
        <div>
          <div class="doc-pill">${docs.length} uploaded</div>
          <h3>${label.title}</h3>
          <p>${label.desc}</p>
        </div>
      </div>

      <div class="sl-card">
        <div class="section-title-row">
          <div>
            <h5 class="mb-1">Upload a new file</h5>
            <p class="text-muted mb-0">Add a new document to this category.</p>
          </div>
        </div>
        <form id="docUploadForm" class="doc-upload-form">
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label">Document title</label>
              <input name="title" class="form-control" placeholder="e.g. Marksheet" required>
            </div>
            <div class="col-md-6">
              <label class="form-label">Choose file</label>
              <input name="file" type="file" class="form-control" accept=".pdf,.png,.jpg,.jpeg" required>
            </div>
          </div>
          <button class="btn btn-primary mt-3" type="submit"><i class="fas fa-cloud-upload-alt me-1"></i>Upload</button>
        </form>
      </div>
    </div>
  `;

  const form = document.getElementById('docUploadForm');
  if(form){
    form.addEventListener('submit', (e)=>{
      e.preventDefault();
      const fileInput = form.querySelector('input[type="file"]');
      const titleInput = form.querySelector('input[name="title"]');
      const file = fileInput?.files?.[0];
      const title = titleInput?.value?.trim();

      if(!file || !title) return slToast('Please choose a file and enter a title', 'error');
      const allowed = ['application/pdf','image/png','image/jpeg'];
      if(!allowed.includes(file.type)) return slToast('Only PDF, PNG, JPG, and JPEG files are allowed', 'error');

      const reader = new FileReader();
      reader.onload = () => {
        addDoc({category, title, dataUrl: reader.result, filename:file.name, type:file.type, size:file.size});
        slToast('Document uploaded successfully', 'success');
        renderDocPage(category, tiles);
      };
      reader.readAsDataURL(file);
    });
  }
}

function previewDoc(id){
  const d = getDocs().find(x=>x.id===id); if(!d) return;
  const body = document.getElementById('previewBody');
  if(d.dataUrl && d.type && d.type.startsWith('image/')){
    body.innerHTML = `<img src="${d.dataUrl}" class="img-fluid rounded" alt="preview">`;
  } else if(d.dataUrl && d.type === 'application/pdf'){
    body.innerHTML = `<iframe src="${d.dataUrl}" style="width:100%;height:70vh;border:0"></iframe>`;
  } else {
    body.innerHTML = `<div class="text-center p-4"><i class="fas fa-file-alt fa-3x text-primary mb-3"></i><h5>${d.title}</h5><p class="text-muted">Preview not available</p></div>`;
  }
  document.getElementById('previewTitle').textContent = d.title;
  new bootstrap.Modal(document.getElementById('previewModal')).show();
}
function downloadDoc(id){
  const d = getDocs().find(x=>x.id===id); if(!d) return;
  if(d.dataUrl){
    const a = document.createElement('a'); a.href = d.dataUrl; a.download = d.filename || d.title; a.click();
  } else slToast('No file to download','error');
}
function removeDoc(id){
  if(!confirm('Delete this document?')) return;
  deleteDoc(id); slToast('Document deleted','success');
  const page = location.pathname.split('/').pop();
  const category = page.includes('online') ? 'online' : page.includes('offline') ? 'offline' : page.includes('academic') ? 'academic' : 'personal';
  setTimeout(()=>renderDocPage(category, []), 100);
}
