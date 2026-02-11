# WORLD Strategy ($WORLD)

<img width="1792" height="576" alt="Gemini_Generated_Image_5wteg35wteg35wte" src="https://github.com/user-attachments/assets/af3a9b8f-ac90-4510-a7bf-e36ab4f27ea0" />

X: https://x.com/WORLDStrategyy

**"The world is a memecoin, so let's build it transparently."**

WORLD Strategy est un **token crypto-natif de trésorerie** qui route les frais de créateur dans une trésorerie transparent et suivi onchain. La trésorerie est allouée de façon algorithmique à travers des actifs mondiaux diversifiés—ETFs, matières premières, indices boursiers principaux, et proxies d'actifs réels (RWA)—construisant un **memecoin soutenu par la trésorerie** avec un vrai soutien économique.

C'est **expérimental**, **piloté par la communauté**, et **entièrement transparent**. Aucune affiliation avec Phantom, MetaMask, ou toute autre plateforme. Aucun retour garanti—seulement un mécanisme novel pour financer une stratégie diversifiée globale via les mécaniques de memecoin.

---

## ⚠️ Disclaimer Important

- **PAS une promesse de profits.** C'est un protocole de trésorerie expérimental basé sur les mécaniques de memecoin.
- **PAS affilié** avec un portefeuille, échange, ou institution financière.
- **PAS un conseil d'investissement.** WORLD est purement exploratoire ; l'exposition aux actifs sous-jacents est spéculative.
- **PAS une sécurité** (statut légal dépend de la juridiction). Consultez un avocat.
- **Les risques sont réels** : bugs de contrats intelligents, défaillances d'oracle, volatilité de liquidité, incertitude réglementaire.

Lisez [RISKS.md](docs/risks.md) attentivement avant d'engager.

---

## 🎯 L'Idée Centrale

WORLD Strategy route les frais de créateur dans une trésorerie transparent conçue pour construire une exposition diversifiée aux actifs mondiaux au fil du temps.

### Comment ça marche

1. **Capture de frais** : Chaque transaction WORLD token extrait un frais de créateur (configurable 2%), envoyé directement au portefeuille de trésorerie.

2. **Moteur d'allocation** : À intervalle régulier ou seuil :
   - Convertit les frais collectés à un actif de base (USDC/SOL)
   - Alloue à travers un panier configurable d'actifs mondiaux
   - Logs tous les trades onchain comme événements immuables

