import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Send, 
  CornerDownRight,
  Loader2,
  Hash,
  Coins,
  Cpu
} from 'lucide-react';
import { Task, Agent, StepLog } from '../types/types';

interface ConversationsProps {
  tasks: Task[];
  agents: Agent[];
}

export default function Conversations({ tasks, agents }: ConversationsProps) {
  const [activeTaskId, setActiveTaskId] = useState<string | null>(
    tasks.find(t => t.steps && t.steps.length > 0)?.id || tasks[0]?.id || null
  );
  const [typedMessage, setTypedMessage] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  
  // Track user clicks on reactions: Record<stepId, Record<emoji, boolean>>
  const [userReactions, setUserReactions] = useState<Record<string, Record<string, boolean>>>({});

  const activeTask = tasks.find(t => t.id === activeTaskId);

  // Auto-scroll chats to bottom on message updates
  const chatEndRef = React.useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeTask?.steps?.length, isReplying]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedMessage.trim() || !activeTask) return;

    const userMsg = typedMessage;
    setTypedMessage('');
    setIsReplying(true);

    const userLog: StepLog = {
      id: Math.random().toString(36).substring(7),
      timestamp: new Date().toISOString(),
      agentId: "user",
      agentName: "MADHAV (Staff Engineer)",
      role: "System Administrator",
      type: "message",
      content: userMsg
    };

    activeTask.steps = [...(activeTask.steps || []), userLog];

    const keys = localStorage.getItem('agenthub_apikeys');
    const apiKey = keys ? JSON.parse(keys).google || JSON.parse(keys).openai : '';
    const prevLogs = activeTask.steps.slice(-4).map(s => `${s.agentName} (${s.role}): ${s.content}`).join("\n");
    
    const followUpPrompt = `
You are the AgentHub AI Coordinator representing the team.
The user just sent this follow-up message: "${userMsg}" in the thread of task: "${activeTask.name}".
Context of recent thread:
${prevLogs}

Respond to the user. Speak as the AgentHub Coordinator or delegate the response to the appropriate team member.
Keep the response professional, concise, and helpful. Do not mention system details.
`;

    let replyText = "";
    let callSucceeded = false;

    try {
      const response = await fetch("/api/proxy/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "gemini-1.5-flash",
          body: {
            contents: [{ parts: [{ text: followUpPrompt }] }],
            generationConfig: { temperature: 0.5, maxOutputTokens: 512 }
          }
        })
      });
      if (response.ok) {
        const data = await response.json();
        replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
        callSucceeded = true;
      }
    } catch (e) {
      console.warn("Backend proxy follow-up call failed, trying direct API call...", e);
    }

    if (!callSucceeded && apiKey) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: followUpPrompt }] }],
            generationConfig: { temperature: 0.5, maxOutputTokens: 512 }
          })
        });
        if (response.ok) {
          const data = await response.json();
          replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
          callSucceeded = true;
        }
      } catch (err) {
        console.error("Direct follow-up request error", err);
      }
    }

    if (callSucceeded && replyText) {
      const agentLog: StepLog = {
        id: Math.random().toString(36).substring(7),
        timestamp: new Date().toISOString(),
        agentId: "orchestrator",
        agentName: "AgentHub Coordinator",
        role: "Workflow Router & Orchestrator",
        type: "message",
        content: replyText
      };
      activeTask.steps = [...(activeTask.steps || []), agentLog];
    } else {
      await new Promise(r => setTimeout(r, 1200));
      const agentLog: StepLog = {
        id: Math.random().toString(36).substring(7),
        timestamp: new Date().toISOString(),
        agentId: "orchestrator",
        agentName: "AgentHub Coordinator",
        role: "Workflow Router & Orchestrator",
        type: "message",
        content: "API key is missing or backend connection failed. Please configure GEMINI_API_KEY in the backend/.env file to enable chats."
      };
      activeTask.steps = [...(activeTask.steps || []), agentLog];
    }

    setIsReplying(false);
  };

  // Helper to generate base simulated reactions from other agents
  const getBaseReactions = (_stepId: string, type: StepLog['type'], agentId: string) => {
    const list: { emoji: string; count: number; names: string[] }[] = [];
    if (type === 'routing') {
      list.push({ emoji: '🧠', count: 1, names: ['Orchestrator'] });
    } else if (type === 'thought') {
      list.push({ emoji: '💡', count: 1, names: ['AgentHub Coordinator'] });
    } else if (agentId === 'agent-sales') {
      list.push({ emoji: '👎', count: 1, names: ['David Vance'] });
      list.push({ emoji: '🧠', count: 1, names: ['Elena Rostova'] });
    } else if (agentId === 'agent-finance') {
      list.push({ emoji: '👍', count: 2, names: ['Sarah Jenkins', 'Elena Rostova'] });
    } else if (agentId === 'agent-legal') {
      list.push({ emoji: '🔥', count: 1, names: ['Sarah Jenkins'] });
    } else if (agentId === 'user') {
      list.push({ emoji: '👀', count: 2, names: ['Sarah Jenkins', 'David Vance'] });
    } else {
      list.push({ emoji: '👍', count: 1, names: ['Orchestrator'] });
    }
    return list;
  };

  const handleToggleUserReaction = (stepId: string, emoji: string) => {
    setUserReactions(prev => {
      const stepReacts = prev[stepId] || {};
      const nextState = !stepReacts[emoji];
      return {
        ...prev,
        [stepId]: {
          ...stepReacts,
          [emoji]: nextState
        }
      };
    });
  };

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col md:flex-row gap-5 overflow-hidden">
      
      {/* Slack Channels/Threads Sidebar */}
      <div className="w-full md:w-64 border border-zinc-200 dark:border-zinc-800 bg-[#1e0e1e] text-zinc-300 rounded-xl flex flex-col overflow-hidden shrink-0 shadow-md">
        {/* Slack workspace name */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-white/10 text-white flex items-center justify-center font-bold text-xs uppercase">
              AH
            </div>
            <span className="font-bold text-xs text-white tracking-wide">AgentHub Workspace</span>
          </div>
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
        </div>
        
        {/* Channel Categories */}
        <div className="flex-1 overflow-y-auto p-2 space-y-4">
          
          {/* Default Slack-like Channels */}
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider pl-2 block mb-1">Channels</span>
            <button className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-white/5 hover:text-white transition-colors text-left text-zinc-400">
              <Hash className="h-3.5 w-3.5" />
              <span>general</span>
            </button>
            <button className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-white/5 hover:text-white transition-colors text-left text-zinc-400">
              <Hash className="h-3.5 w-3.5" />
              <span>operations-feed</span>
            </button>
          </div>

          {/* Collaborative Task threads mapped as channels */}
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider pl-2 block mb-1">Task Threads</span>
            {tasks.map((task) => {
              const isSelected = activeTaskId === task.id;
              const channelName = task.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
              return (
                <button
                  key={task.id}
                  onClick={() => setActiveTaskId(task.id)}
                  className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all text-left truncate ${
                    isSelected 
                      ? 'bg-blue-600 text-white font-bold shadow-sm' 
                      : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Hash className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{channelName}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Slack Messaging Window */}
      <div className="flex-1 border border-zinc-200 dark:border-zinc-800 bg-[#f8f8fa] dark:bg-[#0c0c0f] rounded-xl flex flex-col overflow-hidden shadow-sm">
        {activeTask ? (
          <>
            {/* Slack Header */}
            <div className="p-4 bg-white dark:bg-[#09090b] border-b border-zinc-200 dark:border-zinc-850 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-zinc-950 dark:text-white flex items-center gap-1.5">
                  <Hash className="h-3.5 w-3.5 text-zinc-400" />
                  <span>{activeTask.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}</span>
                </h3>
                <span className="text-[10px] text-zinc-450 dark:text-zinc-500 mt-0.5 block truncate max-w-lg">{activeTask.description}</span>
              </div>
              <div className="flex items-center gap-2 font-mono text-[10px]">
                {activeTask.totalCost && (
                  <span className="px-2 py-1 bg-amber-500/10 text-amber-600 border border-amber-550/10 rounded font-semibold flex items-center gap-1">
                    <Coins className="h-3 w-3" />
                    <span>${activeTask.totalCost.toFixed(5)}</span>
                  </span>
                )}
                <span className={`px-2 py-1 border rounded font-semibold uppercase tracking-wider ${
                  activeTask.status === 'completed' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/10' : 'bg-blue-500/10 text-blue-600 border-blue-500/10 animate-pulse'
                }`}>
                  {activeTask.status}
                </span>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              
              {/* Coordinator start log */}
              <div className="flex gap-3 text-xs bg-white dark:bg-[#09090b] p-3 rounded-xl border border-zinc-200/50 dark:border-zinc-800/40">
                <div className="h-8 w-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-[10px] uppercase shadow-sm">
                  OC
                </div>
                <div className="space-y-1 w-full">
                  <div className="flex items-baseline gap-2">
                    <span className="font-bold text-zinc-950 dark:text-white">AgentHub Coordinator</span>
                    <span className="text-[10px] text-zinc-400 font-medium">Orchestrator</span>
                  </div>
                  <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed font-sans select-text">
                    Workflow thread initialized for pipeline task: <span className="font-semibold text-blue-600">"{activeTask.description}"</span>. Planning agent handoffs...
                  </p>
                </div>
              </div>

              {/* Steps Trail rendered as Slack Messages */}
              {activeTask.steps && activeTask.steps.map((step) => {
                const agent = agents.find(a => a.id === step.agentId);
                const isUser = step.agentId === "user";
                const isOrch = step.agentId === "orchestrator";
                const agentColor = isUser ? '#10b981' : (isOrch ? '#2563eb' : (agent?.avatarColor || '#71717a'));
                
                // Get reactions lists
                const baseReacts = getBaseReactions(step.id, step.type, step.agentId);
                const stepUserReacts = userReactions[step.id] || {};

                return (
                  <div 
                    key={step.id} 
                    className="flex gap-3 text-xs bg-white dark:bg-[#09090b]/80 p-3.5 rounded-xl border border-zinc-150 dark:border-zinc-850 hover:shadow-sm transition-shadow relative group border-l-4"
                    style={{ borderLeftColor: agentColor }}
                  >
                    {/* Avatar */}
                    <div 
                      className="h-8 w-8 rounded-lg text-white flex items-center justify-center font-extrabold text-[10px] uppercase shadow-sm mt-0.5 shrink-0"
                      style={{ backgroundColor: agentColor }}
                    >
                      {isUser ? 'ME' : (isOrch ? 'OC' : (step.agentName.split(' ').map(n => n[0]).join('')))}
                    </div>
                    
                    <div className="flex-1 space-y-1.5 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span className="font-bold text-zinc-950 dark:text-white truncate">{step.agentName}</span>
                        <span className="text-[10px] text-zinc-400 font-medium truncate">({step.role})</span>
                        <span className="text-[9px] text-zinc-400 font-mono ml-auto">
                          {new Date(step.timestamp).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                      </div>

                      {/* Message body */}
                      {step.type === 'thought' && (
                        <p className="text-zinc-500 dark:text-zinc-400 italic bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/40 p-2.5 rounded-lg select-text font-sans leading-relaxed">
                          {step.content}
                        </p>
                      )}

                      {step.type === 'tool_call' && (
                        <div className="p-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg flex items-center gap-2 font-mono text-[10px]">
                          <Cpu className="h-3.5 w-3.5 text-zinc-400" />
                          <span>Invoked Tool [{step.metadata?.toolName}]: "{step.content}"</span>
                        </div>
                      )}

                      {step.type === 'tool_response' && (
                        <div className="p-2.5 bg-zinc-100 dark:bg-zinc-850/50 border border-zinc-200 dark:border-zinc-800 rounded-lg flex items-start gap-2 font-mono text-[10px] select-text">
                          <CornerDownRight className="h-3.5 w-3.5 text-zinc-400 mt-0.5 shrink-0" />
                          <pre className="text-zinc-655 dark:text-zinc-400 whitespace-pre-wrap font-mono leading-relaxed">{step.content}</pre>
                        </div>
                      )}

                      {(step.type === 'message' || step.type === 'conclusion') && (
                        <div className="p-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800/60 rounded-lg select-text leading-relaxed whitespace-pre-wrap text-zinc-700 dark:text-zinc-300">
                          {step.content}
                        </div>
                      )}

                      {/* Reactions display block */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {baseReacts.map((react) => {
                          const isClicked = !!stepUserReacts[react.emoji];
                          const totalCount = react.count + (isClicked ? 1 : 0);
                          return (
                            <button
                              key={react.emoji}
                              onClick={() => handleToggleUserReaction(step.id, react.emoji)}
                              className={`flex items-center gap-1 px-2 py-0.5 border rounded-full text-[10px] font-medium transition-all ${
                                isClicked
                                  ? 'bg-blue-50 border-blue-300 text-blue-600 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400'
                                  : 'bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400'
                              }`}
                              title={`${react.names.join(', ')} ${isClicked ? 'and you' : ''}`}
                            >
                              <span>{react.emoji}</span>
                              <span className="font-mono text-[9px] font-bold">{totalCount}</span>
                            </button>
                          );
                        })}

                        {/* Reaction Quick Add Bar on hover */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 ml-1.5">
                          {['👍', '🧠', '💡', '🔥'].map(emoji => {
                            const isClicked = !!stepUserReacts[emoji];
                            if (baseReacts.some(r => r.emoji === emoji)) return null;
                            return (
                              <button
                                key={emoji}
                                onClick={() => handleToggleUserReaction(step.id, emoji)}
                                className={`h-5 w-5 flex items-center justify-center border rounded-full text-[10px] hover:scale-110 transition-transform ${
                                  isClicked 
                                    ? 'bg-blue-50 border-blue-300 dark:bg-blue-900/20 dark:border-blue-800' 
                                    : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800'
                                }`}
                              >
                                {emoji}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })}

              {/* Replying loading indicators */}
              {isReplying && (
                <div className="flex gap-3 text-xs animate-pulse">
                  <div className="h-8 w-8 rounded bg-blue-600 text-white flex items-center justify-center font-bold text-[10px] uppercase shadow-sm">
                    OC
                  </div>
                  <div className="space-y-1">
                    <span className="font-bold text-zinc-900 dark:text-white">AgentHub Coordinator</span>
                    <div className="flex items-center gap-2 text-zinc-400 mt-1">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Consulting workspace agents...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Input Send Area */}
            <div className="p-4 border-t border-zinc-250 dark:border-zinc-800/60 bg-white dark:bg-[#0c0c0f]">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input 
                  type="text"
                  value={typedMessage}
                  onChange={e => setTypedMessage(e.target.value)}
                  placeholder={`Message #${activeTask.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                  disabled={isReplying}
                  className="flex-1 bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-xs text-zinc-950 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                />
                <button 
                  type="submit"
                  disabled={isReplying || !typedMessage.trim()}
                  className="px-4 py-2.5 bg-blue-650 hover:bg-blue-600 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow flex items-center justify-center cursor-pointer transition-colors"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-zinc-400 text-xs p-10 space-y-2">
            <MessageSquare className="h-8 w-8 text-zinc-300 dark:text-zinc-700" />
            <span>No active threads. Run a task in the Task Center first to begin.</span>
          </div>
        )}
      </div>

    </div>
  );
}
