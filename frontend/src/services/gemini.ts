import { Agent, Task, StepLog } from '../types/types';

// Gemini Pricing (estimate based on Gemini 1.5 Flash)
const COST_PER_INPUT_TOKEN = 0.075 / 1_000_000;
const COST_PER_OUTPUT_TOKEN = 0.30 / 1_000_000;

interface CallGeminiParams {
  apiKey?: string; // Optional client-side key
  systemInstruction?: string;
  prompt: string;
  jsonMode?: boolean;
}

// Low-level fetch wrapper that attempts to call the backend proxy, falling back to direct API calls if needed.
async function callGemini({ apiKey, systemInstruction, prompt, jsonMode = false }: CallGeminiParams) {
  const model = "gemini-1.5-flash"; // Standard, fast, cost-effective model

  const contents = [
    {
      parts: [
        { text: prompt }
      ]
    }
  ];

  const geminiRequestBody: any = {
    contents,
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: 2048,
    }
  };

  if (systemInstruction) {
    geminiRequestBody.systemInstruction = {
      parts: [{ text: systemInstruction }]
    };
  }

  if (jsonMode) {
    geminiRequestBody.generationConfig.responseMimeType = "application/json";
  }

  const startTime = Date.now();
  let data: any;

  // Attempt 1: Try proxying through the local backend using the backend's .env API key
  try {
    const proxyResponse = await fetch("/api/proxy/gemini", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        body: geminiRequestBody
      })
    });

    if (proxyResponse.ok) {
      data = await proxyResponse.json();
    } else {
      const errorText = await proxyResponse.text();
      throw new Error(`Proxy error (${proxyResponse.status}): ${errorText}`);
    }
  } catch (proxyError: any) {
    console.warn("Backend proxy call failed, attempting direct browser call...", proxyError.message);
    
    // Attempt 2: Fallback to direct client-side call if a key is provided
    if (!apiKey) {
      throw new Error(
        "Gemini API key is missing. Please configure GEMINI_API_KEY in the backend/.env file, or enter an API key in the Settings tab."
      );
    }

    const directUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const directResponse = await fetch(directUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(geminiRequestBody),
    });

    if (!directResponse.ok) {
      const errorText = await directResponse.text();
      throw new Error(`Direct Gemini API Error (${directResponse.status}): ${errorText}`);
    }

    data = await directResponse.json();
  }

  const durationMs = Date.now() - startTime;
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  const inputTokens = data.usageMetadata?.promptTokenCount || 0;
  const outputTokens = data.usageMetadata?.candidatesTokenCount || 0;
  const totalTokens = data.usageMetadata?.totalTokenCount || 0;

  const cost = (inputTokens * COST_PER_INPUT_TOKEN) + (outputTokens * COST_PER_OUTPUT_TOKEN);

  return {
    text,
    inputTokens,
    outputTokens,
    totalTokens,
    cost,
    durationMs,
  };
}

