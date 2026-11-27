/**
 * ScholarFinder — Multilingual Support (i18n)
 * Hindi + English toggle with translation dictionary.
 */
(function () {
  'use strict';

  const LANG_KEY = 'scholarfinder_lang';

  const translations = {
    en: {
      // Nav
      brand_name: 'ScholarFinder',
      brand_badge: 'India',
      brand_sub: 'Verified Government & CSR Schemes',
      saved: 'Saved',
      nsp_link: 'National Scholarship Portal',

      // Hero
      hero_pill: '100 Verified Central, State & CSR Scholarships Loaded',
      hero_title_1: 'Discover Scholarships You ',
      hero_title_2: 'Actually Qualify For',
      hero_desc: 'Filter Indian government and private scholarships by education level, state domicile, social category, and family income limit.',
      hero_placeholder: 'Search by scheme name, course, or keyword (e.g. AICTE, Pragati, Post-Matric)...',
      quick_filters: 'Quick filters:',
      girls_only: '👩‍🎓 Girls Only',
      ug: '🎓 Undergraduate (UG)',
      low_income: '💰 Income ≤ ₹2.5 Lakh',
      open_verify: '🟢 Open / Verify Date',
      stat_schemes: 'Verified Schemes',
      stat_states: 'States & UTs Covered',
      stat_annual: 'Annual Assistance',
      stat_official: 'Official Portals',

      // Filters
      filter_criteria: 'Filter Criteria',
      reset_all: 'Reset All',
      education_level: 'Education Level',
      state_domicile: 'State / Domicile',
      category: 'Category / Reservation',
      gender_eligibility: 'Gender Eligibility',
      any_gender: 'Any Gender',
      female_only: 'Female Only',
      family_income: 'Family Income Limit',
      any_income: 'Any Income',
      portal_status: 'Portal Status',
      apply_view: 'Apply & View Results',

      // Results
      available_scholarships: 'Available Scholarships',
      showing_all: 'Showing all verified schemes',
      sort_by: 'Sort by:',
      recommended: 'Recommended',
      highest_award: 'Highest Award Amount',
      open_first: 'Open Schemes First',
      name_az: 'Name (A → Z)',
      best_match: 'Best Match (Profile)',

      // Cards
      full_details: 'Full Eligibility & Details',
      no_results: 'No Matching Scholarships Found',
      no_results_desc: 'Try loosening your filter criteria, checking "All States", or clearing the search keyword.',

      // Dashboard
      dashboard_title: 'Your Personalized Dashboard',
      dash_eligible: 'Fully Eligible',
      dash_partial: 'Partial Match',
      dash_open: 'Currently Open',
      dash_potential: 'Potential Aid / yr',
      dash_top_matches: 'Top Matches for You',
      dash_deadlines: 'Upcoming Deadlines',

      // Features
      my_profile: 'My Profile',
      compare: 'Compare',
      export_pdf: 'Export PDF',
      check_eligibility: 'Check Eligibility',
      compare_title: 'Scholarship Comparison',
      profile_title: 'Student Profile',
      profile_subtitle: 'Fill in your details to get personalized scholarship matches & eligibility checks',
      deadline_alert: 'Deadline Alert!',

      // Footer
      footer_note: 'Always verify final dates and document requirements on the official portals before applying.'
    },
    hi: {
      brand_name: 'स्कॉलरफाइंडर',
      brand_badge: 'भारत',
      brand_sub: 'सत्यापित सरकारी और CSR योजनाएं',
      saved: 'सहेजा',
      nsp_link: 'राष्ट्रीय छात्रवृत्ति पोर्टल',

      hero_pill: '100 सत्यापित केंद्रीय, राज्य और CSR छात्रवृत्तियां लोड हैं',
      hero_title_1: 'वे छात्रवृत्तियां खोजें जिनके आप ',
      hero_title_2: 'वास्तव में पात्र हैं',
      hero_desc: 'शिक्षा स्तर, राज्य अधिवास, सामाजिक श्रेणी और परिवार की आय सीमा के अनुसार भारतीय सरकारी और निजी छात्रवृत्तियां फ़िल्टर करें।',
      hero_placeholder: 'योजना नाम, कोर्स, या कीवर्ड खोजें (जैसे AICTE, प्रगति, पोस्ट-मैट्रिक)...',
      quick_filters: 'क्विक फ़िल्टर:',
      girls_only: '👩‍🎓 केवल लड़कियां',
      ug: '🎓 स्नातक (UG)',
      low_income: '💰 आय ≤ ₹2.5 लाख',
      open_verify: '🟢 खुला / तारीख सत्यापित',
      stat_schemes: 'सत्यापित योजनाएं',
      stat_states: 'राज्य और केंद्रशासित कवर',
      stat_annual: 'वार्षिक सहायता',
      stat_official: 'आधिकारिक पोर्टल',

      filter_criteria: 'फ़िल्टर मापदंड',
      reset_all: 'सभी रीसेट करें',
      education_level: 'शिक्षा स्तर',
      state_domicile: 'राज्य / अधिवास',
      category: 'श्रेणी / आरक्षण',
      gender_eligibility: 'लिंग पात्रता',
      any_gender: 'कोई भी लिंग',
      female_only: 'केवल महिला',
      family_income: 'पारिवारिक आय सीमा',
      any_income: 'कोई भी आय',
      portal_status: 'पोर्टल स्थिति',
      apply_view: 'लागू करें और देखें',

      available_scholarships: 'उपलब्ध छात्रवृत्तियां',
      showing_all: 'सभी सत्यापित योजनाएं दिखा रहे हैं',
      sort_by: 'क्रमबद्ध:',
      recommended: 'अनुशंसित',
      highest_award: 'सबसे अधिक पुरस्कार राशि',
      open_first: 'पहले खुली योजनाएं',
      name_az: 'नाम (अ → ज)',
      best_match: 'सर्वश्रेष्ठ मैच (प्रोफ़ाइल)',

      full_details: 'पूरी पात्रता और विवरण',
      no_results: 'कोई मिलती-जुलती छात्रवृत्ति नहीं मिली',
      no_results_desc: 'अपने फ़िल्टर मापदंड को ढीला करें, "सभी राज्य" चेक करें, या खोज शब्द साफ़ करें।',

      dashboard_title: 'आपका व्यक्तिगत डैशबोर्ड',
      dash_eligible: 'पूरी तरह पात्र',
      dash_partial: 'आंशिक मैच',
      dash_open: 'वर्तमान में खुला',
      dash_potential: 'संभावित सहायता / वर्ष',
      dash_top_matches: 'आपके लिए शीर्ष मैच',
      dash_deadlines: 'आगामी समय सीमा',

      my_profile: 'मेरी प्रोफ़ाइल',
      compare: 'तुलना करें',
      export_pdf: 'PDF निर्यात',
      check_eligibility: 'पात्रता जांचें',
      compare_title: 'छात्रवृत्ति तुलना',
      profile_title: 'छात्र प्रोफ़ाइल',
      profile_subtitle: 'व्यक्तिगत छात्रवृत्ति मैच और पात्रता जांच के लिए अपना विवरण भरें',
      deadline_alert: 'समय सीमा चेतावनी!',

      footer_note: 'आवेदन करने से पहले हमेशा आधिकारिक पोर्टल पर अंतिम तिथि और दस्तावेज़ आवश्यकताओं की पुष्टि करें।'
    }
  };

  function getCurrentLang() {
    return localStorage.getItem(LANG_KEY) || 'en';
  }

  function setLang(lang) {
    localStorage.setItem(LANG_KEY, lang);
    applyTranslations(lang);
    updateToggleButton(lang);
  }

  function applyTranslations(lang) {
    const dict = translations[lang] || translations.en;

    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (dict[key]) {
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
          el.placeholder = dict[key];
        } else {
          el.textContent = dict[key];
        }
      }
    });

    // Update HTML lang attribute
    document.documentElement.lang = lang === 'hi' ? 'hi' : 'en';
  }

  function updateToggleButton(lang) {
    const btn = document.getElementById('langToggleBtn');
    if (!btn) return;
    const label = btn.querySelector('.lang-label');
    if (label) label.textContent = lang === 'hi' ? 'EN' : 'हिं';
    const flag = btn.querySelector('.lang-flag');
    if (flag) flag.textContent = lang === 'hi' ? '🇬🇧' : '🇮🇳';
  }

  function initI18n() {
    const SF = window.ScholarFinder;
    if (!SF) return;

    const lang = getCurrentLang();
    updateToggleButton(lang);
    if (lang !== 'en') applyTranslations(lang);

    const btn = document.getElementById('langToggleBtn');
    if (btn) {
      btn.addEventListener('click', () => {
        const current = getCurrentLang();
        const next = current === 'en' ? 'hi' : 'en';
        setLang(next);
      });
    }

    // Re-apply translations after dynamic renders
    const origRender = SF.renderCards;
    SF.renderCards = function () {
      origRender();
      const lang = getCurrentLang();
      if (lang !== 'en') {
        setTimeout(() => applyTranslations(lang), 120);
      }
    };

    console.log('✅ Multilingual (i18n) initialized — current:', lang);
  }

  window.ScholarFinderI18n = { getCurrentLang, setLang, translations };

  document.addEventListener('scholarfinder:ready', initI18n);
  if (window.ScholarFinder) initI18n();
})();
