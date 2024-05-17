import { Chess } from "chess.js";

import { NatsEventHandlers } from "@/events/connectToNats.js";

type RegisterServiceCalculateMoveProps = {
  listenCalculateMoveEngineStrength: NatsEventHandlers["listenCalculateMoveEngineStrength"];
  listenCalculateMoveEvaluation: NatsEventHandlers["listenCalculateMoveEvaluation"];
  emitMoveCalculated: NatsEventHandlers["emitMoveCalculated"];
};

export const registerServiceCalculateMove = ({
  listenCalculateMoveEngineStrength,
  listenCalculateMoveEvaluation,
  emitMoveCalculated,
}: RegisterServiceCalculateMoveProps) => {
  const chess = new Chess();
  // eslint-disable-next-line no-console
  console.log(
    chess,
    listenCalculateMoveEngineStrength,
    listenCalculateMoveEvaluation,
    emitMoveCalculated,
  );
};
