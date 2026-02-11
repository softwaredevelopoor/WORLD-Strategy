# WORLD Strategy: Architecture Overview

This document provides a high-level architectural overview of the WORLD Strategy protocol.

## Philosophy

**"The world is a memecoin."** WORLD Strategy combines:
1. **Memecoin mechanics** (fun, community-driven, low barrier to entry)
2. **Treasury management** (real-world asset exposure)
3. **Transparent onchain accounting** (trustless verification)

The result: a governance-minimal token that routes trading fee revenue into a diversified global asset portfolio, with per-token NAV calculated and published continuously.

---

## System Components

### 1. Smart Contracts (Solana Anchor)

**Location**: `/program`

The contract layer provides:

#### Treasury Account
- Immutable record of fees collected
- Current holdings (by asset)
- Historical balance snapshots
- Emergency pause flag

#### Fee Collector
- Intercepts transaction fees from token trades
- Distributes to treasury wallet
- Logs `FeesReceived` events

#### Config Account
- Allocation weights (e.g., 40% equity, 20% emerging, 15% gold, 25% RWA)
- Threshold for triggering allocation (e.g., $50k fees collected)
- Allocation interval (e.g., 2 weeks)
- Slippage limit (0.5%)
- Per-cycle spend cap ($100k)
- Cooldown period (1 day)
- Asset list with tickers

#### Event Log
- `FeesReceived { amount, timestamp, tx_hash }`
- `AllocationExecuted { allocations: [{ asset, amount }], nav, timestamp }`
- `NAVUpdated { nav_per_token, treasury_usd, circulating_supply, timestamp }`
- `ConfigUpdated { updated_fields, admin, timestamp }`

---

### 2. Keeper Bot (TypeScript)

**Location**: `/keeper`

Runs continuously (local or cloud) to monitor and act on the treasury:

#### Treasury Monitor
- Polls onchain treasury state every `KEEPER_CHECK_INTERVAL_MS`
- Tracks fees collected since last allocation
- Checks if allocation threshold reached
- Respects cooldown (no allocation within N blocks)

#### Allocation Engine
- Reads current allocation weights from config
- Determines which assets to buy/rebalance
- Filters by slippage estimates
- Logs decisions (dry-run mode: no execution)

#### DEX Executor
- Interfaces with Jupiter (or similar DEX aggregator)
- Gets quote for each trade
- Validates slippage vs. limit
- Executes batch trades atomically (or rolls back)
- Emits `AllocationExecuted` event

#### NAV Calculator
- Fetches current prices from oracle (Pyth on mainnet, mock on devnet)
- Multiplies holding * price for each asset
- Sums to total treasury USD value
- Divides by circulating token supply
- Emits `NAVUpdated` event

#### Report Generator
- Daily summary: fees in, allocations executed, NAV
- Slack alerts (optional)
- Dashboard API updates
- CSV/JSON export for analysis

#### Simulation Mode (`DRY_RUN=true`)
- Mocks treasury state
- Logs all decisions without executing
- Uses mock prices
- Useful for testing and local development

---

### 3. Dashboard (Next.js)

**Location**: `/dashboard`

Real-time visualization:

#### Pages
- **Home**: Overview, key metrics
- **Treasury**: Current holdings, historical composition
- **NAV**: Per-token value, historical chart
- **Fees**: Fees collected by day/week, charts
- **Allocations**: Recent allocation history, links to onchain txs
- **Analytics**: Slippage analysis, rebalancing efficiency

#### Components
- Treasury balance card
- Allocation pie chart
- NAV line chart
- Fee inflow histogram
- Recent transactions table
- Circuit breaker status

#### Data Sources
- RPC endpoint for on-chain state
- Keeper API for enriched data (optional)
- Pyth pyth.network for price feeds

---

## Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│  WORLD Token Holders                                         │
│  (trade token → create fees)                                 │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
              Token Fee Mechanism
              (2% fee default)
                     │
                     ▼
            Treasury Wallet (Solana)
            (logs FeesReceived event)
                     │
         ┌───────────┴──────────────┐
         │                          │
         ▼                          ▼
    Monitor              Check Allocation
    (Keeper Bot)         Threshold + Cooldown
         │                          │
         └───────────┬──────────────┘
                     │
              (threshold met?)
                     │
         ┌───────────┴──────────────────┐
         │ (NO)         │ (YES)          │
         │              ▼               │
         │          Execute Allocation  │
         │          (DEX Executor)      │
         │              │               │
         │         ┌─────┴─────┐        │
         │         │           │       │
         │    Get Quotes   Validate   │
         │         │           │       │
         │         └─────┬─────┘       │
         │               │              │
         │     (slippage OK?)           │
         │               │              │
         │  ┌────────────┴─────────┐   │
         │  │ (YES)  │ (NO)        │   │
         │  ▼        ▼             │   │
         │ Execute  Log Denial    │   │
         │ Trades   (skip)         │   │
         │  │        │             │   │
         │  └────────┴─────────────┘   │
         │         │                    │
         └────────┬──────────────────────┘
                  │
                  ▼
         NAV Calculator
         (oracle prices)
                  │
                  ▼
         Emit NAVUpdated Event
                  │
                  ▼
         Dashboard API
         Update Onchain
