import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, 
  CheckSquare, 
  Coins, 
  Clock, 
  Activity, 
  Plus, 
  Play, 
  TrendingUp,
  X,
  BrainCircuit,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { Agent, Task, AnalyticsData } from '../types/types';

interface DashboardProps {
  agents: Agent[];
  tasks: Task[];
  analytics: AnalyticsData;
  onNavigate: (page: string) => void;
}

// Animated counter hook — counts up from 0 to target on mount
function useCountUp(target: number, duration = 900, decimals = 0) {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    startRef.current = null;
    const step = (timestamp: number) => {
      if (!startRef.current) startRef.current = timestamp;
      const progress = Math.min((timestamp - startRef.current) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setValue(parseFloat((target * ease).toFixed(decimals)));
      if (progress < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [target, duration, decimals]);

  return value;
}

export default function Dashboard({ agents, tasks, analytics, onNavigate }: DashboardProps) {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  // Animated KPI values
  const animatedAgents = useCountUp(agents.length, 700);
  const animatedTasks = useCountUp(tasks.length, 800);
  const animatedCost = useCountUp(analytics.totalCost, 1000, 4);
  const animatedLatency = useCountUp(analytics.averageResponseTimeMs / 1000, 900, 1);

  const selectedTask = tasks.find(t => t.id === selectedTaskId);

  const formatCost = (cost: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 4 }).format(cost);

  const formatNumber = (num: number) => new Intl.NumberFormat('en-US').format(num);

  const getStatusBadge = (status: Task['status']) => {
    switch (status) {
      case 'completed': return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      case 'running':   return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 animate-pulse';
      case 'failed':    return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
      default:          return 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20';
    }
  };

  const activeTasks = tasks.filter(t => t.status === 'running').length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const recentActivity = [...tasks]
    .filter(t => t.status === 'completed' && t.steps && t.steps.length > 0)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4);

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">Workspace Overview</h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Monitor active AI workflows, task completions, and operation budgets.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('tasks')}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-sm flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Plus className="h-4 w-4" /><span>New Task</span>
          </button>
          <button
            onClick={() => onNavigate('employees')}
            className="px-3.5 py-2 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg text-xs font-semibold shadow-sm flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Users className="h-4 w-4" /><span>Manage Agents</span>
          </button>
        </div>
      </div>

      {/* KPI Cards — animated count-up */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        <div className="p-5 bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800/80 rounded-xl shadow-sm space-y-3 hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">Active Employees</span>
            <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
              <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-bold text-zinc-950 dark:text-white tabular-nums">{Math.round(animatedAgents)}</span>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              100% capacity
            </span>
          </div>
          {/* Mini bar */}
          <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-1">
            <div className="bg-blue-500 h-1 rounded-full transition-all duration-1000" style={{ width: `${Math.min((agents.length / 10) * 100, 100)}%` }} />
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800/80 rounded-xl shadow-sm space-y-3 hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">Tasks Executed</span>
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
              <CheckSquare className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-bold text-zinc-950 dark:text-white tabular-nums">{Math.round(animatedTasks)}</span>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center gap-0.5">
              <TrendingUp className="h-3 w-3" />
              <span>{completedTasks} done</span>
            </span>
          </div>
          <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-1">
            <div className="bg-emerald-500 h-1 rounded-full transition-all duration-1000" style={{ width: tasks.length ? `${(completedTasks / tasks.length) * 100}%` : '0%' }} />
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800/80 rounded-xl shadow-sm space-y-3 hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">Total Model Costs</span>
            <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500/20 transition-colors">
              <Coins className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-bold text-zinc-950 dark:text-white tabular-nums font-mono">${animatedCost.toFixed(4)}</span>
          </div>
          <div className="text-[10px] text-zinc-400 font-mono">{formatNumber(analytics.tokenUsage)} tokens consumed</div>
        </div>

        <div className="p-5 bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800/80 rounded-xl shadow-sm space-y-3 hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">Average Duration</span>
            <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
              <Clock className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-bold text-zinc-950 dark:text-white tabular-nums font-mono">{animatedLatency.toFixed(1)}s</span>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              {analytics.satisfactionRate}% SLA
            </span>
          </div>
          <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-1">
            <div className="bg-purple-500 h-1 rounded-full transition-all duration-1000" style={{ width: `${analytics.satisfactionRate}%` }} />
          </div>
        </div>

      </div>

      {/* Main Split: Table + Details Panel */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        
        {/* Table */}
        <div className={`transition-all duration-300 ${selectedTaskId ? 'w-full lg:w-2/3' : 'w-full'} space-y-6`}>
          <div className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800/80 rounded-xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Recent Executions</h3>
                <span className="text-[10px] text-zinc-500">Click a row to audit the multi-agent collaboration trail.</span>
              </div>
              {activeTasks > 0 && (
                <div className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 font-semibold">
                  <span className="h-2 w-2 rounded-full bg-blue-500 animate-ping" />
                  <Activity className="h-4 w-4" />
                  <span>{activeTasks} running...</span>
                </div>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs select-none">
                <thead>
                  <tr className="bg-zinc-50/50 dark:bg-zinc-800/20 border-b border-zinc-200 dark:border-zinc-800/60 text-zinc-500 dark:text-zinc-400 font-medium">
                    <th className="p-4">Task Name</th>
                    <th className="p-4">Department</th>
                    <th className="p-4">Agent</th>
                    <th className="p-4">Created At</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 text-zinc-700 dark:text-zinc-300">
                  {tasks.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-10 text-center text-zinc-400">
                        <div className="flex flex-col items-center gap-2">
                          <BrainCircuit className="h-8 w-8 text-zinc-300 dark:text-zinc-700" />
                          <span className="text-xs">No tasks yet. Click "New Task" to run an agent workflow.</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    tasks.map((task) => {
                      const assignedAgent = agents.find(a => a.id === task.assignedAgentId);
                      const isSelected = selectedTaskId === task.id;
                      return (
                        <tr
                          key={task.id}
                          onClick={() => setSelectedTaskId(isSelected ? null : task.id)}
                          className={`cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-blue-50/50 dark:bg-blue-900/10 border-l-2 border-blue-500'
                              : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/20'
                          }`}
                        >
                          <td className="p-4 font-semibold text-zinc-900 dark:text-zinc-200 max-w-[200px] truncate">{task.name}</td>
                          <td className="p-4 text-zinc-500">{task.department}</td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              {assignedAgent ? (
                                <>
                                  <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: assignedAgent.avatarColor }} />
                                  <span>{assignedAgent.name}</span>
                                </>
                              ) : (
                                <span className="text-zinc-400">Coordinator</span>
                              )}
                            </div>
                          </td>
                          <td className="p-4 text-zinc-500">
                            {new Date(task.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 border rounded-full text-[10px] font-semibold ${getStatusBadge(task.status)}`}>
                              {task.status}
                            </span>
                          </td>
                          <td className="p-4 text-right font-mono font-medium text-zinc-500">
                            {task.totalCost ? formatCost(task.totalCost) : '—'}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Agent Activity Feed */}
          {recentActivity.length > 0 && (
            <div className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800/80 rounded-xl shadow-sm p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Recent Agent Activity</h3>
                <Zap className="h-3.5 w-3.5 text-amber-400" />
              </div>
              <div className="space-y-3">
                {recentActivity.map(task => {
                  const agent = agents.find(a => a.id === task.assignedAgentId);
                  const lastStep = task.steps?.[task.steps.length - 1];
                  return (
                    <div key={task.id} className="flex items-start gap-3">
                      <div
                        className="h-7 w-7 rounded-lg flex items-center justify-center text-white font-bold text-[10px] uppercase shrink-0"
                        style={{ backgroundColor: agent?.avatarColor || '#3b82f6' }}
                      >
                        {agent ? agent.name.split(' ').map(n => n[0]).join('') : 'AI'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2">
                          <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate">{agent?.name || 'Coordinator'}</span>
                          <span className="text-[10px] text-zinc-400 shrink-0">completed</span>
                          <span className="text-[10px] text-zinc-500 font-medium truncate">{task.name}</span>
                        </div>
                        {lastStep && (
                          <p className="text-[10px] text-zinc-400 mt-0.5 truncate">{lastStep.content.slice(0, 80)}...</p>
                        )}
                      </div>
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Details Side Panel */}
        {selectedTaskId && selectedTask && (
          <div className="w-full lg:w-1/3 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0c0c0f] rounded-xl shadow-md p-5 space-y-5 shrink-0 sticky top-4">
            
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/60 pb-3">
              <div>
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">Execution Audit Trail</span>
                <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate max-w-[220px]">{selectedTask.name}</h4>
              </div>
              <button
                onClick={() => setSelectedTaskId(null)}
                className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 rounded-md transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 bg-zinc-50 dark:bg-zinc-800/20 border border-zinc-100 dark:border-zinc-800/40 rounded-lg">
                <span className="block text-[10px] text-zinc-500 mb-0.5">Execution Time</span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200 font-mono">
                  {selectedTask.durationMs ? `${(selectedTask.durationMs / 1000).toFixed(1)}s` : 'N/A'}
                </span>
              </div>
              <div className="p-2.5 bg-zinc-50 dark:bg-zinc-800/20 border border-zinc-100 dark:border-zinc-800/40 rounded-lg">
                <span className="block text-[10px] text-zinc-500 mb-0.5">Confidence</span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200 font-mono">
                  {selectedTask.confidence ? `${(selectedTask.confidence * 100).toFixed(0)}%` : 'N/A'}
                </span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="block font-semibold text-zinc-500 mb-1.5">User Request Prompt</span>
                <p className="bg-zinc-50 dark:bg-zinc-800/20 border border-zinc-100 dark:border-zinc-800/40 rounded-lg p-3 text-zinc-700 dark:text-zinc-300 select-text leading-relaxed">
                  {selectedTask.description}
                </p>
              </div>

              {selectedTask.status === 'completed' && selectedTask.outputText && (
                <div>
                  <span className="block font-semibold text-zinc-500 mb-1.5">Synthesis Output</span>
                  <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200/50 dark:border-emerald-800/30 rounded-lg p-3 text-zinc-700 dark:text-zinc-300 select-text leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">
                    {selectedTask.outputText}
                  </div>
                </div>
              )}

              {selectedTask.steps && selectedTask.steps.length > 0 && (
                <div className="space-y-2">
                  <span className="block font-semibold text-zinc-500">Collaboration Trail <span className="text-zinc-400 font-normal">({selectedTask.steps.length} steps)</span></span>
                  <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                    {selectedTask.steps.map((step) => {
                      const isOrch = step.agentId === 'orchestrator';
                      const stepAgent = agents.find(a => a.id === step.agentId);
                      const color = isOrch ? '#2563eb' : (stepAgent?.avatarColor || '#71717a');
                      return (
                        <div key={step.id} className="p-2.5 rounded-lg border-l-2 bg-zinc-50 dark:bg-[#09090b]/80 border border-zinc-100 dark:border-zinc-800" style={{ borderLeftColor: color }}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-[10px]" style={{ color }}>{step.agentName}</span>
                            <span className="text-[9px] text-zinc-500 font-mono">{step.type.toUpperCase()}</span>
                          </div>
                          <p className="text-[11px] text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed line-clamp-3">{step.content}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {selectedTask.status === 'pending' && (
              <button
                onClick={() => onNavigate('tasks')}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <Play className="h-4 w-4" /><span>Go to Execution Center</span>
              </button>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
