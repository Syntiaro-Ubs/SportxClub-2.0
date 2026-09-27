import { jsPDF } from "jspdf";

/**
 * Helper to parse and consolidate single or multiple time slots
 */
export function parseBookingSlots(timeSlot = "") {
  let startTime = "Scheduled Time";
  let endTime = "Scheduled End";
  let duration = "1 Hour";
  let slotCount = 1;
  let slotList = [];
  let displaySlotText = String(timeSlot || "Scheduled Time").trim();

  if (!timeSlot) {
    return { startTime, endTime, duration, slotCount, slotList, displaySlotText, rangeText: displaySlotText };
  }

  const str = String(timeSlot).trim();

  // 1. Multiple slots separated by comma or semicolon
  if (str.includes(",") || str.includes(";")) {
    const slots = str.split(/[,;]+/).map((s) => s.trim()).filter(Boolean);
    slotList = slots;
    slotCount = slots.length;

    const parseSingle = (singleStr) => {
      const match = singleStr.match(/(\d{1,2}(?::\d{2})?\s*(?:AM|PM)?)\s*[-–—to]+\s*(\d{1,2}(?::\d{2})?\s*(?:AM|PM)?)/i);
      if (match) return { start: match[1].trim(), end: match[2].trim() };
      return { start: singleStr, end: singleStr };
    };

    const firstParsed = parseSingle(slots[0]);
    const lastParsed = parseSingle(slots[slots.length - 1]);

    startTime = firstParsed.start;
    endTime = lastParsed.end;
    duration = `${slotCount} ${slotCount === 1 ? "Hour" : "Hours"}`;
    displaySlotText = slots.join(", ");
    const rangeText = `${startTime} – ${endTime}`;

    return { startTime, endTime, duration, slotCount, slotList, displaySlotText, rangeText };
  }

  // 2. Single range
  if (str.includes("-") || str.includes("–") || str.includes("—") || str.includes("to")) {
    const parts = str.split(/[-–—]|to/).map((p) => p.trim());
    if (parts.length >= 2) {
      startTime = parts[0];
      endTime = parts[1];
      slotList = [str];
    }
  } else {
    startTime = str;
    endTime = "End of Slot";
    slotList = [str];
  }

  const rangeText = `${startTime} – ${endTime}`;
  return { startTime, endTime, duration, slotCount, slotList, displaySlotText: str, rangeText };
}

/**
 * Generates exact 1:1 match of the SportX Match Pass Ticket in PDF (Image 3 Replica)
 */
export async function generateSportXPassDoc({
  orderId = "order_spx_1790347058513_950",
  userName = "Ujjwal Bramhnote",
  userPhone = "7410507803",
  turfName = "MODI PUBLIC GROUND",
  location = "Nagpur",
  sport = "Football",
  date = "25 Sep 2026",
  timeSlot = "10:00 PM - 11:00 PM",
  amount = 1,
  paymentDate = "25 Sep 2026, 08:30 PM",
}) {
  const { rangeText } = parseBookingSlots(timeSlot);

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
  doc.text(String(location || "Nagpur"), badgeCx, cardY + 31, { align: "center" });

  doc.setFont("courier", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139); // #64748B
  doc.text(String(orderId || "order_spx_1790347058513_950"), badgeCx, cardY + 36.5, { align: "center" });

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

  const formattedAmount = `INR ${Number(amount || 0).toLocaleString("en-IN")}`;
  const displaySlot = rangeText || timeSlot || "10:00 PM - 11:00 PM";

  drawMetricBox(startBoxX, cardRowY, "Event Date:", String(date || "25 Sep 2026"));
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

  const displayPaymentDate = paymentDate || "25 Sep 2026, 08:30 PM";
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
  doc.line(qrX + qrW - brkPad, qrY + brkPad, qrX + qrW - brkPad - brkLen, qrY + brkPad);
  doc.line(qrX + qrW - brkPad, qrY + brkPad, qrX + qrW - brkPad, qrY + brkPad + brkLen);
  // Bottom-Left
  doc.line(qrX + brkPad, qrY + qrH - brkPad, qrX + brkPad + brkLen, qrY + qrH - brkPad);
  doc.line(qrX + brkPad, qrY + qrH - brkPad, qrX + brkPad, qrY + qrH - brkPad - brkLen);
  // Bottom-Right
  doc.line(qrX + qrW - brkPad, qrY + qrH - brkPad, qrX + qrW - brkPad - brkLen, qrY + qrH - brkPad);
  doc.line(qrX + qrW - brkPad, qrY + qrH - brkPad, qrX + qrW - brkPad, qrY + qrH - brkPad - brkLen);

  try {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(orderId || "SportXClub-Pass")}`;
    const res = await fetch(qrUrl);
    if (res.ok) {
      if (typeof window !== "undefined") {
        const blob = await res.blob();
        const base64 = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(blob);
        });
        doc.addImage(base64, "PNG", qrX + 3.0, qrY + 3.0, qrW - 6.0, qrH - 6.0);
      } else {
        const arrayBuffer = await res.arrayBuffer();
        const base64 = `data:image/png;base64,${Buffer.from(arrayBuffer).toString("base64")}`;
        doc.addImage(base64, "PNG", qrX + 3.0, qrY + 3.0, qrW - 6.0, qrH - 6.0);
      }
    }
  } catch (e) {
    console.warn("QR embedding in PDF:", e);
  }

  // 9. Footer Note
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text("Please present this PDF Pass at the gate entry desk on match day.", badgeCx, cardY + cardH - 8, { align: "center" });

  return doc;
}

/**
 * Helper to download PDF directly in browser
 */
export async function downloadSportXPassPdf(passData, filename = "SportXClub_Pass.pdf") {
  const doc = await generateSportXPassDoc(passData);
  doc.save(filename);
}
