/*The "AI" part starts here */


// order moves to improve alpha-beta pruning ( mate check captures other_moves  )  - DONE


// endgame force enemy king to corner
// endgame encourage king to move next to enemy king

function getOrderMoves(game) {
    const moves = game.moves();

    const mateMoves = moves.filter(move => move.includes('#'))
    const capturesMoves = moves.filter(move => move.includes('x'))
    const checkMoves = moves.filter( move => move.includes('+'))
    const other = moves.filter(move => !move.includes('#') && !move.includes('+') && !move.includes('x'))

    return [...mateMoves, ...capturesMoves, ...checkMoves, ...other];
}


var minimaxRoot = function (depth, game, isMaximisingPlayer) {

    var newGameMoves = getOrderMoves(game)
    var bestMove = -9999;
    var bestMoveFound;

    for (var i = 0; i < newGameMoves.length; i++) {
        var newGameMove = newGameMoves[i]
        game.move(newGameMove);
        var value = minimax(depth - 1, game, -10000, 10000, !isMaximisingPlayer);
        game.undo();
        if (value >= bestMove) {
            bestMove = value;
            bestMoveFound = newGameMove;
        }
    }
    return bestMoveFound;
};

var minimax = function (depth, game, alpha, beta, isMaximisingPlayer) {
    positionCount++;
    if (depth === 0) {
        return -evaluateBoard(game);
    }

    var newGameMoves = getOrderMoves(game);

    if (isMaximisingPlayer) {
        var bestMove = -9999;
        for (var i = 0; i < newGameMoves.length; i++) {
            game.move(newGameMoves[i]);
            bestMove = Math.max(bestMove, minimax(depth - 1, game, alpha, beta, !isMaximisingPlayer));
            game.undo();
            alpha = Math.max(alpha, bestMove);
            if (beta <= alpha) {
                return bestMove;
            }
        }
        return bestMove;
    } else {
        var bestMove = 9999;
        for (var i = 0; i < newGameMoves.length; i++) {
            game.move(newGameMoves[i]);
            bestMove = Math.min(bestMove, minimax(depth - 1, game, alpha, beta, !isMaximisingPlayer));
            game.undo();
            beta = Math.min(beta, bestMove);
            if (beta <= alpha) {
                return bestMove;
            }
        }
        return bestMove;
    }
};

var evaluateBoard = function (game) {
    const board = game.board();

    if(game.in_checkmate()) {
        return game.turn() == 'w' ? 9999 : -9999;
    }

    const material = materialEvaluation(board);
    const position = positionEvaluation(board);

    return material + position;
};

function materialEvaluation(board) {
    var totalEvaluation = 0;
    for (var i = 0; i < 8; i++) {
        for (var j = 0; j < 8; j++) {
            totalEvaluation = totalEvaluation + getPieceValue(board[i][j], i, j);
        }
    }
    return totalEvaluation;
}

function positionEvaluation(board) {
    let blackPieces = []
    let whitePieces = []
    var totalEvaluation = 0;
    for (var i = 0; i < 8; i++) {
        for (var j = 0; j < 8; j++) {
            const piece = board[i][j];
            if (piece) {
                const pieceInfo = {
                    ...piece,
                    i,
                    j
                };

                if (piece.color == 'b') blackPieces.push(pieceInfo)
                else whitePieces.push(pieceInfo)
            }
        }
    }

    const isEarlyGame = blackPieces.length + whitePieces.length >= 22;

    for (let piece of blackPieces) {
        totalEvaluation += -Math.abs(getSquareTableValue(piece, isEarlyGame));
    }

    for (let piece of whitePieces) {
        totalEvaluation += Math.abs(getSquareTableValue(piece, isEarlyGame));
    }

    return totalEvaluation;
}

function getSquareTableValue(piece, isEarlyGame) {
    const center = 4.5;

    const distanceFromCenter = (x) => Math.abs(x - center);

    return 10 / (distanceFromCenter(piece.i) + distanceFromCenter(piece.j))
    // if (piece.type === 'p') {
    //     if( isEarlyGame ) return 100/distanceFromCenter(piece.i) + 100/distanceFromCenter(piece.j)
    //     else return 100 / (Math.abs(piece.i - 4) + Math.abs(piece.i - 4));
    // } else if (piece.type === 'r') {
    //     return 0
    // } else if (piece.type === 'n') {
    //     return 100 * (Math.abs(piece.i - 4) + Math.abs(piece.i - 4));
    // } else if (piece.type === 'b') {
    //     return 0
    // } else if (piece.type === 'q') {
    //     return 0
    // } else if (piece.type === 'k') {
    //     if(isEarlyGame) return 0
    //     else return 0
    // }
}


