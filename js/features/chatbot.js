/**
 * ScholarFinder — AI Scholarship Assistant (Chatbot)
 * Interactive conversational assistant for scholarship guidance, eligibility questions,
 * document requirements, deadline queries, and automated in-app filtering.
 */
(function () {
  'use strict';

  // Common scholarship queries knowledge base
  const FAQ_KNOWLEDGE = [
    {
      keywords: ['document', 'documents', 'certificate', 'paper', 'proof', 'दस्तावेज', 'प्रमाणपत्र'],
      response: `Common documents required for Indian scholarships:\n\n` +
        `• 📄 **Aadhaar Card** (linked to mobile & bank account)\n` +
        `• 🏫 **Previous Year Marksheet** (10th/12th/Graduation)\n` +
        `• 💰 **Income Certificate** (issued by competent authority / Tehsildar)\n` +
        `• 🏠 **Domicile / Residence Certificate**\n` +
        `• 🏷️ **Caste / Category Certificate** (SC/ST/OBC/EWS if applicable)\n` +
        `• 🏦 **Student's Bank Passbook** (Aadhaar-seeded bank account)\n` +
        `• 🎓 **Current Year Admission Proof / Fee Receipt / Bonafide Certificate**\n` +
        `• 📸 **Passport Size Photograph**`
    },
    {
      keywords: ['nsp', 'national scholarship portal', 'scholarships.gov.in', 'how to apply', 'एनएसपी', 'आवेदन कैसे करें'],
      response: `**How to apply on National Scholarship Portal (NSP):**\n\n` +
        `1. Visit **scholarships.gov.in** and click **New Registration / OTR (One Time Registration)**.\n` +
        `2. Complete Aadhaar authentication and get your unique OTR ID.\n` +
        `3. Login with your OTR credentials and fill in the scholarship application form.\n` +
        `4. Upload required documents (Income, Domicile, Marksheets, Bonafide).\n` +
        `5. Submit form and print copy for your school/college verification.\n` +
        `6. Your institute nodal officer (INO) will verify your application on the portal.`
    },
    {
      keywords: ['fake', 'scam', 'fraud', 'fee', 'charge', 'धोखा', 'फ्रॉड'],
      response: `⚠️ **Important Warning on Fake Scholarships:**\n\n` +
        `• Legitimate government and CSR scholarships **NEVER charge an application fee**.\n` +
        `• Always apply through verified official portals like **scholarships.gov.in** or state DBT portals.\n` +
        `• Never share your bank passwords, OTPs, or pay processing fees for "guaranteed" scholarships.\n` +
        `• Look for our 🛡️ **Verified** trust badges on cards in ScholarFinder!`
    },
    {
      keywords: ['income certificate', 'income proof', 'आय प्रमाण पत्र'],
      response: `**Income Certificate Guidelines:**\n\n` +
        `• Must be issued by an authorized revenue authority (Tehsildar / SDO / Revenue Officer).\n` +
        `• Usually valid for 1 year from date of issue; ensure yours is current for academic year 2026-27.\n` +
        `• Affidavit or salary slips alone are often not accepted for government schemes.`
    }
  ];

  // State
  let isOpen = false;
  let chatHistory = [];

  function getScholarships() {
    return window.ScholarFinder?.state?.allScholarships || [];
  }

  function getProfile() {
    return window.ScholarFinderProfile?.loadProfile() || null;
  }

  /* ───────────── Natural Language Query Resolver ───────────── */
  function processUserMessage(rawText) {
    const text = rawText.toLowerCase().trim();
    const scholarships = getScholarships();
    const profile = getProfile();
    const lang = window.ScholarFinderI18n?.getCurrentLang() || 'en';

    // 1. Check for Greetings
    if (/^(hi|hello|hey|namaste|pranam|नमस्ते|प्रणाम|hola)\b/i.test(text)) {
      const name = profile?.name ? ` ${profile.name}` : '';
      if (lang === 'hi') {
        return {
          text: `नमस्ते${name}! 🙏 मैं आपका **ScholarFinder AI सहायक** हूँ। मैं छात्रवृत्तियों, पात्रता, समय सीमा और आवश्यक दस्तावेजों में आपकी सहायता कर सकता हूँ। आप क्या जानना चाहते हैं?`,
          suggestions: ['मेरी पात्रता जांचें', 'लड़कियों के लिए योजनाएं', 'आवश्यक दस्तावेज', 'NSP पर आवेदन कैसे करें']
        };
      }
      return {
        text: `Hello${name}! 👋 I am your **ScholarFinder AI Assistant**. I can help you find suitable scholarships, check eligibility, explore deadlines, or guide you through required documents. What would you like to know today?`,
        suggestions: ['Check my eligibility', 'Scholarships for girls', 'Required documents', 'How to apply on NSP']
      };
    }

    // 2. Check for Profile / Eligibility Check Query
    if (/(my eligibility|am i eligible|eligible for|qualify|पात्रता|क्या मैं पात्र हूँ)/i.test(text)) {
      if (!profile || !profile.educationLevel) {
        return {
          text: lang === 'hi' 
            ? `पात्रता की सही जांच के लिए कृपया पहले अपनी प्रोफाइल भरें। आप अपना शिक्षा स्तर, राज्य, श्रेणी और आय दर्ज कर सकते हैं।` 
            : `To check your exact eligibility, please complete your **Student Profile** first. Click the button below to fill in your degree level, state, category, and income!`,
          action: { type: 'open_profile', label: lang === 'hi' ? '📝 प्रोफाइल भरें' : '📝 Complete My Profile' },
          suggestions: ['Popular scholarships', 'Engineering scholarships', 'Girls scholarships']
        };
      }

      // Profile exists -> compute matches
      const matches = scholarships.filter(s => {
        const check = window.ScholarFinderProfile?.checkEligibility(s, profile);
        return check?.eligible;
      });

      const count = matches.length;
      let reply = lang === 'hi'
        ? `आपकी प्रोफ़ाइल (**${profile.educationLevel}**, **${profile.state || 'सभी राज्य'}**, **${profile.category || 'सभी श्रेणियां'}**) के अनुसार आप **${count} छात्रवृत्तियों** के लिए पात्र हैं:`
        : `Based on your profile (**${profile.educationLevel}**, **${profile.state || 'All India'}**, **${profile.category || 'All Categories'}**), you qualify for **${count} verified scholarships**:`;

      return {
        text: reply,
        scholarships: matches.slice(0, 4),
        action: { type: 'apply_profile_filter', label: lang === 'hi' ? '🔍 केवल पात्र योजनाएं दिखाएं' : '🔍 Filter Eligible Scholarships' },
        suggestions: ['Upcoming deadlines', 'Highest award scholarships', 'Required documents']
      };
    }

    // 3. Search for Girl / Female scholarships
    if (/(girl|female|women|woman|ladies|kanya|beti|महिला|लड़की|लड़कियों)/i.test(text)) {
      const girlSchemes = scholarships.filter(s => s.gender === 'female' || (s.special && s.special.toLowerCase().includes('girl')));
      return {
        text: lang === 'hi'
          ? `यहाँ विशेष रूप से **छात्राओं और लड़कियों** के लिए उपलब्ध छात्रवृत्तियां हैं:`
          : `Here are the top scholarships exclusively or specially designed for **female students & girls**:`,
        scholarships: girlSchemes.slice(0, 4),
        action: { type: 'filter_gender_female', label: lang === 'hi' ? '👩‍🎓 लड़कियों के फ़िल्टर लागू करें' : '👩‍🎓 Show Girls Only in App' },
        suggestions: ['AICTE Pragati', 'Kotak Kanya', 'Single Girl Child scheme']
      };
    }

    // 4. Search for Low Income / EWS
    if (/(low income|income|poor|bpl|गरीब|आय|2\.5 lakh|कम आय)/i.test(text)) {
      const lowIncome = scholarships.filter(s => s.max_income_lakh && s.max_income_lakh <= 2.5);
      return {
        text: lang === 'hi'
          ? `यहाँ पारिवारिक आय **₹2.5 लाख प्रति वर्ष या उससे कम** वाले छात्रों के लिए मुख्य योजनाएं हैं:`
          : `Here are top scholarships available for students with family income **up to ₹2.5 Lakh per year**:`,
        scholarships: lowIncome.slice(0, 4),
        action: { type: 'filter_low_income', label: lang === 'hi' ? '💰 आय ≤ ₹2.5L फ़िल्टर लगाएं' : '💰 Filter Income ≤ ₹2.5L' },
        suggestions: ['Post-Matric SC/ST', 'HDFC Parivartan', 'UP Scholarship']
      };
    }

    // 5. Engineering / Technical / Medical queries
    if (/(engineering|btech|be|technical|polytechnic|medical|mbbs|इंजीनियरिंग|बीटेक)/i.test(text)) {
      const techSchemes = scholarships.filter(s => {
        const crs = (s.courses || []).join(' ').toLowerCase();
        return crs.includes('engineer') || crs.includes('technical') || crs.includes('polytechnic') || crs.includes('degree') || s.id.includes('aicte');
      });
      return {
        text: lang === 'hi'
          ? `यहाँ **इंजीनियरिंग, तकनीकी और व्यावसायिक डिग्री** के छात्रों के लिए प्रमुख योजनाएं हैं:`
          : `Here are the top schemes for students pursuing **Engineering, Technical, or Professional degrees**:`,
        scholarships: techSchemes.slice(0, 4),
        suggestions: ['AICTE Pragati', 'Kotak Kanya', 'Reliance UG']
      };
    }

    // 6. Check deadlines / dates
    if (/(deadline|last date|expiry|when to apply|तारीख|अंतिम तिथि|समय सीमा)/i.test(text)) {
      const openWithDates = scholarships.filter(s => s.status === 'open_verify_date' && s.deadline_2026_27);
      openWithDates.sort((a, b) => new Date(a.deadline_2026_27) - new Date(b.deadline_2026_27));

      return {
        text: lang === 'hi'
          ? `यहाँ वे छात्रवृत्तियां हैं जिनकी आवेदन तिथि वर्तमान में **सक्रिय/खुली** है:`
          : `Here are currently active scholarships with open or announced application cycles:`,
        scholarships: openWithDates.slice(0, 4),
        action: { type: 'filter_open', label: lang === 'hi' ? '🟢 केवल खुली योजनाएं दिखाएं' : '🟢 Show Open Schemes Only' },
        suggestions: ['Set deadline reminder', 'Required documents', 'Check my eligibility']
      };
    }

    // 7. Check FAQs
    for (const faq of FAQ_KNOWLEDGE) {
      if (faq.keywords.some(k => text.includes(k))) {
        return {
          text: faq.response,
          suggestions: ['Check my eligibility', 'Scholarships for girls', 'Open scholarships']
        };
      }
    }

    // 8. Specific Scholarship Search by Name
    const matched = scholarships.filter(s => {
      const name = (s.name || '').toLowerCase();
      const prov = (s.provider || '').toLowerCase();
      return name.includes(text) || prov.includes(text) || text.split(/\s+/).some(w => w.length > 3 && name.includes(w));
    });

    if (matched.length > 0) {
      return {
        text: lang === 'hi'
          ? `मुझे आपकी खोज से संबंधित **${matched.length} छात्रवृत्तियां** मिलीं:`
          : `I found **${matched.length} scholarship(s)** matching "${rawText}":`,
        scholarships: matched.slice(0, 3),
        suggestions: ['Check my eligibility', 'Show all open schemes', 'Clear search']
      };
    }

    // Default Fallback
    return {
      text: lang === 'hi'
        ? `मैं आपकी बात पूरी तरह समझ नहीं पाया। आप मुझसे छात्रवृत्ति पात्रता, विशिष्ट कोर्स (जैसे इंजीनियरिंग), राज्य योजनाएं, या आवश्यक दस्तावेजों के बारे में पूछ सकते हैं!`
        : `I didn't quite find a direct match for that. Try asking about specific courses (e.g., "Engineering scholarships"), eligibility requirements, states, or required documents!`,
      suggestions: ['Check my eligibility', 'Scholarships for girls', 'Income below 2.5L', 'Required documents']
    };
  }

  /* ───────────── Render UI Widget ───────────── */
  function renderChatbotWidget() {
    // Avoid duplicate injection
    if (document.getElementById('scholarBotContainer')) return;

    const div = document.createElement('div');
    div.id = 'scholarBotContainer';
    div.className = 'fixed bottom-5 right-5 z-50 flex flex-col items-end pointer-events-none font-sans';

    div.innerHTML = `
      <!-- Chatbot Floating Window -->
      <div id="scholarBotWindow" class="hidden pointer-events-auto w-[360px] sm:w-[400px] h-[520px] max-h-[85vh] bg-white rounded-2xl shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden mb-3 transition-all duration-300 transform origin-bottom-right">
        
        <!-- Header -->
        <div class="px-4 py-3.5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between shadow-xs">
          <div class="flex items-center gap-2.5">
            <div class="relative w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-emerald-400 flex items-center justify-center text-white shadow-sm">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
              </svg>
              <span class="w-2 h-2 rounded-full bg-emerald-400 absolute -top-0.5 -right-0.5 border border-slate-900"></span>
            </div>
            <div>
              <div class="font-bold text-sm tracking-tight flex items-center gap-1.5">
                <span>ScholarBot AI</span>
                <span class="px-1.5 py-0.2 text-[9px] font-bold rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">Assistant</span>
              </div>
              <div class="text-[11px] text-indigo-200 flex items-center gap-1">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>Online & Ready</span>
              </div>
            </div>
          </div>
          <div class="flex items-center gap-1">
            <button id="scholarBotClearBtn" class="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors" title="Clear chat history">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
            </button>
            <button id="scholarBotCloseBtn" class="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors" title="Close chat">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Chat Messages Scroll Container -->
        <div id="scholarBotMessages" class="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50 text-xs text-slate-800">
          <!-- Initial bot welcome -->
        </div>

        <!-- Suggested Quick Prompts -->
        <div id="scholarBotSuggestions" class="px-3 py-2 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
          <!-- Populated dynamically -->
        </div>

        <!-- Input Bar -->
        <div class="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
          <input 
            type="text" 
            id="scholarBotInput"
            placeholder="Ask anything about scholarships..." 
            class="flex-1 px-3.5 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
          <button 
            id="scholarBotSendBtn" 
            class="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors shrink-0"
            title="Send message"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Floating Trigger Button -->
      <button 
        id="scholarBotToggleBtn" 
        class="pointer-events-auto flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 text-white shadow-xl shadow-indigo-600/30 hover:scale-105 transition-all group"
        title="Open Scholarship AI Assistant"
      >
        <div class="relative">
          <svg class="w-5 h-5 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
          </svg>
          <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-indigo-600 absolute -top-1 -right-1 animate-pulse"></span>
        </div>
        <span class="font-bold text-xs tracking-tight">AI Assistant</span>
      </button>
    `;

    document.body.appendChild(div);

    // Initial greeting
    setupInitialGreeting();

    // Event listeners
    setupChatListeners();
  }

  function setupInitialGreeting() {
    const messages = document.getElementById('scholarBotMessages');
    const lang = window.ScholarFinderI18n?.getCurrentLang() || 'en';
    const profile = getProfile();
    const name = profile?.name ? ` **${profile.name}**` : '';

    messages.innerHTML = '';
    appendBotMessage({
      text: lang === 'hi'
        ? `नमस्ते${name}! 🙏 मैं आपका **ScholarFinder AI सहायक** हूँ।\n\nआप मुझसे किसी भी छात्रवृत्ति की पात्रता, आवश्यक दस्तावेज, आवेदन प्रक्रिया या अंतिम तिथि के बारे में पूछ सकते हैं!`
        : `Hi${name}! 👋 I am your **ScholarFinder AI Assistant**.\n\nAsk me anything about scholarship eligibility, documents checklist, application portals, or upcoming deadlines!`,
      suggestions: ['Check my eligibility', 'Scholarships for girls', 'Required documents', 'Open scholarships']
    });
  }

  function appendUserMessage(text) {
    const messages = document.getElementById('scholarBotMessages');
    const msg = document.createElement('div');
    msg.className = 'flex justify-end';
    msg.innerHTML = `
      <div class="max-w-[85%] px-3.5 py-2.5 rounded-2xl rounded-tr-xs bg-indigo-600 text-white shadow-xs">
        <p class="leading-relaxed whitespace-pre-wrap">${escapeHtml(text)}</p>
      </div>
    `;
    messages.appendChild(msg);
    messages.scrollTop = messages.scrollHeight;
  }

  function appendBotMessage(data) {
    const messages = document.getElementById('scholarBotMessages');
    const msg = document.createElement('div');
    msg.className = 'flex items-start gap-2';

    // Format markdown-style bold and bullet points
    let formatted = escapeHtml(data.text)
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n\n/g, '<br><br>')
      .replace(/\n• /g, '<br>• ')
      .replace(/\n/g, '<br>');

    let cardsHtml = '';
    if (data.scholarships && data.scholarships.length) {
      cardsHtml = `<div class="mt-2.5 space-y-1.5">` + data.scholarships.map(s => {
        const amt = s.amount_per_year_inr 
          ? `₹${s.amount_per_year_inr.toLocaleString('en-IN')}/yr` 
          : (s.amount_text ? s.amount_text : 'Grant');
        return `
          <div class="bot-scholarship-card p-2 rounded-xl bg-white border border-slate-200/90 hover:border-indigo-300 hover:shadow-xs transition-all cursor-pointer flex items-center justify-between gap-2" data-id="${s.id}">
            <div class="min-w-0 flex-1">
              <div class="font-bold text-slate-800 text-[11px] truncate">${escapeHtml(s.name)}</div>
              <div class="text-[10px] text-slate-500 truncate">${escapeHtml(s.provider || '')} · <span class="font-semibold text-emerald-600">${escapeHtml(amt)}</span></div>
            </div>
            <button class="shrink-0 px-2 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-[10px] font-bold hover:bg-indigo-100">View</button>
          </div>
        `;
      }).join('') + `</div>`;
    }

    let actionBtnHtml = '';
    if (data.action) {
      actionBtnHtml = `
        <button class="bot-action-btn mt-2.5 w-full py-1.5 px-3 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white text-[11px] font-bold shadow-xs transition-colors" data-action="${data.action.type}">
          ${data.action.label}
        </button>
      `;
    }

    msg.innerHTML = `
      <div class="w-6 h-6 rounded-lg bg-gradient-to-tr from-indigo-600 to-emerald-400 flex items-center justify-center text-white shrink-0 mt-0.5">
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
        </svg>
      </div>
      <div class="max-w-[85%] px-3.5 py-2.5 rounded-2xl rounded-tl-xs bg-white text-slate-800 border border-slate-200/80 shadow-xs">
        <div class="leading-relaxed">${formatted}</div>
        ${cardsHtml}
        ${actionBtnHtml}
      </div>
    `;

    // Hook card clicks
    msg.querySelectorAll('.bot-scholarship-card').forEach(el => {
      el.addEventListener('click', () => {
        const id = el.dataset.id;
        const s = getScholarships().find(item => item.id === id);
        if (s && window.ScholarFinder) {
          window.ScholarFinder.openModal(s);
        }
      });
    });

    // Hook action buttons
    const actionBtn = msg.querySelector('.bot-action-btn');
    if (actionBtn) {
      actionBtn.addEventListener('click', () => {
        executeBotAction(actionBtn.dataset.action);
      });
    }

    messages.appendChild(msg);
    messages.scrollTop = messages.scrollHeight;

    // Update suggestions bar
    renderSuggestions(data.suggestions || []);
  }

  function renderSuggestions(list) {
    const bar = document.getElementById('scholarBotSuggestions');
    if (!bar) return;

    if (!list || list.length === 0) {
      bar.classList.add('hidden');
      return;
    }

    bar.classList.remove('hidden');
    bar.innerHTML = list.map(item => `
      <button class="bot-suggestion-chip px-2.5 py-1 rounded-full bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 text-[11px] font-medium whitespace-nowrap border border-slate-200/70 transition-colors">
        ${escapeHtml(item)}
      </button>
    `).join('');

    bar.querySelectorAll('.bot-suggestion-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        handleSend(btn.textContent.trim());
      });
    });
  }

  function executeBotAction(actionType) {
    const SF = window.ScholarFinder;
    if (!SF) return;

    switch (actionType) {
      case 'open_profile':
        const modal = document.getElementById('profileModal');
        if (modal) {
          modal.classList.remove('modal-hidden');
          document.body.style.overflow = 'hidden';
        }
        break;

      case 'apply_profile_filter':
        const profile = getProfile();
        if (profile) {
          if (profile.educationLevel) SF.state.filters.levels = [profile.educationLevel];
          if (profile.state) SF.state.filters.state = profile.state;
          if (profile.category) SF.state.filters.category = profile.category;
          if (profile.gender && profile.gender === 'female') SF.state.filters.gender = 'female';
          SF.applyFiltersAndRender();
          const main = document.querySelector('main');
          if (main) main.scrollIntoView({ behavior: 'smooth' });
        }
        break;

      case 'filter_gender_female':
        SF.state.filters.gender = 'female';
        document.querySelectorAll('#genderFilterGroup .gender-btn').forEach(b => {
          if (b.dataset.gender === 'female') {
            b.classList.add('border-indigo-600', 'bg-indigo-50', 'text-indigo-700', 'active-gender');
            b.classList.remove('border-slate-200', 'bg-white', 'text-slate-700');
          } else {
            b.classList.remove('border-indigo-600', 'bg-indigo-50', 'text-indigo-700', 'active-gender');
            b.classList.add('border-slate-200', 'bg-white', 'text-slate-700');
          }
        });
        SF.applyFiltersAndRender();
        document.querySelector('main')?.scrollIntoView({ behavior: 'smooth' });
        break;

      case 'filter_low_income':
        SF.state.filters.maxIncome = '2.5';
        const incomeSelect = document.getElementById('incomeFilterSelect');
        if (incomeSelect) incomeSelect.value = '2.5';
        const incomeDisp = document.getElementById('incomeDisplayVal');
        if (incomeDisp) incomeDisp.textContent = '<= ₹2.5L / yr';
        SF.applyFiltersAndRender();
        document.querySelector('main')?.scrollIntoView({ behavior: 'smooth' });
        break;

      case 'filter_open':
        SF.state.filters.status = 'open_verify_date';
        const statusSelect = document.getElementById('statusFilterSelect');
        if (statusSelect) statusSelect.value = 'open_verify_date';
        SF.applyFiltersAndRender();
        document.querySelector('main')?.scrollIntoView({ behavior: 'smooth' });
        break;
    }
  }

  function handleSend(userQuery) {
    const input = document.getElementById('scholarBotInput');
    const text = userQuery || (input ? input.value.trim() : '');
    if (!text) return;

    if (input) input.value = '';

    appendUserMessage(text);

    // Simulate thinking delay for natural conversational feel
    setTimeout(() => {
      const response = processUserMessage(text);
      appendBotMessage(response);
    }, 250);
  }

  function setupChatListeners() {
    const toggleBtn = document.getElementById('scholarBotToggleBtn');
    const closeBtn = document.getElementById('scholarBotCloseBtn');
    const clearBtn = document.getElementById('scholarBotClearBtn');
    const windowEl = document.getElementById('scholarBotWindow');
    const input = document.getElementById('scholarBotInput');
    const sendBtn = document.getElementById('scholarBotSendBtn');

    toggleBtn?.addEventListener('click', () => {
      isOpen = !isOpen;
      if (isOpen) {
        windowEl.classList.remove('hidden');
        input?.focus();
      } else {
        windowEl.classList.add('hidden');
      }
    });

    closeBtn?.addEventListener('click', () => {
      isOpen = false;
      windowEl.classList.add('hidden');
    });

    clearBtn?.addEventListener('click', () => {
      setupInitialGreeting();
    });

    sendBtn?.addEventListener('click', () => handleSend());

    input?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSend();
      }
    });
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function initChatbot() {
    renderChatbotWidget();
    console.log('✅ ScholarBot AI Chatbot initialized');
  }

  document.addEventListener('scholarfinder:ready', initChatbot);
  if (window.ScholarFinder) initChatbot();
})();
