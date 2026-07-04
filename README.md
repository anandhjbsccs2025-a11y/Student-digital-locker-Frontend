# Student Details Locker (Frontend)

A responsive, DigiLocker-inspired student document portal built with pure HTML5, CSS3, Bootstrap 5, Font Awesome and Vanilla JavaScript.

## Structure
```
StudentLocker-Frontend/
├── index.html                 # Landing / student login
├── teacher-login.html
├── student-register.html
├── student-dashboard.html
├── teacher-dashboard.html
├── profile.html / edit-profile.html
├── change-password.html / change-email.html
├── settings.html / notifications.html
├── personal-documents.html
├── online-certificates.html
├── offline-certificates.html
├── academic-certificates.html
├── upload-document.html / view-document.html
├── add-student.html / search-student.html / verify-student.html
└── assets/
    ├── css/  (style.css, login.css, dashboard.css, responsive.css)
    ├── js/   (app.js, login.js, dashboard.js, validation.js, layout.js, doc-page.js)
    ├── images/ | icons/ | fonts/
```

## Features
- Blue & white DigiLocker-inspired theme, Poppins font, Font Awesome icons
- Fully responsive with collapsible sidebar (mobile friendly)
- Dark / light mode with Local Storage persistence
- Form validation, password strength meter, show/hide password
- Toast notifications, loading spinner, success animations
- Upload with drag & drop, progress bar, PDF/PNG/JPG/JPEG only, Local Storage preview
- Document cards with View / Download / Delete / Preview (modal)
- Teacher: Add / Search (filters + table) / Verify students
- Ready to integrate with a Java Spring Boot backend (swap Local Storage for REST calls)
```

## Run
Open `index.html` in a browser, or serve the folder statically.
