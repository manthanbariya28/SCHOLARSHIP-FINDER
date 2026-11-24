/**
 * ScholarFinder India - Application Logic
 * Supports real-time search, multi-facet filtering, sorting, bookmarking, and modal view.
 */

(function () {
  'use strict';

  // Application State
  const state = {
    allScholarships: [],
    filteredScholarships: [],
    savedIds: new Set(JSON.parse(localStorage.getItem('scholarfinder_saved_ids') || '[]')),
    filters: {
      search: '',
      levels: [],
      state: 'ALL',
      category: 'ALL',
      gender: 'any',
      maxIncome: 'any',
      status: 'ALL'
    },
    sortBy: 'recommended',
    showingSavedOnly: false,
    activeModalScholarship: null
  };

  // DOM Elements
  const DOM = {
    heroSearchInput: document.getElementById('heroSearchInput'),
    clearSearchBtn: document.getElementById('clearSearchBtn'),
    levelFilterContainer: document.getElementById('levelFilterContainer'),
    stateFilterSelect: document.getElementById('stateFilterSelect'),
    categoryFilterSelect: document.getElementById('categoryFilterSelect'),
    genderFilterGroup: document.getElementById('genderFilterGroup'),
    incomeFilterSelect: document.getElementById('incomeFilterSelect'),
    incomeDisplayVal: document.getElementById('incomeDisplayVal'),
    statusFilterSelect: document.getElementById('statusFilterSelect'),
    resetFiltersBtn: document.getElementById('resetFiltersBtn'),
    sortSelect: document.getElementById('sortSelect'),
    scholarshipsGrid: document.getElementById('scholarshipsGrid'),
    resultsCountPill: document.getElementById('resultsCountPill'),
    filterSummaryText: document.getElementById('filterSummaryText'),
    activeFilterTagsBar: document.getElementById('activeFilterTagsBar'),
    emptyState: document.getElementById('emptyState'),
    emptyResetBtn: document.getElementById('emptyResetBtn'),
    savedCountBadge: document.getElementById('savedCountBadge'),
    bookmarkToggleBtn: document.getElementById('bookmarkToggleBtn'),
    mobileFilterToggleBtn: document.getElementById('mobileFilterToggleBtn'),
    filterSidebar: document.getElementById('filterSidebar'),
    closeMobileFilterBtn: document.getElementById('closeMobileFilterBtn'),
    mobileActiveFiltersCount: document.getElementById('mobileActiveFiltersCount'),
    mobileResultCount: document.getElementById('mobileResultCount'),

    // Modal elements
    detailsModal: document.getElementById('detailsModal'),
    modalCloseBtn: document.getElementById('modalCloseBtn'),
    modalHeaderBadges: document.getElementById('modalHeaderBadges'),
    modalTitle: document.getElementById('modalTitle'),
    modalProvider: document.getElementById('modalProvider'),
    modalAmountText: document.getElementById('modalAmountText'),
    modalLevel: document.getElementById('modalLevel'),
    modalStates: document.getElementById('modalStates'),
    modalCategories: document.getElementById('modalCategories'),
    modalGender: document.getElementById('modalGender'),
    modalIncome: document.getElementById('modalIncome'),
    modalMarks: document.getElementById('modalMarks'),
    modalCourses: document.getElementById('modalCourses'),
    modalSpecialSection: document.getElementById('modalSpecialSection'),
    modalSpecialText: document.getElementById('modalSpecialText'),
    modalDeadlineGuidance: document.getElementById('modalDeadlineGuidance'),
    modalSourceLink: document.getElementById('modalSourceLink'),
    modalApplyBtn: document.getElementById('modalApplyBtn'),
    modalSaveBtn: document.getElementById('modalSaveBtn'),
    modalSaveBtnText: document.getElementById('modalSaveBtnText')
  };

  /**
   * Helper: Format Currency (INR)
   */
  function formatINR(val) {
    if (!val && val !== 0) return null;
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  }

  /**
   * Helper: Status Badge Info
   */
  function getStatusMeta(status) {
    switch (status) {
      case 'open_verify_date':
        return {
          label: 'Open / Verify Date',
          classes: 'badge-open font-semibold',
          dotColor: 'bg-emerald-500'
        };
      case 'check_portal':
        return {
          label: 'Check Portal for Dates',
          classes: 'badge-check font-semibold',
          dotColor: 'bg-amber-500'
        };
      case 'closed_2026_27':
        return {
          label: 'Closed for 2026-27',
          classes: 'badge-closed font-medium',
          dotColor: 'bg-slate-400'
        };
      default:
        return {
          label: status || 'Verify on Portal',
          classes: 'badge-closed',
          dotColor: 'bg-slate-400'
        };
    }
  }

  /**
   * Initialize App: Load data & build UI
   */
  async function init() {
    try {
      // 1. Load Data (Check embedded fallback first for local file:// support, else fetch JSON)
      if (window.SCHOLARSHIPS_DATA && Array.isArray(window.SCHOLARSHIPS_DATA.scholarships)) {
        state.allScholarships = window.SCHOLARSHIPS_DATA.scholarships;
      } else {
        const response = await fetch('data/scholarships.json');
        const data = await response.json();
        state.allScholarships = data.scholarships || [];
      }

      console.log(`Successfully loaded ${state.allScholarships.length} scholarships.`);

      // 2. Setup State Dropdown Options
      populateStateDropdown();

      // 3. Attach Event Listeners
      setupEventListeners();

      // 4. Update bookmark badge
      updateBookmarkBadge();

      // 5. Initial Render
      applyFiltersAndRender();

    } catch (err) {
      console.error('Error loading scholarships data:', err);
      if (DOM.scholarshipsGrid) {
        DOM.scholarshipsGrid.innerHTML = `
          <div class="col-span-2 p-8 text-center bg-red-50 border border-red-200 rounded-2xl text-red-700">
            <h4 class="font-bold text-lg mb-2">Unable to load scholarships dataset</h4>
            <p class="text-sm">Please ensure data/scholarships.json is accessible.</p>
          </div>
        `;
      }
    }
  }

  /**
   * Populate State Dropdown dynamically from dataset
   */
  function populateStateDropdown() {
    const stateSet = new Set();
    state.allScholarships.forEach(s => {
      (s.states || []).forEach(st => {
        if (st && st !== 'ALL') stateSet.add(st);
      });
    });

    const sortedStates = Array.from(stateSet).sort();
    sortedStates.forEach(st => {
      const opt = document.createElement('option');
      opt.value = st;
      opt.textContent = st;
      DOM.stateFilterSelect.appendChild(opt);
    });
  }

  /**
   * Setup Event Listeners
   */
  function setupEventListeners() {
    // Search input
    let searchDebounce;
    DOM.heroSearchInput.addEventListener('input', (e) => {
      clearTimeout(searchDebounce);
      const val = e.target.value;
      if (val.trim()) {
        DOM.clearSearchBtn.classList.remove('hidden');
      } else {
        DOM.clearSearchBtn.classList.add('hidden');
      }
      searchDebounce = setTimeout(() => {
        state.filters.search = val.trim().toLowerCase();
        applyFiltersAndRender();
      }, 150);
    });

    DOM.clearSearchBtn.addEventListener('click', () => {
      DOM.heroSearchInput.value = '';
      DOM.clearSearchBtn.classList.add('hidden');
      state.filters.search = '';
      applyFiltersAndRender();
      DOM.heroSearchInput.focus();
    });

    // Education Level Checkboxes
    DOM.levelFilterContainer.querySelectorAll('input[name="levelFilter"]').forEach(cb => {
      cb.addEventListener('change', () => {
        const checked = Array.from(DOM.levelFilterContainer.querySelectorAll('input[name="levelFilter"]:checked'))
          .map(el => el.value);
        state.filters.levels = checked;
        applyFiltersAndRender();
      });
    });

    // State select
    DOM.stateFilterSelect.addEventListener('change', (e) => {
      state.filters.state = e.target.value;
      applyFiltersAndRender();
    });

    // Category select
    DOM.categoryFilterSelect.addEventListener('change', (e) => {
      state.filters.category = e.target.value;
      applyFiltersAndRender();
    });

    // Gender buttons
    DOM.genderFilterGroup.querySelectorAll('.gender-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        DOM.genderFilterGroup.querySelectorAll('.gender-btn').forEach(b => {
          b.classList.remove('border-indigo-600', 'bg-indigo-50', 'text-indigo-700', 'active-gender');
          b.classList.add('border-slate-200', 'bg-white', 'text-slate-700');
        });
        btn.classList.add('border-indigo-600', 'bg-indigo-50', 'text-indigo-700', 'active-gender');
        btn.classList.remove('border-slate-200', 'bg-white', 'text-slate-700');
        state.filters.gender = btn.dataset.gender;
        applyFiltersAndRender();
      });
    });

    // Income select
    DOM.incomeFilterSelect.addEventListener('change', (e) => {
      state.filters.maxIncome = e.target.value;
      const textMap = {
        'any': 'Any Income',
        '2.5': '<= ₹2.5L / yr',
        '4.5': '<= ₹4.5L / yr',
        '6.0': '<= ₹6.0L / yr',
        '8.0': '<= ₹8.0L / yr'
      };
      DOM.incomeDisplayVal.textContent = textMap[e.target.value] || 'Any Income';
      applyFiltersAndRender();
    });

    // Status select
    DOM.statusFilterSelect.addEventListener('change', (e) => {
      state.filters.status = e.target.value;
      applyFiltersAndRender();
    });

    // Sort select
    DOM.sortSelect.addEventListener('change', (e) => {
      state.sortBy = e.target.value;
      applyFiltersAndRender();
    });

    // Reset buttons
    DOM.resetFiltersBtn.addEventListener('click', resetAllFilters);
    DOM.emptyResetBtn.addEventListener('click', resetAllFilters);

    // Quick presets in Hero
    document.querySelectorAll('.quick-preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const preset = btn.dataset.preset;
        applyPreset(preset);
      });
    });

    // Bookmarks toggle in Navbar
    DOM.bookmarkToggleBtn.addEventListener('click', () => {
      state.showingSavedOnly = !state.showingSavedOnly;
      if (state.showingSavedOnly) {
        DOM.bookmarkToggleBtn.classList.add('bg-indigo-50', 'border-indigo-300', 'text-indigo-700');
      } else {
        DOM.bookmarkToggleBtn.classList.remove('bg-indigo-50', 'border-indigo-300', 'text-indigo-700');
      }
      applyFiltersAndRender();
    });

    // Mobile filter toggle
    DOM.mobileFilterToggleBtn.addEventListener('click', () => {
      DOM.filterSidebar.classList.toggle('hidden');
      if (!DOM.filterSidebar.classList.contains('hidden')) {
        DOM.filterSidebar.scrollIntoView({ behavior: 'smooth' });
      }
    });

    DOM.closeMobileFilterBtn.addEventListener('click', () => {
      DOM.filterSidebar.classList.add('hidden');
      window.scrollTo({ top: 350, behavior: 'smooth' });
    });

    // Modal close events
    DOM.modalCloseBtn.addEventListener('click', closeModal);
    DOM.detailsModal.addEventListener('click', (e) => {
      if (e.target === DOM.detailsModal) closeModal();
    });
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !DOM.detailsModal.classList.contains('modal-hidden')) {
        closeModal();
      }
    });

    // Modal Save button
    DOM.modalSaveBtn.addEventListener('click', () => {
      if (state.activeModalScholarship) {
        toggleBookmark(state.activeModalScholarship.id);
        updateModalSaveBtn(state.activeModalScholarship.id);
        renderCards();
      }
    });
  }

  /**
   * Apply Quick Preset Filter
   */
  function applyPreset(preset) {
    resetAllFilters(false);
    switch (preset) {
      case 'female':
        state.filters.gender = 'female';
        // update UI button
        DOM.genderFilterGroup.querySelectorAll('.gender-btn').forEach(b => {
          if (b.dataset.gender === 'female') {
            b.classList.add('border-indigo-600', 'bg-indigo-50', 'text-indigo-700', 'active-gender');
            b.classList.remove('border-slate-200', 'bg-white', 'text-slate-700');
          } else {
            b.classList.remove('border-indigo-600', 'bg-indigo-50', 'text-indigo-700', 'active-gender');
            b.classList.add('border-slate-200', 'bg-white', 'text-slate-700');
          }
        });
        break;
      case 'ug':
        state.filters.levels = ['UG'];
        const ugCb = DOM.levelFilterContainer.querySelector('input[value="UG"]');
        if (ugCb) ugCb.checked = true;
        break;
      case 'low_income':
        state.filters.maxIncome = '2.5';
        DOM.incomeFilterSelect.value = '2.5';
        DOM.incomeDisplayVal.textContent = '<= ₹2.5L / yr';
        break;
      case 'open':
        state.filters.status = 'open_verify_date';
        DOM.statusFilterSelect.value = 'open_verify_date';
        break;
    }
    applyFiltersAndRender();
    const appEl = document.querySelector('main');
    if (appEl) appEl.scrollIntoView({ behavior: 'smooth' });
  }

  /**
   * Reset All Filters to default
   */
  function resetAllFilters(shouldRender = true) {
    state.filters.search = '';
    state.filters.levels = [];
    state.filters.state = 'ALL';
    state.filters.category = 'ALL';
    state.filters.gender = 'any';
    state.filters.maxIncome = 'any';
    state.filters.status = 'ALL';
    state.showingSavedOnly = false;

    // Reset DOM form controls
    DOM.heroSearchInput.value = '';
    DOM.clearSearchBtn.classList.add('hidden');
    DOM.levelFilterContainer.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
    DOM.stateFilterSelect.value = 'ALL';
    DOM.categoryFilterSelect.value = 'ALL';
    DOM.statusFilterSelect.value = 'ALL';
    DOM.incomeFilterSelect.value = 'any';
    DOM.incomeDisplayVal.textContent = 'Any Income';

    DOM.genderFilterGroup.querySelectorAll('.gender-btn').forEach(b => {
      if (b.dataset.gender === 'any') {
        b.classList.add('border-indigo-600', 'bg-indigo-50', 'text-indigo-700', 'active-gender');
        b.classList.remove('border-slate-200', 'bg-white', 'text-slate-700');
      } else {
        b.classList.remove('border-indigo-600', 'bg-indigo-50', 'text-indigo-700', 'active-gender');
        b.classList.add('border-slate-200', 'bg-white', 'text-slate-700');
      }
    });

    DOM.bookmarkToggleBtn.classList.remove('bg-indigo-50', 'border-indigo-300', 'text-indigo-700');

    if (shouldRender) {
      applyFiltersAndRender();
    }
  }

  /**
   * Filter and Sort Logic
   */
  function applyFiltersAndRender() {
    let result = state.allScholarships.slice();

    // 1. Saved Only Filter
    if (state.showingSavedOnly) {
      result = result.filter(s => state.savedIds.has(s.id));
    }

    // 2. Search Query Filter
    if (state.filters.search) {
      const q = state.filters.search;
      result = result.filter(s => {
        const nameMatch = (s.name || '').toLowerCase().includes(q);
        const providerMatch = (s.provider || '').toLowerCase().includes(q);
        const coursesMatch = (s.courses || []).some(c => c.toLowerCase().includes(q));
        const marksNoteMatch = (s.marks_note || '').toLowerCase().includes(q);
        const specialMatch = (s.special || '').toLowerCase().includes(q);
        return nameMatch || providerMatch || coursesMatch || marksNoteMatch || specialMatch;
      });
    }

    // 3. Education Level Filter
    if (state.filters.levels.length > 0) {
      result = result.filter(s => {
        const sLevels = s.level || [];
        return state.filters.levels.some(l => sLevels.includes(l));
      });
    }

    // 4. State Filter
    if (state.filters.state !== 'ALL') {
      const targetState = state.filters.state;
      result = result.filter(s => {
        const sStates = s.states || [];
        return sStates.includes('ALL') || sStates.includes(targetState);
      });
    }

    // 5. Category Filter
    if (state.filters.category !== 'ALL') {
      const targetCat = state.filters.category;
      result = result.filter(s => {
        const sCats = s.categories || [];
        if (sCats.includes('ALL')) return true;
        if (sCats.includes(targetCat)) return true;
        // Grouping logic for backward classes
        if (targetCat === 'BC' && (sCats.includes('EBC') || sCats.includes('SEBC') || sCats.includes('DNT') || sCats.includes('BC'))) return true;
        return false;
      });
    }

    // 6. Gender Filter
    if (state.filters.gender === 'female') {
      result = result.filter(s => s.gender === 'female');
    }

    // 7. Max Income Filter
    if (state.filters.maxIncome !== 'any') {
      const limit = parseFloat(state.filters.maxIncome);
      result = result.filter(s => {
        // If scholarship has no income ceiling, it qualifies for any income
        if (s.max_income_lakh === null || s.max_income_lakh === undefined) return true;
        // If student income is <= limit, scholarship qualifies if student's income is within its max_income_lakh
        return s.max_income_lakh >= limit;
      });
    }

    // 8. Application Status Filter
    if (state.filters.status !== 'ALL') {
      result = result.filter(s => s.status === state.filters.status);
    }

    // 9. Sorting
    result.sort((a, b) => {
      switch (state.sortBy) {
        case 'amount_high':
          const amtA = a.amount_per_year_inr || 0;
          const amtB = b.amount_per_year_inr || 0;
          return amtB - amtA;
        case 'status_open':
          const order = { 'open_verify_date': 1, 'check_portal': 2, 'closed_2026_27': 3 };
          return (order[a.status] || 4) - (order[b.status] || 4);
        case 'title_az':
          return (a.name || '').localeCompare(b.name || '');
        case 'recommended':
        default:
          // Recommended: open schemes first, then check portal, sorted by amount
          const statusRankA = a.status === 'open_verify_date' ? 2 : (a.status === 'check_portal' ? 1 : 0);
          const statusRankB = b.status === 'open_verify_date' ? 2 : (b.status === 'check_portal' ? 1 : 0);
          if (statusRankA !== statusRankB) return statusRankB - statusRankA;
          return (b.amount_per_year_inr || 0) - (a.amount_per_year_inr || 0);
      }
    });

    state.filteredScholarships = result;

    // Update Counts and Tags
    updateResultsSummary();
    renderActiveFilterChips();
    renderCards();
  }

  /**
   * Update Result Count and Badge summaries
   */
  function updateResultsSummary() {
    const total = state.filteredScholarships.length;
    DOM.resultsCountPill.textContent = total;
    DOM.mobileResultCount.textContent = `${total} scholarships`;

    // Calculate active filter count for mobile badge
    let activeCount = 0;
    if (state.filters.search) activeCount++;
    if (state.filters.levels.length > 0) activeCount += state.filters.levels.length;
    if (state.filters.state !== 'ALL') activeCount++;
    if (state.filters.category !== 'ALL') activeCount++;
    if (state.filters.gender !== 'any') activeCount++;
    if (state.filters.maxIncome !== 'any') activeCount++;
    if (state.filters.status !== 'ALL') activeCount++;
    if (state.showingSavedOnly) activeCount++;

    DOM.mobileActiveFiltersCount.textContent = activeCount;

    if (state.showingSavedOnly) {
      DOM.filterSummaryText.textContent = `Showing ${total} saved / shortlisted scholarships`;
    } else if (activeCount > 0) {
      DOM.filterSummaryText.textContent = `Filtered from ${state.allScholarships.length} total scholarships`;
    } else {
      DOM.filterSummaryText.textContent = 'Showing all verified schemes';
    }
  }

  /**
   * Render Active Filter Chips
   */
  function renderActiveFilterChips() {
    const container = DOM.activeFilterTagsBar;
    container.innerHTML = '';

    const chips = [];

    if (state.showingSavedOnly) {
      chips.push({
        label: 'Saved Only',
        remove: () => {
          state.showingSavedOnly = false;
          DOM.bookmarkToggleBtn.classList.remove('bg-indigo-50', 'border-indigo-300', 'text-indigo-700');
          applyFiltersAndRender();
        }
      });
    }

    if (state.filters.search) {
      chips.push({
        label: `"${state.filters.search}"`,
        remove: () => {
          DOM.heroSearchInput.value = '';
          DOM.clearSearchBtn.classList.add('hidden');
          state.filters.search = '';
          applyFiltersAndRender();
        }
      });
    }

    state.filters.levels.forEach(lvl => {
      chips.push({
        label: `Level: ${lvl}`,
        remove: () => {
          const cb = DOM.levelFilterContainer.querySelector(`input[value="${lvl}"]`);
          if (cb) cb.checked = false;
          state.filters.levels = state.filters.levels.filter(l => l !== lvl);
          applyFiltersAndRender();
        }
      });
    });

    if (state.filters.state !== 'ALL') {
      chips.push({
        label: `State: ${state.filters.state}`,
        remove: () => {
          DOM.stateFilterSelect.value = 'ALL';
          state.filters.state = 'ALL';
          applyFiltersAndRender();
        }
      });
    }

    if (state.filters.category !== 'ALL') {
      chips.push({
        label: `Category: ${state.filters.category}`,
        remove: () => {
          DOM.categoryFilterSelect.value = 'ALL';
          state.filters.category = 'ALL';
          applyFiltersAndRender();
        }
      });
    }

    if (state.filters.gender !== 'any') {
      chips.push({
        label: 'Gender: Female Only',
        remove: () => {
          DOM.genderFilterGroup.querySelectorAll('.gender-btn').forEach(b => {
            if (b.dataset.gender === 'any') {
              b.classList.add('border-indigo-600', 'bg-indigo-50', 'text-indigo-700', 'active-gender');
              b.classList.remove('border-slate-200', 'bg-white', 'text-slate-700');
            } else {
              b.classList.remove('border-indigo-600', 'bg-indigo-50', 'text-indigo-700', 'active-gender');
              b.classList.add('border-slate-200', 'bg-white', 'text-slate-700');
            }
          });
          state.filters.gender = 'any';
          applyFiltersAndRender();
        }
      });
    }

    if (state.filters.maxIncome !== 'any') {
      chips.push({
        label: `Income <= ₹${state.filters.maxIncome}L`,
        remove: () => {
          DOM.incomeFilterSelect.value = 'any';
          DOM.incomeDisplayVal.textContent = 'Any Income';
          state.filters.maxIncome = 'any';
          applyFiltersAndRender();
        }
      });
    }

    if (state.filters.status !== 'ALL') {
      const statusNames = {
        'open_verify_date': 'Status: Open',
        'check_portal': 'Status: Check Portal',
        'closed_2026_27': 'Status: Closed'
      };
      chips.push({
        label: statusNames[state.filters.status] || state.filters.status,
        remove: () => {
          DOM.statusFilterSelect.value = 'ALL';
          state.filters.status = 'ALL';
          applyFiltersAndRender();
        }
      });
    }

    if (chips.length === 0) {
      container.classList.add('hidden');
      return;
    }

    container.classList.remove('hidden');

    chips.forEach(chip => {
      const chipEl = document.createElement('span');
      chipEl.className = 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/80 shadow-2xs';
      chipEl.innerHTML = `
        <span>${escapeHtml(chip.label)}</span>
        <button type="button" class="text-indigo-400 hover:text-indigo-800 p-0.5 rounded-full hover:bg-indigo-100 transition-colors">
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      `;
      chipEl.querySelector('button').addEventListener('click', chip.remove);
      container.appendChild(chipEl);
    });

    // Clear All button
    const clearAll = document.createElement('button');
    clearAll.className = 'text-xs font-semibold text-slate-500 hover:text-slate-800 underline px-1 py-1 ml-1';
    clearAll.textContent = 'Clear All';
    clearAll.addEventListener('click', () => resetAllFilters(true));
    container.appendChild(clearAll);
  }

  /**
   * Render Scholarship Cards
   */
  function renderCards() {
    const grid = DOM.scholarshipsGrid;
    grid.innerHTML = '';

    if (state.filteredScholarships.length === 0) {
      grid.classList.add('hidden');
      DOM.emptyState.classList.remove('hidden');
      return;
    }

    grid.classList.remove('hidden');
    DOM.emptyState.classList.add('hidden');

    const fragment = document.createDocumentFragment();

    state.filteredScholarships.forEach(s => {
      const isSaved = state.savedIds.has(s.id);
      const statusMeta = getStatusMeta(s.status);

      // Amount format
      let amountFormatted = s.amount_per_year_inr 
        ? `${formatINR(s.amount_per_year_inr)} / yr` 
        : (s.amount_text ? s.amount_text : 'Financial Grant');

      // Card Element
      const card = document.createElement('div');
      card.className = 'scholarship-card bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between hover:border-indigo-300 relative';

      card.innerHTML = `
        <div>
          <!-- Top Row: Provider & Status Badge -->
          <div class="flex items-start justify-between gap-2 mb-3">
            <span class="text-[11px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 border border-slate-200/60 px-2 py-0.5 rounded-md truncate max-w-[190px]" title="${escapeHtml(s.provider || '')}">
              ${escapeHtml(s.provider || 'Government Scheme')}
            </span>
            <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs ${statusMeta.classes}">
              <span class="w-1.5 h-1.5 rounded-full ${statusMeta.dotColor}"></span>
              <span>${statusMeta.label}</span>
            </span>
          </div>

          <!-- Scholarship Title -->
          <h4 class="font-bold text-slate-900 text-base leading-snug line-clamp-2 hover:text-indigo-600 transition-colors mb-2 cursor-pointer" data-action="view-details">
            ${escapeHtml(s.name)}
          </h4>

          <!-- Highlight Amount Pill -->
          <div class="mb-4 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200/70 text-xs font-bold">
            <svg class="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span class="truncate max-w-[240px]">${escapeHtml(amountFormatted)}</span>
          </div>

          <!-- Quick Criteria Grid -->
          <div class="space-y-1.5 text-xs text-slate-600 mb-4 pb-4 border-b border-slate-100">
            <div class="flex items-center justify-between">
              <span class="text-slate-400">Level:</span>
              <span class="font-medium text-slate-800">${escapeHtml((s.level || []).join(', ') || 'Any')}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-slate-400">State:</span>
              <span class="font-medium text-slate-800">${s.states && s.states.includes('ALL') ? 'All India' : escapeHtml((s.states || []).slice(0, 2).join(', ') + ((s.states || []).length > 2 ? ' +' : ''))}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-slate-400">Category:</span>
              <span class="font-medium text-slate-800">${s.categories && s.categories.includes('ALL') ? 'All Students' : escapeHtml((s.categories || []).join(', '))}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-slate-400">Family Income Limit:</span>
              <span class="font-medium text-slate-800">${s.max_income_lakh ? `Up to ₹${s.max_income_lakh} Lakh/yr` : 'No Limit / Not stated'}</span>
            </div>
          </div>
        </div>

        <!-- Action Row -->
        <div class="flex items-center gap-2 pt-1">
          <button type="button" class="flex-1 py-2 px-3 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white text-xs font-semibold shadow-2xs hover:shadow-sm transition-all" data-action="view-details">
            Full Eligibility &amp; Details
          </button>
          
          <a href="${escapeHtml(s.official_portal || '#')}" target="_blank" rel="noopener noreferrer" class="p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-indigo-600 hover:bg-slate-50 transition-colors" title="Open Official Portal">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
            </svg>
          </a>

          <button type="button" class="bookmark-btn p-2 rounded-xl border ${isSaved ? 'border-amber-300 bg-amber-50 text-amber-600' : 'border-slate-200 text-slate-400 hover:text-amber-500 hover:bg-slate-50'} transition-colors" data-action="save" title="${isSaved ? 'Remove from Saved' : 'Save Scholarship'}">
            <svg class="w-4 h-4" fill="${isSaved ? 'currentColor' : 'none'}" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
            </svg>
          </button>
        </div>
      `;

      // Event handlers on card
      card.querySelectorAll('[data-action="view-details"]').forEach(el => {
        el.addEventListener('click', () => openModal(s));
      });

      const bBtn = card.querySelector('[data-action="save"]');
      bBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleBookmark(s.id);
        renderCards();
      });

      fragment.appendChild(card);
    });

    grid.appendChild(fragment);
  }

  /**
   * Bookmark Management
   */
  function toggleBookmark(id) {
    if (state.savedIds.has(id)) {
      state.savedIds.delete(id);
    } else {
      state.savedIds.add(id);
    }
    localStorage.setItem('scholarfinder_saved_ids', JSON.stringify(Array.from(state.savedIds)));
    updateBookmarkBadge();
  }

  function updateBookmarkBadge() {
    DOM.savedCountBadge.textContent = state.savedIds.size;
  }

  function updateModalSaveBtn(id) {
    const isSaved = state.savedIds.has(id);
    DOM.modalSaveBtnText.textContent = isSaved ? 'Saved' : 'Save';
    if (isSaved) {
      DOM.modalSaveBtn.classList.add('bg-amber-50', 'border-amber-300', 'text-amber-700');
      DOM.modalSaveBtn.classList.remove('bg-white', 'border-slate-200', 'text-slate-700');
    } else {
      DOM.modalSaveBtn.classList.remove('bg-amber-50', 'border-amber-300', 'text-amber-700');
      DOM.modalSaveBtn.classList.add('bg-white', 'border-slate-200', 'text-slate-700');
    }
  }

  /**
   * Modal Logic
   */
  function openModal(scholarship) {
    state.activeModalScholarship = scholarship;
    const statusMeta = getStatusMeta(scholarship.status);

    // Badges
    DOM.modalHeaderBadges.innerHTML = `
      <span class="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-white/10 text-indigo-100 border border-white/20">
        ${escapeHtml(scholarship.id)}
      </span>
      <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs ${statusMeta.classes}">
        <span class="w-1.5 h-1.5 rounded-full ${statusMeta.dotColor}"></span>
        <span>${statusMeta.label}</span>
      </span>
    `;

    DOM.modalTitle.textContent = scholarship.name;
    DOM.modalProvider.textContent = scholarship.provider || 'Government Department';

    // Amount
    const amtYear = scholarship.amount_per_year_inr ? ` (${formatINR(scholarship.amount_per_year_inr)} / year)` : '';
    DOM.modalAmountText.textContent = (scholarship.amount_text || 'Financial Grant according to norms') + amtYear;

    // Attributes
    DOM.modalLevel.textContent = (scholarship.level || []).join(', ') || 'Any Degree Level';
    DOM.modalStates.textContent = scholarship.states && scholarship.states.includes('ALL') 
      ? 'All States in India (National)' 
      : (scholarship.states || []).join(', ');
    DOM.modalCategories.textContent = scholarship.categories && scholarship.categories.includes('ALL')
      ? 'All Categories (General, OBC, SC, ST, EWS)'
      : (scholarship.categories || []).join(', ');
    DOM.modalGender.textContent = scholarship.gender === 'female' ? 'Female Only' : 'Any Gender (Male, Female, Others)';
    DOM.modalIncome.textContent = scholarship.max_income_lakh 
      ? `Up to ₹${scholarship.max_income_lakh} Lakh per year (family income)` 
      : 'No income ceiling specified';

    // Marks
    const marksPct = scholarship.min_marks_pct ? `Min ${scholarship.min_marks_pct}% marks` : '';
    const marksNote = scholarship.marks_note ? (marksPct ? ` (${scholarship.marks_note})` : scholarship.marks_note) : '';
    DOM.modalMarks.textContent = marksPct + marksNote || 'As per admission eligibility';

    // Courses
    DOM.modalCourses.textContent = (scholarship.courses || []).join(', ') || 'Regular degree and post-matric courses.';

    // Special Section
    if (scholarship.special) {
      DOM.modalSpecialSection.classList.remove('hidden');
      DOM.modalSpecialText.textContent = scholarship.special;
    } else {
      DOM.modalSpecialSection.classList.add('hidden');
    }

    // Deadline & guidance
    if (scholarship.status === 'open_verify_date') {
      const dl = scholarship.deadline_2026_27 ? `Last date reported: ${scholarship.deadline_2026_27}. ` : '';
      DOM.modalDeadlineGuidance.textContent = `${dl}Active cycle. Verify exact window and submit documents on the official portal.`;
    } else if (scholarship.status === 'closed_2026_27') {
      const dl = scholarship.deadline_2026_27 ? `(Closed on ${scholarship.deadline_2026_27}). ` : '';
      DOM.modalDeadlineGuidance.textContent = `${dl}Application window for 2026-27 is closed. Keep documentation ready for the upcoming session renewal.`;
    } else {
      DOM.modalDeadlineGuidance.textContent = 'Check the official portal regularly for active scheme announcements, institutional verification deadlines, and state guidelines.';
    }

    // Official links
    DOM.modalApplyBtn.href = scholarship.official_portal || '#';
    DOM.modalSourceLink.href = scholarship.source_url || scholarship.official_portal || '#';

    // Bookmark button
    updateModalSaveBtn(scholarship.id);

    // Show modal
    DOM.detailsModal.classList.remove('modal-hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    DOM.detailsModal.classList.add('modal-hidden');
    document.body.style.overflow = '';
    state.activeModalScholarship = null;
  }

  /**
   * Helper: Escape HTML string
   */
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Run on DOM content loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
