export const rulesDef = `Rules-definitions are pre-defined rules that you must follow. The format for defining a rule is as follows:

#define <rule_name> <rule_to_stick_to> #end

This format is inspired by C. Any output that does not adhere to a defined rule will be rejected.

Defined rules:
`;

export const backtick = (content: string) => { return `\`\`\`${content}\`\`\``; };

export function attachment(path: string, sourceCode: string) {
  return `here is the file located at \`${path}\`:

${backtick(sourceCode)}
  `
}

export const mock_completion = "{\"id\":\"chatcmpl-9frlO0aRXjxTTZojgAz5jhibsbsqZ\",\"object\":\"chat.completion\",\"created\":1719765142,\"model\":\"gpt-4o-2024-05-13\",\"choices\":[{\"index\":0,\"message\":{\"role\":\"assistant\",\"content\":null,\"tool_calls\":[{\"id\":\"call_S0lJaVHuUKFOqsccsAi8Ir7y\",\"type\":\"function\",\"function\":{\"name\":\"codeSnippets\",\"arguments\":\"{\\\"actionDescription\\\": \\\"create sum function in separate file\\\", \\\"actionType\\\": \\\"create\\\", \\\"language\\\": \\\"typescript\\\", \\\"path\\\": \\\"/Users/shadokan87/duc-Kopilot/utils/sum.ts\\\", \\\"sourceCode\\\": \\\"export function sum(a: number, b: number) {\\\\n  return a + b;\\\\n}\\\"}\"}},{\"id\":\"call_yPdqTrUH9amVUZYxWnJDLrjT\",\"type\":\"function\",\"function\":{\"name\":\"codeSnippets\",\"arguments\":\"{\\\"actionDescription\\\": \\\"create divide function in separate file\\\", \\\"actionType\\\": \\\"create\\\", \\\"language\\\": \\\"typescript\\\", \\\"path\\\": \\\"/Users/shadokan87/duc-Kopilot/utils/divide.ts\\\", \\\"sourceCode\\\": \\\"export function divide(a: number, b: number) {\\\\n  return a / b;\\\\n}\\\"}\"}},{\"id\":\"call_7TsfkFa4zW6XZrvweUYkGDsl\",\"type\":\"function\",\"function\":{\"name\":\"codeSnippets\",\"arguments\":\"{\\\"actionDescription\\\": \\\"create iamABanana function in separate file\\\", \\\"actionType\\\": \\\"create\\\", \\\"language\\\": \\\"typescript\\\", \\\"path\\\": \\\"/Users/shadokan87/duc-Kopilot/utils/iamABanana.ts\\\", \\\"sourceCode\\\": \\\"export function iamABanana() {\\\\n  console.log(\\\\\\\"it's true !\\\\\\\");\\\\n}\\\"}\"}},{\"id\":\"call_gmLMY2l2IXdsXFC0yYy1e84S\",\"type\":\"function\",\"function\":{\"name\":\"codeSnippets\",\"arguments\":\"{\\\"actionDescription\\\": \\\"update main file to remove moved functions and add imports\\\", \\\"actionType\\\": \\\"update\\\", \\\"language\\\": \\\"typescript\\\", \\\"path\\\": \\\"/Users/shadokan87/duc-Kopilot/mocks/helloWorld/main.ts\\\", \\\"sourceCode\\\": \\\"import { divide } from '../../utils/divide';\\\\nimport { sum } from '../../utils/sum';\\\\nimport { iamABanana } from '../../utils/iamABanana';\\\\n\\\\nfunction main() {\\\\n  console.log(\\\\\\\"test\\\\\\\", divide(42, 3), sum(15, 62));\\\\n}\\\\n\\\"}\"}}]},\"logprobs\":null,\"finish_reason\":\"stop\"}],\"usage\":{\"prompt_tokens\":379,\"completion_tokens\":365,\"total_tokens\":744},\"system_fingerprint\":\"fp_ce0793330f\"}"