"""Create the synthetic INSIPS evidence fixture.

The output is deliberately fictional and visibly watermarked. It is safe for demos
and must never be represented as an official CSR-1 or government document.
"""

from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    KeepTogether,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "output" / "pdf" / "Synthetic_CSR-1_Certificate.pdf"


def decorate_page(canvas, document):
    width, height = A4
    canvas.saveState()
    canvas.setFillColor(colors.HexColor("#246BFE"))
    canvas.rect(0, height - 12 * mm, width, 12 * mm, stroke=0, fill=1)
    canvas.setFillColor(colors.white)
    canvas.setFont("Helvetica-Bold", 8)
    canvas.drawString(18 * mm, height - 7.5 * mm, "INSIPS - SAFE SYNTHETIC FIXTURE")

    canvas.setFillColor(colors.Color(0.42, 0.22, 0.94, alpha=0.08))
    canvas.setFont("Helvetica-Bold", 44)
    canvas.translate(width / 2, height / 2)
    canvas.rotate(34)
    canvas.drawCentredString(0, 0, "SYNTHETIC - NOT OFFICIAL")
    canvas.rotate(-34)
    canvas.translate(-width / 2, -height / 2)

    canvas.setStrokeColor(colors.HexColor("#DFE3ED"))
    canvas.line(18 * mm, 15 * mm, width - 18 * mm, 15 * mm)
    canvas.setFillColor(colors.HexColor("#526077"))
    canvas.setFont("Helvetica", 7)
    canvas.drawString(18 * mm, 10 * mm, "Contains invented names and identifiers for software testing only.")
    canvas.drawRightString(width - 18 * mm, 10 * mm, f"Page {document.page}")
    canvas.restoreState()


