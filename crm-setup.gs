/**
 * BORDMAN CRM — Google Apps Script
 *
 * HOW TO USE:
 * 1. Open a new Google Sheet at sheets.new
 * 2. Click Extensions → Apps Script
 * 3. Delete all existing code, paste this entire script
 * 4. Click Run → setupBordmanCRM
 * 5. Authorize when prompted
 * 6. Return to your sheet — all 4 tabs are built and pre-populated
 */

function setupBordmanCRM() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // Remove default Sheet1 after we're done
  const defaultSheet = ss.getSheetByName('Sheet1');

  buildProspectsTab(ss);
  buildClientsTab(ss);
  buildFollowUpTab(ss);
  buildDashboardTab(ss);

  if (defaultSheet) ss.deleteSheet(defaultSheet);

  ss.setActiveSheet(ss.getSheetByName('Prospects'));
  SpreadsheetApp.getUi().alert('✅ Bordman CRM is ready!');
}

// ─────────────────────────────────────────
// TAB 1: PROSPECTS
// ─────────────────────────────────────────
function buildProspectsTab(ss) {
  let sheet = ss.getSheetByName('Prospects');
  if (sheet) ss.deleteSheet(sheet);
  sheet = ss.insertSheet('Prospects', 0);

  const headers = [
    'School Name', 'Owner Name', 'Phone', 'Address',
    'Date of First Contact', 'Contact Method', 'Outcome',
    'Follow-Up Date', 'Follow-Up Type', 'Follow-Up Notes',
    'Status', 'Next Action'
  ];

  // Header row
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setValues([headers]);
  headerRange.setBackground('#1B3A5C');
  headerRange.setFontColor('#FFFFFF');
  headerRange.setFontWeight('bold');
  headerRange.setFontSize(11);

  sheet.setFrozenRows(1);

  // Column widths
  sheet.setColumnWidth(1, 200);  // School Name
  sheet.setColumnWidth(2, 140);  // Owner Name
  sheet.setColumnWidth(3, 130);  // Phone
  sheet.setColumnWidth(4, 200);  // Address
  sheet.setColumnWidth(5, 140);  // Date of First Contact
  sheet.setColumnWidth(6, 130);  // Contact Method
  sheet.setColumnWidth(7, 180);  // Outcome
  sheet.setColumnWidth(8, 130);  // Follow-Up Date
  sheet.setColumnWidth(9, 130);  // Follow-Up Type
  sheet.setColumnWidth(10, 220); // Follow-Up Notes
  sheet.setColumnWidth(11, 120); // Status
  sheet.setColumnWidth(12, 200); // Next Action

  // Prospect data
  const today = new Date();
  const prospects = [
    ['Sonaar Driving School', 'Andrew', '(586) 864-3111', 'Metro Detroit',
     formatDate(today), 'Walk-in / Phone',
     'Answered — solo op, booked through May, answered after 2 rings',
     formatDate(addDays(today, 7)), 'Walk-in demo', 'Show up in person, call demo number live',
     'Hot', 'Walk-in demo — highest priority'],
    ['Mansib Driving School', '', '', 'Metro Detroit',
     formatDate(today), 'Phone', 'Voicemail — runs two businesses simultaneously',
     formatDate(addDays(today, 3)), 'Call', 'Try calling again, mention missed call problem',
     'Contacted', 'Follow-up call — attempt 2'],
    ['Grace & Mercy', '', '', 'Metro Detroit',
     formatDate(today), 'Phone', 'Full voicemail — mailbox was full',
     formatDate(addDays(today, 3)), 'Walk-in', 'Mailbox full = proof they need this',
     'Contacted', 'Walk-in or try personal number'],
    ['Marbro Driving School', '', '', 'Metro Detroit',
     formatDate(today), 'Phone', 'Generic Google Voice — straight to voicemail',
     formatDate(addDays(today, 3)), 'Call', 'Try again, mention Google Voice = lost leads',
     'Contacted', 'Follow-up call — attempt 2'],
    ['Alert Driving School', '', '', 'Metro Detroit',
     formatDate(today), 'Phone', '5 rings — generic cell voicemail',
     formatDate(addDays(today, 3)), 'Call', 'Second attempt — emphasize missed enrollments',
     'Contacted', 'Follow-up call — attempt 2'],
    ['T14-8 Driver Training', 'Alexis Thompson', '', 'Metro Detroit',
     formatDate(today), 'Phone', '6 rings — professional voicemail',
     formatDate(addDays(today, 3)), 'Call', 'Has professional VM — may be open to upgrade',
     'Contacted', 'Follow-up call — attempt 2'],
    ['First Class Driving School Southfield', '', '', 'Southfield, MI',
     formatDate(today), 'Phone', 'Straight to voicemail — serves teens confirmed',
     formatDate(addDays(today, 3)), 'Walk-in', 'Teen market = high volume parent calls',
     'Contacted', 'Walk-in demo'],
    ['Bronze Cruising', 'Angela Stotts-McClary', '(313) 659-5440', 'Metro Detroit',
     '', '', 'Guarded — better in person. Save until after first testimonial.',
     formatDate(addDays(today, 45)), 'Walk-in', 'Bring testimonial from first client',
     'Dormant', 'Wait for first testimonial — then walk-in'],
  ];

  if (prospects.length > 0) {
    sheet.getRange(2, 1, prospects.length, headers.length).setValues(prospects);
  }

  // Status dropdown validation
  const statusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['Hot', 'Contacted', 'Demo Scheduled', 'Proposal Sent', 'Won', 'Dormant', 'Dead'])
    .build();
  sheet.getRange(2, 11, 100, 1).setDataValidation(statusRule);

  // Contact method dropdown
  const methodRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['Phone', 'Walk-in', 'Email', 'Walk-in / Phone', 'Referral'])
    .build();
  sheet.getRange(2, 6, 100, 1).setDataValidation(methodRule);

  // Conditional formatting for status
  applyStatusFormatting(sheet, 11, prospects.length + 100);

  // Alternating row colors
  for (let i = 2; i <= prospects.length + 1; i++) {
    if (i % 2 === 0) {
      sheet.getRange(i, 1, 1, headers.length).setBackground('#F7F5F0');
    }
  }

  sheet.setTabColor('#1B3A5C');
}