```

---

## State Model

### Treasury Account

```solana
PubKey treasury_account;
{
  admin: Pubkey,
  paused: bool,
  
  total_fees_collected: u64,
  total_deployed: u64,
  
  holdings: {
    [asset_id]: {
      amount: u64,
      symbol: String,
      decimals: u8,
      last_price_usd: f64,
      last_price_timestamp: i64,
    }
  },
  
  recent_allocations: [
    {
      timestamp: i64,
      allocations: [
        { asset_id, amount_deployed },
        ...
      ],
      nav_per_token: f64,
    }
  ],
  
  last_allocation_block: u64,
  last_nav_update_block: u64,
}
```

### Config Account

```solana
{
  admin: Pubkey,
  
  allocation_weights: {
    [asset_id]: {
      symbol: String,
      weight: f32,  // 0.0 to 1.0
      min_amount: u64,
      max_amount: u64,
    }
  },
  
  allocation_threshold: u64,     // e.g., 50_000_000 (50k USDC)
  allocation_interval_blocks: u64, // e.g., 201,600 (2 weeks)
  max_per_cycle: u64,            // e.g., 100_000_000,000 (100k USDC)
  slippage_limit_bps: u16,       // e.g., 50 (0.5%)
  cooldown_blocks: u64,          // e.g., 14_400 (1 day)
  
  base_token: Pubkey,            // USDC or SOL
  dex_program: Pubkey,           // Jupiter or other
}
```

---

## Security Model

### Admin Controls
- Only admin can update config
- Optional timelock (e.g., 24h delay before config changes take effect)
- Emergency pause flag (halt all allocations)

### Arithmetic Safety
- Checked arithmetic for all math (overflow/underflow protected)
- Slippage checks before trade execution
- Per-cycle spend cap prevents runaway spending

### Data Validation
- All oracle prices checked for staleness
- DEX quotes re-validated before execution
- Event logs immutable

---

## Deployment Flow

1. **Deploy Contracts** (Anchor)
   - Treasury account (PDA)
   - Fee Collector
   - Config account
   - IDL generated

2. **Mint WORLD Token**
   - Define fee taker (treasury PDA)
   - Initial supply
   - Metadata (name, symbol, image)

3. **Initialize Config**
   - Set allocation weights
   - Set parameters (thresholds, caps, cooldowns)
   - Set asset list

4. **Run Keeper Bot**
   - Start in DRY_RUN mode
   - Verify logic with mock data
   - Switch to live mode (requires signer keypair)

5. **Launch Dashboard**
   - Point to deployed program
   - Connect to RPC endpoint
   - Verify data feeds

6. **Monitor & Iterate**
   - Watch for allocation cycles
   - Adjust weights as needed
   - Track NAV performance

---

## Testing Strategy

### Unit Tests
- Math functions (NAV calculation)
- Slippage logic
- Allocation weight validation
- Oracle price staleness checks

### Integration Tests
- Fee capture (token transfer → event)
- Allocation execution (endpoint)
- Multiple allocation cycles
- Rebalancing logic

### End-to-End Tests
- Local validator with all contracts
- Keeper bot interacting with contracts
- Dashboard queries
- Full cycle: fees → allocation → NAV

### Dry-Run Mode
- Localnet testing without risking funds
- Integration with mock oracles
- Realistic traffic simulation

---

## Monitoring & Observability

### Logs
- Keeper bot logs to stdout + file
- Level: DEBUG, INFO, WARN, ERROR
- Structured JSON for parsing

### Metrics
- Total fees collected
- Total deployed
- Current treasury value
- NAV per token
- Time since last allocation
- Slippage on recent trades

### Alerts
- Treasury paused (immediate)
- Allocation execution failure (WARN)
- Oracle went stale (WARN)
- High slippage detected (INFO)
- Keeper bot crashed (CRITICAL)

### API
- `/api/treasury` — current state
- `/api/allocations` — recent executions
- `/api/nav` — NAV + history
- `/api/health` — keeper bot status

---

## Limitations & Future Work

### Current
- Manual config updates (admin only)
- No governance
- Fixed asset list (no additions without upgrade)
- Mock oracle on devnet (no real price feeds)

### Phase 2
- Upgrade to include snapshot governance
- Allow proposal of new allocation weights
- Automated parameter adjustments

### Phase 3
- Expand asset list dynamically
- Cross-chain bridge support
- User-customizable allocation profiles

---

## References

- **Smart Contract**: [program/AUDIT.md](../program/AUDIT.md)
- **Treasury Model**: [treasury-model.md](./treasury-model.md)
- **Allocation Strategy**: [allocation-strategy.md](./allocation-strategy.md)
- **NAV**: [nav-methodology.md](./nav-methodology.md)
- **Assets**: [rwa-and-proxy-assets.md](./rwa-and-proxy-assets.md)
- **Risks**: [risks.md](./risks.md)
