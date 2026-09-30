import { jsPDF } from "jspdf";

/**
 * Generates a professional Turf Owner Settlement Breakdown PDF document.
 * Returns a Buffer for direct Nodemailer email attachment.
 *
 * @param {Object} params
 * @param {string} params.ownerName
 * @param {string} params.turfName
 * @param {string} params.settlementDate
 * @param {string} params.settlementId
 * @param {number} params.totalBookings
 * @param {number} params.grossAmount
 * @param {number} params.platformFee
 * @param {number} params.netPayoutAmount
 * @param {string} params.bankName
 * @param {string} params.accountNumber
 * @param {string} params.ifscCode
 * @param {string} params.upiId
 * @param {string} params.utrNumber
 * @param {string} params.transferId
 * @param {string} params.transferStatus
 * @param {string} params.transferredOn
 * @param {Array}  params.bookings
 * @returns {Promise<Buffer>}
 */
export async function generateSettlementPdfBuffer({
  ownerName = "Turf Owner",
  turfName = "SportX Arena",
  settlementDate = "",
  settlementId = "",
  totalBookings = 0,
  grossAmount = 0,
  platformFee = 0,
  netPayoutAmount = 0,
  bankName = "Bank Account",
  accountNumber = "",
  ifscCode = "",
  upiId = "",
  utrNumber = "",
  transferId = "",
  transferStatus = "SUCCESS",
  transferredOn = "",
  bookings = [],
}) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 14;
  const contentWidth = pageWidth - margin * 2; // 182mm

  // Format currency helper
  const fmt = (num) =>
    Number(num || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const maskedAccount = accountNumber
    ? `•••• •••• ${accountNumber.slice(-4)}`
    : upiId || "Registered Account";

  const txnId = utrNumber && utrNumber !== "PROCESSING" && utrNumber !== "FAILED"
    ? utrNumber
    : transferId || settlementId || "N/A";

  let curY = margin;

  // 1. HEADER BAR (Dark Emerald Theme)
  doc.setFillColor(15, 42, 67); // Navy #0F2A43
  doc.roundedRect(margin, curY, contentWidth, 26, 3, 3, "F");

  // Logo Brand Text
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text("Sport", margin + 8, curY + 13);
  doc.setTextColor(16, 185, 129); // Emerald Accent #10B981
  doc.text("X", margin + 25.5, curY + 13);
  doc.setTextColor(255, 255, 255);
  doc.text("Club", margin + 30.5, curY + 13);

  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(148, 163, 184); // Slate-400
  doc.text("OFFICIAL SETTLEMENT BREAKDOWN STATEMENT", margin + 8, curY + 19);

  // Top-Right Status Badge
  const isPaid = String(transferStatus).toUpperCase() === "SUCCESS" || String(transferStatus).toUpperCase() === "PAID";
  const statusColor = isPaid ? [16, 185, 129] : [239, 68, 68];
  doc.setFillColor(...statusColor);
  doc.roundedRect(margin + contentWidth - 36, curY + 8, 30, 9, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text(String(transferStatus || "SUCCESS").toUpperCase(), margin + contentWidth - 21, curY + 14, {
    align: "center",
  });

  curY += 32;

  // 2. SETTLEMENT METADATA & RECIPIENT CARD
  doc.setFillColor(248, 250, 252); // Slate-50
  doc.setDrawColor(226, 232, 240); // Slate-200
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, curY, contentWidth, 32, 2.5, 2.5, "FD");

  // Column 1: Turf & Owner Info
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42); // Slate-900
  doc.text("TURF / RECIPIENT DETAILS", margin + 6, curY + 7);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Turf Name:`, margin + 6, curY + 13);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text(String(turfName), margin + 26, curY + 13);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text(`Owner:`, margin + 6, curY + 19);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text(String(ownerName), margin + 26, curY + 19);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text(`Account:`, margin + 6, curY + 25);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text(`${bankName} (${maskedAccount})`, margin + 26, curY + 25);

  // Column 2: Settlement & Transfer Info
  const col2X = margin + 98;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text("SETTLEMENT REFERENCE", col2X, curY + 7);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Settlement Date:`, col2X, curY + 13);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text(String(settlementDate), col2X + 30, curY + 13);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text(`Transaction ID / Ref:`, col2X, curY + 19);
  doc.setFont("courier", "bold");
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  const displayTxn = txnId.length > 20 ? txnId.slice(0, 18) + "..." : txnId;
  doc.text(displayTxn, col2X + 30, curY + 19);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Transferred On:`, col2X, curY + 25);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text(String(transferredOn || `${settlementDate} 12:00 AM IST`), col2X + 30, curY + 25);

  curY += 38;

  // 3. FINANCIAL SUMMARY KPI BOXES
  const boxW = (contentWidth - 6) / 3; // ~58.6mm each
  const boxH = 18;

  // Box 1: Gross Revenue
  doc.setFillColor(241, 245, 249); // Slate-100
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, curY, boxW, boxH, 2, 2, "FD");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text("GROSS AMOUNT", margin + boxW / 2, curY + 6, { align: "center" });
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(`Rs. ${fmt(grossAmount)}`, margin + boxW / 2, curY + 13.5, { align: "center" });

  // Box 2: Platform Fee
  const box2X = margin + boxW + 3;
  doc.setFillColor(254, 242, 242); // Red-50
  doc.setDrawColor(254, 202, 202); // Red-200
  doc.roundedRect(box2X, curY, boxW, boxH, 2, 2, "FD");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(220, 38, 38);
  doc.text("PLATFORM COMMISSION", box2X + boxW / 2, curY + 6, { align: "center" });
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(220, 38, 38);
  doc.text(`- Rs. ${fmt(platformFee)}`, box2X + boxW / 2, curY + 13.5, { align: "center" });

  // Box 3: Net Transferred Amount
  const box3X = box2X + boxW + 3;
  doc.setFillColor(236, 253, 245); // Emerald-50
  doc.setDrawColor(167, 243, 208); // Emerald-200
  doc.roundedRect(box3X, curY, boxW, boxH, 2, 2, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(5, 150, 105);
  doc.text("NET AMOUNT TRANSFERRED", box3X + boxW / 2, curY + 6, { align: "center" });
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11.5);
  doc.setTextColor(5, 150, 105);
  doc.text(`Rs. ${fmt(netPayoutAmount)}`, box3X + boxW / 2, curY + 13.5, { align: "center" });

  curY += 24;

  // 4. ITEMISED TABLE: TURF SETTLEMENTS BREAKDOWN
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text(`Turf Settlements Breakdown (${bookings.length} Bookings)`, margin, curY);

  curY += 5;

  // Table Column Widths & Positions
  // Total width: 182mm
  // Columns:
  // 1. Booking ID: 26mm
  // 2. Player: 34mm
  // 3. Sport: 22mm
  // 4. Time Slot: 42mm
  // 5. Gross (Rs): 19mm
  // 6. Fee (Rs): 17mm
  // 7. Net Payout (Rs): 22mm
  const cols = [
    { title: "BOOKING ID", width: 26, align: "left" },
    { title: "PLAYER", width: 34, align: "left" },
    { title: "SPORT", width: 22, align: "left" },
    { title: "TIME SLOT", width: 42, align: "left" },
    { title: "GROSS (Rs)", width: 19, align: "right" },
    { title: "FEE (Rs)", width: 17, align: "right" },
    { title: "NET (Rs)", width: 22, align: "right" },
  ];

  // Draw Table Header
  const headerHeight = 7.5;
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.rect(margin, curY, contentWidth, headerHeight, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);

  let startColX = margin;
  cols.forEach((col) => {
    const textX = col.align === "right" ? startColX + col.width - 2 : startColX + 2;
    doc.text(col.title, textX, curY + 5, { align: col.align });
    startColX += col.width;
  });

  curY += headerHeight;

  // Draw Table Rows
  const rowHeight = 7.0;
  doc.setFontSize(7.5);

  if (bookings.length === 0) {
    doc.setFillColor(255, 255, 255);
    doc.rect(margin, curY, contentWidth, rowHeight + 4, "F");
    doc.setFont("helvetica", "normal");
    doc.setTextColor(148, 163, 184);
    doc.text("No individual slot bookings recorded for this settlement batch.", margin + contentWidth / 2, curY + 7, {
      align: "center",
    });
    curY += rowHeight + 4;
  } else {
    bookings.forEach((b, idx) => {
      // Check for page overflow
      if (curY + rowHeight > pageHeight - 25) {
        doc.addPage();
        curY = margin;
      }

      const isEven = idx % 2 === 0;
      doc.setFillColor(isEven ? 255 : 250, isEven ? 255 : 250, isEven ? 255 : 252);
      doc.rect(margin, curY, contentWidth, rowHeight, "F");

      // Bottom Row Border
      doc.setDrawColor(241, 245, 249);
      doc.line(margin, curY + rowHeight, margin + contentWidth, curY + rowHeight);

      let cellX = margin;

      // 1. Booking Code
      doc.setFont("courier", "bold");
      doc.setTextColor(15, 23, 42);
      const bCode = String(b.booking_code || `BK-${b.id || idx + 1}`).slice(0, 14);
      doc.text(bCode, cellX + 2, curY + 4.8);
      cellX += cols[0].width;

      // 2. Player Name
      doc.setFont("helvetica", "normal");
      doc.setTextColor(51, 65, 85);
      const pName = String(b.user_name || "Player");
      doc.text(pName.length > 18 ? pName.slice(0, 16) + ".." : pName, cellX + 2, curY + 4.8);
      cellX += cols[1].width;

      // 3. Sport
      const sName = String(b.sport || "Sport");
      doc.text(sName.length > 12 ? sName.slice(0, 10) + ".." : sName, cellX + 2, curY + 4.8);
      cellX += cols[2].width;

      // 4. Time Slot
      const tSlot = String(b.time_slot || b.slot_time || "Scheduled Slot");
      doc.text(tSlot.length > 24 ? tSlot.slice(0, 22) + ".." : tSlot, cellX + 2, curY + 4.8);
      cellX += cols[3].width;

      // 5. Gross Amount
      const bGross = Number(b.amount || 0);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(15, 23, 42);
      doc.text(fmt(bGross), cellX + cols[4].width - 2, curY + 4.8, { align: "right" });
      cellX += cols[4].width;

      // 6. Platform Fee
      const bFee = Number(b.platform_fee || 0);
      doc.setTextColor(220, 38, 38);
      doc.text(fmt(bFee), cellX + cols[5].width - 2, curY + 4.8, { align: "right" });
      cellX += cols[5].width;

      // 7. Net Payout
      const bNet = Number(b.owner_payout_amount || bGross - bFee);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(5, 150, 105);
      doc.text(fmt(bNet), cellX + cols[6].width - 2, curY + 4.8, { align: "right" });

      curY += rowHeight;
    });
  }

  // Draw Table Total Footer
  const footerHeight = 8;
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.rect(margin, curY, contentWidth, footerHeight, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text("TOTAL SETTLEMENT SUMMARY:", margin + 2, curY + 5.5);

  const sumGrossX = margin + cols[0].width + cols[1].width + cols[2].width + cols[3].width + cols[4].width - 2;
  const sumFeeX = sumGrossX + cols[5].width;
  const sumNetX = sumFeeX + cols[6].width;

  doc.text(fmt(grossAmount), sumGrossX, curY + 5.5, { align: "right" });
  doc.setTextColor(220, 38, 38);
  doc.text(fmt(platformFee), sumFeeX, curY + 5.5, { align: "right" });
  doc.setTextColor(5, 150, 105);
  doc.text(fmt(netPayoutAmount), sumNetX, curY + 5.5, { align: "right" });

  curY += footerHeight + 10;

  // 5. FOOTER NOTES & SUPPORT
  if (curY > pageHeight - 30) {
    doc.addPage();
    curY = margin;
  }

  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.line(margin, curY, margin + contentWidth, curY);

  curY += 5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(
    "Note: This is an automatically generated electronic settlement statement by SportXClub Payout Engine.",
    margin,
    curY
  );
  doc.text(
    "For any settlement queries, please reach out to our partner support team at support@sportxclub.com",
    margin,
    curY + 4
  );

  const arrayBuffer = doc.output("arraybuffer");
  return Buffer.from(arrayBuffer);
}
