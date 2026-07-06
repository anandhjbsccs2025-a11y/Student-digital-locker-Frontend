// Firebase web config is public by design. Keep real values out of git and set
// them at runtime with localStorage key "sl_firebase_config" when deploying.
(function(){
  const defaultFirebaseConfig = {
    apiKey: '',
    authDomain: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: ''
  };

  function readRuntimeFirebaseConfig(){
    try {
      const saved = JSON.parse(localStorage.getItem('sl_firebase_config') || 'null');
      return saved && typeof saved === 'object' ? saved : null;
    } catch (err) {
      return null;
    }
  }

  function hasFirebaseConfig(config){
    return Boolean(config && config.apiKey && config.authDomain && config.projectId && config.appId);
  }

  window.StudentLockerFirebaseConfig = readRuntimeFirebaseConfig() || defaultFirebaseConfig;
  window.StudentLockerHasFirebaseConfig = hasFirebaseConfig;
})();
