# Allocation Strategy

This document describes how the WORLD treasury decides what assets to hold and how to maintain allocation.

---

## Asset Classes

The WORLD treasury allocates across four primary global asset classes:

### 1. US Equities (40%)

**Symbol**: `SPX` (S&P 500 Index)

**Description**: Large-cap US equities via tokenized index proxy

**Rationale**:
- Largest, most liquid global equity market
- Established companies with cash flows
- Historical long-term growth

**On Solana**: Placeholder token `SPX111111111111111111111111111111111`
- On mainnet: Could use tokenized ETF like `iShares Core S&P 500 (IVV)` bridged via Wormhole
- On devnet: Mock token with simulated price feeds

---

### 2. Emerging Markets (20%)

**Symbol**: `EEM` (Emerging Markets Index)

**Description**: Growth exposure to emerging economies

**Rationale**:
- Higher growth potential than developed markets
- Diversification across geographies
- Exposure to rising consumer populations

**On Solana**: Placeholder token `EEM111111111111111111111111111111111`
- On mainnet: Could use `iShares MSCI Emerging Markets ETF (EEM)` or similar
- On devnet: Mock price feeds

---

### 3. Precious Metals (15%)

**Symbol**: `GLD` (Gold)

**Description**: Physical gold or gold-backed token

**Rationale**:
- Inflation hedge
- Negative correlation to equity volatility
- Store of value across crises

**On Solana**: Placeholder token `GLD111111111111111111111111111111111`
- On mainnet: Could use `iShares Gold Trust (IAU)` or `Tether Gold (XAUT)`
- On devnet: Mock price feeds

---

### 4. Real-World Assets (25%)

**Symbol**: `RWA` (Real-World Assets basket)

**Description**: Tokenized commodities, real estate, infrastructure, and other non-traditional assets

**Rationale**:
- Direct claims on physical/economic assets
- Low correlation to crypto
- Growing asset class in DeFi

**On Solana**: Placeholder composite token `RWA111111111111111111111111111111111`
- On mainnet: Could consist of:
  - Tokenized real estate (Realt, Propertyshares, etc.)
  - Commodity tokens (PURSE, ONDO, etc.)
  - Infrastructure/energy tokens
  - Aggregate via weighting algorithm
- On devnet: Single mock token with composite price

---

## Allocation Logic

### Time-Based Trigger

Allocations execute **every 2 weeks** (configurable).

```
Week 0: Allocation 1 executes
Week 2: Allocation 2 executes
Week 4: Allocation 3 executes
...
```

### Threshold-Based Trigger

Alternatively, if accumulated fees reach **$50k USDC equivalent**, allocate immediately (subject to cooldown).

```
Fees collected: $25k
  (wait, threshold not met)
Fees collected: $50k
  (TRIGGER: allocate immediately, if cooldown elapsed)
```

### Allocation Distribution

Given available USDC to allocate (e.g., $100k):

```
SPX (40%):     $100k × 0.40 = $40k
EEM (20%):     $100k × 0.20 = $20k
GLD (15%):     $100k × 0.15 = $15k
RWA (25%):     $100k × 0.25 = $25k
               ─────────────────────
               Total        = $100k
```

Each sub-allocation is a separate DEX trade.

---

## Rebalancing (Future)

Currently, the treasury does **not rebalance**. Each allocation cycle simply adds new capital per target weights, which over time nudges the portfolio toward the target.

**Example**: If SPX has grown to 45% of total value (due to price appreciation) and we allocate entirely per weights, the next cycle will add less SPX-relative allocation, gradually bringing it back to 40%.

**Future enhancement**: Implement **forced rebalancing** when any asset drifts >5% from target allocation:

```typescript
function shouldRebalance(holdings: Holdings, targets: TargetWeights): boolean {
  for (const [asset, holding] of holdings) {
    const currentWeight = holding.marketValue / holdings.totalValue;
    const targetWeight = targets[asset];
    const drift = Math.abs(currentWeight - targetWeight);
    
    if (drift > 0.05) {  // 5% drift threshold
      return true;
    }
  }
  return false;
}
```

---

## Configuration (Config Account)

The allocation strategy is fully configured onchain:

