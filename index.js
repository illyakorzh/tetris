let figure;
let nameFigure;
let cells;
let startX;
let startY;
let isInterval = true;
let moveFigureInterval;
let countCompletedLine = 0;
const PLAY_FIELD_COLUMNS = 10;
const PLAY_FIELD_ROWS = 20;
let speedDependOnLevel = 1100;
const theBestResult = localStorage.getItem("theBestResult");
const theBestResultElem = document.getElementById("theBestResult");
const countScore = document.getElementById("countScore");
const countLevel = document.getElementById("countLevel");
const gameOver = document.getElementById("gameOver");
const buttonRefresh = document.querySelector(".button");
const quantityCells = PLAY_FIELD_ROWS * PLAY_FIELD_COLUMNS;
const playField = new Array(PLAY_FIELD_ROWS).fill([]).map(() => new Array(PLAY_FIELD_COLUMNS).fill(0));
const tetris = document.querySelector(".tetris");
const FIGURES_NAMES = [ "O", "L", "I", "Z", "T" ];
const FIGURES = {
	O: [ [ 1, 1 ], [ 1, 1 ], ],
	L: [ [ 0, 0, 1 ], [ 1, 1, 1 ], [ 0, 0, 0 ], ],
	I: [ [ 1, 1, 1, 1 ], [ 0, 0, 0, 0 ], [ 0, 0, 0, 0 ], [ 0, 0, 0, 0 ], ],
	Z: [ [ 0, 1, 0 ], [ 0, 1, 1 ], [ 0, 0, 1 ], ],
	T: [ [ 1, 1, 1 ], [ 0, 1, 0 ], [ 0, 0, 0 ], ],
};

const convertPositionToIndex = ( row, column ) => row * PLAY_FIELD_COLUMNS + column;

const getRandomFigure = () => Math.ceil(Math.random() * FIGURES_NAMES.length) - 1;

function applyToFigureCells( rowLength, columnLength, callback ) {
	for ( let row = 0; row < rowLength; row++ ) {
		for ( let column = 0; column < columnLength; column++ ) {
			callback(row, column);
		}
	}
}

function hasCollisions() {
	let collisionDetected = false;
	applyToFigureCells(figure.matrix.length, figure.matrix.length, ( row, column ) => {
		if ( figure.matrix[row][column] && playField[figure.row + row]?.[figure.column + column] ) {
			collisionDetected = true;
		}
	});
	return collisionDetected;
}

function isOutsideOfGameBoard() {
	let isOutside = false;
	applyToFigureCells(figure.matrix.length, figure.matrix.length, ( row, column ) => {
		const currentColumn = figure.column + column;
		const currentRow = figure.row + row;
		if ( figure.matrix[row][column] ) {
			if ( currentColumn < 0 || currentColumn >= PLAY_FIELD_COLUMNS || currentRow >= PLAY_FIELD_ROWS ) {
				isOutside = true;
			}
		}
	});
	return isOutside;
}

function rotate( arr ) {
	const rotated = new Array(arr.length).fill(0).map(() => new Array(arr.length).fill(0));
	applyToFigureCells(arr.length, arr.length, ( row, column ) => {
		rotated[column][arr.length - 1 - row] = arr[row][column];
	});
	return rotated;
}

function rotateBack( arr ) {
	const rotated = new Array(arr.length).fill(0).map(() => new Array(arr.length).fill(0));
	applyToFigureCells(arr.length, arr.length, ( row, column ) => {
		rotated[arr.length - 1 - column][row] = arr[row][column];
	});
	return rotated;
}

function createCells() {
	for ( let i = 0; i < quantityCells; i++ ) {
		const cell = document.createElement("div");
		cell.classList.add("cell");
		tetris.append(cell);
	}
	cells = document.querySelectorAll(".cell");
}

createCells();

function drawPlayField() {
	applyToFigureCells(PLAY_FIELD_ROWS, PLAY_FIELD_COLUMNS, ( row, column ) => {
		const name = playField[row][column];
		const cellIndex = convertPositionToIndex(row, column);
		cells[cellIndex].classList.add(name);
	});
}

function generateFigure() {
	nameFigure = FIGURES_NAMES[getRandomFigure()];
	const column = PLAY_FIELD_COLUMNS / 2 - Math.floor(FIGURES[nameFigure].length / 2);
	figure = {
		name:   nameFigure,
		matrix: FIGURES[nameFigure],
		row:    -3,
		column,
	};
}

generateFigure();

function drawFigure() {
	applyToFigureCells(figure.matrix.length, figure.matrix.length, ( row, column ) => {

		if ( figure.matrix[row][column] && figure.row + row >= 0 ) {
			const cellIndex = convertPositionToIndex(figure.row + row, figure.column + column);
			cells[cellIndex].classList.add(figure.name);
		}
	});
}

drawFigure();

function moveFigureDownSpeed() {
	moveFigureInterval = setInterval(() => {
		figure.row++;
		cells.forEach(cell => cell.removeAttribute("class"));
		if ( isOutsideOfGameBoard() || hasCollisions() ) {
			figure.row--;
			placeFigure();
		}
		drawPlayField();
		drawFigure();
	}, speedDependOnLevel);
}

moveFigureDownSpeed();

function increaseLevel() {
	const linesForLevelUp = [ 10, 20, 30, 40, 50, 60, 70, 80, 90, 100 ];
	let level = 1;

	for ( let i = 0; i < linesForLevelUp.length; i++ ) {
		if ( countCompletedLine > linesForLevelUp[i] ) {
			level = i + 2;
		}
	}

	if ( level > +countLevel.innerText ) {
		countLevel.innerText = String(level);
		speedDependOnLevel -= 100;
		clearInterval(moveFigureInterval);
		moveFigureDownSpeed();
	}
}

