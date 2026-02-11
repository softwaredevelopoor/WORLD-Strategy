# RWA & Proxy Assets

This document lists the assets that WORLD Treasury allocates to, including RWA tokens and tokenized proxies.

---

## Asset Categories

### 1. S&P 500 Index (SPX) — 40%

**Purpose**: Large-cap US equity exposure

**Traditional Finance Equivalent**: iShares Core S&P 500 ETF (IVV) or Vanguard S&P 500 ETF (VOO)

**On Solana**:
- **Devnet Placeholder**: `SPX111111111111111111111111111111111` (6 decimals)
- **Mainnet Options**:
  - Wormhole-bridged **SPY** (SPDR S&P 500 ETF)
  - Custom tokenized wrapper (via Solend, Saber, etc.)
  - Directly track S&P 500 futures via oracle

**Price Feed**: 
- Pyth: S&P 500 Index price feed
- Fallback: DEX spot price vs USDC

**Performance Note**: 
- Reflects performance of largest 500 US companies
- ~70% of US market cap
- Historically ~10% annualized returns (long-term average)

---

### 2. Emerging Markets (EEM) — 20%

**Purpose**: Growth exposure to developing economies

**Traditional Finance Equivalent**: iShares MSCI Emerging Markets ETF (EEM)

**On Solana**:
- **Devnet Placeholder**: `EEM111111111111111111111111111111111` (6 decimals)
- **Mainnet Options**:
  - Wormhole-bridged **EEM** ETF shares
  - Composite: weighted mix of emerging market tokens
    - Brazil: Copom, other Brazilian tokens
    - India: INR-priced assets
    - China: CNY-proxies
    - Others: ASEAN, Africa
  - Partner DEX with EM-focused pools

**Price Feed**:
- Pyth: Emerging Markets index feed
- Fallback: Composite of underlying market indices

**Performance Note**:
- Higher volatility, higher growth potential
- Currency risk (FX exposure)
- Regulatory risks in some markets
- Historically ~12-15% annualized (with volatility)

---

### 3. Gold (GLD) — 15%

**Purpose**: Inflation hedge, store of value, volatility dampener

**Traditional Finance Equivalent**: SPDR Gold SharedS ETF (GLD) or iShares Gold Trust (IAU)

**On Solana**:
- **Devnet Placeholder**: `GLD111111111111111111111111111111111` (6 decimals)
- **Mainnet Options**:
  - **Tether Gold (XAUT)**: ERC-20, can bridge via Wormhole
  - **PAX Gold (PAXG)**: Similar gold-backed token
  - **Tokenized physical gold**: Via Glitter Finance, Chainlink, etc.
  - Direct SPL representation (custodied by Solana validators)

**Price Feed**:
- Pyth: Gold spot price (XAU/USD)
- Fallback: DEX spot vs USDC

**Performance Note**:
- Low correlation to equities (hedge property)
- Tends to perform well in high inflation
- Vulnerable to real interest rate changes
- Less volatile than equities
- Storage/custody risk if physical gold

---

### 4. Real-World Assets (RWA) — 25%

**Purpose**: Diversification into non-traditional assets, bridge to traditional finance

**What is RWA?**
Real-World Assets are claims on real economic value:
- **Real Estate**: Tokenized property, real estate investment trusts
- **Commodities**: Oil, natural gas, agricultural futures
- **Infrastructure**: Toll roads, utilities, renewable energy
- **Credit**: Loan portfolios, bonds, receivables
- **Trade Finance**: Invoice factoring, supply chain financing

**RWA Tokens on Solana (Examples — Not Exhaustive)**:

| Ticker | Name | Type | Address (Placeholder) |
|--------|------|------|----------------------|
| ONDO | Ondo Finance | Credit | `ONDO11111111111111111111111111111111` |
| REALT | RealT Tokens | Real Estate | `REALT1111111111111111111111111111111` |
| PURSE | Purse.io Credits | Commerce | `PURSE1111111111111111111111111111111` |
| MPLX | Maple Finance | Lending | `MPLX1111111111111111111111111111111` |
| USH | USD Harvest | Yield | `USH1111111111111111111111111111111` |

**Composite RWA Basket**:
WORLD treasury's "RWA" allocation targets a diversified mix:
- 40% to credit/lending tokens (ONDO, MPLX)
- 30% to real estate tokens (REALT, Propertyshares)
- 20% to commodity/infrastructure tokens
- 10% to emerging RWA protocols

**Price Feed**:
- Pyth: RWA index (if available) or composite
- Fallback: Individual token prices × weights

**Performance Note**:
- Emerging asset class, less track record
- Higher risk, potential higher returns
- Less liquid than traditional assets
- Regulatory uncertainty (key risk)
- Direct claims on real assets (credit risk)

---

## Asset Allocation Example

**Scenario**: $100,000 USDC monthly allocation

```
SPX (40%) = $40,000
  → Buy $40k worth of SPX tokens via Jupiter
  → (Approx. ~19,000 SPX @ $2.10/ea)

EEM (20%) = $20,000
  → Buy $20k worth of EEM tokens
  → (Approx. ~10,400 EEM @ $1.92/ea)

GLD (15%) = $15,000
  → Buy 15 units of gold (via XAUT or similar)
  → (~8,500 GLD @ $1.76/ea)

RWA (25%) = $25,000
  → Allocate across RWA basket:
    - ONDO:   $10,000
    - REALT:  $8,000
    - MPLX:   $4,000
    - USH:    $3,000
```