```json
{
  "algorithm_version": "1.0",
  "allocation_interval_blocks": 201_600,           // 2 weeks (Solana = ~13 blocks/sec)
  "allocation_threshold_usdc": 50_000_000_000,     // $50k USDC (with decimals)
  "max_per_cycle_usdc": 100_000_000_000,           // $100k cap per cycle
  "slippage_limit_bps": 50,                        // 0.5%
  "cooldown_blocks": 14_400,                       // ~1 day
  
  "assets": [
    {
      "id": "SPX_INDEX",
      "symbol": "SPX",
      "mint": "SPX111111111111111111111111111111111",
      "decimals": 6,
      "weight": 0.40,
      "min_allocation_usd": 5_000_000_000,         // Min $5k
      "max_allocation_usd": null                   // No max
    },
    {
      "id": "EMERGING_MARKETS",
      "symbol": "EEM",
      "mint": "EEM111111111111111111111111111111111",
      "decimals": 6,
      "weight": 0.20,
      "min_allocation_usd": 5_000_000_000,
      "max_allocation_usd": null
    },
    {
      "id": "GOLD",
      "symbol": "GLD",
      "mint": "GLD111111111111111111111111111111111",
      "decimals": 6,
      "weight": 0.15,
      "min_allocation_usd": 2_000_000_000,         // Min $2k
      "max_allocation_usd": null
    },
    {
      "id": "RWA_BASKET",
      "symbol": "RWA",
      "mint": "RWA111111111111111111111111111111111",
      "decimals": 6,
      "weight": 0.25,
      "min_allocation_usd": 5_000_000_000,
      "max_allocation_usd": 30_000_000_000        // Cap at $30k
    }
  ]
}
```

---

## Admin Updates

The treasury admin can propose updates to allocation strategy:

1. **Change weights** (e.g., reduce equities to 35%, increase gold to 20%)
2. **Add new assets** (e.g., add cryptocurrency category)
3. **Remove assets** (e.g., deprecate an RWA token)
4. **Adjust thresholds** (e.g., lower allocation threshold to $30k)
5. **Extend intervals** (e.g., allocate every 3 weeks instead of 2)

```rust
pub fn update_allocation_config(
    ctx: Context<UpdateConfig>,
    new_weights: Vec<AssetWeight>,
    new_interval_blocks: u64,
    new_threshold_usdc: u64,
) -> Result<()> {
    let config = &mut ctx.accounts.config;
    require_eq!(ctx.accounts.admin.key(), config.admin, TreasuryError::Unauthorized);
    
    // Validate weights sum to 100%
    let sum: f32 = new_weights.iter().map(|w| w.weight).sum();
    require!((sum - 1.0).abs() < 0.001, TreasuryError::InvalidWeights);
    
    config.asset_weights = new_weights;
    config.allocation_interval_blocks = new_interval_blocks;
    config.allocation_threshold_usdc = new_threshold_usdc;
    
    emit!(ConfigUpdated {
        updated_by: ctx.accounts.admin.key(),
        timestamp: Clock::get()?.unix_timestamp,
    });
    
    Ok(())
}
```

---

## DEX Execution

### Jupiter Aggregator Integration

The keeper bot uses **Jupiter** (or similar DEX aggregator) to execute trades:

```typescript
async function quoteAndExecute(
  asset: Asset,
  amountUSDC: number,
  config: Config
): Promise<SwapResult> {
  // 1. Get quote
  const quote = await fetch('https://quote-api.jup.ag/v4/quote', {
    method: 'POST',
    body: JSON.stringify({
      inputMint: USDC_MINT,
      outputMint: asset.mint,
      amount: amountUSDC * 10 ** 6,  // USDC has 6 decimals
      slippageBps: config.slippage_limit_bps,
    }),
  }).then(r => r.json());
  
  // 2. Validate slippage
  const slippage = computeSlippageBps(quote);
  if (slippage > config.slippage_limit_bps) {
    throw new Error(`Slippage ${slippage} bps exceeds limit`);
  }
  
  // 3. Execute swap (in DRY_RUN, just log)
  if (process.env.DRY_RUN === 'true') {
    console.log(`[DRY_RUN] Would swap ${amountUSDC} USDC → ${quote.outAmount} ${asset.symbol}`);
    return { dryRun: true, quote };
  }
  
  // 4. Build and send swap instruction
  const swapInstructions = await buildSwapInstructions(quote);
  const tx = new Transaction().add(...swapInstructions);
  const sig = await provider.sendAndConfirm(tx, [signer]);
  
  return { success: true, signature: sig, quote };
}
```

