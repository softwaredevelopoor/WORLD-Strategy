import * as dotenv from "dotenv";
dotenv.config();

import { Keeper } from "./keeper";
import { logger } from "./utils/logger";

async function main() {
  logger.info("=== WORLD Strategy Keeper Bot ===");
  logger.info(
    `Environment: ${process.env.DRY_RUN === "true" ? "DRY_RUN (simulation)" : "LIVE"}`
  );
  logger.info(`Network: ${process.env.NEXT_PUBLIC_NETWORK || "devnet"}`);
  logger.info(`Log Level: ${process.env.LOG_LEVEL || "info"}`);

  const keeper = new Keeper();

  try {
    await keeper.initialize();
    await keeper.start();
  } catch (error) {
    logger.error("Keeper initialization failed:", error);
    process.exit(1);
  }
}

main().catch((error) => {
  logger.error("Fatal error:", error);
  process.exit(1);
});
