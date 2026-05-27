if (typeof document !== "undefined") {
  void import("./style.css");
}

type SeatState = 0 | 1;
type CinemaRoom = SeatState[][];

interface ReservationResult {
  success: boolean;
  message: string;
}

interface SeatCounters {
  occupied: number;
  available: number;
}

interface ContiguousPair {
  row: number;
  firstColumn: number;
  secondColumn: number;
  message: string;
}

const TOTAL_ROWS = 8;
const TOTAL_COLUMNS = 10;
const IS_NODE_RUNTIME = typeof document === "undefined";
const DEMO_TITLE = "=== DEMO: Sistema de Reservas de Cine ===";
const DEMO_TITLE_WIDTH = 62;

const ANSI = {
  reset: "\u001b[0m",
  green: "\u001b[32m",
  red: "\u001b[31m",
  cyan: "\u001b[36m",
  blue: "\u001b[34m",
  yellow: "\u001b[33m",
  white: "\u001b[37m",
  bold: "\u001b[1m",
  dim: "\u001b[2m",
  gray: "\u001b[90m",
  bgBlue: "\u001b[44m",
};

function colorize(message: string, ansiColor: string): string {
  if (!IS_NODE_RUNTIME) {
    return message;
  }

  return `${ansiColor}${message}${ANSI.reset}`;
}

function centerText(text: string, width: number): string {
  if (text.length >= width) {
    return text.slice(0, width);
  }

  const leftPadding = Math.floor((width - text.length) / 2);
  const rightPadding = width - text.length - leftPadding;
  return `${" ".repeat(leftPadding)}${text}${" ".repeat(rightPadding)}`;
}

function printSection(title: string): void {
  const totalWidth = 62;
  const separator = "═".repeat(totalWidth);
  const plainTitle = ` ${title} `;
  const decoratedTitle = centerText(plainTitle, totalWidth);
  const sectionTitle = IS_NODE_RUNTIME
    ? `${ANSI.bold}${ANSI.white}${ANSI.bgBlue}${decoratedTitle}${ANSI.reset}`
    : decoratedTitle;

  console.log("");
  console.log(colorize(`╔${separator}╗`, ANSI.cyan));
  console.log(colorize(`║${sectionTitle}║`, ANSI.cyan));
  console.log(colorize(`╚${separator}╝`, ANSI.cyan));
}

function printCliHeader(): void {
  const totalWidth = 62;
  const top = `╔${"═".repeat(totalWidth)}╗`;
  const title = centerText("CINE RESERVAS CLI", totalWidth);
  const subtitle = centerText("Prototipo de gestion de asientos", totalWidth);

  console.log(colorize(top, `${ANSI.bold}${ANSI.blue}`));
  console.log(colorize(`║${centerText("🎟️  PROYECTO DEMO", totalWidth)}║`, `${ANSI.bold}${ANSI.white}${ANSI.bgBlue}`));
  console.log(colorize(`║${title}║`, `${ANSI.bold}${ANSI.white}`));
  console.log(colorize(`║${subtitle}║`, ANSI.gray));
  console.log(colorize(`╚${"═".repeat(totalWidth)}╝`, `${ANSI.bold}${ANSI.blue}`));
}

function initializeRoom(rows: number = TOTAL_ROWS, columns: number = TOTAL_COLUMNS): CinemaRoom {
  return Array.from({ length: rows }, () =>
    Array.from({ length: columns }, () => 0 as SeatState),
  );
}

function printRoom(room: CinemaRoom): void {
  const roomLines = buildRoomLines(room);

  console.log(colorize("\n🎬 Estado actual de la sala", `${ANSI.bold}${ANSI.cyan}`));
  roomLines.forEach((line) => console.log(line));

  console.log("");
}

