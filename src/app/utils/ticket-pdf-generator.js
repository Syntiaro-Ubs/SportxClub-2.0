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
   * Opening is centered precisely where the checkmark passes through (approx 317° / -43°).
   * Spanning from -20° (340°) clockwise to 294°, leaving a clean 46° gap centered at 317°.
   */

  const startAngle = -20;
  const endAngle = 294;

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
   SPORT ICON (Cricket, Football, Tennis, Badminton, etc.)
============================================================ */

function drawSportIcon(doc, cx, cy, sport = "") {
  const s = String(sport || "").toLowerCase();

  if (s.includes("cricket")) {
    // ==========================================
    // CRICKET ICON: Classic Bat & Ball (🏏)
    // ==========================================
    doc.setDrawColor(...COLORS.text);
    doc.setLineWidth(0.7);
    // Bat Handle (angled at ~45 degrees, top-left)
    doc.line(cx - 2.4, cy - 2.5, cx - 1.1, cy - 1.2);

    // Bat Blade (willow body angled down-right)
    const p1 = { x: cx - 1.5, y: cy - 0.8 };
    const p2 = { x: cx - 0.8, y: cy - 1.5 };
    const p3 = { x: cx + 1.9, y: cy + 1.2 };
    const p4 = { x: cx + 1.2, y: cy + 1.9 };

    doc.setFillColor(...COLORS.text);
    doc.triangle(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y, "F");
    doc.triangle(p1.x, p1.y, p3.x, p3.y, p4.x, p4.y, "F");

    // Bat Toe (flat bottom edge)
    doc.setLineWidth(0.35);
    doc.line(p4.x, p4.y, p3.x, p3.y);

    // Spine crease reflection on bat
    doc.setDrawColor(...COLORS.white);
    doc.setLineWidth(0.25);
    doc.line(cx - 0.9, cy - 0.9, cx + 1.4, cy + 1.4);

    // Cricket Ball (filled circle at top-right)
    doc.setFillColor(...COLORS.text);
    doc.setDrawColor(...COLORS.text);
    doc.circle(cx + 1.8, cy - 1.4, 0.95, "FD");

    // White seam curve on cricket ball
    doc.setDrawColor(...COLORS.white);
    doc.setLineWidth(0.2);
    doc.line(cx + 1.2, cy - 1.6, cx + 2.4, cy - 1.2);

  } else if (s.includes("football") || s.includes("soccer")) {
    // ==========================================
    // FOOTBALL ICON: Classic Soccer Ball with Filled Pentagon (⚽)
    // ==========================================
    const r = 2.8;
    doc.setFillColor(...COLORS.white);
    doc.setDrawColor(...COLORS.text);
    doc.setLineWidth(0.35);
    doc.circle(cx, cy, r, "FD");

    // Central black pentagon
    const pR = 1.15;
    const p = [];
    for (let i = 0; i < 5; i++) {
      const a = (-90 + i * 72) * (Math.PI / 180);
      p.push({
        x: cx + pR * Math.cos(a),
        y: cy + pR * Math.sin(a),
      });
    }
    doc.setFillColor(...COLORS.text);
    doc.triangle(p[0].x, p[0].y, p[1].x, p[1].y, p[2].x, p[2].y, "F");
    doc.triangle(p[0].x, p[0].y, p[2].x, p[2].y, p[3].x, p[3].y, "F");
    doc.triangle(p[0].x, p[0].y, p[3].x, p[3].y, p[4].x, p[4].y, "F");

    // 5 radial seam lines
    doc.setDrawColor(...COLORS.text);
    doc.setLineWidth(0.35);
    for (let i = 0; i < 5; i++) {
      const a = (-90 + i * 72) * (Math.PI / 180);
      doc.line(p[i].x, p[i].y, cx + r * Math.cos(a), cy + r * Math.sin(a));
    }

  } else if (s.includes("tennis")) {
    // ==========================================
    // TENNIS ICON: Tennis Ball with curved seams (🎾)
    // ==========================================
    const r = 2.8;
    doc.setFillColor(...COLORS.white);
    doc.setDrawColor(...COLORS.text);
    doc.setLineWidth(0.35);
    doc.circle(cx, cy, r, "FD");

    doc.setDrawColor(...COLORS.text);
    doc.setLineWidth(0.35);
    // Left inward curved seam
    doc.line(cx - 1.6, cy - 2.1, cx - 0.9, cy);
    doc.line(cx - 0.9, cy, cx - 1.6, cy + 2.1);
    // Right inward curved seam
    doc.line(cx + 1.6, cy - 2.1, cx + 0.9, cy);
    doc.line(cx + 0.9, cy, cx + 1.6, cy + 2.1);

  } else if (s.includes("badminton")) {
    // ==========================================
    // BADMINTON ICON: Shuttlecock (🏸)
    // ==========================================
    doc.setFillColor(...COLORS.text);
    doc.setDrawColor(...COLORS.text);
    doc.setLineWidth(0.35);

    doc.circle(cx, cy + 1.8, 1.0, "FD");

    const p1 = { x: cx - 0.9, y: cy + 1.4 };
    const p2 = { x: cx - 2.3, y: cy - 2.0 };
    const p3 = { x: cx + 2.3, y: cy - 2.0 };
    const p4 = { x: cx + 0.9, y: cy + 1.4 };
    doc.setFillColor(...COLORS.white);
    doc.triangle(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y, "FD");
    doc.triangle(p1.x, p1.y, p3.x, p3.y, p4.x, p4.y, "FD");

    doc.line(cx, cy + 1.4, cx, cy - 2.0);
    doc.line(cx - 1.5, cy - 0.5, cx + 1.5, cy - 0.5);
    doc.line(cx - 1.9, cy - 1.2, cx + 1.9, cy - 1.2);

  } else if (s.includes("basketball")) {
    // ==========================================
    // BASKETBALL ICON (🏀)
    // ==========================================
    const r = 2.8;
    doc.setFillColor(...COLORS.white);
    doc.setDrawColor(...COLORS.text);
    doc.setLineWidth(0.35);
    doc.circle(cx, cy, r, "FD");

    doc.line(cx - r, cy, cx + r, cy);
    doc.line(cx, cy - r, cx, cy + r);
    doc.line(cx - 1.7, cy - 1.9, cx - 1.1, cy);
    doc.line(cx - 1.1, cy, cx - 1.7, cy + 1.9);
    doc.line(cx + 1.7, cy - 1.9, cx + 1.1, cy);
    doc.line(cx + 1.1, cy, cx + 1.7, cy + 1.9);

  } else {
    // Default Soccer Ball (⚽)
    const r = 2.8;
    doc.setFillColor(...COLORS.white);
    doc.setDrawColor(...COLORS.text);
    doc.setLineWidth(0.35);
    doc.circle(cx, cy, r, "FD");

    const pR = 1.15;
    const p = [];
    for (let i = 0; i < 5; i++) {
      const a = (-90 + i * 72) * (Math.PI / 180);
      p.push({
        x: cx + pR * Math.cos(a),
        y: cy + pR * Math.sin(a),
      });
    }
    doc.setFillColor(...COLORS.text);
    doc.triangle(p[0].x, p[0].y, p[1].x, p[1].y, p[2].x, p[2].y, "F");
    doc.triangle(p[0].x, p[0].y, p[2].x, p[2].y, p[3].x, p[3].y, "F");
    doc.triangle(p[0].x, p[0].y, p[3].x, p[3].y, p[4].x, p[4].y, "F");

    doc.setDrawColor(...COLORS.text);
    doc.setLineWidth(0.35);
    for (let i = 0; i < 5; i++) {
      const a = (-90 + i * 72) * (Math.PI / 180);
      doc.line(p[i].x, p[i].y, cx + r * Math.cos(a), cy + r * Math.sin(a));
    }
  }
}

