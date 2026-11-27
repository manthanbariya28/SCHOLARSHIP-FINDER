/**
 * ScholarFinder — Smart Search
 * Understands natural-language queries and auto-applies filters.
 */
(function () {
  'use strict';

  const STATE_NAMES = [
    'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
    'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
    'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab',
    'Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh',
    'Uttarakhand','West Bengal','Jammu and Kashmir','Ladakh','Delhi','Chandigarh'
  ];

  const CATEGORY_MAP = {
    'sc': 'SC', 'scheduled caste': 'SC', 'scheduled castes': 'SC',
    'st': 'ST', 'scheduled tribe': 'ST', 'scheduled tribes': 'ST', 'tribal': 'ST',
    'obc': 'OBC', 'other backward': 'OBC',
    'general': 'General', 'open category': 'General', 'unreserved': 'General',
    'ews': 'EWS', 'economically weaker': 'EWS',
    'minority': 'Minority', 'muslim': 'Minority', 'christian': 'Minority', 'sikh': 'Minority',
    'bc': 'BC', 'ebc': 'BC', 'dnt': 'BC'
  };

  const LEVEL_MAP = {
    'school': 'School', 'secondary': 'School', 'class 10': 'School', 'matric': 'School',
    'class 11': 'Class 11-12', 'class 12': 'Class 11-12', 'higher secondary': 'Class 11-12', 'intermediate': 'Class 11-12', '11-12': 'Class 11-12', '12th': 'Class 11-12',
    'diploma': 'Diploma', 'polytechnic': 'Diploma', 'iti': 'Diploma',
    'ug': 'UG', 'undergraduate': 'UG', 'graduation': 'UG', 'bachelors': 'UG', 'btech': 'UG', 'bsc': 'UG', 'ba': 'UG', 'bcom': 'UG', 'engineering': 'UG', 'mbbs': 'UG', 'degree': 'UG',
    'pg': 'PG', 'postgraduate': 'PG', 'masters': 'PG', 'mtech': 'PG', 'mba': 'PG', 'msc': 'PG', 'ma': 'PG', 'post graduate': 'PG'
  };

  const GENDER_KEYWORDS = {
    'girl': 'female', 'girls': 'female', 'female': 'female', 'women': 'female', 'woman': 'female', 'ladies': 'female', 'mahila': 'female'
  };

  function parseNaturalQuery(query) {
    const q = query.toLowerCase().trim();
    const result = { searchText: query, filters: {} };

    // Extract income
    const incomeMatch = q.match(/(?:below|under|upto|up to|less than|within|income)\s*(?:rs\.?|₹|inr)?\s*(\d+(?:\.\d+)?)\s*(?:lakh|lac|l\b|lpa)?/i)
      || q.match(/(?:rs\.?|₹|inr)\s*(\d+(?:\.\d+)?)\s*(?:lakh|lac|l\b)/i);
    if (incomeMatch) {
      let val = parseFloat(incomeMatch[1]);
      if (val > 100) val = val / 100000; // Convert if given in absolute (e.g., 250000 -> 2.5)
      const incomeOptions = [2.5, 4.5, 6.0, 8.0];
      const closest = incomeOptions.reduce((a, b) => Math.abs(b - val) < Math.abs(a - val) ? b : a);
      result.filters.maxIncome = String(closest);
    }

    // Extract state
    for (const state of STATE_NAMES) {
      if (q.includes(state.toLowerCase())) {
        result.filters.state = state;
        break;
      }
    }
    // Abbreviations
    if (!result.filters.state) {
      const abbrevs = {
        'up': 'Uttar Pradesh', 'mp': 'Madhya Pradesh', 'wb': 'West Bengal',
        'hp': 'Himachal Pradesh', 'ap': 'Andhra Pradesh', 'tn': 'Tamil Nadu',
        'tg': 'Telangana', 'ts': 'Telangana', 'kl': 'Kerala', 'ka': 'Karnataka',
        'mh': 'Maharashtra', 'rj': 'Rajasthan', 'gj': 'Gujarat', 'br': 'Bihar',
        'pb': 'Punjab', 'hr': 'Haryana', 'jh': 'Jharkhand', 'cg': 'Chhattisgarh',
        'od': 'Odisha', 'as': 'Assam', 'dl': 'Delhi', 'jk': 'Jammu and Kashmir',
        'j&k': 'Jammu and Kashmir'
      };
      for (const [abbr, full] of Object.entries(abbrevs)) {
        if (new RegExp(`\\b${abbr}\\b`, 'i').test(q)) {
          result.filters.state = full;
          break;
        }
      }
    }

    // Extract category
    for (const [keyword, cat] of Object.entries(CATEGORY_MAP)) {
      if (new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(q)) {
        result.filters.category = cat;
        break;
      }
    }

    // Extract level
    for (const [keyword, level] of Object.entries(LEVEL_MAP)) {
      if (new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(q)) {
        result.filters.levels = [level];
        break;
      }
    }

    // Extract gender
    for (const [keyword, gender] of Object.entries(GENDER_KEYWORDS)) {
      if (new RegExp(`\\b${keyword}\\b`, 'i').test(q)) {
        result.filters.gender = gender;
        break;
      }
    }

    // Check for status keywords
    if (/\b(open|active|current|available|apply now)\b/i.test(q)) {
      result.filters.status = 'open_verify_date';
    }

    return result;
  }

  function applySmartFilters(SF, parsed) {
    const f = parsed.filters;

    if (f.state) {
      SF.state.filters.state = f.state;
      const sel = document.getElementById('stateFilterSelect');
      if (sel) sel.value = f.state;
    }

    if (f.category) {
      SF.state.filters.category = f.category;
      const sel = document.getElementById('categoryFilterSelect');
      if (sel) sel.value = f.category;
    }

    if (f.levels && f.levels.length) {
      SF.state.filters.levels = f.levels;
      f.levels.forEach(lvl => {
        const cb = document.querySelector(`#levelFilterContainer input[value="${lvl}"]`);
        if (cb) cb.checked = true;
      });
    }

    if (f.gender) {
      SF.state.filters.gender = f.gender;
      document.querySelectorAll('#genderFilterGroup .gender-btn').forEach(b => {
        if (b.dataset.gender === f.gender) {
          b.classList.add('border-indigo-600', 'bg-indigo-50', 'text-indigo-700', 'active-gender');
          b.classList.remove('border-slate-200', 'bg-white', 'text-slate-700');
        } else {
          b.classList.remove('border-indigo-600', 'bg-indigo-50', 'text-indigo-700', 'active-gender');
          b.classList.add('border-slate-200', 'bg-white', 'text-slate-700');
        }
      });
    }

    if (f.maxIncome) {
      SF.state.filters.maxIncome = f.maxIncome;
      const sel = document.getElementById('incomeFilterSelect');
      if (sel) sel.value = f.maxIncome;
      const display = document.getElementById('incomeDisplayVal');
      if (display) display.textContent = `<= ₹${f.maxIncome}L / yr`;
    }

    if (f.status) {
      SF.state.filters.status = f.status;
      const sel = document.getElementById('statusFilterSelect');
      if (sel) sel.value = f.status;
    }
  }

  function showSmartSearchHint(parsed) {
    const container = document.getElementById('smartSearchHint');
    if (!container) return;

    const filters = parsed.filters;
    const tags = [];
    if (filters.state) tags.push(`📍 ${filters.state}`);
    if (filters.category) tags.push(`🏷️ ${filters.category}`);
    if (filters.levels) tags.push(`🎓 ${filters.levels.join(', ')}`);
    if (filters.gender) tags.push(`👤 ${filters.gender}`);
    if (filters.maxIncome) tags.push(`💰 ≤₹${filters.maxIncome}L`);
    if (filters.status) tags.push(`🟢 Open`);

    if (tags.length === 0) {
      container.classList.add('hidden');
      return;
    }

    container.classList.remove('hidden');
    container.innerHTML = `
      <div class="flex flex-wrap items-center gap-2 text-xs">
        <span class="text-indigo-300 font-medium">🧠 Smart detected:</span>
        ${tags.map(t => `<span class="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-200 border border-indigo-400/30">${t}</span>`).join('')}
        <button id="applySmartFilters" class="px-2.5 py-1 rounded-full bg-emerald-500 text-white font-semibold hover:bg-emerald-600 transition-colors">Apply Filters</button>
      </div>
    `;

    container.querySelector('#applySmartFilters').addEventListener('click', () => {
      const SF = window.ScholarFinder;
      if (SF) {
        applySmartFilters(SF, parsed);
        SF.applyFiltersAndRender();
        container.classList.add('hidden');
        const main = document.querySelector('main');
        if (main) main.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  function initSmartSearch() {
    const SF = window.ScholarFinder;
    if (!SF) return;

    const input = document.getElementById('heroSearchInput');
    if (!input) return;

    let debounce;
    input.addEventListener('input', () => {
      clearTimeout(debounce);
      debounce = setTimeout(() => {
        const val = input.value.trim();
        if (val.length >= 5 && /\s/.test(val)) {
          const parsed = parseNaturalQuery(val);
          if (Object.keys(parsed.filters).length > 0) {
            showSmartSearchHint(parsed);
          } else {
            const hint = document.getElementById('smartSearchHint');
            if (hint) hint.classList.add('hidden');
          }
        } else {
          const hint = document.getElementById('smartSearchHint');
          if (hint) hint.classList.add('hidden');
        }
      }, 400);
    });

    console.log('✅ Smart Search initialized');
  }

  document.addEventListener('scholarfinder:ready', initSmartSearch);
  if (window.ScholarFinder) initSmartSearch();
})();