// ─────────────────────────────────────────
// TAB 2: CLIENTS
// ─────────────────────────────────────────
function buildClientsTab(ss) {
  let sheet = ss.getSheetByName('Clients');
  if (sheet) ss.deleteSheet(sheet);
  sheet = ss.insertSheet('Clients', 1);

  const headers = [
    'School Name', 'Owner Name', 'Phone', 'Start Date',
    'Monthly Rate', 'Setup Fee Collected', 'Agent Live Date', 'Weeks Active',
    'Testimonial Requested', 'Testimonial Received',
    'Google Review Received', 'Referral Asked', 'Referral Received', 'Notes'
  ];

  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setValues([headers]);
  headerRange.setBackground('#1B3A5C');
  headerRange.setFontColor('#FFFFFF');
  headerRange.setFontWeight('bold');
  headerRange.setFontSize(11);

  sheet.setFrozenRows(1);

  // Column widths
  sheet.setColumnWidth(1, 200);
  sheet.setColumnWidth(2, 140);
  sheet.setColumnWidth(3, 130);
  sheet.setColumnWidth(4, 120);
  sheet.setColumnWidth(5, 120);
  sheet.setColumnWidth(6, 150);
  sheet.setColumnWidth(7, 130);
  sheet.setColumnWidth(8, 110);
  sheet.setColumnWidth(9, 160);
  sheet.setColumnWidth(10, 160);
  sheet.setColumnWidth(11, 160);
  sheet.setColumnWidth(12, 130);
  sheet.setColumnWidth(13, 140);
  sheet.setColumnWidth(14, 220);

  // Weeks Active formula for row 2 as example (auto-calc from Start Date)
  // Will be populated when clients are added

  // Yes/No dropdowns for boolean columns (9-13)
  const yesNoRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['Yes', 'No', 'Pending'])
    .build();
  sheet.getRange(2, 9, 100, 5).setDataValidation(yesNoRule);

  // Currency format for monthly rate and setup fee
  sheet.getRange(2, 5, 100, 1).setNumberFormat('$#,##0.00');
  sheet.getRange(2, 6, 100, 1).setNumberFormat('$#,##0.00');

  // Weeks Active auto-formula placeholder (in col 8, calculated from col 4)
  // Add formula hint in row 2
  sheet.getRange(1, 8).setNote('Formula: =IF(D2="","",INT((TODAY()-D2)/7)) — paste in each row');

  sheet.setTabColor('#2E7D32');
}

