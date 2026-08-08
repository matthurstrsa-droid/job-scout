import {
  Document, Packer, Paragraph, TextRun, AlignmentType,
  LevelFormat, BorderStyle, TabStopType
} from "docx";
import { saveAs } from "file-saver";

const NAVY  = "1B3A5C";
const MID   = "2E6DA4";
const GREY  = "555555";
const BLACK = "111111";

const spacer = (pt = 4) => new Paragraph({
  children: [new TextRun("")],
  spacing: { before: 0, after: pt * 20 }
});

function sectionHeader(label) {
  return new Paragraph({
    children: [new TextRun({ text: label.toUpperCase(), bold: true, color: NAVY, size: 22, font: "Arial" })],
    spacing: { before: 280, after: 80 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: MID, space: 4 } },
  });
}

function jobTitle(company, title, dates) {
  return new Paragraph({
    children: [
      new TextRun({ text: title, bold: true, size: 22, color: BLACK, font: "Arial" }),
      new TextRun({ text: "  |  ", color: GREY, size: 20, font: "Arial" }),
      new TextRun({ text: company, size: 20, color: GREY, font: "Arial" }),
      new TextRun({ text: "\t" + dates, size: 20, color: GREY, font: "Arial", italics: true }),
    ],
    tabStops: [{ type: TabStopType.RIGHT, position: 9026 }],
    spacing: { before: 200, after: 60 },
  });
}

function bullet(text) {
  return new Paragraph({
    numbering: { reference: "bullets", level: 0 },
    children: [new TextRun({ text, size: 20, font: "Arial", color: BLACK })],
    spacing: { before: 40, after: 40 },
  });
}

function bodyText(text) {
  return new Paragraph({
    children: [new TextRun({ text, size: 20, font: "Arial", color: BLACK })],
    spacing: { before: 40, after: 80 },
  });
}

function skillsRow(skills) {
  const runs = [];
  skills.forEach((s, i) => {
    runs.push(new TextRun({ text: s, size: 19, font: "Arial", color: NAVY, bold: true }));
    if (i < skills.length - 1) runs.push(new TextRun({ text: "   ·   ", size: 19, font: "Arial", color: GREY }));
  });
  return new Paragraph({ children: runs, spacing: { before: 60, after: 60 } });
}

function nameBlock(subtitle) {
  return [
    new Paragraph({
      children: [new TextRun({ text: "Matthew Hurst", bold: true, size: 56, font: "Arial", color: NAVY })],
      spacing: { before: 0, after: 60 },
    }),
    new Paragraph({
      children: [new TextRun({ text: subtitle, size: 26, font: "Arial", color: MID, italics: true })],
      spacing: { before: 0, after: 100 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: "Copenhagen, Denmark", size: 19, font: "Arial", color: GREY }),
        new TextRun({ text: "   |   ", size: 19, font: "Arial", color: GREY }),
        new TextRun({ text: "+45 31 44 34 18", size: 19, font: "Arial", color: GREY }),
        new TextRun({ text: "   |   ", size: 19, font: "Arial", color: GREY }),
        new TextRun({ text: "matthurstrsa@gmail.com", size: 19, font: "Arial", color: MID }),
        new TextRun({ text: "   |   ", size: 19, font: "Arial", color: GREY }),
        new TextRun({ text: "linkedin.com/in/matthew-hurst-dk", size: 19, font: "Arial", color: MID }),
      ],
      spacing: { before: 0, after: 0 },
    }),
    new Paragraph({
      children: [new TextRun("")],
      border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: NAVY, space: 4 } },
      spacing: { before: 100, after: 0 },
    }),
  ];
}

export async function buildCV(cvData, filename) {
  const { subtitle, profile, skills, experience, education, languages } = cvData;

  const children = [
    ...nameBlock(subtitle || "Planning & Supply Chain Leader"),
    spacer(6),

    // Profile
    sectionHeader("Profile"),
    bodyText(profile),

    // Skills
    sectionHeader("Core Competencies"),
    ...(skills || []).map(row => skillsRow(Array.isArray(row) ? row : [row])),

    // Experience
    sectionHeader("Professional Experience"),
    ...(experience || []).flatMap(role => [
      jobTitle(role.company, role.title, role.dates),
      ...(role.bullets || []).map(b => bullet(b)),
    ]),

    // Education
    sectionHeader("Education & Qualifications"),
    ...(education || []).map(e => new Paragraph({
      children: [new TextRun({ text: e, size: 20, font: "Arial", color: BLACK })],
      spacing: { before: 40, after: 40 },
    })),

    // Languages
    sectionHeader("Languages"),
    new Paragraph({
      children: [new TextRun({ text: languages || "English (native)   ·   Danish (B1)", size: 20, font: "Arial", color: BLACK })],
      spacing: { before: 80, after: 40 },
    }),

    spacer(6),
  ];

  const doc = new Document({
    numbering: {
      config: [{
        reference: "bullets",
        levels: [{
          level: 0, format: LevelFormat.BULLET, text: "–",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 480, hanging: 240 } } },
        }],
      }],
    },
    styles: {
      default: { document: { run: { font: "Arial", size: 20 } } },
    },
    sections: [{
      properties: {
        page: {
          size: { width: 11906, height: 16838 },
          margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 },
        },
      },
      children,
    }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, filename || "Matthew_Hurst_CV.docx");
}
