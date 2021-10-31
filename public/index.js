
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

    // console.log('Source: ' + source)
    // console.log('Target: ' + target)
    console.log('Piece: ' + piece)
    // console.log('New position: ' + Chessboard.objToFen(newPos))
    // console.log('Old position: ' + Chessboard.objToFen(oldPos))
    // console.log('Orientation: ' + orientation)

    console.log('board.position ', board.position())
    console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~')


    const move = getMove(piece, target);

    const isCorrectPiece = piece[0] == chess.turn();
    if (isMovePossible(move) == false || isCorrectPiece == false) {
        console.log('voltar para posicao original')

        setTimeout(() => {
            board.position( {...oldPos} )
        }, 50)

    } else {
        chess.move(move)
    }

    console.log(chess.moves())

}


function getMove(piece, target) {
    const prefix = piece[1]
    const move = `${prefix == 'P' ? '' : prefix}${target}`;
    return move;
}

function isMovePossible(move) {
    return chess.moves().includes(move);
}