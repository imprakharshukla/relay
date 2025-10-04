import { createOpenAI } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";
import type { LinearContext, AIGeneratedIssue } from "../types/index.js";

const IssueSchema = z.object({
  title: z.string().describe("Concise, action-oriented issue title"),
  description: z
    .string()
    .describe(
      "Comprehensive issue description with problem statement, acceptance criteria, and technical considerations",
    ),
  projectId: z.string().optional().describe("ID of the best matching project"),
  labelIds: z.array(z.string()).describe("Array of 2-5 relevant label IDs"),
  priority: z
    .number()
    .min(0)
    .max(4)
    .describe(
      "Priority level: 0=No priority, 1=Urgent, 2=High, 3=Normal, 4=Low",
    ),
  assigneeId: z
    .string()
    .optional()
    .describe("ID of suggested assignee if obvious from context"),
});

export class AIService {
  private provider: ReturnType<typeof createOpenAI>;
  private model: string;

  constructor(apiKey: string, model: string = "x-ai/grok-4-fast") {
    // Configure OpenAI provider to use OpenRouter
    this.provider = createOpenAI({
      apiKey,
      baseURL: "https://openrouter.ai/api/v1",
    });
    this.model = model;
  }

  async analyzeTask(
    userInput: string,
    context: LinearContext,
  ): Promise<AIGeneratedIssue> {
    const prompt = this.buildPrompt(userInput, context);

    try {
      const result = await generateObject({
        model: this.provider(this.model),
        schema: IssueSchema,
        prompt,
        temperature: 0.7,
      });

      return result.object as AIGeneratedIssue;
    } catch (error: any) {
      throw new Error(`AI analysis failed: ${error.message}`);
    }
  }

  private buildPrompt(userInput: string, context: LinearContext): string {
    const projectsList = context.projects
      .map(
        (p) =>
          `- ${p.name} (ID: ${p.id}): ${p.description || "No description"}`,
      )
      .join("\n");

    const labelsList = context.labels
      .map(
        (l) =>
          `- ${l.name} (ID: ${l.id}): ${l.description || "No description"}`,
      )
      .join("\n");

    const teamsList = context.teams
      .map((t) => `- ${t.name} (${t.key}, ID: ${t.id})`)
      .join("\n");

    return `You are an expert project manager analyzing a task to create a comprehensive Linear issue.

Task: "${userInput}"

Available Context:

TEAMS:
${teamsList}

PROJECTS:
${projectsList}

LABELS:
${labelsList}

Instructions:
1. Analyze the task and determine the best matching project based on the description
2. Select 2-5 relevant labels that best categorize this task
3. Create a concise, action-oriented title (50 chars max)
4. Write a comprehensive description that includes:
   - Clear problem statement or feature request
   - Acceptance criteria (bullet points)
   - Technical considerations or context
   - Any potential edge cases or dependencies
5. Suggest an appropriate priority level (3=Normal is default unless the task indicates urgency)
6. Only suggest an assignee if it's absolutely obvious from the context

Make the issue as information-dense as possible to help developers understand the scope and requirements immediately.`;
  }
}
