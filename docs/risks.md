# Risks & Limitations

This document provides a comprehensive overview of risks associated with WORLD Strategy.

---

## ⚠️ Critical Risks

### 1. Smart Contract Bugs (CRITICAL)

**Risk**: Unaudited code may contain exploitable vulnerabilities.

**Potential Impact**:
- Complete loss of treasury funds via reentrancy attack
- Unauthorized withdrawals via privilege escalation
- Arithmetic overflow/underflow leading to incorrect balances
- State corruption preventing fee collection or allocation

**Mitigation**:
- Professional smart contract audit by reputable firm (e.g., CertiK, Trail of Bits)
- Code review by multiple independent developers
- Gradual rollout (start with small caps, scale over time)
- Emergency pause functionality
- Formal verification of critical math functions

**Timeline**:
- **Do NOT deploy to mainnet without audit.**
- Audit should be complete before any real funds.

---

### 2. Smart Contract Logic Errors

**Risk**: Code may be mathematically or logically incorrect without containing exploitable bugs.

**Examples**:
- NAV calculation uses wrong formula or inputs
- Allocation weights don't sum to 100%
- Slippage calculation is incorrect
- Cooldown period enforced incorrectly

**Potential Impact**: Inaccurate treasury tracking, incorrect price reporting, inefficient allocations.

**Mitigation**:
- Extensive unit tests for all math functions
- Integration tests with realistic data
- Dry-run mode for testing before live execution
- Dashboard verification (visual sanity checks)
- Community code review

---

### 3. Oracle Price Feed Failures (HIGH)

**Risk**: Oracle prices may be incorrect, stale, or unavailable.

**Potential Impact**:
- Incorrect NAV calculation (treasury value misstated)
- Slippage protection fails (execute trades at bad prices)
- Cannot execute allocation (no price feed)
- Cascade failure if primary oracle down

