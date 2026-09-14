/* Convert a Markdown doc -> .docx (tailored parser for the constructs used in our docs).
   Usage: node scripts/md-to-docx.js [input.md] [output.docx]
   Defaults to the requirements-analysis doc so `npm run doc:build` keeps working. */
const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, LevelFormat, HeadingLevel, BorderStyle, WidthType, ShadingType,
} = require("docx");

const SRC = process.argv[2] || "docs/dokumen-master-erp-vti.md";
const OUT = process.argv[3] || "docs/Dokumen-Master-ERP-VTI.docx";
const CONTENT_W = 9360; // US Letter, 1" margins

const md = fs.readFileSync(SRC, "utf8").replace(/\r\n/g, "\n");
const lines = md.split("\n");

// ---- inline formatting ----
function parseInline(text, base = {}) {
  const runs = [];
  const re = /(\*\*([^*]+)\*\*|`([^`]+)`|\*([^*]+)\*)/g;
  let last = 0, m;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) runs.push(new TextRun({ ...base, text: text.slice(last, m.index) }));
    if (m[2] !== undefined) runs.push(new TextRun({ ...base, text: m[2], bold: true }));
    else if (m[3] !== undefined) runs.push(new TextRun({ ...base, text: m[3], font: "Consolas", size: 18 }));
    else if (m[4] !== undefined) runs.push(new TextRun({ ...base, text: m[4], italics: true }));
    last = re.lastIndex;
  }
  if (last < text.length) runs.push(new TextRun({ ...base, text: text.slice(last) }));
  if (runs.length === 0) runs.push(new TextRun({ ...base, text }));
  return runs;
}

const children = [];
let i = 0;
let inOl = false, olCounter = 0;

function endLists() { inOl = false; }

function makeTable(rows) {
  // rows: array of arrays of cell strings; rows[1] is the |---| separator
  const header = rows[0];
  const sep = rows[1] || [];
  const isSep = sep.every((c) => /^:?-{2,}:?$/.test(c.trim()));
  const body = isSep ? rows.slice(2) : rows.slice(1);
  const ncols = Math.max(header.length, ...body.map((r) => r.length), 1);
  const headerEmpty = header.every((c) => c.trim() === "");
  const colW = Math.floor(CONTENT_W / ncols);
  const widths = Array.from({ length: ncols }, (_, k) => (k === ncols - 1 ? CONTENT_W - colW * (ncols - 1) : colW));
  const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
  const borders = { top: border, bottom: border, left: border, right: border };

  function row(cells, isHeader) {
    const tds = [];
    for (let c = 0; c < ncols; c++) {
      const txt = (cells[c] ?? "").trim();
      tds.push(new TableCell({
        borders,
        width: { size: widths[c], type: WidthType.DXA },
        shading: isHeader ? { fill: "D5E8F0", type: ShadingType.CLEAR } : undefined,
        margins: { top: 60, bottom: 60, left: 110, right: 110 },
        children: [new Paragraph({ children: parseInline(txt, isHeader ? { bold: true } : {}), spacing: { after: 0 } })],
      }));
    }
    return new TableRow({ children: tds, tableHeader: isHeader });
  }

  const trows = [];
  if (!headerEmpty) trows.push(row(header, true));
  body.forEach((r) => trows.push(row(r, false)));
  return new Table({ width: { size: CONTENT_W, type: WidthType.DXA }, columnWidths: widths, rows: trows });
}

while (i < lines.length) {
  let line = lines[i];

  // fenced code block
  if (/^```/.test(line.trim())) {
    i++;
    const code = [];
    while (i < lines.length && !/^```/.test(lines[i].trim())) { code.push(lines[i]); i++; }
    i++; // closing fence
    endLists();
    code.forEach((cl) => children.push(new Paragraph({
      shading: { fill: "F1F5F9", type: ShadingType.CLEAR },
      spacing: { after: 0 },
      children: [new TextRun({ text: cl === "" ? " " : cl, font: "Consolas", size: 17 })],
    })));
    children.push(new Paragraph({ spacing: { after: 80 }, children: [] }));
    continue;
  }

  // table block
  if (/^\s*\|.*\|\s*$/.test(line)) {
    const tbl = [];
    while (i < lines.length && /^\s*\|.*\|\s*$/.test(lines[i])) {
      const cells = lines[i].trim().replace(/^\|/, "").replace(/\|$/, "").split("|");
      tbl.push(cells);
      i++;
    }
    endLists();
    children.push(makeTable(tbl));
    children.push(new Paragraph({ spacing: { after: 120 }, children: [] }));
    continue;
  }

  // headings
  let m = /^(#{1,6})\s+(.*)$/.exec(line);
  if (m) {
    endLists();
    const lvl = m[1].length;
    const hl = lvl === 1 ? HeadingLevel.HEADING_1 : lvl === 2 ? HeadingLevel.HEADING_2 : HeadingLevel.HEADING_3;
    children.push(new Paragraph({ heading: hl, children: parseInline(m[2]) }));
    i++;
    continue;
  }

  // horizontal rule
  if (/^---+$/.test(line.trim())) {
    endLists();
    children.push(new Paragraph({
      spacing: { before: 60, after: 120 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "2E75B6", space: 1 } },
      children: [],
    }));
    i++;
    continue;
  }

  // blockquote
  if (/^>\s?/.test(line)) {
    const q = [];
    while (i < lines.length && /^>\s?/.test(lines[i])) { q.push(lines[i].replace(/^>\s?/, "")); i++; }
    endLists();
    children.push(new Paragraph({
      shading: { fill: "FFF7E6", type: ShadingType.CLEAR },
      border: { left: { style: BorderStyle.SINGLE, size: 18, color: "F59E0B", space: 6 } },
      indent: { left: 200 },
      spacing: { before: 80, after: 120 },
      children: parseInline(q.join(" "), { italics: true }),
    }));
    continue;
  }

  // blank
  if (line.trim() === "") { i++; continue; }

  // ordered list item
  m = /^(\s*)(\d+)\.\s+(.*)$/.exec(line);
  if (m) {
    if (!inOl) { olCounter++; inOl = true; }
    children.push(new Paragraph({
      numbering: { reference: `numbers${olCounter}`, level: 0 },
      spacing: { after: 40 },
      children: parseInline(m[3]),
    }));
    i++;
    continue;
  }

  // bullet list item (supports one nested level)
  m = /^(\s*)[-*]\s+(.*)$/.exec(line);
  if (m) {
    const indent = m[1].replace(/\t/g, "    ").length;
    const level = indent >= 2 ? 1 : 0;
    if (level === 0) endLists();
    children.push(new Paragraph({
      numbering: { reference: "bullets", level },
      spacing: { after: 40 },
      children: parseInline(m[2]),
    }));
    i++;
    continue;
  }

  // normal paragraph
  endLists();
  children.push(new Paragraph({ spacing: { after: 120 }, children: parseInline(line) }));
  i++;
}

// numbering config
const numberConfigs = [];
for (let k = 1; k <= 40; k++) {
  numberConfigs.push({
    reference: `numbers${k}`,
    levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
      style: { paragraph: { indent: { left: 600, hanging: 320 } } } }],
  });
}

const doc = new Document({
  styles: {
    default: { document: { run: { font: "Arial", size: 21 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 32, bold: true, font: "Arial", color: "1F2937" },
        paragraph: { spacing: { before: 280, after: 160 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 26, bold: true, font: "Arial", color: "047857" },
        paragraph: { spacing: { before: 220, after: 120 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 22, bold: true, font: "Arial", color: "374151" },
        paragraph: { spacing: { before: 160, after: 100 }, outlineLevel: 2 } },
    ],
  },
  numbering: {
    config: [
      { reference: "bullets", levels: [
        { level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 600, hanging: 280 } } } },
        { level: 1, format: LevelFormat.BULLET, text: "◦", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 1080, hanging: 280 } } } },
      ] },
      ...numberConfigs,
    ],
  },
  sections: [{
    properties: { page: {
      size: { width: 12240, height: 15840 },
      margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
    } },
    children,
  }],
});

Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync(OUT, buf);
  console.log("WROTE", OUT, buf.length, "bytes,", children.length, "blocks");
});
