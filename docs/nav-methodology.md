# NAV Methodology

This document explains how the WORLD Strategy calculates and reports Net Asset Value (NAV).

---

## Definition

**NAV per token** is an estimate of treasury backing per WORLD token:

```
NAV = (Total Treasury Value in USD) / (Circulating WORLD Tokens)
```

Example:
- Treasury holds assets worth $1,000,000
- 800,000 WORLD tokens circulating
- NAV = $1,000,000 / 800,000 = **$1.25 per WORLD token**

---

## Calculation Process

### Step 1: Fetch Oracle Prices

For each asset in the treasury, fetch current price from oracle:

```typescript
interface AssetPrice {
  asset: string;      // "SPX", "EEM", "GLD", "RWA"
  mint: string;       // Token mint address
  priceUSD: number;   // Current price in USD
  source: string;     // "pyth", "mock", "dex_spot"
  timestamp: number;  // When price was fetched
  staleness: number;  // Age in seconds
}

// Fetch prices
const prices: AssetPrice[] = [];
for (const holding of treasury.holdings) {
  const price = await oracle.getPrice(holding.mint);
  
  // Validate staleness
  const age = now() - price.timestamp;
  if (age > config.max_price_age_seconds) {
    throw new Error(`Price for ${holding.asset} is stale (${age}s old)`);
  }
  
  prices.push(price);
}
```

### Step 2: Compute Asset Values

For each holding, multiply amount × price:

```typescript
interface AssetValue {
  asset: string;
  amount: number;              // amount of tokens held
  priceUSD: number;            // price per token
  valueUSD: number;            // amount × price
  weight: number;              // valueUSD / total
  costBasis: number;           // original USDC spent (for reporting)
  unrealizedGain: number;      // valueUSD - costBasis
  gainPct: number;             // unrealizedGain / costBasis
}

const values: AssetValue[] = [];
let totalValue = 0;

for (const holding of treasury.holdings) {
  const price = priceMap[holding.mint];
  const value = holding.amount * price.priceUSD;
  
  values.push({
    asset: holding.asset,
    amount: holding.amount,
    priceUSD: price.priceUSD,
    valueUSD: value,
    weight: 0,  // computed below
    costBasis: holding.costBasis,
    unrealizedGain: value - holding.costBasis,
    gainPct: (value - holding.costBasis) / holding.costBasis,
  });
  
  totalValue += value;
}

// Compute weights
for (const val of values) {
  val.weight = val.valueUSD / totalValue;
}
```

### Step 3: Compute Total Treasury Value

Sum across all holdings:

```typescript
const totalTreasuryUSD = values.reduce((sum, v) => sum + v.valueUSD, 0);
```

This includes:
- Holdings in **SPX**, **EEM**, **GLD**, **RWA** tokens
- Any cash reserve in **USDC** (unallocated fees)

### Step 4: Fetch Circulating Supply

Get current token supply:

```typescript
// Option A: Direct RPC call
const supply = await connection.getTokenSupply(WORLD_MINT);
const circulatingSupply = supply.value.uiAmount;

// Option B: Sum via token accounts
const accounts = await connection.getProgramAccounts(
  TOKEN_PROGRAM_ID,
  {
    filters: [
      { dataSize: 165 },
      { memcmp: { offset: 0, bytes: WORLD_MINT.toBase58() } },
    ],
  }
);
const circulatingSupply = accounts.reduce((sum, acc) => {
  const parsed = parseTokenAccount(acc.account.data);
  return sum + parsed.amount;
}, 0);
```

### Step 5: Calculate NAV

```typescript
const navPerToken = totalTreasuryUSD / circulatingSupply;
```

### Step 6: Emit Event

```rust
#[event]
pub struct NAVUpdated {
    pub nav_per_token: f64,
    pub total_treasury_usd: f64,
    pub circulating_tokens: u64,
    pub asset_values: Vec<AssetValue>,
    pub timestamp: i64,
    pub block: u64,
    pub oracle_source: String,
}

emit!(NAVUpdated {
    nav_per_token,
    total_treasury_usd,
    circulating_tokens: circulating_supply,
    asset_values: values.clone(),
    timestamp: Clock::get()?.unix_timestamp,
    block: Clock::get()?.slot,
    oracle_source: config.oracle_source.clone(),
});
```

