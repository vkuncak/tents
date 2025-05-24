// src/index.ts

const SIZE = 8;

// 1. initialize a SIZE × SIZE matrix filled with zeros
const matrix: number[][] = Array.from(
  { length: SIZE },
  () => Array(SIZE).fill(0)
);

// 2. draw the matrix into the #matrix container
function drawMatrix() {
  const container = document.getElementById('matrix')!;
  container.innerHTML = ''; // clear old

  // Set the grid style dynamically based on SIZE
  container.style.gridTemplateColumns = `repeat(${SIZE}, 40px)`; // Assuming 40px cell width as before

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

      // 3. on-click → prompt for new number, update and redraw
      cell.addEventListener('click', () => {
        const input = prompt('Enter a number:', String(val));
        if (input !== null) {
          const num = parseInt(input, 10);
          if (!Number.isNaN(num)) {
            matrix[row][col] = num;
            drawMatrix();
          } else {
            alert('Please enter a valid integer.');
          }
        }
      });

      container.appendChild(cell);
    }
  }
}

// 4. when page loads, render
document.addEventListener('DOMContentLoaded', () => {
  drawMatrix();
});
