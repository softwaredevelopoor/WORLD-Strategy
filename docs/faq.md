# Frequently Asked Questions (FAQ)

## General Questions

### Q: What is WORLD Strategy?

**A**: WORLD Strategy is a crypto-native treasury token that routes trading fees into a transparent, diversified global asset portfolio. The treasury allocates across US equities, emerging markets, gold, and real-world assets (RWA tokens).

### Q: Is this a stock? A bond? A security?

**A**: WORLD is a **memecoin-inspired token** with a treasury mechanic. It is **NOT**:
- A promise of profits
- A security (legal classification TBD)
- Investment advice
- A stable coin

It is purely experimental. Consult legal counsel.

### Q: Who runs WORLD?

**A**: WORLD Strategy is developed and operated by [TODO: DAO/team name]. We are entirely independent of Phantom, MetaMask, or any wallet/exchange.

### Q: Can I make money from WORLD?

**A**: Potentially, if:
1. Treasury appreciates (underlying assets increase in value)
2. NAV per token grows
3. You sell at higher price than bought

But this is NOT guaranteed. You could lose money.

### Q: Is WORLD affiliated with Phantom?

**A**: **NO.** WORLD is entirely independent. We make no claims about adoption by Phantom or any other platform.

---

## Treasury & Accounting Questions

### Q: How much does the treasury currently hold?

**A**: Query the dashboard at [TODO: URL] for real-time balance. All holdings are onchain and publicly verifiable.

### Q: How often does the treasury allocate?

**A**: Every 2 weeks, or when fees collected reach $50k (whichever comes first).

### Q: How does the keeper bot know when to allocate?

**A**: The keeper bot:
1. Monitors treasury state continuously
2. Checks if allocation threshold ($50k) or interval (2 weeks) met
3. Validates circuit breakers (slippage, cooldown)
4. Executes trades if all checks pass
5. Publishes allocation event

### Q: How does the keeper bot execute trades?

**A**: 
1. Gets quote from Jupiter DEX aggregator
2. Validates slippage is < 0.5%
3. Executes swap: WORLD fees → USDC
4. Allocates USDC across SPX, EEM, GLD, RWA per weights (40%, 20%, 15%, 25%)
5. Logs event onchain

### Q: What are the allocation weights?

**A**:
- 40% S&P 500 (US equities)
- 20% Emerging Markets
- 15% Gold
- 25% Real-World Assets

These are configurable by admin; can be updated via governance (future).

### Q: Can the weights be changed?

**A**: Yes, admin (or future governance) can update weights. Changes are onchain and public.

### Q: Is there a maximum allocation per cycle?

**A**: Yes, $100k per cycle (configurable). Prevents runaway spending.

### Q: What's the slippage limit?

**A**: 0.5%. If any trade would exceed this, the entire allocation cycle is skipped.

### Q: What happens if slippage exceeds the limit?

**A**: The allocation is cancelled (no trades). Fees remain in treasury. Retry next cycle (2 weeks later).

---

## NAV & Pricing Questions

### Q: What is NAV?

**A**: **Net Asset Value per token** = (Treasury value in USD) / (Circulating WORLD tokens)

Example: Treasury = $1M, Supply = 800k WORLD, NAV = $1.25 per token

### Q: Is NAV a price guarantee?

**A**: **NO.** NAV is:
- An estimate
- Based on oracle prices (which can be wrong)
- Not tradable for cash (no redemption mechanism)
- Subject to all risks listed in [risks.md](./risks.md)

### Q: How often is NAV updated?

**A**: Every block (Solana = ~2.5 seconds) or onchain demand.

### Q: Does NAV go up and down?

**A**: Yes. NAV = underlying asset prices × 1 / supply. If SPX drops, NAV drops.

### Q: My WORLD token is worth less than NAV. Why?

**A**: The token market price and NAV are independent:
- NAV is treasury backing (per token)
- Market price is what others will pay
- Market price < NAV → discount to backing
- Market price > NAV → premium to backing

Arbitrage can narrow the gap (buy discount, sell premium).

### Q: Can I redeem WORLD for NAV?

**A**: **NO.** There is no redemption mechanism. You can only sell on a DEX.

---

## Fee & Allocation Questions

### Q: What's the fee rate?

**A**: Default is 2% of transaction volume. Configurable by admin.

### Q: Where do fees go?

**A**: 100% to the treasury wallet (onchain). None are taken by team/developers (currently).

### Q: Is there a transaction fee to buy/sell WORLD?

**A**: Yes, the 2% creator fee. Example:
- Buy 100 WORLD
- 2% fee (2 WORLD) goes to treasury
- You receive 98 WORLD

### Q: Will fees ever be reduced?

**A**: Possibly, via governance (future). Lower fees → less treasury growth.

### Q: What if I don't want my fees to go to treasury?

**A**: You can:
1. Avoid trading WORLD (hold in HODLer wallet)
2. Trade on DEX with fees removed (if such DEX exists)
3. Accept the fee as part of participating

---

## Risk Questions

### Q: What if the smart contract is hacked?

**A**: Treasury could be stolen. This is a key risk. Mitigation:
- Professional audit before mainnet
- Gradual rollout (start small)
- Emergency pause button
- Monitor closely

### Q: What if Solana network fails?

**A**: All holdings frozen. This affects entire ecosystem, not just WORLD.

### Q: What if the oracle (Pyth) fails?

**A**: NAV calculation breaks temporarily. Allocation paused. Wait for recovery.

### Q: What if the treasury loses money?

**A**: Possible if markets decline. NAV would decrease. No insurance.

### Q: What if WORLD token becomes worthless?

**A**: Possible if:
- Interest dies (no more trading volume)
- Treasury backing depreciates significantly
- Smart contract exploit drains funds
- Regulatory crackdown

