import { validator } from "@/config/validators.js";

export const gameDataSchema = validator.object({
  // Need to keep the game identified for later user return
  gameId: validator.string(),
  gamePositionPgn: validator.string(),
});
export type GameData = validator.infer<typeof gameDataSchema>;
