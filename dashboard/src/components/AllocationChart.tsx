import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface AllocationChartProps {
  data: { [key: string]: number };
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c'];

export default function AllocationChart({ data }: AllocationChartProps) {
  const chartData = Object.entries(data).map(([name, value]) => ({
    name,
    value: parseFloat(value.toFixed(1)),
  }));

  return (
    <div className="w-full h-96 bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold mb-4">Asset Allocation</h3>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, value }) => `${name}: ${value}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
