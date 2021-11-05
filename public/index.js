
var $status,  $fen;
var board, game;



// const endgameFen = 'r5k1/8/4p3/p7/5K2/8/4p3/8 w - - 8 60'
// const endgameFen = '3K2k1/r7/7b/8/6n1/8/8/8 w - - 22 58'
const endgameFen = '6k1/p7/8/3K4/8/8/8/8 w - - 22 58'

function startBoard() {


    $status = $('#status');
    $fen = $('#fen');

    game = new Chess();

    var cfg = {
        draggable: true,
        position: 'start',
        onDragStart: onDragStart,
        onDrop: onDrop,
        onMouseoutSquare: onMouseoutSquare,
        onMouseoverSquare: onMouseoverSquare,
        onSnapEnd: onSnapEnd,
        onChange: () => {
            $status.html(game.turn() == 'w' ? 'White to play' : 'Black to play')
            $fen.html(game.fen())

            if(game.in_checkmate()) {
                setTimeout(()=> {
                    alert(`${game.turn() == 'w' ? 'Black' : 'White'} wins`)
                }, 300);
            }
        }
    };
    board = ChessBoard('board', cfg);

}



/* board visualization and games state handling */

var onDragStart = function (source, piece, position, orientation) {
    if (game.in_checkmate() === true || game.in_draw() === true ||
        piece.search(/^b/) !== -1) {
        return false;
    }
};

var makeBestMove = function () {
    var bestMove = getBestMove(game);
    game.move(bestMove);
    board.position(game.fen());
    renderMoveHistory(game.history());
    if (game.game_over()) {
        // alert('Game over');
        $('#restartBtn').css('display', 'flex')
    }
};


var positionCount;
var getBestMove = function (game) {
    if (game.game_over()) {
        // alert('Game over');
        $('#restartBtn').css('display', 'flex')
    }

    positionCount = 0;
    var depth = parseInt($('#search-depth').find(':selected').text());

    var d = new Date().getTime();
    var bestMove = minimaxRoot(depth, game, true);
    var d2 = new Date().getTime();
    var moveTime = (d2 - d);
    var positionsPerS = (positionCount * 1000 / moveTime);

    $('#position-count').text(positionCount);
    $('#time').text(moveTime / 1000 + 's');
    $('#positions-per-s').text(positionsPerS);
    return bestMove;
};

var renderMoveHistory = function (moves) {
    var historyElement = $('#move-history').empty();
    historyElement.empty();
    for (var i = 0; i < moves.length; i = i + 2) {
        historyElement.append('<span>' + moves[i] + ' ' + (moves[i + 1] ? moves[i + 1] : ' ') + '</span><br>')
    }
    historyElement.scrollTop(historyElement[0].scrollHeight);

};

var onDrop = function (source, target) {

    var move = game.move({
        from: source,
        to: target,
        promotion: 'q'
    });

    removeGreySquares();
    if (move === null) {
        return 'snapback';
    }

    renderMoveHistory(game.history());
    window.setTimeout(makeBestMove, 250);
};

var onSnapEnd = function () {
    board.position(game.fen());
};

var onMouseoverSquare = function (square, piece) {
    var moves = game.moves({
        square: square,
        verbose: true
    });

    if (moves.length === 0) return;

    greySquare(square);

    for (var i = 0; i < moves.length; i++) {
        greySquare(moves[i].to);
    }
};

var onMouseoutSquare = function (square, piece) {
    removeGreySquares();
};

var removeGreySquares = function () {
    $('#board .square-55d63').css('background', '');
};

var greySquare = function (square) {
    var squareEl = $('#board .square-' + square);

    var background = '#a9a9a9';
    if (squareEl.hasClass('black-3c85d') === true) {
        background = '#696969';
    }

    squareEl.css('background', background);
};


function restart() {
    // $('#restartBtn').css('display', 'none')

    game.reset();
    board.position(game.fen());
}

function undo() {
    game.undo();
    board.position(game.fen());

    game.undo();
    board.position(game.fen());
}

function changePosition() {
    const ruyLopez = 'r1bqkbnr/1ppp1ppp/p1n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 4'
    const sicilian = 'r1bqkbnr/pp2pppp/2np4/1Bp5/4P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 4'
    const endgameFen = '6k1/q7/8/3K4/8/8/8/8 w - - 22 58'

    const position = $('#position-select').find(':selected').val()

    switch(position) {
        case 'start':
            restart();
            break
        case 'ruyLopez':
            game.load(ruyLopez)
            board.position(game.fen())
            break
        case 'sicilian':
            game.load(sicilian)
            board.position(game.fen())
            break
        case 'endGame':
            game.load(endgameFen)
            board.position(game.fen())
            break
    }

}