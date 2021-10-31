


// $('#startBtn').on('click', board.start)
// $('#clearBtn').on('click', board.clear)

var board;
var chess;
var tryMove;

function startBoard() {
    chess = new Chess();
    board = Chessboard('board', {
        draggable: true,
        onDrop,
        onChange

        // dropOffBoard: 'trash',
        // sparePieces: true
    })
    board.start();
}



function onChange(oldPos, newPos) {

    // if(!tryMove) return;
    // if(Chessboard.objToFen(oldPos) == Chessboard.objToFen(newPos)) return

    // console.log('onChabnge', tryMove, newPos);

    // console.log('is move possible ', isMovePossible(tryMove))

    // if(isMovePossible(tryMove) == false) {
    //     console.log('voltar para posicao original')
    //     const oldPositionFen = Chessboard.objToFen(oldPos);
    //     console.log(oldPos)
    //     // board.position( oldPos )
    //     // board.position({
    //     //     a4: 'bK',
    //     //     c4: 'wK',
    //     //     a7: 'wR'
    //     //   })

    // } else {
    //     // chess.move(move)
    // }
}


function onDrop(source, target, piece, newPos, oldPos, orientation) {

    // console.log('Source: ' + source)
    // console.log('Target: ' + target)
    // console.log('Piece: ' + piece)
    // console.log('New position: ' + Chessboard.objToFen(newPos))
    // console.log('Old position: ' + Chessboard.objToFen(oldPos))
    // console.log('Orientation: ' + orientation)

    console.log('board.position ', board.position())
    console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~')

    console.log('oldPos', oldPos)


    const move = getMove(piece, target);

    tryMove = move;

    if (isMovePossible(tryMove) == false) {
        console.log('voltar para posicao original')

        setTimeout(() => {
            board.position( {...oldPos} )
        }, 50)

    } else {
        chess.move(move)
    }


}


function getMove(piece, target) {
    const prefix = piece[1]
    const move = `${prefix == 'P' ? '' : prefix}${target}`;
    return move;
}

function isMovePossible(move) {
    return chess.moves().includes(move);
}