3. **Transparence de trésorerie** : Chaque titulaire peut interroger :
   - Total des frais collectés
   - Composition actuelle de la trésorerie
   - NAV estimé (Valeur d'Actif Net)
   - NAV par token = valeur totale de trésorerie ÷ supply circulante

4. **Automatisation** : Un bot keeper monitor en continu la trésorerie, exécute les trades de rééquilibrage via des agrégateurs DEX, et publie des rapports.

---

## ✨ Fonctionnalités Clés

- 🌍 **Exposition Mondiale** : Allocation diversifiée à indices boursiers, matières premières, et RWAs
- 🔍 **Transparent Onchain** : Toutes les opérations de trésorerie loggées via événements ; validation trustless
- 🤖 **Rééquilibrage Automatisé** : Bot keeper exécute les trades sans intervention manuelle
- 📊 **Reporting NAV** : Soutien estimé de trésorerie par token, rafraîchi continuellement
- 🛡️ **Disjoncteurs** : Plafonds de slippage, limites dépenses par cycle, periodes de refroidissement
- 🟢 **Mode Simulation** : DRY_RUN permet tests locaux sans clés ni fonds
- 📈 **Flexibilité d'allocation** : Poids configurables, liste d'actifs améliorable via gouvernance (future)

---

## 📊 Modèle de Trésorerie

La trésorerie opère comme un pipeline multi-étape :

```
Frais de Créateur (1-5% des volumes)
    ↓
Portefeuille de Trésorerie (tracking onchain)
    ↓
Conversion à Actif de Base (USDC/SOL)
    ↓
Moteur d'Allocation (poids: S&P500=40%, Emerging=20%, Gold=15%, RWAs=25%)
    ↓
Exécution DEX (agrégateur Jupiter ou similaire)
    ↓
Holdings de Trésorerie (tracked par prix oracle)
    ↓
Calcul de NAV (valeur trésorerie / supply)
```

**Paramètres Clés** (voir [scripts/config.example.json](scripts/config.example.json)):
- `fee_rate`: 2% (configurable)
- `allocation_interval`: 2 semaines (peut être déclenché sur seuil)
- `max_per_cycle`: $100k (plafond dépense par cycle)
- `slippage_limit`: 0.5%
- `cooldown_blocks`: 1 jour

---

## 📐 Méthodologie NAV

**NAV par token** estime le soutien de trésorerie :

```
NAV = (Somme de tous les prix d'actifs (en USD) en trésorerie)
    / (Tokens WORLD en circulation)
```

- Utilise **Pyth Network** pour feeds mainnet ; **oracles mock** pour testing
- Mis à jour chaque bloc ou à la demande
- **PAS une garantie** : prix oracle peut lagged ; actifs illiquides difficiles à valoriser
- Utilisé pour affichage dashboard et monitoring seulement—aucun trading dépend du NAV

Voir [docs/nav-methodology.md](docs/nav-methodology.md) pour la dérivation complète.

---

## 🚀 Quickstart (Simulation Locale)

Vérifiez que le projet s'exécute en **mode simulation** sans clés réelles ni fonds.

### Prérequis
- Node 18+
- pnpm
- Solana CLI (optionnel)

### Setup

```bash
# Clone et install
git clone https://github.com/softwaredevelopoor/WORLD-Strategy.git
cd WORLD-Strategy
pnpm install

# Copie template environnement
cp .env.example .env.local

# Exécute keeper en mode dry-run
cd keeper
export DRY_RUN=true
pnpm dev

# (Dans un autre terminal) Exécute dashboard
cd ../dashboard
pnpm dev
# Ouvre http://localhost:3000
```

En **mode DRY_RUN**, le keeper :
- Simule l'état de la trésorerie
- Logs les décisions d'allocation sans exécution
- Calcule le NAV avec prix mock
- Génère rapports vers stdout

---

## 💻 Exemple d'Exécution

### Keeper Bot (DRY_RUN)

```bash
$ cd keeper && export DRY_RUN=true && pnpm dev

[INFO] === WORLD Strategy Keeper Bot ===
[INFO] Environment: DRY_RUN (simulation)
[INFO] Network: devnet
[INFO] Log Level: info
[DEBUG] Initializing keeper bot...
[INFO] [DRY_RUN] Using simulated treasury
[INFO] ✓ Keeper initialized
[INFO] Starting keeper loop (interval: 30000ms)
[DEBUG] --- Keeper Cycle ---
[DEBUG] Treasury state: fees=25000, deployed=100000
[DEBUG] Threshold: 25000 >= 50000 ? false
[DEBUG] Interval: 86400s >= 1209600s ? false
[DEBUG] No allocation triggered this cycle

[INFO] --- Keeper Cycle (30s later) ---
[DEBUG] Treasury state: fees=50500, deployed=100000
[DEBUG] Threshold: 50500 >= 50000 ? true
[INFO] ✓ Allocation triggered
[INFO] Prepared allocations: 4
[INFO] ✓ Slippage validation passed
[INFO] [DRY_RUN] Would execute allocations:
{
  "asset": "SPX",
  "amountDeployed": 20333.33,
  "amountReceived": 9699.68,
  "slippageBps": 28
}
{
  "asset": "EEM",
  "amountDeployed": 10166.67,
  "amountReceived": 5409.84,
  "slippageBps": 32
}
...

[INFO] NAV: $1.2504 per token

[INFO] Report:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  WORLD Strategy Treasury Report
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Timestamp:    2026-02-11T14:32:45.123Z
Cycle:        #1

TREASURY SUMMARY
─────────────────────────────────────
Total Fees Collected:   $50,500.00
Total Deployed:         $150,500.00
Available Balance:      $0.00

NAV
─────────────────────────────────────
NAV per Token:          $1.2504
Total Treasury Value:   $1,000,320.00
Circulating Supply:     800,000 WORLD

HOLDINGS BY ASSET
─────────────────────────────────────
SPX        $   400,120.00  ( 40.0%)
EEM        $   200,064.00  ( 20.0%)
GLD        $   150,048.00  ( 15.0%)
RWA        $   250,088.00  ( 25.0%)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Dashboard

```bash
$ cd dashboard && pnpm dev

> world-dashboard@1.0.0 dev
> next dev

  ▲ Next.js 14.0.0
  - Local:        http://localhost:3000

✓ Ready in 1.2s
```

Accédez à `http://localhost:3000` pour voir:
- **Treasury Balance**: Valeur totale en chaque actif
- **Allocation Chart**: Pie chart des poids courants
- **NAV Display**: Valeur par token, historic chart
- **Fees History**: Frais entrants par jour/semaine
- **Recent Transactions**: Liens tx onchain (placeholders)

---

## 🏗️ Architecture

### Smart Contract Solana (Anchor)

```rust
// Comptes clés
pub struct Treasury {
    pub admin: Pubkey,           // Administrateur
    pub paused: bool,            // Flag pause d'urgence
    pub total_fees_collected: u64,
    pub total_deployed: u64,
    pub last_allocation_timestamp: i64,
}

// Instructions principales
pub fn initialize_treasury() -> Result<()>
pub fn record_fees(amount: u64) -> Result<()>
pub fn execute_allocation(allocations: Vec<AssetAllocation>) -> Result<()>
pub fn update_nav(nav_per_token: f64, ...) -> Result<()>
pub fn pause_treasury() -> Result<()>
pub fn unpause_treasury() -> Result<()>
```

Voir [program/src/lib.rs](program/src/lib.rs) pour code complet.

### Keeper Bot (TypeScript)

```typescript
// Boucle principale
class Keeper {
  async start() {
    setInterval(async () => {
      // 1. Monitor état trésorerie
      const state = await monitor.getTreasuryState();
      
      // 2. Vérifie si allocation devrait déclencher
      if (await allocator.shouldAllocate(state)) {
        // 3. Prépare allocations
        const allocations = await allocator.prepareAllocations(state);
        
        // 4. Valide slippage
        if (await allocator.validateSlippage(allocations)) {
          // 5. Exécute trades
          await allocator.execute(allocations);
          
          // 6. Update NAV
          const nav = await navCalculator.calculate(state);
          
          // 7. Génère rapport
          reportGenerator.generate({ nav, state });
        }
      }
    }, 30000); // Check tous les 30 secondes
  }
}
```

Voir [keeper/src/](keeper/src/) pour l'implémentation complète.

### Dashboard (Next.js/React)

```typescript
export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    // Requête données trésorerie
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
      <TreasuryCard title="NAV par Token" value={`$${data?.nav.navPerToken.toFixed(4)}`} />
      <AllocationChart data={weights} />
      <NAVChart data={navHistory} />
    </div>
  );
}
```

Voir [dashboard/src/](dashboard/src/) pour code complet.

---

## 📚 Documentation Complète

| Sujet | Fichier | Objectif |
|-------|---------|----------|
| Vue d'ensemble | [docs/overview.md](docs/overview.md) | Architecture système |
| Modèle trésorerie | [docs/treasury-model.md](docs/treasury-model.md) | Mécaniques captures frais |
| Stratégie allocation | [docs/allocation-strategy.md](docs/allocation-strategy.md) | Règles allocation actifs |
| Méthodologie NAV | [docs/nav-methodology.md](docs/nav-methodology.md) | Formule calcul NAV |
| Actifs RWA | [docs/rwa-and-proxy-assets.md](docs/rwa-and-proxy-assets.md) | Description actifs |
| Analyse risques | [docs/risks.md](docs/risks.md) | 20+ risques identifiés |
| FAQ | [docs/faq.md](docs/faq.md) | ~50 questions |
| Déploiement | [scripts/deploy.md](scripts/deploy.md) | Guide étape-à-étape |
| Monitoring | [scripts/monitor.md](scripts/monitor.md) | Santé checks, alertes |

---

## 🔄 Flux de Contribution

Voir [CONTRIBUTING.md](CONTRIBUTING.md) pour setup et guidelines PR.

```bash
# Setup
git clone https://github.com/softwaredevelopoor/WORLD-Strategy.git
cd WORLD-Strategy
pnpm install

# Créer branche
git checkout -b feature/votre-feature

# Tester
cd keeper && pnpm test
cd ../program && anchor test
cd ../dashboard && pnpm test

# Commit avec message clair
git commit -m "feat: description de la feature"

# Push et créer PR
git push origin feature/votre-feature
```

---

## 🛡️ Sécurité

C'est **code pré-audit expérimental**. Ne doit PAS être déployé sur mainnet avec vrais fonds sans :
- Audit professionnel de contrats intelligents
- Revue de risques par partenaires institutionnels
- Lancement graduel avec plafonds rigides

Voir [SECURITY.md](SECURITY.md) pour signaler vulnérabilités.

---

## 📜 Licence

MIT. Voir [LICENSE](LICENSE).

---

## 🙏 Ressources

- **GitHub**: [WORLD-Strategy](https://github.com/softwaredevelopoor/WORLD-Strategy)
- **Docs**: Dossier [/docs](docs/)
- **FAQ**: [docs/faq.md](docs/faq.md)
- **Risques**: [docs/risks.md](docs/risks.md)

---

**Construit avec 🌍 par la communauté WORLD.**

*Dernier update : Feb 2026 | Status : Pre-alpha expérimental*
