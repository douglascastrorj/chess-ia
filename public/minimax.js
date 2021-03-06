/*The "AI" part starts here */


// order moves to improve alpha-beta pruning ( mate check captures other_moves  )  - DONE


// endgame force enemy king to corner
// endgame encourage king to move next to enemy king

let ia_side = 'b'


let _CONFIG = {
    opening: {
        materialWeight: 50, 
        positionWeight: 13,
        kingDistCenter: 100,
        kingsDistance: 800
    },
    middleGame: {
        materialWeight: 50,
        positionWeight: 50,
        kingDistCenter: 100,
        kingsDistance: 800
    },
    endGame: {
        materialWeight: 50,
        positionWeight: 50,
        kingDistance: 160,
        kingDistCenter: 100,
        kingsDistance: 800
    }
}


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

        // if(game.in_checkmate()) {

        //     console.log(val)
        //     console.log(game.ascii())
        // }
        return val;
    }

    var newGameMoves = getOrderMoves(game);

    if(game.in_draw()) return 0;

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
    
    const pieces = getPieces(game.board());

    const material = materialEvaluation(game);
    const position = positionEvaluation(game, pieces);

    const  gameState = getGameState(pieces);

    const materialWeight = _CONFIG[gameState].materialWeight
    const positionWeight = _CONFIG[gameState].positionWeight

    return (material * materialWeight) + (position * positionWeight);
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

function positionEvaluation(game, pieces) {

    let score = 0;
    if(game.in_checkmate() ) {
        if(game.turn() !== ia_side) return  -9999;
        else return 9999;
    } else {

        if(game.in_draw()) return 0;
        
        if(pieces.length <= 10) {
            const wKing = pieces.find( piece => piece.type == 'k' && piece.color == 'w');
            const bKing = pieces.find( piece => piece.type == 'k' && piece.color == 'b');

            const wKingDistCenter = distanceToCenter(wKing);
            const bKingDistCenter = distanceToCenter(bKing);

            const kingsDistance = pieceDistance(wKing, bKing);

            score +=  wKingDistCenter * -100 +  (-800 / kingsDistance);

        }
    }

    const squareValuesArr = pieces.map(piece => getSquareTable(piece, getGameState(pieces))[piece.i][piece.j]);
    const squareValues = squareValuesArr.reduce((prev, cur) => cur + prev, 0);

    return score + squareValues;
}

function getGameState(pieces) {
    if(pieces.length >= 26 ) return 'opening'
    if(pieces.length > 15 && pieces.length < 26) return 'middleGame'
    return 'endGame';
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
    return Math.abs( 4 - piece.i) + Math.abs(4.5 - piece.j);
}

function pieceDistance(a, b) {
    return Math.abs( b.i - a.i) + Math.abs(b.j - a.j);
}

function getSquareTable(piece, gameState) {
    let table;
    if (piece.type === 'p') {
        if(gameState == 'endGame') table = PawnTableEndGame;
        table = PawnTable;
    } else if (piece.type === 'r') {
        if(gameState == 'openning') table = RookTableEarly
        else table = RookTable
    } else if (piece.type === 'n') {
        table = KnightTable;
    } else if (piece.type === 'b') {
        table = BishopTable
    } else if (piece.type === 'q') {
        if(gameState == 'openning') table = QueenTableEarly
        else table = QueenTable
    } else if (piece.type === 'k') {
        if(gameState == 'endGame') table = KingEndGameTable
        table = KingMiddleGameTable
    }

    table = JSON.parse(JSON.stringify(table));

    if(piece.color == 'b') return table;
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
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, -20, -10, -10, -10, -10, -20, 0],
    [0, -30, -20, -20, -20, -20, -30, 0],
    [0, -40, -30, -20, -20, -30, -40, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, -20, -20, -20, -20, -20, -20, 0],
    [0, -30, -30, -30, -30, -30, -30, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
];

const KingEndGameTable = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, -10, -10, -10, -10, 0, 0],
    [0, 0, -15, -25, -25, -15, 0, 0],
    [0, 0, -20, -30,  -30, -20, 0, 0],
    [0, 0, -25, -35, -35, -25, 5, 0],
    [0, 0, -30, -35, -35, -30, 0, 0],
    [0, 0, -35,  -40, -40, -35, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
]

const KingMiddleGameTable = [
    [-50, -100, -30, 10, 0, -40, -125, -115],
    [0, 10, 10, 10, 10, 10, 10, 0],
    [10, 20, 20, 20, 20, 20, 20, 10],
    [20, 30, 30, 30, 30, 30, 30, 20],
    [30, 40, 40, 40, 40, 40, 40, 30],
    [40, 50, 50, 50, 50, 50, 50, 40],
    [50, 60, 60, 60, 60, 60, 60, 50],
    [60, 70, 70, 70, 70, 70, 70, 60],
]

const KnightTable = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [15, -20, -25, -30, -30, -25, -20, 15],
    [10, -15, -20, -25, -25, -20, -15, 10],
    [-5, -10, -15, -20, -20, -15, -10, -5],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
]

const PawnTable = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, -10, -20, -40, -40, -10, 0, 0],
    [0, -10, -30, -50, -50, -30, 0 , 0],
    [0, 0,-5, -10, -10, -5, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
]

const PawnTableEndGame = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [-40, -40, -40, -40, -40, -40, -40, -40],
    [-50, -50, -50, -50, -50, -50, -50, -50],
    [-60, -60, -60, -60, -60, -60, -60, -60],
    [-80, -80, -80, -80, -80, -80, -80, -80],
    [-100, -100, -100, -100, -100, -100, -100, -100],
]

const QueenTableEarly = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 10, 10, 10, 10, 10, 10, 0],
    [0, 20, 20, 20, 20, 20, 20, 0],
    [0, 25, 25, 25, 25, 25, 25, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
]

const QueenTable = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, -10, -10, -10, -10, 0, 0],
    [0, 0, -15, -25, -25, -15, 0, 0],
    [0, 0, -20, -30,  -30, -20, 0, 0],
    [0, 0, -25, -35, -35, -25, 5, 0],
    [0, 0, -30, -35, -35, -30, 0, 0],
    [0, 0, -35,  -40, -40, -35, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
]

const RookTableEarly = [
    [-10, -10, -20, -20, -20, -15, -10, -10],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
]

const RookTable = [
    [-40, -40, -50, -60, -60, -50, -40, -40],
    [-40, -30, -30, -30, -30, -30, -30, -40],
    [-50, -30, -20, -20, -20, -20, -30, -50],
    [-60, -30, -20, 0, 0, -20, -30, -60],
    [-60, -30, -20, 0, 0, -20, -30, -60],
    [-50, -30, -20, 0, 0, -20, -30, -50],
    [-40, -30, -20, -20, -20, -20, -30, -40],
    [-40, -40, -50, -60, -60, -50, -40, -40]
]