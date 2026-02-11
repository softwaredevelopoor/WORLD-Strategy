# Smart Contract Audit Checklist

This document outlines security considerations and audit requirements for the WORLD Strategy smart contract.

## Pre-Deployment Checklist

- [ ] **Code Review**
  - [ ] All functions reviewed by 2+ external developers
  - [ ] No hardcoded addresses or private keys
  - [ ] No `unsafe` code blocks
  - [ ] No debug assertions

- [ ] **Integer Overflow/Underflow**
  - [ ] All arithmetic uses checked operations
  - [ ] No unchecked math on user inputs
  - [ ] Test with extreme values (u64::MAX, u64::MIN)

- [ ] **Reentrancy Protection**
  - [ ] State updates happen before external calls
  - [ ] No callbacks to untrusted contracts
  - [ ] ReentrancyGuard applied (if needed)

- [ ] **Authorization Checks**
  - [ ] Admin operations require signer check
  - [ ] Fees go to intended recipient
  - [ ] No privilege escalation paths

- [ ] **Event Logging**
  - [ ] All critical operations emit events
  - [ ] Events include sufficient context
  - [ ] Off-chain indexers can parse events

## Functional Requirements

- [ ] Treasury account stores correct state
- [ ] Fee collection increments total_fees_collected
- [ ] Allocation execution updates total_deployed
- [ ] NAV calculation is correct
- [ ] Pause/unpause prevents allocations
- [ ] Admin changes persist correctly

## Test Coverage

- [ ] Unit tests for all functions (>80% coverage)
- [ ] Integration tests for fee → allocation → NAV flow
- [ ] Edge cases (empty treasury, large amounts, u64 limits)
- [ ] Malicious input handling

## Security Testing

- [ ] Flash loan attack scenario
- [ ] Sandwich attack awareness
- [ ] Double-spending attempts
- [ ] Signature verification requirements
- [ ] Rate limiting on critical operations

## Formal Verification

- [ ] Critical math functions formally verified (future)
- [ ] State transitions documented
- [ ] Invariants defined and tested

## Deployment Security

- [ ] Upgrade path planned (Anchor upgradeable program vs immutable)
- [ ] Emergency pause accessible to key holders
- [ ] Multi-sig on admin operations (recommended)
- [ ] Timelock on critical changes (recommended)

## Known Limitations

1. **No cross-program calls**: Treasury does not call external programs
   - Reduces attack surface
   - Keeps logic simple
   - Trades off composability

2. **Static asset list**: Assets configured at deploy time
   - Cannot add new assets without upgrade
   - Simplifies validation
   - Requires planned governance for additions

3. **No yield farming**: Treasury does not participate in DeFi yield
   - Less exposure to DeFi smart contract risk
   - Missed opportunities for returns
   - Simpler accounting

4. **Manual fee withdrawal**: Developer team must manually move fees
   - Not automatic (requires keeper bot + human)
   - Less efficient
   - More control, fewer authorizations needed

## Audit History

| Date | Auditor | Status | Report |
|------|---------|--------|--------|
| TBD | TBD | Pending | TBD |

---

*Last updated: Feb 2026*
