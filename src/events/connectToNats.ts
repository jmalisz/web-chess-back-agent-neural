import { Codec, connect, JSONCodec, Msg, NatsConnection } from "nats";

import { NATS_URL } from "@/config/env.js";
import { logger } from "@/middlewares/createLogMiddleware.js";

import { calculateMoveFactory } from "./callbacks/calculateMove.js";
import { decorateNatsCommunication } from "./middlewares/decorateNatsCommunication.js";

export type CallbackProps = {
  natsClient: NatsConnection;
  jsonCodec: Codec<unknown>;
  message: Msg;
};

type RegisterEventListenerProps = {
  natsClient: NatsConnection;
  jsonCodec: Codec<Record<string, unknown>>;
  subject: string;
  callback: (callbackProps: CallbackProps) => Promise<void>;
};
const registerEventListener = async ({
  natsClient,
  jsonCodec,
  subject,
  callback,
}: RegisterEventListenerProps) => {
  const subscription = natsClient.subscribe(subject);

  for await (const message of subscription) {
    void callback({ natsClient, jsonCodec, message });
  }

  await subscription.drain();
};

export const connectToNats = async () => {
  try {
    const jsonCodec = JSONCodec<Record<string, unknown>>();
    const natsClient = await connect({ servers: NATS_URL, waitOnFirstConnect: true });
    decorateNatsCommunication(natsClient, jsonCodec);

    await Promise.all([
      registerEventListener({
        natsClient,
        jsonCodec,
        subject: "agent.neuralNetwork.calculateMove",
        callback: calculateMoveFactory(),
      }),
    ]);
  } catch (error) {
    logger.error(error);

    throw error;
  }
};
