# Treasury Model & Mechanics

This document details how the WORLD Treasury operates.

---

## Overview

The treasury is a **on-chain account** that:
1. Collects creator fees from WORLD token trades
2. Converts fees to base assets (USDC or SOL)
3. Allocates across a diversified basket of global assets
4. Tracks holdings and publishes onchain state
5. Publishes NAV (Net Asset Value) to token holders

---

## Fee Capture

### Mechanism

Every WORLD token transfer includes a configurable **creator fee** (default: 2%).

```
Transfer Amount: 1,000 WORLD
Creator Fee: 2%
Fee Amount: 20 WORLD
Recipient Amount: 980 WORLD
```

The 20 WORLD fee is sent to the **Treasury Fee Wallet**, a Program Derived Address (PDA) controlled by the smart contract.

### Configuration

**Fee parameters** (set in Config account):

```json
{
  "fee_rate_bps": 200,        // 2.00% (200 basis points)
  "fee_recipient": "TreasuryPDAPublicKey",
  "fee_type": "percent"        // percent | fixed
}
```

Admins can update `fee_rate_bps` via governance (future) or admin call (current).

### Events

Every fee is logged as an onchain event:

```rust
#[event]
pub struct FeesReceived {
    pub amount: u64,              // in WORLD token units
    pub amount_usd_estimate: f64, // for tracking
    pub timestamp: i64,
    pub tx_hash: String,
    pub cumulative_fees: u64,
}
```

---

## Base Asset Conversion

### The Base Asset

The treasury maintains holdings in **$USDC** (or SOL, configurable).

When allocation is triggered:
1. Accumulated WORLD fees are converted to USDC at current market rate
2. The USDC is then allocated across the target assets per allocation weights

### Conversion Logic

```
[Accumulated Fees in WORLD]
        ↓
[DEX Aggregator Quote] (Jupiter GetQuote API)
        ↓
[Validate slippage < limit]
        ↓
[Execute swap: WORLD → USDC]
        ↓
[Log conversion event]
        ↓
[USDC ready for allocation]
```

**Checks**:
- Slippage must be < `slippage_limit_bps` (default 50 bps = 0.5%)
- Amount must not exceed `max_per_cycle` (default $100k)
- Current time must exceed `last_allocation_timestamp + cooldown`

---

## Allocation Engine

### Allocation Trigger

Allocation happens when **either**:
1. Time-based: `block_time >= last_allocation_timestamp + allocation_interval_blocks` (default: 2 weeks)
2. Threshold-based: `accumulated_fees >= allocation_threshold` (default: $50k USDC equivalent)

**Current approach**: Time-based, checked every keeper bot cycle

### Allocation Weights

The treasury maintains a **target allocation** across asset classes:

```json
{
  "weights": {
    "SPX_INDEX": {
      "symbol": "SPX",
      "weight": 0.40,
      "description": "S&P 500 Index (US Large-Cap Equities)"
    },
    "EMERGING_MARKETS": {
      "symbol": "EEM",
      "weight": 0.20,
      "description": "Emerging Markets Index"
    },
    "GOLD": {
      "symbol": "GLD",
      "weight": 0.15,
      "description": "Gold / Precious Metals"
    },
    "RWA_BASKET": {
      "symbol": "RWA",
      "weight": 0.25,
      "description": "Real-World Assets (commodities, real estate tokenized)"
    }
  }
}
```

### Allocation Calculation

Given: Available USDC to allocate = $100k

```
SPX allocation     = $100k × 0.40 = $40k
EEM allocation     = $100k × 0.20 = $20k
GLD allocation     = $100k × 0.15 = $15k
RWA allocation     = $100k × 0.25 = $25k
                     ─────────────────────
                     Total         = $100k
```

### Rebalancing

Currently, the keeper bot **does not rebalance** existing holdings. Instead:
1. Each allocation cycle allocates **new USDC** according to weights
2. Over time, this slowly nudges the portfolio toward target allocation

**Future**: Implement forced rebalancing if any asset drifts > 5% from target.

---

## Execution Flow

### Step 1: Validate Preconditions

