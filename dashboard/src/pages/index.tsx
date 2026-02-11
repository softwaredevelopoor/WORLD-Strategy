import { useState, useEffect } from 'react';
import TreasuryCard from '@/components/TreasuryCard';
import AllocationChart from '@/components/AllocationChart';
import NAVChart from '@/components/NAVChart';
import { formatUSD, formatNumber, formatPercent } from '@/lib/formatters';

interface DashboardData {
  nav: {
    navPerToken: number;
    totalTreasuryUSD: number;
    circulatingSupply: number;
    assets: {
      [key: string]: { value: number; weight: number };
    };
  };
  treasury: {
    totalFeesCollected: number;
    totalDeployed: number;
    balance: number;
  };
  navHistory: Array<{ timestamp: number; nav: number }>;
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // In production, fetch from API
        // For now, use mock data
        const mockData: DashboardData = {
          nav: {
            navPerToken: 1.25,
            totalTreasuryUSD: 1000000,
            circulatingSupply: 800000,
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
            balance: 50000,
          },
          navHistory: Array.from({ length: 30 }, (_, i) => ({
            timestamp: Math.floor(Date.now() / 1000) - (30 - i) * 86400,
            nav: 1.2 + Math.random() * 0.1,
          })),
        };
        setData(mockData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000); // Refresh every 10 seconds

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded p-4">
        <p className="text-red-800">Error: {error}</p>
      </div>
    );
  }

  if (!data) {
    return <p>No data available</p>;
  }

  const weights = Object.entries(data.nav.assets).reduce(
    (acc, [asset, info]) => {
      acc[asset] = info.weight * 100;
      return acc;
    },
    {} as { [key: string]: number }
  );

  return (
    <div className="space-y-8">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <TreasuryCard
          title="Treasury Value"
          value={formatUSD(data.nav.totalTreasuryUSD)}
          subtitle={`${formatNumber(data.nav.circulatingSupply)} WORLD tokens`}
        />
        <TreasuryCard
          title="NAV per Token"
          value={formatUSD(data.nav.navPerToken)}
          trend={2.5}
        />
        <TreasuryCard
          title="Total Fees Collected"
          value={formatUSD(data.treasury.totalFeesCollected)}
        />
        <TreasuryCard
          title="Unallocated Balance"
          value={formatUSD(data.treasury.balance)}
          subtitle="Ready for next cycle"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AllocationChart data={weights} />
        <div>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold mb-4">Asset Holdings</h3>
            <div className="space-y-3">
              {Object.entries(data.nav.assets).map(([asset, info]) => (
                <div key={asset} className="flex justify-between items-center">
                  <span className="font-medium">{asset}</span>
                  <span className="text-gray-600">{formatUSD(info.value)}</span>
                  <span className="text-gray-400 text-sm">{formatPercent(info.weight)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* NAV History */}
      <NAVChart data={data.navHistory} />

      {/* Footer Note */}
      <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
        <p className="text-sm text-yellow-800">
          <strong>Disclaimer:</strong> NAV is an estimate based on oracle prices and may not reflect actual
          liquidation value. All holdings are subject to market risk. See{' '}
          <a href="/risks" className="underline">
            risks
          </a>{' '}
          for details.
        </p>
      </div>
    </div>
  );
}
