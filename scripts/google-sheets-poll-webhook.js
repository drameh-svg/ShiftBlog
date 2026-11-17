/**
 * Google Apps Script for SHIFT poll answers.
 * 1. Create a Google Sheet.
 * 2. Extensions → Apps Script, paste this file.
 * 3. Deploy → New deployment → Web app (Execute as: Me, Who has access: Anyone).
 * 4. Put the web app URL in GOOGLE_SHEETS_WEBHOOK_URL.
 */
function doPost(event) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  const data = JSON.parse(event.postData.contents);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["Submitted at", "Email", "Name", "Question", "Answer"]);
  }
  sheet.appendRow([data.submittedAt, data.email, data.name, data.question, data.answer]);
  return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(
    ContentService.MimeType.JSON,
  );
}
