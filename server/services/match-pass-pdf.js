import { jsPDF } from "jspdf";

/* ============================================================
   COLORS
============================================================ */

const COLORS = {
  green: [16, 185, 129],
  navy: [15, 42, 67],
  text: [15, 23, 42],
  muted: [71, 85, 105],
  lightLine: [203, 213, 225],
  white: [255, 255, 255],
};

/* ============================================================
   SUCCESS CHECK ICON
   - White knockout behind icon
   - Border cannot pass through icon
   - Open green circle
   - Green check extends through opening
============================================================ */

function drawCheckBadge(doc, cx, cy) {
  const green = COLORS.green;

  const radius = 10.5;

  /* ----------------------------------------------------------
     IMPORTANT:
     White knockout circle.
     
     This hides the ticket border behind the icon.
     ---------------------------------------------------------- */

  doc.setFillColor(
    ...COLORS.white
  );

  doc.circle(
    cx,
    cy,
    radius + 2.2,
    "F"
  );

  /* ----------------------------------------------------------
     GREEN OPEN CIRCLE
     ---------------------------------------------------------- */

  doc.setDrawColor(
    ...green
  );

  doc.setLineWidth(1.15);

  if (
    typeof doc.setLineCap === "function"
  ) {
    doc.setLineCap(1);
  }

  const points = [];

  /*
   * Opening remains at the upper-right.
   */

  const startAngle = 8;
  const endAngle = 300;

  for (
    let angle = startAngle;
    angle <= endAngle;
    angle += 2
  ) {
    const radians =
      (angle * Math.PI) / 180;

    points.push({
      x:
        cx +
        radius *
        Math.cos(radians),

      y:
        cy +
        radius *
        Math.sin(radians),
    });
  }

  for (
    let i = 1;
    i < points.length;
    i++
  ) {
    doc.line(
      points[i - 1].x,
      points[i - 1].y,
      points[i].x,
      points[i].y
    );
  }

  /* ----------------------------------------------------------
     CHECK MARK
     ---------------------------------------------------------- */

  doc.setLineWidth(1.35);

  /* Short stroke */

  doc.line(
    cx - 4.7,
    cy - 0.5,
    cx - 1.0,
    cy + 3.1
  );

  /* Long stroke */

  doc.line(
    cx - 1.0,
    cy + 3.1,
    cx + 7.8,
    cy - 7.4
  );

  if (
    typeof doc.setLineCap === "function"
  ) {
    doc.setLineCap(0);
  }
}

/* ============================================================
   FOOTBALL ICON
============================================================ */

function drawFootballIcon(doc, cx, cy) {
  const r = 3;

  doc.setFillColor(
    ...COLORS.white
  );

  doc.setDrawColor(
    ...COLORS.text
  );

  doc.setLineWidth(0.35);

  doc.circle(
    cx,
    cy,
    r,
    "FD"
  );

  doc.line(
    cx - 2,
    cy - 0.5,
    cx - 0.7,
    cy - 2
  );

  doc.line(
    cx - 0.7,
    cy - 2,
    cx + 1.6,
    cy - 1.1
  );

  doc.line(
    cx + 1.6,
    cy - 1.1,
    cx + 2,
    cy + 1.3
  );

  doc.line(
    cx + 2,
    cy + 1.3,
    cx + 0.3,
    cy + 2.2
  );

  doc.line(
    cx + 0.3,
    cy + 2.2,
    cx - 1.8,
    cy + 1.2
  );
}

/* ============================================================
   CLEAN AMOUNT
============================================================ */

