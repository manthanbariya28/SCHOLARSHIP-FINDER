# 🎓 Indian Scholarship Finder (SCHOLARSHIP-FINDER)

A modern, responsive, and student-centric web application designed to help Indian students discover, filter, and apply for verified government (Central & State) and corporate CSR scholarships for the 2026–27 academic cycle.

---

## ✨ Features

- **40 Verified Scholarships:** Central schemes (NSP, AICTE, UGC, MoSJE, MoTA, DST), State schemes (Maharashtra, Karnataka, Rajasthan, Bihar, Gujarat, West Bengal, UP, MP), and Corporate CSR programs (Reliance, HDFC Bank, Kotak, Tata Capital, ONGC, Wipro Santoor, LIC).
- **Multi-Facet Search & Filtering:**
  - **Keyword Search:** Real-time search across scheme names, courses, keywords, and eligibility text.
  - **Education Level:** School, Class 11–12, Diploma/Polytechnic, Undergraduate (UG), and Postgraduate (PG).
  - **State / Domicile:** Specific state selection + nationwide All-India schemes.
  - **Social Category:** General, OBC, SC, ST, EWS, Minority, and BC/EBC.
  - **Gender Filter:** Special focus on girl-child and female-only scholarships.
  - **Family Income Ceiling:** Quick filter by annual income limits (&le; ₹2.5L, &le; ₹4.5L, &le; ₹6.0L, &le; ₹8.0L).
  - **Application Status:** Color-coded status indicators (*Open / Verify Date*, *Check Portal*, *Closed*).
- **Detailed Scholarship Modal:** Full eligibility breakdown, financial benefits, academic marks criteria, and direct 1-click links to official application portals.
- **Student Bookmarking:** Save shortlisted scholarships locally in the browser via `localStorage`.
- **Zero Dependencies:** Pure HTML5, Tailwind CSS (via CDN), and Vanilla JavaScript. Runs directly in any browser with zero setup.

---

## 📁 Project Structure

```text
scholarship-finder/
├── index.html              # Main application page
├── css/
│   └── custom.css          # Theme styles, glassmorphism, animations
├── js/
│   ├── app.js              # Application logic, filter engine, modal & bookmarks
│   └── data-fallback.js    # Embedded fallback for offline / local file:// support
├── data/
│   └── scholarships.json   # Verified 40-scholarship dataset
├── .gitignore              # Git ignore rules for credentials & temporary files
└── README.md               # Project documentation
```

---

## 🚀 How to Run Locally

### Option 1: Direct Browser
Simply double-click `index.html` or open it with Google Chrome, Microsoft Edge, or Firefox.

### Option 2: Local HTTP Server (Python)
```bash
python -m http.server 8000
```
Then navigate to `http://localhost:8000` in your web browser.

---

## 🛡️ Disclaimer
All scholarship information is compiled from official government portals (`scholarships.gov.in`, state DBT portals) and corporate CSR pages. Students should always verify final deadlines and specific documentation guidelines directly on the respective official portals.