def build_pdf():
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    document = SimpleDocTemplate(
        str(OUTPUT),
        pagesize=A4,
        rightMargin=18 * mm,
        leftMargin=18 * mm,
        topMargin=23 * mm,
        bottomMargin=22 * mm,
        title="Synthetic CSR-1 Evidence Fixture",
        author="INSIPS",
        subject="Safe synthetic evidence document for a hackathon demonstration",
    )

    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(name="Kicker", parent=styles["Normal"], fontName="Helvetica-Bold", fontSize=8, leading=11, textColor=colors.HexColor("#6938EF"), spaceAfter=5, uppercase=True))
    styles.add(ParagraphStyle(name="DocumentTitle", parent=styles["Title"], fontName="Helvetica-Bold", fontSize=22, leading=26, textColor=colors.HexColor("#0B1220"), alignment=0, spaceAfter=8))
    styles.add(ParagraphStyle(name="Subhead", parent=styles["Heading2"], fontName="Helvetica-Bold", fontSize=12, leading=16, textColor=colors.HexColor("#0B1220"), spaceBefore=12, spaceAfter=6))
    styles.add(ParagraphStyle(name="BodyTextSafe", parent=styles["BodyText"], fontName="Helvetica", fontSize=9, leading=14, textColor=colors.HexColor("#26303F"), spaceAfter=7))
    styles.add(ParagraphStyle(name="SmallSafe", parent=styles["BodyText"], fontName="Helvetica", fontSize=7.5, leading=11, textColor=colors.HexColor("#526077")))

    story = [
        Paragraph("SYNTHETIC DEMONSTRATION EVIDENCE", styles["Kicker"]),
        Paragraph("Form CSR-1 Registration Summary", styles["DocumentTitle"]),
        Paragraph("This is not a Ministry of Corporate Affairs form, registration certificate, legal record, or compliance opinion. It exists only to demonstrate secure document processing and human-reviewed trust claims in INSIPS.", styles["BodyTextSafe"]),
        Spacer(1, 5 * mm),
    ]

    identity_data = [
        ["Field", "Synthetic value"],
        ["Registered legal name", "Udaan Learning Foundation"],
        ["Entity type", "Section 8 company (demonstration only)"],
        ["CSR-1 registration number", "CSR00018427"],
        ["Registered city", "Pune, Maharashtra"],
        ["Record status", "Synthetic current record"],
    ]
    identity_table = Table(identity_data, colWidths=[55 * mm, 108 * mm], repeatRows=1)
    identity_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0B1220")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTNAME", (0, 1), (0, -1), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 8.5),
        ("LEADING", (0, 0), (-1, -1), 12),
        ("BACKGROUND", (0, 1), (-1, -1), colors.HexColor("#F7F8FC")),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#DFE3ED")),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
    ]))
    story.extend([
        Paragraph("1. Organization identity", styles["Subhead"]),
        identity_table,
        Spacer(1, 4 * mm),
        Paragraph("Source statement", styles["Subhead"]),
        Paragraph("Udaan Learning Foundation is a fictional organization created for this software demonstration. The candidate CSR-1 registration number CSR00018427 is deliberately invented and must not be used for any real-world lookup, payment, verification, or compliance decision.", styles["BodyTextSafe"]),
        Paragraph("Suggested extraction behavior", styles["Subhead"]),
        Paragraph("A document-processing system may identify the registered legal name and CSR-1 registration number as candidate fields on page 1. These candidates require organization confirmation and independent reviewer approval before any safe summary can become public.", styles["BodyTextSafe"]),
        PageBreak(),
        Paragraph("SYNTHETIC DEMONSTRATION EVIDENCE", styles["Kicker"]),
        Paragraph("Supporting Notes and Limitations", styles["DocumentTitle"]),
        Paragraph("2. Program description", styles["Subhead"]),
        Paragraph("The fictional organization operates community learning centers for first-generation students. The program description is product-test copy and does not refer to a real beneficiary, address, school, employee, donor, or legal entity.", styles["BodyTextSafe"]),
        Paragraph("3. Referenced but missing evidence", styles["Subhead"]),
    ])

    missing_data = [
        ["Reference", "What this document proves", "Required next action"],
        ["80G", "A renewal is mentioned, but no certificate is attached.", "Request the current 80G certificate."],
        ["12A", "No supporting 12A record is included.", "Do not create a public 12A claim."],
        ["Physical verification", "No physical visit or inspection is described.", "Do not imply physical verification."],
    ]
    missing_table = Table(missing_data, colWidths=[30 * mm, 65 * mm, 68 * mm], repeatRows=1)
    missing_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#6938EF")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTNAME", (0, 1), (0, -1), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 7.5),
        ("LEADING", (0, 0), (-1, -1), 10),
        ("BACKGROUND", (0, 1), (-1, -1), colors.HexColor("#F7F8FC")),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#DFE3ED")),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
    ]))
    story.extend([
        missing_table,
        Spacer(1, 6 * mm),
        KeepTogether([
            Paragraph("4. Required interpretation", styles["Subhead"]),
            Paragraph("This fixture intentionally contains an ambiguous 80G reference. INSIPS Compass should describe it as a medium-confidence candidate or a missing-evidence item, never as an approved status. A platform reviewer should reject or request changes for any claim that lacks the supporting certificate.", styles["BodyTextSafe"]),
        ]),
        Paragraph("5. Safe-use notice", styles["Subhead"]),
        Paragraph("Do not upload real KYC or compliance material to an unapproved environment. Do not use this sample to impersonate an organization, obtain funds, satisfy a regulator, or make a funding decision. All numbers and statements are fictional.", styles["BodyTextSafe"]),
        Spacer(1, 8 * mm),
    ])

    notice = Table([[Paragraph("DEMO ONLY", styles["Kicker"]), Paragraph("A reviewer decision in the INSIPS demo describes a software state. It is not legal, tax, regulatory, or professional advice.", styles["SmallSafe"])]], colWidths=[32 * mm, 131 * mm])
    notice.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#EEEAFF")),
        ("BOX", (0, 0), (-1, -1), 0.8, colors.HexColor("#9A7BFF")),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 9),
        ("RIGHTPADDING", (0, 0), (-1, -1), 9),
        ("TOPPADDING", (0, 0), (-1, -1), 9),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 9),
    ]))
    story.append(notice)

    document.build(story, onFirstPage=decorate_page, onLaterPages=decorate_page)
    print(OUTPUT)


if __name__ == "__main__":
    build_pdf()
