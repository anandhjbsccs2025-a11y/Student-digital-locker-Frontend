(function(){
  let app = null;
  let db = null;
  const config = window.StudentLockerFirebaseConfig || {};
  const hasConfig = window.StudentLockerHasFirebaseConfig || function(){ return false; };

  if(window.firebase && hasConfig(config)){
    app = window.firebase.apps && window.firebase.apps.length
      ? window.firebase.app()
      : window.firebase.initializeApp(config);
    db = window.firebase.firestore ? window.firebase.firestore(app) : null;
  }

  function currentStudentId(){
    try {
      const user = JSON.parse(localStorage.getItem('sl_user') || '{}');
      return String(user.email || user.reg || user.name || 'local-student').replace(/[^\w.-]/g, '_');
    } catch (err) {
      return 'local-student';
    }
  }

  function publicDocMetadata(docData){
    const metadata = Object.assign({}, docData);
    delete metadata.dataUrl;
    return metadata;
  }

  async function syncDocumentMetadata(docData, action){
    if(!db || !docData || !docData.id) return {skipped:true};
    const target = db.collection('students').doc(currentStudentId()).collection('documents').doc(String(docData.id));
    if(action === 'delete'){
      await target.delete();
      return {deleted:true};
    }
    await target.set(publicDocMetadata(docData), {merge:true});
    return {saved:true};
  }

  window.StudentLockerFirebase = {
    app,
    db,
    isConfigured: Boolean(db),
    syncDocumentMetadata
  };
})();
