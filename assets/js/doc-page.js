/* Reusable document management page renderer */
const DOC_ALLOWED_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
];

function escapeHtml(value){
  return String(value || '').replace(/[&<>"']/g, ch => ({
    '&':'&amp;',
    '<':'&lt;',
    '>':'&gt;',
    '"':'&quot;',
    "'":'&#39;'
  }[ch]));
}

function formatSize(bytes){
  if(!bytes) return '0 KB';
  const units = ['B','KB','MB','GB'];
  const i = Math.min(Math.floor(Math.log(bytes)/Math.log(1024)), units.length - 1);
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

function formatDate(value){
  if(!value) return '-';
  const date = new Date(value);
  if(Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString(undefined, {year:'numeric', month:'short', day:'numeric'});
}

function fileTypeLabel(doc){
  if(doc.type === 'application/pdf') return 'PDF';
  if(doc.type && doc.type.startsWith('image/')) return doc.type.split('/')[1].toUpperCase();
  const ext = (doc.filename || '').split('.').pop();
  return ext ? ext.toUpperCase() : 'File';
}

function renderDocPage(category, templates){
  const grid = document.getElementById('docGrid');
  if(!grid) return;

  const labels = {
    personal: {title:'Personal Documents', desc:'Keep identity, certificate, and verification files secure.'},
    online: {title:'Online Certificates', desc:'Store your digital certificates and e-documents in one place.'},
    offline: {title:'Offline Certificates', desc:'Manage physical certificates and verification documents.'},
    academic: {title:'Academic Certificates', desc:'Track marksheets, hall tickets, and academic proof.'}
  };
  const label = labels[category] || {title:'Documents', desc:'Manage your uploaded files.'};
  const docs = getDocs().filter(d=>d.category===category);

  grid.className = 'doc-page-grid';
  grid.innerHTML = `
    <div class="doc-page-shell">
      <div class="sl-card doc-summary-card">
        <div>
          <div class="doc-pill">${docs.length} uploaded</div>
          <h3>${label.title}</h3>
          <p>${label.desc}</p>
        </div>
        <button class="btn btn-primary" type="button" data-upload-focus>
          <i class="fas fa-cloud-upload-alt me-1"></i>Upload
        </button>
      </div>

      <div class="sl-card">
        <div class="section-title-row">
          <div>
            <h5 class="mb-1">Upload document</h5>
            <p class="text-muted mb-0">PDF, image, Word, and Excel files are supported.</p>
          </div>
        </div>
        <form id="docUploadForm" class="doc-upload-form">
          <input type="hidden" name="replaceId">
          <div class="row g-3">
            <div class="col-lg-4 col-md-6">
              <label class="form-label">Document name</label>
              <input name="title" class="form-control" list="docTemplateList" placeholder="e.g. Aadhaar Card" required>
              <datalist id="docTemplateList">
                ${(templates || []).map(t=>`<option value="${escapeHtml(t.title)}"></option>`).join('')}
              </datalist>
            </div>
            <div class="col-lg-3 col-md-6">
              <label class="form-label">Document type</label>
              <select name="docType" class="form-select">
                ${(templates || []).map(t=>`<option value="${escapeHtml(t.title)}">${escapeHtml(t.title)}</option>`).join('')}
                <option value="Other Personal Document">Other Personal Document</option>
              </select>
            </div>
            <div class="col-lg-5">
              <label class="form-label">Choose file</label>
              <input name="file" type="file" class="form-control" accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx,.xls,.xlsx" required>
            </div>
          </div>
          <div class="doc-form-actions">
            <button class="btn btn-primary" type="submit"><i class="fas fa-check me-1"></i><span data-submit-label>Upload</span></button>
            <button class="btn btn-outline-secondary d-none" type="button" data-cancel-replace>Cancel</button>
          </div>
        </form>
      </div>

      <div class="sl-card doc-manager-card">
        <div class="section-title-row">
          <div>
            <h5 class="mb-1">Uploaded documents</h5>
            <p class="text-muted mb-0">View, download, replace, or remove your files.</p>
          </div>
          <div class="doc-search-wrap">
            <i class="fas fa-search"></i>
            <input id="docSearch" class="form-control" type="search" placeholder="Search documents">
          </div>
        </div>
        <div id="docList" class="doc-list" aria-live="polite"></div>
      </div>
    </div>
  `;

  bindDocPageEvents(category, templates || []);
  renderDocList(category);
}

function bindDocPageEvents(category, templates){
  const form = document.getElementById('docUploadForm');
  const search = document.getElementById('docSearch');
  const uploadFocus = document.querySelector('[data-upload-focus]');
  const cancelReplace = document.querySelector('[data-cancel-replace]');
  const typeSelect = form?.querySelector('select[name="docType"]');
  const titleInput = form?.querySelector('input[name="title"]');

  uploadFocus?.addEventListener('click', ()=>{
    titleInput?.focus();
    form?.scrollIntoView({behavior:'smooth', block:'center'});
  });

  typeSelect?.addEventListener('change', ()=>{
    if(typeSelect.value && typeSelect.value !== 'Other Personal Document' && !titleInput.value.trim()){
      titleInput.value = typeSelect.value;
    }
  });

  cancelReplace?.addEventListener('click', ()=>resetDocForm(form));
  search?.addEventListener('input', ()=>renderDocList(category, search.value));

  form?.addEventListener('submit', (e)=>{
    e.preventDefault();
    const fileInput = form.querySelector('input[type="file"]');
    const replaceInput = form.querySelector('input[name="replaceId"]');
    const file = fileInput?.files?.[0];
    const title = titleInput?.value?.trim();
    const docType = typeSelect?.value || title;

    if(!file || !title) return slToast('Please choose a file and enter a document name', 'error');
    if(file.size > 3.5 * 1024 * 1024) return slToast('Please choose a file smaller than 3.5 MB', 'error');
    if(file.type && !DOC_ALLOWED_TYPES.includes(file.type)) return slToast('This file type is not supported', 'error');

    slLoader(true);
    const reader = new FileReader();
    reader.onerror = () => {
      slLoader(false);
      slToast('Could not read the selected file', 'error');
    };
    reader.onload = () => {
      const payload = {
        category,
        title,
        docType,
        dataUrl: reader.result,
        filename:file.name,
        type:file.type || 'application/octet-stream',
        size:file.size,
        status:'Uploaded'
      };

      if(replaceInput.value){
        updateDoc(replaceInput.value, payload);
        slToast('Document replaced successfully', 'success');
      } else {
        addDoc(payload);
        slToast('Document uploaded successfully', 'success');
      }

      resetDocForm(form);
      renderDocList(category, document.getElementById('docSearch')?.value || '');
      updateDocumentCount(category);
      slLoader(false);
    };
    reader.readAsDataURL(file);
  });
}

function renderDocList(category, query=''){
  const list = document.getElementById('docList');
  if(!list) return;
  const needle = query.trim().toLowerCase();
  const docs = getDocs()
    .filter(d=>d.category===category)
    .filter(d=>!needle || [d.title, d.docType, d.filename, d.type].some(v=>String(v || '').toLowerCase().includes(needle)))
    .sort((a,b)=>new Date(b.uploaded || 0) - new Date(a.uploaded || 0));

  if(!docs.length){
    list.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-folder-open"></i>
        <strong>${needle ? 'No matching documents' : 'No documents uploaded yet'}</strong>
        <span>${needle ? 'Try a different search term.' : 'Upload your first document to see it here.'}</span>
      </div>
    `;
    return;
  }

  list.innerHTML = docs.map(doc=>`
    <article class="doc-list-item">
      <div class="doc-item-main">
        <div class="doc-icon"><i class="fas ${doc.type === 'application/pdf' ? 'fa-file-pdf' : doc.type?.startsWith('image/') ? 'fa-file-image' : 'fa-file-alt'}"></i></div>
        <div>
          <h6 class="mb-1">${escapeHtml(doc.title)}</h6>
          <div class="doc-item-meta">
            <span>${escapeHtml(doc.docType || 'Document')}</span>
            <span>${formatDate(doc.uploaded)}</span>
            <span>${fileTypeLabel(doc)}</span>
            <span>${formatSize(doc.size)}</span>
            <span class="doc-status">${escapeHtml(doc.status || 'Uploaded')}</span>
          </div>
          <div class="doc-size">${escapeHtml(doc.filename || '')}</div>
        </div>
      </div>
      <div class="doc-actions">
        <button class="btn btn-sm btn-outline-primary" type="button" onclick="previewDoc('${doc.id}')"><i class="fas fa-eye"></i>View</button>
        <button class="btn btn-sm btn-outline-success" type="button" onclick="downloadDoc('${doc.id}')"><i class="fas fa-download"></i>Download</button>
        <button class="btn btn-sm btn-outline-secondary" type="button" onclick="startReplaceDoc('${doc.id}')"><i class="fas fa-sync-alt"></i>Replace</button>
        <button class="btn btn-sm btn-outline-danger" type="button" onclick="removeDoc('${doc.id}')"><i class="fas fa-trash"></i>Delete</button>
      </div>
    </article>
  `).join('');
}

function resetDocForm(form){
  if(!form) return;
  form.reset();
  form.querySelector('input[name="replaceId"]').value = '';
  form.querySelector('[data-submit-label]').textContent = 'Upload';
  form.querySelector('[data-cancel-replace]')?.classList.add('d-none');
}

function startReplaceDoc(id){
  const doc = getDocs().find(x=>String(x.id)===String(id));
  const form = document.getElementById('docUploadForm');
  if(!doc || !form) return;
  form.querySelector('input[name="replaceId"]').value = doc.id;
  form.querySelector('input[name="title"]').value = doc.title || '';
  form.querySelector('select[name="docType"]').value = doc.docType || 'Other Personal Document';
  form.querySelector('[data-submit-label]').textContent = 'Replace';
  form.querySelector('[data-cancel-replace]')?.classList.remove('d-none');
  form.scrollIntoView({behavior:'smooth', block:'center'});
  slToast('Choose a new file to replace this document', 'info');
}

function previewDoc(id){
  const d = getDocs().find(x=>String(x.id)===String(id));
  if(!d) return;
  const body = document.getElementById('previewBody');
  if(!body) return;

  if(d.dataUrl && d.type && d.type.startsWith('image/')){
    body.innerHTML = `<img src="${d.dataUrl}" class="img-fluid rounded doc-preview-image" alt="${escapeHtml(d.title)} preview">`;
  } else if(d.dataUrl && d.type === 'application/pdf'){
    body.innerHTML = `<iframe title="${escapeHtml(d.title)} preview" src="${d.dataUrl}" class="doc-preview-frame"></iframe>`;
  } else {
    body.innerHTML = `<div class="text-center p-4"><i class="fas fa-file-alt fa-3x text-primary mb-3"></i><h5>${escapeHtml(d.title)}</h5><p class="text-muted">Preview is available for PDFs and images. You can download this file instead.</p></div>`;
  }
  document.getElementById('previewTitle').textContent = d.title;
  new bootstrap.Modal(document.getElementById('previewModal')).show();
}

function downloadDoc(id){
  const d = getDocs().find(x=>String(x.id)===String(id));
  if(!d?.dataUrl) return slToast('No file to download','error');
  const a = document.createElement('a');
  a.href = d.dataUrl;
  a.download = d.filename || d.title || 'document';
  document.body.appendChild(a);
  a.click();
  a.remove();
}

function removeDoc(id){
  if(!confirm('Delete this document permanently?')) return;
  const page = location.pathname.split('/').pop();
  const category = page.includes('online') ? 'online' : page.includes('offline') ? 'offline' : page.includes('academic') ? 'academic' : 'personal';
  deleteDoc(id);
  slToast('Document deleted', 'success');
  renderDocList(category, document.getElementById('docSearch')?.value || '');
  updateDocumentCount(category);
}

function updateDocumentCount(category){
  document.querySelectorAll('[data-doc-count]').forEach(el=>{
    if(el.getAttribute('data-doc-count') === category) el.textContent = `${countByCategory(category)} documents`;
  });
  const pill = document.querySelector('.doc-pill');
  if(pill) pill.textContent = `${countByCategory(category)} uploaded`;
}
