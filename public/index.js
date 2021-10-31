
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

// falta validar movimentos de tomada de peça
//falta validar movimentos do tipo que mais de uma peca igual ataca a mesma casa estando em mesma coluna ou mesma linha
// Ex 'N5d4', 'N3d4' ou  Ned4, Ncd4  
// o mesmo vale para tomadas

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