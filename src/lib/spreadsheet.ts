export type SpreadsheetRow = {
  submittedAt: string;
  email: string;
  name: string;
  question: string;
  answer: string;
};

function csvEscape(value: string) {
  if (/[",\n]/.test(value)) return `"${value.replaceAll('"', '""')}"`;
  return value;
}

export function spreadsheetCsv(rows: SpreadsheetRow[]) {
  const header = ["Submitted at", "Email", "Name", "Question", "Answer"];
  const lines = [
    header.join(","),
    ...rows.map((row) =>
      [row.submittedAt, row.email, row.name, row.question, row.answer].map(csvEscape).join(","),
    ),
  ];
  return `${lines.join("\n")}\n`;
}

export async function appendSpreadsheetRow(row: SpreadsheetRow) {
  const webhook = process.env.GOOGLE_SHEETS_WEBHOOK_URL?.trim();
  if (!webhook) return;
  const response = await fetch(webhook, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(row),
  });
  if (!response.ok) {
    throw new Error(`Spreadsheet webhook failed (${response.status})`);
  }
}
