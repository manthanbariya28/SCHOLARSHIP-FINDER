/**
 * ScholarFinder — Caste-Wise Document Checklist
 * Detailed guidelines, issuing authorities, and interactive checklists
 * for SC, ST, OBC, EWS, Minority, and General categories.
 */
(function () {
  'use strict';

  const CASTE_DOCUMENTS_DATA = {
    'SC': {
      title: 'Scheduled Castes (SC)',
      badge: 'bg-purple-100 text-purple-800 border-purple-200',
      description: 'Document requirements for central and state SC scholarships (Post-Matric SC, Pre-Matric SC, Top Class SC, NFSC).',
      validity: 'Permanent / Lifetime in most states (unless format changes or re-verification is mandated).',
      authority: 'Tehsildar / Sub-Divisional Magistrate (SDM) / Revenue Divisional Officer (RDO) / District Magistrate.',
      documents: [
        {
          name: 'Caste / Community Certificate',
          mandatory: true,
          desc: 'Must be issued in the name of the applicant (not parents). Must be digitally signed with QR/Barcode verifiable on State e-District portal.',
          tip: 'Ensure the sub-caste mentioned matches the Presidential Scheduled Castes Order for your state.'
        },
        {
          name: 'Income Certificate',
          mandatory: true,
          desc: 'Must be issued for the current financial year (on or after 1st April). Family income ceiling is usually ₹2.5 Lakh/yr.',
          tip: 'Form 16 or salary slip alone is NOT accepted; must have Tehsildar income certificate.'
        },
        {
          name: 'Aadhaar Card (NPCI-Seeded)',
          mandatory: true,
          desc: 'Must be linked to your active bank account via DBT mapping (check status at resident.uidai.gov.in).',
          tip: 'Name, Gender, and DOB on Aadhaar must 100% match your Class 10 marksheet.'
        },
        {
          name: 'Previous Year Marksheet & Passing Certificate',
          mandatory: true,
          desc: 'Class 10 marksheet is mandatory for all post-matric schemes; previous semester/year marksheet for ongoing courses.',
          tip: 'Must not have backlogs or ATKT unless allowed under state renewal guidelines.'
        },
        {
          name: 'Fee Receipt & Bonafide Certificate',
          mandatory: true,
          desc: 'Current year non-refundable fee receipt with college seal + official Bonafide Certificate downloaded from NSP/State portal.',
          tip: 'Ensure tuition fee, library fee, and development fees are broken down clearly.'
        },
        {
          name: 'Hostel Certificate (if Hosteller)',
          mandatory: false,
          desc: 'Certificate signed by hostel warden with admission number and mess charges to claim additional hosteller maintenance allowance.',
          tip: 'Hosteller allowance is up to 2x higher than day scholar allowance.'
        }
      ]
    },
    'ST': {
      title: 'Scheduled Tribes (ST)',
      badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      description: 'Document guidelines for Ministry of Tribal Affairs (Post-Matric ST, National Overseas ST, Top Class ST, NFST).',
      validity: 'Permanent / Lifetime validity in recognized tribal areas.',
      authority: 'Sub-Divisional Officer (Civil) / District Magistrate / Project Officer (ITDP).',
      documents: [
        {
          name: 'Tribe / Domicile Certificate',
          mandatory: true,
          desc: 'Must certify membership of a recognized Scheduled Tribe. Must contain digital verification number.',
          tip: 'In Northeast & Fifth Schedule areas, certificates issued by Autonomous District Councils (ADC) or Village Heads must be countersigned by BDO/SDO.'
        },
        {
          name: 'Annual Family Income Certificate',
          mandatory: true,
          desc: 'Current financial year certificate showing family income under ₹2.5 Lakh (or ₹6 Lakh for Top Class Education).',
          tip: 'Agricultural land income certificate from Patwari / Revenue Inspector is required in rural areas.'
        },
        {
          name: 'Aadhaar Card & Bank Account Linked to DBT',
          mandatory: true,
          desc: 'National Tribal Portal mandates Aadhaar biometric verification (OTR) and active NPCI mapper.',
          tip: 'Bank account must be a zero-balance or regular savings account in student\'s own name.'
        },
        {
          name: 'Admission Letter & Bonafide Certificate',
          mandatory: true,
          desc: 'Confirmation of regular full-time admission into an approved college/university.',
          tip: 'Distance or private coaching courses are not eligible.'
        },
        {
          name: 'Previous Academic Marksheets',
          mandatory: true,
          desc: 'Self-attested copies of Class 10, Class 12, or Degree marksheets.',
          tip: 'Scanned copies must be clear and under 200KB in PDF/JPEG.'
        }
      ]
    },
    'OBC': {
      title: 'Other Backward Classes (OBC - Non Creamy Layer)',
      badge: 'bg-blue-100 text-blue-800 border-blue-200',
      description: 'Document criteria for PM-YASASVI, Central OBC Schemes, and State Backward Classes Welfare scholarships.',
      validity: 'Strictly valid for ONE financial year only. Must be issued on or after 1st April of current academic session.',
      authority: 'Tehsildar / Sub-Divisional Magistrate / Deputy Commissioner.',
      documents: [
        {
          name: 'OBC Non-Creamy Layer (NCL) Certificate',
          mandatory: true,
          desc: 'CRITICAL: Must explicitly state that the candidate "does not belong to the Creamy Layer section". Central format required for NSP schemes.',
          tip: 'State OBC certificates are NOT valid for Central Sector NSP scholarships unless the caste is in the Central OBC list (ncbc.nic.in).'
        },
        {
          name: 'Family Income Certificate',
          mandatory: true,
          desc: 'Family income from all sources must be under ₹2.5 Lakh (or ₹8.0 Lakh for NFOBC fellowship).',
          tip: 'Salary + agriculture + business income must all be computed.'
        },
        {
          name: 'Non-Creamy Layer Self-Declaration (Affidavit)',
          mandatory: true,
          desc: 'Some state portals require a signed affidavit affirming father/mother is not Class I/II officer.',
          tip: 'Check your state portal (e.g. Mahadbt, Digital Gujarat) for specific Annexure form.'
        },
        {
          name: 'Academic Records (Min 50% - 60%)',
          mandatory: true,
          desc: 'Marksheets of qualifying examination. Many OBC merit schemes require minimum 50% to 60% marks.',
          tip: 'Keep original marksheets ready for college physical verification.'
        },
        {
          name: 'Fee Receipt & Bank Details',
          mandatory: true,
          desc: 'Institutional fee receipt and student-only bank account details with IFSC code.',
          tip: 'Joint accounts with parents often get rejected by automated PFMS payment gateways.'
        }
      ]
    },
    'EWS': {
      title: 'Economically Weaker Section (EWS - General)',
      badge: 'bg-amber-100 text-amber-800 border-amber-200',
      description: 'Requirements for general category students from economically weaker backgrounds.',
      validity: 'Valid for ONE financial year (April to March). Must be renewed annually.',
      authority: 'District Magistrate / Additional DM / Sub-Divisional Magistrate / Tehsildar.',
      documents: [
        {
          name: 'Income & Asset Certificate (EWS)',
          mandatory: true,
          desc: 'Must verify annual family income is below ₹8.0 Lakh AND family does not own: 5+ acres agricultural land, 1000+ sq ft residential flat, 100+ sq yards plot in notified municipality.',
          tip: 'Must be in the official Government of India Annexure format (DoPT OM No. 36039/1/2019).'
        },
        {
          name: 'Proof of General / Open Category',
          mandatory: true,
          desc: 'Declaration that candidate does not fall under SC, ST, or OBC reservation.',
          tip: 'Class 10 marksheet or school transfer certificate showing caste/religion.'
        },
        {
          name: 'Family Ration Card / BPL Card',
          mandatory: false,
          desc: 'Yellow or BPL ration card can serve as supplementary proof of family financial standing.',
          tip: 'Strongly recommended for state-level schemes like Vikramaditya (MP) or Rajarshi Shahu (Maharashtra).'
        },
        {
          name: 'Aadhaar, Marksheets & College Fee Receipt',
          mandatory: true,
          desc: 'Aadhaar seeded account, fee structure receipt from institute, and passing marksheets.',
          tip: 'CAP / Merit counselling admission allotment letter is mandatory for professional courses.'
        }
      ]
    },
    'Minority': {
      title: 'Minority Communities (Muslim, Christian, Sikh, Buddhist, Jain, Parsi)',
      badge: 'bg-teal-100 text-teal-800 border-teal-200',
      description: 'Guidelines for Ministry of Minority Affairs (Post-Matric Minority, Merit-cum-Means, Begum Hazrat Mahal, Aikyashree).',
      validity: 'Self-declaration is valid for the academic cycle; income certificate valid for 1 year.',
      authority: 'State Revenue Authority (Income); Self-declaration / Community Organization (Minority).',
      documents: [
        {
          name: 'Minority Community Self-Declaration',
          mandatory: true,
          desc: 'Signed declaration on non-judicial stamp paper or plain paper affirming student belongs to notified minority community (Muslim, Christian, Sikh, Buddhist, Jain, Parsi).',
          tip: 'Standard format is available on scholarships.gov.in under Minority Affairs guidelines.'
        },
        {
          name: 'Income Certificate (≤ ₹2.0L or ₹2.5L)',
          mandatory: true,
          desc: 'Issued by authorized revenue authority. MCM technical scheme limit is ₹2.5L; Post-Matric is ₹2.0L.',
          tip: 'Must clearly state total annual household income.'
        },
        {
          name: 'Minimum 50% Marks Proof',
          mandatory: true,
          desc: 'Previous final examination marksheet showing minimum 50% aggregate marks.',
          tip: 'Minority schemes strictly enforce the 50% marks cut-off for both fresh and renewal applications.'
        },
        {
          name: 'Institution Verification & Bonafide Form',
          mandatory: true,
          desc: 'Form signed by Head of Institution / College Registrar with AISHE code.',
          tip: 'Your college must be registered on the NSP portal for minority schemes.'
        }
      ]
    },
    'General': {
      title: 'General / Open Category (Merit-Based)',
      badge: 'bg-slate-100 text-slate-800 border-slate-200',
      description: 'Requirements for national merit schemes (INSPIRE, PM-USP CSSS, Reliance, HDFC, Kotak Kanya, State Merit).',
      validity: 'Marksheets are permanent; Income certificate valid for current financial year.',
      authority: 'Educational Boards / Universities / Tehsildar (for need-cum-merit).',
      documents: [
        {
          name: 'Class 12 Board Percentile / Rank Certificate',
          mandatory: true,
          desc: 'For CSSS (PM-USP): Top 80th percentile in Class 12 board. For INSPIRE: Top 1% in board or top 10k JEE/NEET rank.',
          tip: 'Download Advisory Note / Percentile Certificate from your state board or CBSE website.'
        },
        {
          name: 'Family Income Certificate (if applying for need-based)',
          mandatory: false,
          desc: 'For PM-USP CSSS: Income ≤ ₹4.5 Lakh. For HDFC Parivartan: Income ≤ ₹2.5 Lakh. For Reliance: Income ≤ ₹15 Lakh (preference ≤ ₹2.5L). For INSPIRE: NO income certificate needed!',
          tip: 'INSPIRE SHE and PMRF have ZERO income restrictions.'
        },
        {
          name: 'Undertaking: No Other Scholarship Availed',
          mandatory: true,
          desc: 'Signed undertaking declaring student is not availing any other government scholarship or fee waiver simultaneously.',
          tip: 'Receiving two government scholarships is illegal and leads to clawback and debarment.'
        },
        {
          name: 'College Admission & Fee Structure',
          mandatory: true,
          desc: 'Proof of regular enrollment in recognized UG/PG degree course.',
          tip: 'Must be regular full-time mode (distance/correspondence courses are not eligible).'
        }
      ]
    }
  };

  // Stored user checklist in localStorage
  const STORAGE_KEY = 'scholarfinder_caste_checklist';
  function loadChecklist() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch { return {}; }
  }
  function saveChecklist(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  /* ───────────── Render Modal Content ───────────── */
  function renderCasteDocsModal(initialCategory = 'SC') {
    const modal = document.getElementById('casteDocsModal');
    if (!modal) return;

    let activeCategory = initialCategory;
    // Check if student profile already has a category
    const profile = window.ScholarFinderProfile?.loadProfile();
    if (profile && profile.category && CASTE_DOCUMENTS_DATA[profile.category]) {
      activeCategory = profile.category;
    }

    const checklistState = loadChecklist();

    function buildCategoryUI(catKey) {
      const cat = CASTE_DOCUMENTS_DATA[catKey];
      if (!cat) return '';

      const checkedItems = checklistState[catKey] || [];
      const totalDocs = cat.documents.length;
      const doneDocs = cat.documents.filter((d, i) => checkedItems.includes(i)).length;
      const progressPct = Math.round((doneDocs / totalDocs) * 100);

      return `
        <!-- Category Banner -->
        <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 mb-5">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
            <div class="flex items-center gap-2">
              <span class="px-2.5 py-1 rounded-full text-xs font-bold border ${cat.badge}">${cat.title}</span>
              <span class="text-xs text-slate-500">Document Guide</span>
            </div>
            <!-- Progress Pill -->
            <div class="flex items-center gap-2 text-xs font-semibold">
              <span class="text-slate-500">Your Checklist:</span>
              <span class="px-2 py-0.5 rounded-full ${progressPct === 100 ? 'bg-emerald-100 text-emerald-800' : 'bg-indigo-100 text-indigo-700'}">${doneDocs}/${totalDocs} Ready (${progressPct}%)</span>
            </div>
          </div>
          <p class="text-xs text-slate-600 mb-3">${cat.description}</p>

          <!-- Key Meta Boxes -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div class="p-2.5 rounded-xl bg-white border border-slate-200">
              <div class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Issuing Authority</div>
              <div class="font-medium text-slate-800 mt-0.5">${cat.authority}</div>
            </div>
            <div class="p-2.5 rounded-xl bg-white border border-slate-200">
              <div class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Validity Period</div>
              <div class="font-medium text-slate-800 mt-0.5">${cat.validity}</div>
            </div>
          </div>
        </div>

        <!-- Document Checklist Cards -->
        <div class="space-y-3">
          <div class="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
            <span>Required Documents Checklist</span>
            <span class="text-[11px] font-normal normal-case text-indigo-600">Tick items you already have ready</span>
          </div>

          ${cat.documents.map((doc, idx) => {
            const isChecked = checkedItems.includes(idx);
            return `
              <div class="doc-checklist-item p-3.5 rounded-xl border ${isChecked ? 'bg-emerald-50/50 border-emerald-200' : 'bg-white border-slate-200/90'} transition-all flex items-start gap-3">
                <input 
                  type="checkbox" 
                  class="doc-checkbox mt-1 w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer" 
                  data-cat="${catKey}" 
                  data-idx="${idx}" 
                  ${isChecked ? 'checked' : ''}
                >
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 flex-wrap mb-1">
                    <span class="text-xs font-bold ${isChecked ? 'text-emerald-900 line-through' : 'text-slate-900'}">${doc.name}</span>
                    ${doc.mandatory 
                      ? '<span class="px-1.5 py-0.2 rounded text-[10px] font-bold bg-red-100 text-red-700">Mandatory</span>' 
                      : '<span class="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-slate-100 text-slate-600">If Applicable</span>'}
                  </div>
                  <p class="text-xs text-slate-600 leading-relaxed mb-1.5">${doc.desc}</p>
                  <div class="flex items-center gap-1.5 text-[11px] text-amber-700 bg-amber-50/80 p-2 rounded-lg border border-amber-200/60">
                    <span>💡</span>
                    <span><strong>Pro-Tip:</strong> ${doc.tip}</span>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;
    }

    modal.querySelector('.modal-content').innerHTML = `
      <!-- Header -->
      <div class="px-6 py-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-start justify-between">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">Caste & Category Guide</span>
          </div>
          <h2 class="text-xl font-bold tracking-tight">Required Documents by Caste / Category</h2>
          <p class="text-xs text-indigo-200 mt-0.5">Select your reservation category to see exact certificates, authorities, and validity rules.</p>
        </div>
        <button id="closeCasteDocsModal" class="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <!-- Category Tabs -->
      <div class="px-6 pt-3 border-b border-slate-200 bg-white flex items-center gap-2 overflow-x-auto no-scrollbar">
        ${Object.keys(CASTE_DOCUMENTS_DATA).map(key => `
          <button 
            class="caste-tab-btn px-3.5 py-2 border-b-2 text-xs font-bold whitespace-nowrap transition-colors ${key === activeCategory ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'}"
            data-cat="${key}"
          >
            ${key} (${CASTE_DOCUMENTS_DATA[key].title.split(' ')[0]})
          </button>
        `).join('')}
      </div>

      <!-- Tab Body -->
      <div id="casteDocsBody" class="p-6 overflow-y-auto flex-1 max-h-[60vh]">
        ${buildCategoryUI(activeCategory)}
      </div>

      <!-- Footer -->
      <div class="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <div class="flex items-center gap-2">
          <span>⚠️</span>
          <span>Certificates must be in candidate's own name with verifiable QR/digital signature.</span>
        </div>
        <button id="closeCasteDocsBtn" class="px-4 py-2 bg-slate-900 hover:bg-indigo-600 text-white font-semibold rounded-xl transition-colors">
          Got It
        </button>
      </div>
    `;

    // Hook tab buttons
    modal.querySelectorAll('.caste-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        modal.querySelectorAll('.caste-tab-btn').forEach(b => {
          b.classList.remove('border-indigo-600', 'text-indigo-600');
          b.classList.add('border-transparent', 'text-slate-500');
        });
        btn.classList.add('border-indigo-600', 'text-indigo-600');
        btn.classList.remove('border-transparent', 'text-slate-500');

        activeCategory = btn.dataset.cat;
        modal.querySelector('#casteDocsBody').innerHTML = buildCategoryUI(activeCategory);
        attachChecklistListeners();
      });
    });

    // Checkbox interaction
    function attachChecklistListeners() {
      modal.querySelectorAll('.doc-checkbox').forEach(cb => {
        cb.addEventListener('change', () => {
          const cat = cb.dataset.cat;
          const idx = parseInt(cb.dataset.idx);
          if (!checklistState[cat]) checklistState[cat] = [];

          if (cb.checked) {
            if (!checklistState[cat].includes(idx)) checklistState[cat].push(idx);
          } else {
            checklistState[cat] = checklistState[cat].filter(i => i !== idx);
          }
          saveChecklist(checklistState);
          modal.querySelector('#casteDocsBody').innerHTML = buildCategoryUI(cat);
          attachChecklistListeners();
        });
      });
    }

    attachChecklistListeners();

    // Close buttons
    modal.querySelector('#closeCasteDocsModal').addEventListener('click', () => {
      modal.classList.add('modal-hidden');
      document.body.style.overflow = '';
    });
    modal.querySelector('#closeCasteDocsBtn').addEventListener('click', () => {
      modal.classList.add('modal-hidden');
      document.body.style.overflow = '';
    });
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.add('modal-hidden');
        document.body.style.overflow = '';
      }
    });

    modal.classList.remove('modal-hidden');
    document.body.style.overflow = 'hidden';
  }

  function initCasteDocuments() {
    const btn = document.getElementById('casteDocsBtn');
    if (btn) {
      btn.addEventListener('click', () => {
        renderCasteDocsModal();
      });
    }
    console.log('✅ Caste-Wise Document Checklist module initialized');
  }

  window.ScholarFinderCasteDocs = { renderCasteDocsModal, CASTE_DOCUMENTS_DATA };

  document.addEventListener('scholarfinder:ready', initCasteDocuments);
  if (window.ScholarFinder) initCasteDocuments();
})();
