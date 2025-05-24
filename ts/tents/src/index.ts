// src/index.ts

const SIZE = 8;
const NumTrees = (SIZE / 2) * (SIZE / 2 - 1); // Calculate the number of trees

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

/**
 * Places trees and tents in the matrix.
 */
function placeTrees(matrix: number[][]): void {
  let treesPlaced = 0;

  while (treesPlaced < NumTrees) {
    const row = Math.floor(Math.random() * SIZE);
    const col = Math.floor(Math.random() * SIZE);

    if (matrix[row][col] === 0) {
      const tentPositions = [
        [row - 1, col],
        [row + 1, col],
        [row, col - 1],
        [row, col + 1],
      ].filter(([r, c]) => canPlaceTent(matrix, r, c));

      if (tentPositions.length > 0) {
        const [tentRow, tentCol] = tentPositions[Math.floor(Math.random() * tentPositions.length)];
        matrix[row][col] = 1; // Place the tree
        matrix[tentRow][tentCol] = 3; // Place the tent
        treesPlaced++;
      }
    }
  }
}

/**
 * Compares two matrices for equality.
 * @param matrix1 The first matrix to compare.
 * @param matrix2 The second matrix to compare.
 * @returns True if the matrices are equal, false otherwise.
 */
function areMatricesEqual(matrix1: number[][], matrix2: number[][]): boolean {
  if (matrix1.length !== matrix2.length) return false;

  for (let row = 0; row < matrix1.length; row++) {
    if (matrix1[row].length !== matrix2[row].length) return false;

    for (let col = 0; col < matrix1[row].length; col++) {
      if (matrix1[row][col] !== matrix2[row][col]) {
        return false;
      }
    }
  }

  return true;
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
  if (isCorrectSolution(matrix, solutionMatrix)) {
    // Add the success message to the body or a parent container
    const existingMessage = document.querySelector('.success-message');
    if (!existingMessage) {
      const successMessage = document.createElement('div');
      successMessage.className = 'success-message';
      successMessage.textContent = 'Congratulations! You solved the puzzle!';
      document.body.appendChild(successMessage); // Append to the body
    }
  }
}

/**
 * Draws the matrix and totals into the #matrix container.
 * @param matrix The matrix to render (globalMatrix).
 * @param solutionMatrix The matrix used to calculate totals.
 */
function drawMatrix(matrix: number[][], solutionMatrix: number[][]): void {
  const container = document.getElementById('matrix')!;
  container.innerHTML = ''; // Clear old content

  // Compute totals for rows and columns based on the solutionMatrix
  const rowTotals = solutionMatrix.map(row => row.filter(val => val === 3).length);
  const colTotals = Array(SIZE).fill(0).map((_, col) =>
    solutionMatrix.reduce((sum, row) => sum + (row[col] === 3 ? 1 : 0), 0)
  );

  // Set the grid style dynamically based on SIZE + 1 (for totals)
  container.style.gridTemplateColumns = `repeat(${SIZE + 1}, 40px)`; // +1 for totals column

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

// Initialize the matrix and render it
placeTrees(globalMatrix);
solutionMatrix = copyMatrix(globalMatrix); // Copy globalMatrix into solutionMatrix
eraseTents(globalMatrix); // Remove all tents from globalMatrix
document.addEventListener('DOMContentLoaded', () => {
  drawMatrix(globalMatrix, solutionMatrix);
});
