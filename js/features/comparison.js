/**
 * ScholarFinder — Scholarship Comparison
 * Compare benefits, requirements, and deadlines side-by-side.
 */
(function () {
  'use strict';

  const MAX_COMPARE = 4;
  let compareList = [];
  let compareMode = false;

  function getScholarshipById(SF, id) {
    return SF.state.allScholarships.find(s => s.id === id);
  }

  function updateCompareBar() {
    const bar = document.getElementById('compareBar');
    if (!bar) return;

    if (compareList.length === 0) {
      bar.classList.add('hidden');
      return;
    }

    bar.classList.remove('hidden');
    const SF = window.ScholarFinder;

    bar.innerHTML = `
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 py-3">
        <div class="flex items-center gap-3 flex-wrap flex-1">
          <span class="text-sm font-semibold text-white">Compare (${compareList.length}/${MAX_COMPARE}):</span>
          ${compareList.map(id => {
            const s = getScholarshipById(SF, id);
            return s ? `<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 text-white text-xs font-medium border border-white/20">
              <span class="truncate max-w-[120px]">${SF.escapeHtml(s.name)}</span>
              <button class="compare-remove-btn hover:text-red-300" data-id="${id}">&times;</button>
            </span>` : '';
          }).join('')}
        </div>
        <div class="flex items-center gap-2 shrink-0">
          <button id="compareNowBtn" class="px-4 py-2 rounded-xl bg-white text-indigo-700 text-sm font-bold shadow-md hover:bg-slate-100 transition-colors ${compareList.length < 2 ? 'opacity-50 cursor-not-allowed' : ''}">
            Compare Now
          </button>
          <button id="clearCompareBtn" class="px-3 py-2 rounded-xl bg-white/10 text-white text-sm font-semibold hover:bg-white/20 transition-colors">
            Clear
          </button>
        </div>
      </div>
    `;

    bar.querySelectorAll('.compare-remove-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        removeFromCompare(btn.dataset.id);
      });
    });

    const compareNowBtn = bar.querySelector('#compareNowBtn');
    if (compareNowBtn && compareList.length >= 2) {
      compareNowBtn.addEventListener('click', showComparisonModal);
    }

    bar.querySelector('#clearCompareBtn').addEventListener('click', () => {
      compareList = [];
      updateCompareBar();
      updateCompareCheckboxes();
    });
  }

  function addToCompare(id) {
    if (compareList.length >= MAX_COMPARE || compareList.includes(id)) return;
    compareList.push(id);
    updateCompareBar();
    updateCompareCheckboxes();
  }

  function removeFromCompare(id) {
    compareList = compareList.filter(x => x !== id);
    updateCompareBar();
    updateCompareCheckboxes();
  }

  function toggleCompare(id) {
    if (compareList.includes(id)) {
      removeFromCompare(id);
    } else {
      addToCompare(id);
    }
  }

  function updateCompareCheckboxes() {
    document.querySelectorAll('.compare-checkbox').forEach(cb => {
      cb.checked = compareList.includes(cb.dataset.id);
      cb.disabled = !cb.checked && compareList.length >= MAX_COMPARE;
    });
  }

  function injectCompareCheckboxes(SF) {
    const cards = document.querySelectorAll('.scholarship-card');
    const scholarships = SF.state.filteredScholarships;

    cards.forEach((card, i) => {
      if (!scholarships[i]) return;
      const existing = card.querySelector('.compare-checkbox-wrap');
      if (existing) existing.remove();

      const wrap = document.createElement('div');
      wrap.className = 'compare-checkbox-wrap absolute top-3 right-3 z-10';
      wrap.innerHTML = `
        <label class="flex items-center gap-1.5 cursor-pointer px-2 py-1 rounded-lg bg-white/90 backdrop-blur border border-slate-200 shadow-sm hover:shadow text-xs font-medium text-slate-600 transition-all">
          <input type="checkbox" class="compare-checkbox rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" data-id="${scholarships[i].id}" ${compareList.includes(scholarships[i].id) ? 'checked' : ''} ${!compareList.includes(scholarships[i].id) && compareList.length >= MAX_COMPARE ? 'disabled' : ''}>
          <span>Compare</span>
        </label>
      `;
      wrap.querySelector('.compare-checkbox').addEventListener('change', (e) => {
        toggleCompare(e.target.dataset.id);
      });
      card.style.position = 'relative';
      card.appendChild(wrap);
    });
  }

  function showComparisonModal() {
    const SF = window.ScholarFinder;
    const modal = document.getElementById('comparisonModal');
    if (!modal || compareList.length < 2) return;

    const scholarships = compareList.map(id => getScholarshipById(SF, id)).filter(Boolean);

    const rows = [
      { label: 'Provider', key: s => s.provider || 'N/A' },
      { label: 'Education Level', key: s => (s.level || []).join(', ') || 'Any' },
      { label: 'Eligible States', key: s => s.states?.includes('ALL') ? 'All India' : (s.states || []).join(', ') },
      { label: 'Categories', key: s => s.categories?.includes('ALL') ? 'All Categories' : (s.categories || []).join(', ') },
      { label: 'Gender', key: s => s.gender === 'female' ? 'Female Only' : 'Any Gender' },
      { label: 'Max Income', key: s => s.max_income_lakh ? `₹${s.max_income_lakh} Lakh/yr` : 'No Limit' },
      { label: 'Min Marks', key: s => s.min_marks_pct ? `${s.min_marks_pct}%` : 'Not Specified' },
      { label: 'Award Amount', key: s => s.amount_text || (s.amount_per_year_inr ? SF.formatINR(s.amount_per_year_inr) + '/yr' : 'As per norms') },
      { label: 'Deadline', key: s => s.deadline_2026_27 || 'Check Portal' },
      { label: 'Status', key: s => { const m = SF.getStatusMeta(s.status); return m.label; } },
      { label: 'Special Criteria', key: s => s.special || 'None' },
      { label: 'Courses', key: s => (s.courses || []).join(', ') || 'Various' }
    ];

    // Check eligibility if profile exists
    const profile = window.ScholarFinderProfile?.loadProfile();
    if (profile) {
      rows.push({
        label: '🎯 Match Score',
        key: s => {
          const score = window.ScholarFinderProfile.calculateMatchScore(s, profile);
          const c = window.ScholarFinderProfile.getScoreColor(score);
          return `<span class="px-2 py-1 rounded-lg ${c.bg} ${c.text} ${c.border} border font-bold">${score}%</span>`;
        },
        isHtml: true
      });
    }

    modal.querySelector('.modal-content').innerHTML = `
      <div class="px-6 py-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-start justify-between">
        <div>
          <h2 class="text-xl font-bold" data-i18n="compare_title">Scholarship Comparison</h2>
          <p class="text-xs text-indigo-200 mt-1">Comparing ${scholarships.length} scholarships side-by-side</p>
        </div>
        <button id="closeComparisonModal" class="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>
      <div class="p-6 overflow-x-auto overflow-y-auto flex-1">
        <table class="w-full text-sm border-collapse">
          <thead>
            <tr>
              <th class="text-left p-3 bg-slate-50 border-b-2 border-slate-200 font-bold text-slate-600 text-xs uppercase tracking-wider sticky left-0 z-10 min-w-[140px]">Criteria</th>
              ${scholarships.map(s => `<th class="text-left p-3 bg-slate-50 border-b-2 border-slate-200 font-bold text-slate-800 text-xs min-w-[200px]">${SF.escapeHtml(s.name)}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${rows.map((row, ri) => `
              <tr class="${ri % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}">
                <td class="p-3 border-b border-slate-100 font-semibold text-slate-600 text-xs uppercase tracking-wider sticky left-0 z-10 ${ri % 2 === 0 ? 'bg-white' : 'bg-slate-50'}">${row.label}</td>
                ${scholarships.map(s => `<td class="p-3 border-b border-slate-100 text-slate-700">${row.isHtml ? row.key(s) : SF.escapeHtml(row.key(s))}</td>`).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;

    modal.querySelector('#closeComparisonModal').addEventListener('click', () => {
      modal.classList.add('modal-hidden');
      document.body.style.overflow = '';
    });
    modal.addEventListener('click', e => {
      if (e.target === modal) { modal.classList.add('modal-hidden'); document.body.style.overflow = ''; }
    });

    modal.classList.remove('modal-hidden');
    document.body.style.overflow = 'hidden';
  }

  function initComparison() {
    const SF = window.ScholarFinder;
    if (!SF) return;

    // Monkey-patch renderCards to inject compare checkboxes
    const origRender = SF.renderCards;
    SF.renderCards = function () {
      origRender();
      setTimeout(() => injectCompareCheckboxes(SF), 60);
    };

    // Initial injection
    setTimeout(() => injectCompareCheckboxes(SF), 150);

    // Compare toggle button in toolbar
    const compareToggle = document.getElementById('compareToggleBtn');
    if (compareToggle) {
      compareToggle.addEventListener('click', () => {
        compareMode = !compareMode;
        document.body.classList.toggle('compare-mode-active', compareMode);
        compareToggle.classList.toggle('bg-indigo-600', compareMode);
        compareToggle.classList.toggle('text-white', compareMode);
      });
    }

    console.log('✅ Comparison module initialized');
  }

  document.addEventListener('scholarfinder:ready', initComparison);
  if (window.ScholarFinder) initComparison();
})();
