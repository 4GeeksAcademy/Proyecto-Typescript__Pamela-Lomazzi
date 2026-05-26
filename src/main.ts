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
  const header = `    ${Array.from({ length: room[0].length }, (_, col) => col.toString().padStart(2, " ")).join(" ")}`;

  console.log("\nEstado actual de la sala:");
  console.log(header);

  room.forEach((row, rowIndex) => {
    const visualRow = row.map((seat) => (seat === 1 ? " X" : " L")).join(" ");
    console.log(`${rowIndex.toString().padStart(2, " ")} |${visualRow}`);
  });

  console.log("");
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

function runDemo(): void {
  const room = initializeRoom();

  console.log("=== DEMO: Sistema de Reservas de Cine ===");
  printRoom(room);

  // Reservas exitosas
  console.log(reserveSeat(room, 2, 4).message);
  console.log(reserveSeat(room, 2, 5).message);

  // Reserva fallida (asiento ya ocupado)
  console.log(reserveSeat(room, 2, 4).message);

  // Reserva fallida (fuera de rango)
  console.log(reserveSeat(room, 8, 0).message);

  printRoom(room);

  const counters = countSeats(room);
  printSeatCounters(counters);

  const contiguousPair = findFirstContiguousFreePair(room);
  if (typeof contiguousPair === "string") {
    console.log(contiguousPair);
  } else {
    console.log(contiguousPair.message);
  }
}

runDemo();

export {
  countSeats,
  findFirstContiguousFreePair,
  initializeRoom,
  printRoom,
  reserveSeat,
};