```rust
pub fn execute_allocation(ctx: Context<ExecuteAllocation>) -> Result<()> {
    let treasury = &mut ctx.accounts.treasury;
    let config = &ctx.accounts.config;
    
    // Check not paused
    require!(!treasury.paused, TreasuryError::Paused);
    
    // Check cooldown
    let current_block = Clock::get()?.unix_timestamp;
    require!(
        current_block >= treasury.last_allocation_timestamp + config.cooldown_blocks,
        TreasuryError::CooldownNotElapsed
    );
    
    // Check fees >= threshold (or interval elapsed)
    let fees_usdc_equivalent = ...; // oracle price conversion
    require!(
        fees_usdc_equivalent >= config.allocation_threshold
        || current_block >= treasury.last_allocation_timestamp + config.allocation_interval_blocks,
        TreasuryError::AllocationThresholdNotMet
    );
    
    Ok(())
}
```

### Step 2: Prepare Allocations

Keeper bot (off-chain):

```typescript
async function prepareAllocations(treasuryState: TreasuryAccount): Promise<Allocation[]> {
  // 1. Get accumulated fees
  const feesInUSDS = treasuryState.totalFeesCollected;
  
  // 2. Apply weights
  const allocations = [];
  for (const [assetId, config] of Object.entries(weights)) {
    const amountUSDC = feesUSDC * config.weight;
    allocations.push({
      assetId,
      amountUSDC,
      symbol: config.symbol,
    });
  }
  
  // 3. Get DEX quotes for each
  for (const alloc of allocations) {
    const quote = await dex.getQuote({
      inputToken: USDC_MINT,
      outputToken: assetMint(alloc.assetId),
      amount: alloc.amountUSDC,
    });
    alloc.quote = quote;
  }
  
  return allocations;
}
```

### Step 3: Validate Slippage

```typescript
function validateSlippage(allocations: Allocation[], config: Config): boolean {
  for (const alloc of allocations) {
    const slippageBps = computeSlippageBps(
      alloc.amountUSDC,
      alloc.quote.outAmount,
      assetMarketPrice(alloc.assetId, USDC_MINT)
    );
    
    if (slippageBps > config.slippage_limit_bps) {
      console.warn(`Slippage ${slippageBps} bps exceeds limit ${config.slippage_limit_bps} bps for ${alloc.symbol}`);
      return false;
    }
  }
  return true;
}
```

If validation fails, the allocation is **skipped** for this cycle (no trades executed).

### Step 4: Execute Trades (Keeper Bot)

In **DRY_RUN mode**, trades are logged but not executed.

In **LIVE mode**, the keeper submits a transaction to the chain:

```typescript
async function executeTrades(allocations: Allocation[]) {
  const ixArray = [];
  
  for (const alloc of allocations) {
    const ix = await dex.buildSwapInstruction({
      inputToken: USDC_MINT,
      outputToken: assetMint(alloc.assetId),
      amount: alloc.amountUSDC,
      slippageToleranceBps: config.slippage_limit_bps,
      destination: treasuryTokenAccount(alloc.assetId),
    });
    ixArray.push(ix);
  }
  
  const tx = new Transaction().add(...ixArray);
  tx.recentBlockhash = (await provider.connection.getLatestBlockhash()).blockhash;
  tx.feePayer = keeperSigner.publicKey;
  
  const sig = await provider.sendAndConfirm(tx, [keeperSigner]);
  return sig;
}
```

### Step 5: Update Treasury State

On-chain instruction updates treasury:

```rust
#[derive(Accounts)]
pub struct ConfirmAllocation {
    #[account(mut)]
    pub treasury: Account<'info, TreasuryAccount>,
    pub admin: Signer<'info>,
}

#[event]
pub struct AllocationExecuted {
    pub timestamp: i64,
    pub allocations: Vec<AssetAllocation>,
    pub nav_per_token: f64,
    pub total_treasury_usd: f64,
}

pub fn confirm_allocation(
    ctx: Context<ConfirmAllocation>,
    allocations: Vec<AssetAllocation>,
) -> Result<()> {
    let treasury = &mut ctx.accounts.treasury;
    
    // Update holdings
    for alloc in allocations.iter() {
        treasury.holdings
            .entry(alloc.asset_id)
            .or_insert_with(Default::default)
            .amount += alloc.amount;
    }
    
    // Update metadata
    treasury.total_deployed += total_usd_amount;
    treasury.last_allocation_timestamp = Clock::get()?.unix_timestamp;
    
    // Emit event
    emit!(AllocationExecuted {
        timestamp: Clock::get()?.unix_timestamp,
        allocations,
        nav_per_token: compute_nav(...),
        total_treasury_usd: compute_total_value(...),
    });
    
    Ok(())
}
```

