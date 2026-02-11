# Security Policy

## Status

**WORLD Strategy is experimental, pre-audit code.**

This project is NOT production-ready and should NOT be deployed with real funds until:
1. Professional audit complete
2. Security review by institutional partners
3. Graduated rollout with hard caps
4. Risk framework documented

## Reporting Vulnerabilities

If you discover a security vulnerability, **please do not open a public issue**. Instead:

1. Email: [security@worldstrategy.dev](mailto:security@worldstrategy.dev)
2. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)
3. Allow 48 hours for initial response

### What Happens Next

- We acknowledge receipt within 48 hours
- We investigate and assess severity
- We develop a fix
- We notify you before public disclosure
- We credit you (unless requested otherwise)

## Known Risks & Limitations

See [docs/risks.md](docs/risks.md) for detailed risk analysis.

### Critical Risk Areas

1. **Smart Contract Bugs**: Unaudited code; potential for exploits
2. **Oracle Failures**: Price feed manipulation or staleness
3. **DEX Slippage**: Large orders may cause market impact
4. **Regulatory**: Tokens/RWAs may face legal restrictions
5. **Operational**: Keeper bot malfunction or downtime

## Security Best Practices

### For Deployers

- Never deploy with real funds without audit
- Use devnet/testnet first
- Implement gradual rollout
- Monitor treasury closely
- Have pause button accessible
- Keep private keys secure

### For Integrators

- Validate all onchain data
- Use rate limits on API calls
- Implement slippage checks
- Monitor for unusual behavior
- Implement circuit breakers

### For Developers

- Run tests before submitting PR
- Use TypeScript strict mode
- Follow principle of least privilege
- Avoid hardcoding addresses
- Document assumptions clearly

## Audit Checklist

Before any mainnet deployment, verify:

- [ ] Full smart contract audit complete
- [ ] Keeper bot tested against live data (devnet)
- [ ] Oracle integration validated
- [ ] DEX slippage limits verified
- [ ] Cooldown / circuit breaker logic working
- [ ] Treasury tracking accurate
- [ ] NAV calculation correct
- [ ] Event logging comprehensive
- [ ] Admin controls secured
- [ ] Documentation complete

## Dependencies

We rely on:

- **Solana**: Core blockchain
- **Anchor**: Smart contract framework
- **Jupiter**: DEX aggregator
- **Pyth**: Price oracle (mainnet)
- **@solana/web3.js**: Solana client

We monitor these dependencies for security updates. Please report any known vulnerabilities.

## Deployment Runbook

1. **Testing**: 2+ weeks on devnet
2. **Audit**: Professional firm review
3. **Beta**: Deploy with hard cap ($50-100k) on testnet
4. **Monitor**: 1+ month observation; fix any issues
5. **Expand**: Gradually increase caps as confidence increases
6. **Mainnet**: Only with institutional backing

## Incident Response

If a critical issue is discovered:

1. Disable treasury operations (pause flag)
2. Alert all stakeholders
3. Initiate emergency fix
4. Deploy hotfix with care
5. Post-mortem within 7 days

## Resources

- [OWASP Smart Contract Top 10](https://owasp.org/www-project-smart-contract-top-10/)
- [Solana Security Best Practices](https://docs.solana.com/developing/programming-model/accounts)
- [Anchor Security](https://docs.rs/anchor-lang/latest/anchor_lang/)

---

**Questions?** Email [security@worldstrategy.dev](mailto:security@worldstrategy.dev)