function drawFootballIcon(doc, cx, cy) {
  drawSportIcon(doc, cx, cy, "football");
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

    if (typeof FileReader !== "undefined") {
      const blob = await response.blob();
      return await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => { resolve(reader.result); };
        reader.readAsDataURL(blob);
      });
    } else {
      const arrayBuffer = await response.arrayBuffer();
      return `data:image/png;base64,${Buffer.from(arrayBuffer).toString("base64")}`;
    }
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
    String(sport || "FOOTBALL")
      .toUpperCase();

  doc.setFont(
    "helvetica",
    "normal"
  );

  doc.setFontSize(10);

  const textW = doc.getTextWidth(sportText);
  const iconR = 2.8;
  const iconDiam = iconR * 2;
  const iconTextGap = 3.0;
  const padX = 5.5;

  const contentW = iconDiam + iconTextGap + textW;
  const pillW = Math.max(36, contentW + padX * 2);
  const pillH = 9.5;

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
    pillH / 2,
    pillH / 2,
    "FD"
  );

  const contentStartX = centerX - contentW / 2;
  const iconCx = contentStartX + iconR;
  const iconCy = pillY + pillH / 2;

  drawSportIcon(
    doc,
    iconCx,
    iconCy,
    sport
  );

  doc.setFont(
    "helvetica",
    "normal"
  );

  doc.setFontSize(10);

  doc.setTextColor(
    ...COLORS.text
  );

  const textX = contentStartX + iconDiam + iconTextGap;
  const textY = pillY + pillH / 2 + 1.2;

  doc.text(
    sportText,
    textX,
    textY
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

  if (str.includes(",") || str.includes(";")) {
    const slots = str.split(/[,;]+/).map((s) => s.trim()).filter(Boolean);
    slotList = slots;
    slotCount = slots.length;

    const parseSingle = (singleStr) => {
      const match = singleStr.match(/(d{1,2}(?::d{2})?s*(?:AM|PM)?)s*[-??????to]+s*(d{1,2}(?::d{2})?s*(?:AM|PM)?)/i);
      if (match) return { start: match[1].trim(), end: match[2].trim() };
      return { start: singleStr, end: singleStr };
    };

    const firstParsed = parseSingle(slots[0]);
    const lastParsed = parseSingle(slots[slots.length - 1]);
    startTime = firstParsed.start;
    endTime = lastParsed.end;
    duration = `${slotCount} ${slotCount === 1 ? "Hour" : "Hours"}`;
    displaySlotText = slots.join(", ");

    return { startTime, endTime, duration, slotCount, slotList, displaySlotText, rangeText: `${startTime} - ${endTime}` };
  }

  if (str.includes("-") || str.includes("to")) {
    const parts = str.split(/[-??????]|to/).map((p) => p.trim());
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

  return { startTime, endTime, duration, slotCount, slotList, displaySlotText: str, rangeText: `${startTime} - ${endTime}` };
}
