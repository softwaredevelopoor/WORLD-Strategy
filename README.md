# WORLD Strategy ($WORLD)

"The world is a memecoin, so let's build it transparently."

WORLD Strategy is a crypto-native treasury token that routes creator fees into a transparent, onchain-tracked treasury. The treasury is allocated algorithmically across diversified global assets including equity indexes, commodities, and real-world asset (RWA) proxies. The goal is a memecoin backed by a transparent treasury mechanism.

This project is experimental, community-driven, and fully transparent. It is not affiliated with Phantom, MetaMask, or any other wallet or platform. There are no profit guarantees.

---

## Important Disclaimer

- Not a promise of profit. This is an experimental treasury protocol.
- Not affiliated with any wallet, exchange, or financial institution.
- Not investment advice. Exposure to underlying assets is speculative.
- Not a security determination; consult legal counsel for your jurisdiction.
- Real risks exist: smart contract bugs, oracle failures, liquidity risk, and regulatory uncertainty.

Read [docs/risks.md](docs/risks.md) before engaging.

---

## Core Idea

WORLD Strategy routes creator fees into a transparent treasury designed to build diversified global asset exposure over time.

### How it works

1. Fee capture: Each WORLD token transaction routes a configurable creator fee (e.g., 2%) into the treasury.
2. Allocation engine: On a time interval or threshold, fees are converted to a base asset (USDC/SOL) and allocated across a configurable basket.
3. Treasury transparency: Any holder can query total fees collected, treasury composition, and estimated NAV per token.
4. Automation: A keeper bot monitors the treasury, executes rebalances via DEX aggregators, and publishes reports.

---

## Key Features

- Diversified global exposure via configurable allocation weights.
- Onchain transparency with immutable event logs.
- Automated rebalancing and NAV reporting.
- Safety controls: slippage limits, spending caps, cooldowns.
- DRY_RUN simulation mode for local testing.

---

## Treasury Model

```
Creator Fees (1-5% of volume)
    |
Treasury Wallet (onchain tracking)
    |
Base Asset Conversion (USDC/SOL)
    |
Allocation Engine (SPX=40%, EEM=20%, GLD=15%, RWA=25%)
    |
DEX Execution (Jupiter or similar)
    |
Treasury Holdings (oracle-priced)
    |
NAV Calculation (treasury value / supply)
```

Key params (see [scripts/config.example.json](scripts/config.example.json)):

- fee_rate: 2%
- allocation_interval: 2 weeks
- max_per_cycle: $100k
- slippage_limit: 0.5%
- cooldown_blocks: 1 day

---

## NAV Methodology

```
NAV = (Sum of all treasury assets in USD)
    / (WORLD tokens in circulation)
```

- Uses Pyth Network on mainnet and mock oracles in testing.
- Updated every block or on demand.
- For reporting only, not trading guarantees.

See [docs/nav-methodology.md](docs/nav-methodology.md) for the full derivation.

---

## Quickstart (Local Simulation)

Prereqs:

- Node 18+
- pnpm
- Solana CLI (optional)

Setup:

```bash
git clone https://github.com/softwaredevelopoor/WORLD-Strategy.git
cd WORLD-Strategy
pnpm install

cp .env.example .env.local

cd keeper
export DRY_RUN=true
pnpm dev

cd ../dashboard
pnpm dev
# Open http://localhost:3000
```

In DRY_RUN mode, the keeper:

- Simulates treasury state
- Logs allocation decisions without executing trades
- Computes NAV from mock prices
- Generates stdout reports

---

## Example Output

### Keeper Bot (DRY_RUN)

```bash
$ cd keeper && export DRY_RUN=true && pnpm dev

[INFO] === WORLD Strategy Keeper Bot ===
[INFO] Environment: DRY_RUN (simulation)
[INFO] Network: devnet
[INFO] Log Level: info
[DEBUG] Initializing keeper bot...
[INFO] [DRY_RUN] Using simulated treasury
[INFO] Keeper initialized
[INFO] Starting keeper loop (interval: 30000ms)
[DEBUG] --- Keeper Cycle ---
[DEBUG] Treasury state: fees=25000, deployed=100000
[DEBUG] Threshold: 25000 >= 50000 ? false
[DEBUG] Interval: 86400s >= 1209600s ? false
[DEBUG] No allocation triggered this cycle

[INFO] --- Keeper Cycle (30s later) ---
[DEBUG] Treasury state: fees=50500, deployed=100000
[DEBUG] Threshold: 50500 >= 50000 ? true
[INFO] Allocation triggered
[INFO] Prepared allocations: 4
[INFO] Slippage validation passed
[INFO] [DRY_RUN] Would execute allocations:
{
  "asset": "SPX",
  "amountDeployed": 20333.33,
  "amountReceived": 9699.68,
  "slippageBps": 28
}
```

