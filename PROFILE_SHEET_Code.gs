/**
 * CosmicJyoti Profile Sheet - Google Apps Script
 * 
 * SETUP:
 * 1. Go to https://script.google.com
 * 2. Create new project
 * 3. Replace Code.gs with this file
 * 4. Deploy → New deployment → Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 5. Copy the Web App URL
 * 6. Add to .env: VITE_PROFILE_SUBMIT_URL=<your-web-app-url>
 */

const SHEET_ID = '1XKEvEnFhrFD73BnXJK8FeuS8vCJ07h3gTxzMuutUAu4';
const MAX_ROWS = 1000;
const ADMIN_EMAIL = 'nikemaurya1996@gmail.com';

// Handle CORS preflight (OPTIONS) - required for cross-origin POST from browser
function doOptions() {
  return ContentService.createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT)
    .setHeaders({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400'
    });
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return ContentService.createTextOutput(JSON.stringify({ success: false, error: 'No POST body received' }))
        .setMimeType(ContentService.MimeType.JSON)
        .setHeaders({ 'Access-Control-Allow-Origin': '*' });
    }
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.openById(SHEET_ID);
    let sheet = ss.getSheets()[0];
    
    // Check row limit - create new sheet if needed
    if (sheet.getLastRow() >= MAX_ROWS) {
      const newSheet = ss.insertSheet('Profiles_' + new Date().toISOString().slice(0, 10));
      sheet = newSheet;
      const headers = ss.getSheets()[0].getRange(1, 1, 1, 13).getValues();
      newSheet.getRange(1, 1, 1, 13).setValues(headers);
    }
    
    // Add headers if empty
    if (sheet.getLastRow() === 0) {
      sheet.getRange(1, 1, 1, 13).setValues([[
        'Timestamp', 'Account Name', 'Account Email',
        'Self Name', 'Self DOB', 'Self TOB', 'Self Location', 'Self Gender',
        'Partner Name', 'Partner DOB', 'Partner TOB', 'Partner Location', 'Partner Gender'
      ]]);
    }
    
    const row = [
      data.timestamp || '',
      data.accountName || '',
      data.accountEmail || '',
      data.self?.name || '',
      data.self?.date || '',
      data.self?.time || '',
      data.self?.location || '',
      data.self?.gender || '',
      data.partner?.name || '',
      data.partner?.date || '',
      data.partner?.time || '',
      data.partner?.location || '',
      data.partner?.gender || ''
    ];
    
    sheet.appendRow(row);
    
    // Email admin on each submission
    try {
      MailApp.sendEmail(ADMIN_EMAIL, 'New Profile: ' + (data.self?.name || 'Unknown'),
        JSON.stringify(data, null, 2));
    } catch (mailErr) {
      console.warn('Email failed:', mailErr);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders({ 'Access-Control-Allow-Origin': '*' });
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders({ 'Access-Control-Allow-Origin': '*' });
  }
}