function buildRoomLines(room: CinemaRoom): string[] {
  const totalColumns = room[0].length;
  const dividerIndex = 4;
  const leftColumns = dividerIndex + 1;
  const rightColumns = totalColumns - leftColumns;
  const emojiDisplayWidth = 2;
  const cellWidth = emojiDisplayWidth + 3;
  const headerCellWidth = cellWidth;
  const aisleToken = " || ";
  const leftWidth = leftColumns * cellWidth;
  const rightWidth = rightColumns * cellWidth;
  const interiorWidth = leftWidth + aisleToken.length + rightWidth;
  const screenInnerWidth = Math.max(interiorWidth, 34);
  const rowPrefix = "    ";
  const rowLabel = (rowIndex: number): string => `${rowIndex.toString().padStart(2, " ")} │ `;
  const rowLabelWidth = rowLabel(0).length;

  const formatSeatCell = (seat: SeatState): string => ` ${colorSeat(seat)}  `;
  const formatHeaderCell = (column: number): string => centerText(column.toString(), headerCellWidth);
  const colorSeat = (seat: SeatState): string => {
    const symbol = seat === 1 ? "🟥" : "🟩";
    if (!IS_NODE_RUNTIME) {
      return symbol;
    }

    return seat === 1 ? colorize(symbol, `${ANSI.bold}${ANSI.red}`) : colorize(symbol, `${ANSI.bold}${ANSI.green}`);
  };

  const screenTop = `${rowPrefix}╔${"═".repeat(screenInnerWidth)}╗`;
  const screenMiddle = `${rowPrefix}║${centerText("🖥️  PANTALLA / ESCENARIO", screenInnerWidth)}║`;
  const screenBottom = `${rowPrefix}╚${"═".repeat(screenInnerWidth)}╝`;
  const leftHeader = Array.from({ length: leftColumns }, (_, col) => formatHeaderCell(col)).join("");
  const rightHeader = Array.from({ length: rightColumns }, (_, idx) => formatHeaderCell(leftColumns + idx)).join("");
  const columnHeaderOffset = 0;
  const headerAisleToken = "    || ";
  const columnHeader = `${" ".repeat(rowLabelWidth + columnHeaderOffset)}${leftHeader}${headerAisleToken}${rightHeader}`;
  const topBorder = `${rowPrefix}┌${"─".repeat(leftWidth)}┬${"─".repeat(aisleToken.length)}┬${"─".repeat(rightWidth)}┐`;
  const bottomBorder = `${rowPrefix}└${"─".repeat(leftWidth)}┴${"─".repeat(aisleToken.length)}┴${"─".repeat(rightWidth)}┘`;
  const lines = [
    colorize(screenTop, ANSI.blue),
    colorize(screenMiddle, `${ANSI.bold}${ANSI.cyan}`),
    colorize(screenBottom, ANSI.blue),
    "",
    colorize(columnHeader, `${ANSI.bold}${ANSI.white}`),
    colorize(topBorder, ANSI.blue),
  ];

  room.forEach((row, rowIndex) => {
    const leftSeats = row
      .slice(0, leftColumns)
      .map((seat) => formatSeatCell(seat))
      .join("");
    const rightSeats = row
      .slice(leftColumns)
      .map((seat) => formatSeatCell(seat))
      .join("");
    const visualRow = `${leftSeats}${aisleToken}${rightSeats}`;
    lines.push(colorize(`${rowLabel(rowIndex)}${visualRow}│`, ANSI.white));
  });

  lines.push(colorize(bottomBorder, ANSI.blue));
  lines.push(colorize("     Leyenda: 🟩 Libre | 🟥 Ocupado | || Pasillo", `${ANSI.bold}${ANSI.yellow}`));

  return lines;
}

function reserveSeat(room: CinemaRoom, row: number, column: number): ReservationResult {
  const isRowOutOfRange = row < 0 || row >= room.length;
  const isColumnOutOfRange = column < 0 || column >= room[0].length;

  if (isRowOutOfRange || isColumnOutOfRange) {
    return {
      success: false,
      message: `Reserva fallida: la posicion (fila ${row}, columna ${column}) esta fuera de rango.`,
    };
  }

  if (room[row][column] === 1) {
    return {
      success: false,
      message: `Reserva fallida: el asiento en fila ${row}, columna ${column} ya esta ocupado.`,
    };
  }

  room[row][column] = 1;

  return {
    success: true,
    message: `Reserva exitosa: asiento asignado en fila ${row}, columna ${column}.`,
  };
}

function countSeats(room: CinemaRoom): SeatCounters {
  let occupied = 0;

  for (const row of room) {
    for (const seat of row) {
      if (seat === 1) {
        occupied += 1;
      }
    }
  }

  const totalSeats = room.length * room[0].length;
  const available = totalSeats - occupied;

  return { occupied, available };
}

function findFirstContiguousFreePair(room: CinemaRoom): ContiguousPair | string {
  for (let rowIndex = 0; rowIndex < room.length; rowIndex += 1) {
    for (let columnIndex = 0; columnIndex < room[rowIndex].length - 1; columnIndex += 1) {
      const currentSeat = room[rowIndex][columnIndex];
      const nextSeat = room[rowIndex][columnIndex + 1];

      if (currentSeat === 0 && nextSeat === 0) {
        return {
          row: rowIndex,
          firstColumn: columnIndex,
          secondColumn: columnIndex + 1,
          message: `Primer par contiguo libre: Fila ${rowIndex}, Asientos ${columnIndex} y ${columnIndex + 1}.`,
        };
      }
    }
  }

  return "No se encontraron pares de asientos libres contiguos.";
}

