// src/index.ts

const SIZE = 8;
const NumTrees = (SIZE / 2) * (SIZE / 2 - 1); // Calculate the number of trees

let rng: { random(): number };

/**
 * Seeds a simple LCG RNG so puzzles can be reproduced.
 */
function seedRng(initSeed: number): void {
  // parameters from “Numerical Recipes”
  let state = initSeed % 233280;
  if (state <= 0) state += 233280;
  rng = {
    random(): number {
      state = (state * 9301 + 49297) % 233280;
      return state / 233280;
    }
  };
}

// read seed from URL ?seed=1234 or use current time
const params = new URLSearchParams(window.location.search);
const seed = params.has('id') ? parseInt(params.get('id')!, 10) : Date.now();
seedRng(seed);

// Initialize a SIZE × SIZE matrix filled with zeros
const globalMatrix: number[][] = Array.from(
  { length: SIZE },
  () => Array(SIZE).fill(0)
);

// Initialize the solution matrix
let solutionMatrix: number[][] = [];

/**
 * Copies the content of one matrix into another.
 */
function copyMatrix(matrix: number[][]): number[][] {
  return matrix.map(row => [...row]);
}

/**
 * Removes all tents (value 3) from the matrix by replacing them with zeros.
 */
function eraseTents(matrix: number[][]): void {
  for (let row = 0; row < SIZE; row++) {
    for (let col = 0; col < SIZE; col++) {
      if (matrix[row][col] === 3) {
        matrix[row][col] = 0;
      }
    }
  }
}

/**
 * Checks if a tent can be placed at the given position.
 */
function canPlaceTent(matrix: number[][], r: number, c: number): boolean {
  if (r < 0 || r >= SIZE || c < 0 || c >= SIZE || matrix[r][c] !== 0) {
    return false;
  }

  const adjacentCells = [
    [r - 1, c - 1], [r - 1, c], [r - 1, c + 1],
    [r, c - 1],                 [r, c + 1],
    [r + 1, c - 1], [r + 1, c], [r + 1, c + 1],
  ];

  return adjacentCells.every(([adjR, adjC]) => {
    return adjR < 0 || adjR >= SIZE || adjC < 0 || adjC >= SIZE || matrix[adjR][adjC] !== 3;
  });
}

// Places trees and tents in the matrix.
function placeTrees(matrix: number[][]): void {
  const maxAttempts = 10000;
  let treesPlaced = 0;
  let attempts = 0;
  while (treesPlaced < NumTrees && attempts < maxAttempts) {
    const row = Math.floor(rng.random() * SIZE);
    const col = Math.floor(rng.random() * SIZE);
    attempts++;
    if (matrix[row][col] === 0) {
      const tentPositions = [
        [row - 1, col],
        [row + 1, col],
        [row, col - 1],
        [row, col + 1],
      ].filter(([r, c]) => canPlaceTent(matrix, r, c));

      if (tentPositions.length > 0) {
        const idx = Math.floor(rng.random() * tentPositions.length);
        const [tentRow, tentCol] = tentPositions[idx];
        matrix[row][col] = 1; // Place the tree
        matrix[tentRow][tentCol] = 3; // Place the tent
        treesPlaced++;
      }
    }
  }
}

/**
 * Checks if the current matrix matches the solution matrix.
 * Treats values 0 and 2 as equal.
 * @param matrix The current matrix (globalMatrix).
 * @param solutionMatrix The solution matrix.
 * @returns True if the current matrix matches the solution matrix, false otherwise.
 */
