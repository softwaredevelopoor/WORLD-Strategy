# WORLD Strategy Complete Repository

Welcome to the **WORLD Strategy** protocol—a crypto-native treasury token that routes creator fees into transparent, diversified global asset exposure.

---

## 📂 What's Included

This repository contains **production-grade, pre-audit code** for the complete WORLD Stack:

### ✅ 36 Files | 7 Directories | ~5,000 Lines of Code

#### 📚 Documentation (7 files)
- **README.md** — Project pitch, features, quickstart
- **docs/overview.md** — System architecture & data flow
- **docs/treasury-model.md** — Fee capture & allocation mechanics
- **docs/allocation-strategy.md** — Asset allocation rules
- **docs/nav-methodology.md** — NAV calculation formula
- **docs/rwa-and-proxy-assets.md** — Asset list & descriptions
- **docs/risks.md** — 20+ risks & mitigations
- **docs/faq.md** — ~50 common questions

#### 🔐 Smart Contracts (Solana/Anchor)
- **program/src/lib.rs** — Treasury contract (~400 LOC)
  - Fee collection
  - Allocation execution
  - NAV updates
  - Circuit breakers (pause, cooldown, slippage)
  - Event logging
- **program/Cargo.toml** — Dependencies
- **program/AUDIT.md** — Security checklist

#### 🤖 Keeper Bot (TypeScript/Node.js)
- **keeper/src/index.ts** — Entry point
- **keeper/src/keeper.ts** — Main loop
- **keeper/src/treasury.ts** — State monitoring
- **keeper/src/allocator.ts** — Allocation executor
- **keeper/src/nav.ts** — NAV calculator
- **keeper/src/reporter.ts** — Report generator
- **keeper/src/utils/logger.ts** — Logging
- **keeper/package.json** — Dependencies

