# Deployment Guide

This document explains how to deploy WORLD Strategy to Solana.

## Prerequisites

- Node 18+
- Solana CLI configured with a keypair
- Anchor framework installed
- Sufficient SOL for deployment (~1 SOL recommended)

```bash
# Install Solana CLI
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"

# Install Anchor
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install latest
avm use latest

# Configure Solana
solana config set --url https://api.devnet.solana.com
solana airdrop 10  # On devnet only
```

---

## Step 1: Deploy Smart Contracts

```bash
# From project root
cd program

# Build
anchor build

# Deploy to devnet
anchor deploy --provider.cluster devnet

# Save the program ID from deployment output
# Example: Program deployed to PROGRAM_ID_HERE
```

After deployment:
1. Update `NEXT_PUBLIC_PROGRAM_ID` in `.env.example`
2. Create treasury account PDA (detailed below)

---

## Step 2: Initialize Treasury Account

Create the treasury account that holds treasury data:

```bash
cd program

# Create account instruction
anchor run init-treasury --provider.cluster devnet

# This will:
# 1. Create a Program Derived Address (PDA)
# 2. Initialize treasury struct
# 3. Set admin to your keypair
# 4. Print treasury address
```

Save the treasury account address:
```
NEXT_PUBLIC_TREASURY_ACCOUNT=<address_from_output>
```

---

## Step 3: Create WORLD Token

If deploying your own token (not using existing):

```bash
# Create token mint
spl-token create-token

# Create associated token account
spl-token create-account <MINT_ADDRESS>

# Mint initial supply (e.g., 1M tokens)
spl-token mint <MINT_ADDRESS> 1000000 --owner <YOUR_KEYPAIR>

# Set fee account
# (Requires custom token program or token extensions)
```

Or use an existing token on devnet.

Save the mint address:
```
NEXT_PUBLIC_TREASURY_MINT=<mint_address>
```

---

## Step 4: Configure Keeper Bot

```bash
cd keeper

# Copy config template
cp ../scripts/config.example.json src/config/default.json

# Edit config
# - Update asset mints (SPX, EEM, GLD, RWA)
# - Set allocation weights
# - Configure oracle endpoints
```

Add environment variables:

```bash
# Copy template
cp ../.env.example .env.local

# Edit .env.local
NEXT_PUBLIC_PROGRAM_ID=<from_step_1>
NEXT_PUBLIC_TREASURY_ACCOUNT=<from_step_2>
NEXT_PUBLIC_TREASURY_MINT=<from_step_3>
RPC_ENDPOINT=https://api.devnet.solana.com
DRY_RUN=true  # Start in simulation mode
LOG_LEVEL=info
KEEPER_CHECK_INTERVAL_MS=30000
```

---

## Step 5: Test Keeper Bot

```bash
cd keeper

# Install dependencies
pnpm install

# Run in dry-run mode (no real transactions)
export DRY_RUN=true
pnpm dev

# You should see:
# - Treasury state queries
# - Allocation calculations
# - NAV updates
# - Allocation execution (simulated)
```

Example output:
```
[INFO] === WORLD Strategy Keeper Bot ===
[INFO] Environment: DRY_RUN (simulation)
[INFO] Network: devnet
[INFO] Initializing keeper bot...
[INFO] ✓ Keeper initialized
[INFO] Starting keeper loop (interval: 30000ms)
[DEBUG] --- Keeper Cycle ---
[DEBUG] Treasury state: fees=25000, deployed=100000
[DEBUG] Threshold: 25000 >= 50000 ? false
[DEBUG] No allocation triggered this cycle
```

---

## Step 6: Deploy Dashboard

```bash
cd dashboard

# Install dependencies
pnpm install

# Update environment
cp ../.env.example .env.local
# Edit .env.local with RPC and program addresses

# Run development server
pnpm dev

# Visit http://localhost:3000
# You should see:
# - Treasury value
# - NAV per token (from mock data)
# - Allocation chart
# - Fee history
```

---

## Step 7: Move to Live Mode

Once tested on devnet:

1. **Create Mainnet Keypair**
   ```bash
   solana-keygen new --outfile ~/.config/solana/mainnet.json
   solana config set --keypair ~/.config/solana/mainnet.json
   solana config set --url https://api.mainnet-beta.solana.com
   ```

2. **Fund Keypair** (~2 SOL for deployment + gas)
   ```bash
   # Transfer SOL from exchange or another wallet
   ```

3. **Deploy Contracts**
   ```bash
   cd program
   anchor deploy --provider.cluster mainnet-beta
   ```

4. **Initialize on Mainnet**
   ```bash
   cd program
   anchor run init-treasury --provider.cluster mainnet-beta
   ```

5. **Configure Keeper for Mainnet**
   ```bash
   cd keeper
   
   # .env.local
   NEXT_PUBLIC_NETWORK=mainnet
   RPC_ENDPOINT=https://api.mainnet-beta.solana.com
   DRY_RUN=false  # Enable live mode!
   LOG_LEVEL=info
   KEEPER_KEYPAIR=~/.config/solana/mainnet.json
   ```

6. **Start Keeper Bot**
   ```bash
   pnpm dev
   ```

7. **Monitor Closely**
   - Watch for first allocation cycle
   - Verify fees are collected
   - Check NAV updates
   - Monitor Treasury Scanner (Solscan)

---

## Deployment Checklist

- [ ] Smart contracts compiled without errors
- [ ] Contracts deployed to devnet
- [ ] Treasury account created
- [ ] Token mint created/configured
- [ ] Fee mechanism verified
- [ ] Keeper bot runs in dry-run mode
- [ ] Keeper successfully simulates allocations
- [ ] Dashboard displays mock data correctly
- [ ] All environment variables set
- [ ] Code audited (if mainnet)
- [ ] Legal review completed
- [ ] Insurance/coverage obtained
- [ ] Monitoring + alerting configured
- [ ] Runbook/incident procedures documented

---

## Troubleshooting

### "Account not found"
- Treasury PDA may not be initialized
- Check account address
- Re-run initialization instruction

### "Invalid program ID"
- Ensure NEXT_PUBLIC_PROGRAM_ID matches deployed address
- Check network (devnet vs mainnet)

### "Insufficient funds"
- Fund signer keypair with SOL
- `solana airdrop 10` (devnet only)

### "No price feed available"
- Ensure oracle infrastructure configured
- Check Pyth network connectivity (mainnet)
- Use mock oracles (devnet)

### Keeper not executing allocations
- Check threshold: fees must be > $50k
- Verify cooldown: must wait 1 day between allocations
- Check slippage: if > 0.5%, allocations skip
- Enable DRY_RUN to debug

---

## Post-Deployment

After successful deployment:

1. **Configure Monitoring**
   - Set up Sentry or similar for errors
   - Configure alerts for critical events
   - Monitor keeper bot health

2. **Set Up Governance** (Optional)
   - Deploy governance token
   - Set up Snapshot voting
   - Plan migration to DAO

3. **Community Outreach**
   - Announce launch
   - Host AMA
   - Gather feedback

4. **Continuous Monitoring**
   - Track NAV changes
   - Monitor asset prices
   - Check allocation efficiency
   - Community feedback

---

See [monitor.md](./monitor.md) for ongoing monitoring instructions.

*Last updated: Feb 2026*