function cleanAmount(amount) {
  /*
   * Examples accepted:
   *
   * 1
   * "1"
   * "₹1"
   * "₹ 1"
   * "Rs. 1"
   * "INR 1"
   * "₹1.00"
   *
   * Result:
   *
   * 1
   */

  if (
    amount === null ||
    amount === undefined
  ) {
    return 0;
  }

  let value = String(amount);

  /* Remove currency text */

  value = value
    .replace(/₹/g, "")
    .replace(/INR/gi, "")
    .replace(/Rs\.?/gi, "")
    .replace(/rupees?/gi, "");

  /* Remove quotes */

  value = value
    .replace(/['"`]/g, "");

  /*
   * Keep only numbers and decimal.
   */

  value = value.replace(
    /[^0-9.]/g,
    ""
  );

  const number =
    Number(value);

  if (
    !Number.isFinite(number)
  ) {
    return 0;
  }

  return number;
}

/* ============================================================
   AMOUNT VALUE
============================================================ */

function drawAmountValue(
  doc,
  centerX,
  y,
  amount
) {
  const numericAmount =
    cleanAmount(amount);

  const numberText =
    Number.isInteger(
      numericAmount
    )
      ? String(numericAmount)
      : numericAmount.toFixed(2);

  doc.setFont(
    "helvetica",
    "normal"
  );

  doc.setFontSize(10);

  doc.setTextColor(
    ...COLORS.text
  );

  doc.text(
    `Rs. ${numberText}`,
    centerX,
    y,
    {
      align: "center",
    }
  );
}

/* ============================================================
   METRIC BOX
============================================================ */

function drawMetricBox(
  doc,
  x,
  y,
  width,
  height,
  label,
  value,
  isAmount = false
) {
  doc.setFillColor(
    ...COLORS.white
  );

  doc.setDrawColor(
    ...COLORS.text
  );

  doc.setLineWidth(0.35);

  doc.roundedRect(
    x,
    y,
    width,
    height,
    3.2,
    3.2,
    "FD"
  );

  /* Label */

  doc.setFont(
    "helvetica",
    "normal"
  );

  doc.setFontSize(8.5);

  doc.setTextColor(
    ...COLORS.muted
  );

  doc.text(
    label,
    x + width / 2,
    y + 7,
    {
      align: "center",
    }
  );

  /*
   * Amount gets special rendering.
   */

  if (isAmount) {
    drawAmountValue(
      doc,
      x + width / 2,
      y + 18,
      value
    );

    return;
  }

  /* Normal value */

  doc.setFont(
    "helvetica",
    "normal"
  );

  doc.setFontSize(9.5);

  doc.setTextColor(
    ...COLORS.text
  );

  doc.text(
    String(value),
    x + width / 2,
    y + 18,
    {
      align: "center",
    }
  );
}

/* ============================================================
   OFFICIAL PASS
============================================================ */

function drawOfficialPass(
  doc,
  x,
  y
) {
  const width = 40;
  const height = 9;

  doc.setFillColor(
    ...COLORS.white
  );

  doc.setDrawColor(
    ...COLORS.text
  );

  doc.setLineWidth(0.35);

  doc.roundedRect(
    x,
    y,
    width,
    height,
    4.5,
    4.5,
    "FD"
  );

  doc.setFont(
    "helvetica",
    "normal"
  );

  doc.setFontSize(8.5);

  doc.setTextColor(
    ...COLORS.text
  );

  doc.text(
    "OFFICIAL PASS",
    x + 6,
    y + 6
  );

  doc.setFillColor(
    ...COLORS.green
  );

  doc.circle(
    x + width - 6,
    y + height / 2,
    1.6,
    "F"
  );
}

/* ============================================================
   QR CORNERS
============================================================ */

function drawQrCorners(
  doc,
  x,
  y,
  size
) {
  const pad = 1.5;
  const length = 7;

  doc.setDrawColor(
    0,
    0,
    0
  );

  doc.setLineWidth(0.8);

  /* TOP LEFT */

  doc.line(
    x + pad,
    y + pad,
    x + pad + length,
    y + pad
  );

  doc.line(
    x + pad,
    y + pad,
    x + pad,
    y + pad + length
  );

  /* TOP RIGHT */

  doc.line(
    x + size - pad,
    y + pad,
    x + size - pad - length,
    y + pad
  );

  doc.line(
    x + size - pad,
    y + pad,
    x + size - pad,
    y + pad + length
  );

  /* BOTTOM LEFT */

  doc.line(
    x + pad,
    y + size - pad,
    x + pad + length,
    y + size - pad
  );

  doc.line(
    x + pad,
    y + size - pad,
    x + pad,
    y + size - pad - length
  );

  /* BOTTOM RIGHT */

  doc.line(
    x + size - pad,
    y + size - pad,
    x + size - pad - length,
    y + size - pad
  );

  doc.line(
    x + size - pad,
    y + size - pad,
    x + size - pad,
    y + size - pad - length
  );
}

/* ============================================================
   QR CODE
============================================================ */

async function getQrCode(
  orderId
) {
  try {
    const url =
      `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=` +
      encodeURIComponent(
        orderId
      );

    const response =
      await fetch(url);

    if (!response.ok) {
      return null;
    }

    const arrayBuffer = await response.arrayBuffer();
    return `data:image/png;base64,${Buffer.from(arrayBuffer).toString("base64")}`;
  } catch (error) {
    console.error(
      "QR generation failed:",
      error
    );

    return null;
  }
}

/* ============================================================
   MAIN PDF GENERATOR
============================================================ */

export async function generateSportXPassDoc({
  orderId =
  "TEST_1790513588793",

  userName =
  "Shri W",

  userPhone =
  "9876543210",

  turfName =
  "URBAN SPORTS HUB",

  location =
  "Koramangala, Bangalore",

  sport =
  "Box Cricket",

  date =
  "2026-09-26",

  timeSlot =
  "06:00 PM - 07:00 PM",

  amount = 1,

  paymentDate =
  "27 Sep 2026, 06:41 pm",
}) {
  /* ==========================================================
     PAGE
  ========================================================== */

  const PAGE_WIDTH = 210;
  const PAGE_HEIGHT = 280;

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: [
      PAGE_WIDTH,
      PAGE_HEIGHT,
    ],
  });

  /* ==========================================================
     WHITE PAGE
  ========================================================== */

  doc.setFillColor(
    ...COLORS.white
  );

  doc.rect(
    0,
    0,
    PAGE_WIDTH,
    PAGE_HEIGHT,
    "F"
  );

  /* ==========================================================
     TICKET
  ========================================================== */

  const cardX = 10;
  const cardY = 10;

  const cardW = 190;
  const cardH = 260;

  const centerX =
    cardX +
    cardW / 2;

  /* ==========================================================
     MAIN BORDER
  ========================================================== */

  doc.setFillColor(
    ...COLORS.white
  );

  doc.setDrawColor(
    ...COLORS.navy
  );

  doc.setLineWidth(0.35);

  doc.roundedRect(
    cardX,
    cardY,
    cardW,
    cardH,
    7,
    7,
    "FD"
  );

  /*
   * IMPORTANT:
   *
   * The border is drawn first.
   *
   * drawCheckBadge() then places a white
   * knockout over this border and draws
   * the green icon.
   */

  drawCheckBadge(
    doc,
    centerX,
    cardY + 4
  );

  /* ==========================================================
     PAYMENT SUCCESSFUL
  ========================================================== */

  doc.setFont(
    "helvetica",
    "normal"
  );

  doc.setFontSize(17);

  doc.setTextColor(
    ...COLORS.green
  );

  doc.text(
    "Payment Successful!",
    centerX,
    cardY + 29,
    {
      align: "center",
    }
  );

  /* ==========================================================
     TURF NAME
  ========================================================== */

  doc.setFont(
    "helvetica",
    "bold"
  );

  doc.setFontSize(17);

  doc.setTextColor(
    ...COLORS.text
  );

  doc.text(
    String(turfName)
      .toUpperCase(),
    centerX,
    cardY + 47,
    {
      align: "center",
    }
  );

  /* ==========================================================
     LOCATION
  ========================================================== */

  doc.setFont(
    "helvetica",
    "normal"
  );

  doc.setFontSize(13);

  doc.text(
    String(location),
    centerX,
    cardY + 56,
    {
      align: "center",
    }
  );

  /* ==========================================================
     ORDER ID
  ========================================================== */

  doc.setFontSize(9.5);

  doc.text(
    String(orderId),
    centerX,
    cardY + 65,
    {
      align: "center",
    }
  );

  /* ==========================================================
     SPORT PILL
  ========================================================== */

  const sportText =
    String(sport)
      .toUpperCase();

  const pillW = 61;
  const pillH = 10;

  const pillX =
    centerX -
    pillW / 2;

  const pillY =
    cardY + 73;

  doc.setFillColor(
    ...COLORS.white
  );

  doc.setDrawColor(
    ...COLORS.text
  );

  doc.setLineWidth(0.35);

  doc.roundedRect(
    pillX,
    pillY,
    pillW,
    pillH,
    5,
    5,
    "FD"
  );

  drawFootballIcon(
    doc,
    pillX + 8,
    pillY + 5
  );

  doc.setFontSize(10.5);

  doc.text(
    sportText,
    pillX + 14,
    pillY + 6.7
  );

  /* ==========================================================
     USER NAME
  ========================================================== */

  doc.setFontSize(16);

  doc.text(
    String(userName),
    centerX,
    cardY + 101,
    {
      align: "center",
    }
  );

  /* ==========================================================
     MOBILE
  ========================================================== */

  doc.setFontSize(12);

  doc.text(
    `Mobile Number: ${userPhone}`,
    centerX,
    cardY + 110,
    {
      align: "center",
    }
  );

  /* ==========================================================
     DIVIDER
  ========================================================== */

  const dividerY =
    cardY + 122;

  doc.setDrawColor(
    ...COLORS.lightLine
  );

  doc.setLineWidth(0.35);

  doc.line(
    cardX + 43,
    dividerY,
    centerX - 4,
    dividerY
  );

  doc.line(
    centerX + 4,
    dividerY,
    cardX + cardW - 43,
    dividerY
  );

  doc.setFillColor(
    ...COLORS.green
  );

  doc.circle(
    centerX,
    dividerY,
    1.8,
    "F"
  );

  /* ==========================================================
     METRIC BOXES
  ========================================================== */

  const boxesY =
    cardY + 132;

  const boxH = 27;
  const boxW = 58;
  const gap = 4;

  const totalWidth =
    boxW * 3 +
    gap * 2;

  const boxesStart =
    centerX -
    totalWidth / 2;

  /* EVENT DATE */

  drawMetricBox(
    doc,
    boxesStart,
    boxesY,
    boxW,
    boxH,
    "Event Date:",
    date
  );

  /* EVENT TIME */

  drawMetricBox(
    doc,
    boxesStart +
    boxW +
    gap,
    boxesY,
    boxW,
    boxH,
    "Event Time Slot:",
    timeSlot
  );

  /* AMOUNT */

  drawMetricBox(
    doc,
    boxesStart +
    (boxW + gap) * 2,
    boxesY,
    boxW,
    boxH,
    "Amount Paid:",
    amount,
    true
  );

  /* ==========================================================
     PERFORATION
  ========================================================== */

  const tearY =
    cardY + 169;

  /*
   * White notches
   */

  doc.setFillColor(
    ...COLORS.white
  );

  doc.circle(
    cardX,
    tearY,
    5.5,
    "F"
  );

  doc.circle(
    cardX + cardW,
    tearY,
    5.5,
    "F"
  );

  /*
   * Dashed separator
   */

  doc.setDrawColor(
    ...COLORS.lightLine
  );

  doc.setLineWidth(0.3);

  doc.setLineDashPattern(
    [1.8, 1.8],
    0
  );

  doc.line(
    cardX + 7,
    tearY,
    cardX + cardW - 7,
    tearY
  );

  doc.setLineDashPattern(
    [],
    0
  );

  /*
   * Side notch lines
   */

  doc.setDrawColor(
    ...COLORS.navy
  );

  doc.setLineWidth(0.3);

  /* LEFT */

  doc.line(
    cardX,
    tearY - 5.5,
    cardX + 5,
    tearY
  );

  doc.line(
    cardX,
    tearY + 5.5,
    cardX + 5,
    tearY
  );

  /* RIGHT */

  doc.line(
    cardX + cardW,
    tearY - 5.5,
    cardX + cardW - 5,
    tearY
  );

  doc.line(
    cardX + cardW,
    tearY + 5.5,
    cardX + cardW - 5,
    tearY
  );

  /* ==========================================================
     LOWER SECTION
  ========================================================== */

  const lowerY =
    cardY + 194;

  /* PAYMENT DATE */

  doc.setFont(
    "helvetica",
    "normal"
  );

  doc.setFontSize(9.5);

  doc.setTextColor(
    ...COLORS.muted
  );

  doc.text(
    "Payment Date:",
    cardX + 12,
    lowerY
  );

  doc.setFontSize(10.5);

  doc.setTextColor(
    ...COLORS.text
  );

  doc.text(
    String(paymentDate),
    cardX + 12,
    lowerY + 9
  );

  /* ==========================================================
     OFFICIAL PASS
  ========================================================== */

  drawOfficialPass(
    doc,
    cardX + 12,
    cardY + 222
  );

  /* ==========================================================
     QR
  ========================================================== */

  const qrSize = 57;

  const qrX =
    cardX +
    cardW -
    qrSize -
    12;

  const qrY =
    cardY + 183;

  drawQrCorners(
    doc,
    qrX,
    qrY,
    qrSize
  );

  const qrImage =
    await getQrCode(
      orderId
    );

  if (qrImage) {
    try {
      doc.addImage(
        qrImage,
        "PNG",
        qrX + 5,
        qrY + 5,
        qrSize - 10,
        qrSize - 10
      );
    } catch (error) {
      console.error(
        "Unable to add QR:",
        error
      );
    }
  }

  /* ==========================================================
     FOOTER
  ========================================================== */

  doc.setFont(
    "helvetica",
    "normal"
  );

  doc.setFontSize(8.8);

  doc.setTextColor(
    ...COLORS.muted
  );

  doc.text(
    "Please present this PDF Pass at the gate entry desk on match day.",
    centerX,
    cardY + 249,
    {
      align: "center",
    }
  );

  return doc;
}

/* ============================================================
   BACKEND EMAIL COMPATIBILITY WRAPPER
   ============================================================ */
export async function generatePassPdfBuffer({
  bookingId,
  userName,
  userPhone,
  turfName,
  sport,
  bookingDate,
  timeSlot,
  amountPaid,
  turfLocation,
  bookingCreatedAt,
}) {
  const doc = await generateSportXPassDoc({
    orderId: bookingId,
    userName,
    userPhone,
    turfName,
    location: turfLocation,
    sport,
    date: bookingDate,
    timeSlot,
    amount: amountPaid,
    paymentDate: bookingCreatedAt,
  });

  const arrayBuffer = doc.output("arraybuffer");
  return Buffer.from(arrayBuffer);
}

/* ============================================================
   DOWNLOAD
============================================================ */

export async function downloadSportXPassPdf(
  passData,
  filename = "SportXClub_Pass.pdf"
) {
  const doc =
    await generateSportXPassDoc(
      passData
    );

  doc.save(
    filename
  );
}