#### 💻 Dashboard (Next.js/React)
- **dashboard/src/pages/index.tsx** — Main dashboard
- **dashboard/src/components/** — Treasury cards, charts
- **dashboard/src/lib/** — Utilities & formatters
- **dashboard/package.json** — Dependencies

#### 🚀 Scripts & Config
- **scripts/config.example.json** — Allocation configuration
- **scripts/deploy.md** — Deployment runbook
- **scripts/monitor.md** — Monitoring & incident response

#### 📋 Community & Policy
- **CONTRIBUTING.md** — How to contribute
- **CODE_OF_CONDUCT.md** — Community standards
- **SECURITY.md** — Vulnerability disclosure
- **LICENSE** — MIT license
- **.env.example** — Environment variables

---

## 🚀 Quick Start (60 seconds)

Launch the entire stack locally in simulation mode:

```bash
# 1. Clone and install
git clone https://github.com/softwaredevelopoor/WORLD-Strategy.git
cd WORLD-Strategy
pnpm install

# 2. Run keeper bot (simulation mode)
cd keeper
export DRY_RUN=true
pnpm dev

# 3. (In another terminal) Run dashboard
cd ../dashboard
pnpm dev  # Opens http://localhost:3000
```

**Result**: See the keeper bot simulate allocation cycles, treasury state updates, and NAV calculations. Dashboard shows mock treasury data in real-time.

---

## 🎯 Core Concept

```
Creator Fees (2%)
    ↓
Treasury Wallet
    ↓
USDC Conversion
    ↓
Allocation Engine
    ├── 40% S&P 500 (SPX)
    ├── 20% Emerging Markets (EEM)
    ├── 15% Gold (GLD)
    └── 25% Real-World Assets (RWA)
    ↓
NAV Calculation
    = (Treasury Value) / (Token Supply)
```

Every holder can query:
- **Total fees collected** (onchain)
- **Current holdings** (onchain)
- **NAV per token** (updated continuously)
- **Allocation history** (event logs)

**No promises.** No guarantees. Fully transparent.

---

## 📖 Documentation Map

| Topic | File | Purpose |
|-------|------|---------|
| What is WORLD? | [README.md](README.md) | Pitch, features, disclaimer |
| How does it work? | [docs/overview.md](docs/overview.md) | Architecture, components, flow |
| Treasury mechanics | [docs/treasury-model.md](docs/treasury-model.md) | Fees, allocations, accounting |
| Asset allocation | [docs/allocation-strategy.md](docs/allocation-strategy.md) | Weights, rebalancing, execution |
| NAV formula | [docs/nav-methodology.md](docs/nav-methodology.md) | Calculation, oracles, validation |
| Which assets? | [docs/rwa-and-proxy-assets.md](docs/rwa-and-proxy-assets.md) | Specific tokens, prices, custody |
| What could go wrong? | [docs/risks.md](docs/risks.md) | Risks, mitigations, scenarios |
| Common questions | [docs/faq.md](docs/faq.md) | ~50 Q&A |
| How to deploy? | [scripts/deploy.md](scripts/deploy.md) | Step-by-step guide |
| How to monitor? | [scripts/monitor.md](scripts/monitor.md) | Health checks, alerts, runbook |
| Code structure | [REPOSITORY_STRUCTURE.md](REPOSITORY_STRUCTURE.md) | File-by-file breakdown |
| How to contribute? | [CONTRIBUTING.md](CONTRIBUTING.md) | Development setup, PR process |
| Community rules | [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) | Expectations, reporting |
| Report vulns | [SECURITY.md](SECURITY.md) | Responsible disclosure |

---

## 🏗️ Architecture

### Smart Contract (Solana/Anchor)
- **Treasury Account**: Immutable record of fees & allocations
- **Fee Collector**: Intercepts transaction fees
- **Config Account**: Allocation weights, thresholds, parameters
- **Event Logs**: `FeesReceived`, `AllocationExecuted`, `NAVUpdated`

### Keeper Bot (Automation)
1. **Monitor**: Poll treasury state every 30 seconds
2. **Allocate**: Trigger on time interval (2 weeks) or threshold ($50k)
3. **Execute**: Get DEX quotes, validate slippage, execute trades
4. **Update NAV**: Fetch oracle prices, calculate per-token value
5. **Report**: Log events, send alerts, update dashboard

### Dashboard (UI)
- **Live metrics**: Treasury balance, NAV, allocation weights
- **Charts**: Pie chart (allocation), line chart (NAV history)
- **History**: Recent allocations, fees collected
- **Refresh**: Every 10 seconds

---

## 💡 Key Features

✅ **Transparent** — All operations logged onchain
✅ **Automated** — Keeper bot executes on schedule
✅ **Diversified** — 4 asset classes, uncorrelated
✅ **Safe** — Circuit breakers (slippage, cooldown, pause)
✅ **Testable** — DRY_RUN mode for simulation
✅ **Configurable** — Weights, thresholds, assets (admin or governance)

---

## ⚠️ Critical Disclaimers

🔴 **NOT investment advice.** WORLD is experimental.
🔴 **NOT a security.** Legal status varies by jurisdiction.
🔴 **NOT guaranteed returns.** Treasury value can decline.
🔴 **NOT audited.** Do not deploy real funds without professional review.
🔴 **NOT affiliated** with Phantom, MetaMask, or any wallet/exchange.

See [docs/risks.md](docs/risks.md) for comprehensive risk analysis.

---

## 🔄 Development Workflow

### Adding a Feature
1. Branch off `main`
2. Implement + add tests
3. Run locally: `pnpm dev` (keeper & dashboard)
4. Open PR with description
5. Wait for review + CI
6. Merge to`main`

See [CONTRIBUTING.md](CONTRIBUTING.md) for details.

### Reporting a Bug
1. Check [existing issues](https://github.com/softwaredevelopoor/WORLD-Strategy/issues)
2. Security bug? Email security@worldstrategy.dev
3. Other bug? Open issue with steps to reproduce

See [SECURITY.md](SECURITY.md) for responsible disclosure.

---

## 🚀 Deployment Flow

1. **Testnet** (devnet)
   - Deploy contracts
   - Run keeper in DRY_RUN mode
   - Test dashboard
   - Verify logic

2. **Audit** (professional review)
   - Code review
   - Security testing
   - Formal verification (optional)

3. **Mainnet** (gradual rollout)
   - Deploy with small caps
   - Monitor for 1+ week
   - Increase caps as confidence grows
   - Enable governance (future)

See [scripts/deploy.md](scripts/deploy.md) for step-by-step guide.

---

## 📊 What Gets Logged

Every transaction is immutable onchain:

```rust
// Fee received
emit!(FeesReceived {
    amount: 2000,           // 20 WORLD tokens
    timestamp: 1707600000,
    tx_hash: "...",
});

// Allocation executed
emit!(AllocationExecuted {
    timestamp: 1707600000,
    allocations: [
        { asset: "SPX", amount_deployed_usdc: 40000, ... },
        { asset: "EEM", amount_deployed_usdc: 20000, ... },
        { asset: "GLD", amount_deployed_usdc: 15000, ... },
        { asset: "RWA", amount_deployed_usdc: 25000, ... },
    ],
    total_allocated: 100000,
});

// NAV updated
emit!(NAVUpdated {
    nav_per_token: 1.25,
    total_treasury_usd: 1000000,
    circulating_supply: 800000,
    timestamp: 1707600000,
});
```

Anyone can query these events via RPC or indexer (e.g., Magic Eden, Solscan).

---

## 🎓 Learning Path

**New to the project?** Start here:

1. Read [README.md](README.md) (5 min)
2. Skim [docs/overview.md](docs/overview.md) (10 min)
3. Review [docs/treasury-model.md](docs/treasury-model.md) (15 min)
4. Run local simulation: `cd keeper && DRY_RUN=true pnpm dev` (5 min)
5. Read [docs/risks.md](docs/risks.md) thoroughly (20 min)
6. Check [docs/faq.md](docs/faq.md) for questions (10 min)

**Total**: ~65 min to full understanding.

---

## 🤝 Contributing

We welcome contributions:
- **Code**: Bug fixes, features, optimizations
- **Docs**: Clarifications, examples, translations
- **Design**: UI improvements, charts, components
- **Community**: Discussions, education, testing

See [CONTRIBUTING.md](CONTRIBUTING.md).

---

## 📞 Support

- **Discord**: [TODO: link]
- **Twitter**: [@WorldStrategy](https://twitter.com) [TODO]
- **GitHub Issues**: [Report bugs](https://github.com/softwaredevelopoor/WORLD-Strategy/issues)
- **Security**: security@worldstrategy.dev

---

## 📜 License

MIT License. See [LICENSE](LICENSE) for full text.

You can:
✅ Use, copy, modify, distribute
✅ Use in commercial projects
✅ Private use

You must:
✅ Include license & copyright notice
❌ Hold liable (AS-IS, no warranty)

---

## 🎉 Thank You

WORLD Strategy is built by the community, for the community.

Thanks to:
- Solana Foundation (infrastructure)
- Anchor (smart contract framework)
- Jupiter (DEX aggregation)
- Pyth (oracle network)
- Contributors (you!)

---

## Next Steps

- [ ] Read README & disclaimers
- [ ] Explore `/docs` folder
- [ ] Run `pnpm install && cd keeper && DRY_RUN=true pnpm dev`
- [ ] Visit dashboard at `http://localhost:3000`
- [ ] Check out [scripts/deploy.md](scripts/deploy.md) to deploy
- [ ] Join community Discord
- [ ] Star the repo 🌟

---

**"The world is a memecoin. Let's build it transparently."**

Built Feb 2026 | Status: Pre-alpha | Use at your own risk

---

## Quick Reference

| Component | Location | Language | Status |
|-----------|----------|----------|--------|
| Smart Contract | `/program/src/lib.rs` | Rust + Anchor | ✅ Complete |
| Keeper Bot | `/keeper/src/` | TypeScript | ✅ Complete |
| Dashboard | `/dashboard/src/` | React + Next.js | ✅ Complete |
| Docs | `/docs/` | Markdown | ✅ Complete |
| Scripts | `/scripts/` | Markdown + JSON | ✅ Complete |
| Tests | TBD | TypeScript + Rust | ⏳ TODO |
| CI/CD | `.github/workflows/` | YAML | ⏳ TODO |
| Governance | TBD | DAO | ⏳ Phase 2 |
| Audit | TBD | Professional | ⏳ Pre-audit |

---

*Start building. Start contributing. Start the conversation.*

Questions? See [docs/faq.md](docs/faq.md) or open an issue.
