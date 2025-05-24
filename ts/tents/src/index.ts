// src/index.ts

const SIZE = 10;

// 1. initialize a 10×10 matrix filled with zeros
const matrix: number[][] = Array.from(
  { length: SIZE },
  () => Array(SIZE).fill(0)
);

// 2. draw the matrix into the #matrix container
function drawMatrix() {
  const container = document.getElementById('matrix')!;
  container.innerHTML = ''; // clear old

  for (let row = 0; row < SIZE; row++) {
    for (let col = 0; col < SIZE; col++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      const val = matrix[row][col];
      cell.textContent = val === 0 ? '' : String(val);

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