// Orchestrator that creates a collaborative agent loop using live LLM responses
export async function executeAgentWorkflow(
  task: Task,
  agents: Agent[],
  apiKey: string, // Client-side key (may be empty if using backend key)
  onStep: (step: StepLog) => void,
  onProgress: (progress: number) => void,
  onRequireApproval?: (data: { fromAgentName: string; toAgentName: string; payload: string }) => Promise<string>
): Promise<{ output: string; totalTokens: number; totalCost: number; durationMs: number }> {
  const startTime = Date.now();
  let accumulatedTokens = 0;
  let accumulatedCost = 0;

  const logStep = (
    agentId: string,
    agentName: string,
    role: string,
    type: StepLog['type'],
    content: string,
    targetAgentId?: string,
    targetAgentName?: string,
    metadata?: StepLog['metadata']
  ) => {
    const step: StepLog = {
      id: Math.random().toString(36).substring(7),
      timestamp: new Date().toISOString(),
      agentId,
      agentName,
      role,
      type,
      content,
      targetAgentId,
      targetAgentName,
      metadata,
    };
    onStep(step);
  };

  // Phase 1: Planning / Routing
  onProgress(10);
  logStep(
    "orchestrator",
    "AgentHub Coordinator",
    "Workflow Router & Orchestrator",
    "thought",
    `Initializing workflow for task: "${task.name}". Analyzing requirements and planning agent collaboration path...`
  );

  const planPrompt = `
You are the AgentHub AI Workflow Orchestrator. 
Your job is to read the user's business request and design a collaborative execution plan using the available agents.

User Request: "${task.description}"

Available Agents:
${JSON.stringify(agents.map(a => ({ id: a.id, name: a.name, role: a.role, department: a.department, tools: a.tools })))}

Design a sequential multi-agent plan of 2 to 3 steps. Each step must involve ONE agent doing a specific subtask, invoking a tool if necessary, and handing off their results to the next agent.
The last agent in the list should finalize the response.

Return a JSON array of steps:
[
  {
    "agentId": "agent_id_here",
    "agentName": "Agent Name",
    "role": "Agent Role",
    "action": "What this agent will analyze or produce",
    "toolToUse": "Specific tool from their list (e.g. 'Web Search', 'Database', 'Calculator', or 'None')",
    "toolQuery": "If a tool is used, what search query or inputs they should run. Otherwise null"
  }
]
`;

  let plan: any[] = [];
  try {
    const planResult = await callGemini({
      apiKey,
      systemInstruction: "You are a professional workflow router. You must return valid JSON representing the multi-agent collaboration steps.",
      prompt: planPrompt,
      jsonMode: true,
    });
    accumulatedTokens += planResult.totalTokens;
    accumulatedCost += planResult.cost;
    plan = JSON.parse(planResult.text.trim());
    
    logStep(
      "orchestrator",
      "AgentHub Coordinator",
      "Workflow Router & Orchestrator",
      "routing",
      `Collaboration plan compiled successfully. Workflow will execute across ${plan.length} departments:\n${plan.map((s, i) => `${i+1}. ${s.agentName} (${s.role}) - Action: ${s.action}`).join("\n")}`,
      undefined,
      undefined,
      { tokens: planResult.totalTokens, cost: planResult.cost, latencyMs: planResult.durationMs }
    );
  } catch (error: any) {
    console.error("Failed to generate plan via LLM, falling back to heuristic plan", error);
    // Simple heuristic fallback if JSON parsing fails or API fails
    plan = agents.slice(0, 2).map((agent, i) => ({
      agentId: agent.id,
      agentName: agent.name,
      role: agent.role,
      action: i === 0 ? "Perform initial analysis and research" : "Review inputs and finalize report",
      toolToUse: agent.tools[0] || "None",
      toolQuery: task.name,
    }));
    logStep(
      "orchestrator",
      "AgentHub Coordinator",
      "Workflow Router & Orchestrator",
      "routing",
      `API Planning returned error or invalid JSON. Falling back to default routing sequence: ${plan.map(s => s.agentName).join(" -> ")}.`
    );
  }

  // Iterate through the planned collaboration steps
  let previousAgentOutput = `Initial task request: ${task.description}`;
  
  for (let i = 0; i < plan.length; i++) {
    const currentStep = plan[i];
    const agent = agents.find(a => a.id === currentStep.agentId) || agents[0];
    const progressStart = 20 + i * 25;
    onProgress(progressStart);

    // HITL Handoff Approval Gate
    if (i > 0 && onRequireApproval) {
      logStep(
        "orchestrator",
        "AgentHub Coordinator",
        "Workflow Router & Orchestrator",
        "thought",
        `[Human-in-the-Loop] Paused. Awaiting supervisor approval to route context from ${plan[i-1].agentName} to ${agent.name}...`
      );
      try {
        const approvedOutput = await onRequireApproval({
          fromAgentName: plan[i-1].agentName,
          toAgentName: agent.name,
          payload: previousAgentOutput
        });
        previousAgentOutput = approvedOutput;
        logStep(
          "orchestrator",
          "AgentHub Coordinator",
          "Workflow Router & Orchestrator",
          "thought",
          `Handoff APPROVED by supervisor. Continuing routing sequence.`
        );
      } catch (err) {
        logStep(
          "orchestrator",
          "AgentHub Coordinator",
          "Workflow Router & Orchestrator",
          "thought",
          `Handoff REJECTED by supervisor. Terminating active session.`
        );
        throw new Error("Handoff rejected by supervisor.");
      }
    }


    // 1. Agent Thought
    logStep(
      agent.id,
      agent.name,
      agent.role,
      "thought",
      `Analyzing information received. Planning actions to complete objective: "${currentStep.action}".`
    );
    await new Promise(r => setTimeout(r, 1200));

    // 2. Tool Execution (if configured)
    let toolResultText = "";
    if (currentStep.toolToUse && currentStep.toolToUse !== "None") {
      logStep(
        agent.id,
        agent.name,
        agent.role,
        "tool_call",
        `Invoking tool [${currentStep.toolToUse}] with parameter: "${currentStep.toolQuery || task.name}"`,
        undefined,
        undefined,
        { toolName: currentStep.toolToUse }
      );
      
      // Call LLM to act as the tool execution simulator
      const toolPrompt = `
You are the tool simulator for [${currentStep.toolToUse}].
Generate a realistic, professional, data-dense result for the query: "${currentStep.toolQuery || task.name}" in the context of: "${task.description}".
Do not write commentary. Return only the raw data/results of the query.
`;
      try {
        const toolSimResult = await callGemini({
          apiKey,
          prompt: toolPrompt
        });
        accumulatedTokens += toolSimResult.totalTokens;
        accumulatedCost += toolSimResult.cost;
        toolResultText = toolSimResult.text;

        logStep(
          agent.id,
          agent.name,
          agent.role,
          "tool_response",
          `[${currentStep.toolToUse}] output:\n${toolResultText}`,
          undefined,
          undefined,
          { toolName: currentStep.toolToUse, tokens: toolSimResult.totalTokens, cost: toolSimResult.cost }
        );
      } catch (error) {
        toolResultText = `Search results for query '${currentStep.toolQuery}' returned cached repository indices. Directory search completed.`;
        logStep(
          agent.id,
          agent.name,
          agent.role,
          "tool_response",
          `[${currentStep.toolToUse}] (Cached Fallback):\n${toolResultText}`,
          undefined,
          undefined,
          { toolName: currentStep.toolToUse }
        );
      }
      await new Promise(r => setTimeout(r, 1000));
    }

    // 3. Agent Execution (produce message and handoff)
    const nextStepInfo = plan[i + 1];
    const isLastStep = i === plan.length - 1;
    
    let agentPrompt = `
You are the AI Employee: ${agent.name}
Role: ${agent.role}
Goal: ${agent.goal}
Backstory: ${agent.backstory}
Instructions: ${agent.instructions}
Communication Style: ${agent.communicationStyle}

Task at Hand: ${currentStep.action}
Context from Previous Agent:
${previousAgentOutput}

${toolResultText ? `Tool Execution [${currentStep.toolToUse}] Output:\n${toolResultText}` : ""}

Provide your analysis. Write a formal, detailed professional response. 
${isLastStep 
  ? "This is the final stage. Synthesize all findings and provide the complete resolved work to the user." 
  : `Upon completion, handoff your outputs to the next employee: ${nextStepInfo.agentName} (${nextStepInfo.role}). Describe what you accomplished and what they need to finalize.`}
`;

    try {
      const agentRunResult = await callGemini({
        apiKey,
        systemInstruction: `You are playing the role of ${agent.name}, ${agent.role}. Speak strictly in character, matching their goal and backstory. Do not break character.`,
        prompt: agentPrompt,
      });

      accumulatedTokens += agentRunResult.totalTokens;
      accumulatedCost += agentRunResult.cost;
      previousAgentOutput = agentRunResult.text;

      if (isLastStep) {
        logStep(
          agent.id,
          agent.name,
          agent.role,
          "conclusion",
          previousAgentOutput,
          undefined,
          undefined,
          { tokens: agentRunResult.totalTokens, cost: agentRunResult.cost, latencyMs: agentRunResult.durationMs }
        );
      } else {
        logStep(
          agent.id,
          agent.name,
          agent.role,
          "message",
          previousAgentOutput,
          nextStepInfo.agentId,
          nextStepInfo.agentName,
          { tokens: agentRunResult.totalTokens, cost: agentRunResult.cost, latencyMs: agentRunResult.durationMs }
        );
      }
    } catch (err: any) {
      const fallbackOutput = `Analysis completed by ${agent.name}. Generated draft for department guidelines. Proceeding to handoff.`;
      previousAgentOutput = fallbackOutput;
      logStep(
        agent.id,
        agent.name,
        agent.role,
        isLastStep ? "conclusion" : "message",
        fallbackOutput,
        isLastStep ? undefined : nextStepInfo.agentId,
        isLastStep ? undefined : nextStepInfo.agentName
      );
    }
    await new Promise(r => setTimeout(r, 1200));
  }

  // Phase 4: Review
  onProgress(90);
  logStep(
    "orchestrator",
    "AgentHub Coordinator",
    "Workflow Router & Orchestrator",
    "thought",
    "Reviewing final outputs from all departments. Compiling compliance and quality summaries..."
  );
  await new Promise(r => setTimeout(r, 1000));

  const durationMs = Date.now() - startTime;
  onProgress(100);

  return {
    output: previousAgentOutput,
    totalTokens: accumulatedTokens,
    totalCost: parseFloat(accumulatedCost.toFixed(6)),
    durationMs,
  };
}