### Dashboard

```bash
$ cd dashboard && pnpm dev

> world-dashboard@1.0.0 dev
> next dev

  Next.js 14.0.0
  Local: http://localhost:3000

Ready in 1.2s
```

---

## Architecture

### Solana Smart Contract (Anchor)

```rust
pub struct Treasury {
    pub admin: Pubkey,
    pub paused: bool,
    pub total_fees_collected: u64,
    pub total_deployed: u64,
    pub last_allocation_timestamp: i64,
}

pub fn initialize_treasury() -> Result<()>
pub fn record_fees(amount: u64) -> Result<()>
pub fn execute_allocation(allocations: Vec<AssetAllocation>) -> Result<()>
pub fn update_nav(nav_per_token: f64, ...) -> Result<()>
pub fn pause_treasury() -> Result<()>
pub fn unpause_treasury() -> Result<()>
```

See [program/src/lib.rs](program/src/lib.rs).

### Keeper Bot (TypeScript)

```typescript
class Keeper {
  async start() {
    setInterval(async () => {
      const state = await monitor.getTreasuryState();

      if (await allocator.shouldAllocate(state)) {
        const allocations = await allocator.prepareAllocations(state);

        if (await allocator.validateSlippage(allocations)) {
          await allocator.execute(allocations);
          const nav = await navCalculator.calculate(state);
          reportGenerator.generate({ nav, state });
        }
      }
    }, 30000);
  }
}
```

See [keeper/src](keeper/src).

### Dashboard (Next.js)

```typescript
export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    const mock: DashboardData = {
      nav: {
        navPerToken: 1.25,
        totalTreasuryUSD: 1000000,
        assets: {
          SPX: { value: 400000, weight: 0.4 },
          EEM: { value: 200000, weight: 0.2 },
          GLD: { value: 150000, weight: 0.15 },
          RWA: { value: 250000, weight: 0.25 },
        },
      },
      treasury: {
        totalFeesCollected: 200000,
        totalDeployed: 1000000,
      },
    };
    setData(mock);
  }, []);

  return (
    <div className="space-y-8">
      <TreasuryCard title="NAV per Token" value={`$${data?.nav.navPerToken.toFixed(4)}`} />
      <AllocationChart data={weights} />
      <NAVChart data={navHistory} />
    </div>
  );
}
```

See [dashboard/src](dashboard/src).

---

## Documentation

| Topic | File | Purpose |
|-------|------|---------|
| Overview | [docs/overview.md](docs/overview.md) | System architecture |
| Treasury model | [docs/treasury-model.md](docs/treasury-model.md) | Fee capture and allocation |
| Allocation strategy | [docs/allocation-strategy.md](docs/allocation-strategy.md) | Asset rules and weights |
| NAV methodology | [docs/nav-methodology.md](docs/nav-methodology.md) | NAV formula and inputs |
| RWA assets | [docs/rwa-and-proxy-assets.md](docs/rwa-and-proxy-assets.md) | Asset description |
| Risks | [docs/risks.md](docs/risks.md) | Risk analysis |
| FAQ | [docs/faq.md](docs/faq.md) | Questions and answers |
| Deploy | [scripts/deploy.md](scripts/deploy.md) | Deployment guide |
| Monitor | [scripts/monitor.md](scripts/monitor.md) | Monitoring guide |

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

```bash
git clone https://github.com/softwaredevelopoor/WORLD-Strategy.git
cd WORLD-Strategy
pnpm install

git checkout -b feature/your-feature

cd keeper && pnpm test
cd ../program && anchor test
cd ../dashboard && pnpm test

git commit -m "feat: add your feature"
git push origin feature/your-feature
```

---

## Security

This is pre-audit experimental code. Do not deploy to mainnet with real funds without:

- Professional smart contract audit
- Independent risk review
- Phased launch with strict caps

See [SECURITY.md](SECURITY.md) for disclosure.

---

## License

MIT. See [LICENSE](LICENSE).
        ↓
DEX Execution (Jupiter or similar)
        ↓
Treasury Holdings
        ↓
NAV Calculation


Example allocation weights:

S&P500: 40%

Emerging Markets: 20%

Gold: 15%

