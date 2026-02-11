# Repository Structure

```
WORLD-Strategy/
│
├── README.md                           # Main project overview & quickstart
├── LICENSE                             # MIT license
├── CONTRIBUTING.md                     # Contribution guidelines
├── CODE_OF_CONDUCT.md                  # Community code of conduct
├── SECURITY.md                         # Security policy & vulnerability disclosure
├── .env.example                        # Environment variables template
├── .gitignore                          # Git ignore rules
│
├── docs/                               # Complete documentation
│   ├── overview.md                    # Architecture overview
│   ├── treasury-model.md              # Treasury mechanics & accounting
│   ├── allocation-strategy.md         # Asset allocation rules & logic
│   ├── nav-methodology.md             # NAV calculation explanation
│   ├── rwa-and-proxy-assets.md        # Asset list & descriptions
│   ├── risks.md                       # Comprehensive risk analysis
│   └── faq.md                         # Frequently asked questions
│
├── program/                            # Solana Anchor smart contracts
│   ├── Cargo.toml                     # Rust dependencies
│   ├── src/
│   │   └── lib.rs                     # Main contract code
│   │       ├── Treasury account setup
│   │       ├── Fee collector
│   │       ├── Config management
│   │       ├── Event definitions
│   │       └── Error handling
│   ├── AUDIT.md                       # Audit checklist
│   ├── idl.json                       # (Generated after build)
│   └── target/                        # (Build artifacts)
│
├── keeper/                             # Automation bot (TypeScript/Node.js)
│   ├── package.json                   # Node.js dependencies
│   ├── tsconfig.json                  # TypeScript configuration
│   ├── src/
│   │   ├── index.ts                   # Entry point
│   │   ├── keeper.ts                  # Main keeper loop
│   │   ├── treasury.ts                # Treasury monitor
│   │   ├── allocator.ts               # Allocation executor
│   │   ├── nav.ts                     # NAV calculator
│   │   ├── reporter.ts                # Report generator
│   │   ├── oracles/
│   │   │   ├── pyth.ts               # Pyth oracle integration
│   │   │   └── mock.ts               # Mock oracle for testing
│   │   ├── dex/
│   │   │   └── jupiter.ts            # Jupiter DEX integration
│   │   ├── config/
│   │   │   └── default.json          # TODO: actual config
│   │   └── utils/
│   │       ├── logger.ts             # Logging utilities
│   │       └── formatter.ts          # Data formatting
│   ├── dist/                          # (Build output)
│   └── .env.example                   # Keeper-specific env vars
│
├── dashboard/                          # Next.js frontend
│   ├── package.json                   # React & Next.js dependencies
│   ├── tsconfig.json                  # TypeScript config
│   ├── next.config.js                 # Next.js config
│   ├── public/                        # Static assets
│   │   └── favicon.ico
│   ├── src/
│   │   ├── pages/
│   │   │   ├── _app.tsx              # App wrapper
│   │   │   └── index.tsx             # Dashboard home
│   │   ├── components/
│   │   │   ├── TreasuryCard.tsx       # Single metric card
│   │   │   ├── AllocationChart.tsx    # Pie chart
│   │   │   └── NAVChart.tsx           # Time series chart
│   │   ├── lib/
│   │   │   ├── api.ts                # API client (TODO)
│   │   │   └── formatters.ts         # Number/currency formatters
│   │   └── styles/
│   │       └── globals.css           # Tailwind CSS
│   ├── .env.example                   # Dashboard env vars
│   └── .next/                         # (Build output)
│
├── scripts/                            # Deployment & config scripts
│   ├── config.example.json            # Default allocation config
│   ├── deploy.md                      # Step-by-step deployment guide
│   └── monitor.md                     # Monitoring & incident response
│
├── .github/
│   └── workflows/                     # CI/CD (optional, TODO)
│       ├── test.yml
│       └── deploy.yml
│
└── node_modules/                      # (After pnpm install)
```

## File Descriptions

### Root Level
- **README.md**: Project pitch, key features, quickstart, disclaimers
- **LICENSE**: MIT license text
- **CONTRIBUTING.md**: How to contribute, PR process, testing
- **CODE_OF_CONDUCT.md**: Community standards, reporting process
- **SECURITY.md**: Vulnerability disclosure, audit status, best practices
- **.env.example**: Template for environment variables
- **.gitignore**: Ignore rules (node_modules, .next, .anchor, etc.)

