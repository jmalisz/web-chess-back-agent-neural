import { Codec, NatsConnection, PublishOptions } from "nats";

import { GameData } from "@/models/GameData.js";

const SUBJECT = "agent.moveCalculated";

export const registerEmitterMoveCalculated =
  (natsClient: NatsConnection, jsonCodec: Codec<Record<string, unknown>>) =>
  (payload: GameData, options?: PublishOptions) =>
    natsClient.publish(SUBJECT, jsonCodec.encode(payload), options);
