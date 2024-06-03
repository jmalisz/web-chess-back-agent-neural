import { Chess as BaseChess, Color, PieceSymbol } from "chess.js";

const COLORS_LIST: Color[] = ["w", "b"] as const;
const PIECES_LIST: PieceSymbol[] = ["p", "r", "n", "b", "q", "k"] as const;

export class Chess extends BaseChess {
  // The order of operations may be slightly strange (with reverses)
  // That's due to neural network training data, which had some bits switched
  binary() {
    const positionBinary: number[] = [];

    const board = this.board().reverse();
    board.forEach((boardRow) => boardRow.reverse());
    // Append position bits
    for (const color of COLORS_LIST) {
      for (const piece of PIECES_LIST) {
        for (const boardRow of board) {
          for (const boardPiece of boardRow) {
            const value = boardPiece?.color === color && boardPiece?.type === piece;
            positionBinary.push(Number(value));
          }
        }
      }
    }

    // Append turn bit
    positionBinary.push(Number(this.turn() === "w"));

    // Append castling rights bits
    for (const color of COLORS_LIST.reverse()) {
      const { q: queenSide, k: kingSide } = this.getCastlingRights(color);
      positionBinary.push(Number(queenSide), Number(kingSide));
    }

    // Required based on how neural network was trained
    while (positionBinary.length < 800) {
      positionBinary.push(0);
    }

    return positionBinary;
  }
}