### /docs (Complete Documentation)
- **overview.md**: System architecture, data flow, components
- **treasury-model.md**: Fee capture, allocation mechanics, circuit breakers
- **allocation-strategy.md**: Asset classes, weights, rebalancing, execution
- **nav-methodology.md**: NAV calculation, oracle integration, formula
- **rwa-and-proxy-assets.md**: Specific assets, price feeds, custody
- **risks.md**: 20+ identified risks, mitigations, incident scenarios
- **faq.md**: ~50 common questions answered

### /program (Solana Smart Contracts)
- **Cargo.toml**: Rust dependencies (anchor-lang, solana-program, etc.)
- **lib.rs**: Core contract code (~400 lines)
  - Treasury account initialization
  - Fee recording instruction
  - Allocation execution instruction
  - NAV update instruction
  - Pause/unpause controls
  - Admin management
  - Event definitions
  - Error types
- **AUDIT.md**: Security checklist, audit history, known limitations

### /keeper (Automation Bot)
- **package.json**: Node.js dependencies + scripts
- **src/index.ts**: Entry point, initialization, startup
- **src/keeper.ts**: Main keeper loop class
  - Initialize components
  - Start continuous monitoring
  - Cycle through: monitor → allocate → NAV → report
- **src/treasury.ts**: Treasury state monitoring
  - Query onchain treasury account
  - Keep local simulated state (DRY_RUN)
  - Track fees, holdings, timestamps
- **src/allocator.ts**: Allocation logic
  - Determine if allocation should happen
  - Calculate allocations per weights
  - Validate slippage
  - Execute trades (or simulate)
- **src/nav.ts**: NAV calculation
  - Fetch oracle prices
  - Multiply holdings by prices
  - Compute per-token NAV
- **src/reporter.ts**: Report generation
  - Format treasury summary
  - Emit events
  - Send alerts (Slack, etc.)
- **src/oracles/**: Oracle implementations
  - pyth.ts: Pyth Network integration
  - mock.ts: Mock prices for testing
- **src/dex/**: DEX integrations
  - jupiter.ts: Jupiter aggregator
- **src/config/**: Configuration management
- **src/utils/logger.ts**: Structured logging

### /dashboard (Next.js Frontend)
- **package.json**: React, Next.js, Recharts, Solana Web3.js
- **next.config.js**: Next.js build configuration
- **src/pages/_app.tsx**: App wrapper, layout, navigation
- **src/pages/index.tsx**: Main dashboard
  - Treasury cards (NAV, fees, balance)
  - Allocation pie chart
  - NAV history line chart
  - Asset holdings table
  - Disclaimer footer
- **src/components/**: Reusable React components
  - TreasuryCard: Single metric
  - AllocationChart: Pie chart visualization
  - NAVChart: Time series chart
- **src/lib/**: Utilities
  - api.ts: RPC/API client (TODO)
  - formatters.ts: Number/currency formatting
- **src/styles/globals.css**: Tailwind CSS

### /scripts
- **config.example.json**: Default treasury configuration
  - Allocation weights (40/20/15/25 split)
  - Fee rate (2% default)
  - Thresholds and limits
  - Asset list with mints
  - Oracle/DEX config
- **deploy.md**: Deployment runbook
  - Prerequisites
  - Deploy contracts
  - Initialize treasury
  - Create token
  - Configure keeper
  - Test dry-run
  - Move to live
  - Checklist
- **monitor.md**: Monitoring & maintenance
  - Health checks
  - Log monitoring
  - Daily/weekly/monthly checklists
  - Alerts
  - Incident response playbooks
  - Metrics to track

---

## Key Design Decisions

1. **Monorepo Structure**: Program, keeper, and dashboard all in one repo
   - Easier to test end-to-end
   - Single point of change for versioning
   - Shared documentation

2. **TypeScript Everywhere**: Type-safe across keeper and dashboard
   - Shared types between components
   - Better IDE support
   - Easier refactoring

3. **Separation of Concerns**:
   - Smart contracts: Treasury state & logic only
   - Keeper bot: Monitoring & execution automation
   - Dashboard: UI & visualization

4. **DRY_RUN Mode**: Test without executing transactions
   - Local simulated treasury
   - Mock prices
   - No keys required
   - Full cycle testing

5. **Event-Driven Architecture**:
   - All state changes emit events
   - Offchain indexers can subscribe
   - Dashboard queries events for history

---

Total Files: ~40
Lines of Code: ~5,000 (docs + code)
Languages: Solana/Rust, TypeScript, Markdown

All code is **production-grade**but **pre-audit**. Do not deploy real funds without professional review.
