/**
 * ScholarFinder — PDF Report
 * Export recommended/filtered scholarships as a PDF document.
 * Uses jsPDF library loaded from CDN.
 */
(function () {
  'use strict';

  function generatePDF(SF) {
    const { jsPDF } = window.jspdf;
    if (!jsPDF) {
      alert('PDF library is loading. Please try again in a moment.');
      return;
    }

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    const usable = pageWidth - margin * 2;
    let y = margin;

    // Colors
    const indigo = [79, 70, 229];
    const slate900 = [15, 23, 42];
    const slate500 = [100, 116, 139];
    const emerald = [5, 150, 105];
    const white = [255, 255, 255];

    // Header
    doc.setFillColor(...indigo);
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setTextColor(...white);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('ScholarFinder India', margin, 18);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Personalized Scholarship Report', margin, 26);
    doc.setFontSize(8);
    doc.text(`Generated: ${new Date().toLocaleString('en-IN')}`, margin, 33);

    y = 50;

    // Profile info if available
    const profile = window.ScholarFinderProfile?.loadProfile();
    if (profile && profile.name) {
      doc.setFillColor(240, 240, 255);
      doc.roundedRect(margin, y, usable, 22, 3, 3, 'F');
      doc.setTextColor(...slate900);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(`Student: ${profile.name}`, margin + 5, y + 7);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      const details = [
        profile.educationLevel && `Level: ${profile.educationLevel}`,
        profile.state && `State: ${profile.state}`,
        profile.category && `Category: ${profile.category}`,
        profile.familyIncomeLakh && `Income: ₹${profile.familyIncomeLakh}L/yr`,
        profile.marksPct && `Marks: ${profile.marksPct}%`
      ].filter(Boolean).join(' · ');
      doc.text(details, margin + 5, y + 14);
      y += 28;
    }

    // Scholarships
    const scholarships = SF.state.filteredScholarships;
    doc.setTextColor(...slate900);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`Scholarships (${scholarships.length} results)`, margin, y);
    y += 8;

    // Divider
    doc.setDrawColor(200, 200, 220);
    doc.line(margin, y, pageWidth - margin, y);
    y += 5;

    scholarships.forEach((s, idx) => {
      // Check if need new page
      if (y > 260) {
        doc.addPage();
        y = margin;
      }

      const matchScore = profile ? window.ScholarFinderProfile?.calculateMatchScore(s, profile) : null;

      // Card background
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(margin, y, usable, 42, 2, 2, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(margin, y, usable, 42, 2, 2, 'S');

      // Index
      doc.setFillColor(...indigo);
      doc.circle(margin + 5, y + 5, 3, 'F');
      doc.setTextColor(...white);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      doc.text(`${idx + 1}`, margin + 5, y + 6.5, { align: 'center' });

      // Name
      doc.setTextColor(...slate900);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      const nameText = doc.splitTextToSize(s.name, usable - 50);
      doc.text(nameText, margin + 12, y + 7);

      // Match score badge
      if (matchScore !== null) {
        const badgeX = pageWidth - margin - 20;
        const badgeColor = matchScore >= 80 ? [5, 150, 105] : matchScore >= 50 ? [217, 119, 6] : [220, 38, 38];
        doc.setFillColor(...badgeColor);
        doc.roundedRect(badgeX, y + 2, 18, 7, 2, 2, 'F');
        doc.setTextColor(...white);
        doc.setFontSize(7);
        doc.text(`${matchScore}%`, badgeX + 9, y + 6.5, { align: 'center' });
      }

      // Details
      doc.setTextColor(...slate500);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      const provider = `Provider: ${s.provider || 'N/A'}`;
      doc.text(provider, margin + 12, y + 14);

      const level = `Level: ${(s.level || []).join(', ')}`;
      const states = `States: ${s.states?.includes('ALL') ? 'All India' : (s.states || []).join(', ')}`;
      doc.text(`${level} | ${states}`, margin + 12, y + 19);

      const amount = s.amount_text || (s.amount_per_year_inr ? `₹${s.amount_per_year_inr.toLocaleString('en-IN')}/yr` : 'As per norms');
      doc.setTextColor(...emerald);
      doc.setFont('helvetica', 'bold');
      doc.text(`Award: ${amount}`, margin + 12, y + 25);

      doc.setTextColor(...slate500);
      doc.setFont('helvetica', 'normal');
      const categories = `Category: ${s.categories?.includes('ALL') ? 'All' : (s.categories || []).join(', ')}`;
      const income = `Income Limit: ${s.max_income_lakh ? '₹' + s.max_income_lakh + 'L/yr' : 'No limit'}`;
      doc.text(`${categories} | ${income}`, margin + 12, y + 30);

      const deadline = s.deadline_2026_27 || 'Check portal';
      const status = s.status === 'open_verify_date' ? 'OPEN' : s.status === 'check_portal' ? 'CHECK PORTAL' : 'CLOSED';
      doc.text(`Deadline: ${deadline} | Status: ${status}`, margin + 12, y + 35);

      if (s.official_portal) {
        doc.setTextColor(79, 70, 229);
        doc.textWithLink(`Portal: ${s.official_portal}`, margin + 12, y + 40, { url: s.official_portal });
      }

      y += 47;
    });

    // Footer
    if (y > 270) { doc.addPage(); y = margin; }
    y += 5;
    doc.setDrawColor(200, 200, 220);
    doc.line(margin, y, pageWidth - margin, y);
    y += 5;
    doc.setTextColor(...slate500);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text('Disclaimer: Always verify dates and requirements on official portals before applying.', margin, y);
    doc.text('Generated by ScholarFinder India — scholarships.gov.in', margin, y + 4);

    // Save
    const fileName = `ScholarFinder_Report_${new Date().toISOString().slice(0, 10)}.pdf`;
    doc.save(fileName);
  }

  function initPDFExport() {
    const SF = window.ScholarFinder;
    if (!SF) return;

    const btn = document.getElementById('exportPdfBtn');
    if (!btn) return;

    btn.addEventListener('click', () => {
      // Check if jsPDF is loaded
      if (!window.jspdf) {
        btn.textContent = 'Loading...';
        btn.disabled = true;
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.2/jspdf.umd.min.js';
        script.onload = () => {
          btn.textContent = 'Export PDF';
          btn.disabled = false;
          generatePDF(SF);
        };
        script.onerror = () => {
          btn.textContent = 'Export PDF';
          btn.disabled = false;
          alert('Failed to load PDF library. Please check your internet connection.');
        };
        document.head.appendChild(script);
      } else {
        generatePDF(SF);
      }
    });

    console.log('✅ PDF Report module initialized');
  }

  document.addEventListener('scholarfinder:ready', initPDFExport);
  if (window.ScholarFinder) initPDFExport();
})();
