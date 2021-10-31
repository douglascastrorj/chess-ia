


// $('#startBtn').on('click', board.start)
// $('#clearBtn').on('click', board.clear)

var board;
var chess;

function startBoard() {
    chess = new Chess();
    board = Chessboard('board', {
        draggable: true,
        onDrop,
      

        // dropOffBoard: 'trash',
        // sparePieces: true
    })
    board.start();
}


function onDrop(source, target, piece, newPos, oldPos, orientation) {
    console.log('Source: ' + source)
    console.log('Target: ' + target)
    console.log('Piece: ' + piece)
    console.log('New position: ' + Chessboard.objToFen(newPos))
    console.log('Old position: ' + Chessboard.objToFen(oldPos))
    console.log('Orientation: ' + orientation)

    console.log(board.position())
    console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~')

    console.log(chess.moves())
    chess.move('Nf3')
    console.log(chess.moves())
}