---

## Treasury Accounting

### Tracked Metrics

The treasury maintains:

```rust
pub struct TreasuryAccount {
    // Accounting
    pub total_fees_collected: u64,        // Total WORLD ever received
    pub total_deployed: u64,              // Total USDC ever allocated
    pub current_balance_usdc: u64,        // Unallocated USDC
    
    // Holdings
    pub holdings: HashMap<AssetId, Holding>,
    
    // Metadata
    pub last_allocation_timestamp: i64,
    pub last_nav_update_timestamp: i64,
    pub paused: bool,
}

pub struct Holding {
    pub asset_id: String,
    pub amount: u64,                      // in asset units
    pub acquisition_cost_usdc: u64,       // cost basis, for reporting
    pub last_rebalance_timestamp: i64,
}
```

### Historical Data

The treasury maintains the last **N allocation records** for dashboard and analysis:

```rust
pub struct AllocationRecord {
    pub timestamp: i64,
    pub block: u64,
    pub allocations: Vec<AssetAllocation>,
    pub nav_per_token: f64,
    pub total_treasury_value_usdc: f64,
}

pub struct AssetAllocation {
    pub asset_id: String,
    pub amount_deployed_usdc: u64,
    pub amount_received: u64,
    pub slippage_bps: u16,
}
```

---

## Circuit Breakers

Emergency mechanisms to prevent runaway behavior:

### 1. Paused Flag

Admin can call `pause()` to halt all allocation:

```rust
pub fn pause_treasury(ctx: Context<PauseTreasury>) -> Result<()> {
    let treasury = &mut ctx.accounts.treasury;
    require_eq!(ctx.accounts.admin.key(), treasury.admin, TreasuryError::Unauthorized);
    treasury.paused = true;
    Ok(())
}
```

While paused:
- No allocations can execute
- No trades occur
- Treasury state is readable (NAV calculation continues)

### 2. Per-Cycle Cap

Each allocation cycle cannot deploy more than `max_per_cycle` (default $100k).

```typescript
const cycleAmount = feesUSDC * weights[i];
require(cycleAmount <= config.max_per_cycle, "Cycle cap exceeded");
```

### 3. Slippage Limit

Each trade must respect slippage tolerance (default 0.5%).

If any trade would exceed slippage, the **entire allocation cycle is cancelled**.

### 4. Cooldown

Allocation cannot happen more frequently than `cooldown_blocks` (default: 1 day).

```rust
require!(
    current_time >= treasury.last_allocation_timestamp + config.cooldown_blocks,
    TreasuryError::CooldownNotElapsed
);
```

### 5. Min/Max Per Asset

Some assets may have per-asset limits:

```json
{
  "weights": {
    "RWA_BASKET": {
      "weight": 0.25,
      "min_amount_usdc": 5_000,      // Don't allocate < $5k per cycle
      "max_amount_usdc": 30_000,     // Don't allocate > $30k per cycle
    }
  }
}
```

---

## Fee Distribution (Future)

Currently all fees go to treasury. Future versions could support:

1. **Dev Treasury** (5% of fees)
2. **Keeper Compensation** (1% of fees)
3. **Governance Staking** (distributed to WORLD holders)

```json
{
  "fee_distribution": {
    "on_chain_treasury": 0.94,
    "dev_fund": 0.05,
    "keeper_incentive": 0.01
  }
}
```

---

## Risks & Limitations

See [risks.md](./risks.md) for comprehensive risk analysis.

Key items:
- **Oracle failures** can corrupt NAV calculation
- **DEX slippage** reduces allocation efficiency
- **Smart contract bugs** could allow unauthorized withdrawals
- **Market risk** on underlying assets (Treasury value can decline)
- **Regulatory** changes to RWA or token frameworks

---

## Summary

The treasury model is straightforward:
1. **Collect** creator fees from trades
2. **Convert** fees to USDC at market rate
3. **Allocate** USDC across global assets per configured weights
4. **Track** holdings onchain with real-time NAV reporting
5. **Protect** with circuit breakers and admin controls

The system is designed to be transparent, verifiable, and minimally governance-dependent.
