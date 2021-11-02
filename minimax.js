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

function minimaxRoot({deep, game, maximizer, verbose}) {

    var newGameMoves = game.moves();
    var bestMove = -9999;
    var bestMoveFound;

    for(var i = 0; i < newGameMoves.length; i++) {
        var newGameMove = newGameMoves[i]
        game.move(newGameMove);
        var value = minimax({deep: deep - 1, game, alpha: -10000, beta: 10000, maximizer: !maximizer, verbose});
        game.undo();
        if(value >= bestMove) {
            bestMove = value;
            bestMoveFound = newGameMove;
        }
    }
    
    if(verbose) {
        console.log(`Best Move: ${bestMoveFound} bestMoveValue: ${bestMove}`)
    }
    return bestMoveFound;
};

function minimax({game, deep = 10, maximizer, alpha, beta, verbose}) {

    if(verbose) {
        console.log(`Deep ${deep} Maximizer: ${maximizer}`)
        console.log(`alpha ${alpha} beta: ${beta}`)
        console.log(game.ascii())
    }

    if (game.game_over() || deep == 0 ) {
        return evaluateBoard(game);
    } else if(maximizer) {
        let value = -Infinity;
        for( let move of game.moves()) {
            game.move(move);
            value = Math.max(value, minimax({game, deep: deep - 1, alpha, beta, maximizer: false, verbose}));
            game.undo();
            if (value >= beta) {
                break;// (* β cutoff *)
            }
            alpha = Math.max(alpha, value);
        }
        return value;
    } else {
        let value = Infinity;
        for(let move of game.moves()) {
            game.move(move);
            value = Math.min(value, minimax({game, deep: deep - 1, alpha, beta, maximizer: true, verbose}));
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
            totalEvaluation = totalEvaluation + getPieceValue(board[i][j], i ,j);
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

function findBestMove() {
    const bestMove = minimaxRoot({game, deep:5, maximizer: true, verbose: false});
    return
}


// game.move('e4')
// console.log(game.ascii())

// const bestMove = minimaxRoot({game, deep:5, maximizer: true, verbose: false});

// console.log(game.ascii())
// console.log(`Best Move: ${bestMove}`);