// ─────────────────────────────────────────
// TAB 3: FOLLOW-UP QUEUE
// ─────────────────────────────────────────
function buildFollowUpTab(ss) {
  let sheet = ss.getSheetByName('Follow-Up Queue');
  if (sheet) ss.deleteSheet(sheet);
  sheet = ss.insertSheet('Follow-Up Queue', 2);

  const headers = [
    'Due Date', 'School Name', 'Owner Name', 'Phone',
    'Type', 'Action', 'Source', 'Status'
  ];

  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setValues([headers]);
  headerRange.setBackground('#7B3F00');
  headerRange.setFontColor('#FFFFFF');
  headerRange.setFontWeight('bold');
  headerRange.setFontSize(11);

  sheet.setFrozenRows(1);

  sheet.setColumnWidth(1, 120);
  sheet.setColumnWidth(2, 200);
  sheet.setColumnWidth(3, 140);
  sheet.setColumnWidth(4, 130);
  sheet.setColumnWidth(5, 130);
  sheet.setColumnWidth(6, 240);
  sheet.setColumnWidth(7, 110);
  sheet.setColumnWidth(8, 110);

  // Pull from Prospects — items where Follow-Up Date <= today+7 and status not Won/Dormant/Dead
  // This is a QUERY formula that auto-updates
  const queryFormula = `=IFERROR(SORT(QUERY(Prospects!A2:L1000,
    "SELECT H, A, B, C, I, J, 'Prospects', K
     WHERE H IS NOT NULL
     AND K <> 'Won'
     AND K <> 'Dead'
     ORDER BY H ASC
     LABEL H 'Due Date', A 'School Name', B 'Owner Name', C 'Phone', I 'Type', J 'Action', 'Prospects' 'Source', K 'Status'",0),1,TRUE),"No follow-ups due")`;

  sheet.getRange(2, 1).setFormula(queryFormula);

  // Today highlight rule
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayRule = SpreadsheetApp.newConditionalFormatRule()
    .whenDateEqualTo(SpreadsheetApp.RelativeDate.TODAY)
    .setBackground('#FFF9C4')
    .setRanges([sheet.getRange('A2:H200')])
    .build();

  const pastDueRule = SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied('=AND($A2<TODAY(),$A2<>"")')
    .setBackground('#FFEBEE')
    .setFontColor('#C62828')
    .setRanges([sheet.getRange('A2:H200')])
    .build();

  sheet.setConditionalFormatRules([pastDueRule, todayRule]);
  sheet.setTabColor('#E65100');
}

