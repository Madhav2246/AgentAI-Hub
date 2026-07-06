import React, { useState } from 'react';
import { 
  DollarSign, 
  Cpu, 
  Clock, 
  CheckCircle2
} from 'lucide-react';
import { AnalyticsData, Agent } from '../types/types';

interface AnalyticsProps {
  analytics: AnalyticsData;
  agents: Agent[];
}

export default function Analytics({ analytics, agents }: AnalyticsProps) {
  const [hoveredCostIndex, setHoveredCostIndex] = useState<number | null>(null);
  const [hoveredLatencyIndex, setHoveredLatencyIndex] = useState<number | null>(null);

  // SVG Chart Dimensions
  const chartWidth = 500;
  const chartHeight = 150;
  const padding = 30;

  // Render SVG Area Line Chart for Cost History
  const renderCostChart = () => {
    const data = analytics.costHistory;
    const maxVal = Math.max(...data.map(d => d.value), 0.01);
    
    // Calculate coordinates
    const points = data.map((d, index) => {
      const x = padding + (index * (chartWidth - padding * 2)) / (data.length - 1);
      const y = chartHeight - padding - (d.value / maxVal) * (chartHeight - padding * 2);
      return { x, y, val: d.value, label: d.date };
    });

    const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const areaData = `${pathData} L ${points[points.length - 1].x} ${chartHeight - padding} L ${points[0].x} ${chartHeight - padding} Z`;

    return (
      <div className="relative">
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-48 select-none">
          {/* Grid lines */}
          <line x1={padding} y1={padding} x2={chartWidth - padding} y2={padding} stroke="currentColor" className="text-zinc-100 dark:text-zinc-800/60" strokeDasharray="3,3" />
          <line x1={padding} y1={chartHeight / 2} x2={chartWidth - padding} y2={chartHeight / 2} stroke="currentColor" className="text-zinc-100 dark:text-zinc-800/60" strokeDasharray="3,3" />
          <line x1={padding} y1={chartHeight - padding} x2={chartWidth - padding} y2={chartHeight - padding} stroke="currentColor" className="text-zinc-200 dark:text-zinc-800" strokeWidth="1.5" />

          {/* Area fill */}
          <path d={areaData} fill="url(#costGrad)" className="opacity-20 dark:opacity-10" />
          
          {/* Sparkline path */}
          <path d={pathData} fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

          {/* Data Points */}
          {points.map((p, i) => (
            <g key={i}>
              <circle 
                cx={p.x} 
                cy={p.y} 
                r={hoveredCostIndex === i ? 5 : 3} 
                fill={hoveredCostIndex === i ? "#2563eb" : "#ffffff"} 
                stroke="#2563eb" 
                strokeWidth="2" 
                className="cursor-pointer transition-all"
                onMouseEnter={() => setHoveredCostIndex(i)}
                onMouseLeave={() => setHoveredCostIndex(null)}
              />
              <text 
                x={p.x} 
                y={chartHeight - 10} 
                textAnchor="middle" 
                className="text-[9px] fill-zinc-400 font-medium"
              >
                {p.label}
              </text>
            </g>
          ))}

          {/* Definitions */}
          <defs>
            <linearGradient id="costGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563eb" />
              <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>

        {/* Hover details badge */}
        {hoveredCostIndex !== null && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 px-2 py-1 rounded text-[10px] font-mono shadow-md font-semibold">
            {points[hoveredCostIndex].label}: ${points[hoveredCostIndex].val.toFixed(4)}
          </div>
        )}
      </div>
    );
  };

  // Render SVG Chart for Latency History
  const renderLatencyChart = () => {
    const data = analytics.latencyHistory;
    const maxVal = Math.max(...data.map(d => d.value), 1000);
    
    // Calculate coordinates
    const points = data.map((d, index) => {
      const x = padding + (index * (chartWidth - padding * 2)) / (data.length - 1);
      const y = chartHeight - padding - (d.value / maxVal) * (chartHeight - padding * 2);
      return { x, y, val: d.value, label: d.date };
    });

    const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

    return (
      <div className="relative">
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-48 select-none">
          {/* Grid lines */}
          <line x1={padding} y1={padding} x2={chartWidth - padding} y2={padding} stroke="currentColor" className="text-zinc-100 dark:text-zinc-800/60" strokeDasharray="3,3" />
          <line x1={padding} y1={chartHeight / 2} x2={chartWidth - padding} y2={chartHeight / 2} stroke="currentColor" className="text-zinc-100 dark:text-zinc-800/60" strokeDasharray="3,3" />
          <line x1={padding} y1={chartHeight - padding} x2={chartWidth - padding} y2={chartHeight - padding} stroke="currentColor" className="text-zinc-200 dark:text-zinc-800" strokeWidth="1.5" />

          {/* Sparkline path */}
          <path d={pathData} fill="none" stroke="#8b5cf6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

          {/* Data Points */}
          {points.map((p, i) => (
            <g key={i}>
              <circle 
                cx={p.x} 
                cy={p.y} 
                r={hoveredLatencyIndex === i ? 5 : 3} 
                fill={hoveredLatencyIndex === i ? "#8b5cf6" : "#ffffff"} 
                stroke="#8b5cf6" 
                strokeWidth="2" 
                className="cursor-pointer transition-all"
                onMouseEnter={() => setHoveredLatencyIndex(i)}
                onMouseLeave={() => setHoveredLatencyIndex(null)}
              />
              <text 
                x={p.x} 
                y={chartHeight - 10} 
                textAnchor="middle" 
                className="text-[9px] fill-zinc-400 font-medium"
              >
                {p.label}
              </text>
            </g>
          ))}
        </svg>

        {/* Hover details badge */}
        {hoveredLatencyIndex !== null && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 px-2 py-1 rounded text-[10px] font-mono shadow-md font-semibold">
            {points[hoveredLatencyIndex].label}: {(points[hoveredLatencyIndex].val / 1000).toFixed(2)}s
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      
      {/* Header section */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">Workspace Analytics</h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">Audit token efficiency ratios, workload distributions, and response speed trends.</p>
      </div>

      {/* Numerical Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="p-5 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0c0c0f] rounded-xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="block text-[10px] text-zinc-400 font-medium uppercase tracking-wider">Gross Token Load</span>
            <span className="text-xl font-bold font-mono text-zinc-950 dark:text-white">
              {new Intl.NumberFormat('en-US').format(analytics.tokenUsage)}
            </span>
          </div>
          <Cpu className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </div>

        <div className="p-5 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0c0c0f] rounded-xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="block text-[10px] text-zinc-400 font-medium uppercase tracking-wider">Gross Expenditures</span>
            <span className="text-xl font-bold font-mono text-zinc-950 dark:text-white">
              ${analytics.totalCost.toFixed(4)}
            </span>
          </div>
          <DollarSign className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
        </div>

        <div className="p-5 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0c0c0f] rounded-xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="block text-[10px] text-zinc-400 font-medium uppercase tracking-wider">Latency Average</span>
            <span className="text-xl font-bold font-mono text-zinc-950 dark:text-white">
              {(analytics.averageResponseTimeMs / 1000).toFixed(2)}s
            </span>
          </div>
          <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
        </div>

        <div className="p-5 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0c0c0f] rounded-xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="block text-[10px] text-zinc-400 font-medium uppercase tracking-wider">SLA Target Success</span>
            <span className="text-xl font-bold font-mono text-zinc-950 dark:text-white">
              {analytics.satisfactionRate}%
            </span>
          </div>
          <CheckCircle2 className="h-5 w-5 text-amber-500" />
        </div>
      </div>

      {/* SVG Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Cost Chart */}
        <div className="p-5 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0c0c0f] rounded-xl shadow-sm space-y-4">
          <div>
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">7-Day Spend Trend</h3>
            <span className="text-[10px] text-zinc-500">Cumulative LLM API token expenditure over time.</span>
          </div>
          {renderCostChart()}
        </div>

        {/* Latency Chart */}
        <div className="p-5 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0c0c0f] rounded-xl shadow-sm space-y-4">
          <div>
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">7-Day Latency Profile</h3>
            <span className="text-[10px] text-zinc-500">Mean processing durations across collaborative workflows.</span>
          </div>
          {renderLatencyChart()}
        </div>

      </div>

      {/* Agent Task Distribution Bar Chart */}
      <div className="p-5 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0c0c0f] rounded-xl shadow-sm space-y-4">
        <div>
          <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Agent Task Distribution</h3>
          <span className="text-[10px] text-zinc-500">Completed tasks per agent — proportional contribution to total workload.</span>
        </div>
        <div className="flex items-end gap-3 h-32 pt-2">
          {agents.map((agent) => {
            const maxTasks = Math.max(...agents.map(a => a.performance.tasksCompleted), 1);
            const barPct = agent.performance.tasksCompleted / maxTasks;
            const barHeight = Math.max(barPct * 100, 4);
            return (
              <div key={agent.id} className="flex-1 flex flex-col items-center gap-1 group">
                {/* Value label on hover */}
                <span className="text-[9px] font-mono text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  {agent.performance.tasksCompleted}
                </span>
                {/* Bar */}
                <div
                  className="w-full rounded-t-md transition-all duration-700 ease-out cursor-default relative"
                  style={{ height: `${barHeight}%`, backgroundColor: agent.avatarColor, opacity: 0.85 }}
                  title={`${agent.name}: ${agent.performance.tasksCompleted} tasks / $${agent.performance.costIncurred.toFixed(4)}`}
                >
                  {/* Shine overlay */}
                  <div className="absolute inset-0 rounded-t-md bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                {/* Agent initials */}
                <span className="text-[9px] font-bold text-zinc-500 truncate max-w-full px-0.5">
                  {agent.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
            );
          })}
        </div>
        {/* Legend */}
        <div className="flex flex-wrap gap-3 pt-1 border-t border-zinc-100 dark:border-zinc-800/60">
          {agents.map(agent => (
            <div key={agent.id} className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: agent.avatarColor }} />
              <span className="text-[10px] text-zinc-500">{agent.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="p-5 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0c0c0f] rounded-xl shadow-sm">
        <div className="mb-4">
          <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Agent Contribution Breakdown</h3>
          <span className="text-[10px] text-zinc-500">Individual metrics comparing task volumes, tokens and costs.</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs select-none">
            <thead>
              <tr className="bg-zinc-50/50 dark:bg-zinc-800/20 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 font-medium">
                <th className="p-3">Employee</th>
                <th className="p-3">Role</th>
                <th className="p-3">Tasks Solved</th>
                <th className="p-3">Token Share</th>
                <th className="p-3">Cost Share</th>
                <th className="p-3 text-right">Avg Speed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 text-zinc-700 dark:text-zinc-300">
              {agents.map((agent) => (
                <tr key={agent.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/10">
                  <td className="p-3 flex items-center gap-2 font-semibold text-zinc-950 dark:text-white">
                    <span 
                      className="h-2 w-2 rounded-full" 
                      style={{ backgroundColor: agent.avatarColor }} 
                    />
                    <span>{agent.name}</span>
                  </td>
                  <td className="p-3 text-zinc-500">{agent.role}</td>
                  <td className="p-3 font-medium">{agent.performance.tasksCompleted}</td>
                  <td className="p-3 font-mono text-zinc-500">{new Intl.NumberFormat('en-US').format(agent.performance.tokensUsed)}</td>
                  <td className="p-3 font-mono text-zinc-500">${agent.performance.costIncurred.toFixed(4)}</td>
                  <td className="p-3 text-right font-mono text-zinc-500">{(agent.performance.avgLatencyMs / 1000).toFixed(1)}s</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
