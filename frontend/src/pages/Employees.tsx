import React, { useState } from 'react';
import { 
  Plus, 
  X, 
  Sliders, 
  Wrench, 
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { Agent } from '../types/types';

interface EmployeesProps {
  agents: Agent[];
  onCreateAgent: (agent: Omit<Agent, 'id' | 'status' | 'performance'>) => void;
}

export default function Employees({ agents, onCreateAgent }: EmployeesProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(agents[0]?.id || null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Form states
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [department, setDepartment] = useState<Agent['department']>('Sales');
  const [goal, setGoal] = useState('');
  const [backstory, setBackstory] = useState('');
  const [model, setModel] = useState('gemini-1.5-flash');
  const [temperature, setTemperature] = useState(0.4);
  const [instructions, setInstructions] = useState('');
  const [communicationStyle, setCommunicationStyle] = useState('Consultative, structured and concise.');
  const [selectedTools, setSelectedTools] = useState<string[]>([]);

  const availableToolsList = [
    "Database Search",
    "Web Search",
    "CRM Link",
    "Financial Calculator",
    "Document Search",
    "Email Dispatch"
  ];

  const handleToolToggle = (tool: string) => {
    if (selectedTools.includes(tool)) {
      setSelectedTools(prev => prev.filter(t => t !== tool));
    } else {
      setSelectedTools(prev => [...prev, tool]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !role || !goal) {
      showToast('Please fill out Name, Role, and Goal fields.');
      return;
    }

    onCreateAgent({
      name,
      role,
      department,
      goal,
      backstory: backstory || `Specialized AI agent designed for ${role} inside the ${department} department.`,
      model,
      temperature,
      instructions: instructions || `Perform your duties matching the corporate goal: ${goal}.`,
      communicationStyle,
      tools: selectedTools,
      memory: true,
      permissions: ["read_general_db"],
      knowledgeSources: [],
      avatarColor: ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ec4899", "#ef4444"][Math.floor(Math.random() * 6)]
    });

    // Reset states
    setName('');
    setRole('');
    setDepartment('Sales');
    setGoal('');
    setBackstory('');
    setModel('gemini-1.5-flash');
    setTemperature(0.4);
    setInstructions('');
    setSelectedTools([]);
    setIsModalOpen(false);
  };

  const selectedAgent = agents.find(a => a.id === selectedAgentId);

  return (
    <div className="space-y-8">

      {/* Toast notification */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-[100] px-4 py-3 bg-amber-500 text-white text-xs font-semibold rounded-xl shadow-xl flex items-center gap-2">
          <span>⚠️</span><span>{toastMsg}</span>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">AI Employees</h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Configure roles, instruction parameters, and specialized tools for your digital workforce.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-sm flex items-center gap-1.5 cursor-pointer transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Hire Employee</span>
        </button>
      </div>

      {/* Main Layout Grid split: Left menu list (1/3) + Right details profile (2/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Side: Agent List cards */}
        <div className="space-y-3">
          {agents.map((agent) => {
            const isSelected = selectedAgentId === agent.id;
            return (
              <div 
                key={agent.id}
                onClick={() => setSelectedAgentId(agent.id)}
                className={`p-4 border rounded-xl shadow-sm cursor-pointer select-none transition-all ${
                  isSelected 
                    ? 'border-blue-500/80 bg-blue-50/5 dark:bg-blue-900/10' 
                    : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0c0c0f] hover:border-zinc-300 dark:hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="h-9 w-9 rounded-full flex items-center justify-center text-white font-bold text-xs uppercase shadow-sm"
                    style={{ backgroundColor: agent.avatarColor }}
                  >
                    {agent.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="block text-xs font-bold text-zinc-900 dark:text-white truncate">{agent.name}</span>
                    <span className="block text-[10px] text-zinc-500 truncate">{agent.role}</span>
                  </div>
                  {/* Dynamic status indicator */}
                  <div className="relative shrink-0" title={agent.status}>
                    <span
                      className={`h-2.5 w-2.5 rounded-full block ${
                        agent.status === 'working'
                          ? 'bg-amber-400'
                          : agent.status === 'collaborating'
                          ? 'bg-blue-500'
                          : 'bg-emerald-500'
                      }`}
                    />
                    {(agent.status === 'working' || agent.status === 'collaborating') && (
                      <span
                        className={`absolute inset-0 rounded-full animate-ping ${
                          agent.status === 'working' ? 'bg-amber-400' : 'bg-blue-500'
                        }`}
                      />
                    )}
                  </div>
                </div>

                <div className="mt-3.5 flex items-center justify-between text-[9px] font-mono text-zinc-400">
                  <span>{agent.department.toUpperCase()}</span>
                  <span>{agent.model}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Side: Selected Agent detail profile */}
        <div className="lg:col-span-2">
          {selectedAgent ? (
            <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0c0c0f] rounded-xl shadow-sm p-6 space-y-6">
              
              {/* Profile Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-100 dark:border-zinc-800/60">
                <div className="flex items-center gap-4">
                  <div 
                    className="h-14 w-14 rounded-2xl flex items-center justify-center text-white font-extrabold text-lg uppercase shadow"
                    style={{ backgroundColor: selectedAgent.avatarColor }}
                  >
                    {selectedAgent.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-zinc-950 dark:text-white">{selectedAgent.name}</h2>
                    <span className="block text-xs text-zinc-500 font-medium">{selectedAgent.role} • {selectedAgent.department}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 text-xs">
                  <div className="px-2.5 py-1 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/80 rounded-lg text-zinc-600 dark:text-zinc-300 font-mono">
                    Temp: {selectedAgent.temperature}
                  </div>
                  <div className="px-2.5 py-1 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-600 dark:text-blue-400 font-semibold font-mono">
                    {selectedAgent.model}
                  </div>
                </div>
              </div>

              {/* Goal & Backstory */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                <div className="space-y-1.5">
                  <span className="font-semibold text-zinc-400 uppercase tracking-wider text-[10px]">Primary Goal</span>
                  <p className="p-3 bg-zinc-50 dark:bg-[#09090b]/80 border border-zinc-100 dark:border-zinc-800 rounded-lg text-zinc-700 dark:text-zinc-300 leading-relaxed font-normal">
                    {selectedAgent.goal}
                  </p>
                </div>
                <div className="space-y-1.5">
                  <span className="font-semibold text-zinc-400 uppercase tracking-wider text-[10px]">Origin Backstory</span>
                  <p className="p-3 bg-zinc-50 dark:bg-[#09090b]/80 border border-zinc-100 dark:border-zinc-800 rounded-lg text-zinc-700 dark:text-zinc-300 leading-relaxed font-normal">
                    {selectedAgent.backstory}
                  </p>
                </div>
              </div>

              {/* Instructions */}
              <div className="space-y-1.5 text-xs">
                <span className="font-semibold text-zinc-400 uppercase tracking-wider text-[10px] flex items-center gap-1">
                  <Sliders className="h-3.5 w-3.5" />
                  <span>Execution System Instructions</span>
                </span>
                <p className="p-3 bg-zinc-50 dark:bg-[#09090b]/80 border border-zinc-100 dark:border-zinc-800 rounded-lg text-zinc-700 dark:text-zinc-300 leading-relaxed font-normal font-mono text-[11px] whitespace-pre-wrap select-text">
                  {selectedAgent.instructions}
                </p>
              </div>

              {/* Tools & Style */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                <div className="space-y-1.5">
                  <span className="font-semibold text-zinc-400 uppercase tracking-wider text-[10px] flex items-center gap-1">
                    <Wrench className="h-3.5 w-3.5" />
                    <span>Tool Integrations Enabled</span>
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {selectedAgent.tools.length === 0 ? (
                      <span className="text-zinc-500 text-xs italic">No tools configured.</span>
                    ) : (
                      selectedAgent.tools.map((tool, i) => (
                        <span key={i} className="px-2.5 py-1 bg-zinc-50 dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800/80 rounded-lg text-zinc-700 dark:text-zinc-300 font-medium">
                          {tool}
                        </span>
                      ))
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="font-semibold text-zinc-400 uppercase tracking-wider text-[10px] flex items-center gap-1">
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span>Linguistic Style</span>
                  </span>
                  <p className="p-3 bg-zinc-50 dark:bg-[#09090b]/80 border border-zinc-100 dark:border-zinc-800 rounded-lg text-zinc-700 dark:text-zinc-300 leading-relaxed font-normal">
                    {selectedAgent.communicationStyle}
                  </p>
                </div>
              </div>

              {/* Analytics Summary */}
              <div className="pt-5 border-t border-zinc-100 dark:border-zinc-800/60 grid grid-cols-3 gap-4 text-center">
                <div className="space-y-1">
                  <span className="block text-[9px] text-zinc-400 uppercase tracking-wider font-semibold">Total Resolved</span>
                  <span className="text-base font-bold text-zinc-900 dark:text-zinc-100 font-mono">{selectedAgent.performance.tasksCompleted}</span>
                </div>
                <div className="space-y-1">
                  <span className="block text-[9px] text-zinc-400 uppercase tracking-wider font-semibold">Avg Run Time</span>
                  <span className="text-base font-bold text-zinc-900 dark:text-zinc-100 font-mono">{(selectedAgent.performance.avgLatencyMs / 1000).toFixed(1)}s</span>
                </div>
                <div className="space-y-1">
                  <span className="block text-[9px] text-zinc-400 uppercase tracking-wider font-semibold">Cost Incurred</span>
                  <span className="text-base font-bold text-zinc-900 dark:text-zinc-100 font-mono">${selectedAgent.performance.costIncurred.toFixed(4)}</span>
                </div>
              </div>

            </div>
          ) : (
            <div className="p-8 border border-zinc-200 dark:border-zinc-800 rounded-xl text-center text-zinc-500">
              No employee selected.
            </div>
          )}
        </div>

      </div>

      {/* Creation Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-xl bg-white dark:bg-[#0c0c0f] border border-zinc-250 dark:border-zinc-800 rounded-xl shadow-2xl p-6 space-y-5 overflow-y-auto max-h-[90vh]">
            
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-zinc-950 dark:text-white flex items-center gap-1.5">
                  <Sparkles className="h-4.5 w-4.5 text-blue-600" />
                  <span>Hire AI Employee</span>
                </h3>
                <span className="text-[10px] text-zinc-500">Configure parameters to instantiate a dedicated digital staff member.</span>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-850 text-zinc-400 hover:text-zinc-650 rounded-md cursor-pointer"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-zinc-500 block">Full Name</label>
                  <input 
                    type="text" 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    placeholder="e.g. Elena Rostova"
                    className="w-full bg-[#ffffff] dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-zinc-500 block">Job Role Title</label>
                  <input 
                    type="text" 
                    value={role} 
                    onChange={e => setRole(e.target.value)} 
                    placeholder="e.g. Senior Corporate Counsel"
                    className="w-full bg-[#ffffff] dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-zinc-500 block">Department</label>
                  <select 
                    value={department} 
                    onChange={e => setDepartment(e.target.value as Agent['department'])}
                    className="w-full bg-[#ffffff] dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                  >
                    {['Sales', 'Marketing', 'Finance', 'Legal', 'Engineering', 'Operations', 'Support'].map(dep => (
                      <option key={dep} value={dep}>{dep}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-zinc-500 block">Model Integration</label>
                  <select 
                    value={model} 
                    onChange={e => setModel(e.target.value)}
                    className="w-full bg-[#ffffff] dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                  >
                    <option value="gemini-1.5-flash">Gemini 1.5 Flash (Recommended)</option>
                    <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                    <option value="gpt-4o">GPT-4o</option>
                    <option value="claude-3-5-sonnet">Claude 3.5 Sonnet</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="font-semibold text-zinc-500">Model Temperature</label>
                  <span className="font-mono text-zinc-400 font-medium">{temperature}</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="1.0" 
                  step="0.05"
                  value={temperature} 
                  onChange={e => setTemperature(parseFloat(e.target.value))}
                  className="w-full accent-blue-600 h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-zinc-500 block">Primary KPI Goal</label>
                <textarea 
                  value={goal} 
                  onChange={e => setGoal(e.target.value)} 
                  placeholder="e.g. Conduct compliance contract reviews, flag discount limits violations..."
                  rows={2}
                  className="w-full bg-[#ffffff] dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-zinc-500 block">Instructional System Prompts</label>
                <textarea 
                  value={instructions} 
                  onChange={e => setInstructions(e.target.value)} 
                  placeholder="e.g. Enforce strict SLA templates. Audit discount margins and cross reference with guidelines..."
                  rows={3}
                  className="w-full bg-[#ffffff] dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium font-mono text-[11px]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-zinc-500 block">Tool Integration Access</label>
                <div className="grid grid-cols-3 gap-2.5 p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800/80 rounded-lg">
                  {availableToolsList.map((tool) => {
                    const isChecked = selectedTools.includes(tool);
                    return (
                      <label key={tool} className="flex items-center gap-2 font-medium text-zinc-700 dark:text-zinc-300 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={isChecked} 
                          onChange={() => handleToolToggle(tool)}
                          className="h-3.5 w-3.5 rounded border-zinc-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                        <span>{tool}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-150 dark:border-zinc-800/80 flex items-center justify-end gap-3">
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
                  Hire Employee
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
