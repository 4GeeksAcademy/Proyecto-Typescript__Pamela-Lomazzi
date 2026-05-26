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

function initializeRoom(rows: number = TOTAL_ROWS, columns: number = TOTAL_COLUMNS): CinemaRoom {
  return Array.from({ length: rows }, () =>
    Array.from({ length: columns }, () => 0 as SeatState),
  );
}

function printRoom(room: CinemaRoom): void {
  const roomLines = buildRoomLines(room);

  console.log("\nEstado actual de la sala:");
  roomLines.forEach((line) => console.log(line));

  console.log("");
}

function buildRoomLines(room: CinemaRoom): string[] {
  const header = `    ${Array.from({ length: room[0].length }, (_, col) => col.toString().padStart(2, " ")).join(" ")}`;
  const lines = [header];

  room.forEach((row, rowIndex) => {
    const visualRow = row.map((seat) => (seat === 1 ? " X" : " L")).join(" ");
    lines.push(`${rowIndex.toString().padStart(2, " ")} |${visualRow}`);
  });

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
  console.log(`Asientos ocupados: ${counters.occupied}`);
  console.log(`Asientos disponibles: ${counters.available}`);
}

function renderDemoOutput(lines: string[]): void {
  if (typeof document === "undefined") {
    return;
  }

  const app = document.querySelector<HTMLParagraphElement>("#app");
  if (!app) {
    return;
  }

  app.className = "mt-2 text-sm text-slate-700 whitespace-pre-wrap font-mono";
  app.textContent = lines.join("\n");
}

function runDemo(): void {
  const room = initializeRoom();
  const demoLines: string[] = [];

  const logLine = (message: string): void => {
    console.log(message);
    demoLines.push(message);
  };

  logLine("=== DEMO: Sistema de Reservas de Cine ===");
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

  demoLines.push("\nEstado de la sala despues de reservas:");
  demoLines.push(...buildRoomLines(room));
  printRoom(room);

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
