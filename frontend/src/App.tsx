import { useState, useEffect, useRef } from 'react';
import { Agent, Task, Workflow, KnowledgeSource, ApiKeys, AnalyticsData, StepLog } from './types/types';
import Sidebar from './components/Sidebar';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Tasks from './pages/Tasks';
import Workflows from './pages/Workflows';
import Conversations from './pages/Conversations';
import KnowledgeBase from './pages/KnowledgeBase';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import { executeAgentWorkflow } from './services/gemini';
import confetti from 'canvas-confetti';

// ----------------------------------------------------
// DEFAULT DEMO DATA
// ----------------------------------------------------
const DEFAULT_AGENTS: Agent[] = [
  {
    id: "agent-sales",
    name: "Sarah Jenkins",
    role: "Senior Enterprise Sales Director",
    department: "Sales",
    goal: "Qualify enterprise accounts, construct business cases, and draft customized commercial proposals.",
    backstory: "Former Director of Business Development at Stripe and Snowflake. Specialist in high-value enterprise sales pipelines, B2B deal structuring, and ROI calculations.",
    tools: ["CRM Link", "Database Search", "Web Search"],
    memory: true,
    model: "gemini-1.5-flash",
    temperature: 0.4,
    instructions: "Maintain a client-focused, numbers-driven, and consultative tone. Always outline key business pain points and quantify ROI in deal structures.",
    permissions: ["read_client_db", "write_sales_pipeline"],
    knowledgeSources: ["Enterprise Sales Book 2026", "Corporate Pricing Tiers"],
    communicationStyle: "Consultative, numbers-focused, and corporate professional.",
    status: "idle",
    performance: { tasksCompleted: 42, avgLatencyMs: 3400, successRate: 0.98, tokensUsed: 145000, costIncurred: 0.082 } ,
    avatarColor: "#3b82f6" // blue
  },
  {
    id: "agent-finance",
    name: "David Vance",
    role: "Principal Financial Analyst",
    department: "Finance",
    goal: "Verify margin compliance, perform pricing structures validation, and audits.",
    backstory: "Ex-Deloitte Advisory Lead. Expert in corporate cost modeling, discount approval policies, margin thresholds, and financial compliance audits.",
    tools: ["Financial Calculator", "Database Search"],
    memory: true,
    model: "gemini-1.5-flash",
    temperature: 0.1,
    instructions: "Extremely detail-oriented. Enforce corporate margin guidelines (never go below 68% gross margin without approval) and flag discount violations immediately.",
    permissions: ["read_revenue_db", "write_invoices"],
    knowledgeSources: ["2026 Fiscal Guidelines", "Discount Rulesheet"],
    communicationStyle: "Concise, analytical, and highly structured.",
    status: "idle",
    performance: { tasksCompleted: 38, avgLatencyMs: 2900, successRate: 1.0, tokensUsed: 98000, costIncurred: 0.045 },
    avatarColor: "#10b981" // green
  },
  {
    id: "agent-legal",
    name: "Elena Rostova",
    role: "Senior Corporate Legal Counsel",
    department: "Legal",
    goal: "Conduct commercial contract audits, generate liability clauses, and identify regulatory and legal compliance risks.",
    backstory: "JD from Stanford. 8 years managing commercial transactions and SLA indemnification structures for Vercel and Linear.",
    tools: ["Document Search", "Web Search"],
    memory: true,
    model: "gemini-1.5-flash",
    temperature: 0.2,
    instructions: "Verify contract liabilities, verify SLA definitions, audit data privacy limits (GDPR/SOC2), and always write structured compliance assessments.",
    permissions: ["read_contracts_vault", "write_disclaimers"],
    knowledgeSources: ["SLA Framework V4", "Standard Liability Templates"],
    communicationStyle: "Formal, precise, protective, and legally structured.",
    status: "idle",
    performance: { tasksCompleted: 24, avgLatencyMs: 4200, successRate: 0.95, tokensUsed: 112000, costIncurred: 0.063 },
    avatarColor: "#8b5cf6" // purple
  },
  {
    id: "agent-support",
    name: "Marcus Chen",
    role: "Lead Support & Onboarding Engineer",
    department: "Support",
    goal: "Construct technical client onboarding plans, draft guides, and resolve SLA tickets.",
    backstory: "Former Lead Technical Account Manager at AWS. Passionate about developers' onboarding UX, API integrations, and SLA-compliant solution designs.",
    tools: ["CRM Link", "Email Dispatch", "Database Search"],
    memory: true,
    model: "gemini-1.5-flash",
    temperature: 0.5,
    instructions: "Always outline step-by-step developer integration instructions. Maintain an empathetic, professional support tone.",
    permissions: ["read_support_tickets", "write_support_kb"],
    knowledgeSources: ["API Integration Docs V2", "Customer Success Guidelines"],
    communicationStyle: "Empathetic, structured, clear, and action-oriented.",
    status: "idle",
    performance: { tasksCompleted: 61, avgLatencyMs: 2600, successRate: 0.97, tokensUsed: 168000, costIncurred: 0.091 },
    avatarColor: "#f59e0b" // amber
  }
];

