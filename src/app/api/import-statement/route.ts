import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type ParsedTx = {
  date: string;
  description: string;
  debit: number | null;
  credit: number | null;
  balance: number | null;
};

function parseBKTDate(dateStr: string): string | null {
  const months: Record<string, string> = {
    JAN: "01", FEB: "02", MAR: "03", APR: "04", MAY: "05", JUN: "06",
    JUL: "07", AUG: "08", SEP: "09", OCT: "10", NOV: "11", DEC: "12",
  };
  const match = dateStr.match(/(\d{2})-([A-Z]{3})-(\d{2})/);
  if (!match) return null;
  const [, day, mon, year] = match;
  const monthNum = months[mon];
  if (!monthNum) return null;
  const fullYear = parseInt(year) > 50 ? `19${year}` : `20${year}`;
  return `${fullYear}-${monthNum}-${day}`;
}

function parseStatement(text: string) {
  const lines = text.split("\n");

  // ── Detect currency from header ──
  let currency: "EUR" | "ALL" = "ALL"; // default to ALL
  let accountName = "BKT";
  let iban = "";

  for (const line of lines.slice(0, 30)) {
    const trimmed = line.trim();
    // Check for EUR indicators
    if (/EUR\s*$/.test(trimmed) || /EURO\s*$/.test(trimmed) || /- EURO/.test(trimmed) || /CLPRCFEUR/.test(trimmed)) {
      currency = "EUR";
    }
    // Check for ALL indicators
    if (/ALL\s*$/.test(trimmed) || /- ALL\b/.test(trimmed) || /- LEKE/.test(trimmed) || /CLPRCFALL/.test(trimmed) || /CLPRALL/.test(trimmed)) {
      currency = "ALL";
    }
    // IBAN
    const ibanMatch = trimmed.match(/IBAN:\s*(AL\w+)/);
    if (ibanMatch) iban = ibanMatch[1];
    // Account number for name
    const accNumMatch = trimmed.match(/(\d{9})\S*\s+.*?(EUR|ALL)/);
    if (accNumMatch) {
      accountName = `BKT ${accNumMatch[2]} - ${accNumMatch[1]}`;
    }
  }

  // If we found CLPRCFEUR in any line, it's EUR
  if (text.includes("CLPRCFEUR")) currency = "EUR";
  if (text.includes("CLPRCFALL") || text.includes("CLPRALL")) currency = "ALL";

  // ── Parse transactions line by line ──
  const dateRegex = /^(\d{2}-[A-Z]{3}-\d{2})\s+/;
  const numberRegex = /[\d,]+\.\d{2}/g;
  const skipPatterns = /OPENING BALANCE|CLOSING BALANCE|^Data\s+Pershkrimi|^DATE\s+DESCRIPTION/;

  const transactions: ParsedTx[] = [];
  let prevBalance: number | null = 0; // opening balance

  let i = 0;
  while (i < lines.length) {
    const line = lines[i].trim();
    const dateMatch = line.match(dateRegex);

    if (!dateMatch || skipPatterns.test(line)) {
      // Check for opening balance
      if (/OPENING BALANCE/.test(line)) {
        const nums = line.match(numberRegex);
        if (nums) prevBalance = parseFloat(nums[nums.length - 1].replace(/,/g, ""));
      }
      i++;
      continue;
    }

    const dateStr = dateMatch[1];
    const parsedDate = parseBKTDate(dateStr);
    if (!parsedDate) { i++; continue; }

    // Collect the full transaction block (this line + continuation lines)
    let fullBlock = line;
    let j = i + 1;
    while (j < lines.length) {
      const nextLine = lines[j].trim();
      if (!nextLine) { j++; continue; }
      if (dateRegex.test(nextLine)) break;
      if (/^-{10,}/.test(nextLine)) break;
      if (/^AccountNo:/.test(nextLine)) { j++; continue; }
      if (/^PAGE NO/.test(nextLine)) { j++; continue; }
      if (/^Data\s+Pershkrimi/.test(nextLine)) break;
      if (/^DATE\s+DESCRIPTION/.test(nextLine)) break;
      if (/^Shënim:/.test(nextLine)) break;
      fullBlock += " " + nextLine;
      j++;
    }

    // Extract description (first line, after date, before numbers)
    const afterDate = line.substring(dateMatch[0].length);
    const firstNumPos = afterDate.search(/\s[\d,]+\.\d{2}/);
    let description = firstNumPos > 0 ? afterDate.substring(0, firstNumPos).trim() : afterDate.trim();

    // Enrich description from block
    const byOrderMatch = fullBlock.match(/By Order (?:Of|of)::?(?:\d\/)?([^/\n]+?)(?:\s*\/[A-Z]{2}|\s+Tr\.|\s*$)/);
    if (byOrderMatch) {
      const sender = byOrderMatch[1].trim();
      if (sender && sender.length > 2 && !description.includes(sender)) {
        description += ` - ${sender}`;
      }
    }
    const detailsMatch = fullBlock.match(/Details::([^;]+)/);
    if (detailsMatch) {
      const detail = detailsMatch[1].trim();
      if (detail && !detail.startsWith("/ROC/NOT PROVIDED")) {
        description += ` (${detail})`;
      }
    }

    // Clean description
    description = description.replace(/\s{2,}/g, " ").replace(/ALBANIA\s*$/, "").trim();
    if (!description) { i = j; continue; }

    // Extract ALL numbers from this first line only (not the full block)
    const lineNumbers = line.match(numberRegex)?.map((n) => parseFloat(n.replace(/,/g, ""))) ?? [];

    // We need at least 2 numbers (amount + balance), or just balance
    let debit: number | null = null;
    let credit: number | null = null;
    let balance: number | null = null;

    if (lineNumbers.length >= 2) {
      // Last number is always balance
      balance = lineNumbers[lineNumbers.length - 1];
      const amount = lineNumbers[lineNumbers.length - 2];

      // Determine debit/credit by comparing with previous balance
      if (prevBalance !== null) {
        const diffCredit = Math.abs((prevBalance + amount) - balance);
        const diffDebit = Math.abs((prevBalance - amount) - balance);

        if (diffCredit < 0.02) {
          credit = amount;
        } else if (diffDebit < 0.02) {
          debit = amount;
        } else {
          // Fallback: if balance went up it's credit, down it's debit
          if (balance > prevBalance) {
            credit = amount;
          } else {
            debit = amount;
          }
        }
      } else {
        // No previous balance, guess from keywords
        if (/DEPOSIT|TRANSFER.*Ben:|LIQUIDATION/.test(line) && !/Salary|WITHDRAWAL|Exchange|KOMISION|PURCHASE|TAX\s/.test(line)) {
          credit = amount;
        } else {
          debit = amount;
        }
      }

      prevBalance = balance;
    } else if (lineNumbers.length === 1) {
      // Only balance, skip (likely a header or continuation)
      balance = lineNumbers[0];
      prevBalance = balance;
      i = j;
      continue;
    } else {
      // No numbers on this line — skip
      i = j;
      continue;
    }

    if (debit || credit) {
      transactions.push({ date: parsedDate, description, debit, credit, balance });
    }

    i = j;
  }

  return { currency, accountName, iban, transactions };
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json({ error: "File must be a PDF" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require("pdf-parse/lib/pdf-parse.js");
    const pdf = await pdfParse(buffer);

    const result = parseStatement(pdf.text);

    return NextResponse.json({
      currency: result.currency,
      accountName: result.accountName,
      iban: result.iban,
      transactions: result.transactions,
      totalTransactions: result.transactions.length,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("Import error:", msg);
    return NextResponse.json(
      { error: `Failed to parse PDF: ${msg}` },
      { status: 500 }
    );
  }
}
