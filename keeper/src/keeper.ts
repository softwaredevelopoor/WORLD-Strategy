import { Connection, PublicKey } from "@solana/web3.js";
import { logger } from "./utils/logger";
import { TreasuryMonitor } from "./treasury";
import { Allocator } from "./allocator";
import { NAVCalculator } from "./nav";
import { ReportGenerator } from "./reporter";
import { SimulatedTreasury } from "./treasury";

export class Keeper {
  private connection: Connection;
  private monitor: TreasuryMonitor;
  private allocator: Allocator;
  private navCalculator: NAVCalculator;
  private reportGenerator: ReportGenerator;

  constructor() {
    const endpoint = process.env.RPC_ENDPOINT || "https://api.devnet.solana.com";
    this.connection = new Connection(endpoint, "confirmed");

    this.monitor = new TreasuryMonitor(this.connection);
    this.allocator = new Allocator(this.connection);
    this.navCalculator = new NAVCalculator(this.connection);
    this.reportGenerator = new ReportGenerator();
  }

  async initialize(): Promise<void> {
    logger.info("Initializing keeper bot...");

    if (process.env.DRY_RUN === "true") {
      logger.info("[DRY_RUN] Using simulated treasury");
      await new SimulatedTreasury().initialize();
    } else {
      logger.info("Connecting to treasury...");
      const treasureAddress = process.env.NEXT_PUBLIC_TREASURY_ACCOUNT;
      if (!treasureAddress) {
        throw new Error("NEXT_PUBLIC_TREASURY_ACCOUNT not set");
      }
    }

    logger.info("✓ Keeper initialized");
  }

  async start(): Promise<void> {
    const interval = parseInt(
      process.env.KEEPER_CHECK_INTERVAL_MS || "30000",
      10
    );
    logger.info(`Starting keeper loop (interval: ${interval}ms)`);

    let allocationCount = 0;

    setInterval(async () => {
      try {
        logger.debug("--- Keeper Cycle ---");

        // 1. Monitor treasury
        const state = await this.monitor.getTreasuryState();
        logger.debug(`Treasury state: fees=${state.totalFeesCollected}, deployed=${state.totalDeployed}`);

        // 2. Check allocation trigger
        const shouldAllocate = await this.allocator.shouldAllocate(state);

        if (shouldAllocate) {
          logger.info("✓ Allocation triggered");
          allocationCount++;

          // 3. Prepare allocations
          const allocations = await this.allocator.prepareAllocations(state);
          logger.debug(`Prepared allocations: ${allocations.length}`);

          // 4. Validate slippage
          const validated = await this.allocator.validateSlippage(allocations);

          if (validated) {
            logger.info("✓ Slippage validation passed");

            if (process.env.DRY_RUN === "true") {
              logger.info("[DRY_RUN] Would execute: " + JSON.stringify(allocations, null, 2));
            } else {
              logger.info("Executing allocations...");
              await this.allocator.execute(allocations);
              logger.info("✓ Allocations executed");
            }

            // 5. Update NAV
            const nav = await this.navCalculator.calculate(state);
            logger.info(`NAV: $${nav.navPerToken.toFixed(4)} per token`);

            // 6. Generate report
            const report = this.reportGenerator.generate({
              allocationCount,
              nav,
              state,
            });
            logger.info("Report:\n" + report);
          } else {
            logger.warn("⚠ Slippage validation failed, skipping allocation");
          }
        } else {
          logger.debug("No allocation triggered this cycle");
        }
      } catch (error) {
        logger.error("Keeper cycle error:", error);
      }
    }, interval);
  }
}
