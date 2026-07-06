import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, 
  Plus, 
  Play, 
  X,
  Activity, 
  Database,
  Calculator,
  Search,
  Mail,
  CornerDownRight,
  TrendingUp,
  Clock,
  Coins
} from 'lucide-react';
import { Task, Agent, StepLog } from '../types/types';

interface TasksProps {
  tasks: Task[];
  agents: Agent[];
  runningTaskId: string | null;
  runningTaskProgress: number;
  executionLogs: StepLog[];
  onCreateTask: (name: string, description: string, department: string) => Task;
  onRunTask: (taskId: string) => Promise<void>;
  isHitlEnabled: boolean;
  onToggleHitl: () => void;
  approvalData: { fromAgentName: string; toAgentName: string; payload: string } | null;
  onApproveHandoff: (payload: string) => void;
  onRejectHandoff: () => void;
}

export default function Tasks({ 
  tasks, 
  agents, 
  runningTaskId, 
  runningTaskProgress, 
  executionLogs, 
  onCreateTask, 
  onRunTask,
  isHitlEnabled,
  onToggleHitl,
  approvalData,
  onApproveHandoff,
  onRejectHandoff
}: TasksProps) {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(tasks[0]?.id || null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editablePayload, setEditablePayload] = useState('');

  useEffect(() => {
    if (approvalData) {
      setEditablePayload(approvalData.payload);
    }
  }, [approvalData]);


  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [department, setDepartment] = useState('Sales');

  const selectedTask = tasks.find(t => t.id === selectedTaskId);

  // Standard predefined tasks for quick creation
  const defaultQuickTasks = [
    { name: "Verify Commercial Discount", desc: "Validate if a 35% discount for Acme Corp on their 3-year plan complies with fiscal guidelines. Check support SLA limits.", dept: "Sales" },
    { name: "Review Q2 Budget Margins", desc: "Audit the gross revenue margins from the fiscal sheets and flag if engineering seats exceeded target cost parameters.", dept: "Finance" },
    { name: "Draft SLA Agreement", desc: "Create a technical service level agreement contract template with 99.9% uptime liabilities capped at 1x contract value.", dept: "Legal" }
  ];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description) return;
    const created = onCreateTask(name, description, department);
    setSelectedTaskId(created.id);
    setName('');
    setDescription('');
    setDepartment('Sales');
    setIsModalOpen(false);
  };

  const handleQuickCreate = (qTask: typeof defaultQuickTasks[0]) => {
    const created = onCreateTask(qTask.name, qTask.desc, qTask.dept);
    setSelectedTaskId(created.id);
  };

  // Helper to render tool icons
  const getToolIcon = (toolName?: string) => {
    if (!toolName) return <Database className="h-3.5 w-3.5" />;
    const nameLower = toolName.toLowerCase();
    if (nameLower.includes('search') || nameLower.includes('web')) return <Search className="h-3.5 w-3.5" />;
    if (nameLower.includes('calc')) return <Calculator className="h-3.5 w-3.5" />;
    if (nameLower.includes('email') || nameLower.includes('dispatch')) return <Mail className="h-3.5 w-3.5" />;
    return <Database className="h-3.5 w-3.5" />;
  };

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">Task Center</h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Delegate business problems to AI employees and audit their collaborative workflows.</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-zinc-600 dark:text-zinc-300 select-none bg-zinc-50 dark:bg-zinc-800/40 px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
            <input 
              type="checkbox" 
              checked={isHitlEnabled} 
              onChange={onToggleHitl}
              className="h-3.5 w-3.5 rounded border-zinc-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <span>HITL Handoff Gates</span>
          </label>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-sm flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Main split grid: Task List (1/3) + Execution Center (2/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left column: Task Selection List & Quick templates */}
        <div className="space-y-5">
          {/* Quick creation cards */}
          <div className="p-4 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0c0c0f] rounded-xl space-y-3">
            <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Quick Task Templates</h4>
            <div className="space-y-2">
              {defaultQuickTasks.map((qt, i) => (
                <button
                  key={i}
                  onClick={() => handleQuickCreate(qt)}
                  className="w-full text-left p-2.5 rounded-lg border border-zinc-100 dark:border-zinc-800/80 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 text-xs font-medium text-zinc-800 dark:text-zinc-200 transition-colors flex items-center justify-between cursor-pointer"
                >
                  <span className="truncate max-w-[190px]">{qt.name}</span>
                  <Plus className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                </button>
              ))}
            </div>
          </div>

          {/* Task List */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-1">Task History</h4>
            {tasks.map((task) => {
              const isSelected = selectedTaskId === task.id;
              const isRunning = runningTaskId === task.id;
              
              return (
                <div
                  key={task.id}
                  onClick={() => setSelectedTaskId(task.id)}
                  className={`p-3.5 border rounded-xl cursor-pointer select-none transition-all ${
                    isSelected 
                      ? 'border-blue-500 bg-blue-50/5 dark:bg-blue-900/10 shadow-sm' 
                      : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0c0c0f] hover:border-zinc-300 dark:hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="block text-xs font-bold text-zinc-950 dark:text-white truncate max-w-[180px]">{task.name}</span>
                    <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full border ${
                      task.status === 'completed' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/10' :
                      task.status === 'running' ? 'bg-blue-500/10 text-blue-600 border-blue-500/10 animate-pulse' :
                      task.status === 'failed' ? 'bg-rose-500/10 text-rose-600 border-rose-500/10' :
                      'bg-zinc-500/10 text-zinc-500 border-zinc-500/10'
                    }`}>
                      {task.status}
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-500 mt-1 truncate">{task.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right column: Active Execution Center panel */}
        <div className="lg:col-span-2 space-y-6">
          {selectedTask ? (
            <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0c0c0f] rounded-xl shadow-sm p-6 space-y-6 relative overflow-hidden">
              
              {/* Task Details Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800/60">
                <div>
                  <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest">Active Workspace Task</span>
                  <h2 className="text-base font-bold text-zinc-950 dark:text-white">{selectedTask.name}</h2>
                  <p className="text-xs text-zinc-500 mt-1 select-text">{selectedTask.description}</p>
                </div>
                
                {selectedTask.status === 'pending' && (
                  <button
                    onClick={() => onRunTask(selectedTask.id)}
                    disabled={runningTaskId !== null}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <Play className="h-4.5 w-4.5" />
                    <span>Run Collaboration</span>
                  </button>
                )}
              </div>

              {/* Real-time Progress Bar */}
              {runningTaskId === selectedTask.id && (
                <div className="space-y-2 bg-blue-500/5 border border-blue-500/10 rounded-lg p-4">
                  <div className="flex items-center justify-between text-xs font-semibold text-blue-600 dark:text-blue-400">
                    <div className="flex items-center gap-1.5 animate-pulse">
                      <Activity className="h-4 w-4" />
                      <span>Executing Multi-Agent Router Loop...</span>
                    </div>
                    <span>{runningTaskProgress}%</span>
                  </div>
                  <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${runningTaskProgress}%` }}
                    />
                  </div>
                </div>
              )}
              {/* Human-in-the-Loop Approval Overlay Card */}
              {runningTaskId === selectedTask.id && approvalData && (
                <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-5 space-y-4 animate-fade-in-up">
                  <div className="flex items-center justify-between border-b border-amber-500/10 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
                      <span className="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest">
                        Human-in-the-Loop Gateway
                      </span>
                    </div>
                    <span className="text-[10px] text-zinc-450 font-mono">
                      Handoff: {approvalData.fromAgentName} → {approvalData.toAgentName}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <label className="font-bold text-zinc-500 block">Proposed Handoff Payload <span className="font-normal text-zinc-400">(Supervisor may override below)</span></label>
                    <textarea
                      value={editablePayload}
                      onChange={e => setEditablePayload(e.target.value)}
                      rows={6}
                      className="w-full bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-amber-500 font-sans leading-relaxed"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 text-xs">
                    <button
                      onClick={onRejectHandoff}
                      className="px-3.5 py-2 border border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-600 dark:text-rose-400 rounded-lg font-semibold cursor-pointer transition-colors"
                    >
                      Reject Handoff
                    </button>
                    <button
                      onClick={() => onApproveHandoff(editablePayload)}
                      className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-bold shadow cursor-pointer transition-colors"
                    >
                      Approve & Continue
                    </button>
                  </div>
                </div>
              )}

              {/* Completed Analytics Overview */}
              {selectedTask.status === 'completed' && (
                <div className="grid grid-cols-3 gap-4 border-b border-zinc-100 dark:border-zinc-800/60 pb-5 text-center text-xs">
                  <div className="space-y-1">
                    <span className="text-[9px] text-zinc-400 uppercase tracking-wider font-semibold flex items-center justify-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-zinc-400" />
                      <span>Duration</span>
                    </span>
                    <span className="block text-base font-bold font-mono text-zinc-950 dark:text-white">
                      {selectedTask.durationMs ? `${(selectedTask.durationMs / 1000).toFixed(1)}s` : 'N/A'}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] text-zinc-400 uppercase tracking-wider font-semibold flex items-center justify-center gap-1">
                      <Coins className="h-3.5 w-3.5 text-zinc-400" />
                      <span>Total Cost</span>
                    </span>
                    <span className="block text-base font-bold font-mono text-zinc-950 dark:text-white">
                      {selectedTask.totalCost ? `$${selectedTask.totalCost.toFixed(5)}` : 'N/A'}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] text-zinc-400 uppercase tracking-wider font-semibold flex items-center justify-center gap-1">
                      <TrendingUp className="h-3.5 w-3.5 text-zinc-400" />
                      <span>Confidence</span>
                    </span>
                    <span className="block text-base font-bold font-mono text-zinc-950 dark:text-white">
                      {selectedTask.confidence ? `${(selectedTask.confidence * 100).toFixed(0)}%` : 'N/A'}
                    </span>
                  </div>
                </div>
              )}

              {/* Execution Trail Log Output */}
              {selectedTask.status !== 'pending' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Collaboration Log Trail</h3>
                    <span className="text-[10px] font-mono text-zinc-400">{selectedTask.steps.length} entries</span>
                  </div>
                  
                  <div className="space-y-3">
                    {selectedTask.steps.map((log, stepIdx) => {
                      const agent = agents.find(a => a.id === log.agentId);
                      const isOrch = log.agentId === "orchestrator";
                      const agentColor = isOrch ? '#2563eb' : (agent?.avatarColor || '#71717a');
                      
                      return (
                        <div
                          key={log.id}
                          className="animate-fade-in-up"
                          style={{ animationDelay: `${stepIdx * 30}ms` }}
                        >
                          {/* Routing/Coordinator Banner */}
                          {log.type === 'routing' && (
                            <div
                              className="p-3 bg-zinc-50 dark:bg-zinc-800/10 border-l-4 border border-zinc-200 dark:border-zinc-800/60 rounded-lg text-xs leading-relaxed font-mono select-text text-zinc-500"
                              style={{ borderLeftColor: '#2563eb' }}
                            >
                              <span className="text-blue-600 dark:text-blue-400 font-bold block mb-1 text-[10px] uppercase tracking-wider">🧠 Coordinator Routing Plan</span>
                              {log.content}
                            </div>
                          )}

                          {/* All other log types */}
                          {log.type !== 'routing' && (
                            <div
                              className="flex gap-3 p-3 rounded-xl border bg-white dark:bg-[#09090b]/60 border-zinc-100 dark:border-zinc-800/60 border-l-4 hover:shadow-sm transition-shadow"
                              style={{ borderLeftColor: agentColor }}
                            >
                              {/* Avatar */}
                              <div
                                className="h-8 w-8 rounded-lg shrink-0 flex items-center justify-center font-bold text-white text-[11px] uppercase shadow-sm mt-0.5"
                                style={{ backgroundColor: agentColor }}
                              >
                                {isOrch ? 'OC' : (log.agentName.split(' ').map(n => n[0]).join(''))}
                              </div>

                              <div className="flex-1 space-y-1.5 text-xs min-w-0">
                                <div className="flex items-baseline gap-2 flex-wrap">
                                  <span className="font-bold text-zinc-950 dark:text-white">{log.agentName}</span>
                                  <span
                                    className="text-[9px] px-1.5 py-0.5 rounded font-semibold uppercase tracking-wider"
                                    style={{ backgroundColor: agentColor + '20', color: agentColor }}
                                  >
                                    {log.type}
                                  </span>
                                  <span className="text-[9px] text-zinc-400 font-mono ml-auto">
                                    {new Date(log.timestamp).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                  </span>
                                </div>

                                {/* Thought */}
                                {log.type === 'thought' && (
                                  <p className="text-zinc-500 dark:text-zinc-400 italic leading-relaxed select-text">
                                    {log.content}
                                  </p>
                                )}

                                {/* Tool Call */}
                                {log.type === 'tool_call' && (
                                  <div className="p-2.5 bg-zinc-50 dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-lg flex items-start gap-2 font-mono text-[11px]">
                                    {getToolIcon(log.metadata?.toolName)}
                                    <div className="space-y-0.5">
                                      <span className="font-semibold text-zinc-500">Tool: {log.metadata?.toolName}</span>
                                      <p className="text-zinc-600 dark:text-zinc-400 select-text">{log.content}</p>
                                    </div>
                                  </div>
                                )}

                                {/* Tool Response */}
                                {log.type === 'tool_response' && (
                                  <div className="p-2.5 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200/50 dark:border-emerald-800/30 rounded-lg flex items-start gap-2 font-mono text-[11px] select-text">
                                    <CornerDownRight className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                                    <pre className="text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap font-mono leading-relaxed">{log.content}</pre>
                                  </div>
                                )}

                                {/* Message / Conclusion */}
                                {(log.type === 'message' || log.type === 'conclusion') && (
                                  <div className="space-y-1.5">
                                    {log.targetAgentName && (
                                      <div className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold uppercase tracking-wider font-mono">
                                        → Handoff to {log.targetAgentName}
                                      </div>
                                    )}
                                    <div className="text-zinc-700 dark:text-zinc-300 leading-relaxed select-text whitespace-pre-wrap">
                                      {log.content}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* Live typing indicator when task is running */}
                    {runningTaskId === selectedTask.id && (
                      <div className="animate-fade-in-up flex gap-3 p-3 rounded-xl border bg-blue-50/50 dark:bg-blue-900/10 border-blue-200/50 dark:border-blue-800/30">
                        <div className="h-8 w-8 rounded-lg shrink-0 flex items-center justify-center bg-blue-600 text-white font-bold text-[11px] shadow-sm">
                          AI
                        </div>
                        <div className="flex items-center gap-1 py-2">
                          <span className="h-2 w-2 rounded-full bg-blue-500 typing-dot" />
                          <span className="h-2 w-2 rounded-full bg-blue-500 typing-dot" />
                          <span className="h-2 w-2 rounded-full bg-blue-500 typing-dot" />
                          <span className="ml-2 text-[11px] text-blue-500 font-medium">Agent thinking...</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Empty state instruction when pending */}
              {selectedTask.status === 'pending' && (
                <div className="border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl p-10 text-center space-y-3">
                  <Play className="h-8 w-8 text-zinc-300 dark:text-zinc-700 mx-auto" />
                  <div className="space-y-1">
                    <span className="block text-xs font-semibold text-zinc-800 dark:text-zinc-200">Task Uninitiated</span>
                    <p className="text-[11px] text-zinc-400 max-w-sm mx-auto">This task is ready for execution. Clicking "Run Collaboration" will trigger the model coordinator to plan, search knowledge docs, execute calculations, and summarize findings.</p>
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="p-12 border border-zinc-200 dark:border-zinc-800 rounded-xl text-center text-zinc-500">
              No task selected. Select or create one from the left sidebar to audit.
            </div>
          )}
        </div>

      </div>

      {/* Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white dark:bg-[#0c0c0f] border border-zinc-250 dark:border-zinc-800 rounded-xl shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-zinc-950 dark:text-white">Create New Task</h3>
                <span className="text-[10px] text-zinc-500">Assign a business problem to the digital employee router.</span>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-850 text-zinc-400 hover:text-zinc-650 rounded-md cursor-pointer"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-zinc-500 block">Task Name</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  placeholder="e.g. Structure Acme Corp Deal"
                  className="w-full bg-[#ffffff] dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-zinc-500 block">Target Department</label>
                <select 
                  value={department} 
                  onChange={e => setDepartment(e.target.value)}
                  className="w-full bg-[#ffffff] dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                >
                  {['Sales', 'Finance', 'Legal', 'Operations', 'Support'].map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-zinc-500 block">Prompt / Description</label>
                <textarea 
                  value={description} 
                  onChange={e => setDescription(e.target.value)} 
                  placeholder="Structure a commercial proposal for Acme Corp asking for a 30% discount on a 3-year contract, and verify if it matches our gross margin targets..."
                  rows={4}
                  className="w-full bg-[#ffffff] dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium leading-relaxed"
                  required
                />
              </div>

              <div className="pt-4 border-t border-zinc-155 dark:border-zinc-800/80 flex items-center justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg text-zinc-700 dark:text-zinc-300 font-medium cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold shadow cursor-pointer transition-colors"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
