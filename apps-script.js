// ─────────────────────────────────────────────────────────────────────────────
// Wurk — Google Apps Script
// Deploy as a Web App to receive form submissions from gettowurk.com
//
// SETUP STEPS:
//  1. Go to https://sheets.google.com and create a new spreadsheet
//     under gettowurk@gmail.com. Name it "Wurk Signups".
//  2. Copy the spreadsheet ID from its URL:
//       https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit
//  3. Paste that ID into SPREADSHEET_ID below.
//  4. Go to https://script.google.com → New project → paste this entire file.
//  5. Click Deploy → New deployment → Web app.
//       Execute as:  Me (gettowurk@gmail.com)
//       Who has access: Anyone
//  6. Click Deploy, authorize when prompted.
//  7. Copy the Web App URL (looks like https://script.google.com/macros/s/...)
//  8. Open index.html, find the line:
//       const SCRIPT_URL = 'YOUR_APPS_SCRIPT_URL_HERE';
//     and replace the placeholder with your URL.
//  9. Commit and push: git add index.html && git commit -m "Wire up Apps Script" && git push
//
// TESTING:
//  Visit your Web App URL directly in a browser — you should see:
//    "Wurk Apps Script is running."
//  Then submit a test form on the site and check the Workers or Homeowners sheet.
//
// RE-DEPLOYING AFTER CHANGES:
//  Deploy → Manage deployments → edit the existing deployment (don't create a new one).
//  The URL stays the same when you update an existing deployment.
// ─────────────────────────────────────────────────────────────────────────────

const SPREADSHEET_ID = '1fDvOV8emH-2h_438dFpg1aBblBmWkmBBAJLr8TJMOAs';

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

    if (data.formType === 'worker') {
      const sheet = getOrCreateSheet(ss, 'Workers', [
        'Timestamp', 'First Name', 'Last Initial', 'Age', 'Zip Code',
        'Phone', 'Parent Email', 'Jobs', 'Availability',
        'Transportation', 'Payment Method', 'Payment Username'
      ]);
      sheet.appendRow([
        new Date(),
        data.firstName        || '',
        data.lastInitial      || '',
        data.age              || '',
        data.zipCode          || '',
        data.phone            || '',
        data.parentEmail      || '',
        Array.isArray(data.jobs) ? data.jobs.join(', ') : (data.jobs || ''),
        data.availability     || '',
        data.transportation   || '',
        data.paymentMethod    || '',
        data.paymentUsername  || ''
      ]);

    } else if (data.formType === 'homeowner') {
      const sheet = getOrCreateSheet(ss, 'Homeowners', [
        'Timestamp', 'Full Name', 'Address', 'Job Type',
        'Preferred Date', 'Time Window', 'Estimated Quantity',
        'Notes', 'Phone', 'Payment Method'
      ]);
      sheet.appendRow([
        new Date(),
        data.fullName          || '',
        data.address           || '',
        data.jobType           || '',
        data.preferredDate     || '',
        data.timeWindow        || '',
        data.estimatedQuantity || '',
        data.notes             || '',
        data.phone             || '',
        data.paymentMethod     || ''
      ]);

    } else {
      throw new Error('Unknown formType: ' + data.formType);
    }

    return jsonResponse({ success: true });

  } catch (err) {
    return jsonResponse({ success: false, error: err.toString() });
  }
}

// Simple GET handler — visit the URL to confirm the script is live
function doGet() {
  return ContentService
    .createTextOutput('Wurk Apps Script is running.')
    .setMimeType(ContentService.MimeType.TEXT);
}

// Returns the named sheet, creating it with headers if it doesn't exist
function getOrCreateSheet(ss, name, headers) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
