# WORLD Strategy ($WORLD)

<img width="1792" height="576" alt="Gemini_Generated_Image_5wteg35wteg35wte" src="https://github.com/user-attachments/assets/af3a9b8f-ac90-4510-a7bf-e36ab4f27ea0" />

X: https://x.com/WORLDStrategyy

“The world is a memecoin — so let’s build it transparently.”

WORLD Strategy is a crypto-native treasury token that routes creator fees into a transparent, onchain-tracked treasury. The treasury is allocated algorithmically across diversified global assets — ETFs, commodities, major equity indices, and real-world asset (RWA) proxies — with the goal of building a memecoin backed by measurable economic exposure.

This project is experimental, community-driven, and fully transparent.

No affiliation with Phantom, MetaMask, or any wallet, exchange, or financial institution.

No guaranteed returns — only a novel mechanism exploring diversified global strategy using memecoin mechanics.

⚠️ Important Disclaimer

NOT a promise of profit

NOT investment advice

NOT affiliated with any wallet, exchange, or financial institution

NOT guaranteed to be classified the same across jurisdictions — consult a lawyer

WORLD is experimental and exploratory

Exposure to underlying assets is speculative

Risks are real, including:

smart contract bugs

oracle failures

liquidity volatility

regulatory uncertainty

Read RISKS.md carefully before participating.

🎯 Core Idea

WORLD Strategy routes creator fees into a transparent treasury designed to build diversified exposure to global assets over time.

It starts as a memecoin to bootstrap liquidity and attention, then evolves into a treasury-backed, NAV-tracked structure.

⚙️ How It Works
Fee Capture

Each WORLD token transaction applies a configurable creator fee (ex: 2%), sent directly to the treasury wallet.

Allocation Engine

At defined intervals or thresholds:

Converts collected fees into a base asset (USDC or SOL)

Allocates across a configurable basket of global assets

Logs all trades onchain as immutable events

Treasury Transparency

Any holder can query:

Total fees collected

Current treasury composition

Estimated NAV (Net Asset Value)

NAV per token = total treasury value ÷ circulating supply

Automation

A keeper bot continuously:

Monitors treasury state

Executes rebalancing trades via DEX aggregators

Publishes allocation reports

✨ Key Features

🌍 Global Exposure — diversified allocation to indices, commodities, RWAs

🔍 Onchain Transparency — treasury actions emitted as verifiable events

🤖 Automated Rebalancing — keeper bot executes without manual intervention

📊 NAV Reporting — estimated treasury backing per token

🛡️ Circuit Breakers — slippage caps, spend limits, cooldown periods

🟢 Simulation Mode — DRY_RUN for local testing without keys or funds

⚙️ Flexible Allocation — configurable weights, governance-upgradable assets

📊 Treasury Model
Creator Fees (1–5% of volume)
        ↓
Onchain Treasury Wallet
        ↓
Convert to Base Asset (USDC/SOL)
        ↓
Allocation Engine
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
git clone https://github.com/softwaredevelopoor/WORLD-Strategy.git
cd WORLD-Strategy
pnpm install

cp .env.example .env.local

Run Keeper (Dry Run)
cd keeper
export DRY_RUN=true
pnpm dev

Run Dashboard
cd dashboard
pnpm dev


Open: http://localhost:3000

DRY_RUN mode:

Simulates treasury state

Logs allocation decisions

Computes NAV with mock prices

Outputs reports to console

🏗️ Architecture
Solana Smart Contract (Anchor)

Key accounts:

pub struct Treasury {
    pub admin: Pubkey,
    pub paused: bool,
    pub total_fees_collected: u64,
    pub total_deployed: u64,
    pub last_allocation_timestamp: i64,
}


Core instructions:

initialize_treasury

record_fees

execute_allocation

update_nav

pause_treasury

unpause_treasury

See program/src/lib.rs.

Keeper Bot (TypeScript)

Main loop:

Monitor treasury

Check allocation trigger

Prepare allocations

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

git clone https://github.com/softwaredevelopoor/WORLD-Strategy.git
pnpm install
git checkout -b feature/your-feature
pnpm test
git commit -m "feat: description"
git push origin feature/your-feature
