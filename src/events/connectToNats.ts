import { Codec, connect, JSONCodec } from "nats";

import { NATS_URL } from "@/config/env.js";
import { logger } from "@/middlewares/createLogMiddleware.js";

import { registerEmitterMoveCalculated } from "./emitters/registerEmitterMoveCalculated.js";
import { registerListenerCalculateMoveEngineStrength } from "./listeners/registerListenerCalculateMoveEngineStrength.js";
import { registerListenerCalculateMoveEvaluation } from "./listeners/registerListenerCalculateMoveEvaluation.js";
import { decorateNatsCommunication } from "./middlewares/decorateNatsCommunication.js";

export const jsonCodec: Codec<Record<string, unknown>> = JSONCodec();

export const connectToNats = async () => {
  try {
    const natsClient = await connect({ servers: NATS_URL, waitOnFirstConnect: true });
    decorateNatsCommunication(natsClient, jsonCodec);

    // Listeners
    const listenCalculateMoveEngineStrength = registerListenerCalculateMoveEngineStrength(
      natsClient,
      jsonCodec,
    );
    const listenCalculateMoveEvaluation = registerListenerCalculateMoveEvaluation(
      natsClient,
      jsonCodec,
    );

    // Emitters
    const emitMoveCalculated = registerEmitterMoveCalculated(natsClient, jsonCodec);

    return {
      // Listeners
      listenCalculateMoveEngineStrength,
      listenCalculateMoveEvaluation,
      // Emitters
      emitMoveCalculated,
    };
  } catch (error) {
    logger.error(error);

    throw error;
  }
};

export type NatsEventHandlers = Awaited<ReturnType<typeof connectToNats>>;
