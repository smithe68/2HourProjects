let Board = [
    [0, 2, 0, 2, 0, 2, 0, 2, 0],
    [2, 0, 2, 0, 2, 0, 2, 0, 2],
    [0, 2, 0, 2, 0, 2, 0, 2, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 0, 1, 0, 1, 0, 1, 0, 1],
    [0, 1, 0, 1, 0, 1, 0, 1, 0],
    [1, 0, 1, 0, 1, 0, 1, 0, 1],
];

const playerOne = '🐶';
const playerTwo = '🐱';

const blackKing = '🐩';
const redKing = '🦝';

let isPlayerOne = false;
let selectedCell = -1;

const Move = {
    ILLEGAL: -1,
    BLANK: 0,
    JUMPED: 1
}


const Piece = {
    EMPTY: 0,
    BLACK: 1,
    RED: 2,
    BLACK_KING: 3,
    RED_KING: 4
}

function createBoard() {
    let $board = $('#board');
    for (let i = 0; i < 64; i++) {
        let cell = document.createElement(`div`);
        cell.classList.add('cell');
        $board.append(cell);
    }

    $('.cell').each((i, el) => {
        $(el).click(() => {
            if (selectedCell === -1) {
                if (isPlayerOne && (el.innerHTML == playerOne || el.innerHTML == blackKing) ||
                    !isPlayerOne && (el.innerHTML == playerTwo || el.innerHTML == redKing)) {
                    selectedCell = i;
                }
            } else {
                let x1 = Math.floor(selectedCell / 8);
                let y1 = selectedCell % 8;
                let x2 = Math.floor(i / 8);
                let y2 = i % 8;
                let piece = Board[x1][y1];

                if (checkMove(x1, y1, x2, y2, piece) !== Move.ILLEGAL) {
                    isPlayerOne = !isPlayerOne;
                    movePiece(x1, y1, x2, y2, piece);
                    updateBoard();
                    let winner = checkWin();
                    if (winner !== "Not Yet") {
                        console.log("DInG DiNG DinG We HAvE a WiNer");
                        $('#turn').html(winner);
                        return;
                    }
                }

                selectedCell = -1;
            }
        });
    });
}

function updateBoard() {
    let $cells = $('.cell');
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            let cell = $cells[i * 8 + j];

            // Get board data
            let cellVal = Board[i][j];

            // Display correct emoji
            switch (cellVal) {
                case 0: cell.innerHTML = ''; break;
                case 1: cell.innerHTML = playerOne; break;
                case 2: cell.innerHTML = playerTwo; break;
                case 3: cell.innerHTML = blackKing; break;
                case 4: cell.innerHTML = redKing; break;
                default:
                    cell.innerHTML = '🐖';
                    break;
            }

            // Get that checkers look
            if ((i + j) % 2 == 0) {
                cell.style.backgroundColor = 'rgba(0, 0, 0, 0.2)';
            }
        }
    }

    $('#turn').html(isPlayerOne ? "Dogs" : "Cats");
}

function checkWin() {
    let red = 0;
    let black = 0;
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            let cell = Board[i][j];
            if (cell === Piece.BLACK || cell === Piece.BLACK_KING) { black++; }
            if (cell === Piece.RED || cell === Piece.RED_KING) { red++; }
        }
    }

    return red <= 0 ? "Black Wins!" :
        black <= 0 ? "Red Wins!" : "Not Yet";
}

function inBounds(x1, y1, x2, y2) {
    return !(x1 < 0 || x2 < 0 || y1 < 0 || y2 < 0 || x1 >= 8 ||
        x2 >= 8 || y1 >= 8 || y2 >= 8 || x1 == x2 || y1 == y2);
}

function isDiagonal(x1, y1, x2, y2) {
    return Math.abs(x1 - x2) == Math.abs(y1 - y2)
}

function movePiece(x1, y1, x2, y2, piece) {
    if (x2 === 7 && piece === Piece.RED) {
        piece = Piece.RED_KING;
    }

    if (x2 === 0 && piece === Piece.BLACK) {
        piece = Piece.BLACK_KING;
    }

    Board[x1][y1] = Piece.EMPTY;
    Board[x2][y2] = piece;
}

// This function moves a piece from one coordinate to another
// it returns -1 if error 0 if move to blank spot and,
// returns 1 if jumped a piece and can move again

// CATS ARE RED = 2
// DOG ARE BLACK = 1
function checkMove(x1, y1, x2, y2, piece) {

    // Check for Legal Move
    if (!inBounds(x1, y1, x2, y2)) {
        console.log("Cannot move out of bounds!");
        return Move.ILLEGAL;
    }

    if (Board[x2][y2] !== Piece.EMPTY) {
        console.log("Cannot move into occupied space!");
        return Move.ILLEGAL;
    }

    if (!isDiagonal(x1, y1, x2, y2)) {
        console.log("Movie is not on a diagonal");
        return Move.ILLEGAL
    }

    // Move in only one direction
    if (piece === Piece.RED && x2 < x1) {
        console.log("Cannot move up!");
        return Move.ILLEGAL;
    }

    if (piece === Piece.BLACK && x2 > x1) {
        console.log("Cannot move down!");
        return Move.ILLEGAL;
    }

    if (Math.abs(x2 - x1) > 2) {
        console.log("Cannot move more than 2 spaces");
        return Move.ILLEGAL;
    }

    if (Math.abs(x2 - x1) === 2) {
        let x3 = Math.floor((x1 + x2) / 2);
        let y3 = Math.floor((y1 + y2) / 2);

        if (Board[x3][y3] === Piece.EMPTY) {
            console.log("Cannot move that distance dummy!");
            return Move.ILLEGAL;
        }

        if (((piece === Piece.RED || piece === Piece.RED_KING) &&
            (Board[x3][y3] === Piece.BLACK || Board[x3][y3] === Piece.BLACK_KING)) ||
            ((piece === Piece.BLACK || piece === Piece.BLACK_KING) &&
                (Board[x3][y3] === Piece.RED || Board[x3][y3] === Piece.RED_KING))) {
            Board[x3][y3] = Piece.EMPTY;
            return Move.JUMPED;
        }
    }
    console.log("EmptyMove")
    return Move.EMPTY;
}

$(() => {
    createBoard();
    updateBoard();
});