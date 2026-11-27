/**
 * ScholarFinder — Profile Engine
 * Features: Eligibility Checker, AI Matching Score, Eligibility Explanation, Personalized Dashboard
 */
(function () {
  'use strict';

  const PROFILE_KEY = 'scholarfinder_profile';

  // Default empty profile
  function emptyProfile() {
    return {
      name: '',
      educationLevel: '',
      state: '',
      category: '',
      gender: '',
      familyIncomeLakh: '',
      marksPct: '',
      courseType: '',
      isDisabled: false,
      isOrphan: false,
      isExServicemanWard: false,
      isSingleGirlChild: false
    };
  }

  function loadProfile() {
    try {
      const d = JSON.parse(localStorage.getItem(PROFILE_KEY));
      return d && d.educationLevel ? d : null;
    } catch { return null; }
  }

  function saveProfile(p) {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
  }

  /* ───────────── Eligibility Check Engine ───────────── */
  function checkEligibility(scholarship, profile) {
    const results = [];
    let pass = true;

    // 1. Education Level
    if (profile.educationLevel && scholarship.level && scholarship.level.length) {
      const match = scholarship.level.includes(profile.educationLevel);
      results.push({ criterion: 'Education Level', met: match, detail: match ? `Your level (${profile.educationLevel}) is eligible` : `Requires ${scholarship.level.join('/')} — you selected ${profile.educationLevel}` });
      if (!match) pass = false;
    }

    // 2. State / Domicile
    if (profile.state && scholarship.states && scholarship.states.length) {
      const match = scholarship.states.includes('ALL') || scholarship.states.includes(profile.state);
      results.push({ criterion: 'State Domicile', met: match, detail: match ? (scholarship.states.includes('ALL') ? 'All-India scheme' : `Your state (${profile.state}) is covered`) : `Only for: ${scholarship.states.join(', ')}` });
      if (!match) pass = false;
    }

    // 3. Category
    if (profile.category && scholarship.categories && scholarship.categories.length) {
      const match = scholarship.categories.includes('ALL') || scholarship.categories.includes(profile.category);
      results.push({ criterion: 'Social Category', met: match, detail: match ? (scholarship.categories.includes('ALL') ? 'Open to all categories' : `Your category (${profile.category}) is eligible`) : `Only for: ${scholarship.categories.join(', ')}` });
      if (!match) pass = false;
    }

    // 4. Gender
    if (profile.gender && scholarship.gender) {
      const match = scholarship.gender === 'any' || scholarship.gender === profile.gender;
      results.push({ criterion: 'Gender', met: match, detail: match ? (scholarship.gender === 'any' ? 'Open to all genders' : `${scholarship.gender} only — matches your gender`) : `This scholarship is for ${scholarship.gender} students only` });
      if (!match) pass = false;
    }

    // 5. Family Income
    if (profile.familyIncomeLakh && scholarship.max_income_lakh) {
      const income = parseFloat(profile.familyIncomeLakh);
      const match = income <= scholarship.max_income_lakh;
      results.push({ criterion: 'Family Income', met: match, detail: match ? `Your income (₹${income}L) is within the ₹${scholarship.max_income_lakh}L limit` : `Max income allowed is ₹${scholarship.max_income_lakh}L — yours is ₹${income}L` });
      if (!match) pass = false;
    } else if (!scholarship.max_income_lakh) {
      results.push({ criterion: 'Family Income', met: true, detail: 'No income ceiling for this scholarship' });
    }

    // 6. Minimum Marks
    if (profile.marksPct && scholarship.min_marks_pct) {
      const marks = parseFloat(profile.marksPct);
      const match = marks >= scholarship.min_marks_pct;
      results.push({ criterion: 'Minimum Marks', met: match, detail: match ? `Your marks (${marks}%) meet the ${scholarship.min_marks_pct}% requirement` : `Requires ${scholarship.min_marks_pct}% — you have ${marks}%` });
      if (!match) pass = false;
    } else if (scholarship.min_marks_pct) {
      results.push({ criterion: 'Minimum Marks', met: null, detail: `Requires ${scholarship.min_marks_pct}% — enter your marks to verify` });
    }

    // 7. Special criteria
    if (scholarship.special) {
      let specialMet = null;
      let detail = `Special requirement: ${scholarship.special}`;
      
      if (scholarship.special.toLowerCase().includes('disab') && profile.isDisabled !== undefined) {
        specialMet = profile.isDisabled;
        detail = specialMet ? 'You indicated disability — eligible' : `Requires: ${scholarship.special}`;
        if (!specialMet) pass = false;
      } else if (scholarship.special.toLowerCase().includes('orphan') && profile.isOrphan !== undefined) {
        specialMet = profile.isOrphan;
        detail = specialMet ? 'You indicated orphan/ward status — eligible' : `Requires: ${scholarship.special}`;
        if (!specialMet) pass = false;
      } else if (scholarship.special.toLowerCase().includes('single girl') && profile.isSingleGirlChild !== undefined) {
        specialMet = profile.isSingleGirlChild;
        detail = specialMet ? 'You indicated single girl child — eligible' : `Requires: ${scholarship.special}`;
        if (!specialMet) pass = false;
      } else if (scholarship.special.toLowerCase().includes('ex-service') && profile.isExServicemanWard !== undefined) {
        specialMet = profile.isExServicemanWard;
        detail = specialMet ? 'You indicated ex-serviceman ward — eligible' : `Requires: ${scholarship.special}`;
        if (!specialMet) pass = false;
      }

      results.push({ criterion: 'Special Criteria', met: specialMet, detail: detail });
    }

    return { eligible: pass, results: results };
  }

  /* ───────────── AI Matching Score ───────────── */
  function calculateMatchScore(scholarship, profile) {
    if (!profile || !profile.educationLevel) return null;
    let score = 0;
    let maxScore = 0;
    const weights = { level: 25, state: 20, category: 20, gender: 15, income: 10, marks: 10 };

    // Level
    maxScore += weights.level;
    if (profile.educationLevel && scholarship.level && scholarship.level.length) {
      if (scholarship.level.includes(profile.educationLevel)) score += weights.level;
    }

    // State
    maxScore += weights.state;
    if (profile.state && scholarship.states && scholarship.states.length) {
      if (scholarship.states.includes('ALL') || scholarship.states.includes(profile.state)) score += weights.state;
    }

    // Category
    maxScore += weights.category;
    if (profile.category && scholarship.categories && scholarship.categories.length) {
      if (scholarship.categories.includes('ALL') || scholarship.categories.includes(profile.category)) score += weights.category;
    }

    // Gender
    maxScore += weights.gender;
    if (profile.gender && scholarship.gender) {
      if (scholarship.gender === 'any' || scholarship.gender === profile.gender) score += weights.gender;
    }

    // Income
    maxScore += weights.income;
    if (profile.familyIncomeLakh) {
      const income = parseFloat(profile.familyIncomeLakh);
      if (!scholarship.max_income_lakh || income <= scholarship.max_income_lakh) {
        score += weights.income;
      }
    } else {
      score += weights.income; // No income specified = no penalty
    }

    // Marks
    maxScore += weights.marks;
    if (profile.marksPct) {
      const marks = parseFloat(profile.marksPct);
      if (!scholarship.min_marks_pct || marks >= scholarship.min_marks_pct) {
        score += weights.marks;
      }
    } else {
      score += weights.marks; // No marks specified = no penalty
    }

    // Status bonus: open scholarships get a small boost
    if (scholarship.status === 'open_verify_date') score = Math.min(maxScore, score + 2);

    return maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  }

  /* ───────────── UI Rendering ───────────── */
  function getScoreColor(score) {
    if (score >= 80) return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', bar: 'bg-emerald-500' };
    if (score >= 50) return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', bar: 'bg-amber-500' };
    return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', bar: 'bg-red-400' };
  }

  function renderMatchBadge(score) {
    if (score === null) return '';
    const c = getScoreColor(score);
    return `<div class="match-score-badge flex items-center gap-1.5 px-2 py-1 rounded-lg ${c.bg} ${c.border} border text-xs font-bold ${c.text}">
      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
      <span>${score}% Match</span>
    </div>`;
  }

  /* ───────────── Dashboard ───────────── */
  function renderDashboard(SF) {
    const container = document.getElementById('dashboardSection');
    if (!container) return;

    const profile = loadProfile();
    if (!profile) {
      container.classList.add('hidden');
      return;
    }

    container.classList.remove('hidden');

    // Calculate stats
    const scholarships = SF.state.allScholarships;
    let eligible = 0, partial = 0, totalAmount = 0, openCount = 0;
    const topMatches = [];

    scholarships.forEach(s => {
      const score = calculateMatchScore(s, profile);
      const elig = checkEligibility(s, profile);
      if (score >= 80 && elig.eligible) {
        eligible++;
        if (s.amount_per_year_inr) totalAmount += s.amount_per_year_inr;
      } else if (score >= 50) {
        partial++;
      }
      if (s.status === 'open_verify_date') openCount++;
      topMatches.push({ scholarship: s, score: score, eligible: elig.eligible });
    });

    topMatches.sort((a, b) => (b.score || 0) - (a.score || 0));
    const top5 = topMatches.slice(0, 5);

    // Upcoming deadlines
    const now = new Date();
    const upcoming = scholarships
      .filter(s => s.deadline_2026_27 && new Date(s.deadline_2026_27) > now)
      .sort((a, b) => new Date(a.deadline_2026_27) - new Date(b.deadline_2026_27))
      .slice(0, 3);

    container.innerHTML = `
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
          <div class="flex items-center justify-between mb-5">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-500 flex items-center justify-center text-white">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
              </div>
              <div>
                <h2 class="text-lg font-bold text-slate-900" data-i18n="dashboard_title">Your Personalized Dashboard</h2>
                <p class="text-xs text-slate-500">Welcome back, <span class="font-semibold text-indigo-600">${SF.escapeHtml(profile.name || 'Student')}</span> · ${profile.educationLevel || ''} · ${profile.state || 'All India'}</p>
              </div>
            </div>
            <button onclick="document.getElementById('profileModal').classList.remove('modal-hidden'); document.body.style.overflow='hidden';" class="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
              Edit Profile
            </button>
          </div>

          <!-- Stats Cards -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div class="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200/60">
              <div class="text-2xl font-bold text-emerald-700">${eligible}</div>
              <div class="text-xs text-emerald-600 font-medium" data-i18n="dash_eligible">Fully Eligible</div>
            </div>
            <div class="p-3.5 rounded-xl bg-amber-50 border border-amber-200/60">
              <div class="text-2xl font-bold text-amber-700">${partial}</div>
              <div class="text-xs text-amber-600 font-medium" data-i18n="dash_partial">Partial Match</div>
            </div>
            <div class="p-3.5 rounded-xl bg-indigo-50 border border-indigo-200/60">
              <div class="text-2xl font-bold text-indigo-700">${openCount}</div>
              <div class="text-xs text-indigo-600 font-medium" data-i18n="dash_open">Currently Open</div>
            </div>
            <div class="p-3.5 rounded-xl bg-purple-50 border border-purple-200/60">
              <div class="text-2xl font-bold text-purple-700">${totalAmount > 0 ? '₹' + (totalAmount / 1000).toFixed(0) + 'K+' : '—'}</div>
              <div class="text-xs text-purple-600 font-medium" data-i18n="dash_potential">Potential Aid / yr</div>
            </div>
          </div>

          <!-- Top Matches & Upcoming Deadlines -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <!-- Top Matches -->
            <div>
              <h3 class="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                <svg class="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>
                <span data-i18n="dash_top_matches">Top Matches for You</span>
              </h3>
              <div class="space-y-2">
                ${top5.map(m => {
                  const c = getScoreColor(m.score || 0);
                  return `<div class="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/60 hover:bg-slate-100 cursor-pointer transition-colors" onclick="window.ScholarFinder.openModal(window.ScholarFinder.state.allScholarships.find(s=>s.id==='${m.scholarship.id}'))">
                    <div class="flex-1 min-w-0 mr-3">
                      <div class="text-sm font-semibold text-slate-800 truncate">${SF.escapeHtml(m.scholarship.name)}</div>
                      <div class="text-xs text-slate-500">${SF.escapeHtml(m.scholarship.provider)}</div>
                    </div>
                    <span class="shrink-0 px-2 py-1 rounded-lg text-xs font-bold ${c.bg} ${c.text} ${c.border} border">${m.score}%</span>
                  </div>`;
                }).join('')}
              </div>
            </div>

            <!-- Upcoming Deadlines -->
            <div>
              <h3 class="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                <svg class="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                <span data-i18n="dash_deadlines">Upcoming Deadlines</span>
              </h3>
              <div class="space-y-2">
                ${upcoming.length ? upcoming.map(s => {
                  const dl = new Date(s.deadline_2026_27);
                  const daysLeft = Math.ceil((dl - now) / 86400000);
                  const urgent = daysLeft <= 7;
                  return `<div class="flex items-center justify-between p-3 rounded-xl ${urgent ? 'bg-red-50 border-red-200/60' : 'bg-slate-50 border-slate-200/60'} border hover:bg-slate-100 cursor-pointer transition-colors" onclick="window.ScholarFinder.openModal(window.ScholarFinder.state.allScholarships.find(s=>s.id==='${s.id}'))">
                    <div class="flex-1 min-w-0 mr-3">
                      <div class="text-sm font-semibold text-slate-800 truncate">${SF.escapeHtml(s.name)}</div>
                      <div class="text-xs text-slate-500">${s.deadline_2026_27}</div>
                    </div>
                    <span class="shrink-0 px-2 py-1 rounded-lg text-xs font-bold ${urgent ? 'bg-red-100 text-red-700 border-red-200' : 'bg-indigo-100 text-indigo-700 border-indigo-200'} border">${daysLeft}d left</span>
                  </div>`;
                }).join('') : '<p class="text-sm text-slate-400 p-3">No upcoming deadlines found.</p>'}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /* ───────────── Eligibility Explanation Modal ───────────── */
  function showEligibilityExplanation(scholarship, SF) {
    const profile = loadProfile();
    if (!profile) {
      alert('Please fill in your profile first to see eligibility details.');
      document.getElementById('profileModal').classList.remove('modal-hidden');
      document.body.style.overflow = 'hidden';
      return;
    }

    const result = checkEligibility(scholarship, profile);
    const score = calculateMatchScore(scholarship, profile);
    const c = getScoreColor(score || 0);

    const modal = document.getElementById('eligibilityExplainModal');
    if (!modal) return;

    modal.querySelector('.modal-content').innerHTML = `
      <div class="px-6 py-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-start justify-between">
        <div class="space-y-1 pr-6">
          <h2 class="text-lg font-bold">${SF.escapeHtml(scholarship.name)}</h2>
          <p class="text-xs text-indigo-200">Eligibility Analysis for ${SF.escapeHtml(profile.name || 'Your Profile')}</p>
        </div>
        <button onclick="document.getElementById('eligibilityExplainModal').classList.add('modal-hidden'); document.body.style.overflow='';" class="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>
      <div class="p-6 space-y-5 overflow-y-auto flex-1">
        <!-- Overall Score -->
        <div class="flex items-center gap-4 p-4 rounded-xl ${c.bg} border ${c.border}">
          <div class="text-3xl font-black ${c.text}">${score}%</div>
          <div>
            <div class="text-sm font-bold ${c.text}">${result.eligible ? '✅ You are likely eligible!' : '❌ You may not qualify'}</div>
            <div class="text-xs ${c.text} opacity-75">Based on your profile match with this scholarship's criteria</div>
          </div>
        </div>
        <!-- Score Bar -->
        <div class="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
          <div class="h-3 rounded-full ${c.bar} transition-all duration-500" style="width: ${score}%"></div>
        </div>
        <!-- Criteria Breakdown -->
        <div class="space-y-3">
          <h3 class="text-sm font-bold text-slate-800 uppercase tracking-wider">Detailed Criteria Breakdown</h3>
          ${result.results.map(r => `
            <div class="flex items-start gap-3 p-3 rounded-xl border ${r.met === true ? 'bg-emerald-50/50 border-emerald-200/60' : r.met === false ? 'bg-red-50/50 border-red-200/60' : 'bg-slate-50 border-slate-200/60'}">
              <div class="mt-0.5 shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${r.met === true ? 'bg-emerald-500 text-white' : r.met === false ? 'bg-red-500 text-white' : 'bg-slate-300 text-white'}">
                ${r.met === true ? '✓' : r.met === false ? '✗' : '?'}
              </div>
              <div>
                <div class="text-sm font-semibold text-slate-800">${r.criterion}</div>
                <div class="text-xs text-slate-600 mt-0.5">${r.detail}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    modal.classList.remove('modal-hidden');
    document.body.style.overflow = 'hidden';
  }

  /* ───────────── Profile Modal Setup ───────────── */
  function setupProfileModal(SF) {
    const modal = document.getElementById('profileModal');
    if (!modal) return;

    const profile = loadProfile() || emptyProfile();

    // Build state options from scholarship data
    const stateSet = new Set();
    SF.state.allScholarships.forEach(s => (s.states || []).forEach(st => { if (st !== 'ALL') stateSet.add(st); }));
    const stateOptions = Array.from(stateSet).sort().map(s => `<option value="${s}" ${profile.state === s ? 'selected' : ''}>${s}</option>`).join('');

    modal.querySelector('.modal-content').innerHTML = `
      <div class="px-6 py-5 bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 text-white flex items-start justify-between">
        <div>
          <h2 class="text-xl font-bold" data-i18n="profile_title">Student Profile</h2>
          <p class="text-xs text-purple-200 mt-1" data-i18n="profile_subtitle">Fill in your details to get personalized scholarship matches & eligibility checks</p>
        </div>
        <button id="closeProfileModal" class="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>
      <form id="profileForm" class="p-6 space-y-4 overflow-y-auto flex-1">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5" data-i18n="profile_name">Your Name</label>
            <input type="text" name="name" value="${SF.escapeHtml(profile.name)}" placeholder="Enter your name" class="w-full text-sm rounded-xl border border-slate-200 p-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
          </div>
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5" data-i18n="profile_level">Education Level</label>
            <select name="educationLevel" class="w-full text-sm rounded-xl border border-slate-200 p-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500" required>
              <option value="">Select Level</option>
              <option value="School" ${profile.educationLevel === 'School' ? 'selected' : ''}>School / Secondary</option>
              <option value="Class 11-12" ${profile.educationLevel === 'Class 11-12' ? 'selected' : ''}>Class 11-12 (Higher Sec.)</option>
              <option value="Diploma" ${profile.educationLevel === 'Diploma' ? 'selected' : ''}>Diploma / Polytechnic / ITI</option>
              <option value="UG" ${profile.educationLevel === 'UG' ? 'selected' : ''}>Undergraduate (UG)</option>
              <option value="PG" ${profile.educationLevel === 'PG' ? 'selected' : ''}>Postgraduate (PG)</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5" data-i18n="profile_state">State / Domicile</label>
            <select name="state" class="w-full text-sm rounded-xl border border-slate-200 p-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="">All India</option>
              ${stateOptions}
            </select>
          </div>
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5" data-i18n="profile_category">Social Category</label>
            <select name="category" class="w-full text-sm rounded-xl border border-slate-200 p-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="">Select Category</option>
              <option value="General" ${profile.category === 'General' ? 'selected' : ''}>General / Open</option>
              <option value="OBC" ${profile.category === 'OBC' ? 'selected' : ''}>OBC</option>
              <option value="SC" ${profile.category === 'SC' ? 'selected' : ''}>SC</option>
              <option value="ST" ${profile.category === 'ST' ? 'selected' : ''}>ST</option>
              <option value="EWS" ${profile.category === 'EWS' ? 'selected' : ''}>EWS</option>
              <option value="Minority" ${profile.category === 'Minority' ? 'selected' : ''}>Minority</option>
              <option value="BC" ${profile.category === 'BC' ? 'selected' : ''}>BC / EBC / SEBC / DNT</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5" data-i18n="profile_gender">Gender</label>
            <select name="gender" class="w-full text-sm rounded-xl border border-slate-200 p-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="">Select Gender</option>
              <option value="male" ${profile.gender === 'male' ? 'selected' : ''}>Male</option>
              <option value="female" ${profile.gender === 'female' ? 'selected' : ''}>Female</option>
              <option value="other" ${profile.gender === 'other' ? 'selected' : ''}>Other</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5" data-i18n="profile_income">Family Income (₹ Lakh/yr)</label>
            <input type="number" name="familyIncomeLakh" value="${profile.familyIncomeLakh}" step="0.5" min="0" max="100" placeholder="e.g. 2.5" class="w-full text-sm rounded-xl border border-slate-200 p-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
          </div>
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5" data-i18n="profile_marks">Last Exam Marks (%)</label>
            <input type="number" name="marksPct" value="${profile.marksPct}" step="0.1" min="0" max="100" placeholder="e.g. 78.5" class="w-full text-sm rounded-xl border border-slate-200 p-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
          </div>
        </div>
        <!-- Special conditions -->
        <div class="pt-2">
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">Special Conditions (if applicable)</label>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <label class="flex items-center gap-2 text-sm text-slate-700 cursor-pointer"><input type="checkbox" name="isDisabled" ${profile.isDisabled ? 'checked' : ''} class="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"> Person with Disability (40%+)</label>
            <label class="flex items-center gap-2 text-sm text-slate-700 cursor-pointer"><input type="checkbox" name="isOrphan" ${profile.isOrphan ? 'checked' : ''} class="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"> Orphan / Ward of Armed Forces</label>
            <label class="flex items-center gap-2 text-sm text-slate-700 cursor-pointer"><input type="checkbox" name="isExServicemanWard" ${profile.isExServicemanWard ? 'checked' : ''} class="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"> Ex-Serviceman Ward</label>
            <label class="flex items-center gap-2 text-sm text-slate-700 cursor-pointer"><input type="checkbox" name="isSingleGirlChild" ${profile.isSingleGirlChild ? 'checked' : ''} class="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"> Single Girl Child</label>
          </div>
        </div>
      </form>
      <div class="px-6 py-4 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between gap-3">
        <button id="clearProfileBtn" type="button" class="text-xs font-semibold text-red-600 hover:text-red-800">Clear Profile</button>
        <div class="flex items-center gap-2">
          <button id="cancelProfileBtn" type="button" class="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-sm font-semibold">Cancel</button>
          <button id="saveProfileBtn" type="button" class="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-indigo-600/20">Save & Check Eligibility</button>
        </div>
      </div>
    `;

    // Event handlers
    modal.querySelector('#closeProfileModal').addEventListener('click', () => { modal.classList.add('modal-hidden'); document.body.style.overflow = ''; });
    modal.querySelector('#cancelProfileBtn').addEventListener('click', () => { modal.classList.add('modal-hidden'); document.body.style.overflow = ''; });
    modal.addEventListener('click', e => { if (e.target === modal) { modal.classList.add('modal-hidden'); document.body.style.overflow = ''; } });

    modal.querySelector('#clearProfileBtn').addEventListener('click', () => {
      localStorage.removeItem(PROFILE_KEY);
      setupProfileModal(SF);
      renderDashboard(SF);
      SF.applyFiltersAndRender();
    });

    modal.querySelector('#saveProfileBtn').addEventListener('click', () => {
      const form = modal.querySelector('#profileForm');
      const fd = new FormData(form);
      const p = {
        name: fd.get('name') || '',
        educationLevel: fd.get('educationLevel') || '',
        state: fd.get('state') || '',
        category: fd.get('category') || '',
        gender: fd.get('gender') || '',
        familyIncomeLakh: fd.get('familyIncomeLakh') || '',
        marksPct: fd.get('marksPct') || '',
        isDisabled: form.querySelector('[name="isDisabled"]').checked,
        isOrphan: form.querySelector('[name="isOrphan"]').checked,
        isExServicemanWard: form.querySelector('[name="isExServicemanWard"]').checked,
        isSingleGirlChild: form.querySelector('[name="isSingleGirlChild"]').checked
      };
      saveProfile(p);
      modal.classList.add('modal-hidden');
      document.body.style.overflow = '';
      renderDashboard(SF);
      SF.applyFiltersAndRender();
    });
  }

  /* ───────────── Inject Match Scores into Cards ───────────── */
  function injectMatchScores(SF) {
    const profile = loadProfile();
    if (!profile) return;

    const cards = document.querySelectorAll('.scholarship-card');
    const scholarships = SF.state.filteredScholarships;

    cards.forEach((card, i) => {
      if (!scholarships[i]) return;
      const score = calculateMatchScore(scholarships[i], profile);
      if (score === null) return;

      // Remove existing badge if any
      const existing = card.querySelector('.match-score-badge');
      if (existing) existing.parentElement.removeChild(existing);

      // Add match badge after status badge
      const topRow = card.querySelector('.flex.items-start.justify-between');
      if (topRow) {
        const wrapper = document.createElement('div');
        wrapper.innerHTML = renderMatchBadge(score);
        const badge = wrapper.firstElementChild;
        if (badge) {
          badge.style.cursor = 'pointer';
          badge.title = 'Click for eligibility details';
          badge.addEventListener('click', (e) => {
            e.stopPropagation();
            showEligibilityExplanation(scholarships[i], SF);
          });
          topRow.parentElement.insertBefore(badge, topRow.nextSibling);
        }
      }
    });
  }

  /* ───────────── Add "Check Eligibility" to Modal ───────────── */
  function enhanceDetailModal(SF) {
    const origOpen = SF.openModal;
    SF.openModal = function (scholarship) {
      origOpen(scholarship);
      // Add eligibility check button to modal footer
      const footer = document.querySelector('#detailsModal .px-6.py-4.bg-slate-50');
      if (footer && !footer.querySelector('#modalEligibilityBtn')) {
        const btn = document.createElement('button');
        btn.id = 'modalEligibilityBtn';
        btn.className = 'px-4 py-2.5 rounded-xl border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-700 text-sm font-semibold flex items-center gap-1.5 transition-colors';
        btn.innerHTML = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg><span data-i18n="check_eligibility">Check Eligibility</span>`;
        btn.addEventListener('click', () => showEligibilityExplanation(scholarship, SF));
        const actionDiv = footer.querySelector('.flex.items-center.gap-2');
        if (actionDiv) actionDiv.insertBefore(btn, actionDiv.firstChild);
      }
    };
  }

  /* ───────────── Sort by Match Score ───────────── */
  function addMatchSort(SF) {
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect && !sortSelect.querySelector('option[value="match_score"]')) {
      const opt = document.createElement('option');
      opt.value = 'match_score';
      opt.textContent = 'Best Match (Profile)';
      sortSelect.insertBefore(opt, sortSelect.firstChild);
    }

    // Monkey-patch applyFiltersAndRender to inject match-score sort
    const origApply = SF.applyFiltersAndRender;
    SF.applyFiltersAndRender = function () {
      origApply();
      const profile = loadProfile();
      if (SF.state.sortBy === 'match_score' && profile) {
        SF.state.filteredScholarships.sort((a, b) => {
          const scoreA = calculateMatchScore(a, profile);
          const scoreB = calculateMatchScore(b, profile);
          return (scoreB || 0) - (scoreA || 0);
        });
        SF.renderCards();
      }
      // Always inject match scores after render
      setTimeout(() => injectMatchScores(SF), 50);
    };
  }

  /* ───────────── Init ───────────── */
  function initProfileEngine() {
    const SF = window.ScholarFinder;
    if (!SF) return;

    setupProfileModal(SF);
    renderDashboard(SF);
    enhanceDetailModal(SF);
    addMatchSort(SF);

    // Inject scores on initial render
    setTimeout(() => injectMatchScores(SF), 100);

    // Open profile on button click
    const profileBtn = document.getElementById('profileBtn');
    if (profileBtn) {
      profileBtn.addEventListener('click', () => {
        setupProfileModal(SF);
        document.getElementById('profileModal').classList.remove('modal-hidden');
        document.body.style.overflow = 'hidden';
      });
    }

    console.log('✅ Profile Engine initialized (Eligibility + AI Match + Dashboard)');
  }

  // Expose for other modules
  window.ScholarFinderProfile = { loadProfile, checkEligibility, calculateMatchScore, getScoreColor };

  document.addEventListener('scholarfinder:ready', initProfileEngine);
  if (window.ScholarFinder) initProfileEngine();
})();
