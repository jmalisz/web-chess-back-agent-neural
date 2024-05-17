import dotenv from "dotenv";

dotenv.config();

const { NODE_ENV, LOG_LEVEL = "info", SERVICE_PATH = "/", NATS_URL } = process.env;

if (!NATS_URL) throw new Error("NATS_URL env is missing");

export { LOG_LEVEL, NATS_URL, NODE_ENV, SERVICE_PATH };
