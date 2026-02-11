interface TreasuryCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: number;
}

export default function TreasuryCard({ title, value, subtitle, trend }: TreasuryCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <p className="text-sm text-gray-600 mb-2">{title}</p>
      <p className="text-3xl font-bold mb-2">{value}</p>
      {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
      {trend !== undefined && (
        <p className={`text-sm mt-2 ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {trend >= 0 ? '+' : ''}{trend.toFixed(2)}%
        </p>
      )}
    </div>
  );
}
