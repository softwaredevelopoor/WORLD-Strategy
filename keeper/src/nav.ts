import { TreasuryState } from "./treasury";
import { logger } from "./utils/logger";

export interface NAVData {
  navPerToken: number;
  totalTreasuryUSD: number;
  circulatingSupply: number;
  assets: { [key: string]: { value: number; weight: number } };
}

export class NAVCalculator {
  private mockPrices = {
    SPX: 2.1,
    EEM: 1.88,
    GLD: 1.76,
    RWA: 1.65,
  };

  private circulatingSupply = 800_000; // WORLD tokens

  constructor(private connection: any) {}

  async calculate(state: TreasuryState): Promise<NAVData> {
    let totalValue = 0;
    const assetValues: { [key: string]: { value: number; weight: number } } = {};

    // Calculate value of each holding
    for (const [asset, amount] of Object.entries(state.holdings)) {
      const price = this.mockPrices[asset as keyof typeof this.mockPrices];
      if (!price) continue;

      const value = (amount as number) * price;
      totalValue += value;
      assetValues[asset] = { value, weight: 0 };
    }

    // Add unallocated cash
    totalValue += state.balance;

    // Calculate weights
    for (const asset of Object.keys(assetValues)) {
      assetValues[asset].weight = assetValues[asset].value / totalValue;
    }

    const navPerToken = totalValue / this.circulatingSupply;

    logger.debug(`NAV Calculation:`);
    logger.debug(`  Total Value: $${totalValue.toFixed(2)}`);
    logger.debug(`  Supply: ${this.circulatingSupply}`);
    logger.debug(`  NAV per Token: $${navPerToken.toFixed(4)}`);

    return {
      navPerToken,
      totalTreasuryUSD: totalValue,
      circulatingSupply: this.circulatingSupply,
      assets: assetValues,
    };
  }
}
