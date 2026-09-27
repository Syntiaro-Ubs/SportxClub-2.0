import { jsPDF } from "jspdf";

/**
 * Format timestamp into readable Indian Standard Time
 */
function formatDateTime(dateInput) {
  try {
    const date = dateInput ? new Date(dateInput) : new Date();
    if (isNaN(date.getTime())) return new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
    return date.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
  }
}

/**
 * Fetches QR Code as Base64 for PDF embedding
 */
async function getQrCodeBase64(bookingId) {
  try {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(bookingId || "SportXClub-Pass")}`;
    const res = await fetch(qrUrl);
    if (res.ok) {
      const arrayBuffer = await res.arrayBuffer();
      return `data:image/png;base64,${Buffer.from(arrayBuffer).toString("base64")}`;
    }
  } catch (err) {
    console.warn("[BOOKING EMAIL] QR fetch warning:", err.message);
  }
  return null;
}

/**
 * Generates exact Website Match Pass in PDF format for Email Attachment (Image 3 Replica)
 */
export async function generatePassPdfBuffer({
  bookingId = "order_spx_1790347058513_950",
  userName = "Ujjwal Bramhnote",
  userEmail,
  userPhone = "7410507803",
  turfName = "MODI PUBLIC GROUND",
  sport = "Football",
  bookingDate = "25 Sep 2026",
  startTime,
  endTime,
  duration,
  slotCount = 1,
  slotList = [],
  amountPaid = 1,
  turfLocation = "Nagpur",
  bookingCreatedAt,
}) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // Soft Background Canvas
  doc.setFillColor(241, 245, 249); // #F1F5F9
  doc.rect(0, 0, 210, 297, "F");

  // Center Ticket Card Container (Tall Portrait Proportions ~1:1.45)
  const cardW = 144;
  const cardH = 206;
  const cardX = (210 - cardW) / 2; // 33mm
  const cardY = (297 - cardH) / 2; // 45.5mm

  // Card Shadow Simulation (Soft Subtle Blur Under Card)
  doc.setFillColor(226, 232, 240);
  doc.roundedRect(cardX - 0.6, cardY + 0.6, cardW + 1.2, cardH + 1.2, 7, 7, "F");

  // Main Pure White Ticket Card (No Outer Dark Border)
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(241, 245, 249);
  doc.setLineWidth(0.2);
  doc.roundedRect(cardX, cardY, cardW, cardH, 7, 7, "FD");

  // 1. 🟢 Top Elevated Circular Checkmark Disc Badge
  const badgeCx = cardX + cardW / 2;
  const badgeCy = cardY;
  const badgeR = 8.5;

  // Disc Body
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(241, 245, 249);
  doc.setLineWidth(0.3);
  doc.circle(badgeCx, badgeCy, badgeR, "FD");

  // Inner Green Ring
  doc.setDrawColor(16, 185, 129); // #10B981
  doc.setLineWidth(0.7);
  doc.circle(badgeCx, badgeCy, badgeR - 1.8, "S");

  // Sharp Green Checkmark
  doc.setDrawColor(16, 185, 129);
  doc.setLineWidth(0.85);
  doc.line(badgeCx - 2.8, badgeCy - 0.2, badgeCx - 0.6, badgeCy + 2.4);
  doc.line(badgeCx - 0.6, badgeCy + 2.4, badgeCx + 3.2, badgeCy - 2.4);

  // 2. Header: Payment Successful + Venue Name + City + Order ID
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14.5);
  doc.setTextColor(16, 185, 129);
  doc.text("Payment Successful!", badgeCx, cardY + 17, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42); // #0F172A
  doc.text(String(turfName || "MODI PUBLIC GROUND").toUpperCase(), badgeCx, cardY + 25, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105); // #475569
  doc.text(String(turfLocation || "Nagpur"), badgeCx, cardY + 31, { align: "center" });

  doc.setFont("courier", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139); // #64748B
  doc.text(String(bookingId || "order_spx_1790347058513_950"), badgeCx, cardY + 36.5, { align: "center" });

  // 3. Sport Pill Badge (Stadium Oval with Thin Dark Border)
  const sportUpper = String(sport || "FOOTBALL").toUpperCase();
  const sportPillW = 34;
  const sportPillH = 6.5;
  const sportPillX = badgeCx - sportPillW / 2;
  const sportPillY = cardY + 41.5;

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(30, 41, 59); // slate-800
  doc.setLineWidth(0.35);
  doc.roundedRect(sportPillX, sportPillY, sportPillW, sportPillH, 3.25, 3.25, "FD");

  // Sport Icon Mini Circle
  doc.setDrawColor(30, 41, 59);
  doc.circle(sportPillX + 4.5, sportPillY + 3.25, 1.6, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text(sportUpper, sportPillX + 19, sportPillY + 4.6, { align: "center" });

  // 4. Pass Holder Name & Mobile Number
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14.5);
  doc.setTextColor(15, 23, 42);
  doc.text(String(userName || "Ujjwal Bramhnote"), badgeCx, cardY + 56.5, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(`Mobile Number: ${userPhone || "7410507803"}`, badgeCx, cardY + 63, { align: "center" });

  // 5. Emerald Green Center Divider with Solid Emerald Dot
  const lineY = cardY + 69.5;
  doc.setDrawColor(16, 185, 129); // #10B981
  doc.setLineWidth(0.45);
  doc.line(cardX + 12, lineY, cardX + cardW - 12, lineY);

  doc.setFillColor(16, 185, 129);
  doc.circle(badgeCx, lineY, 1.5, "F");

  // 6. 3 Rounded Detail Cards Grid (Side by Side Horizontally)
  const cardRowY = cardY + 76;
  const boxW = 37;
  const boxH = 17;
  const gap = 4.5;
  const totalBoxesW = boxW * 3 + gap * 2; // 120mm
  const startBoxX = cardX + (cardW - totalBoxesW) / 2;

  const drawMetricBox = (bx, by, label, val) => {
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(51, 65, 85); // slate-700
    doc.setLineWidth(0.35);
    doc.roundedRect(bx, by, boxW, boxH, 3.2, 3.2, "FD");

    // Top Label
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(71, 85, 105); // slate-600
    doc.text(label, bx + boxW / 2, by + 5.2, { align: "center" });

    // Value
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(String(val), bx + boxW / 2, by + 12.2, { align: "center" });
  };

  const formattedAmount = `INR ${Number(amountPaid || 0).toLocaleString("en-IN")}`;
  const displaySlot = slotCount > 1 ? `${startTime} – ${endTime}` : (startTime && endTime ? `${startTime} – ${endTime}` : "10:00 PM - 11:00 PM");

  drawMetricBox(startBoxX, cardRowY, "Event Date:", String(bookingDate || "25 Sep 2026"));
  drawMetricBox(startBoxX + boxW + gap, cardRowY, "Event Time Slot:", String(displaySlot));
  drawMetricBox(startBoxX + (boxW + gap) * 2, cardRowY, "Amount Paid:", formattedAmount);

  // 7. Perforated Notch Tear Line with Semicircular Cutouts
  const tearY = cardY + 110;
  const notchR = 5.0;

  // Background cutouts
  doc.setFillColor(241, 245, 249);
  doc.circle(cardX, tearY, notchR, "F");
  doc.circle(cardX + cardW, tearY, notchR, "F");

  // Dashed Perforation Line
  doc.setDrawColor(203, 213, 225); // slate-300
  doc.setLineWidth(0.4);
  doc.setLineDashPattern([1.5, 1.5], 0);
  doc.line(cardX + notchR + 2, tearY, cardX + cardW - notchR - 2, tearY);
  doc.setLineDashPattern([], 0);

  // 8. Bottom Section: Left Side Details + Right Bracketed QR Code
  const stubLeftX = cardX + 14;
  const stubY = tearY + 14;

  // Payment Date Label & Value
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text("Payment Date:", stubLeftX, stubY);

  const displayPaymentDate = formatDateTime(bookingCreatedAt || new Date());
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text(displayPaymentDate, stubLeftX, stubY + 6.5);

  // Stadium Pill: OFFICIAL PASS 🟢
  const offPillY = stubY + 14;
  const offPillW = 34;
  const offPillH = 7.0;

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(30, 41, 59); // slate-800
  doc.setLineWidth(0.35);
  doc.roundedRect(stubLeftX, offPillY, offPillW, offPillH, 3.5, 3.5, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(15, 23, 42);
  doc.text("OFFICIAL PASS", stubLeftX + 4.5, offPillY + 4.8);

  // Right Solid Green Circle Dot
  doc.setFillColor(16, 185, 129);
  doc.circle(stubLeftX + offPillW - 4.5, offPillY + 3.5, 1.4, "F");

  // Right Side: Large Bracketed QR Code
  const qrW = 42;
  const qrH = 42;
  const qrX = cardX + cardW - 14 - qrW;
  const qrY = stubY - 4;

  // QR Container Box
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(241, 245, 249);
  doc.setLineWidth(0.3);
  doc.roundedRect(qrX, qrY, qrW, qrH, 3.5, 3.5, "FD");

  // 4 Corner Bracket Markers [  ]
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.9);
  const brkLen = 5.5;
  const brkPad = 1.2;

  // Top-Left
  doc.line(qrX + brkPad, qrY + brkPad, qrX + brkPad + brkLen, qrY + brkPad);
  doc.line(qrX + brkPad, qrY + brkPad, qrX + brkPad, qrY + brkPad + brkLen);
  // Top-Right
  doc.line(qrX + qrW - brkPad, qrY + brkPad, qrX + qrW - brkPad - brkLen, qrY + qrH - brkPad);
  doc.line(qrX + qrW - brkPad, qrY + brkPad, qrX + qrW - brkPad, qrY + qrH - brkPad + brkLen);
  // Bottom-Left
  doc.line(qrX + brkPad, qrY + qrH - brkPad, qrX + brkPad + brkLen, qrY + qrH - brkPad);
  doc.line(qrX + brkPad, qrY + qrH - brkPad, qrX + brkPad, qrY + qrH - brkPad - brkLen);
  // Bottom-Right
  doc.line(qrX + qrW - brkPad, qrY + qrH - brkPad, qrX + qrW - brkPad - brkLen, qrY + qrH - brkPad);
  doc.line(qrX + qrW - brkPad, qrY + qrH - brkPad, qrX + qrW - brkPad, qrY + qrH - brkPad - brkLen);

  const qrDataUrl = await getQrCodeBase64(bookingId);
  if (qrDataUrl) {
    try {
      doc.addImage(qrDataUrl, "PNG", qrX + 3.0, qrY + 3.0, qrW - 6.0, qrH - 6.0);
    } catch (qrErr) {
      console.warn("[PDF QR Add Error]:", qrErr.message);
    }
  }

  // 9. Footer Note
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text("Please present this PDF Pass at the gate entry desk on match day.", badgeCx, cardY + cardH - 8, { align: "center" });

  const arrayBuffer = doc.output("arraybuffer");
  return Buffer.from(arrayBuffer);
}