**Examples**:
- Pyth network experiences downtime
- Price feeds manipulated via flash loans (less likely with Pyth's design, but possible)
- Bridge oracle (Wormhole) provides stale prices
- DEX spot price significantly different from true market price

**Mitigation**:
- Use **Pyth Network** (high-quality, tamper-resistant) for mainnet
- Implement **fallback oracles** (DEX spot, alternative price service)
- **Price staleness checks** (reject if > 1 minute old)
- **Confidence interval validation** (reject if confidence > 10% of price)
- **Circuit breaker** (pause allocations if price feeds unavailable)
- Manual verification of NAV calculations

**Remedy if Failure Occurs**:
1. Pause treasury operations
2. Wait for oracle to recover
3. Manually verify prices from independent sources
4. Resume once confident in data integrity

---

### 4. Market Risk / Asset Depreciation (HIGH)

**Risk**: Underlying assets may decline in value.

**Potential Impact**:
- SPX crashes (bear market): Treasury value declines 30-50%
- Emerging markets face political instability: EEM declines  
- Gold enters bear market (rising real rates): GLD value declines
- RWA tokens default or become illiquid

**This is NOT a bug; it is expected market behavior.**

**Mitigation**:
- Diversify across uncorrelated assets (already built in)
- Only invest funds you can afford to lose
- Long-term horizon (don't panic sell)
- Rebalancing (future) to lock in gains or reduce losses

**Key Point**: WORLD is exposed to financial markets. **There is no promise or guarantee of returns or price floors.**

---

### 5. Regulatory Risk (HIGH)

**Risk**: Crypto tokens, RWAs, and derivatives face uncertain regulation.

**Potential Impacts**:

#### 5a. Token Regulation
- US SEC may classify WORLD as unregistered security
- Requires registration → kills project or requires major restructuring
- Criminal penalties for operators

#### 5b. RWA Regulation
- RWA tokens may be banned or heavily restricted
- Custody/custody of physical assets may become illegal
- "What is a security?" remains unresolved

#### 5c. Asset Ownership
- Emerging market restrictions on foreign holdings
- Gold export bans or confiscation risk
- Sanctions on entities or jurisdictions

**Mitigation**:
- Consult with legal counsel in relevant jurisdictions
- Start on testnet; do not assume mainnet launch is guaranteed
- Consider geographic distribution of team + users
- Build optionality to pivot to compliant assets

---

## HIGH Risk Issues

### 6. Keeper Bot Downtime

**Risk**: Automation bot crashes or is unavailable.

**Potential Impact**:
- Allocations don't execute on schedule
- Treasury accumulates unallocated fees (opportunity cost)
- NAV not published (user confusion)

**Mitigation**:
- Run keeper on reliable infrastructure (not a laptop)
- Health monitoring + alerting (Sentry, Datadog)
- Log aggregation (ELK, Splunk)
- Redundant instance (geo-diversified) as backup
- Graceful error handling (skip bad allocations, retry)

---

### 7. DEX Liquidity / Slippage (HIGH)

**Risk**: DEX may not have sufficient liquidity for treasury trades.

**Potential Impact**:
- Large allocations incur high slippage
- Slippage check prevents execution (allocation skipped)
- Forced to allocate in smaller tranches, spanning multiple weeks

**Mitigation**:
- Monitor pair liquidity before allocating
- Use Jupiter aggregator (multi-path execution)
- Implement time-weighted allocation (split orders across time)
- Keep per-cycle cap reasonable ($100k is conservative)
- Seasonal monitoring (liquidity varies)

---

### 8. Wormhole Bridge Risk (MEDIUM-HIGH)

**Risk**: Wormhole (if used for bridged assets) could be hacked.

**Potential Impact**:
- Bridge is frozen, assets locked
- Bridge is exploited, wrapped tokens become worthless
- SPX/EEM/GLD prices not accessible

**Mitigation**:
- Diversify sources (not 100% reliant on Wormhole)
- Monitor bridge health + governance
- Consider alternative bridges (Chainlink, Solend portal)
- Implement circuit breaker if bridge fails

---

### 9. Circulating Supply Miscalculation

**Risk**: NAV calculation uses wrong circulating supply.

**Potential Impact**:
- NAV overstated (if supply undercounted)
- NAV understated (if supply overcounted)
- User confusion about true backing per token

**Mitigation**:
- Query supply directly from on-chain mint (Solana)
- Validate supply consistency across multiple RPC providers
- Check for unusual supply changes (flag if > 5% change)
- Community verification of supply

---

## MEDIUM Risk Issues

### 10. Fee Mechanism Not Enforced

**Risk**: Token standard (SPL) may not actually deduct creator fees.

**Potential Impact**:
- Fees not collected
- Treasury has no funds to allocate
- Protocol becomes insolvent

**Mitigation**:
- Test fee deduction thoroughly before launch
- Verify on testnet (send WORLD, confirm fee received)
- Monitor treasury balance (should grow)
- If broken, pause trading until fixed

---

### 11. Reentrancy / Callback Attacks

**Risk**: Smart contracts may lack reentrancy protection.

**Potential Impact**:
- Attacker can withdraw more than due by re-entering contract
- Multiple allocations executed in single call
- Treasury drained

**Mitigation**:
- Use OpenZeppelin `ReentrancyGuard` (Solana equivalent)
- Perform all state updates before external calls (checks-effects-interactions)
- Extensive testing with mock re-entrant contracts

---

### 12. Admin Abuse / Malicious Config Updates

**Risk**: Admin (or compromised admin) updates config to send treasury to attacker.

**Potential Impact**:
- Update allocation weights to 100% worthless asset
- Change admin to attacker address
- Disable pause functionality

**Mitigation** (Current):
- Multi-sig on admin operations (e.g., Gnosis Safe 2/3)
- Timelock on config changes (e.g., 48hr delay)
- Community monitoring (dashboard alerts if weights change oddly)

**Mitigation** (Future):
- Governance token voting on config changes
- Immutable set of allowed assets (can't add attacker token)

---

### 13. Keeper Signer Compromise

**Risk**: Private key for keeper signer is stolen.

**Potential Impact**:
- Attacker can execute allocations at bad prices
- Allocate to attacker-controlled tokens
- Drain treasury

**Mitigation**:
- Use hardware wallet for signer (Ledger, Trezor)
- Cold storage (air-gapped signing)
- Rate limiting (large allocations require multi-sig)
- Monitoring (alert on unusual transactions)

---

### 14. Timeout / Block Limit Exceeded

**Risk**: Solana transaction fails due to compute budget or timeout.

**Potential Impact**:
- Allocation transaction fails mid-execution
- Partial state update (some assets bought, others not)
- Treasury account state corrupted

**Mitigation**:
- Estimate compute cost of allocation instruction
- Split large allocations across multiple transactions
- Implement idempotency (can safely retry without double-spending)
- Test with realistic transaction sizes

---

## MEDIUM Risk Issues (cont.)

### 15. Floating Point Precision

**Risk**: Floating point arithmetic in NAV calculation may lose precision.

**Potential Impact**:
- NAV off by small amounts due to rounding
- Over many cycles, cumulative error grows
- Off-by-one errors in asset allocation

**Mitigation**:
- Use **u64 or i128 fixed-point** math for critical calculations
- Reserve floating point for display only
- Test with extreme values (very small, very large balances)
- Document precision limits

---

### 16. Token Pair Doesn't Exist

**Risk**: Liquidity pair for an asset doesn't exist on DEX.

**Potential Impact**:
- Allocation to asset fails (no swap path)
- Cycle skipped, funds not allocated

**Mitigation**:
- Pre-verify all asset liquidity before launch
- Monitor pair health regularly
- Implement graceful fallback (if one asset unavailable, allocate remainder to others)
- Consider seeding pairs (provide liquidity bootstrap)

---

## LOW Risk Issues

### 17. RPC Endpoint Downtime

**Risk**: RPC provider is unavailable.

**Potential Impact**:
- Keeper bot cannot query state
- Allocations skipped
- Dashboard doesn't update

**Mitigation**:
- Use multiple RPC providers with fallback
- Implement exponential backoff retry logic
- Cache recent state locally (if RPC down for < 1 block)
- Status monitoring + alerting

---

### 18. Solana Network Instability

**Risk**: Solana experiences consensus issues, network partition, or extended downtime.

**Potential Impact**:
- All transactions fail
- Treasury locked
- Keeper unable to operate

**Mitigation**:
- This is systemic risk affecting entire Solana ecosystem
- Diversify to other chains (future)
- Maintain SOL reserve for gas (don't let balance go to zero)
- Monitor network status

---

### 19. Asset Concentration Risk

**Risk**: Treasury becomes concentrated in one asset (e.g., 60% SPX due to price appreciation).

**Potential Impact**:
- Lose diversification benefit
- More volatile NAV
- Higher correlation risk

**Mitigation**:
- Automatic rebalancing (future)
- Dashboard alerts if weight drifts > 5% from target
- Admin override to manually rebalance

---

### 20. Governance Capture (Future Risk)

**Risk**: Once governance token is introduced, large holders or coordinated minority could vote maliciously.

**Potential Impact**:
- Vote to remove assets (break diversification)
- Vote to change distributions (favor some users)
- Vote to rugpull (steal treasury)

**Mitigation**:
- Graduated rollout (start with admin-only, then multi-sig, eventually governance)
- Quorum requirements (need >50% participation)
- Cooldown periods between votes
- Separation of powers (governance can't touch keys)

---

## Limitations (Not Bugs, But Important to Know)

### 1. NAV is Not Real-Time

NAV is calculated every block or on-demand, but:
- Prices are from Pyth (may be 1-2 seconds stale)
- Dashboard may cache for performance
- Actual value changes microsecond-to-microsecond based on market

### 2. No Liquidation Mechanism

WORLD has no emergency liquidation (yet):
- If treasury paused, no way to quickly exit positions
- Manual intervention needed

### 3. No Yield

Assets in portfolio may generate yield (dividends, interest):
- Not currently being captured
- Dividends just sit in holdings

Future: Implement yield farming / lending.

### 4. No Insurance

WORLD is not insured against:
- Smart contract bugs
- Oracle failures
- Bridge hacks
- Regulatory seizure

Use at your own risk.

### 5. Community Governance Not Implemented

Currently:
- Admin makes all decisions
- Single point of failure

Phase 2 will introduce community voting.

---

## Recovery Scenarios

If something goes wrong:

### Scenario 1: Market Crash

Treasury value drops 40% due to bear market.

**Recovery**:
- This is normal market behavior
- Continue allocating (dollar-cost averaging)
- Wait for recovery (may take months/years)
- Hold diversified portfolio to minimize losses

### Scenario 2: Oracle Failure

DEX pools report 0 prices.

**Recovery**:
1. Pause treasury operations
2. Wait for oracle recovery
3. Get independent price verification
4. Resume operations

### Scenario 3: Smart Contract Bug Discovered

Vulnerability allows unauthorized withdrawals.

**Recovery**:
1. Pause treasury immediately
2. Analyze affected operations
3. Deploy patched contract
4. Migrate state if needed
5. Conduct full security audit

### Scenario 4: Keeper Bot Crash

Allocations not executing for several weeks.

**Recovery**:
1. Identify root cause
2. Fix code / deploy new instance
3. Manually trigger allocation (if needed)
4. Resume automation

---

## Testing Strategy

Before any launch, verify:

1. **Unit Tests**: All math functions correct
2. **Integration Tests**: Fee collection → allocation → NAV
3. **Dry-Run Tests**: Full cycle without real funds
4. **Devnet Tests**: Real-world values for N weeks
5. **Code Review**: By 3+ independent auditors
6. **Penetration Testing**: Try to break / exploit
7. **Scenario Tests**: Bear market, flash crash, oracle fail

---

## Disclosure & Incident Response

If you discover a vulnerability:

1. **DO NOT** post publicly
2. Email: [security@worldstrategy.dev](mailto:security@worldstrategy.dev)
3. Include:
   - Description
   - Proof-of-concept
   - Recommended fix
4. We will:
   - Acknowledge within 48 hours
   - Develop fix
   - Coordinate disclosure
   - Credit you (unless requested otherwise)

---

## Summary

WORLD Strategy is **experimental** and carries **substantial risks**:

✓ **Transparent** — all operations onchain  
✗ **Unaudited** — smart contract bugs possible  
✗ **Exposed to markets** — treasury value can decline  
✗ **Regulatory uncertain** — legal status unclear  

**DO NOT deploy with real funds without:**
- Professional audit
- Legal review
- Risk acceptance from all stakeholders
- Graduated launch (start small, scale slowly)

See [SECURITY.md](../SECURITY.md) for responsible disclosure policy.

---

*Last updated: Feb 2026*
