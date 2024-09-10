let board = [];
let openedSquares = [];
let flaggedSquares = [];
let bombCount = 0;
let squaresLeft = 0;
let bombProbability = 3;
let maxProbability = 15;

// Define difficulty settings
const difficulties = {
    'easy': { rowCount: 9, colCount: 9 },
    'medium': { rowCount: 16, colCount: 16 },
    'expert': { rowCount: 16, colCount: 30 }
};

// Start the game with the selected difficulty
function startGame(difficulty) {
    const { rowCount, colCount } = difficulties[difficulty];
    minesweeperGameBootstrapper(rowCount, colCount);
}

function minesweeperGameBootstrapper(rowCount, colCount) {
    generateBoard({ 'rowCount': rowCount, 'colCount': colCount });
    createBoardUI(rowCount, colCount);
}

function generateBoard(boardMetadata) {
    board = [];
    bombCount = 0;
    squaresLeft = boardMetadata.colCount * boardMetadata.rowCount;

    for (let i = 0; i < boardMetadata.rowCount; i++) {
        board[i] = new Array(boardMetadata.colCount);
    }

    for (let i = 0; i < boardMetadata.rowCount; i++) {
        for (let j = 0; j < boardMetadata.colCount; j++) {
            board[i][j] = new BoardSquare(false, 0);
        }
    }

    for (let i = 0; i < boardMetadata.rowCount; i++) {
        for (let j = 0; j < boardMetadata.colCount; j++) {
            if (Math.random() * maxProbability < bombProbability) {
                board[i][j].hasBomb = true;
                bombCount++;
            }
        }
    }

    openedSquares = [];
    flaggedSquares = [];

    for (let i = 0; i < boardMetadata.rowCount; i++) {
        for (let j = 0; j < boardMetadata.colCount; j++) {
            if (!board[i][j].hasBomb) {
                board[i][j].bombsAround = countBombsAround(i, j, boardMetadata);
            }
        }
    }
    console.log(board);
}

function createBoardUI(rows, cols) {
    const gameBoard = document.getElementById("gameBoard");
    gameBoard.innerHTML = ""; // Clear previous board
    gameBoard.style.gridTemplateColumns = `repeat(${cols}, 30px)`; // Set grid columns correctly

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const square = document.createElement("div");
            square.classList.add("square");
            square.id = `square-${i}-${j}`;
            square.onclick = function() { handleSquareClick(i, j); };
            square.oncontextmenu = function(e) { // Right-click handler
                e.preventDefault(); 
                handleRightClick(i, j); 
            };
            gameBoard.appendChild(square);
        }
    }
}

function handleSquareClick(x, y) {
    if (openedSquares.some(pos => pos.x === x && pos.y === y)) {
        return; // Already opened
    }

    discoverTile(x, y);
    updateBoardUI();
}

function handleRightClick(x, y) {
    if (openedSquares.some(pos => pos.x === x && pos.y === y)) {
        return; // Cannot flag an opened square
    }
    
    const flagIndex = flaggedSquares.findIndex(pos => pos.x === x && pos.y === y);
    const square = document.getElementById(`square-${x}-${y}`);
    
    if (flagIndex === -1) {
        flaggedSquares.push(new Pair(x, y));
        square.textContent = "🚩"; // Show flag emoji
    } else {
        flaggedSquares.splice(flagIndex, 1);
        square.textContent = ""; // Remove flag
    }
}

function updateBoardUI() {
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            const square = document.getElementById(`square-${i}-${j}`);
            if (openedSquares.some(pos => pos.x === i && pos.y === j)) {
                square.classList.add("opened");
                square.classList.remove("square");
                if (board[i][j].hasBomb) {
                    square.classList.add("bomb");
                    square.textContent = "💣";
                } else if (board[i][j].bombsAround > 0) {
                    square.textContent = board[i][j].bombsAround;
                }
            }
        }
    }
}

function countBombsAround(x, y, boardMetadata) {
    let bombCount = 0;
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            if (i === 0 && j === 0) continue;
            let nx = x + i;
            let ny = y + j;
            if (nx >= 0 && nx < boardMetadata.rowCount && ny >= 0 && ny < boardMetadata.colCount) {
                if (board[nx][ny].hasBomb) {
                    bombCount++;
                }
            }
        }
    }
    return bombCount;
}

function discoverTile(x, y) {
    if (openedSquares.some(pos => pos.x === x && pos.y === y) || flaggedSquares.some(pos => pos.x === x && pos.y === y)) {
        return; // Already opened or flagged
    }

    openedSquares.push(new Pair(x, y));

    if (board[x][y].hasBomb) {
        alert("Game Over! You hit a bomb.");
        revealAllBombs();
        return;
    }

    squaresLeft--;

    if (squaresLeft === bombCount) {
        alert("Congratulations! You won!");
        return;
    }

    if (board[x][y].bombsAround === 0) {
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (i === 0 && j === 0) continue;
                let nx = x + i;
                let ny = y + j;
                if (nx >= 0 && nx < board.length && ny >= 0 && ny < board[0].length) {
                    discoverTile(nx, ny);
                }
            }
        }
    }
}

function revealAllBombs() {
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            if (board[i][j].hasBomb) {
                openedSquares.push(new Pair(i, j));
            }
        }
    }
    updateBoardUI();
}

class BoardSquare {
    constructor(hasBomb, bombsAround) {
        this.hasBomb = hasBomb;
        this.bombsAround = bombsAround;
    }
}

class Pair {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}
