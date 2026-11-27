/**
 * ScholarFinder — Why Eligible & Gap Finder Engine
 * Pinpoints exactly why a student qualifies OR identifies the precise gap
 * preventing eligibility along with actionable guidance on how to bridge it.
 */
(function () {
  'use strict';

  function analyzeEligibilityGaps(scholarship, profile) {
    if (!profile || !profile.educationLevel) {
      return {
        hasProfile: false,
        message: 'Please fill in your student profile to analyze eligibility and gaps.'
      };
    }

    const strengths = [];
    const gaps = [];

    // 1. Education Level
    if (scholarship.level && scholarship.level.length) {
      if (scholarship.level.includes(profile.educationLevel)) {
        strengths.push({
          criterion: 'Education Level',
          status: 'qualified',
          detail: `Your level (${profile.educationLevel}) matches the scheme requirements (${scholarship.level.join(', ')}).`
        });
      } else {
        gaps.push({
          criterion: 'Education Level Mismatch',
          status: 'gap',
          gapSummary: `Requires ${scholarship.level.join('/')} — your profile is ${profile.educationLevel}.`,
          action: `This scheme is not intended for your current education stage. Search for schemes under the "${profile.educationLevel}" level filter.`
        });
      }
    }

    // 2. State Domicile
    if (scholarship.states && scholarship.states.length) {
      if (scholarship.states.includes('ALL')) {
        strengths.push({
          criterion: 'State Domicile',
          status: 'qualified',
          detail: 'Nationwide All-India scheme: Open to students from any State or UT in India.'
        });
      } else if (profile.state && scholarship.states.includes(profile.state)) {
        strengths.push({
          criterion: 'State Domicile',
          status: 'qualified',
          detail: `Your state (${profile.state}) is an officially covered domicile for this scheme.`
        });
      } else if (profile.state) {
        gaps.push({
          criterion: 'State Domicile Restriction',
          status: 'gap',
          gapSummary: `Restricted to: ${scholarship.states.join(', ')}. Your profile state is ${profile.state}.`,
          action: `You must be a permanent resident/domicile of ${scholarship.states.join(' or ')}. Look for schemes covering ${profile.state} or All-India schemes.`
        });
      }
    }

    // 3. Social Category
    if (scholarship.categories && scholarship.categories.length) {
      if (scholarship.categories.includes('ALL')) {
        strengths.push({
          criterion: 'Social Category',
          status: 'qualified',
          detail: 'Open category: Students from all categories (General, OBC, SC, ST, EWS, Minority) are eligible.'
        });
      } else if (profile.category && (scholarship.categories.includes(profile.category) || (profile.category === 'BC' && (scholarship.categories.includes('OBC') || scholarship.categories.includes('EBC'))))) {
        strengths.push({
          criterion: 'Category / Quota',
          status: 'qualified',
          detail: `Your category (${profile.category}) qualifies for this reservation allocation.`
        });
      } else if (profile.category) {
        gaps.push({
          criterion: 'Category Reservation',
          status: 'gap',
          gapSummary: `Reserved specifically for ${scholarship.categories.join('/')}. You selected ${profile.category}.`,
          action: `This is a targeted welfare scheme for ${scholarship.categories.join('/')} communities. Check schemes tagged for ${profile.category} or General/Open.`
        });
      }
    }

    // 4. Gender
    if (scholarship.gender && scholarship.gender !== 'any') {
      if (profile.gender === scholarship.gender) {
        strengths.push({
          criterion: 'Gender Eligibility',
          status: 'qualified',
          detail: `Matches female student special empowerment quota.`
        });
      } else if (profile.gender) {
        gaps.push({
          criterion: 'Gender Restriction',
          status: 'gap',
          gapSummary: `Exclusively for ${scholarship.gender} students. Your profile is ${profile.gender}.`,
          action: `This scholarship is restricted by gender. Select "Any Gender" schemes in the filter sidebar.`
        });
      }
    } else {
      strengths.push({
        criterion: 'Gender Eligibility',
        status: 'qualified',
        detail: 'Open to all genders (Male, Female, Others).'
      });
    }

    // 5. Family Income Limit
    if (scholarship.max_income_lakh) {
      if (profile.familyIncomeLakh) {
        const studentIncome = parseFloat(profile.familyIncomeLakh);
        if (studentIncome <= scholarship.max_income_lakh) {
          const buffer = (scholarship.max_income_lakh - studentIncome).toFixed(1);
          strengths.push({
            criterion: 'Family Income Ceiling',
            status: 'qualified',
            detail: `Your family income (₹${studentIncome}L/yr) is within the ₹${scholarship.max_income_lakh}L ceiling (Safety Buffer: ₹${buffer}L).`
          });
        } else {
          const excess = (studentIncome - scholarship.max_income_lakh).toFixed(1);
          gaps.push({
            criterion: 'Income Exceeds Ceiling',
            status: 'gap',
            gapSummary: `Max limit is ₹${scholarship.max_income_lakh} Lakh/yr. Your stated income is ₹${studentIncome} Lakh/yr (₹${excess}L above limit).`,
            action: `Look for merit-based scholarships without an income limit (such as INSPIRE SHE, CSIR JRF, Reliance Foundation, or PMRF).`
          });
        }
      } else {
        strengths.push({
          criterion: 'Family Income Ceiling',
          status: 'check_needed',
          detail: `Requires family income ≤ ₹${scholarship.max_income_lakh}L/yr. Enter your income in profile to verify.`
        });
      }
    } else {
      strengths.push({
        criterion: 'Family Income Ceiling',
        status: 'qualified',
        detail: 'No family income limit specified for this scheme (Pure merit / universal award).'
      });
    }

    // 6. Minimum Marks
    if (scholarship.min_marks_pct) {
      if (profile.marksPct) {
        const studentMarks = parseFloat(profile.marksPct);
        if (studentMarks >= scholarship.min_marks_pct) {
          const surplus = (studentMarks - scholarship.min_marks_pct).toFixed(1);
          strengths.push({
            criterion: 'Minimum Marks Cut-off',
            status: 'qualified',
            detail: `You scored ${studentMarks}%, surpassing the ${scholarship.min_marks_pct}% requirement (+${surplus}% above cut-off).`
          });
        } else {
          const shortage = (scholarship.min_marks_pct - studentMarks).toFixed(1);
          gaps.push({
            criterion: 'Marks Cut-off Shortage',
            status: 'gap',
            gapSummary: `Requires minimum ${scholarship.min_marks_pct}% marks. Your score is ${studentMarks}% (${shortage}% below cut-off).`,
            action: `Check if your category qualifies for a 5% relaxation (common in central schemes), or explore need-based schemes with no minimum marks.`
          });
        }
      } else {
        strengths.push({
          criterion: 'Minimum Marks Cut-off',
          status: 'check_needed',
          detail: `Requires ${scholarship.min_marks_pct}% in qualifying exam. Enter your marks in profile to verify.`
        });
      }
    }

    // 7. Special Conditions
    if (scholarship.special) {
      let isSpecialMet = null;
      if (scholarship.special.toLowerCase().includes('disab') && profile.isDisabled !== undefined) {
        isSpecialMet = profile.isDisabled;
      } else if (scholarship.special.toLowerCase().includes('orphan') && profile.isOrphan !== undefined) {
        isSpecialMet = profile.isOrphan;
      } else if (scholarship.special.toLowerCase().includes('single girl') && profile.isSingleGirlChild !== undefined) {
        isSpecialMet = profile.isSingleGirlChild;
      } else if (scholarship.special.toLowerCase().includes('ex-service') && profile.isExServicemanWard !== undefined) {
        isSpecialMet = profile.isExServicemanWard;
      }

      if (isSpecialMet === true) {
        strengths.push({
          criterion: 'Special Criteria',
          status: 'qualified',
          detail: `You meet the special condition: ${scholarship.special}`
        });
      } else if (isSpecialMet === false) {
        gaps.push({
          criterion: 'Special Eligibility Condition',
          status: 'gap',
          gapSummary: `Scheme requires: ${scholarship.special}.`,
          action: `This quota is reserved for students meeting this specific life situation.`
        });
      }
    }

    const isFullyQualified = gaps.length === 0;

    return {
      hasProfile: true,
      isFullyQualified,
      strengths,
      gaps,
      score: Math.max(0, Math.round(((strengths.length) / (strengths.length + gaps.length)) * 100))
    };
  }

  function renderGapFinderUI(scholarship) {
    const SF = window.ScholarFinder;
    const profile = window.ScholarFinderProfile?.loadProfile();
    const analysis = analyzeEligibilityGaps(scholarship, profile);

    if (!analysis.hasProfile) {
      return `
        <div class="p-4 rounded-xl bg-purple-50 border border-purple-200 text-xs text-purple-900 flex items-center justify-between gap-3">
          <div class="flex items-center gap-2">
            <span>🎯</span>
            <span><strong>Want an exact eligibility & gap breakdown?</strong> Set up your profile in 30 seconds.</span>
          </div>
          <button onclick="document.getElementById('profileModal').classList.remove('modal-hidden'); document.body.style.overflow='hidden';" class="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold shrink-0">
            Setup Profile
          </button>
        </div>
      `;
    }

    return `
      <div class="space-y-4">
        <!-- Summary Box -->
        <div class="p-4 rounded-xl border ${analysis.isFullyQualified ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900' : 'bg-amber-50/80 border-amber-200 text-amber-900'}">
          <div class="flex items-center justify-between gap-2 mb-1">
            <div class="font-bold text-sm flex items-center gap-1.5">
              <span>${analysis.isFullyQualified ? '🎉 Fully Qualified!' : '⚠️ Eligibility Gaps Identified'}</span>
            </div>
            <span class="px-2 py-0.5 rounded-full text-xs font-bold ${analysis.isFullyQualified ? 'bg-emerald-200 text-emerald-900' : 'bg-amber-200 text-amber-900'}">
              ${analysis.isFullyQualified ? '100% Match' : `${analysis.gaps.length} Gap(s) Found`}
            </span>
          </div>
          <p class="text-xs opacity-90 leading-relaxed">
            ${analysis.isFullyQualified 
              ? 'You meet all mandatory conditions for this scheme based on your current student profile!' 
              : 'You do not meet one or more mandatory conditions. Review the gap analysis below to see what is missing and how to bridge it.'}
          </p>
        </div>

        <!-- Why You Qualify (Strengths) -->
        ${analysis.strengths.length > 0 ? `
          <div class="space-y-2">
            <div class="text-xs font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1">
              <span>✓</span>
              <span>Why You Qualify (${analysis.strengths.length} criteria met)</span>
            </div>
            <div class="space-y-1.5">
              ${analysis.strengths.map(s => `
                <div class="p-2.5 rounded-lg bg-emerald-50/50 border border-emerald-200/70 text-xs text-emerald-900 flex items-start gap-2">
                  <span class="text-emerald-600 mt-0.5">●</span>
                  <div>
                    <strong>${s.criterion}:</strong> ${s.detail}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Gaps & Actionable Advice -->
        ${analysis.gaps.length > 0 ? `
          <div class="space-y-2">
            <div class="text-xs font-bold uppercase tracking-wider text-red-700 flex items-center gap-1">
              <span>✗</span>
              <span>Eligibility Gaps & Action Plan (${analysis.gaps.length} gaps)</span>
            </div>
            <div class="space-y-2">
              ${analysis.gaps.map(g => `
                <div class="p-3 rounded-xl bg-red-50/50 border border-red-200 text-xs text-red-900 space-y-1">
                  <div class="font-bold flex items-center gap-1.5 text-red-800">
                    <span>⚠️</span>
                    <span>${g.criterion}</span>
                  </div>
                  <p class="text-slate-700">${g.gapSummary}</p>
                  <div class="p-2 rounded-lg bg-white/90 border border-red-200 text-slate-800 text-[11px] mt-1">
                    <strong class="text-indigo-600">💡 Actionable Advice:</strong> ${g.action}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }

  // Inject into details modal
  function enhanceModalWithGapFinder(SF) {
    const origOpen = SF.openModal;
    SF.openModal = function (scholarship) {
      origOpen(scholarship);

      const modalBody = document.querySelector('#detailsModal .p-6.space-y-6');
      if (!modalBody) return;

      const existing = modalBody.querySelector('#modalGapFinderSection');
      if (existing) existing.remove();

      const container = document.createElement('div');
      container.id = 'modalGapFinderSection';
      container.className = 'pt-2';
      container.innerHTML = `
        <div class="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
          🎯 AI Eligibility & Gap Finder Analysis
        </div>
        ${renderGapFinderUI(scholarship)}
      `;

      // Insert right after financial award box
      const awardBox = modalBody.querySelector('.bg-indigo-50\\/80');
      if (awardBox) {
        awardBox.after(container);
      } else {
        modalBody.prepend(container);
      }
    };
  }

  function initGapFinder() {
    const SF = window.ScholarFinder;
    if (!SF) return;

    enhanceModalWithGapFinder(SF);
    console.log('✅ Why Eligible & Gap Finder module initialized');
  }

  window.ScholarFinderGapFinder = { analyzeEligibilityGaps, renderGapFinderUI };

  document.addEventListener('scholarfinder:ready', initGapFinder);
  if (window.ScholarFinder) initGapFinder();
})();
