package tents

import org.scalajs.dom
import org.scalajs.dom.{document, html, window}
import scala.scalajs.js.annotation.JSExportTopLevel
import scala.util.Random

object Main:

  val SIZE = 8
  val NumTrees: Int = (SIZE / 2) * (SIZE / 2 - 1)
  val globalMatrix: Array[Array[Int]] = Array.fill(SIZE, SIZE)(0)
  var solutionMatrix: Array[Array[Int]] = Array.ofDim[Int](SIZE, SIZE)

  def copyMatrix(matrix: Array[Array[Int]]): Array[Array[Int]] =
    matrix.map(_.clone)

  def eraseTents(matrix: Array[Array[Int]]): Unit =
    for
      row <- 0 until SIZE
      col <- 0 until SIZE
    do if matrix(row)(col) == 3 then matrix(row)(col) = 0

  def canPlaceTent(matrix: Array[Array[Int]], r: Int, c: Int): Boolean =
    if r < 0 || r >= SIZE || c < 0 || c >= SIZE || matrix(r)(c) != 0 then false
    else
      val adjacent = Seq(
        (r - 1, c - 1), (r - 1, c), (r - 1, c + 1),
        (r, c - 1),               (r, c + 1),
        (r + 1, c - 1), (r + 1, c), (r + 1, c + 1)
      )
      adjacent.forall { case (ar, ac) =>
        ar < 0 || ar >= SIZE || ac < 0 || ac >= SIZE || matrix(ar)(ac) != 3
      }

  def placeTrees(matrix: Array[Array[Int]]): Unit =
    var treesPlaced = 0
    val random = new Random()
    while treesPlaced < NumTrees do
      val row = random.nextInt(SIZE)
      val col = random.nextInt(SIZE)
      if matrix(row)(col) == 0 then
        val tentCandidates = Seq(
          (row - 1, col),
          (row + 1, col),
          (row, col - 1),
          (row, col + 1)
        ).filter { case (r, c) => canPlaceTent(matrix, r, c) }
        if tentCandidates.nonEmpty then
          val (tentRow, tentCol) = tentCandidates(random.nextInt(tentCandidates.size))
          matrix(row)(col) = 1   // Place tree
          matrix(tentRow)(tentCol) = 3 // Place tent
          treesPlaced += 1

  def isCorrectSolution(matrix: Array[Array[Int]], solMatrix: Array[Array[Int]]): Boolean =
    (0 until SIZE).forall { row =>
      (0 until SIZE).forall { col =>
        val cur = matrix(row)(col)
        val sol = solMatrix(row)(col)
        ((cur == 0 || cur == 2) && (sol == 0 || sol == 2)) || cur == sol
      }
    }

  def handleCellClick(matrix: Array[Array[Int]], row: Int, col: Int): Unit =
    matrix(row)(col) = matrix(row)(col) match
      case 0 => 2
      case 2 => 3
      case 3 => 0
      case other => other

    drawMatrix(matrix, solutionMatrix)
    Option(document.getElementById("message")).foreach { elem =>
      elem.textContent =
        if isCorrectSolution(matrix, solutionMatrix) then "Puzzle solved!" else "Find all tents!"
    }

  def setupDynamicSizing(container: html.Element): Int =
    val containerWidth = window.innerWidth * 0.9
    val cellSize = (containerWidth / (SIZE + 1)).toInt
    
    // Remove existing dynamic styles to prevent accumulation
    Option(document.getElementById("dynamic-styles")).foreach(oldStyle => oldStyle.parentNode.removeChild(oldStyle))

    // Dynamically append styles for sizing
    val style = document.createElement("style").asInstanceOf[html.Style]
    style.id = "dynamic-styles" // Add an ID for future removal
    style.textContent =
      s"""
         |.cell { 
         |  width: ${cellSize}px; 
         |  height: ${cellSize}px; 
         |  font-size: ${cellSize * 0.8}px; 
         |  box-sizing: border-box; /* Include border and padding in the element's total width and height */
         |}
         |.row-total, .col-total { 
         |  /* These classes also use .cell, so box-sizing is inherited. Explicitly set if they didn't. */
         |  width: ${cellSize}px; /* Ensure these are also explicitly sized if not using .cell class */
         |  height: ${cellSize}px; 
         |  font-size: ${cellSize * 0.5}px; 
         |}
         |.success-message { font-size: ${cellSize * 0.8}px; }
         |""".stripMargin
    document.head.appendChild(style)
    cellSize

  def computeTotals(solMatrix: Array[Array[Int]]): (Array[Int], Array[Int]) =
    val rowTotals = solMatrix.map(row => row.count(_ == 3))
    val colTotals = Array.tabulate(SIZE)(col => solMatrix.map(_(col)).count(_ == 3))
    (rowTotals, colTotals)

  def displayMatrix(container: html.Element, matrix: Array[Array[Int]], rowTotals: Array[Int], colTotals: Array[Int]): Unit =
    for row <- 0 until SIZE do
      for col <- 0 until SIZE do
        val cell = document.createElement("div").asInstanceOf[html.Div]
        cell.className = "cell"
        cell.textContent = matrix(row)(col) match
          case 0 => ""
          case 1 => "🌳"
          case 2 => "×"
          case 3 => "⛺"
          case _ => ""
        cell.onclick = (_: dom.MouseEvent) => handleCellClick(matrix, row, col)
        container.appendChild(cell)
      val rowTotal = document.createElement("div").asInstanceOf[html.Div]
      rowTotal.className = "cell row-total"
      rowTotal.textContent = rowTotals(row).toString
      container.appendChild(rowTotal)
      
    for col <- 0 until SIZE do
      val colTotal = document.createElement("div").asInstanceOf[html.Div]
      colTotal.className = "cell col-total"
      colTotal.textContent = colTotals(col).toString
      container.appendChild(colTotal)
      
    val emptyCell = document.createElement("div").asInstanceOf[html.Div]
    emptyCell.className = "cell row-total"
    emptyCell.textContent = ""
    container.appendChild(emptyCell)

  def drawMatrix(matrix: Array[Array[Int]], solMatrix: Array[Array[Int]]): Unit =
    val container = document.getElementById("matrix").asInstanceOf[html.Element]
    container.innerHTML = "" // Clear previous entries
    val cellSize = setupDynamicSizing(container) // Capture cellSize
    
    // Set grid columns to arrange cells in rows using setProperty and explicit cellSize
    container.style.setProperty("grid-template-columns", s"repeat(${SIZE + 1}, ${cellSize}px)")

    val (rowTotals, colTotals) = computeTotals(solMatrix)
    displayMatrix(container, matrix, rowTotals, colTotals)

  //@JSExportTopLevel("main") 
  @main
  def tentsMain(): Unit =
    placeTrees(globalMatrix)
    solutionMatrix = copyMatrix(globalMatrix)
    eraseTents(globalMatrix)
    document.addEventListener("DOMContentLoaded", (_: dom.Event) => drawMatrix(globalMatrix, solutionMatrix))
    // Redraw matrix on window resize
    window.addEventListener("resize", (_: dom.Event) => drawMatrix(globalMatrix, solutionMatrix))
