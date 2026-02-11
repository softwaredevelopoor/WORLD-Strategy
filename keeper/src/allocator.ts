import { logger } from "./utils/logger";
import { SimulatedTreasury, TreasuryState } from "./treasury";

export interface Allocation {
  asset: string;
  amountDeployed: number;
  amountReceived: number;
  slippageBps: number;
}

export class Allocator {
  private config = {
    allocation_interval_blocks: 1_209_600, // 2 weeks
    allocation_threshold_usdc: 50_000,
    max_per_cycle_usdc: 100_000,
    slippage_limit_bps: 50, // 0.5%
    cooldown_blocks: 86_400, // 1 day
    weights: {
      SPX: 0.4,
      EEM: 0.2,
      GLD: 0.15,
      RWA: 0.25,
    },
  };

  private mockPrices = {
    SPX: 2.1,
    EEM: 1.88,
    GLD: 1.76,
    RWA: 1.65,
  };

  constructor(private connection: any) {}

  async shouldAllocate(state: TreasuryState): Promise<boolean> {
    const now = Math.floor(Date.now() / 1000);

    // Check cooldown
    const timeSinceLastAllocation = now - state.lastAllocationTimestamp;
    if (timeSinceLastAllocation < this.config.cooldown_blocks) {
      logger.debug(
        `Cooldown active: ${timeSinceLastAllocation}s / ${this.config.cooldown_blocks}s`
      );
      return false;
    }

    // Check threshold (simulate fee accumulation)
    const feeBalance = state.balance;
    const thresholdMet = feeBalance >= this.config.allocation_threshold_usdc;
    const intervalMet =
      timeSinceLastAllocation >= this.config.allocation_interval_blocks;

    logger.debug(
      `Threshold: ${feeBalance} >= ${this.config.allocation_threshold_usdc} ? ${thresholdMet}`
    );
    logger.debug(`Interval: ${timeSinceLastAllocation}s >= ${this.config.allocation_interval_blocks}s ? ${intervalMet}`);

    return thresholdMet || intervalMet;
  }

  async prepareAllocations(state: TreasuryState): Promise<Allocation[]> {
    const availableUsdc = Math.min(
      state.balance,
      this.config.max_per_cycle_usdc
    );

    const allocations: Allocation[] = [];

    for (const [asset, weight] of Object.entries(this.config.weights)) {
      const amountUSDC = availableUsdc * weight;
      const price = this.mockPrices[asset as keyof typeof this.mockPrices];

      if (!price) {
        logger.warn(`No price for ${asset}`);
        continue;
      }

      const amountReceived = amountUSDC / price;

      allocations.push({
        asset,
        amountDeployed: amountUSDC,
        amountReceived,
        slippageBps: Math.random() * 30, // Simulate 0-0.3% slippage
      });
    }

    return allocations;
  }

  async validateSlippage(allocations: Allocation[]): Promise<boolean> {
    for (const alloc of allocations) {
      if (alloc.slippageBps > this.config.slippage_limit_bps) {
        logger.warn(
          `Slippage for ${alloc.asset} exceeds limit: ${alloc.slippageBps} > ${this.config.slippage_limit_bps}`
        );
        return false;
      }
    }
    return true;
  }

  async execute(allocations: Allocation[]): Promise<void> {
    logger.info(`Executing ${allocations.length} allocations`);

    // Simulate transaction
    await new Promise((resolve) => setTimeout(resolve, 1000));

    SimulatedTreasury.addAllocation(allocations);
    logger.info("✓ Allocations completed (simulated)");
  }
}