function printSeatCounters(counters: SeatCounters): void {
  const total = counters.occupied + counters.available;
  const barLength = 24;
  const occupiedUnits = total === 0 ? 0 : Math.round((counters.occupied / total) * barLength);
  const availableUnits = barLength - occupiedUnits;
  const occupiedBar = `${"█".repeat(occupiedUnits)}${"░".repeat(Math.max(0, availableUnits))}`;
  const availableBar = `${"█".repeat(Math.max(0, availableUnits))}${"░".repeat(occupiedUnits)}`;

  console.log(colorize(`📌 Asientos ocupados: ${counters.occupied}`, `${ANSI.bold}${ANSI.cyan}`));
  console.log(colorize(`📌 Asientos disponibles: ${counters.available}`, `${ANSI.bold}${ANSI.cyan}`));
  console.log(colorize(`   Ocupacion : ${occupiedBar}`, ANSI.red));
  console.log(colorize(`   Disponib. : ${availableBar}`, ANSI.green));
}

function renderDemoOutput(lines: string[]): void {
  if (typeof document === "undefined") {
    return;
  }

  const app = document.querySelector<HTMLDivElement>("#app");
  if (!app) {
    return;
  }

  app.className = "mt-2 text-sm text-slate-700 overflow-x-auto";

  const pre = document.createElement("pre");
  pre.textContent = lines.join("\n");
  pre.style.margin = "0";
  pre.style.whiteSpace = "pre";
  pre.style.lineHeight = "1.4";
  pre.style.letterSpacing = "0";
  pre.style.fontFamily = "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace";

  app.replaceChildren(pre);
}

function runDemo(): void {
  const room = initializeRoom();
  const demoLines: string[] = [];

  const logLine = (message: string): void => {
    const centeredDemoTitle = centerText(DEMO_TITLE, DEMO_TITLE_WIDTH);

    if (message.startsWith("Reserva exitosa")) {
      console.log(colorize(`✔ ${message}`, `${ANSI.bold}${ANSI.green}`));
    } else if (message.startsWith("Reserva fallida")) {
      console.log(colorize(`✖ ${message}`, `${ANSI.bold}${ANSI.red}`));
    } else if (message === DEMO_TITLE) {
      console.log(colorize(centeredDemoTitle, `${ANSI.bold}${ANSI.cyan}`));
    } else if (
      message.startsWith("Primer par contiguo libre") ||
      message.startsWith("No se encontraron")
    ) {
      console.log(colorize(`➤ ${message}`, `${ANSI.bold}${ANSI.cyan}`));
    } else {
      console.log(message);
    }

    demoLines.push(message === DEMO_TITLE ? centeredDemoTitle : message);
  };

  printCliHeader();
  printSection("DEMO INICIAL");
  logLine(DEMO_TITLE);
  demoLines.push("\nEstado inicial de la sala:");
  demoLines.push(...buildRoomLines(room));
  printRoom(room);

  // Reservas exitosas
  logLine(reserveSeat(room, 2, 4).message);
  logLine(reserveSeat(room, 2, 5).message);

  // Reserva fallida (asiento ya ocupado)
  logLine(reserveSeat(room, 2, 4).message);

  // Reserva fallida (fuera de rango)
  logLine(reserveSeat(room, 8, 0).message);

  printSection("ESTADO POST-RESERVAS");
  demoLines.push("\nEstado de la sala despues de reservas:");
  demoLines.push(...buildRoomLines(room));
  printRoom(room);

  printSection("RESUMEN FINAL");
  const counters = countSeats(room);
  printSeatCounters(counters);
  demoLines.push(`Asientos ocupados: ${counters.occupied}`);
  demoLines.push(`Asientos disponibles: ${counters.available}`);

  const contiguousPair = findFirstContiguousFreePair(room);
  if (typeof contiguousPair === "string") {
    logLine(contiguousPair);
  } else {
    logLine(contiguousPair.message);
  }

  renderDemoOutput(demoLines);
}

runDemo();

export {
  countSeats,
  findFirstContiguousFreePair,
  initializeRoom,
  printRoom,
  reserveSeat,
};