const DEFAULT_WORKFLOWS: Workflow[] = [
  {
    id: "wf-enterprise-proposal",
    name: "Enterprise Contract Onboarding Pipeline",
    description: "Orchestrates proposal generation, margin approvals, legal compliance reviews, and customer onboarding roadmap construction.",
    nodes: ["agent-sales", "agent-finance", "agent-legal", "agent-support"],
    connections: [
      { source: "agent-sales", target: "agent-finance" },
      { source: "agent-finance", target: "agent-legal" },
      { source: "agent-legal", target: "agent-support" }
    ],
    status: "idle"
  },
  {
    id: "wf-lead-enrichment",
    name: "Lead Qualification & Analysis Pipeline",
    description: "Routes newly captured leads for profile enrichment, CRM logging, and competitive threat assessment.",
    nodes: ["agent-sales", "agent-support"],
    connections: [
      { source: "agent-sales", target: "agent-support" }
    ],
    status: "idle"
  }
];

const DEFAULT_TASKS: Task[] = [
  {
    id: "task-demo-1",
    name: "Prepare Acme Corp Proposal",
    description: "Structure a commercial proposal for Acme Corp asking for a 30% discount on a 3-year, $100k/year contract, including SLA details.",
    status: "completed",
    department: "Sales",
    assignedAgentId: "agent-sales",
    createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(), // 2 days ago
    completedAt: new Date(Date.now() - 3600000 * 24 * 2 + 15000).toISOString(),
    totalTokens: 14500,
    totalCost: 0.0035,
    durationMs: 14200,
    confidence: 0.98,
    inputText: "Structure a commercial proposal for Acme Corp...",
    outputText: "Acme Corp Proposal:\n1. Pricing: Approved at $70,000/year (30% discount applied. 3-year term matches fiscal threshold, 70% Gross Margin secured).\n2. Legal: Liability capped at 1x contract value. Support SLA commits to 99.9% uptime with 4-hour response.\n3. Onboarding: API integration scheduled for Week 1, CRM workspace syncing in Week 2.",
    steps: []
  },
  {
    id: "task-demo-2",
    name: "Analyze Competitor Pricing Plans",
    description: "Scan competitor pricing models for API access and suggest discount adjustments.",
    status: "completed",
    department: "Finance",
    assignedAgentId: "agent-finance",
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(), // 1 day ago
    completedAt: new Date(Date.now() - 3600000 * 24 + 8000).toISOString(),
    totalTokens: 8900,
    totalCost: 0.0018,
    durationMs: 8200,
    confidence: 0.95,
    inputText: "Scan competitor pricing...",
    outputText: "Competitor Pricing Audit:\n- Competitor A charges $0.0015/API call.\n- Competitor B charges $150/seat.\n- Recommendation: Maintain a flat margin target and offer volume-tiered credits instead of standard flat discount sheets.",
    steps: []
  }
];