---

## Oracle Integration

### Mainnet: Pyth Network

On Solana mainnet, use **Pyth Network** for price feeds:

```typescript
const pythClient = new PythConnection({
  endpoint: "https://pythnet.rpcpool.com",
  transport: NodeHttpTransport,
});

async function getPythPrice(productId: string): Promise<number> {
  const latestPrices = await pythClient.getLatestPriceFeeds([productId]);
  if (!latestPrices || latestPrices.length === 0) {
    throw new Error(`No price feed for ${productId}`);
  }
  
  const feed = latestPrices[0];
  const price = feed.getPriceUnchecked();  // Latest price
  
  // Validate confidence
  if (!price.confidence || price.confidence > price.price * 0.01) {
    throw new Error(`Price confidence too high for ${productId}`);
  }
  
  // Validate recency
  const age = Date.now() / 1000 - price.publishTime;
  if (age > 60) {  // 1 minute max age
    throw new Error(`Price for ${productId} is ${age}s old`);
  }
  
  return price.price;
}
```

**Price feeds used**:
- SPX (S&P 500): `0x8f0b465feff429e8055da29dc67bf0c301ce2f97daee7e38bb48e6c93af3e52f`
- EEM (Emerging Markets): `0x...` (placeholder)
- GLD (Gold): `0x...` (placeholder)
- RWA (Tokenized RWA): `0x...` (placeholder)

### Devnet/Testing: Mock Oracle

For testing without real Pyth data:

```typescript
interface MockOraclePrice {
  [mint: string]: {
    price: number;
    timestamp: number;
    volatility: number;  // for simulation
  }
}

const mockPrices: MockOraclePrice = {
  "SPX111111111111111111111111111111111": {
    price: 2.10,
    timestamp: Date.now() / 1000,
    volatility: 0.15,  // 15% annual volatility
  },
  "EEM111111111111111111111111111111111": {
    price: 1.88,
    timestamp: Date.now() / 1000,
    volatility: 0.25,  // 25% annual volatility
  },
  // ... other mocks
};

function getMockPrice(mint: string): number {
  return mockPrices[mint]?.price ?? 1.0;
}
```

### Fallback: DEX Spot Price

If oracle unavailable, can fall back to DEX spot price:

```typescript
async function getDEXSpotPrice(mint: string): Promise<number> {
  const quote = await jupiterApi.quote({
    inputMint: USDC_MINT,
    outputMint: mint,
    amount: 1_000_000,  // $1 USDC
  });
  
  const spotPrice = 1_000_000 / quote.outAmount;
  return spotPrice;
}
```

---

## Reporting

### Dashboard Display

The NAV is displayed on the dashboard:

```typescript
// GET /api/nav
{
  "navPerToken": 1.25,
  "previousNav": 1.23,
  "change": 0.02,
  "changePct": 1.62,
  "timestamp": "2026-02-11T14:30:00Z",
  "assets": [
    {
      "symbol": "SPX",
      "amount": 15234,
      "priceUSD": 2.10,
      "valueUSD": 32000,
      "weight": 0.32,
      "gainPct": 5.2
    },
    // ... other assets
  ],
  "totalTreasuryUSD": 100000,
  "circulatingSupply": 80000,
  "oracleSource": "pyth"
}
```

### Historical Tracking

The keeper bot stores NAV history for charting:

```typescript
interface NAVHistory {
  timestamp: number;
  navPerToken: number;
  totalTreasuryUSD: number;
  weights: { [symbol: string]: number };
}

const history: NAVHistory[] = [];

// Every block or on-demand
const latest = await calculateNav();
history.push({
  timestamp: Date.now(),
  navPerToken: latest.navPerToken,
  totalTreasuryUSD: latest.totalTreasuryUSD,
  weights: latest.weights,
});

// Keep last 365 days
if (history.length > 365 * 24) {
  history.shift();  // Remove oldest
}
```

### Event Logs

All NAV updates are logged as onchain events:

