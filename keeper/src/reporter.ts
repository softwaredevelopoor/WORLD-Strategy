import { NAVData } from "./nav";
import { TreasuryState } from "./treasury";
import { logger } from "./utils/logger";

export interface Report {
  timestamp: string;
  allocationCycle: number;
  treasury: {
    totalFees: number;
    totalDeployed: number;
    currentBalance: number;
  };
  nav: {
    perToken: number;
    totalValue: number;
  };
  holdings: string;
}

export class ReportGenerator {
  generate(data: {
    allocationCount: number;
    nav: NAVData;
    state: TreasuryState;
  }): string {
    const report = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  WORLD Strategy Treasury Report
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Timestamp:    ${new Date().toISOString()}
Cycle:        #${data.allocationCount}

TREASURY SUMMARY
─────────────────────────────────────
Total Fees Collected:   $${data.state.totalFeesCollected.toFixed(2)}
Total Deployed:         $${data.state.totalDeployed.toFixed(2)}
Available Balance:      $${data.state.balance.toFixed(2)}

NAV
─────────────────────────────────────
NAV per Token:          $${data.nav.navPerToken.toFixed(4)}
Total Treasury Value:   $${data.nav.totalTreasuryUSD.toFixed(2)}
Circulating Supply:     ${data.nav.circulatingSupply.toLocaleString()} WORLD

HOLDINGS BY ASSET
─────────────────────────────────────`;

    let holdingsReport = report;
    for (const [asset, assetData] of Object.entries(data.nav.assets)) {
      const percentage = (assetData.weight * 100).toFixed(1);
      holdingsReport += `
${asset.padEnd(8)} $${assetData.value.toFixed(2).padStart(12)}  (${percentage.padStart(5)}%)`;
    }

    holdingsReport += `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;

    return holdingsReport;
  }
}
