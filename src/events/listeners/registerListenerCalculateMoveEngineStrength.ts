import { Codec, NatsConnection } from "nats";

import { validator } from "@/config/validators.js";
import { gameDataSchema } from "@/models/GameData.js";

const SUBJECT = "agent.neural.calculateMove";

const payloadSchema = gameDataSchema;
type PayloadSchemaType = validator.infer<typeof payloadSchema>;

type AgentCalculateMoveCallback = (payload: PayloadSchemaType) => Promise<void> | void;

export const registerListenerCalculateMoveEngineStrength =
  (natsClient: NatsConnection, jsonCodec: Codec<Record<string, unknown>>) =>
  (callback: AgentCalculateMoveCallback) => {
    const subscription = natsClient.subscribe(SUBJECT);

    void (async () => {
      for await (const message of subscription) {
        const agentMovePayload = payloadSchema.parse(jsonCodec.decode(message.data));
        await callback(agentMovePayload);
      }
    })();

    return () => subscription.drain();
  };
