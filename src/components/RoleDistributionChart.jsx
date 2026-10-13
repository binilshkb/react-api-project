import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { PieChart as PieChartIcon } from 'lucide-react';

const COLORS = ['var(--accent-primary)', 'var(--accent-info)', 'var(--accent-success)'];

const RoleDistributionChart = ({ data }) => {
  return (
    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '300px' }}>
      <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)' }} className="flex-between">
        <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <PieChartIcon size={18} /> Role Distribution
        </h3>
      </div>
      <div style={{ flex: 1, padding: '1.5rem', width: '100%', height: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'var(--bg-secondary)', 
                borderColor: 'var(--border-color)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)'
              }}
              itemStyle={{ color: 'var(--text-primary)' }}
            />
            <Legend verticalAlign="bottom" height={36} wrapperStyle={{ color: 'var(--text-secondary)' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RoleDistributionChart;
