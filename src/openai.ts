import z from "zod";
import { supabase } from "./index";
import { attachment, mock_completion, rulesDef } from "./openai_utils";
import OpenAI from "openai";
import zodToJsonSchema from "zod-to-json-schema";

const snippetSchema = z.object({
  actionDescription: z.string().describe("concise description of what this action does example: move element X and export it"),
  actionType: z.enum(['create', 'update']).describe("type of action: 'create' for creating new code, 'update' for modifying existing code"),
  language: z.string().describe('the language of the source code'),
  path: z.string().describe("the file path"),
  sourceCode: z.string().optional().describe("the source code, to be ignored if running in DRY mode")
});

const limit = 5;
const mock = false;
let apiCallCount = 0;

interface document {
  path: string,
  content: string | "NONE"
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function handleOpenAiCompletion(taskId: number, project_root: string) {
  if (apiCallCount >= limit) {
    throw new Error("API call limit reached");
  }
  const task = await supabase.from('task').select('*').eq('id', taskId).single();
  if (task.error) {
    throw new Error("Task not found");
  }
  await supabase.from('task').update({ state: 'PROCESSING' }).eq('id', task.data.id);
  const documents: document[] = (task.data.attachments as unknown as document[])?.map(elem => elem);
  const messages: OpenAI.ChatCompletionMessageParam[] = [
    {
      role: 'system', content: `${rulesDef}
  #define no-partial-code "Always output the complete code without any omissions." #end
  #define no-broken-dependencies "If you move files around, make sure the dependencies stays intact or create them if required" #end
      `
    },
    {
      role: "user", content: `
    attachments:
      ${documents.map(doc => attachment(doc.path.substring(project_root.length), doc.content)).join('\n')}
    prompt:
      ${task.data.prompt}
    ` }
  ];

  const tools: OpenAI.ChatCompletionTool[] = [
    {
      type: "function",
      function: {
        name: "codeSnippets",
        description: "the function to call with the result",
        parameters: zodToJsonSchema(snippetSchema)
      }
    }
  ];

  const response = mock ? JSON.parse(mock_completion) : await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: messages,
    tools: tools,
    tool_choice: "required",
  });
  await supabase.from('task').update({ completion_response: JSON.stringify(response) }).eq('id', taskId)
  console.log("!response", JSON.stringify(response, null, 2));
  console.log("Task ID:", taskId);
  console.log("Task Data:", JSON.stringify(task.data, null, 2));
  console.log("Documents:", JSON.stringify(documents, null, 2));
  console.log("Messages:", JSON.stringify(messages, null, 2));
  console.log("!openai task", JSON.stringify(task));
  await supabase.from('task').update({ state: 'COMPLETED' }).eq('id', task.data.id);
}