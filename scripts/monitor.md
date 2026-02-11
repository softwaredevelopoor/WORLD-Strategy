# Keeper Bot Monitoring Guide

This document explains how to monitor and maintain the WORLD Strategy keeper bot.

## Health Checks

### 1. Keeper Bot Process

Check if bot is running:

```bash
# Check running processes
ps aux | grep "keeper\|nodejs\|npm"

# If not running, restart
cd keeper
export DRY_RUN=false
nohup pnpm dev > keeper.log 2>&1 &
```

### 2. Log Monitoring

```bash
# View real-time logs
tail -f keeper.log

# Look for patterns
grep "✓" keeper.log        # Successful operations
grep "⚠" keeper.log        # Warnings
grep "ERROR" keeper.log    # Errors
```

Expected healthy log pattern:
```
[INFO] Starting keeper loop (interval: 30000ms)
[DEBUG] --- Keeper Cycle ---
[DEBUG] Treasury state: fees=..., deployed=...
[DEBUG] Threshold: ... >= ... ? true/false
[DEBUG] Interval: ... >= ... ? true/false
[INFO] No allocation triggered this cycle
(repeat every 30 seconds)
```

### 3. Treasury Balance Monitoring

Check if fees are accumulating (every 6 hours):

```bash
# Query treasury state
solana account <TREASURY_ADDRESS> --url mainnet-beta

# Should show increasing SOL balance (fees converted to SOL)
```

Expected growth:
- DeFi trading: ~100-500 WORLD tokens/day (2-10 USDC equivalent)
- Memecoin volumes vary widely
- Check dashboard for accumulated fees

### 4. NAV Verification (Daily)

```bash
# Visit dashboard
# Compare NAV to calculated value
# Should match within 0.5% (rounding + oracle lag)

# Manual calculation:
# NAV = (SPX_value + EEM_value + GLD_value + RWA_value) / supply
```

### 5. Allocation Cycle Monitoring

Allocations happen **every 2 weeks** or at **$50k threshold**.

```bash
# Check last allocation event
solana logs <PROGRAM_ID> --url mainnet-beta | grep "AllocationExecuted"

# Should see event with:
# - Timestamp
# - Assets & amounts allocated
# - New NAV

# Example event:
# Program data: {"timestamp": 1707600000, "allocations": [...], "total_allocated": 50000000000}
```

## Alerts & Monitoring

### Critical Alerts (Immediate Action Required)

1. **Keeper Bot Crashed**
   - Bot stops logging for > 5 minutes
   - Action: SSH to server, check logs, restart

2. **Oracle Failure**
   - Price feeds unavailable or stale (> 60s old)
   - Action: Check Pyth status, switch to fallback oracle

3. **Slippage Exceeded**
   - Allocation skipped due to > 0.5% slippage
   - Action: Monitor liquidity, may indicate market stress

4. **Arithmetic Errors**
   - Overflow/underflow in treasury calculations
   - Action: Pause bot, investigate, deploy fix

5. **Network Outage**
   - RPC endpoint unavailable
   - Action: Switch RPC endpoint, update config

### Warning Alerts (Monitor)

1. **Low SOL Balance**
   - Keeper wallet drops below 0.5 SOL
   - Action: Fund wallet with 1-2 SOL

2. **High Slippage Consistently**
   - Slippage > 0.3% on allocations
   - Action: Check market conditions, adjust threshold if needed

3. **Allocation Threshold Not Met**
   - No allocations for > 3 weeks
   - Action: Check fees, verify token is trading

4. **Unusual Price Movements**
   - Asset price changes > 20% in 1 hour
   - Action: Verify oracle, check broader markets

### Informational Alerts

1. **Successful Allocation**
   - Logged for record-keeping
   - Action: None required

2. **New Block**
   - Bot polled treasury state
   - Action: None required

## Slack Integration (Optional)

Send alerts to Slack for monitoring:

```bash
# Install optional dependency
cd keeper
pnpm add slack-sdk

# Configure .env.local
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
ALERT_ON_EXECUTION=true
```

Example Slack messages:

```
✓ Allocation Executed
Treasury deployed $50k across SPX, EEM, GLD, RWA
NAV: $1.25 per token (+2.5%)
Timestamp: 2026-02-11 14:30:00 UTC

⚠ Slippage Warning
SPX slippage: 0.45% bps (near limit 50bps)
Monitor liquidity
```

## Weekly Checklist

- [ ] Keeper bot running (`ps aux | grep keeper`)
- [ ] No critical errors in logs
- [ ] Treasury balance growing (fees accumulating)
- [ ] NAV updating regularly (last update < 10 blocks)
- [ ] RPC endpoint healthy (low latency)
- [ ] Keeper wallet SOL balance > 0.5
- [ ] No unusual price movements
- [ ] Dashboard loading without errors

## Monthly Checklist

- [ ] Review allocation history
- [ ] Check NAV trend (should track asset markets)
- [ ] Verify slippage on recent allocations
- [ ] Audit treasury holdings vs. expected
- [ ] Check if any assets need rebalancing
- [ ] Review community feedback
- [ ] Update documentation if needed
- [ ] Plan next governance vote (if applicable)

## Incident Response

### Keeper Bot Crash

1. **Immediate**: SSH to server
2. **Diagnose**: `tail -f keeper.log` (last 100 lines)
3. **Fix**:
   - If RPC issue: Update RPC endpoint, restart
   - If gas issue: Fund wallet, restart
   - If code issue: Hotpatch, restart
4. **Document**: Add entry to incident log
5. **Monitor**: Watch closely for next 24 hours

### Oracle Failure

1. **Immediate**: Pause bot (`killall node`)
2. **Diagnose**: Check Pyth network status
3. **Fallback**: Switch to DEX oracle, update config
4. **Resume**: Restart bot with new oracle
5. **Notify**: Inform community of temporary downtime

### High Slippage

1. **Monitor**: Is it transient or sustained?
2. **Investigate**: Check DEX pools, market conditions
3. **Options**:
   - Temporarily increase slippage limit (0.75%)?
   - Skip allocation cycle?
   - Reduce allocation size?
4. **Document**: Note reason for any changes

## Performance Metrics

Track these over time:

```bash
# Create metrics file
mkdir -p metrics/
cat > metrics/template.csv << EOF
date,nav_per_token,total_treasury_usd,allocation_count,avg_slippage_bps,rpc_latency_ms
EOF

# Populate daily (via keeper bot API)
date,1.25,1000000,42,32,145
```

Tools:
- Grafana (visualization)
- Prometheus (metrics collection)
- ELK Stack (log management)

## Escalation

If issues persist:

1. **Tier 1**: Check logs, restart bot
2. **Tier 2**: Pause allocations, pause treasury
3. **Tier 3**: Emergency deployment fix
4. **Tier 4**: Multi-sig pause (if governance enabled)

---

## Runbook Summary

| Alert | Response | Time |
|-------|----------|------|
| Keeper crashed | Restart process | 5 min |
| Oracle failure | Switch oracle | 10 min |
| Slippage exceeded | Increase limit or skip | 1 min |
| Low SOL balance | Fund wallet | 10 min |
| RPC down | Switch RPC | 5 min |
| High errors | Investigate, fix, deploy | 30 min |

---

See [deploy.md](./deploy.md) for deployment instructions.

*Last updated: Feb 2026*