### Q: Is this a rug pull?

**A**: No. Treasury is onchain and transparent. Funds can't be secretly withdrawn.

But team could abandon project, leaving you with only base asset value.

### Q: Should I invest my life savings in WORLD?

**A**: **NO.** WORLD is highly experimental. Only invest what you can afford to lose.

---

## Technical Questions

### Q: Where is the code?

**A**: GitHub: [TODO: repo](https://github.com/softwaredevelopoor/WORLD-Strategy)

### Q: Is the code open-source?

**A**: Yes, MIT license. You can copy, modify, deploy your own version.

### Q: How do I verify treasury holdings?

**A**: 
1. Query the on-chain treasury account
2. Check SPL token balances for each asset
3. Use Solana Explorer to view transactions
4. Compare to dashboard

```bash
solana account <TREASURY_ADDRESS> --url mainnet-beta
```

### Q: How do I calculate NAV myself?

**A**:
1. Get price for each asset (Pyth, DEX)
2. Multiply: price × amount for each holding
3. Sum all values
4. Divide by token supply

See [nav-methodology.md](./nav-methodology.md) for formula.

### Q: What RPC endpoints should I use?

**A**: Any Solana RPC:
- Public: https://api.mainnet-beta.solana.com (rate-limited)
- Commercial: Helius, QuickNode, Triton, etc.
- Private: Run own validator

### Q: How do I run the keeper bot locally?

**A**:
```bash
cd keeper
cp .env.example .env
export DRY_RUN=true
npm run dev
```

See [../scripts/monitor.md](../scripts/monitor.md) for details.

---

## Asset & Allocation Questions

### Q: Why these specific assets (SPX, EEM, GLD, RWA)?

**A**:
- **SPX** (40%): Largest, most liquid equity market
- **EEM** (20%): Growth to emerging economies
- **GLD** (15%): Hedge against volatility, inflation
- **RWA** (25%): Non-correlated, real-world backing

Together: diversified, global, uncorrelated.

### Q: Why not include Bitcoin or Ethereum?

**A**: Intentional design choice. WORLD targets traditional + RWA assets, not native crypto. Future governance may add BTC/ETH if community votes.

### Q: Can RWA tokens be rug-pulled?

**A**: Yes, RWA tokens are emerging and risky. If underlying RWA project fails, tokens become worthless. This is why NAV includes risk weighting.

### Q: Which RWA tokens does WORLD invest in?

**A**: Configurable. Currently:
- ONDO (credit)
- REALT (real estate)
- PURSE (commerce)
- MPLX (lending)

See [rwa-and-proxy-assets.md](./rwa-and-proxy-assets.md) for full list.

### Q: How is the RWA basket decided?

**A**: Admin (now) → Governance (future). Proposal → vote →implementation.

---

## Dashboard Questions

### Q: Why is the dashboard blank?

**A**: Keeper bot may not be running, or your RPC is slow. Check:
1. Is keeper bot running? (`pnpm dev` in `/keeper`)
2. Is RPC endpoint valid?
3. Are there any transactions onchain?

### Q: Why is NAV different on two dashboards?

**A**: Possible reasons:
1. RPC lag (one is ~1 block behind)
2. Price feed difference (Pyth vs DEX)
3. One using cached data

Refresh or wait one block. Should converge.

### Q: Can I export allocation history?

**A**: Yes, via API or query onchain events. CSV export coming soon.

---

## Token Supply Questions

### Q: What's the total supply of WORLD?

**A**: Check on Solana Explorer or via RPC:
```bash
spl-token supply <WORLD_MINT_ADDRESS>
```

### Q: Will there be more WORLD tokens minted?

**A**: Depends on governance. Currently, supply is fixed.

### Q: Can the supply be inflated?

**A**: Only if:
1. Smart contract allows minting (currently disabled)
2. Governance votes to enable minting

### Q: What's the max supply?

**A**: No hard cap (currently). Could theoretically mint infinite tokens (but wouldn't, economically).

---

## Governance & Future Questions

### Q: When will governance be enabled?

**A**: Phase 2 (TBD). Initially admin-only.

### Q: How will governance work?

**A**: Snapshot voting → WORLD token holders vote on proposals.

### Q: Can I vote on allocation weights?

**A**: Yes (when governance is enabled). Propose changes → community votes → implement.

### Q: What decisions can't be changed?

**A**: (TBD) Likely:
- Core fee mechanism
- Onchain accounting transparency

---

## Support & Community

### Q: Where can I ask more questions?

**A**: 
- Discord: [TODO]
- Twitter: [TODO]
- GitHub Issues: [TODO]
- Email: [TODO]

### Q: Is there a community Discord?

**A**: Yes, [TODO link]. Join to discuss strategy, propose assets, etc.

### Q: How do I report a bug?

**A**: 
1. Security bug: Email security@worldstrategy.dev
2. Other bug: Open GitHub issue
3. Dashboard bug: Discord #bugs channel

### Q: Can I contribute to WORLD?

**A**: Yes! See [CONTRIBUTING.md](../CONTRIBUTING.md). We welcome code, docs, design, community building.

---

## Getting Started

### Q: How do I buy WORLD?

**A**: 
1. Get SOL on Solana mainnet
2. Use a DEX (Raydium, Jupiter, Magic Eden Swap)
3. Swap for WORLD token
4. Fees automatically go to treasury

### Q: How do I check dashboard?

**A**: Visit [TODO: URL]. See real-time treasury balance, NAV, allocation.

### Q: How do I run locally?

**A**: See [README.md](../README.md#quickstart-local-simulation)

---

*Last updated: Feb 2026 | More questions? Open an issue or ask in Discord.*
