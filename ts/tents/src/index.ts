// src/index.ts

const SIZE = 8;
const NumTrees = (SIZE / 2) * (SIZE / 2 - 1); // Calculate the number of trees

// 1. initialize a SIZE × SIZE matrix filled with zeros
const matrix: number[][] = Array.from(
  { length: SIZE },
  () => Array(SIZE).fill(0)
);

/**
 * Checks if a tent can be placed at the given position.
 * A tent can be placed if:
 * - The position is within bounds.
 * - The cell is empty (value is 0).
 * - None of the 8 adjacent cells contain a tent (value is 3).
 */
function canPlaceTent(r: number, c: number): boolean {
  // Ensure the position is within bounds and empty
  if (r < 0 || r >= SIZE || c < 0 || c >= SIZE || matrix[r][c] !== 0) {
    return false;
  }

  // Check the 8 adjacent cells around the potential tent position
  const adjacentCells = [
    [r - 1, c - 1], [r - 1, c], [r - 1, c + 1], // Top-left, Top, Top-right
    [r, c - 1],                 [r, c + 1],     // Left, Right
    [r + 1, c - 1], [r + 1, c], [r + 1, c + 1], // Bottom-left, Bottom, Bottom-right
  ];

  return adjacentCells.every(([adjR, adjC]) => {
    // Ensure adjacent cells are within bounds and do not contain a tent
    return adjR < 0 || adjR >= SIZE || adjC < 0 || adjC >= SIZE || matrix[adjR][adjC] !== 3;
  });
}

/**
 * Places trees and tents in the matrix.
 * Each tree (value 1) must have a tent (value 3) placed next to it.
 */
function placeTrees() {
  let treesPlaced = 0;

  while (treesPlaced < NumTrees) {
    const row = Math.floor(Math.random() * SIZE);
    const col = Math.floor(Math.random() * SIZE);

    // Only place a tree if the cell is currently empty (0)
    if (matrix[row][col] === 0) {
      // Find a valid position for a tent next to the tree
      const tentPositions = [
        [row - 1, col], // Above
        [row + 1, col], // Below
        [row, col - 1], // Left
        [row, col + 1], // Right
      ].filter(([r, c]) => canPlaceTent(r, c)); // Use the new function to check tent placement

      // If there is at least one valid position for a tent
      if (tentPositions.length > 0) {
        // Randomly select one of the valid positions for the tent
        const [tentRow, tentCol] = tentPositions[Math.floor(Math.random() * tentPositions.length)];

        // Place the tree and the tent
        matrix[row][col] = 1; // Place the tree
        matrix[tentRow][tentCol] = 3; // Place the tent
        treesPlaced++;
      }
    }
  }
}

// Call the function to place trees
placeTrees();

/**
 * Handles the click event for a cell.
 * Updates the matrix value and redraws the matrix.
 */
function handleCellClick(row: number, col: number): void {
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
  drawMatrix(); // Redraw the matrix after the change
}

/**
 * Draws the matrix and totals into the #matrix container.
 */
function drawMatrix() {
  const container = document.getElementById('matrix')!;
  container.innerHTML = ''; // Clear old content

  // Compute totals for rows and columns
  const rowTotals = matrix.map(row => row.filter(val => val === 3).length);
  const colTotals = Array(SIZE).fill(0).map((_, col) =>
    matrix.reduce((sum, row) => sum + (row[col] === 3 ? 1 : 0), 0)
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
      cell.addEventListener('click', () => handleCellClick(row, col));

      container.appendChild(cell);
    }

    // Add a cell for the row total
    const rowTotalCell = document.createElement('div');
    rowTotalCell.className = 'cell row-total'; 
    rowTotalCell.textContent = String(rowTotals[row]);
    container.appendChild(rowTotalCell);
  }

  // Add a row for column totals
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

// 4. when page loads, render
document.addEventListener('DOMContentLoaded', () => {
  drawMatrix();
});