```rust
// In smart contract
emit!(NAVUpdated {
    nav_per_token: calculated_nav,
    total_treasury_usd: total_value,
    circulating_tokens: supply,
    timestamp: Clock::get()?.unix_timestamp,
    block: Clock::get()?.slot,
});
```

These can be queried via RPC for verification.

---

## Important Disclaimers

### NAV is an Estimate

NAV is **not a guarantee** or promise of value. It is an estimate based on:

1. **Oracle prices**: Subject to manipulation, staleness, failure
2. **Assumptions**: About token decimals, supply
3. **Liquidity**: Some holdings may be illiquid; actual sale price could differ
4. **Volatility**: Market prices change second-to-second

### NAV is Not Promised Returns

The NAV can go **down** as well as up:
- If SPX market declines, NAV declines
- If USDC/USD depegs, NAV affected
- If RWA token becomes illiquid, valuation uncertain

**Never treat NAV as a promise of returns or price floor.**

### "Backing" is Theoretical

Even if treasury holds $1M in assets, those assets:
- May be illiquid (hard to sell)
- May be subject to regulatory restrictions
- May decline in value
- May be lost to smart contract bugs

### Regulatory Uncertainty

Allocations to RWAs and foreign assets may face:
- Geographic restrictions
- Licensing requirements
- Tax implications
- Sudden regulatory bans

See [risks.md](./risks.md) for comprehensive analysis.

---

## Calculation Safety

### Checked Arithmetic

All arithmetic uses **checked operations** to prevent overflow:

```rust
pub fn calculate_nav(
    treasury: &TreasuryAccount,
    prices: &HashMap<String, f64>,
) -> Result<f64> {
    let mut total_value: f64 = 0.0;
    
    for (asset_id, holding) in treasury.holdings.iter() {
        let price = prices.get(asset_id)
            .ok_or(TreasuryError::PriceMissing)?;
        
        // Checked multiply
        let value = holding.amount as f64 * price;
        
        // Check for NaN/Inf
        if !value.is_finite() {
            return Err(TreasuryError::InvalidValue);
        }
        
        total_value += value;
    }
    
    // Divide with protection
    if treasury.circulating_supply == 0 {
        return Err(TreasuryError::NoCirculation);
    }
    
    let nav = total_value / (treasury.circulating_supply as f64);
    
    Ok(nav)
}
```

### Price Validation

Before using any oracle price:

```typescript
function validatePrice(price: OraclePrice): boolean {
  // Not NaN/Inf
  if (!isFinite(price.value)) return false;
  
  // Positive
  if (price.value <= 0) return false;
  
  // Not stale
  const age = Date.now() / 1000 - price.timestamp;
  if (age > 300) return false;  // 5 min max
  
  // Reasonable confidence (for Pyth)
  if (price.confidence && price.confidence > price.value * 0.1) {
    return false;  // > 10% confidence, too uncertain
  }
  
  return true;
}
```

---

## Example Calculation

**Scenario**: Treasury state at block 257,432,100

```
Holdings:
  SPX: 15,000 tokens @ $2.15 = $32,250
  EEM:  8,000 tokens @ $1.92 = $15,360
  GLD:  6,500 tokens @ $1.75 = $11,375
  RWA: 12,000 tokens @ $1.63 = $19,560
  USDC: 5,000 (cash, = $5,000)
  
Total Treasury Value = $32,250 + $15,360 + $11,375 + $19,560 + $5,000 = $83,545

Circulating Supply = 75,000 WORLD tokens

NAV = $83,545 / 75,000 = $1.114 per WORLD token
```

Dashboard would show:
```
NAV: $1.11
Assets:
  SPX:  38.6% ($32,250)
  EEM:  18.4% ($15,360)
  RWA:  23.4% ($19,560)
  GLD:  13.6% ($11,375)
```

---

## Summary

NAV is calculated by:
1. **Fetching oracle prices** for all holdings
2. **Multiplying each holding by its price**
3. **Summing total treasury value**
4. **Dividing by circulating supply**

The result is published:
- **Onchain** as an event log
- **Dashboard** for visualization
- **API** for developers

**Important**: NAV is an estimate, not a promise or guarantee.