function isCorrectSolution(matrix: number[][], solutionMatrix: number[][]): boolean {
  if (matrix.length !== solutionMatrix.length) return false;

  for (let row = 0; row < matrix.length; row++) {
    if (matrix[row].length !== solutionMatrix[row].length) return false;

    for (let col = 0; col < matrix[row].length; col++) {
      const currentVal = matrix[row][col];
      const solutionVal = solutionMatrix[row][col];

      // Treat 0 and 2 as equal
      if (
        (currentVal === 0 || currentVal === 2) &&
        (solutionVal === 0 || solutionVal === 2)
      ) {
        continue;
      }

      // Check for exact match for other values
      if (currentVal !== solutionVal) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Handles the click event for a cell.
 */
function handleCellClick(matrix: number[][], row: number, col: number): void {
  const val = matrix[row][col];
  if (val === 0) {
    matrix[row][col] = 2; // Change 0 to 2
  } else if (val === 2) {
    matrix[row][col] = 3; // Change 2 to 3
  } else if (val === 3) {
    matrix[row][col] = 0; // Change 3 to 0
  } else {
    return; // Do nothing for other values
  }

  drawMatrix(matrix, solutionMatrix); // Redraw the matrix after the change

  // Check if the current globalMatrix matches the solutionMatrix
  const messageElement = document.getElementById('message');
  if (messageElement) {
    if (isCorrectSolution(matrix, solutionMatrix)) {
      messageElement.textContent = 'Puzzle solved!';
    } else {
      messageElement.textContent = 'Find all tents!';
    }
  }
}

/**
 * Sets up dynamic sizing for the matrix and its elements.
 * @param container The matrix container element
 * @returns The calculated cell size
 */
function setupDynamicSizing(container: HTMLElement): number {
  // Calculate cell size dynamically based on container width
  const containerWidth = window.innerWidth * 0.9; // 90% of viewport width
  const actualWidth = containerWidth; // Remove maxWidth constraint
  const cellSize = Math.floor(actualWidth / (SIZE + 1)); // +1 for totals column

  // Calculate font sizes dynamically based on cell size
  const cellFontSize = Math.floor(cellSize * 0.8); // Cell font is 80% of cell size
  const totalFontSize = Math.floor(cellSize * 0.5); // Total font is 50%
  const messageFontSize = Math.floor(cellSize * 0.8); // Message font is 80%

  // Set the grid style dynamically
  container.style.gridTemplateColumns = `repeat(${SIZE + 1}, ${cellSize}px)`;
  container.style.width = `${cellSize * (SIZE + 1)}px`;

  // Remove any existing dynamic styles
  const existingStyle = document.getElementById('dynamic-styles');
  if (existingStyle) {
    existingStyle.remove();
  }

  // Set cell dimensions and font sizes dynamically
  const style = document.createElement('style');
  style.id = 'dynamic-styles';
  style.textContent = `
    .cell {
      width: ${cellSize}px;
      height: ${cellSize}px;
      font-size: ${cellFontSize}px;
    }
    .row-total, .col-total {
      width: ${cellSize}px;
      height: ${cellSize}px;
      font-size: ${totalFontSize}px;
      line-height: ${cellSize}px;
    }
    .success-message {
      font-size: ${messageFontSize}px;
    }
  `;
  document.head.appendChild(style);

  return cellSize;
}

/**
 * Computes the totals for rows and columns based on the solution matrix.
 * @param solutionMatrix The solution matrix used to calculate totals
 * @returns An object containing rowTotals and colTotals arrays
 */
function computeTotals(solutionMatrix: number[][]): { rowTotals: number[], colTotals: number[] } {
  const rowTotals = solutionMatrix.map(row => row.filter(val => val === 3).length);
  const colTotals = Array(SIZE).fill(0).map((_, col) =>
    solutionMatrix.reduce((sum, row) => sum + (row[col] === 3 ? 1 : 0), 0)
  );

  return { rowTotals, colTotals };
}

/**
 * Displays the main content of the matrix (trees, tents, and empty cells).
 * @param container The matrix container element
 * @param matrix The current matrix to display
 * @param rowTotals Array of row totals
 * @param colTotals Array of column totals
 */
function displayMatrixContent(
  container: HTMLElement, 
  matrix: number[][], 
  rowTotals: number[], 
  colTotals: number[]
): void {
  for (let row = 0; row < SIZE; row++) {
    for (let col = 0; col < SIZE; col++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      const val = matrix[row][col];

      // Handle special cases for display
      if (val === 0) {
        cell.textContent = '';
      } else if (val === 1) {
        cell.textContent = '🌳'; // Deciduous Tree (rounded) Unicode character
      } else if (val === 2) {
        cell.textContent = '×'; // Multiplication Sign Unicode character
      } else if (val === 3) {
        cell.textContent = '⛺'; // Tent Unicode character
      } else {
        cell.textContent = String(val);
      }

      // Add click event to update value and redraw
      cell.addEventListener('click', () => handleCellClick(matrix, row, col));
      container.appendChild(cell);
    }

    // Add a cell for the row total (based on solutionMatrix)
    const rowTotalCell = document.createElement('div');
    rowTotalCell.className = 'cell row-total';
    rowTotalCell.textContent = String(rowTotals[row]);
    container.appendChild(rowTotalCell);
  }

  // Add a row for column totals (based on solutionMatrix)
  for (let col = 0; col < SIZE; col++) {
    const colTotalCell = document.createElement('div');
    colTotalCell.className = 'cell col-total';
    colTotalCell.textContent = String(colTotals[col]);
    container.appendChild(colTotalCell);
  }

  // Add an empty cell in the bottom-right corner
  const emptyCell = document.createElement('div');
  emptyCell.className = 'cell row-total';
  emptyCell.textContent = '';
  container.appendChild(emptyCell);
}

/**
 * Draws the matrix and totals into the #matrix container.
 * @param matrix The matrix to render (globalMatrix).
 * @param solutionMatrix The matrix used to calculate totals.
 */
function drawMatrix(matrix: number[][], solutionMatrix: number[][]): void {
  const container = document.getElementById('matrix')!;
  container.innerHTML = ''; // Clear old content

  setupDynamicSizing(container);
  const { rowTotals, colTotals } = computeTotals(solutionMatrix);
  displayMatrixContent(container, matrix, rowTotals, colTotals);
}

// Add window resize listener to redraw matrix when screen orientation changes
window.addEventListener('resize', () => {
  drawMatrix(globalMatrix, solutionMatrix);
});

// optionally display the seed for reproducibility
const messageEl = document.getElementById('seed');
if (messageEl) {
  messageEl.textContent = `Puzzle ID: ${seed}`;
}
// Initialize the matrix and render it
placeTrees(globalMatrix);
solutionMatrix = copyMatrix(globalMatrix); // Copy globalMatrix into solutionMatrix
eraseTents(globalMatrix); // Remove all tents from globalMatrix
document.addEventListener('DOMContentLoaded', () => {
  drawMatrix(globalMatrix, solutionMatrix);
});
