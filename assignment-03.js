document.addEventListener("DOMContentLoaded", function() {
    var table = document.getElementById('table');
    calculateAverages();
    calculateUnsubmittedAssignments(table);
    setupCellValidation(table);
    addInputListeners(table);
    setupToggleAverage(table);
    setupAddRowButton(table);
    setupAddColumnButton(table);
    setupSaveTableStateButton(table);
    setupRetrieveTableStateButton(table);
});

function calculateAverages() {
    var rows = document.querySelectorAll("tbody tr");
    rows.forEach(row => {
        var sum = 0;
        var count = 0;
        row.querySelectorAll("td:nth-child(n + 3)").forEach(cell => {
            var value = parseInt(cell.innerText);
            if (!isNaN(value) && value >= 0 && value <= 100) {
                sum += value;
                count++;
            } else {
                cell.innerText = "-";
                cell.classList.add("unsubmitted");
            }
        });
        if (count > 0) {
            var average = Math.round(sum / count);
            var finalGradeCell = row.querySelector(".final-grade");
            finalGradeCell.innerText = average;
            finalGradeCell.dataset.percentGrade = average;
            finalGradeCell.dataset.letterGrade = convertToLetterGrade(average);
            finalGradeCell.dataset.scaleGrade = convertToScaleGrade(average);
            finalGradeCell.classList.toggle('failed-grade', average < 60);
        }
    });
}

function convertToLetterGrade(average) {
    if (average >= 93) return "A";
    else if (average >= 90) return "A-";
    else if (average >= 87) return "B+";
    else if (average >= 83) return "B";
    else if (average >= 80) return "B-";
    else if (average >= 77) return "C+";
    else if (average >= 73) return "C";
    else if (average >= 70) return "C-";
    else if (average >= 67) return "D+";
    else if (average >= 63) return "D";
    else if (average >= 60) return "D-";
    else return "F";
}

function convertToScaleGrade(average) {
    if (average >= 93) return 4.0;
    else if (average >= 90) return 3.7;
    else if (average >= 87) return 3.3;
    else if (average >= 83) return 3.0;
    else if (average >= 80) return 2.7;
    else if (average >= 77) return 2.3;
    else if (average >= 73) return 2.0;
    else if (average >= 70) return 1.7;
    else if (average >= 67) return 1.3;
    else if (average >= 63) return 1.0;
    else if (average >= 60) return 0.7;
    else return 0.0;
}

function calculateUnsubmittedAssignments(table) {
    var unsubmittedCount = 0;
    var unsubmittedCells = table.querySelectorAll("tbody td.unsubmitted");
    unsubmittedCells.forEach(cell => {
        if (!cell.classList.contains("final-grade")) {
            unsubmittedCount++;
            cell.style.backgroundColor = "yellow";
        }
    });
    // Display the count beneath the table
    var countDisplay = document.createElement("p");
    countDisplay.id = "unsubmittedCount";
    countDisplay.textContent = "Total unsubmitted assignments: " + unsubmittedCount;
    table.parentElement.appendChild(countDisplay);
}

function setupCellValidation(table) {
    table.addEventListener("input", function(event) {
        var target = event.target;
        var value = parseInt(target.innerText);
        if (isNaN(value) || value < 0 || value > 100) {
            target.innerText = "-";
            target.classList.add("unsubmitted");
        } else {
            target.classList.remove("unsubmitted");
            target.style.backgroundColor = ""; // Reset background color
        }
        
        calculateAverages();
        
        updateUnsubmittedCount(table);
    });
}

function addInputListeners(table) {
    var cells = table.querySelectorAll("td");
    cells.forEach(cell => {
        cell.addEventListener("input", function(event) {
            var targetCell = event.target;
            var value = parseInt(targetCell.innerText);
            if (!isNaN(value) && value >= 0 && value <= 100) {
                targetCell.classList.remove("unsubmitted");
                targetCell.style.backgroundColor = ""; // Reset background color
            } else {
                targetCell.classList.add("unsubmitted");
                targetCell.style.backgroundColor = "yellow";
            }
        });
    });
}

function updateUnsubmittedCount(table) {
    var unsubmittedCount = table.querySelectorAll("tbody td.unsubmitted").length;
    var countDisplay = document.getElementById("unsubmittedCount");
    countDisplay.textContent = "Total unsubmitted assignments: " + unsubmittedCount;
}

function setupToggleAverage(table) {
    var finalGradeCells = table.querySelectorAll(".final-grade");
    finalGradeCells.forEach(cell => {
        cell.addEventListener("click", function(event) {
            var target = event.target;
            var currentMode = target.dataset.mode || "percent";
            var average = parseInt(target.dataset.percentGrade);
            if (currentMode === "percent") {
                target.textContent = convertToLetterGrade(average);
                target.dataset.mode = "letter";
                target.title = "Average [Letter]";
            } else if (currentMode === "letter") {
                target.textContent = convertToScaleGrade(average);
                target.dataset.mode = "scale";
                target.title = "Average [4.0]";
            } else {
                target.textContent = average + "%";
                target.dataset.mode = "percent";
                target.title = "Average [%]";
            }
        });
    });
}


function addNewRow() {
    var table = document.getElementById('table');
    var newRow = document.createElement("tr");
    newRow.innerHTML = `<td contenteditable="true"></td>
                        <td contenteditable="true"></td>
                        <td contenteditable="true"></td>
                        <td contenteditable="true"></td>
                        <td contenteditable="true"></td>
                        <td contenteditable="true"></td>
                        <td contenteditable="true"></td>
                        <td class="final-grade"></td>`;
    table.querySelector("tbody").appendChild(newRow);

    // Calculate and display the averages for all rows
    calculateAverages();

    // Update the count of unsubmitted assignments
    updateUnsubmittedCount(table);
}

function addColumn() {
    var table = document.getElementById('table');
    var rowCount = table.rows.length;
    var cellCount = table.rows[0].cells.length;
    var assignmentCellWidth = getAssignmentCellWidth(table);

    var newColumnTitle = prompt("Enter the title for the new column:");
    if (newColumnTitle) {
        // Insert new column title
        var headerRow = table.querySelector("thead tr");
        var newColumnHeader = document.createElement("th");
        newColumnHeader.textContent = newColumnTitle;
        headerRow.insertBefore(newColumnHeader, headerRow.cells[cellCount - 1]); // Insert before "Average" column

        // Insert new column cells
        for (var i = 0; i < rowCount; i++) {
            var cell = table.rows[i].insertCell(cellCount - 1);
            cell.contentEditable = true; // Make the cell editable
            cell.style.width = assignmentCellWidth + "px"; // Set the width of the new cell
        }
    }
}


function getAssignmentCellWidth(table) {
    var assignmentCell = table.querySelector("tbody tr:first-child td:nth-child(3)"); // Get the first assignment cell
    return assignmentCell.offsetWidth; // Get the width of the assignment cell
}


function saveTableState() {
    var table = document.getElementById('table');
    table.dataset.savedState = table.innerHTML;
}

function restoreTableState() {
    var table = document.getElementById('table');
    if (table.dataset.savedState) {
        table.innerHTML = table.dataset.savedState;
    }
    // Reinitialize event listeners and calculations
    calculateAverages();
    calculateUnsubmittedAssignments(table);
    setupCellValidation(table);
    addInputListeners(table);
    setupToggleAverage(table);
}





