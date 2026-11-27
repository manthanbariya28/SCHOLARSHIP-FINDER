# 🎓 Indian Scholarship Finder (SCHOLARSHIP-FINDER)

A modern, responsive, and student-centric web application designed to help Indian students discover, filter, and apply for verified government (Central & State) and corporate CSR scholarships for the 2026–27 academic cycle.

---

## ✨ Features

- **100 Verified Scholarships:** Comprehensive national directory covering Central government schemes (NSP, AICTE, UGC, CSIR, DBT, DAE, DRDO, MoSJE, MoTA, DST, Ministry of Railways/RPF, Ministry of Home Affairs/WARB, DEPwD, National Overseas Scholarships, PMRF, PM-USP), State government schemes across 29 States & UTs (Tamil Nadu, Andhra Pradesh, Telangana, Maharashtra, Karnataka, Rajasthan, Bihar, Gujarat, West Bengal, Uttar Pradesh, Madhya Pradesh, Kerala, Odisha, Punjab, Haryana, Assam, Delhi, Himachal Pradesh, Jharkhand, Chhattisgarh, J&K, Ladakh, and North-Eastern States), and verified Corporate CSR programs (Reliance, HDFC Bank, Kotak, Tata Capital, ONGC, Wipro Santoor, LIC).
- **🎯 1. Eligibility Checker:** Complete student profile system (education level, state domicile, social category, family income, marks, special conditions) to verify mandatory conditions in 1 click.
- **🤖 2. AI Matching Score:** Intelligent weighted matching algorithm (0–100%) ranking scholarships tailored to the student's profile.
- **💡 3. Eligibility Explanation:** Clear criterion-by-criterion breakdown explaining exactly why a student qualifies or does not qualify.
- **⚖️ 4. Scholarship Comparison:** Multi-select side-by-side comparison table to compare benefits, requirements, marks, and deadlines across up to 4 schemes.
- **🛡️ 5. Fake Scholarship Warning:** Automated trust score (0–100) flagging unverified sources and highlighting verified official government and CSR portals.
- **🧠 6. Smart Search:** Understands natural-language queries (e.g. *"scholarships for SC girls in UP below 2.5 lakh"*) and automatically detects and applies relevant filters.
- **📊 7. Personalized Dashboard:** Student overview showcasing matching opportunities, potential financial aid, and upcoming deadlines.
- **⏰ 8. Deadline Reminders:** Real-time deadline tracking, urgency alerts (&le;7 days), and optional browser notifications.
- **🌐 9. Multilingual Support (i18n):** Instant toggle between **English** and **Hindi (हिंदी)** with comprehensive translations.
- **🎙️ 10. Voice Search:** Voice-activated search powered by the Web Speech API with real-time speech-to-text input.
- **📄 11. PDF Report Export:** Instant client-side download of a formatted PDF report with student profile and recommended scholarships (powered by jsPDF).
- **⭐ 12. Feedback System:** Interactive star rating and reviews for each scholarship saved locally to improve recommendation insights.
- **💬 13. AI Scholarship Chatbot (ScholarBot):** Floating interactive assistant that answers student questions, explains documents/NSP application steps, recommends matching scholarships with clickable cards, and auto-applies app filters.
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
