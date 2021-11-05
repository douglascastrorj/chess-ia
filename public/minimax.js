/*The "AI" part starts here */


// order moves to improve alpha-beta pruning ( mate check captures other_moves  )  - DONE


// endgame force enemy king to corner
// endgame encourage king to move next to enemy king

let ia_side = 'b'

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
    var bestMove = -Infinity;
    var bestMoveFound;

    for (var i = 0; i < newGameMoves.length; i++) {
        var newGameMove = newGameMoves[i]
        game.move(newGameMove);
        var value = minimax(depth - 1, game, -10000, 10000, !isMaximisingPlayer);

        console.log(value, bestMove);

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
        const val = -evaluateBoard(game);

        if(game.in_checkmate()) {

            console.log(val)
            console.log(game.ascii())
        }
        return val;
    }

    var newGameMoves = getOrderMoves(game);

    if(game.in_stalemate()) return 0; 

    if (isMaximisingPlayer) {
        var bestMove = -Infinity;
        for (var i = 0; i < newGameMoves.length; i++) {
            game.move(newGameMoves[i]);
            // const newDepth = newGameMoves[i].includes('x') || newGameMoves[i].includes('+') ? depth - 0.3 : depth - 1
            const move =  minimax(depth - 1, game, alpha, beta, !isMaximisingPlayer)
            bestMove = Math.max(bestMove, move);
            game.undo();
            alpha = Math.max(alpha, bestMove);
            if (beta <= alpha) {
                return bestMove;
            }
        }
        return bestMove;
    } else {
        var bestMove = Infinity;
        for (var i = 0; i < newGameMoves.length; i++) {
            game.move(newGameMoves[i]);
            const move = minimax(depth - 1, game, alpha, beta, !isMaximisingPlayer);
            bestMove = Math.min(bestMove, move);
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
    

    const material = materialEvaluation(game);
    const position = positionEvaluation(game);

    return material + position;
};

function materialEvaluation(game) {
    const board = game.board();
    var totalEvaluation = 0;
    for (var i = 0; i < 8; i++) {
        for (var j = 0; j < 8; j++) {
            totalEvaluation = totalEvaluation + getPieceValue(board[i][j]);
        }
    }
    return totalEvaluation;
}

function positionEvaluation(game) {
    const pieces = getPieces(game.board());

    let score = 0;
    if(game.in_checkmate() ) {
        if(game.turn() !== ia_side) return  -9999;
        else return 9999;
    } else {

        if(game.in_stalemate()) return 0;
        
        if(pieces.length <= 10) {
            const wKing = pieces.find( piece => piece.type == 'k' && piece.color == 'w');
            const bKing = pieces.find( piece => piece.type == 'k' && piece.color == 'b');

            const wKingDistCenter = distanceToCenter(wKing);
            const bKingDistCenter = distanceToCenter(bKing);

            const kingsDistance = pieceDistance(wKing, bKing);

            score +=  wKingDistCenter * -10 +  (-160 / kingsDistance);

        }
    }

    const squareValuesArr = pieces.map(piece => getSquareTable(piece, pieces.length <= 10 ? 'end' : 'early')[piece.i][piece.j]);
    const squareValues = squareValuesArr.reduce((prev, cur) => cur + prev, 0);

    return score + squareValues / 5;
}

function getPieces(board) {
    let pieces = [];

    for(let i = 0; i < board.length; i++) {
        for(let j = 0; j < board.length; j++) {
            const piece = {...board[i][j], i, j };
            if(board[i][j]) pieces.push(piece)
        }   
    }

    return pieces;
}

function distanceToCenter(piece) {
    return Math.abs( 8 - piece.i) + Math.abs(8 - piece.j);
}

function pieceDistance(a, b) {
    return Math.abs( b.i - a.i) + Math.abs(b.j - a.j);
}

function getSquareTable(piece, gameState) {
    let table;
    if (piece.type === 'p') {
        if(gameState == 'end') table = PawnTableEndGame;
        return table = PawnTable;
    } else if (piece.type === 'r') {
        table = RookTable
    } else if (piece.type === 'n') {
        table = KnightTable;
    } else if (piece.type === 'b') {
        table = BishopTable
    } else if (piece.type === 'q') {
        table = QueenTable
    } else if (piece.type === 'k') {
        if(gameState == 'end') table = KingEndGameTable
        table = KingMiddleGameTable
    }

    table = JSON.parse(JSON.stringify(table));

    if(piece.color == 'w') return table;
    else {
        return table.reverse().map( row => row.map(col => col * -1))
    }
}


var getPieceValue = function (piece) {
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
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [15, 20, 25, 30, 30, 25, 20, 15],
    [10, 15, 20, 25, 25, 20, 15, 10],
    [5, 10, 15, 20, 20, 15, 10, 5],
    [0, 5, 10, 15, 15, 10, 5, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
]

const PawnTable = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 5, 10, 10, 5, 0, 0],
    [0, 10, 30, 50, 50, 30, 0 , 0],
    [0, 10, 20, 40, 40, 10, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
]

const PawnTableEndGame = [
    [100, 100, 100, 100, 100, 100, 100, 100],
    [80, 80, 80, 80, 80, 80, 80, 80],
    [60, 60, 60, 60, 60, 60, 60, 60],
    [50, 50, 50, 50, 50, 50, 50, 50],
    [40, 40, 40, 40, 40, 40, 40, 40],
    [20, 20, 20, 30, 30, 20, 20, 20],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
]

const QueenTable = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 10, 10, 10, 10, 0, 0],
    [0, 0, 10, 10, 10, 10, 0, 0],
    [0, 0, 0, 10, 10, 0, 0, 0],
]

const RookTable = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [30, 30, 30, 30, 30, 30, 30, 30],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [10, 10, 10, 10, 10, 10, 10, 10],
]