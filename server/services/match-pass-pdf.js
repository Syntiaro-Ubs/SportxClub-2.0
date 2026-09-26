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
 * Generates exact Website Match Pass in PDF format for Email Attachment
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

  // Soft Slate Background
  doc.setFillColor(241, 245, 249); // #F1F5F9
  doc.rect(0, 0, 210, 297, "F");

  // Center Ticket Card Container (Wide Format)
  const cardW = 152;
  const cardH = 196;
  const cardX = (210 - cardW) / 2; // 29mm
  const cardY = (297 - cardH) / 2; // 50.5mm

  // Outer Card Box
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(71, 85, 105); // slate-600
  doc.setLineWidth(0.6);
  doc.roundedRect(cardX, cardY, cardW, cardH, 6, 6, "FD");

  // 1. 🟢 Top Intersecting Green Checkmark Circle Badge (Slender / Thin Outline)
  const badgeCx = cardX + cardW / 2;
  const badgeCy = cardY;
  const badgeR = 8.0;

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(16, 185, 129); // #10B981 emerald-500
  doc.setLineWidth(0.6);
  doc.circle(badgeCx, badgeCy, badgeR, "FD");

  // Slender Checkmark extending out top-right
  doc.setDrawColor(16, 185, 129);
  doc.setLineWidth(0.65);
  doc.line(badgeCx - 3.8, badgeCy - 0.2, badgeCx - 0.8, badgeCy + 2.8);
  doc.line(badgeCx - 0.8, badgeCy + 2.8, badgeCx + 5.5, badgeCy - 3.8);

  // 2. Header: Payment Successful + Venue Name + City + Order ID
  doc.setFont("helvetica", "normal");
  doc.setFontSize(13);
  doc.setTextColor(16, 185, 129);
  doc.text("Payment Successful!", badgeCx, cardY + 16, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(30, 41, 59);
  doc.text(String(turfName || "MODI PUBLIC GROUND").toUpperCase(), badgeCx, cardY + 23, { align: "center" });

  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(String(turfLocation || "Nagpur"), badgeCx, cardY + 28, { align: "center" });

  doc.setFont("courier", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text(String(bookingId || "order_spx_1790347058513_950"), badgeCx, cardY + 33, { align: "center" });

  // 3. Sport Pill Badge
  const sportName = String(sport || "FOOTBALL").toUpperCase();
  const sportPillW = 32;
  const sportPillH = 6;
  const sportPillX = badgeCx - sportPillW / 2;
  const sportPillY = cardY + 38;

  doc.setFillColor(209, 250, 229); // mint
  doc.setDrawColor(167, 243, 208);
  doc.setLineWidth(0.3);
  doc.roundedRect(sportPillX, sportPillY, sportPillW, sportPillH, 3, 3, "FD");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(6, 95, 70);
  doc.text(sportName, badgeCx, sportPillY + 4.2, { align: "center" });

  // 4. Pass Holder Name & Mobile
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text(String(userName || "Ujjwal Bramhnote"), badgeCx, cardY + 52, { align: "center" });

  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(`Mobile Number: ${userPhone || "7410507803"}`, badgeCx, cardY + 58, { align: "center" });

  // Center Line with Green Dot
  const lineY = cardY + 64;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.line(cardX + 16, lineY, cardX + cardW - 16, lineY);

  doc.setFillColor(16, 185, 129);
  doc.circle(badgeCx, lineY, 1.2, "F");

  // 5. 3 Detail Cards (Date, Time Slot, Amount Paid)
  const cardRowY = cardY + 70;
  const boxW = 38;
  const boxH = 18;
  const gap = 6;
  const totalBoxesW = boxW * 3 + gap * 2;
  const startBoxX = cardX + (cardW - totalBoxesW) / 2;

  const drawBox = (bx, by, label, val) => {
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.4);
    doc.roundedRect(bx, by, boxW, boxH, 3.5, 3.5, "FD");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(148, 163, 184);
    doc.text(label, bx + boxW / 2, by + 5.5, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(30, 41, 59);
    doc.text(String(val), bx + boxW / 2, by + 12, { align: "center" });
  };

  const formattedAmount = `INR ${Number(amountPaid || 0).toLocaleString("en-IN")}`;
  const displaySlot = slotCount > 1 ? `${startTime} – ${endTime}` : (startTime && endTime ? `${startTime} – ${endTime}` : "10:00 PM - 11:00 PM");

  drawBox(startBoxX, cardRowY, "Date:", String(bookingDate || "25 Sep 2026"));
  drawBox(startBoxX + boxW + gap, cardRowY, "Time Slot:", String(displaySlot));
  drawBox(startBoxX + (boxW + gap) * 2, cardRowY, "Amount Paid:", formattedAmount);

  // 6. Ticket Perforation Notches & Dashed Line
  const tearY = cardY + 104;
  const notchR = 4.5;

  doc.setFillColor(241, 245, 249);
  doc.circle(cardX, tearY, notchR, "F");
  doc.circle(cardX + cardW, tearY, notchR, "F");

  doc.setDrawColor(71, 85, 105);
  doc.setLineWidth(0.6);
  doc.ellipse(cardX, tearY, notchR, notchR, "S", 270, 90);
  doc.ellipse(cardX + cardW, tearY, notchR, notchR, "S", 90, 270);

  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.4);
  doc.setLineDashPattern([1.5, 1.5], 0);
  doc.line(cardX + notchR + 2, tearY, cardX + cardW - notchR - 2, tearY);
  doc.setLineDashPattern([], 0);

  // 7. Bottom Stub: Left Details + Right Large Bracketed QR Code
  const stubLeftX = cardX + 16;
  const stubY = tearY + 12;

  // EVENT DATE
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(16, 185, 129);
  doc.text(`EVENT DATE: ${bookingDate || "25 Sep 2026"}`, stubLeftX, stubY);

  // MATCH TIME
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);
  doc.text(`MATCH TIME: ${displaySlot}`, stubLeftX, stubY + 7);

  // PAYMENT DATE
  const paymentDateStr = formatDateTime(bookingCreatedAt || new Date());
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`PAYMENT DATE: ${paymentDateStr}`, stubLeftX, stubY + 14);

  // OFFICIAL PASS PILL
  const offPillY = stubY + 19;
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.roundedRect(stubLeftX, offPillY, 32, 6, 3, 3, "FD");

  doc.setFillColor(16, 185, 129);
  doc.circle(stubLeftX + 4.5, offPillY + 3, 1, "F");

  doc.setFontSize(6.5);
  doc.setTextColor(51, 65, 85);
  doc.text("OFFICIAL PASS", stubLeftX + 8, offPillY + 4.2);

  // Large Bracketed QR Code
  const qrW = 42;
  const qrH = 42;
  const qrX = cardX + cardW - 16 - qrW;
  const qrY = stubY - 4;

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.roundedRect(qrX, qrY, qrW, qrH, 3.5, 3.5, "FD");

  // 4 Corner Brackets
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.8);
  const brkLen = 5.0;
  const brkPad = 1.8;
  doc.line(qrX + brkPad, qrY + brkPad, qrX + brkPad + brkLen, qrY + brkPad);
  doc.line(qrX + brkPad, qrY + brkPad, qrX + brkPad, qrY + brkPad + brkLen);
  doc.line(qrX + qrW - brkPad, qrY + brkPad, qrX + qrW - brkPad - brkLen, qrY + qrH - brkPad);
  doc.line(qrX + qrW - brkPad, qrY + qrH - brkPad, qrX + qrW - brkPad, qrY + qrH - brkPad + brkLen);
  doc.line(qrX + brkPad, qrY + qrH - brkPad, qrX + brkPad + brkLen, qrY + qrH - brkPad);
  doc.line(qrX + brkPad, qrY + qrH - brkPad, qrX + brkPad, qrY + qrH - brkPad - brkLen);
  doc.line(qrX + qrW - brkPad, qrY + qrH - brkPad, qrX + qrW - brkPad - brkLen, qrY + qrH - brkPad);
  doc.line(qrX + qrW - brkPad, qrY + qrH - brkPad, qrX + qrW - brkPad, qrY + qrH - brkPad - brkLen);

  const qrDataUrl = await getQrCodeBase64(bookingId);
  if (qrDataUrl) {
    try {
      doc.addImage(qrDataUrl, "PNG", qrX + 3.5, qrY + 3.5, qrW - 7, qrH - 7);
    } catch (qrErr) {
      console.warn("[PDF QR Add Error]:", qrErr.message);
    }
  }

  // 8. Footer Note
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text("Please present this PDF Pass at the gate entry desk on match day.", badgeCx, cardY + cardH - 8, { align: "center" });

  const arrayBuffer = doc.output("arraybuffer");
  return Buffer.from(arrayBuffer);
}
