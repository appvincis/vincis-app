import { zodResponseFormat } from 'openai/helpers/zod';
import OpenAI from 'openai';
import { z } from 'zod';

export const nvidiaClient = new OpenAI({
  baseURL: 'https://integrate.api.nvidia.com/v1',
  apiKey: process.env.NVIDIA_API_KEY || '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'
});

export interface NvidiaGenerateObjectOptions<T> {
  prompt: string;
  system?: string;
  schema: z.ZodType<T>;
}

export async function generateObjectNvidia<T>({
  prompt,
  system,
  schema
}: NvidiaGenerateObjectOptions<T>): Promise<{ object: T; usage?: any }> {
  const systemPrompt = system ? [{ role: 'system', content: system }] : [];
  const messages = [
    ...systemPrompt,
    { role: 'user', content: prompt }
  ];

  console.log(`[NVIDIA-SDK] Calling Chat Completion with model nvidia/nemotron-3-nano-omni-30b-a3b-reasoning...`);
  const completion = await nvidiaClient.chat.completions.create({
    model: 'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning',
    messages: messages as any,
    temperature: 0.6,
    top_p: 0.95,
    max_tokens: 65536,
    response_format: zodResponseFormat(schema as any, 'result'),
    extra_body: {
      chat_template_kwargs: { enable_thinking: true },
      reasoning_budget: 16384
    },
    stream: false
  } as any);

  const message = completion.choices[0].message;
  
  // Extract and print reasoning_content
  const reasoning = (message as any).reasoning_content;
  if (reasoning) {
    console.log("=== REASONING CONTENT ===");
    console.log(reasoning);
  }
  
  console.log("=== CONTENT ===");
  console.log(message.content);

  if (!message.content) {
    throw new Error('NVIDIA NIM model returned empty content.');
  }

  const parsed = JSON.parse(message.content);
  const validated = schema.parse(parsed);
  return {
    object: validated,
    usage: completion.usage
  };
}
