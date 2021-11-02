/**
 * ROTINA minimax(nó, profundidade, maximizador)
    SE nó é um nó terminal OU profundidade = 0 ENTÃO
        RETORNE o valor da heurística do nó
    SENÃO SE maximizador é FALSE ENTÃO
        α ← +∞
        PARA CADA filho DE nó
            α ← min(α, minimax(filho, profundidade-1,true))
        FIM PARA
        RETORNE α
    SENÃO
        //Maximizador
        α ← -∞
        //Escolher a maior dentre as perdas causadas pelo minimizador
        PARA CADA filho DE nó
            α ← max(α, minimax(filho, profundidade-1,false))
        FIM PARA
        RETORNE α
    FIM SE
FIM ROTINA
 */

// const { Chess } = require('./node_modules/chess.js');
// const game = new Chess();

function minimaxRoot({ deep, game, maximizer, verbose }) {

    var newGameMoves = game.moves();
    var bestMove = -9999;
    var bestMoveFound;

    for (var i = 0; i < newGameMoves.length; i++) {
        var newGameMove = newGameMoves[i]
        game.move(newGameMove);
        var value = minimax({ deep: deep - 1, game, alpha: -10000, beta: 10000, maximizer: !maximizer, verbose });
        game.undo();
        if (value >= bestMove) {
            bestMove = value;
            bestMoveFound = newGameMove;
        }
    }

    if (verbose) {
        console.log(`Best Move: ${bestMoveFound} bestMoveValue: ${bestMove}`)
    }
    return bestMoveFound;
};

function minimax({ game, deep, maximizer, alpha, beta, verbose }) {

    if (verbose) {
        console.log(`Deep ${deep} Maximizer: ${maximizer}`)
        console.log(`alpha ${alpha} beta: ${beta}`)
        console.log(game.ascii())
    }

    if (game.game_over() || deep == 0) {
        return evaluateBoard(game);
    } else if (maximizer) {
        let value = -Infinity;
        for (let move of game.moves()) {
            game.move(move);
            value = Math.max(value, minimax({ game, deep: deep - 1, alpha, beta, maximizer: false, verbose }));
            game.undo();
            if (value >= beta) {
                break;// (* β cutoff *)
            }
            alpha = Math.max(alpha, value);
        }
        return value;
    } else {
        let value = Infinity;
        for (let move of game.moves()) {
            game.move(move);
            value = Math.min(value, minimax({ game, deep: deep - 1, alpha, beta, maximizer: true, verbose }));
            game.undo();
            if (value <= alpha) {
                break;// (* α cutoff *)
            }
            beta = Math.min(beta, value);
        }
        return value;
    }

}


var evaluateBoard = function (game) {
    // return Math.random()
    const board = game.board();
    var totalEvaluation = 0;
    for (var i = 0; i < 8; i++) {
        for (var j = 0; j < 8; j++) {
            const piece = board[i][j];
            
            totalEvaluation = totalEvaluation + getPieceValue(piece, i, j);

            if(piece) {
                const squareTable = getSquareTable(game, piece);
                totalEvaluation += 0.5* squareTable[i][j];
            }
        }
    }
    return totalEvaluation;
};



function getPieceValue(piece, x, y) {
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

function findBestMove({deep = 3}) {
    const bestMove = minimaxRoot({ game, deep: deep, maximizer: true, verbose: false });
    return bestMove
}


// PIECE SQUARE TABLES

function getSquareTable(game, piece) {
    switch (piece.type) {
        case 'p':
            return PawnTable;
        case 'r':
            return RookTable;
        case 'n':
            return KnightTable;
        case 'b':
            return BishopTable;
        case 'q':
            return QueenTable;
        case 'k':
            return KingMiddleGameTable;
    }
}

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