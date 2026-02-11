import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface NAVChartProps {
  data: Array<{ timestamp: number; nav: number }>;
}

export default function NAVChart({ data }: NAVChartProps) {
  const chartData = data.map(({ timestamp, nav }) => ({
    time: new Date(timestamp * 1000).toLocaleDateString(),
    nav: parseFloat(nav.toFixed(4)),
  }));

  return (
    <div className="w-full h-96 bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold mb-4">NAV History</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis />
          <Tooltip formatter={(value) => `$${value.toFixed(4)}`} />
          <Legend />
          <Line type="monotone" dataKey="nav" stroke="#8884d8" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