RWA Proxies: 25%

Key parameters (config.example.json):

fee_rate: 2%

allocation_interval: 2 weeks

max_per_cycle: $100k

slippage_limit: 0.5%

cooldown_blocks: 1 day

📐 NAV Methodology

NAV per token estimates treasury backing:

NAV = total treasury asset value (USD)
      ÷ circulating WORLD supply


Uses Pyth Network price feeds on mainnet

Uses mock oracles in testing

Updated per block or on demand

NAV is not a guarantee and may lag or misprice illiquid assets.
Used for dashboard display and monitoring only — not trading logic.

See docs/nav-methodology.md for full derivation.

🚀 Quickstart (Local Simulation)

Run the system fully in simulation mode.

Requirements

Node 18+

pnpm

Solana CLI (optional)

Setup
=======
## Quickstart (Local Simulation)

Prereqs:

- Node 18+
- pnpm
- Solana CLI (optional)

Setup:

```bash
>>>>>>> 6d8d47d (docs: translate README to English)
git clone https://github.com/softwaredevelopoor/WORLD-Strategy.git
cd WORLD-Strategy
pnpm install

cp .env.example .env.local

<<<<<<< HEAD
Run Keeper (Dry Run)
=======
>>>>>>> 6d8d47d (docs: translate README to English)
cd keeper
export DRY_RUN=true
pnpm dev

<<<<<<< HEAD
Run Dashboard
cd dashboard
pnpm dev

=======
cd ../dashboard
pnpm dev
# Open http://localhost:3000
```

In DRY_RUN mode, the keeper:

- Simulates treasury state
- Logs allocation decisions without executing trades
- Computes NAV from mock prices
- Generates stdout reports
>>>>>>> 6d8d47d (docs: translate README to English)

Open: http://localhost:3000

<<<<<<< HEAD
DRY_RUN mode:
=======
## Example Output
>>>>>>> 6d8d47d (docs: translate README to English)

Simulates treasury state

Logs allocation decisions

<<<<<<< HEAD
Computes NAV with mock prices

Outputs reports to console

🏗️ Architecture
Solana Smart Contract (Anchor)

Key accounts:

=======
[INFO] === WORLD Strategy Keeper Bot ===
[INFO] Environment: DRY_RUN (simulation)
[INFO] Network: devnet
[INFO] Log Level: info
[DEBUG] Initializing keeper bot...
[INFO] [DRY_RUN] Using simulated treasury
[INFO] Keeper initialized
[INFO] Starting keeper loop (interval: 30000ms)
[DEBUG] --- Keeper Cycle ---
[DEBUG] Treasury state: fees=25000, deployed=100000
[DEBUG] Threshold: 25000 >= 50000 ? false
[DEBUG] Interval: 86400s >= 1209600s ? false
[DEBUG] No allocation triggered this cycle

[INFO] --- Keeper Cycle (30s later) ---
[DEBUG] Treasury state: fees=50500, deployed=100000
[DEBUG] Threshold: 50500 >= 50000 ? true
[INFO] Allocation triggered
[INFO] Prepared allocations: 4
[INFO] Slippage validation passed
[INFO] [DRY_RUN] Would execute allocations:
{
  "asset": "SPX",
  "amountDeployed": 20333.33,
  "amountReceived": 9699.68,
  "slippageBps": 28
}
```

### Dashboard

```bash
$ cd dashboard && pnpm dev

> world-dashboard@1.0.0 dev
> next dev

  ▲ Next.js 14.0.0
  - Local:        http://localhost:3000

Ready in 1.2s
```

---

## Architecture

### Solana Smart Contract (Anchor)

```rust
>>>>>>> 6d8d47d (docs: translate README to English)
pub struct Treasury {
    pub admin: Pubkey,
    pub paused: bool,
    pub total_fees_collected: u64,
    pub total_deployed: u64,
    pub last_allocation_timestamp: i64,
}

<<<<<<< HEAD