// ─────────────────────────────────────────
// TAB 4: DASHBOARD
// ─────────────────────────────────────────
function buildDashboardTab(ss) {
  let sheet = ss.getSheetByName('Dashboard');
  if (sheet) ss.deleteSheet(sheet);
  sheet = ss.insertSheet('Dashboard', 3);

  sheet.setColumnWidth(1, 220);
  sheet.setColumnWidth(2, 160);
  sheet.setColumnWidth(3, 300);

  // Title
  sheet.getRange('A1:C1').merge();
  sheet.getRange('A1').setValue('BORDMAN — CRM DASHBOARD');
  sheet.getRange('A1').setFontSize(18).setFontWeight('bold').setFontColor('#1B3A5C');
  sheet.getRange('A1').setHorizontalAlignment('center');

  sheet.getRange('A2:C2').merge();
  sheet.getRange('A2').setValue('Updated automatically · Last refreshed: =TEXT(NOW(),"MMM D, YYYY h:mm AM/PM")');
  sheet.getRange('A2').setFontSize(10).setFontColor('#9A9080').setHorizontalAlignment('center');

  const metrics = [
    ['', '', ''],
    ['PIPELINE', '', ''],
    ['Total Prospects', '=COUNTA(Prospects!A2:A1000)', ''],
    ['Hot Prospects', '=COUNTIF(Prospects!K2:K1000,"Hot")', ''],
    ['Active Conversations', '=COUNTIF(Prospects!K2:K1000,"Contacted")', ''],
    ['Demos Scheduled', '=COUNTIF(Prospects!K2:K1000,"Demo Scheduled")', ''],
    ['Proposals Sent', '=COUNTIF(Prospects!K2:K1000,"Proposal Sent")', ''],
    ['', '', ''],
    ['REVENUE', '', ''],
    ['Total Clients', '=COUNTA(Clients!A2:A1000)', ''],
    ['MRR', '=IFERROR(SUM(Clients!E2:E1000),0)', '=TEXT(B12,"$#,##0")&"/month"'],
    ['ARR (projected)', '=IFERROR(SUM(Clients!E2:E1000)*12,0)', '=TEXT(B13,"$#,##0")&"/year"'],
    ['Setup Fees Collected', '=IFERROR(SUM(Clients!F2:F1000),0)', '=TEXT(B14,"$#,##0")'],
    ['Target MRR (51 clients)', '=51*197', '=TEXT(B15,"$#,##0")&"/month"'],
    ['% to Target', '=IFERROR(SUM(Clients!E2:E1000)/(51*197),0)', '=TEXT(B16,"0%")&" of $10,047/month"'],
    ['', '', ''],
    ['CLOSE RATE', '', ''],
    ['Total Contacted', '=COUNTA(Prospects!A2:A1000)', ''],
    ['Won', '=COUNTIF(Prospects!K2:K1000,"Won")', ''],
    ['Close Rate', '=IFERROR(COUNTIF(Prospects!K2:K1000,"Won")/COUNTA(Prospects!A2:A1000),0)', '=TEXT(B20,"0.0%")'],
    ['', '', ''],
    ['SOCIAL PROOF', '', ''],
    ['Testimonials Received', '=COUNTIF(Clients!J2:J1000,"Yes")', ''],
    ['Google Reviews', '=COUNTIF(Clients!K2:K1000,"Yes")', ''],
    ['Referrals Received', '=COUNTIF(Clients!M2:M1000,"Yes")', ''],
    ['', '', ''],
    ['FOLLOW-UPS DUE', '', ''],
    ['Due Today', '=COUNTIF(Prospects!H2:H1000,TODAY())', ''],
    ['Overdue', '=SUMPRODUCT((Prospects!H2:H1000<TODAY())*(Prospects!H2:H1000<>"")*(Prospects!K2:K1000<>"Won")*(Prospects!K2:K1000<>"Dead"))', ''],
    ['Due This Week', '=SUMPRODUCT((Prospects!H2:H1000>=TODAY())*(Prospects!H2:H1000<=TODAY()+7)*(Prospects!H2:H1000<>""))', ''],
  ];

  sheet.getRange(3, 1, metrics.length, 3).setValues(metrics);

  // Section headers styling
  const sectionRows = [4, 9, 17, 22, 26]; // 1-indexed in the metrics array context
  // Actual sheet rows (metrics start at row 3, so add 2)
  const sheetSectionRows = sectionRows.map(r => r + 2);
  sheetSectionRows.forEach(r => {
    sheet.getRange(r, 1, 1, 3).setBackground('#1B3A5C').setFontColor('#FFFFFF').setFontWeight('bold');
  });

  // Value column formatting
  sheet.getRange('B12:B15').setNumberFormat('$#,##0.00');
  sheet.getRange('B16').setNumberFormat('0.0%');
  sheet.getRange('B20').setNumberFormat('0.0%');

  // Alternating rows for data rows
  for (let i = 5; i <= 30; i++) {
    const cell = sheet.getRange(i, 1);
    const val = cell.getValue();
    if (val && !sheetSectionRows.includes(i)) {
      if (i % 2 === 0) sheet.getRange(i, 1, 1, 3).setBackground('#F7F5F0');
    }
  }

  // Bold labels
  sheet.getRange('A1:A30').setFontWeight('bold');
  sheet.getRange('B1:B30').setHorizontalAlignment('right');

  sheet.setTabColor('#1B3A5C');
}

// ─────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────
function formatDate(date) {
  return Utilities.formatDate(date, Session.getScriptTimeZone(), 'MM/dd/yyyy');
}

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function applyStatusFormatting(sheet, col, numRows) {
  const range = sheet.getRange(2, col, numRows, 1);
  const rules = [
    { value: 'Hot',              bg: '#E8F5E9', fg: '#1B5E20' },
    { value: 'Won',              bg: '#C8E6C9', fg: '#1B5E20' },
    { value: 'Contacted',        bg: '#E3F2FD', fg: '#0D47A1' },
    { value: 'Demo Scheduled',   bg: '#FFF8E1', fg: '#E65100' },
    { value: 'Proposal Sent',    bg: '#F3E5F5', fg: '#4A148C' },
    { value: 'Dormant',          bg: '#F5F5F5', fg: '#757575' },
    { value: 'Dead',             bg: '#FFEBEE', fg: '#B71C1C' },
  ];

  const cfRules = rules.map(r =>
    SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo(r.value)
      .setBackground(r.bg)
      .setFontColor(r.fg)
      .setRanges([range])
      .build()
  );
  sheet.setConditionalFormatRules(cfRules);
}