function increaseScore( countLine ) {
	let scoreToAdd;

	if ( countLine === 1 ) {
		scoreToAdd = 10;
	} else if ( countLine === 2 ) {
		scoreToAdd = 30;
	} else if ( countLine === 3 ) {
		scoreToAdd = 50;
	} else if ( countLine >= 4 ) {
		scoreToAdd = 100;
	}

	countScore.innerText = String(+countScore.innerText + scoreToAdd);
	countCompletedLine += countLine;
	increaseLevel();
}

function removeLine() {
	const arrFoolLine = [];
	//find all filled line
	playField.map(( row, i ) => {
		if ( row.every(el => el) ) {
			arrFoolLine.push(i);
		}
	});
	//remove filled line
	arrFoolLine.map(i => {
		playField.splice(i, 1);
		playField.unshift(new Array(PLAY_FIELD_COLUMNS).fill(0));
	});
	arrFoolLine.length && increaseScore(arrFoolLine.length);
}

function saveResult() {
	if ( theBestResult ) {
		if ( +countScore.innerText > +theBestResult ) {
			localStorage.setItem("theBestResult", countScore.innerText);
		}
	} else {
		localStorage.setItem("theBestResult", countScore.innerText);
	}
}

function finishGame() {
	saveResult();
	theBestResultElem.innerText = theBestResult;
	playField.map(arr => arr.fill(0));
	clearInterval(moveFigureInterval);
	gameOver.style.cssText = `
  display: flex;
`;
	document.removeEventListener("keydown", onKeyDown);
}

function placeFigure() {
	if ( figure.row >= 0 ) {
		applyToFigureCells(figure.matrix.length, figure.matrix.length, ( row, column ) => {
			if ( figure.matrix[row][column] ) {
				playField[figure.row + row][figure.column + column] = nameFigure;
			}
		});
		removeLine();
		generateFigure();
	} else {
		finishGame();
	}

}

function changeFigurePosition() {
	figure.matrix = rotate(figure.matrix);
	if ( isOutsideOfGameBoard() || hasCollisions() ) {
		figure.matrix = rotateBack(figure.matrix);
	}
}

function moveFigureDown() {
	figure.row++;
	if ( isOutsideOfGameBoard() || hasCollisions() ) {
		figure.row--;
		placeFigure();
	}
}

function moveFigureLeft() {
	figure.column--;
	if ( isOutsideOfGameBoard() || hasCollisions() ) {
		figure.column++;
	}
}

function moveFigureRight() {
	figure.column++;
	if ( isOutsideOfGameBoard() || hasCollisions() ) {
		figure.column--;
	}
}

function dropFigureDown() {
	while ( !hasCollisions() && !isOutsideOfGameBoard() ) {
		figure.row++;
	}
	figure.row--;
}

function onKeyDownSpace( event ) {
	if ( event.key === "p" ) {
		if ( isInterval ) {
			clearInterval(moveFigureInterval);
			document.removeEventListener("keydown", onKeyDown);
		} else {
			moveFigureDownSpeed();
			document.addEventListener("keydown", onKeyDown);
			isInterval = true;
		}
	}
}

function onKeyDown( event ) {
	if ( event.key === " " ) dropFigureDown();
	if ( event.key === "ArrowUp" ) changeFigurePosition();
	if ( event.key === "ArrowDown" ) moveFigureDown();
	if ( event.key === "ArrowLeft" ) moveFigureLeft();
	if ( event.key === "ArrowRight" ) moveFigureRight();
	cells.forEach(cell => cell.removeAttribute("class"));
	drawPlayField();
	drawFigure();
}

buttonRefresh.addEventListener("click", () => {
	console.log("refreshGame");
	gameOver.style.cssText = `
  display: none;
`;
	countScore.innerText = "0";
	countLevel.innerText = "1";
	speedDependOnLevel = 1100;
	generateFigure();
	drawFigure();
	moveFigureDownSpeed();
	document.addEventListener("keydown", onKeyDown);

});

document.addEventListener("keydown", onKeyDown);
document.addEventListener("keydown", onKeyDownSpace);
document.addEventListener("visibilitychange", function () {
	if ( document.visibilityState === "hidden" ) {
		clearInterval(moveFigureInterval);
	} else {
		clearInterval(moveFigureInterval);
		moveFigureDownSpeed();
	}
});

/////////////////////////////////////////////////////////////////////

const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

if ( isMobile ) {
	document.addEventListener("click",  moveFigureDown);
}

function touchstart( e ) {
	startX = e.touches[0].clientX;
	startY = e.touches[0].clientY;
}

document.addEventListener("touchstart", touchstart, { passive: false });

function touchmove( e ) {
	e.preventDefault();

	const endX = e.touches[0].clientX;
	const endY = e.touches[0].clientY;

	const deltaX = endX - startX;
	const deltaY = endY - startY;

	if ( startX && startY ) {
		if ( Math.abs(deltaX) > Math.abs(deltaY) ) {
			if ( deltaX > 0 ) moveFigureRight();
			if ( deltaX < 0 ) moveFigureLeft();
		}
		if ( Math.abs(deltaY) > Math.abs(deltaX) ) {
			if ( deltaY < 0 ) changeFigurePosition();
			if ( deltaY > 0 ) dropFigureDown();
		}
		startX = null;
		startY = null;
	}
}

document.addEventListener("touchmove", touchmove, { passive: false });
