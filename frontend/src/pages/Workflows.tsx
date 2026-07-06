import { useState, useRef, useEffect, useCallback } from 'react';
import { 
  GitFork, 
  Plus, 
  X, 
  Sparkles,
  Play,
  CheckCircle2
} from 'lucide-react';
import { Workflow, Agent, Task } from '../types/types';

interface WorkflowsProps {
  workflows: Workflow[];
  agents: Agent[];
  tasks: Task[];
  onCreateWorkflow: (name: string, description: string, nodeIds: string[]) => void;
  onNavigate: (page: string) => void;
}

export default function Workflows({ workflows, agents, tasks, onCreateWorkflow, onNavigate }: WorkflowsProps) {
  const [selectedWfId, setSelectedWfId] = useState<string | null>(workflows[0]?.id || null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedAgentIds, setSelectedAgentIds] = useState<string[]>([]);

  // Refs for DOM-measured SVG connector lines
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const [connections, setConnections] = useState<{ x1: number; y1: number; x2: number; y2: number }[]>([]);

  const selectedWf = workflows.find(w => w.id === selectedWfId);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Measure node card positions relative to canvas and compute bezier connector coords
  const measureNodes = useCallback(() => {
    if (!canvasRef.current) return;
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const newConns: { x1: number; y1: number; x2: number; y2: number }[] = [];

    for (let i = 0; i < nodeRefs.current.length - 1; i++) {
      const fromEl = nodeRefs.current[i];
      const toEl = nodeRefs.current[i + 1];
      if (!fromEl || !toEl) continue;

      const fromRect = fromEl.getBoundingClientRect();
      const toRect = toEl.getBoundingClientRect();

      newConns.push({
        x1: fromRect.right - canvasRect.left,
        y1: fromRect.top - canvasRect.top + fromRect.height / 2,
        x2: toRect.left - canvasRect.left,
        y2: toRect.top - canvasRect.top + toRect.height / 2,
      });
    }
    setConnections(newConns);
  }, [selectedWfId]);

  useEffect(() => {
    nodeRefs.current = [];
    const t = setTimeout(measureNodes, 100);
    window.addEventListener('resize', measureNodes);
    return () => { clearTimeout(t); window.removeEventListener('resize', measureNodes); };
  }, [selectedWfId, measureNodes]);

  const handleAgentToggle = (agentId: string) => {
    setSelectedAgentIds(prev =>
      prev.includes(agentId) ? prev.filter(id => id !== agentId) : [...prev, agentId]
    );
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || selectedAgentIds.length < 2) {
      showToast('Please enter a name and select at least 2 agents.');
      return;
    }
    onCreateWorkflow(name, description, selectedAgentIds);
    setName(''); setDescription(''); setSelectedAgentIds([]);
    setIsModalOpen(false);
  };

  const completedTaskCount = tasks.filter(t => t.status === 'completed').length;

  return (
    <div className="space-y-8">

      {/* Toast notification */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-[100] px-4 py-3 bg-amber-500 text-white text-xs font-semibold rounded-xl shadow-xl flex items-center gap-2">
          <span>⚠️</span><span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">Workflow Pipeline Studio</h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Design multi-agent processing topologies. Define how intelligence flows through departments.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-sm flex items-center gap-1.5 cursor-pointer transition-colors"
        >
          <Plus className="h-4 w-4" /><span>Create Pipeline</span>
        </button>
      </div>

      {/* Split layout: Pipeline list (1/3) + Canvas (2/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

        {/* Left: Pipeline list */}
        <div className="space-y-3">
          {workflows.length === 0 && (
            <div className="p-6 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl text-center text-xs text-zinc-500">
              No pipelines yet. Click "Create Pipeline" to design your first workflow.
            </div>
          )}
          {workflows.map((wf) => {
            const isSelected = selectedWfId === wf.id;
            const wfAgents = wf.nodes.map(id => agents.find(a => a.id === id)).filter(Boolean) as Agent[];
            return (
              <div
                key={wf.id}
                onClick={() => setSelectedWfId(wf.id)}
                className={`p-4 border rounded-xl cursor-pointer select-none transition-all ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50/5 dark:bg-blue-900/10 shadow-sm'
                    : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0c0c0f] hover:border-zinc-300 dark:hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="h-7 w-7 rounded bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
                    <GitFork className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="block text-xs font-bold text-zinc-950 dark:text-white truncate">{wf.name}</span>
                    <span className="block text-[10px] text-zinc-500">{wf.nodes.length} agent nodes</span>
                  </div>
                </div>
                {/* Agent color dot row */}
                <div className="flex items-center gap-1 mb-2">
                  {wfAgents.map(a => (
                    <span
                      key={a.id}
                      className="h-2.5 w-2.5 rounded-full border border-white/50 dark:border-zinc-900"
                      style={{ backgroundColor: a.avatarColor }}
                      title={a.name}
                    />
                  ))}
                  <span className="text-[9px] text-zinc-400 ml-1 font-mono">{wf.connections.length} connections</span>
                </div>
                <p className="text-[10px] text-zinc-500 line-clamp-2">{wf.description}</p>
              </div>
            );
          })}
        </div>

        {/* Right: Canvas visualizer */}
        <div className="lg:col-span-2">
          {selectedWf ? (
            <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0c0c0f] rounded-xl shadow-sm overflow-hidden flex flex-col min-h-[480px]">

              {/* Canvas header */}
              <div className="p-4 border-b border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-zinc-950 dark:text-white">{selectedWf.name}</h3>
                  <span className="text-[10px] text-zinc-500 block mt-0.5">{selectedWf.description}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-zinc-400 font-mono">{completedTaskCount} tasks completed</span>
                  <button
                    onClick={() => onNavigate('tasks')}
                    className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[10px] font-semibold cursor-pointer flex items-center gap-1 transition-colors shadow-sm"
                  >
                    <Play className="h-3 w-3" /><span>Run Task</span>
                  </button>
                </div>
              </div>

              {/* Flowchart canvas — ref-measured SVG connectors */}
              <div
                ref={canvasRef}
                className="flex-1 bg-grid-dots p-10 relative flex flex-col md:flex-row items-center justify-center gap-8 min-h-[320px]"
              >
                {/* SVG layer drawn on top of nodes with measured positions */}
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none select-none"
                  style={{ overflow: 'visible' }}
                >
                  <defs>
                    <marker id="arr" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                      <polygon points="0 0, 8 3, 0 6" fill="#3b82f6" opacity="0.9" />
                    </marker>
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="2" result="blur" />
                      <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                    </filter>
                  </defs>

                  {connections.map((c, i) => {
                    const mx = (c.x1 + c.x2) / 2;
                    const d = `M ${c.x1} ${c.y1} C ${mx} ${c.y1}, ${mx} ${c.y2}, ${c.x2} ${c.y2}`;
                    return (
                      <g key={i}>
                        <path d={d} fill="none" stroke="#e4e4e7" strokeWidth="2" className="dark:stroke-zinc-700" />
                        <path
                          d={d} fill="none" stroke="#3b82f6" strokeWidth="2.5"
                          strokeLinecap="round" strokeDasharray="6 6"
                          className="animate-flow-line"
                          markerEnd="url(#arr)" filter="url(#glow)" opacity="0.85"
                        />
                      </g>
                    );
                  })}
                </svg>

                {/* Node cards with DOM refs */}
                {selectedWf.nodes.map((agentId, index) => {
                  const agent = agents.find(a => a.id === agentId);
                  if (!agent) return null;
                  return (
                    <React.Fragment key={agent.id}>
                      <div
                        ref={el => { nodeRefs.current[index] = el; }}
                        className="relative z-10 w-44 p-4 border-2 rounded-xl shadow-lg text-center space-y-3 bg-white dark:bg-[#0c0c0f] hover:shadow-xl transition-all"
                        style={{ borderColor: agent.avatarColor + '60' }}
                      >
                        {/* Step badge */}
                        <div
                          className="absolute -top-3 -left-3 h-6 w-6 rounded-full text-white text-[10px] font-extrabold flex items-center justify-center shadow-md"
                          style={{ backgroundColor: agent.avatarColor }}
                        >
                          {index + 1}
                        </div>

                        {/* Avatar + status pulse */}
                        <div className="relative mx-auto w-fit">
                          <div
                            className="h-12 w-12 rounded-xl flex items-center justify-center text-white font-bold text-sm uppercase shadow-sm"
                            style={{ backgroundColor: agent.avatarColor }}
                          >
                            {agent.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          {agent.status === 'collaborating' && (
                            <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-blue-500 animate-ping" />
                          )}
                        </div>

                        <div>
                          <span className="block text-xs font-bold text-zinc-950 dark:text-white truncate">{agent.name}</span>
                          <span className="block text-[9px] text-zinc-500 truncate mt-0.5">{agent.role}</span>
                        </div>

                        <div
                          className="pt-2 border-t text-[9px] font-bold font-mono tracking-wider"
                          style={{ borderColor: agent.avatarColor + '40', color: agent.avatarColor }}
                        >
                          {agent.department.toUpperCase()}
                        </div>
                      </div>

                      {/* Mobile arrow */}
                      {index < selectedWf.nodes.length - 1 && (
                        <div className="md:hidden flex flex-col items-center py-2">
                          <svg viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5" className="h-5 w-5 animate-bounce">
                            <path d="M12 5v14M19 12l-7 7-7-7" />
                          </svg>
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>

              {/* Footer status bar */}
              <div className="p-4 bg-zinc-50 dark:bg-[#09090b]/60 border-t border-zinc-100 dark:border-zinc-800/60 text-[10px] font-mono flex items-center justify-between">
                <div className="flex items-center gap-3 text-zinc-400">
                  <span>{selectedWf.nodes.length} nodes</span>
                  <span className="opacity-40">•</span>
                  <span>{selectedWf.connections.length} connections</span>
                </div>
                <span className="text-emerald-500 font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="h-3 w-3" /><span>TOPOLOGY VERIFIED</span>
                </span>
              </div>

            </div>
          ) : (
            <div className="p-12 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl text-center text-zinc-500">
              No pipeline selected.
            </div>
          )}
        </div>

      </div>

      {/* Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-zinc-950 dark:text-white flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-blue-600" /><span>Create Pipeline</span>
                </h3>
                <span className="text-[10px] text-zinc-500">Define routing order for multi-agent tasks.</span>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 rounded-md cursor-pointer">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-zinc-500 block">Pipeline Name</label>
                <input
                  type="text" value={name} onChange={e => setName(e.target.value)}
                  placeholder="e.g. Risk Assessment Audit" required
                  className="w-full bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-zinc-500 block">Description</label>
                <textarea
                  value={description} onChange={e => setDescription(e.target.value)}
                  placeholder="Orchestrates analytical audits from research data models into risk matrices..." rows={2}
                  className="w-full bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-zinc-500 block">
                  Connect Nodes <span className="text-zinc-400 font-normal">(Select 2+ in execution order)</span>
                </label>
                <div className="space-y-2 p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg max-h-[160px] overflow-y-auto">
                  {agents.map((agent) => {
                    const idx = selectedAgentIds.indexOf(agent.id);
                    const isSel = idx !== -1;
                    return (
                      <div
                        key={agent.id} onClick={() => handleAgentToggle(agent.id)}
                        className={`p-2 rounded-lg border text-xs font-semibold cursor-pointer select-none flex items-center justify-between transition-colors ${
                          isSel
                            ? 'bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400'
                            : 'bg-white dark:bg-[#0c0c0f] border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: agent.avatarColor }} />
                          <span>{agent.name} <span className="font-normal text-zinc-400">({agent.department})</span></span>
                        </div>
                        {isSel && (
                          <span className="h-5 w-5 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-[10px] shrink-0">
                            {idx + 1}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
                {selectedAgentIds.length > 0 && (
                  <p className="text-[10px] text-blue-600 dark:text-blue-400 font-medium">
                    Route: {selectedAgentIds.map(id => agents.find(a => a.id === id)?.name).filter(Boolean).join(' → ')}
                  </p>
                )}
              </div>

              <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg text-zinc-700 dark:text-zinc-300 font-medium cursor-pointer transition-colors">
                  Cancel
                </button>
                <button type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold shadow cursor-pointer transition-colors">
                  Create Pipeline
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