const DEFAULT_KNOWLEDGE: KnowledgeSource[] = [
  {
    id: "kb-fiscal",
    name: "2026 Fiscal Guidelines & Margins.pdf",
    type: "pdf",
    sizeBytes: 1240000,
    searchable: true,
    description: "Approved corporate budgeting policies, minimum gross margin requirements, and audit protocols.",
    uploadedAt: new Date(Date.now() - 3600000 * 24 * 10).toISOString()
  },
  {
    id: "kb-sla",
    name: "SLA Framework V4.docx",
    type: "docx",
    sizeBytes: 85000,
    searchable: true,
    description: "Service Level Agreement guarantees, target response times, and contract liabilities templates.",
    uploadedAt: new Date(Date.now() - 3600000 * 24 * 9).toISOString()
  },
  {
    id: "kb-leads",
    name: "Q2 Enterprise Leads Pipeline.csv",
    type: "csv",
    sizeBytes: 25600,
    searchable: true,
    description: "CSV containing potential pilot signups, ARR targets, and client contacts.",
    uploadedAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString()
  }
];

export default function App() {
  const [currentPage, setCurrentPage] = useState<string>('landing');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [apiKeys, setApiKeys] = useState<ApiKeys>(() => {
    const saved = localStorage.getItem('agenthub_apikeys');
    return saved ? JSON.parse(saved) : { openai: '', anthropic: '', google: '', groq: '', openrouter: '' };
  });

  const [agents, setAgents] = useState<Agent[]>(() => {
    const saved = localStorage.getItem('agenthub_agents');
    return saved ? JSON.parse(saved) : DEFAULT_AGENTS;
  });

  const [workflows, setWorkflows] = useState<Workflow[]>(() => {
    const saved = localStorage.getItem('agenthub_workflows');
    return saved ? JSON.parse(saved) : DEFAULT_WORKFLOWS;
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('agenthub_tasks');
    return saved ? JSON.parse(saved) : DEFAULT_TASKS;
  });

  const [knowledgeSources, setKnowledgeSources] = useState<KnowledgeSource[]>(() => {
    const saved = localStorage.getItem('agenthub_knowledge');
    return saved ? JSON.parse(saved) : DEFAULT_KNOWLEDGE;
  });

  // Keep track of active task execution details
  const [runningTaskId, setRunningTaskId] = useState<string | null>(null);
  const [runningTaskProgress, setRunningTaskProgress] = useState<number>(0);
  const [executionLogs, setExecutionLogs] = useState<StepLog[]>([]);
  const [hasBackendKey, setHasBackendKey] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [isHitlEnabled, setIsHitlEnabled] = useState<boolean>(true);
  const [approvalData, setApprovalData] = useState<{ fromAgentName: string; toAgentName: string; payload: string } | null>(null);
  const approvalResolverRef = useRef<((value: string) => void) | null>(null);
  const approvalRejecterRef = useRef<((reason: any) => void) | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleApproveHandoff = (updatedPayload: string) => {
    if (approvalResolverRef.current) {
      approvalResolverRef.current(updatedPayload);
      setApprovalData(null);
    }
  };

  const handleRejectHandoff = () => {
    if (approvalRejecterRef.current) {
      approvalRejecterRef.current(new Error("Handoff rejected by supervisor."));
      setApprovalData(null);
    }
  };




  // Check backend configuration on mount
  useEffect(() => {
    const checkBackendConfig = async () => {
      try {
        const response = await fetch('/api/config');
        if (response.ok) {
          const config = await response.json();
          setHasBackendKey(config.hasGeminiKey);
        }
      } catch (err) {
        console.warn("Could not check backend configuration status.", err);
      }
    };
    checkBackendConfig();
  }, []);

  // Apply theme class to HTML element
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('agenthub_apikeys', JSON.stringify(apiKeys));
  }, [apiKeys]);

  useEffect(() => {
    localStorage.setItem('agenthub_agents', JSON.stringify(agents));
  }, [agents]);

  useEffect(() => {
    localStorage.setItem('agenthub_workflows', JSON.stringify(workflows));
  }, [workflows]);

  useEffect(() => {
    localStorage.setItem('agenthub_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('agenthub_knowledge', JSON.stringify(knowledgeSources));
  }, [knowledgeSources]);

  // ----------------------------------------------------
  // EVENT HANDLERS
  // ----------------------------------------------------
  const toggleTheme = () => {
    setTheme(t => t === 'dark' ? 'light' : 'dark');
  };

  const handleUpdateKeys = (keys: ApiKeys) => {
    setApiKeys(keys);
  };

  const handleCreateAgent = (newAgent: Omit<Agent, 'id' | 'status' | 'performance'>) => {
    const agent: Agent = {
      ...newAgent,
      id: `agent-${Math.random().toString(36).substring(7)}`,
      status: 'idle',
      performance: {
        tasksCompleted: 0,
        avgLatencyMs: 0,
        successRate: 1.0,
        tokensUsed: 0,
        costIncurred: 0,
      }
    };
    setAgents(prev => [agent, ...prev]);
  };

  const handleCreateTask = (name: string, description: string, department: string) => {
    const newTask: Task = {
      id: `task-${Math.random().toString(36).substring(7)}`,
      name,
      description,
      status: 'pending',
      department,
      createdAt: new Date().toISOString(),
      steps: []
    };
    setTasks(prev => [newTask, ...prev]);
    return newTask;
  };

  // Launch the live multi-agent collaborative execution
  const handleRunTask = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    // Check if API key is configured
    const apiKey = apiKeys.google || apiKeys.openai; 
    if (!apiKey && !hasBackendKey) {
      showToast("Missing API Key! Please configure GEMINI_API_KEY in backend/.env or enter one in Settings.");
      setCurrentPage('settings');
      return;
    }

    setRunningTaskId(taskId);
    setRunningTaskProgress(5);
    setExecutionLogs([]);

    // Update task status in list
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'running', steps: [] } : t));

    // Update affected agent statuses
    setAgents(prev => prev.map(a => ({ ...a, status: 'collaborating' })));

    try {
      const result = await executeAgentWorkflow(
        task,
        agents,
        apiKey,
        (step) => {
          setExecutionLogs(prev => [...prev, step]);
          setTasks(prev => prev.map(t => {
            if (t.id === taskId) {
              return { ...t, steps: [...(t.steps || []), step] };
            }
            return t;
          }));
        },
        (progress) => {
          setRunningTaskProgress(progress);
        },
        isHitlEnabled ? (data) => {
          return new Promise<string>((resolve, reject) => {
            setApprovalData(data);
            approvalResolverRef.current = resolve;
            approvalRejecterRef.current = reject;
          });
        } : undefined
      );


      // Task completed successfully
      setTasks(prev => prev.map(t => {
        if (t.id === taskId) {
          return {
            ...t,
            status: 'completed',
            outputText: result.output,
            totalTokens: result.totalTokens,
            totalCost: result.totalCost,
            durationMs: result.durationMs,
            completedAt: new Date().toISOString(),
            confidence: 0.96
          };
        }
        return t;
      }));

      // Update agent stats
      const stepsByAgent = executionLogs.reduce((acc: any, log) => {
        if (log.agentId !== "orchestrator") {
          acc[log.agentId] = (acc[log.agentId] || 0) + 1;
        }
        return acc;
      }, {});

      setAgents(prev => prev.map(a => {
        const involvedCount = stepsByAgent[a.id] || 0;
        if (involvedCount > 0) {
          return {
            ...a,
            status: 'idle',
            performance: {
              tasksCompleted: a.performance.tasksCompleted + 1,
              avgLatencyMs: Math.round((a.performance.avgLatencyMs + result.durationMs / 3) / 2),
              successRate: 0.98,
              tokensUsed: a.performance.tokensUsed + Math.round(result.totalTokens / 3),
              costIncurred: parseFloat((a.performance.costIncurred + result.totalCost / 3).toFixed(5))
            }
          };
        }
        return { ...a, status: 'idle' };
      }));

      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.8 }
      });

    } catch (err: any) {
      console.error(err);
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'failed', outputText: `Execution failed: ${err.message}` } : t));
      setAgents(prev => prev.map(a => ({ ...a, status: 'idle' })));
    } finally {
      setRunningTaskId(null);
      setApprovalData(null);
      approvalResolverRef.current = null;
      approvalRejecterRef.current = null;
    }

  };

  const handleCreateWorkflow = (name: string, description: string, nodeIds: string[]) => {
    // Generate connections based on ordered nodes
    const connections: Workflow['connections'] = [];
    for (let i = 0; i < nodeIds.length - 1; i++) {
      connections.push({ source: nodeIds[i], target: nodeIds[i + 1] });
    }

    const newWf: Workflow = {
      id: `wf-${Math.random().toString(36).substring(7)}`,
      name,
      description,
      nodes: nodeIds,
      connections,
      status: 'idle'
    };
    setWorkflows(prev => [newWf, ...prev]);
  };

  const handleAddKnowledge = (name: string, type: KnowledgeSource['type'], description: string, size: number) => {
    const newK: KnowledgeSource = {
      id: `kb-${Math.random().toString(36).substring(7)}`,
      name,
      type,
      sizeBytes: size,
      searchable: true,
      description,
      uploadedAt: new Date().toISOString()
    };
    setKnowledgeSources(prev => [newK, ...prev]);
  };

  // ----------------------------------------------------
  // COMPUTED STATS FOR ANALYTICS
  // ----------------------------------------------------
  const computeAnalytics = (): AnalyticsData => {
    const completed = tasks.filter(t => t.status === 'completed');
    const totalCost = parseFloat((tasks.reduce((sum, t) => sum + (t.totalCost || 0), 0) + agents.reduce((sum, a) => sum + a.performance.costIncurred, 0)).toFixed(4));
    const tokenUsage = tasks.reduce((sum, t) => sum + (t.totalTokens || 0), 0) + agents.reduce((sum, a) => sum + a.performance.tokensUsed, 0);
    const avgLatency = completed.length > 0 ? Math.round(completed.reduce((sum, t) => sum + (t.durationMs || 0), 0) / completed.length) : 3100;

    return {
      totalTasks: tasks.length,
      completedTasks: completed.length,
      activeAgents: agents.filter(a => a.status !== 'paused').length,
      averageResponseTimeMs: avgLatency,
      totalCost,
      tokenUsage,
      satisfactionRate: 97.4,
      costHistory: [
        { date: 'Jun 29', value: totalCost * 0.4 },
        { date: 'Jun 30', value: totalCost * 0.5 },
        { date: 'Jul 01', value: totalCost * 0.65 },
        { date: 'Jul 02', value: totalCost * 0.72 },
        { date: 'Jul 03', value: totalCost * 0.8 },
        { date: 'Jul 04', value: totalCost * 0.92 },
        { date: 'Jul 05', value: totalCost },
      ],
      latencyHistory: [
        { date: 'Jun 29', value: avgLatency * 1.1 },
        { date: 'Jun 30', value: avgLatency * 1.05 },
        { date: 'Jul 01', value: avgLatency * 0.98 },
        { date: 'Jul 02', value: avgLatency * 1.02 },
        { date: 'Jul 03', value: avgLatency * 0.95 },
        { date: 'Jul 04', value: avgLatency },
        { date: 'Jul 05', value: avgLatency * 0.97 },
      ],
      taskHistory: [
        { date: 'Jun 29', completed: 8, failed: 0 },
        { date: 'Jun 30', completed: 12, failed: 1 },
        { date: 'Jul 01', completed: 15, failed: 0 },
        { date: 'Jul 02', completed: 11, failed: 0 },
        { date: 'Jul 03', completed: 19, failed: 1 },
        { date: 'Jul 04', completed: 22, failed: 0 },
        { date: 'Jul 05', completed: completed.length, failed: tasks.filter(t => t.status === 'failed').length },
      ]
    };
  };

  const analytics = computeAnalytics();

  // Render Page Content Switcher
  const renderContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard 
          agents={agents} 
          tasks={tasks} 
          analytics={analytics} 
          onNavigate={setCurrentPage} 
        />;
      case 'employees':
        return <Employees 
          agents={agents} 
          onCreateAgent={handleCreateAgent} 
        />;
      case 'tasks':
        return <Tasks 
          tasks={tasks} 
          agents={agents} 
          runningTaskId={runningTaskId}
          runningTaskProgress={runningTaskProgress}
          executionLogs={executionLogs}
          onCreateTask={handleCreateTask} 
          onRunTask={handleRunTask} 
          isHitlEnabled={isHitlEnabled}
          onToggleHitl={() => setIsHitlEnabled(!isHitlEnabled)}
          approvalData={approvalData}
          onApproveHandoff={handleApproveHandoff}
          onRejectHandoff={handleRejectHandoff}
        />;
      case 'workflows':
        return <Workflows 
          workflows={workflows} 
          agents={agents} 
          tasks={tasks}
          onCreateWorkflow={handleCreateWorkflow} 
          onNavigate={setCurrentPage}
        />;
      case 'conversations':
        return <Conversations 
          tasks={tasks} 
          agents={agents} 
        />;
      case 'knowledge':
        return <KnowledgeBase 
          knowledge={knowledgeSources} 
          agents={agents}
          onAddKnowledge={handleAddKnowledge} 
        />;
      case 'analytics':
        return <Analytics 
          analytics={analytics} 
          agents={agents}
        />;
      case 'settings':
        return <Settings 
          apiKeys={apiKeys} 
          onUpdateKeys={handleUpdateKeys} 
        />;
      default:
        return <Dashboard 
          agents={agents} 
          tasks={tasks} 
          analytics={analytics} 
          onNavigate={setCurrentPage} 
        />;
    }
  };

  // If on Landing Page, render full screen Landing Page (without Sidebar wrapper)
  if (currentPage === 'landing') {
    return <LandingPage onEnterDashboard={() => setCurrentPage('dashboard')} theme={theme} onToggleTheme={toggleTheme} />;
  }

  const isKeyMissing = !apiKeys.google && !apiKeys.openai && !hasBackendKey;

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-50 text-zinc-900 dark:bg-[#09090b] dark:text-zinc-100 font-sans">
      
      {/* Toast notification */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-[100] px-4 py-3 bg-amber-500 text-white text-xs font-semibold rounded-xl shadow-lg flex items-center gap-2 animate-bounce">
          <span>⚠️</span><span>{toastMsg}</span>
        </div>
      )}

      
      {/* Sidebar Navigation */}
      <Sidebar 
        currentPage={currentPage} 
        onNavigate={setCurrentPage} 
        theme={theme} 
        onToggleTheme={toggleTheme}
        isKeyWarning={isKeyMissing}
        runningTaskId={runningTaskId}
      />

      {/* Main App Window Content */}
      <main className="flex-1 flex flex-col min-w-0 relative overflow-hidden bg-white dark:bg-[#09090b]">
        
        {/* API Key Missing Ribbon Alert */}
        {isKeyMissing && currentPage !== 'settings' && (
          <div className="bg-amber-500/10 border-b border-amber-500/20 px-6 py-2.5 flex items-center justify-between text-xs text-amber-600 dark:text-amber-400 z-10 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-ping" />
              <span><strong>Keys Required:</strong> Workflows run live using your model. Add a Gemini API key in Settings to run agent loops.</span>
            </div>
            <button 
              onClick={() => setCurrentPage('settings')}
              className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded font-medium transition-colors cursor-pointer"
            >
              Configure Key
            </button>
          </div>
        )}

        {/* Scrollable Page Wrapper */}
        <div className="flex-1 overflow-y-auto px-6 py-6 md:px-10 md:py-8 max-w-[1600px] w-full mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
