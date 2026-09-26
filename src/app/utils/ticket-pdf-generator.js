import { jsPDF } from "jspdf";

/**
 * Generates an exact 1:1 match of the SportX Match Pass Ticket in PDF
 * Includes vector checkmark badge, venue & sport badge, 2x2 detail cards
 * with vector icons (Calendar, Clock, User silhouette, Rupee ₹),
 * authentic ticket notch cutouts, bracketed QR container, and multi-bar barcode.
 */
export async function generateSportXPassDoc({
  orderId = "SPX-PASS",
  userName = "SportX Player",
  turfName = "Elite Sports Arena",
  sport = "Cricket",
  date = "2026-09-25",
  timeSlot = "06:00 PM - 07:00 PM",
  amount = 0,
}) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // Soft Background
  doc.setFillColor(248, 250, 252); // #F8FAFC
  doc.rect(0, 0, 210, 297, "F");

  // Center Ticket Card Container
  const cardW = 140;
  const cardH = 186;
  const cardX = (210 - cardW) / 2; // 35mm
  const cardY = (297 - cardH) / 2; // 55.5mm

  // Outer Emerald Accent Frame / Card
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(5, 150, 105); // #059669
  doc.setLineWidth(0.9);
  doc.roundedRect(cardX, cardY, cardW, cardH, 8, 8, "FD");

  // 1. Header: Green Checkmark Circle Badge
  const badgeCx = cardX + cardW / 2;
  const badgeCy = cardY + 16;
  const badgeR = 6.5;

  doc.setFillColor(236, 253, 245); // #ECFDF5
  doc.setDrawColor(16, 185, 129); // #10B981
  doc.setLineWidth(0.6);
  doc.circle(badgeCx, badgeCy, badgeR, "FD");

  // Crisp Vector Checkmark
  doc.setDrawColor(5, 150, 105);
  doc.setLineWidth(0.85);
  doc.line(badgeCx - 2.8, badgeCy - 0.2, badgeCx - 0.8, badgeCy + 2.0);
  doc.line(badgeCx - 0.8, badgeCy + 2.0, badgeCx + 3.2, badgeCy - 2.2);

  // Payment Successful Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13.5);
  doc.setTextColor(5, 150, 105);
  doc.text("Payment Successful!", badgeCx, cardY + 29, { align: "center" });

  // SPORTX PASS
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12.5);
  doc.setTextColor(15, 23, 42); // #0F172A
  doc.text("SPORTX PASS", badgeCx, cardY + 36, { align: "center" });

  // Official Entry Ticket
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184); // #94A3B8
  doc.text("Official Entry Ticket", badgeCx, cardY + 41, { align: "center" });

  // 2. Venue & Sport Header Row
  const venueY = cardY + 51;
  const colLeft = cardX + 10;
  const colRight = cardX + cardW - 10;

  // Vector Location Pin Icon
  const pinX = colLeft + 2.5;
  const pinY = venueY - 1.2;
  doc.setFillColor(100, 116, 139); // #64748B
  doc.setDrawColor(100, 116, 139);
  doc.circle(pinX, pinY - 1.2, 1.4, "F");
  doc.triangle(pinX - 1.2, pinY - 0.8, pinX + 1.2, pinY - 0.8, pinX, pinY + 1.4, "F");
  doc.setFillColor(255, 255, 255);
  doc.circle(pinX, pinY - 1.2, 0.6, "F");

  // Venue Name
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(10.5);
  doc.setFont("helvetica", "bold");
  const displayVenue = String(turfName || "SportX Arena");
  doc.text(displayVenue.length > 26 ? displayVenue.slice(0, 24) + "..." : displayVenue, colLeft + 7, venueY);

  // Sport Badge Pill
  const sportName = String(sport || "Cricket").toUpperCase();
  const sportPillW = Math.max(26, sportName.length * 2.4 + 10);
  const sportPillH = 6.5;
  const sportPillX = colRight - sportPillW;
  const sportPillY = venueY - 4.8;
  doc.setFillColor(241, 245, 249); // #F1F5F9
  doc.setDrawColor(226, 232, 240); // #E2E8F0
  doc.setLineWidth(0.4);
  doc.roundedRect(sportPillX, sportPillY, sportPillW, sportPillH, 3.25, 3.25, "FD");

  doc.setTextColor(51, 65, 85); // #334155
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.text(sportName, sportPillX + sportPillW / 2, sportPillY + 4.3, { align: "center" });

  // 3. 2×2 Detail Cards Grid
  const gridY = cardY + 58;
  const boxW = 57;
  const boxH = 16;
  const col1X = cardX + 10;
  const col2X = cardX + cardW - 10 - boxW;

  const drawDetailCard = (bx, by, iconType, label, value) => {
    // Card Box
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.4);
    doc.roundedRect(bx, by, boxW, boxH, 3, 3, "FD");

    // Icon Container
    const ix = bx + 2.5;
    const iy = by + 2.5;
    const isz = 11;
    doc.setFillColor(236, 253, 245);
    doc.setDrawColor(167, 243, 208);
    doc.setLineWidth(0.3);
    doc.roundedRect(ix, iy, isz, isz, 2.2, 2.2, "FD");

    // Vector Icon
    doc.setDrawColor(5, 150, 105);
    doc.setFillColor(5, 150, 105);

    if (iconType === "calendar") {
      doc.setLineWidth(0.5);
      doc.roundedRect(ix + 2.5, iy + 3.0, 6.0, 5.5, 0.6, 0.6, "D");
      doc.line(ix + 2.5, iy + 4.8, ix + 8.5, iy + 4.8);
      doc.line(ix + 4.0, iy + 2.0, ix + 4.0, iy + 3.0);
      doc.line(ix + 7.0, iy + 2.0, ix + 7.0, iy + 3.0);
      doc.circle(ix + 4.2, iy + 6.3, 0.35, "F");
      doc.circle(ix + 6.8, iy + 6.3, 0.35, "F");
    } else if (iconType === "clock") {
      doc.setLineWidth(0.5);
      doc.circle(ix + 5.5, iy + 5.5, 3.2, "D");
      doc.line(ix + 5.5, iy + 5.5, ix + 5.5, iy + 3.6);
      doc.line(ix + 5.5, iy + 5.5, ix + 7.2, iy + 5.5);
    } else if (iconType === "user") {
      doc.circle(ix + 5.5, iy + 4.2, 1.6, "FD");
      doc.setLineWidth(0.6);
      doc.line(ix + 3.0, iy + 8.6, ix + 4.3, iy + 6.9);
      doc.line(ix + 4.3, iy + 6.9, ix + 6.7, iy + 6.9);
      doc.line(ix + 6.7, iy + 6.9, ix + 8.0, iy + 8.6);
    } else if (iconType === "rupee") {
      doc.setLineWidth(0.65);
      doc.line(ix + 3.6, iy + 3.4, ix + 7.4, iy + 3.4);
      doc.line(ix + 3.6, iy + 4.8, ix + 6.8, iy + 4.8);
      doc.line(ix + 4.8, iy + 3.4, ix + 4.8, iy + 6.2);
      doc.line(ix + 4.8, iy + 6.2, ix + 6.6, iy + 6.2);
      doc.line(ix + 5.0, iy + 6.2, ix + 7.4, iy + 8.6);
    }

    // Label
    doc.setTextColor(148, 163, 184); // #94A3B8
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.text(label, bx + 16, by + 5.8);

    // Value
    doc.setTextColor(15, 23, 42); // #0F172A
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    const valStr = String(value || "");
    doc.text(valStr.length > 20 ? valStr.slice(0, 18) + "..." : valStr, bx + 16, by + 11.6);
  };

  const formattedAmount = `INR ${Number(amount || 0).toLocaleString("en-IN")}`;

  // Row 1
  drawDetailCard(col1X, gridY, "calendar", "Date:", String(date || ""));
  drawDetailCard(col2X, gridY, "clock", "Time Slot:", String(timeSlot || ""));

  // Row 2
  const row2Y = gridY + 19;
  drawDetailCard(col1X, row2Y, "user", "Pass Holder:", String(userName || "SportX Player"));
  drawDetailCard(col2X, row2Y, "rupee", "Amount Paid:", formattedAmount);

  // 4. Perforated Notch Tear Line
  const tearY = cardY + 102;
  const notchR = 4.5;

  // Inward Semicircular Cutouts (filled with background slate)
  doc.setFillColor(248, 250, 252);
  doc.circle(cardX, tearY, notchR, "F");
  doc.circle(cardX + cardW, tearY, notchR, "F");

  // Emerald Notch Arcs (Matching outer frame)
  doc.setDrawColor(5, 150, 105);
  doc.setLineWidth(0.9);
  doc.ellipse(cardX, tearY, notchR, notchR, "S", 270, 90);
  doc.ellipse(cardX + cardW, tearY, notchR, notchR, "S", 90, 270);

  // Dashed Perforation Line
  doc.setDrawColor(203, 213, 225); // #CBD5E1
  doc.setLineWidth(0.5);
  doc.setLineDashPattern([1.5, 1.5], 0);
  doc.line(cardX + notchR + 2, tearY, cardX + cardW - notchR - 2, tearY);
  doc.setLineDashPattern([], 0);

  // 5. Bottom Stub: Left Order ID + Right Bracketed QR Code
  const stubY = tearY + 10;

  // Credit Card Mini Icon
  const ccX = col1X;
  const ccY = stubY;
  doc.setDrawColor(5, 150, 105);
  doc.setLineWidth(0.4);
  doc.roundedRect(ccX, ccY, 4.5, 3.2, 0.4, 0.4, "D");
  doc.line(ccX, ccY + 1.1, ccX + 4.5, ccY + 1.1);

  // Cashfree Order ID Label
  doc.setTextColor(100, 116, 139);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.text("Cashfree Order ID:", ccX + 6, stubY + 2.5);

  // Cashfree Order ID Value
  doc.setTextColor(15, 23, 42);
  doc.setFont("courier", "bold");
  doc.setFontSize(8.5);
  const orderIdText = String(orderId || "SPX-PASS");
  doc.text(orderIdText, ccX, stubY + 9.5);

  // QR Code Container on Right
  const qrW = 38;
  const qrH = 38;
  const qrX = colRight - qrW;
  const qrY = stubY - 2;

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.roundedRect(qrX, qrY, qrW, qrH, 3.5, 3.5, "FD");

  // 4 Emerald Corner Scan Brackets
  doc.setDrawColor(5, 150, 105);
  doc.setLineWidth(0.75);
  const brkLen = 4.5;
  const brkPad = 1.6;
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

  // Fetch QR base64
  try {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(orderIdText)}`;
    const res = await fetch(qrUrl);
    if (res.ok) {
      if (typeof window !== "undefined") {
        const blob = await res.blob();
        const base64 = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(blob);
        });
        doc.addImage(base64, "PNG", qrX + 3.5, qrY + 3.5, qrW - 7, qrH - 7);
      } else {
        const arrayBuffer = await res.arrayBuffer();
        const base64 = `data:image/png;base64,${Buffer.from(arrayBuffer).toString("base64")}`;
        doc.addImage(base64, "PNG", qrX + 3.5, qrY + 3.5, qrW - 7, qrH - 7);
      }
    }
  } catch (e) {
    console.warn("[PDF Ticket] QR fetch warning:", e);
  }

  // 6. Realistic Multi-Weight Vector Barcode Strip
  const barY = cardY + 154;
  const barH = 8.5;
  const barTotalW = 60;
  const barStartX = cardX + (cardW - barTotalW) / 2;

  const pattern = [
    2, 1, 3, 1, 1, 2, 4, 1, 2, 1, 3, 2, 1, 1, 4, 1, 2, 2, 1, 3, 1, 2, 1, 4, 1, 2, 1, 3, 2, 1, 1, 4, 1, 2, 1, 3, 1, 2,
  ];
  let curX = barStartX;
  doc.setFillColor(15, 23, 42); // #0F172A

  for (let i = 0; i < pattern.length; i++) {
    const w = pattern[i] * 0.38;
    if (i % 2 === 0) {
      doc.rect(curX, barY, w, barH, "F");
    }
    curX += w + 0.35;
    if (curX > barStartX + barTotalW) break;
  }

  // Scan text below barcode
  doc.setTextColor(100, 116, 139);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.text("SCAN AT RECEPTION / GATE FOR ENTRY", badgeCx, cardY + 168.5, { align: "center" });

  return doc;
}

/**
 * Convenience helper to download the PDF in browser
 */
export async function downloadSportXPassPdf(passData, filename) {
  const doc = await generateSportXPassDoc(passData);
  const saveName = filename || `SportXClub_Pass_${passData.orderId || "ticket"}.pdf`;
  doc.save(saveName);
  return doc;
}