Core instructions:
=======
pub fn initialize_treasury() -> Result<()>
pub fn record_fees(amount: u64) -> Result<()>
pub fn execute_allocation(allocations: Vec<AssetAllocation>) -> Result<()>
pub fn update_nav(nav_per_token: f64, ...) -> Result<()>
pub fn pause_treasury() -> Result<()>
pub fn unpause_treasury() -> Result<()>
```

See [program/src/lib.rs](program/src/lib.rs).
>>>>>>> 6d8d47d (docs: translate README to English)

initialize_treasury

<<<<<<< HEAD
record_fees

execute_allocation

update_nav
=======
```typescript
class Keeper {
  async start() {
    setInterval(async () => {
      const state = await monitor.getTreasuryState();

      if (await allocator.shouldAllocate(state)) {
        const allocations = await allocator.prepareAllocations(state);

        if (await allocator.validateSlippage(allocations)) {
          await allocator.execute(allocations);
          const nav = await navCalculator.calculate(state);
          reportGenerator.generate({ nav, state });
        }
      }
    }, 30000);
  }
}
```

See [keeper/src](keeper/src).

### Dashboard (Next.js)
>>>>>>> 6d8d47d (docs: translate README to English)

pause_treasury

<<<<<<< HEAD
unpause_treasury

See program/src/lib.rs.

Keeper Bot (TypeScript)
=======
  useEffect(() => {
    const mock: DashboardData = {
      nav: {
        navPerToken: 1.25,
        totalTreasuryUSD: 1000000,
        assets: {
          SPX: { value: 400000, weight: 0.4 },
          EEM: { value: 200000, weight: 0.2 },
          GLD: { value: 150000, weight: 0.15 },
          RWA: { value: 250000, weight: 0.25 },
        },
      },
      treasury: {
        totalFeesCollected: 200000,
        totalDeployed: 1000000,
      },
    };
    setData(mock);
  }, []);

  return (
    <div className="space-y-8">
      <TreasuryCard title="NAV per Token" value={`$${data?.nav.navPerToken.toFixed(4)}`} />
      <AllocationChart data={weights} />
      <NAVChart data={navHistory} />
    </div>
  );
}
```

See [dashboard/src](dashboard/src).
>>>>>>> 6d8d47d (docs: translate README to English)

Main loop:

<<<<<<< HEAD
Monitor treasury

Check allocation trigger
=======
## Documentation

| Topic | File | Purpose |
|-------|------|---------|
| Overview | [docs/overview.md](docs/overview.md) | System architecture |
| Treasury model | [docs/treasury-model.md](docs/treasury-model.md) | Fee capture and allocation |
| Allocation strategy | [docs/allocation-strategy.md](docs/allocation-strategy.md) | Asset rules and weights |
| NAV methodology | [docs/nav-methodology.md](docs/nav-methodology.md) | NAV formula and inputs |
| RWA assets | [docs/rwa-and-proxy-assets.md](docs/rwa-and-proxy-assets.md) | Asset description |
| Risks | [docs/risks.md](docs/risks.md) | Risk analysis |
| FAQ | [docs/faq.md](docs/faq.md) | Questions and answers |
| Deploy | [scripts/deploy.md](scripts/deploy.md) | Deployment guide |
| Monitor | [scripts/monitor.md](scripts/monitor.md) | Monitoring guide |
>>>>>>> 6d8d47d (docs: translate README to English)

Prepare allocations

<<<<<<< HEAD
Validate slippage

Execute trades

Update NAV

Generate reports

See keeper/src/.

Dashboard (Next.js)

Displays:

Treasury balances

Allocation charts

NAV per token

NAV history

Fee inflow history

Recent transactions

See dashboard/src/.

📚 Full Documentation
Topic	File
Overview	docs/overview.md
Treasury Model	docs/treasury-model.md
Allocation Strategy	docs/allocation-strategy.md
NAV Methodology	docs/nav-methodology.md
RWA Assets	docs/rwa-and-proxy-assets.md
Risk Analysis	docs/risks.md
FAQ	docs/faq.md
Deployment	scripts/deploy.md
Monitoring	scripts/monitor.md
🔄 Contributing

See CONTRIBUTING.md.

=======
## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

```bash
>>>>>>> 6d8d47d (docs: translate README to English)
git clone https://github.com/softwaredevelopoor/WORLD-Strategy.git
pnpm install
<<<<<<< HEAD
git checkout -b feature/your-feature
pnpm test
git commit -m "feat: description"
git push origin feature/your-feature
=======

git checkout -b feature/your-feature

cd keeper && pnpm test
cd ../program && anchor test
cd ../dashboard && pnpm test

git commit -m "feat: add your feature"
git push origin feature/your-feature
```

---

## Security

This is pre-audit experimental code. Do not deploy to mainnet with real funds without:

- Professional smart contract audit
- Independent risk review
- Phased launch with strict caps

See [SECURITY.md](SECURITY.md) for disclosure.

---

## License

MIT. See [LICENSE](LICENSE).
>>>>>>> 6d8d47d (docs: translate README to English)