### Slippage Validation

Before executing any trade, slippage is computed:

```typescript
function computeSlippageBps(quote: JupiterQuote): number {
  const midPrice = quote.inputAmount / quote.outputAmount;
  const executionPrice = quote.inputAmount / quote.outAmount;
  return Math.abs((executionPrice - midPrice) / midPrice) * 10_000;  // in basis points
}
```

If slippage exceeds the limit, the trade is **skipped**.

---

## Order Execution Strategy

Currently: **Batch execution** 
- All trades for an allocation cycle are submitted in a single transaction or closely-timed transactions
- Reduces transaction overhead
- Preserves atomicity (all or nothing)

Future: **Intelligent splitting**
- Large orders split across multiple blocks
- Minimizes market impact
- Reduces slippage on large allocations

---

## Performance Tracking

The keeper bot tracks allocation performance:

```typescript
interface AllocationMetrics {
  timestamp: number;
  feesCollected: number;           // Total fees in cycle
  totalDeployed: number;            // Total USDC deployed
  deployCost: number;               // Transaction costs
  netSlippage: number;              // Avg slippage across trades
  navBefore: number;                // NAV before allocation
  navAfter: number;                 // NAV after allocation
  navChange: number;                // Pct change
  assetsAllocated: {
    [symbol]: {
      amountDeployed: number;
      amountReceived: number;
      price: number;
      slippageBps: number;
    }
  };
}
```

Metrics are logged and published for dashboard display.

---

## Example Allocation Cycle

**Scenario**: 2-week allocation cycle, $80k USDC accumulated

```
[Keeper Bot checks preconditions]
  ✓ Cooldown elapsed
  ✓ Interval passed (2 weeks)
  ✓ Treasury not paused
  
[Prepare allocations]
  SPX: $80k × 0.40 = $32k
  EEM: $80k × 0.20 = $16k
  GLD: $80k × 0.15 = $12k
  RWA: $80k × 0.25 = $20k
  
[Get DEX quotes]
  SPX: 32k USDC → 15,234 SPX tokens @ $2.099/token (slippage: 0.35%)
  EEM: 16k USDC → 8,521 EEM tokens @ $1.875/token (slippage: 0.42%)
  GLD: 12k USDC → 6,800 GLD tokens @ $1.765/token (slippage: 0.28%)
  RWA: 20k USDC → 12,345 RWA tokens @ $1.621/token (slippage: 0.51%) ← REJECT
  
[Validate slippage]
  SPX: 0.35% < 0.5% ✓
  EEM: 0.42% < 0.5% ✓
  GLD: 0.28% < 0.5% ✓
  RWA: 0.51% > 0.5% ✗ SKIP entirely

[Log decision]
  "Allocation cycle failed: RWA exceeded slippage limit. No trades executed."
  → Retry next cycle (2 weeks later)
  
[Alternative: if all validations pass]
  Execute trades:
    SPX: TX#1 confirms, +15,234 SPX ✓
    EEM: TX#2 confirms, +8,521 EEM ✓
    GLD: TX#3 confirms, +6,800 GLD ✓
    
[Update treasury state]
  - Mark last_allocation_timestamp = now
  - Update holdings for SPX, EEM, GLD
  - Emit AllocationExecuted event
  - Clear fee buffer → restart cycle
  
[Publish report]
  {
    "timestamp": "2026-02-11T14:30:00Z",
    "cycle_number": 42,
    "fees_collected": 80000,
    "deployed": 60000,
    "nav_before": 1250432,
    "nav_after": 1309921,
    "nav_change_pct": 4.75
  }
```

---

## Summary

The WORLD allocation strategy:
- **Allocates every 2 weeks** (or on $50k threshold)
- **Targets 4 asset classes**: Equities (40%), Emerging (20%), Gold (15%), RWA (25%)
- **De-risks with slippage checks** (0.5% limit)
- **Protects with cooldown** (1 day between cycles)
- **Fully configurable** (admin can update weights and parameters)

The approach balances **diversification**, **automation**, and **safety**.
