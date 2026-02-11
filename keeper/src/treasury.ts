import { Connection, PublicKey } from "@solana/web3.js";
import { logger } from "./utils/logger";

export interface TreasuryState {
  totalFeesCollected: number;
  totalDeployed: number;
  balance: number;
  holdings: { [key: string]: number };
  lastAllocationTimestamp: number;
  paused: boolean;
}

export class TreasuryMonitor {
  constructor(private connection: Connection) {}

  async getTreasuryState(): Promise<TreasuryState> {
    if (process.env.DRY_RUN === "true") {
      return SimulatedTreasury.getCurrentState();
    }

    // On mainnet, query from chain
    const treasuryAddress = new PublicKey(
      process.env.NEXT_PUBLIC_TREASURY_ACCOUNT || ""
    );

    try {
      const accountInfo = await this.connection.getAccountInfo(treasuryAddress);
      if (!accountInfo) {
        throw new Error("Treasury account not found");
      }

      // Parse account data (simplified)
      return {
        totalFeesCollected: 0,
        totalDeployed: 0,
        balance: accountInfo.lamports,
        holdings: {},
        lastAllocationTimestamp: Date.now() / 1000,
        paused: false,
      };
    } catch (error) {
      logger.error("Failed to query treasury:", error);
      throw error;
    }
  }
}

export class SimulatedTreasury {
  private static state: TreasuryState = {
    totalFeesCollected: 0,
    totalDeployed: 0,
    balance: 0,
    holdings: {
      SPX: 0,
      EEM: 0,
      GLD: 0,
      RWA: 0,
    },
    lastAllocationTimestamp: Math.floor(Date.now() / 1000),
    paused: false,
  };

  private static feeAccumulation = 0;
  private static lastFeeUpdateTime = Date.now();

  async initialize(): Promise<void> {
    logger.info("[DRY_RUN] Initializing simulated treasury");

    setInterval(() => {
      // Simulate fees trickling in (1000 USDC per second)
      const now = Date.now();
      const elapsed = (now - SimulatedTreasury.lastFeeUpdateTime) / 1000;
      const feesThisCycle = elapsed * 1000;

      SimulatedTreasury.feeAccumulation += feesThisCycle;
      SimulatedTreasury.state.totalFeesCollected += feesThisCycle;
      SimulatedTreasury.state.balance += feesThisCycle;

      SimulatedTreasury.lastFeeUpdateTime = now;
    }, 1000);
  }

  static getCurrentState(): TreasuryState {
    return { ...SimulatedTreasury.state };
  }

  static addAllocation(allocations: any[]): void {
    let total = 0;
    for (const alloc of allocations) {
      SimulatedTreasury.state.holdings[alloc.asset] =
        (SimulatedTreasury.state.holdings[alloc.asset] || 0) +
        alloc.amountDeployed;
      total += alloc.amountDeployed;
    }
    SimulatedTreasury.state.totalDeployed += total;
    SimulatedTreasury.state.balance -= total;
    SimulatedTreasury.feeAccumulation = 0;
    SimulatedTreasury.state.lastAllocationTimestamp = Math.floor(
      Date.now() / 1000
    );
  }
}
