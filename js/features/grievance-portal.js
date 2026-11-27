/**
 * ScholarFinder — Official Complaint Links & Grievance Redressal Directory
 * Comprehensive escalation paths, central CPGRAMS links, state portal helplines,
 * and copy-paste formal complaint email templates.
 */
(function () {
  'use strict';

  const CENTRAL_GRIEVANCE_BODIES = [
    {
      name: 'CPGRAMS (Central Government Public Grievance Portal)',
      authority: 'Department of Administrative Reforms and Public Grievances (DARPG)',
      desc: 'The single highest escalation portal for all Central Government scholarships. Ministries are bound by law to resolve or report on grievances registered here within 30 days.',
      portal: 'https://pgportal.gov.in',
      helpline: 'Toll-free / Citizen Portal',
      email: 'pgportal-darp@nic.in',
      recommendedFor: 'When NSP or ministry helpdesks do not respond within 15 days.'
    },
    {
      name: 'National Scholarship Portal (NSP) Central Helpdesk',
      authority: 'National Informatics Centre (NIC) & Ministry of Electronics and IT',
      desc: 'Official technical and operational helpdesk for all central sector scholarships (CSSS, Pragati, Saksham, Pre/Post-Matric, Minorities).',
      portal: 'https://scholarships.gov.in',
      helpline: '0120 - 6619540',
      email: 'helpdesk@nsp.gov.in',
      recommendedFor: 'OTR login issues, application submission errors, duplicate records.'
    },
    {
      name: 'UGC e-Samadhan (Higher Education Grievance Redressal)',
      authority: 'University Grants Commission (UGC)',
      desc: 'Dedicated ombudsman portal for college and university scholarship delays, JRF/SRF disbursement, and college administration harassment.',
      portal: 'https://samadhan.ugc.ac.in',
      helpline: '1800 - 111 - 656',
      email: 'contact.ugc@nic.in',
      recommendedFor: 'College refusing to verify application or demanding fee while on scholarship.'
    },
    {
      name: 'AICTE Central Grievance Redressal Cell',
      authority: 'All India Council for Technical Education (AICTE)',
      desc: 'Official grievance channel for Pragati, Saksham, Swanath, and PMSSS (J&K) technical scholarship students.',
      portal: 'https://www.aicte-india.org/feedback',
      helpline: '011 - 29581000',
      email: 'pragatisaksham@aicte-india.org',
      recommendedFor: 'Technical diploma and engineering student DBT release issues.'
    },
    {
      name: 'Ministry of Social Justice and Empowerment (MSJE) DBT Cell',
      authority: 'Department of Social Justice and Empowerment',
      desc: 'Direct monitoring cell for SC and OBC Post-Matric scholarships, PM-YASASVI, and Top Class Education.',
      portal: 'https://socialjustice.gov.in',
      helpline: '1800 - 11 - 0031',
      email: 'dbt-msje@gov.in',
      recommendedFor: 'SC/OBC scholarship pending disbursals and state fund transfer delays.'
    },
    {
      name: 'Ministry of Tribal Affairs (MoTA) Scholarship Cell',
      authority: 'Ministry of Tribal Affairs',
      desc: 'Grievance cell for Post-Matric ST, National Overseas ST, and Top Class tribal scholarship schemes.',
      portal: 'https://tribal.nic.in',
      helpline: '011 - 23386176',
      email: 'scholarship-mota@nic.in',
      recommendedFor: 'ST scholarship queries and PFMS payment failures.'
    }
  ];

  const STATE_GRIEVANCE_PORTALS = [
    { state: 'Uttar Pradesh', portalName: 'Jansunwai Samadhan Portal (CM Helpline)', url: 'https://jansunwai.up.nic.in', tollFree: '1076' },
    { state: 'Maharashtra', portalName: 'Aaple Sarkar Grievance Redressal Portal', url: 'https://aaplesarkar.mahaonline.gov.in', tollFree: '1800-120-8040' },
    { state: 'Karnataka', portalName: 'Jana Spandana Citizen Grievance / SSP Helpdesk', url: 'https://ssp.postmatric.karnataka.gov.in', tollFree: '1902' },
    { state: 'Bihar', portalName: 'Bihar Lok Shikayat Nivaran (Public Grievance)', url: 'https://lokshikayat.bihar.gov.in', tollFree: '1800-345-6284' },
    { state: 'Rajasthan', portalName: 'Rajasthan Sampark Portal (181 CM Helpline)', url: 'https://sampark.rajasthan.gov.in', tollFree: '181' },
    { state: 'Gujarat', portalName: 'SWAGAT Online Public Grievance System', url: 'https://swagat.gujarat.gov.in', tollFree: '1800-233-5500' },
    { state: 'West Bengal', portalName: 'West Bengal Grievance Redressal & CM Helpline', url: 'https://wbschemes.wb.gov.in', tollFree: '1800-120-2130' },
    { state: 'Tamil Nadu', portalName: 'Tamil Nadu CM Helpline (Mudalvarin Mugavari)', url: 'https://cmhelpline.tnega.org', tollFree: '1100' },
    { state: 'Andhra Pradesh', portalName: 'Spandana Citizen Grievance Portal', url: 'https://spandana.ap.gov.in', tollFree: '1902' },
    { state: 'Telangana', portalName: 'Telangana Prajavani / ePASS Grievance Redressal', url: 'https://telanganaepass.cgg.gov.in', tollFree: '040-23390228' },
    { state: 'Delhi', portalName: 'Delhi e-District Grievance & PGMS Portal', url: 'https://pgms.delhi.gov.in', tollFree: '1031' },
    { state: 'Punjab', portalName: 'Punjab Grievance Redressal (Connect Punjab)', url: 'https://connect.punjab.gov.in', tollFree: '1100' },
    { state: 'Haryana', portalName: 'CM Window Haryana Citizen Grievances', url: 'https://cmharyanacell.nic.in', tollFree: '1800-180-2022' },
    { state: 'Madhya Pradesh', portalName: 'MP CM Helpline 181 Grievance Portal', url: 'http://cmhelpline.mp.gov.in', tollFree: '181' },
    { state: 'Kerala', portalName: 'CMDRF & Kerala State Public Grievance Portal', url: 'https://cmo.kerala.gov.in', tollFree: '1076' },
    { state: 'Odisha', portalName: 'Jana Sunani (Citizen Portal Odisha)', url: 'https://janasunani.odisha.gov.in', tollFree: '1905' }
  ];

  const EMAIL_TEMPLATES = [
    {
      title: 'Template 1: Scholarship Approved on Portal but Amount Not Credited (PFMS / Bank Failure)',
      subject: 'Urgent Grievance: Scholarship Amount Not Credited (Application ID: [YOUR_APPLICATION_ID])',
      body: `To,\nThe Nodal Officer / PFMS Helpdesk,\nScholarship Sanctioning Authority\n\nRespected Sir/Madam,\n\nSubject: Non-disbursement of scholarship funds for Academic Year 2026-27.\n\nI am writing to bring to your attention that my scholarship application has been officially APPROVED on the portal, but the funds have not yet been credited to my bank account.\n\nMy Details:\n• Name: [Your Full Name]\n• Application ID / OTR ID: [Your Application ID]\n• Scholarship Scheme: [Name of Scholarship]\n• Bank Name: [Your Bank Name]\n• Account Number: [Your Account Number]\n• IFSC Code: [Your Bank IFSC]\n• Aadhaar NPCI Seeding Status: Active\n\nAs per portal records, the status shows "Sanctioned / Payment in Process", but no transaction has occurred in my bank. I request you to kindly check the PFMS transaction batch status and re-initiate the payment credit at the earliest.\n\nThanking you,\nYours sincerely,\n[Your Name]\n[Your Mobile Number]\n[Your Email Address]`
    },
    {
      title: 'Template 2: College / Institute Nodal Officer Delaying or Refusing Bonafide Verification',
      subject: 'Grievance: Delay in Institutional Verification of Scholarship Application (ID: [APPLICATION_ID])',
      body: `To,\nThe Principal / Head of Institution,\n[Name of Your College / Institute],\n\nCC: The District Welfare Officer / State Nodal Officer,\n\nRespected Sir/Madam,\n\nSubject: Request for expedited institutional verification of scholarship application before portal deadline.\n\nI am a bonafide student of your institution studying in [Course Name & Year], Roll No: [Your College Roll Number]. I have successfully submitted my online scholarship application under [Scheme Name] on the official portal with Application ID: [Your Application ID].\n\nI have already submitted all required physical documents (marksheet, fee receipt, caste and income certificates) to the college scholarship desk on [Date of Submission].\n\nThe deadline for Institute Verification on the portal is approaching on [Deadline Date]. If the verification is not completed in time, my application will lapse automatically through no fault of mine.\n\nI earnestly request you to kindly verify and approve my application on the institutional portal without further delay.\n\nThanking you,\nYours obediently,\n[Your Name]\n[Course & Year]\n[Student Contact Number]`
    }
  ];

  function openGrievanceModal() {
    const modal = document.getElementById('grievanceModal');
    if (!modal) return;

    const SF = window.ScholarFinder;

    modal.querySelector('.modal-content').innerHTML = `
      <!-- Header -->
      <div class="px-6 py-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-start justify-between">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">Official Redressal</span>
          </div>
          <h2 class="text-xl font-bold tracking-tight">Scholarship Grievance & Complaint Directory</h2>
          <p class="text-xs text-indigo-200 mt-0.5">Direct contact links for CPGRAMS, Central Ministries, State CM Helplines, and ready email templates.</p>
        </div>
        <button id="closeGrievanceModal" class="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <!-- Tabs -->
      <div class="px-6 pt-3 border-b border-slate-200 bg-white flex items-center gap-3 overflow-x-auto no-scrollbar">
        <button id="tabCentralGrievance" class="px-3 py-2 border-b-2 border-indigo-600 text-indigo-600 text-xs font-bold whitespace-nowrap transition-colors">
          Central Escalation & CPGRAMS
        </button>
        <button id="tabStateGrievance" class="px-3 py-2 border-b-2 border-transparent text-slate-500 hover:text-slate-800 text-xs font-bold whitespace-nowrap transition-colors">
          State CM Helplines (All States)
        </button>
        <button id="tabEmailTemplates" class="px-3 py-2 border-b-2 border-transparent text-slate-500 hover:text-slate-800 text-xs font-bold whitespace-nowrap transition-colors">
          Complaint Email Templates
        </button>
      </div>

      <!-- Tab Content 1: Central Portals -->
      <div id="centralGrievanceContent" class="p-6 overflow-y-auto max-h-[60vh] space-y-3.5 text-xs">
        <div class="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 leading-relaxed">
          <strong>⚡ Escalation Rule of Thumb:</strong> First call the official NSP helpline (0120-6619540). If your issue remains unresolved after 7 days, lodge an official grievance on <strong>CPGRAMS (pgportal.gov.in)</strong> naming the concerned ministry. CPGRAMS grievances are monitored by the Prime Minister's Office (PMO).
        </div>

        <div class="space-y-3">
          ${CENTRAL_GRIEVANCE_BODIES.map(c => `
            <div class="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-2">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 class="font-bold text-sm text-slate-900">${c.name}</h4>
                  <div class="text-[11px] text-slate-500">${c.authority}</div>
                </div>
                <a 
                  href="${c.portal}" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  class="shrink-0 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs inline-flex items-center gap-1 shadow-2xs transition-colors self-start sm:self-auto"
                >
                  <span>Lodge Complaint</span>
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                </a>
              </div>
              <p class="text-slate-600 leading-relaxed">${c.desc}</p>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <div><strong>Helpline:</strong> <span class="text-indigo-600 font-semibold">${c.helpline}</span></div>
                <div><strong>Email:</strong> <span class="text-indigo-600 font-semibold">${c.email}</span></div>
              </div>
              <div class="text-[11px] text-slate-500">
                <strong>Best For:</strong> ${c.recommendedFor}
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Tab Content 2: State CM Helplines -->
      <div id="stateGrievanceContent" class="hidden p-6 overflow-y-auto max-h-[60vh] space-y-3 text-xs">
        <div class="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 mb-2">
          Find official CM Grievance Helplines and online complaint portals for state-funded and state-administered post-matric scholarships.
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          ${STATE_GRIEVANCE_PORTALS.map(s => `
            <div class="p-3 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-2">
              <div class="flex items-center justify-between">
                <span class="font-bold text-slate-900">${s.state}</span>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700">Toll-Free: ${s.tollFree}</span>
              </div>
              <div class="text-slate-600 text-[11px]">${s.portalName}</div>
              <a 
                href="${s.url}" 
                target="_blank" 
                rel="noopener noreferrer" 
                class="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800"
              >
                <span>Open Grievance Portal</span>
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
              </a>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Tab Content 3: Email Templates -->
      <div id="emailTemplatesContent" class="hidden p-6 overflow-y-auto max-h-[60vh] space-y-4 text-xs">
        <p class="text-slate-600">Copy these formal complaint formats and send them from your registered student email address.</p>

        ${EMAIL_TEMPLATES.map((tmpl, idx) => `
          <div class="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-3">
            <div class="flex items-center justify-between gap-2">
              <h4 class="font-bold text-slate-900 text-sm">${tmpl.title}</h4>
              <button 
                class="copy-template-btn px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-colors"
                data-idx="${idx}"
              >
                Copy Format
              </button>
            </div>
            <div>
              <div class="text-[11px] font-bold text-slate-500 uppercase mb-1">Subject:</div>
              <div class="p-2 rounded-lg bg-slate-50 border border-slate-200 font-mono text-[11px] text-slate-800">${tmpl.subject}</div>
            </div>
            <div>
              <div class="text-[11px] font-bold text-slate-500 uppercase mb-1">Letter Body:</div>
              <pre class="p-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 text-[11px] font-sans whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">${tmpl.body}</pre>
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Footer -->
      <div class="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
        <span>Always keep a record of your complaint registration number for follow-up.</span>
        <button id="dismissGrievanceBtn" class="px-4 py-2 bg-slate-900 hover:bg-indigo-600 text-white font-semibold rounded-xl transition-colors">
          Close
        </button>
      </div>
    `;

    // Hook tabs
    const tabCentral = modal.querySelector('#tabCentralGrievance');
    const tabState = modal.querySelector('#tabStateGrievance');
    const tabEmail = modal.querySelector('#tabEmailTemplates');
    const contentCentral = modal.querySelector('#centralGrievanceContent');
    const contentState = modal.querySelector('#stateGrievanceContent');
    const contentEmail = modal.querySelector('#emailTemplatesContent');

    function selectTab(activeTab, activeContent) {
      [tabCentral, tabState, tabEmail].forEach(t => {
        t.classList.remove('border-indigo-600', 'text-indigo-600');
        t.classList.add('border-transparent', 'text-slate-500');
      });
      activeTab.classList.add('border-indigo-600', 'text-indigo-600');
      activeTab.classList.remove('border-transparent', 'text-slate-500');

      [contentCentral, contentState, contentEmail].forEach(c => c.classList.add('hidden'));
      activeContent.classList.remove('hidden');
    }

    tabCentral.addEventListener('click', () => selectTab(tabCentral, contentCentral));
    tabState.addEventListener('click', () => selectTab(tabState, contentState));
    tabEmail.addEventListener('click', () => selectTab(tabEmail, contentEmail));

    // Copy template button
    modal.querySelectorAll('.copy-template-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.idx);
        const tmpl = EMAIL_TEMPLATES[idx];
        const fullText = `Subject: ${tmpl.subject}\n\n${tmpl.body}`;
        navigator.clipboard.writeText(fullText).then(() => {
          btn.textContent = 'Copied! ✓';
          btn.classList.add('bg-emerald-100', 'text-emerald-800');
          setTimeout(() => {
            btn.textContent = 'Copy Format';
            btn.classList.remove('bg-emerald-100', 'text-emerald-800');
          }, 2000);
        });
      });
    });

    // Close handlers
    modal.querySelector('#closeGrievanceModal').addEventListener('click', () => {
      modal.classList.add('modal-hidden');
      document.body.style.overflow = '';
    });
    modal.querySelector('#dismissGrievanceBtn').addEventListener('click', () => {
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

  function initGrievancePortal() {
    const btn = document.getElementById('grievancePortalBtn');
    if (btn) {
      btn.addEventListener('click', openGrievanceModal);
    }
    console.log('✅ Complaint Links & Grievance Directory initialized');
  }

  window.ScholarFinderGrievance = { openGrievanceModal, CENTRAL_GRIEVANCE_BODIES, STATE_GRIEVANCE_PORTALS };

  document.addEventListener('scholarfinder:ready', initGrievancePortal);
  if (window.ScholarFinder) initGrievancePortal();
})();