---

## Price Feeds & Oracles

### Primary: Pyth Network

Pyth provides high-frequency price feeds:

```
Product IDs (Mainnet):
  S&P 500:         0x8f0b465feff429e8055da29dc67bf0c301ce2f97daee7e38bb48e6c93af3e52f
  Emerging Markets: 0x... (placeholder)
  Gold (XAU/USD):  0xb1c41a6918c216afc9a11616c3e4b1d4f73e0ee7a04cff925c8e98ea19c46e3c
  RWA Index:       [Custom composite or partner feed]
```

### Fallback: DEX Spot Prices

If oracle unavailable, use DEX quotes:

```typescript
async function getDexPrice(mint: string): Promise<number> {
  const quote = await jupiterApi.quote({
    inputMint: USDC_MINT,
    outputMint: mint,
    amount: 1_000_000,  // $1
  });
  return 1_000_000 / quote.outAmount;
}
```

### Mock Prices (Development)

For testing:

```json
{
  "SPX111111111111111111111111111111111": 2.10,
  "EEM111111111111111111111111111111111": 1.88,
  "GLD111111111111111111111111111111111": 1.76,
  "RWA111111111111111111111111111111111": 1.65
}
```

Prices updated every 6 hours or on-demand.

---

## Risk Considerations by Asset

### SPX (Low Risk)
- **Liquidity**: Very high (AUM trillions globally)
- **Volatility**: Moderate (~15% annually)
- **Custody**: Via Solana, Wormhole bridge (bridge risk)
- **Concentration**: Concentrated in megacap tech
- **Regulatory**: Established, low risk

### EEM (Medium Risk)
- **Liquidity**: Medium (less than US equities)
- **Volatility**: High (~25% annually)
- **Custody**: Currency risk, political risk
- **Concentration**: By country (China, India exposure)
- **Regulatory**: Variable by country

### GLD (Low-Medium Risk)
- **Liquidity**: Very high
- **Volatility**: Low-medium (~12% annually)
- **Custody**: Physical storage or vault backing
- **Concentration**: Single commodity
- **Regulatory**: Established, some jurisdictional restrictions

### RWA (Medium-High Risk)
- **Liquidity**: Low to medium (emerging market)
- **Volatility**: High (unproven)
- **Custody**: Protocol-dependent, smart contract risk
- **Concentration**: Protocol-level concentration
- **Regulatory**: Unclear, changing rapidly

---

## Rebalancing Philosophy

The WORLD treasury does **not actively rebalance** holdings. Instead:

1. **Price appreciation** naturally shifts allocation
   - If SPX appreciates, its % weight increases
   - If EEM declines, its % weight decreases

2. **New allocations** gradually re-weight
   - If SPX is 45% (above 40% target), new allocation brings it closer
   - Over time, portfolio drifts toward target

3. **Future**: Manual rebalancing if drift > 5%
   - If any asset drifts > 5% from target, admin can trigger explicit rebalancing trades
   - Automatically sells overweight assets, buys underweight ones

---

## Asset Custody

### Solana Token Accounts

All assets held as **SPL tokens** in Solana token accounts:

```rust
// Treasury holds accounts for each asset:
pub struct HoldingAccount {
    pub token_account: Pubkey,        // SPL token account
    pub asset_id: String,              // "SPX", "EEM", etc.
    pub mint: Pubkey,                  // Token mint
    pub balance: u64,                  // Amount held
    pub token_program: Pubkey,         // Token program ID
}
```

### Wallets

- **Treasury Wallet**: Program Derived Address (PDA)
  - No private key (deterministically derived)
  - Governs all token movements
  - Immutable access rules

- **Keeper Wallet**: EOA (Externally Owned Account)
  - Holds signer keypair for executing transactions
  - Must be funded with SOL for gas
  - Should have signing permissions limited to treasury

### Custody Risks

- **Solana Network Risk**: Consensus failure, network partition
- **Bridge Risk** (Wormhole): Risk of bridge hack, token freeze
- **Smart Contract Risk**: Tokenized wrapper bugs
- **Oracle Risk**: False price feeds affecting NAV (not trading risk)

See [risks.md](./risks.md) for detailed analysis.

---

## Future Asset Additions

As DeFi and RWA mature, the WORLD treasury may add:

- **Crypto Native**: ETH, BTC, SOL (if governance approves)
- **DeFi Yields**: Lending tokens, LP positions (AAVE, Curve)
- **Additional RWA**: Bonds, mortgages, insurance streams
- **Currencies**: Stablecoin basket (EUR, JPY, GBP exposure)
- **Private Equity**: Venture tokens, startup exposure

Each addition requires:
1. Admin approval (current)
2. Liquidity assessment (can exit position?)
3. Price feed availability
4. Legal/regulatory review

---

## Summary

WORLD Treasury allocates to:
- **40% SPX**: Proven, liquid, low-risk US equities
- **20% EEM**: Growth exposure to emerging markets
- **15% GLD**: Proven, liquid, hedge against volatility
- **25% RWA**: Diversification, bridge to real world

All assets are tokenized on Solana, with prices published onchain and NAV calculated in real-time.

The allocation is **static** (admin-configurable) and **transparent** (all holdings queryable onchain).
