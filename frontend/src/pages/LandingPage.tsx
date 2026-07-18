import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  Users, 
  GitFork, 
  Database, 
  Sun,
  Moon,
  Check,
  ChevronDown, 
  Terminal,
  Activity,
  Play
} from 'lucide-react';

interface LandingPageProps {
  onEnterDashboard: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export default function LandingPage({ onEnterDashboard, theme, onToggleTheme }: LandingPageProps) {
  const [activeFAQ, setActiveFAQ] = useState<number | null>(null);

  const faqs = [
    {
      q: "What is an AI Employee?",
      a: "An AI Employee is a specialized digital assistant with defined roles, backing stories, specialized instruction parameters, and access to select tools (e.g. databases, calculators, search). Rather than simple chat interfaces, they operate autonomously or collaboratively to solve complex workflows."
    },
    {
      q: "How do AI Employees collaborate?",
      a: "AgentHub AI acts as the orchestrator. When you trigger a workflow (like a sales proposal audit), AgentHub compiles the execution plan. It then routes data from the Sales Agent to the Finance Agent, to the Legal Counsel, simulating inter-agent messaging, tool executions, and consensus-building before delivering the final report to you."
    },
    {
      q: "Does this require a backend server or database setup?",
      a: "AgentHub is built to run hybridly. It includes a complete local FastAPI Python server for vector embeddings and document uploads. However, if you are looking for an instant start, the frontend includes a client-side orchestrator that connects directly to the Gemini API securely using keys saved in your browser's localStorage."
    },
    {
      q: "How secure are my API keys?",
      a: "Your API keys are stored entirely locally in your own browser's localStorage or inside your local environment (.env) files. They are never sent to third-party servers, except directly to the official LLM endpoints (Google Generative AI, OpenAI, Anthropic)."
    }
  ];

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-[#09090b] dark:text-zinc-50 selection:bg-blue-500/20 font-sans transition-colors duration-200">
      
      {/* Header bar */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-zinc-200/50 dark:border-zinc-800/40 bg-zinc-50/80 dark:bg-[#09090b]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-blue-600 flex items-center justify-center shadow-md shadow-blue-500/10">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" className="h-5 w-5">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="font-bold text-base tracking-tight text-zinc-950 dark:text-white">AgentHub AI</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-xs font-medium text-zinc-500 dark:text-zinc-400">
            <a href="#features" className="hover:text-zinc-950 dark:hover:text-zinc-200 transition-colors">Features</a>
            <a href="#workflow" className="hover:text-zinc-950 dark:hover:text-zinc-200 transition-colors">Workflow</a>
            <a href="#pricing" className="hover:text-zinc-950 dark:hover:text-zinc-200 transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-zinc-950 dark:hover:text-zinc-200 transition-colors">FAQ</a>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={onToggleTheme}
              className="p-2 border border-zinc-200 dark:border-zinc-800 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 transition-colors cursor-pointer"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-zinc-600" />}
            </button>
            <button 
              onClick={onEnterDashboard}
              className="px-4 py-2 text-xs font-semibold bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-100 rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>Launch Console</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-24 md:pt-40 md:pb-32 px-6 overflow-hidden relative">
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-grid-dots opacity-40 -z-10 pointer-events-none" />
        
        {/* Glow effect */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 dark:bg-blue-600/5 rounded-full blur-[120px] -z-10 pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-2"
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-blue-500/20 bg-blue-500/5 text-blue-600 dark:text-blue-400 text-[11px] font-semibold tracking-wide uppercase">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
              <span>Open Innovation — FlowZint AI Hackathon 2026</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold">
              <span>✅ Real AI Tools</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-purple-500/20 bg-purple-500/5 text-purple-600 dark:text-purple-400 text-[11px] font-semibold">
              <span>🛑 Human-in-the-Loop</span>
            </div>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold tracking-tight text-zinc-950 dark:text-white leading-[1.1]"
          >
            AI Agents for Sales,{' '}<br />
            <span className="text-blue-600 dark:text-blue-400 bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-500 bg-clip-text text-transparent">Support & Customer Care</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-2xl mx-auto text-sm md:text-base text-zinc-500 dark:text-zinc-400 leading-relaxed font-normal"
          >
            Businesses lose <strong className="text-zinc-700 dark:text-zinc-200">6+ hours daily</strong> routing sales approvals, resolving support tickets, and managing customer escalations manually. AgentHub deploys specialized AI agents that collaborate across departments — with <strong className="text-zinc-700 dark:text-zinc-200">you staying in control</strong> via human approval gates.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex items-center justify-center gap-4 pt-4"
          >
            <button 
              onClick={onEnterDashboard}
              className="px-6 py-3 text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-md shadow-blue-600/10 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Build AI Employee</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <a 
              href="#workflow"
              className="px-6 py-3 text-sm font-semibold border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 rounded-lg transition-all flex items-center gap-2 text-zinc-700 dark:text-zinc-300"
            >
              <Play className="h-4 w-4 fill-zinc-400 stroke-zinc-400 dark:fill-zinc-500 dark:stroke-zinc-500" />
              <span>See How it Works</span>
            </a>
          </motion.div>
        </div>

        {/* Floating Product Preview Mockup */}
        <SimulationMockup />
      </section>

      {/* Features Grid Section */}
      <section id="features" className="py-24 border-t border-zinc-200 dark:border-zinc-900 bg-white dark:bg-[#0c0c0f]/20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-xs font-semibold text-blue-600 tracking-wider uppercase">Built for Enterprises</h2>
            <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-950 dark:text-white">Everything You Need to Manage AI Operations</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">No hidden AI magic. Full explanations, detailed logs, customizable capabilities, and visual graphs.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-6 rounded-xl border border-zinc-200/80 dark:border-zinc-800/60 bg-white dark:bg-[#0c0c0f] shadow-sm space-y-4 hover:shadow-md transition-shadow">
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
                <Users className="h-5 w-5" />
              </div>
              <h4 className="text-sm font-semibold text-zinc-950 dark:text-white">AI Employee Customization</h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Configure roles, departments, goals, instructions, models, and temperature. Equip them with specific search, CRM, and calculation tools.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-xl border border-zinc-200/80 dark:border-zinc-800/60 bg-white dark:bg-[#0c0c0f] shadow-sm space-y-4 hover:shadow-md transition-shadow">
              <div className="h-10 w-10 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
                <GitFork className="h-5 w-5" />
              </div>
              <h4 className="text-sm font-semibold text-zinc-950 dark:text-white">Visual Multi-Agent Workflows</h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Connect multiple agents together in flowcharts. Watch them hand off sub-tasks dynamically while maintaining structural consensus.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-xl border border-zinc-200/80 dark:border-zinc-800/60 bg-white dark:bg-[#0c0c0f] shadow-sm space-y-4 hover:shadow-md transition-shadow">
              <div className="h-10 w-10 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                <Database className="h-5 w-5" />
              </div>
              <h4 className="text-sm font-semibold text-zinc-950 dark:text-white">Searchable Knowledge Base</h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Upload PDFs, Word docs, CSV databases, Notion exports, or website links. Empower your agents to run RAG search queries securely.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison & Customer Journey Section */}
      <section id="workflow" className="py-24 border-t border-zinc-200 dark:border-zinc-900 bg-zinc-50/50 dark:bg-[#09090b]">
        <div className="max-w-7xl mx-auto px-6">
          
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-xs font-semibold text-blue-600 tracking-wider uppercase">Structural Advantage</h2>
            <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-950 dark:text-white">Agentic Collaboration vs. Chatbots</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Why simple chat prompts fail to scale for complex enterprise departments.</p>
          </div>

          {/* Table comparing Traditional vs. AgentHub AI */}
          <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0c0c0f] rounded-xl shadow-sm overflow-hidden mb-16">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-800/35 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400">
                  <th className="p-4 font-semibold">Workflow Characteristic</th>
                  <th className="p-4 font-semibold">Traditional LLM Prompts</th>
                  <th className="p-4 font-semibold text-blue-600 dark:text-blue-400">AgentHub AI Employee OS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-zinc-700 dark:text-zinc-300">
                <tr>
                  <td className="p-4 font-medium text-zinc-950 dark:text-white">Execution Mode</td>
                  <td className="p-4">Manual back-and-forth prompt copies</td>
                  <td className="p-4 font-medium text-blue-600">Autonomous workflow graphs & routing</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-zinc-950 dark:text-white">Specialization</td>
                  <td className="p-4">Single generic model trying to answer everything</td>
                  <td className="p-4">Multiple agents with unique goals and tools</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-zinc-950 dark:text-white">Auditing & Safety</td>
                  <td className="p-4">Hidden inner workings, prone to silent errors</td>
                  <td className="p-4">Step-by-step reasoning logs, messages, and approvals</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-zinc-950 dark:text-white">Resource Integration</td>
                  <td className="p-4">Requires manual context copying</td>
                  <td className="p-4">Permissions-based indexing of PDFs, CSVs, and CRM databases</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Pricing Page (UI Only) */}
      <section id="pricing" className="py-24 border-t border-zinc-200 dark:border-zinc-900 bg-white dark:bg-[#0c0c0f]/20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-xs font-semibold text-blue-600 tracking-wider uppercase">Pricing Plans</h2>
            <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-950 dark:text-white">Simple, Transparent Pricing</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">No hidden seat licensing costs. Pay-as-you-go using your own model provider API keys.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Plan 1 */}
            <div className="p-8 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0c0c0f] rounded-xl flex flex-col justify-between shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
              <div className="space-y-4">
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Developer</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-zinc-950 dark:text-white">$0</span>
                  <span className="text-xs text-zinc-500">/ forever</span>
                </div>
                <p className="text-xs text-zinc-500 leading-relaxed">Perfect for hackathon testing, prototyping, and single-workflow local runs.</p>
                <hr className="border-zinc-100 dark:border-zinc-800/80" />
                <ul className="space-y-2.5 text-xs text-zinc-600 dark:text-zinc-300">
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500 shrink-0" /> <span>Up to 5 AI Employees</span></li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500 shrink-0" /> <span>Local Client-side Orchester</span></li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500 shrink-0" /> <span>Gemini API Direct Support</span></li>
                </ul>
              </div>
              <button onClick={onEnterDashboard} className="mt-8 w-full py-2.5 text-xs font-semibold border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-850 rounded-lg cursor-pointer transition-colors text-zinc-800 dark:text-zinc-200">
                Launch Console
              </button>
            </div>

            {/* Plan 2 */}
            <div className="p-8 border-2 border-blue-500 bg-white dark:bg-[#0c0c0f] rounded-xl flex flex-col justify-between shadow-md relative">
              <div className="absolute -top-3 right-6 px-2.5 py-0.5 bg-blue-500 text-white rounded-full text-[9px] font-bold uppercase tracking-wider">Most Popular</div>
              <div className="space-y-4">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Growth Startup</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-zinc-950 dark:text-white">$79</span>
                  <span className="text-xs text-zinc-500">/ month</span>
                </div>
                <p className="text-xs text-zinc-500 leading-relaxed">For fast-growing teams seeking hosted backends, persistent workspaces, and database syncs.</p>
                <hr className="border-zinc-100 dark:border-zinc-800/80" />
                <ul className="space-y-2.5 text-xs text-zinc-600 dark:text-zinc-300">
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500 shrink-0" /> <span>Unlimited AI Employees</span></li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500 shrink-0" /> <span>Multi-provider Key support</span></li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500 shrink-0" /> <span>Hosted FastAPI & SQLite syncs</span></li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500 shrink-0" /> <span>Premium SLA Guarantees</span></li>
                </ul>
              </div>
              <button onClick={onEnterDashboard} className="mt-8 w-full py-2.5 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg cursor-pointer transition-colors shadow-sm">
                Get Started
              </button>
            </div>

            {/* Plan 3 */}
            <div className="p-8 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0c0c0f] rounded-xl flex flex-col justify-between shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
              <div className="space-y-4">
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Enterprise</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-zinc-950 dark:text-white">Custom</span>
                </div>
                <p className="text-xs text-zinc-500 leading-relaxed">For massive operations requiring dedicated cluster nodes, HIPAA compliance, and custom LLM finetunes.</p>
                <hr className="border-zinc-100 dark:border-zinc-800/80" />
                <ul className="space-y-2.5 text-xs text-zinc-600 dark:text-zinc-300">
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500 shrink-0" /> <span>Dedicated LangGraph servers</span></li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500 shrink-0" /> <span>HIPAA & SOC-2 compliance vault</span></li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500 shrink-0" /> <span>Custom tool developments</span></li>
                </ul>
              </div>
              <button onClick={onEnterDashboard} className="mt-8 w-full py-2.5 text-xs font-semibold border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-850 rounded-lg cursor-pointer transition-colors text-zinc-800 dark:text-zinc-200">
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section id="faq" className="py-24 border-t border-zinc-200 dark:border-zinc-900 bg-zinc-50/50 dark:bg-[#09090b]">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16 space-y-3">
            <h2 className="text-xs font-semibold text-blue-600 tracking-wider uppercase">FAQ</h2>
            <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-950 dark:text-white">Frequently Asked Questions</h3>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = activeFAQ === index;
              return (
                <div 
                  key={index} 
                  className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0c0c0f] rounded-xl overflow-hidden shadow-sm"
                >
                  <button 
                    onClick={() => setActiveFAQ(isOpen ? null : index)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left text-xs font-semibold text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800/20 cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`h-4 w-4 text-zinc-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-4 pt-1 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed border-t border-zinc-100 dark:border-zinc-800/40">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-zinc-200/50 dark:border-zinc-800/40 text-center text-xs text-zinc-400 dark:text-zinc-500">
        <div className="max-w-7xl mx-auto px-6 space-y-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full border border-blue-500/20 bg-blue-500/5 text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase tracking-widest">FlowZint AI Hackathon 2026</span>
            <span className="px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-widest">Open Innovation</span>
          </div>
          <p>© 2026 AgentHub AI. Submitted to FlowZint AI Hackathon 2026 under Open Innovation category.</p>
          <p className="text-[10px]">Powered by Gemini 1.5 Flash · Real SQLite CRM · DuckDuckGo Web Search · Python Financial Calculator · Knowledge Base RAG</p>
          <div className="flex justify-center gap-6 text-[10px]">
            <a href="#" className="hover:underline">Privacy Policy</a>
            <a href="#" className="hover:underline">Terms of Service</a>
            <a href="#" className="hover:underline">System Status</a>
          </div>
        </div>
      </footer>

    </div>
  );
}

// Simulated active task steps for the landing page hero mockup
const SIMULATED_STEPS = [
  {
    step: 0,
    status: { sales: 'running', finance: 'pending', legal: 'pending' },
    logs: [
      { sender: 'ORCHESTRATOR', type: 'routing', content: 'Draft proposal for Acme Corp and verify if the 35% discount complies with budget lines.' }
    ],
    tokens: 120,
    cost: 0.00002
  },
  {
    step: 1,
    status: { sales: 'running', finance: 'pending', legal: 'pending' },
    logs: [
      { sender: 'ORCHESTRATOR', type: 'routing', content: 'Draft proposal for Acme Corp and verify if the 35% discount complies with budget lines.' },
      { sender: 'SARAH JENKINS (Sales)', type: 'thought', content: 'Analyzing deal parameters. Pulling active corporate pricing limits for Q3 pilot contracts...' },
      { sender: 'SARAH JENKINS (Sales)', type: 'tool', content: 'Database Search: "Acme Corp Contract Tier"' }
    ],
    tokens: 890,
    cost: 0.00018
  },
  {
    step: 2,
    status: { sales: 'completed', finance: 'running', legal: 'pending' },
    logs: [
      { sender: 'SARAH JENKINS (Sales)', type: 'thought', content: 'Analyzing deal parameters. Pulling active corporate pricing limits for Q3 pilot contracts...' },
      { sender: 'SARAH JENKINS (Sales)', type: 'tool', content: 'Database Search: "Acme Corp Contract Tier"' },
      { sender: 'ORCHESTRATOR', type: 'routing', content: 'Acme qualified (Tier 2). Forwarding discount approval check to Finance.' }
    ],
    tokens: 1850,
    cost: 0.00032
  },
  {
    step: 3,
    status: { sales: 'completed', finance: 'running', legal: 'pending' },
    logs: [
      { sender: 'ORCHESTRATOR', type: 'routing', content: 'Acme qualified (Tier 2). Forwarding discount approval check to Finance.' },
      { sender: 'DAVID VANCE (Finance)', type: 'thought', content: 'Verifying margin compliance. 35% discount leaves 65% gross margin. Threshold is 68%.' },
      { sender: 'DAVID VANCE (Finance)', type: 'tool', content: 'Financial Calculator: calculate_gross_margin(0.35, 150000)' }
    ],
    tokens: 2940,
    cost: 0.00054
  },
  {
    step: 4,
    status: { sales: 'completed', finance: 'completed', legal: 'running' },
    logs: [
      { sender: 'DAVID VANCE (Finance)', type: 'tool', content: 'Financial Calculator: calculate_gross_margin(0.35, 150000)' },
      { sender: 'DAVID VANCE (Finance)', type: 'thought', content: 'Discount violates Guideline 4.1. Escalating to Legal for a standard waiver contract rider.' }
    ],
    tokens: 3820,
    cost: 0.00072
  },
  {
    step: 5,
    status: { sales: 'completed', finance: 'completed', legal: 'completed' },
    logs: [
      { sender: 'DAVID VANCE (Finance)', type: 'thought', content: 'Discount violates Guideline 4.1. Escalating to Legal for a standard waiver contract rider.' },
      { sender: 'ELENA ROSTOVA (Legal)', type: 'thought', content: 'Drafting discount rider. Applying standard indemnity clause for margins below 68%.' },
      { sender: 'ORCHESTRATOR', type: 'routing', content: 'All agents resolved. Consensus reached: proposal approved with margin rider attachment.' }
    ],
    tokens: 4980,
    cost: 0.00096
  }
];

function SimulationMockup() {
  const [stepIdx, setStepIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIdx(prev => (prev + 1) % SIMULATED_STEPS.length);
    }, 3800);
    return () => clearInterval(interval);
  }, []);

  const current = SIMULATED_STEPS[stepIdx];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.4 }}
      className="max-w-5xl mx-auto mt-16 p-2 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white/50 dark:bg-[#0c0c0f]/50 backdrop-blur-md shadow-2xl overflow-hidden"
    >
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#09090b] overflow-hidden">
        {/* Window header */}
        <div className="px-4 py-3 bg-zinc-50 dark:bg-[#0c0c0f] border-b border-zinc-200 dark:border-zinc-800/60 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-rose-500/60" />
            <span className="h-3 w-3 rounded-full bg-amber-500/60" />
            <span className="h-3 w-3 rounded-full bg-emerald-500/60" />
            <span className="ml-4 font-mono text-zinc-450 dark:text-zinc-500 select-none">workflow://enterprise-deal-audit</span>
          </div>
          <div className="flex items-center gap-2 font-medium text-zinc-400 dark:text-zinc-500">
            <Terminal className="h-3.5 w-3.5" />
            <span>Simulation Active</span>
          </div>
        </div>

        {/* Simulated Live View */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 bg-zinc-50/40 dark:bg-[#09090b]/40 min-h-[300px]">
          
          {/* Left Column: Workflow graph */}
          <div className="md:col-span-1 border border-zinc-200/85 dark:border-zinc-800/50 bg-white dark:bg-[#0c0c0f] rounded-xl p-4 flex flex-col justify-between shadow-sm">
            <div>
              <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Workflow Topology</h4>
              <div className="space-y-3">
                {/* Sarah Jenkins Node */}
                <div className={`p-3 rounded-lg border transition-all duration-300 ${
                  current.status.sales === 'running'
                    ? 'bg-blue-500/10 border-blue-500/30'
                    : current.status.sales === 'completed'
                    ? 'bg-emerald-500/5 border-emerald-500/20'
                    : 'bg-zinc-100 dark:bg-zinc-800/30 border-zinc-200 dark:border-zinc-800/60 opacity-60'
                }`}>
                  <div className="flex items-center gap-2.5">
                    <div className="h-6 w-6 rounded bg-blue-600 flex items-center justify-center font-bold text-[10px] text-white">S</div>
                    <div className="flex-1 min-w-0">
                      <span className="block text-[11px] font-bold text-zinc-850 dark:text-zinc-200">Sarah Jenkins</span>
                      <span className={`block text-[9px] font-medium ${
                        current.status.sales === 'running' ? 'text-blue-600 dark:text-blue-400 animate-pulse' :
                        current.status.sales === 'completed' ? 'text-emerald-500' : 'text-zinc-500'
                      }`}>
                        {current.status.sales === 'running' ? 'Sales - Running...' :
                         current.status.sales === 'completed' ? 'Sales - Completed' : 'Sales - Pending'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-center py-0.5">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={`h-5 w-5 ${current.status.sales === 'running' ? 'text-blue-500 animate-bounce' : 'text-zinc-300 dark:text-zinc-700'}`}>
                    <path d="M12 5v14M19 12l-7 7-7-7" />
                  </svg>
                </div>

                {/* David Vance Node */}
                <div className={`p-3 rounded-lg border transition-all duration-300 ${
                  current.status.finance === 'running'
                    ? 'bg-amber-500/10 border-amber-500/30'
                    : current.status.finance === 'completed'
                    ? 'bg-emerald-500/5 border-emerald-500/20'
                    : 'bg-zinc-100 dark:bg-zinc-800/30 border-zinc-200 dark:border-zinc-800/60 opacity-60'
                }`}>
                  <div className="flex items-center gap-2.5">
                    <div className="h-6 w-6 rounded bg-emerald-600 flex items-center justify-center font-bold text-[10px] text-white">D</div>
                    <div className="flex-1 min-w-0">
                      <span className="block text-[11px] font-bold text-zinc-850 dark:text-zinc-200">David Vance</span>
                      <span className={`block text-[9px] font-medium ${
                        current.status.finance === 'running' ? 'text-amber-500 animate-pulse' :
                        current.status.finance === 'completed' ? 'text-emerald-500' : 'text-zinc-500'
                      }`}>
                        {current.status.finance === 'running' ? 'Finance - Running...' :
                         current.status.finance === 'completed' ? 'Finance - Completed' : 'Finance - Pending'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center py-0.5">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={`h-5 w-5 ${current.status.finance === 'running' ? 'text-amber-500 animate-bounce' : 'text-zinc-300 dark:text-zinc-700'}`}>
                    <path d="M12 5v14M19 12l-7 7-7-7" />
                  </svg>
                </div>

                {/* Elena Rostova Node */}
                <div className={`p-3 rounded-lg border transition-all duration-300 ${
                  current.status.legal === 'running'
                    ? 'bg-purple-500/10 border-purple-500/30'
                    : current.status.legal === 'completed'
                    ? 'bg-emerald-500/5 border-emerald-500/20'
                    : 'bg-zinc-100 dark:bg-zinc-800/30 border-zinc-200 dark:border-zinc-800/60 opacity-60'
                }`}>
                  <div className="flex items-center gap-2.5">
                    <div className="h-6 w-6 rounded bg-purple-600 flex items-center justify-center font-bold text-[10px] text-white">E</div>
                    <div className="flex-1 min-w-0">
                      <span className="block text-[11px] font-bold text-zinc-850 dark:text-zinc-200">Elena Rostova</span>
                      <span className={`block text-[9px] font-medium ${
                        current.status.legal === 'running' ? 'text-purple-500 animate-pulse' :
                        current.status.legal === 'completed' ? 'text-emerald-500' : 'text-zinc-500'
                      }`}>
                        {current.status.legal === 'running' ? 'Legal - Running...' :
                         current.status.legal === 'completed' ? 'Legal - Completed' : 'Legal - Pending'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/50 mt-4 flex items-center justify-between text-[10px] text-zinc-500 font-mono">
              <span>Handoff style: Cascading</span>
              <span className="font-semibold text-blue-600 animate-pulse">Processing</span>
            </div>
          </div>

          {/* Right Column: Live Collaboration log (Slack-like) */}
          <div className="md:col-span-2 border border-zinc-200/80 dark:border-zinc-800/50 bg-white dark:bg-[#0c0c0f] rounded-xl p-4 flex flex-col justify-between shadow-sm min-h-[360px]">
            <div className="space-y-4">
              <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                <Activity className="h-3.5 w-3.5 text-blue-600" />
                <span>Live Audit Log</span>
              </h4>
              <div className="space-y-3 font-mono text-[11px] leading-relaxed">
                {current.logs.map((log, i) => {
                  const isOrch = log.sender === 'ORCHESTRATOR';
                  const isTool = log.type === 'tool';
                  return (
                    <div key={i} className={`p-2.5 rounded-lg border text-xs ${
                      isOrch ? 'bg-zinc-50 dark:bg-zinc-800/20 border-zinc-100 dark:border-zinc-800/60 text-zinc-650' :
                      isTool ? 'bg-amber-500/5 border-amber-500/10 text-zinc-600' :
                      'bg-blue-500/5 border-blue-500/10 text-zinc-700 dark:text-zinc-300'
                    }`}>
                      <div className="flex items-center justify-between font-bold text-[9px] mb-1 opacity-70">
                        <span>{log.sender}</span>
                        <span className="uppercase">{log.type}</span>
                      </div>
                      <p className="font-sans leading-relaxed">{log.content}</p>
                    </div>
                  );
                })}

                {/* Simulated typing bubble */}
                {stepIdx < SIMULATED_STEPS.length - 1 && (
                  <div className="flex gap-1 py-2 pl-1 items-center">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500 typing-dot" />
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500 typing-dot" />
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500 typing-dot" />
                    <span className="text-[10px] text-zinc-400 font-sans ml-1">Agent compiling logs...</span>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/50 mt-4 flex justify-between items-center text-[10px] text-zinc-550 font-mono">
              <span>Tokens consumed: {current.tokens.toLocaleString()}</span>
              <span>Accrued Cost: ${current.cost.toFixed(5)}</span>
            </div>
          </div>

        </div>
      </div>
    </motion.div>
  );
}

