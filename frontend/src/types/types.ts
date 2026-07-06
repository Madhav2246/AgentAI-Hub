export interface Agent {
  id: string;
  name: string;
  role: string;
  goal: string;
  backstory: string;
  department: 'Sales' | 'Marketing' | 'Finance' | 'Legal' | 'Engineering' | 'Operations' | 'Support';
  tools: string[];
  memory: boolean;
  model: string;
  temperature: number;
  instructions: string;
  permissions: string[];
  knowledgeSources: string[];
  communicationStyle: string;
  status: 'idle' | 'working' | 'collaborating' | 'paused';
  performance: {
    tasksCompleted: number;
    avgLatencyMs: number;
    successRate: number;
    tokensUsed: number;
    costIncurred: number;
  };
  avatarColor: string;
}

export interface StepLog {
  id: string;
  timestamp: string;
  agentId: string;
  agentName: string;
  role: string;
  type: 'thought' | 'message' | 'tool_call' | 'tool_response' | 'routing' | 'conclusion';
  content: string;
  targetAgentId?: string;
  targetAgentName?: string;
  metadata?: {
    toolName?: string;
    confidence?: number;
    tokens?: number;
    cost?: number;
    latencyMs?: number;
  };
}

export interface Task {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  department: string;
  assignedAgentId?: string;
  steps: StepLog[];
  createdAt: string;
  completedAt?: string;
  inputText?: string;
  outputText?: string;
  totalTokens?: number;
  totalCost?: number;
  durationMs?: number;
  confidence?: number;
}

export interface WorkflowConnection {
  source: string;
  target: string;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  nodes: string[]; // List of agent IDs
  connections: WorkflowConnection[];
  status: 'idle' | 'running' | 'completed' | 'failed';
  activeTaskId?: string;
}

export interface KnowledgeSource {
  id: string;
  name: string;
  type: 'pdf' | 'docx' | 'xlsx' | 'csv' | 'image' | 'url' | 'notion';
  sizeBytes: number;
  searchable: boolean;
  description: string;
  uploadedAt: string;
}

export interface ApiKeys {
  openai: string;
  anthropic: string;
  google: string;
  groq: string;
  openrouter: string;
}

export interface AnalyticsData {
  totalTasks: number;
  completedTasks: number;
  activeAgents: number;
  averageResponseTimeMs: number;
  totalCost: number;
  tokenUsage: number;
  satisfactionRate: number;
  costHistory: { date: string; value: number }[];
  latencyHistory: { date: string; value: number }[];
  taskHistory: { date: string; completed: number; failed: number }[];
}
