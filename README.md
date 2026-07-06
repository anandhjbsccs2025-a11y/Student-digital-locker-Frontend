# Student Details Locker Frontend

A responsive, DigiLocker-inspired student document portal built with HTML5, CSS3, Bootstrap 5, Font Awesome, vanilla JavaScript, and Firebase metadata sync.

## Structure

```text
StudentLocker-Frontend/
|-- index.html
|-- teacher-login.html
|-- student-register.html
|-- student-dashboard.html
|-- teacher-dashboard.html
|-- profile.html / edit-profile.html
|-- change-password.html / change-email.html
|-- settings.html
|-- personal-documents.html
|-- online-certificates.html
|-- offline-certificates.html
|-- academic-certificates.html
|-- upload-document.html / view-document.html
|-- add-student.html / search-student.html
`-- assets/
    |-- css/
    `-- js/
```

## Features

- Student and teacher dashboard layouts with responsive sidebar navigation
- Dark and light theme persistence with Local Storage
- Form validation, toast notifications, loading indicators, and page transitions
- Personal Documents module with upload, search, preview, download, replace, and delete
- Document metadata display: name, upload date, file type, file size, and status
- PDF and image previews inside the application
- Firebase package installed and optional Firestore metadata sync bridge

## Firebase Configuration

Firebase is initialized only when real project config is available. For local testing, keep credentials out of source and set them in browser storage:

```js
localStorage.setItem('sl_firebase_config', JSON.stringify({
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_PROJECT.firebaseapp.com',
  projectId: 'YOUR_PROJECT',
  storageBucket: 'YOUR_PROJECT.appspot.com',
  messagingSenderId: 'YOUR_SENDER_ID',
  appId: 'YOUR_APP_ID'
}));
```

Refresh the page after setting the config. Without config, document management still works locally and Firebase sync is skipped.

## Run

```bash
npm install
npm start
```

Then open `http://localhost:4173`.

You can also open `index.html` directly in a browser for the local-only experience.