var getPieceValue = function (piece, x, y) {
    if (piece === null) {
        return 0;
    }
    var getAbsoluteValue = function (piece) {
        if (piece.type === 'p') {
            return 10;
        } else if (piece.type === 'r') {
            return 50;
        } else if (piece.type === 'n') {
            return 30;
        } else if (piece.type === 'b') {
            return 30;
        } else if (piece.type === 'q') {
            return 90;
        } else if (piece.type === 'k') {
            return 900;
        }
        throw "Unknown piece type: " + piece.type;
    };

    var absoluteValue = getAbsoluteValue(piece);
    return piece.color === 'w' ? absoluteValue : -absoluteValue;
};


const BishopTable = [
    [-40, -20, -20, -20, -20, -20, -20, -40,],
    [-20, 0, 0, 0, 0, 0, 0, -20,],
    [-20, 0, 10, 20, 20, 10, 0, -20,],
    [-20, 10, 10, 20, 20, 10, 10, -20,],
    [-20, 0, 20, 20, 20, 20, 0, -20,],
    [-20, 20, 20, 20, 20, 20, 20, -20,],
    [-20, 10, 0, 0, 0, 0, 10, -20,],
    [-40, -20, -20, -20, -20, -20, -20, -40]
];

const KingEndGameTable = [
    [-175, -175, -175, -175, -175, -175, -175, -175,],
    [-175, -50, -50, -50, -50, -50, -50, -175,],
    [-175, -50, 50, 50, 50, 50, -50, -175,],
    [-175, -50, 50, 150, 150, 50, -50, -175,],
    [-175, -50, 50, 100, 100, 50, -50, -175,],
    [-175, -50, 50, 50, 50, 50, -50, -175,],
    [-175, -50, -50, -50, -50, -50, -50, -175,],
    [-175, -175, -175, -175, -175, -175, -175, -175],
]

const KingMiddleGameTable = [
    [-60, -80, -80, -2, -20, -80, -80, -60],
    [-60, -80, -80, -2, -20, -80, -80, -60],
    [-60, -80, -80, -2, -20, -80, -80, -60],
    [-60, -80, -80, -2, -20, -80, -80, -60],
    [-40, -60, -60, -8, -80, -60, -60, -40],
    [-20, -40, -40, -40, -40, -40, -40, -20],
    [40, 40, 0, 0, 0, 0, 40, 40],
    [40, 60, 20, 0, 0, 20, 60, 40]
]

const KnightTable = [
    [-20, -80, -60, -60, -60, -60, -80, -20],
    [-80, -40, 0, 0, 0, 0, -40, -80],
    [-60, 0, 20, 30, 30, 20, 0, -60],
    [-60, 10, 30, 40, 40, 30, 10, -60],
    [-60, 0, 30, 40, 40, 30, 0, -60],
    [-60, 10, 20, 30, 30, 30, 1, -60],
    [-80, -40, 0, 10, 10, 0, -4, -80],
    [-20, -80, -60, -60, -60, -60, -80, -20],
]

const PawnTable = [
    [9000, 9000, 9000, 9000, 9000, 9000, 9000, 9000],
    [200, 200, 200, 200, 200, 200, 200, 200],
    [100, 100, 100, 100, 100, 100, 100, 100],
    [40, 40, 90, 100, 100, 90, 40, 40],
    [20, 20, 20, 100, 150, 20, 20, 20],
    [2, 4, 0, 15, 4, 0, 4, 2],
    [-10, -10, -10, -20, -35, -10, -10, -10],
    [0, 0, 0, 0, 0, 0, 0, 0]
]

const PawnTableEndGame = [
    [9000, 9000, 9000, 9000, 9000, 9000, 9000, 9000],
    [500, 500, 500, 500, 500, 500, 500, 500],
    [300, 300, 300, 300, 300, 300, 300, 300],
    [90, 90, 90, 100, 100, 90, 90, 90],
    [70, 70, 70, 85, 85, 70, 70, 70],
    [20, 20, 20, 20, 20, 20, 20, 20],
    [-10, -10, -10, -10, -10, -10, -10, -10],
    [0, 0, 0, 0, 0, 0, 0, 0]
]

const QueenTable = [
    [-40, -20, -20, -10, -10, -20, -20, -40],
    [-20, 0, 0, 0, 0, 0, 0, -20],
    [-20, 0, 10, 10, 10, 10, 0, -20],
    [-10, 0, 10, 10, 10, 10, 0, -10],
    [0, 0, 10, 10, 10, 10, 0, -10],
    [-20, 10, 10, 10, 10, 10, 0, -20],
    [-20, 0, 10, 0, 0, 0, 0, -20],
    [-40, -20, -20, -10, -10, -20, -20, -40]
]

const RookTable = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [10, 20, 20, 20, 20, 20, 20, 10],
    [-10, 0, 0, 0, 0, 0, 0, -10],
    [-10, 0, 0, 0, 0, 0, 0, -10],
    [-10, 0, 0, 0, 0, 0, 0, -10],
    [-10, 0, 0, 0, 0, 0, 0, -10],
    [-10, 0, 0, 0, 0, 0, 0, -10],
    [-30, 30, 40, 10, 10, 0, 0, -30]
]