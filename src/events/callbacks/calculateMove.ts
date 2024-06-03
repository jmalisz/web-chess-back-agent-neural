import { validator } from "@/config/validators.js";
import { CallbackProps } from "@/events/connectToNats.js";
import { gameDataSchema } from "@/models/GameData.js";
import { Chess } from "@/services/chess/chess.js";
import { factoryNeuralNetwork } from "@/services/neuralNetwork/neuralNetwork.js";

const payloadSchema = gameDataSchema;
const scoresListResponseSchema = validator.array(validator.number());

export const calculateMoveFactory = () => {
  const neuralNetwork = factoryNeuralNetwork();
  const chess = new Chess();

  return async ({ natsClient, jsonCodec, message }: CallbackProps) => {
    const { elo, gameId, gamePositionPgn } = payloadSchema.parse(jsonCodec.decode(message.data));

    chess.loadPgn(gamePositionPgn);
    const movesList = chess.moves();

    const scoresListRequest = natsClient.request(
      "agent.scoreMovesStrength",
      jsonCodec.encode(gamePositionPgn),
    );
    const scoresListPromise = scoresListRequest.then((response) =>
      scoresListResponseSchema.parse(response.json()),
    );

    const predictionsListPromise = Promise.all(
      movesList.map(async (move) => {
        chess.move(move);
        const positionBinary = chess.binary();
        positionBinary[780] = elo;
        chess.undo();

        const prediction = await neuralNetwork.predict(positionBinary);

        return prediction;
      }),
    );

    const [scoresList, predictionsList] = await Promise.all([
      scoresListPromise,
      predictionsListPromise,
    ]);
    if (scoresList.length !== predictionsList.length) {
      throw new Error("Scores list and predictions list lengths doesn't match");
    }
    const combinedListLength = scoresList.length;
    const combinedList: [string, number, boolean][] = [];
    for (let index = 0; index < combinedListLength; index += 1) {
      const move = movesList[index];
      const score = scoresList[index];
      const prediction = predictionsList[index];
      if (move === undefined || score === undefined || prediction === undefined) {
        throw new Error("Undefined score or prediction");
      }
      combinedList.push([move, score, prediction]);
    }
    combinedList.sort(([, scoreA], [, scoreB]) => scoreA - scoreB);

    const foundIndex = combinedList.findIndex((entry) => entry[2]);
    const move = combinedList[foundIndex === -1 ? 0 : foundIndex]?.[0];
    if (!move) {
      throw new Error("Undefined move");
    }

    chess.move(move);

    natsClient.publish(
      "agent.moveCalculated",
      jsonCodec.encode({ gameId, gamePositionPgn: chess.pgn() }),
    );
  };
};
