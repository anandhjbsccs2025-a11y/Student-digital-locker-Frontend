# Student Profile Update - UMIS Removal + Batch/Current Academic Year

## Steps
- [x] Gather repo info (read relevant files)
- [x] Update `profile.html`: remove UMIS row; add read-only Batch Year + Current Academic Year

- [x] Update `student-register.html`: remove UMIS input; add Joining Year input
- [x] Update `assets/js/login.js`: remove UMIS validation/storage; compute and store `batchYear` + `currentAcademicYear`

- [ ] Update `add-student.html`: remove UMIS input; add Joining Year; compute/store `batchYear` + `currentAcademicYear`
- [ ] Update `assets/js/dashboard.js`: remove UMIS from seeded students; add new fields
- [ ] Update `search-student.html`: remove UMIS column; adjust search/filter + colspan
- [ ] Manual sanity checks:
  - [ ] Student registration → login → profile shows Batch Year + Roman current year
  - [ ] Teacher add/search shows no UMIS and still renders correctly

