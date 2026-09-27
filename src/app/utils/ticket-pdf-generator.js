import { jsPDF } from "jspdf";

/**
 * Helper to parse and consolidate single or multiple time slots.
 */
export function parseBookingSlots(
  timeSlot = ""
) {
  let startTime = "Scheduled Time";
  let endTime = "Scheduled End";
  let duration = "1 Hour";
  let slotCount = 1;
  let slotList = [];

  let displaySlotText = String(
    timeSlot || "Scheduled Time"
  ).trim();

  if (!timeSlot) {
    return {
      startTime,
      endTime,
      duration,
      slotCount,
      slotList,
      displaySlotText,
      rangeText: displaySlotText,
    };
  }

  const str =
    String(timeSlot).trim();

  if (
    str.includes(",") ||
    str.includes(";")
  ) {
    const slots = str
      .split(/[,;]+/)
      .map((s) => s.trim())
      .filter(Boolean);

    slotList = slots;
    slotCount = slots.length;

    const parseSingle = (
      singleStr
    ) => {
      const match =
        singleStr.match(
          /(\d{1,2}(?::\d{2})?\s*(?:AM|PM)?)\s*[-–—to]+\s*(\d{1,2}(?::\d{2})?\s*(?:AM|PM)?)/i
        );

      if (match) {
        return {
          start: match[1].trim(),
          end: match[2].trim(),
        };
      }

      return {
        start: singleStr,
        end: singleStr,
      };
    };

    const firstParsed =
      parseSingle(slots[0]);

    const lastParsed =
      parseSingle(
        slots[slots.length - 1]
      );

    startTime =
      firstParsed.start;

    endTime =
      lastParsed.end;

    duration =
      `${slotCount} ${slotCount === 1
        ? "Hour"
        : "Hours"
      }`;

    displaySlotText =
      slots.join(", ");

    return {
      startTime,
      endTime,
      duration,
      slotCount,
      slotList,
      displaySlotText,
      rangeText:
        `${startTime} – ${endTime}`,
    };
  }

  if (
    str.includes("-") ||
    str.includes("–") ||
    str.includes("—") ||
    str.includes("to")
  ) {
    const parts =
      str
        .split(/[-–—]|to/)
        .map((p) => p.trim());

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

  return {
    startTime,
    endTime,
    duration,
    slotCount,
    slotList,
    displaySlotText: str,
    rangeText:
      `${startTime} – ${endTime}`,
  };
}

function drawFootballIcon(
  doc,
  cx,
  cy,
  r = 2.1
) {
  doc.setDrawColor(
    15,
    23,
    42
  );

  doc.setFillColor(
    255,
    255,
    255
  );

  doc.setLineWidth(
    0.35
  );

  doc.circle(
    cx,
    cy,
    r,
    "FD"
  );

  doc.line(
    cx - r * 0.75,
    cy - r * 0.1,
    cx - r * 0.15,
    cy - r * 0.55
  );

  doc.line(
    cx - r * 0.15,
    cy - r * 0.55,
    cx + r * 0.55,
    cy - r * 0.3
  );

  doc.line(
    cx + r * 0.55,
    cy - r * 0.3,
    cx + r * 0.7,
    cy + r * 0.45
  );

  doc.line(
    cx + r * 0.7,
    cy + r * 0.45,
    cx + r * 0.1,
    cy + r * 0.8
  );

  doc.line(
    cx + r * 0.1,
    cy + r * 0.8,
    cx - r * 0.5,
    cy + r * 0.45
  );

  doc.line(
    cx - r * 0.5,
    cy + r * 0.45,
    cx - r * 0.75,
    cy - r * 0.1
  );
}

function drawCheckBadge(
  doc,
  cx,
  cy
) {
  const r = 9;

  doc.setFillColor(
    255,
    255,
    255
  );

  doc.setDrawColor(
    226,
    232,
    240
  );

  doc.setLineWidth(
    0.35
  );

  doc.circle(
    cx,
    cy,
    r,
    "FD"
  );

  doc.setDrawColor(
    16,
    185,
    129
  );

  doc.setLineWidth(
    0.75
  );

  doc.circle(
    cx,
    cy,
    r - 2,
    "S"
  );

  doc.setLineWidth(
    1.0
  );

  doc.line(
    cx - 3.1,
    cy - 0.1,
    cx - 0.7,
    cy + 2.7
  );

  doc.line(
    cx - 0.7,
    cy + 2.7,
    cx + 4.0,
    cy - 3.0
  );
}

function drawMetricBox(
  doc,
  bx,
  by,
  bw,
  bh,
  label,
  value
) {
  doc.setFillColor(
    255,
    255,
    255
  );

  doc.setDrawColor(
    15,
    23,
    42
  );

  doc.setLineWidth(
    0.45
  );

  doc.roundedRect(
    bx,
    by,
    bw,
    bh,
    3.5,
    3.5,
    "FD"
  );

  doc.setFont(
    "helvetica",
    "normal"
  );

  doc.setFontSize(8);

  doc.setTextColor(
    71,
    85,
    105
  );

  doc.text(
    label,
    bx + bw / 2,
    by + 6.3,
    {
      align: "center",
    }
  );

  const val =
    String(value ?? "");

  let fontSize = 9.2;

  if (val.length > 19) {
    fontSize = 7.5;
  } else if (val.length > 14) {
    fontSize = 8.2;
  }

  doc.setFont(
    "helvetica",
    "bold"
  );

  doc.setFontSize(
    fontSize
  );

  doc.setTextColor(
    15,
    23,
    42
  );

  doc.text(
    val,
    bx + bw / 2,
    by + 15.0,
    {
      align: "center",
    }
  );
}

function drawOfficialPassPill(
  doc,
  x,
  y
) {
  const w = 38;
  const h = 8;

  doc.setFillColor(
    255,
    255,
    255
  );

  doc.setDrawColor(
    15,
    23,
    42
  );

  doc.setLineWidth(
    0.4
  );

  doc.roundedRect(
    x,
    y,
    w,
    h,
    4,
    4,
    "FD"
  );

  doc.setFont(
    "helvetica",
    "bold"
  );

  doc.setFontSize(
    7.2
  );

  doc.setTextColor(
    15,
    23,
    42
  );

  doc.text(
    "OFFICIAL PASS",
    x + 5,
    y + 5.4
  );

  doc.setFillColor(
    16,
    185,
    129
  );

  doc.circle(
    x + w - 5,
    y + h / 2,
    1.45,
    "F"
  );
}

function drawQrBrackets(
  doc,
  x,
  y,
  size
) {
  doc.setDrawColor(
    15,
    23,
    42
  );

  doc.setLineWidth(
    1.0
  );

  const pad = 1.4;
  const len = 6.2;

  // Top-left
  doc.line(
    x + pad,
    y + pad,
    x + pad + len,
    y + pad
  );

  doc.line(
    x + pad,
    y + pad,
    x + pad,
    y + pad + len
  );

  // Top-right
  doc.line(
    x + size - pad,
    y + pad,
    x + size - pad - len,
    y + pad
  );

  doc.line(
    x + size - pad,
    y + pad,
    x + size - pad,
    y + pad + len
  );

  // Bottom-left
  doc.line(
    x + pad,
    y + size - pad,
    x + pad + len,
    y + size - pad
  );

  doc.line(
    x + pad,
    y + size - pad,
    x + pad,
    y + size - pad - len
  );

  // Bottom-right
  doc.line(
    x + size - pad,
    y + size - pad,
    x + size - pad - len,
    y + size - pad
  );

  doc.line(
    x + size - pad,
    y + size - pad,
    x + size - pad,
    y + size - pad - len
  );
}

/**
 * Generates the SportXClub PDF ticket using the same structure
 * as the WhatsApp reference ticket.
 */
export async function generateSportXPassDoc({
  orderId =
  "order_spx_1790347058513_950",

  userName =
  "Ujjwal Bramhnote",

  userPhone =
  "7410507803",

  turfName =
  "MODI PUBLIC GROUND",

  location =
  "Nagpur",

  sport =
  "Football",

  date =
  "25 Sep 2026",

  timeSlot =
  "10:00 PM - 11:00 PM",

  amount = 1,

  paymentDate =
  "25 Sep 2026, 08:30 PM",
}) {
  const {
    rangeText,
  } =
    parseBookingSlots(
      timeSlot
    );

  const doc =
    new jsPDF({
      orientation:
        "portrait",

      unit:
        "mm",

      format:
        "a4",
    });

  // ============================================================
  // 1. PAGE BACKGROUND
  // ============================================================

  doc.setFillColor(
    159,
    178,
    199
  );

  doc.rect(
    0,
    0,
    210,
    297,
    "F"
  );

  // ============================================================
  // 2. LARGE TICKET
  // ============================================================

  const cardW = 176;
  const cardH = 248;

  const cardX =
    (210 - cardW) / 2;

  const cardY =
    (297 - cardH) / 2;

  // Shadow
  doc.setFillColor(
    133,
    153,
    175
  );

  doc.roundedRect(
    cardX + 0.8,
    cardY + 1.3,
    cardW,
    cardH,
    7,
    7,
    "F"
  );

  // White ticket + navy border
  doc.setFillColor(
    255,
    255,
    255
  );

  doc.setDrawColor(
    15,
    42,
    67
  );

  doc.setLineWidth(
    1.15
  );

  doc.roundedRect(
    cardX,
    cardY,
    cardW,
    cardH,
    7,
    7,
    "FD"
  );

  const centerX =
    cardX + cardW / 2;

  // ============================================================
  // 3. SUCCESS BADGE
  // ============================================================

  drawCheckBadge(
    doc,
    centerX,
    cardY
  );

  // ============================================================
  // 4. HEADER
  // ============================================================

  doc.setFont(
    "helvetica",
    "bold"
  );

  doc.setFontSize(
    15.5
  );

  doc.setTextColor(
    16,
    185,
    129
  );

  doc.text(
    "Payment Successful!",
    centerX,
    cardY + 18,
    {
      align: "center",
    }
  );

  // Venue
  doc.setFont(
    "helvetica",
    "bold"
  );

  doc.setFontSize(
    14.2
  );

  doc.setTextColor(
    15,
    23,
    42
  );

  const venue =
    String(
      turfName ||
      "MODI PUBLIC GROUND"
    ).toUpperCase();

  doc.text(
    venue.length > 28
      ? venue.slice(0, 27) + "..."
      : venue,
    centerX,
    cardY + 27,
    {
      align: "center",
    }
  );

  // Location
  doc.setFont(
    "helvetica",
    "normal"
  );

  doc.setFontSize(
    10.5
  );

  doc.setTextColor(
    71,
    85,
    105
  );

  doc.text(
    String(
      location || "Nagpur"
    ),
    centerX,
    cardY + 34.5,
    {
      align: "center",
    }
  );

  // Order ID
  doc.setFont(
    "courier",
    "normal"
  );

  doc.setFontSize(
    8.5
  );

  doc.setTextColor(
    100,
    116,
    139
  );

  doc.text(
    String(
      orderId ||
      "SportXClub-Pass"
    ),
    centerX,
    cardY + 41,
    {
      align: "center",
    }
  );

  // ============================================================
  // 5. SPORT PILL
  // ============================================================

  const sportUpper =
    String(
      sport || "Football"
    ).toUpperCase();

  const sportPillW =
    Math.max(
      42,
      Math.min(
        52,
        sportUpper.length *
        2.7 +
        17
      )
    );

  const sportPillH = 8.5;

  const sportPillX =
    centerX -
    sportPillW / 2;

  const sportPillY =
    cardY + 46.5;

  doc.setFillColor(
    255,
    255,
    255
  );

  doc.setDrawColor(
    15,
    23,
    42
  );

  doc.setLineWidth(
    0.45
  );

  doc.roundedRect(
    sportPillX,
    sportPillY,
    sportPillW,
    sportPillH,
    sportPillH / 2,
    sportPillH / 2,
    "FD"
  );

  drawFootballIcon(
    doc,
    sportPillX + 6,
    sportPillY +
    sportPillH / 2,
    2.0
  );

  doc.setFont(
    "helvetica",
    "bold"
  );

  doc.setFontSize(
    8.3
  );

  doc.setTextColor(
    15,
    23,
    42
  );

  doc.text(
    sportUpper,
    sportPillX + 11,
    sportPillY + 5.7
  );

  // ============================================================
  // 6. USER DETAILS
  // ============================================================

  doc.setFont(
    "helvetica",
    "bold"
  );

  doc.setFontSize(
    15.5
  );

  doc.setTextColor(
    15,
    23,
    42
  );

  doc.text(
    String(
      userName ||
      "SportX Player"
    ),
    centerX,
    cardY + 64,
    {
      align: "center",
    }
  );

  doc.setFont(
    "helvetica",
    "normal"
  );

  doc.setFontSize(
    10
  );

  doc.setTextColor(
    71,
    85,
    105
  );

  doc.text(
    `Mobile Number: ${userPhone || "-"
    }`,
    centerX,
    cardY + 71,
    {
      align: "center",
    }
  );

  // ============================================================
  // 7. GREEN DIVIDER
  // ============================================================

  const lineY =
    cardY + 78;

  doc.setDrawColor(
    16,
    185,
    129
  );

  doc.setLineWidth(
    0.45
  );

  doc.line(
    cardX + 12,
    lineY,
    centerX - 2.2,
    lineY
  );

  doc.line(
    centerX + 2.2,
    lineY,
    cardX + cardW - 12,
    lineY
  );

  doc.setFillColor(
    16,
    185,
    129
  );

  doc.circle(
    centerX,
    lineY,
    1.65,
    "F"
  );

  // ============================================================
  // 8. THREE METRIC BOXES
  // ============================================================

  const rowY =
    cardY + 86;

  const boxW = 51.5;
  const boxH = 22;
  const gap = 5;

  const totalW =
    boxW * 3 +
    gap * 2;

  const startX =
    cardX +
    (cardW - totalW) / 2;

  const formattedAmount =
    `₹${Number(
      amount || 0
    ).toLocaleString(
      "en-IN"
    )}`;

  const displaySlot =
    rangeText ||
    timeSlot ||
    "Scheduled Time";

  drawMetricBox(
    doc,
    startX,
    rowY,
    boxW,
    boxH,
    "Event Date:",
    String(date || "")
  );

  drawMetricBox(
    doc,
    startX + boxW + gap,
    rowY,
    boxW,
    boxH,
    "Event Time Slot:",
    String(displaySlot)
  );

  drawMetricBox(
    doc,
    startX +
    (boxW + gap) * 2,
    rowY,
    boxW,
    boxH,
    "Amount Paid:",
    formattedAmount
  );

  // ============================================================
  // 9. PERFORATED DIVIDER
  // ============================================================

  const tearY =
    cardY + 154;

  const notchR = 5.2;

  doc.setFillColor(
    159,
    178,
    199
  );

  doc.circle(
    cardX,
    tearY,
    notchR,
    "F"
  );

  doc.circle(
    cardX + cardW,
    tearY,
    notchR,
    "F"
  );

  doc.setDrawColor(
    203,
    213,
    225
  );

  doc.setLineWidth(
    0.45
  );

  doc.setLineDashPattern(
    [1.8, 1.7],
    0
  );

  doc.line(
    cardX + notchR + 2,
    tearY,
    cardX + cardW - notchR - 2,
    tearY
  );

  doc.setLineDashPattern(
    [],
    0
  );

  // Navy notch accents
  doc.setDrawColor(
    15,
    42,
    67
  );

  doc.setLineWidth(
    0.55
  );

  doc.line(
    cardX + 0.7,
    tearY - 5.2,
    cardX + 4.2,
    tearY - 1.7
  );

  doc.line(
    cardX + 0.7,
    tearY + 5.2,
    cardX + 4.2,
    tearY + 1.7
  );

  doc.line(
    cardX + cardW - 0.7,
    tearY - 5.2,
    cardX + cardW - 4.2,
    tearY - 1.7
  );

  doc.line(
    cardX + cardW - 0.7,
    tearY + 5.2,
    cardX + cardW - 4.2,
    tearY + 1.7
  );

  // ============================================================
  // 10. PAYMENT DATE
  // ============================================================

  const stubX =
    cardX + 12;

  const stubY =
    tearY + 16;

  doc.setFont(
    "helvetica",
    "normal"
  );

  doc.setFontSize(
    8.8
  );

  doc.setTextColor(
    71,
    85,
    105
  );

  doc.text(
    "Payment Date:",
    stubX,
    stubY
  );

  doc.setFont(
    "helvetica",
    "bold"
  );

  doc.setFontSize(
    9.2
  );

  doc.setTextColor(
    15,
    23,
    42
  );

  doc.text(
    String(
      paymentDate || ""
    ),
    stubX,
    stubY + 7.5
  );

  drawOfficialPassPill(
    doc,
    stubX,
    stubY + 17
  );

  // ============================================================
  // 11. QR CODE
  // ============================================================

  const qrSize = 50;

  const qrX =
    cardX +
    cardW -
    12 -
    qrSize;

  const qrY =
    tearY + 9;

  doc.setFillColor(
    255,
    255,
    255
  );

  doc.rect(
    qrX,
    qrY,
    qrSize,
    qrSize,
    "F"
  );

  drawQrBrackets(
    doc,
    qrX,
    qrY,
    qrSize
  );

  try {
    const qrUrl =
      `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=` +
      encodeURIComponent(
        orderId ||
        "SportXClub-Pass"
      );

    const res =
      await fetch(qrUrl);

    if (res.ok) {
      if (
        typeof window !==
        "undefined"
      ) {
        const blob =
          await res.blob();

        const base64 =
          await new Promise(
            (resolve) => {
              const reader =
                new FileReader();

              reader.onloadend =
                () =>
                  resolve(
                    reader.result
                  );

              reader.readAsDataURL(
                blob
              );
            }
          );

        doc.addImage(
          base64,
          "PNG",
          qrX + 5,
          qrY + 5,
          qrSize - 10,
          qrSize - 10
        );
      } else {
        const arrayBuffer =
          await res.arrayBuffer();

        const base64 =
          `data:image/png;base64,${Buffer.from(
            arrayBuffer
          ).toString("base64")}`;

        doc.addImage(
          base64,
          "PNG",
          qrX + 5,
          qrY + 5,
          qrSize - 10,
          qrSize - 10
        );
      }
    }
  } catch (e) {
    console.warn(
      "QR embedding in PDF:",
      e
    );
  }

  // ============================================================
  // 12. FOOTER
  // ============================================================

  doc.setFont(
    "helvetica",
    "normal"
  );

  doc.setFontSize(
    8.2
  );

  doc.setTextColor(
    71,
    85,
    105
  );

  doc.text(
    "Please present this PDF Pass at the gate entry desk on match day.",
    centerX,
    cardY + cardH - 10,
    {
      align: "center",
    }
  );

  return doc;
}

export async function downloadSportXPassPdf(
  passData,
  filename =
    "SportXClub_Pass.pdf"
) {
  const doc =
    await generateSportXPassDoc(
      passData
    );

  doc.save(filename);
}