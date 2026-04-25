'use server';
/**
 * @fileOverview An AI writing companion that generates creative writing prompts or expands on existing ideas.
 *
 * - generateAiPrompt - A function that generates a writing prompt or expands on an idea.
 * - AiPromptGeneratorInput - The input type for the generateAiPrompt function.
 * - AiPromptGeneratorOutput - The return type for the generateAiPrompt function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AiPromptGeneratorInputSchema = z.object({
  existingIdea: z
    .string()
    .optional()
    .describe(
      'An optional existing idea or initial thought the writer wants to expand upon.'
    ),
  promptTone: z
    .string()
    .optional()
    .describe(
      'An optional tone for the generated prompt or expanded idea (e.g., mysterious, adventurous, humorous).'
    ),
});
export type AiPromptGeneratorInput = z.infer<typeof AiPromptGeneratorInputSchema>;

const AiPromptGeneratorOutputSchema = z.object({
  generatedContent: z
    .string()
    .describe('The generated creative writing prompt or expanded idea.'),
});
export type AiPromptGeneratorOutput = z.infer<typeof AiPromptGeneratorOutputSchema>;

export async function generateAiPrompt(
  input: AiPromptGeneratorInput
): Promise<AiPromptGeneratorOutput> {
  return aiPromptGeneratorFlow(input);
}

const aiPromptGeneratorPrompt = ai.definePrompt({
  name: 'aiPromptGeneratorPrompt',
  input: { schema: AiPromptGeneratorInputSchema },
  output: { schema: AiPromptGeneratorOutputSchema },
  prompt: `You are a creative writing assistant named DarkWrite. Your goal is to inspire writers and help them overcome writer's block.

{{#if existingIdea}}
Expand on the following idea, providing rich detail, potential plot points, character motivations, and world-building elements. Make it intriguing and inspiring.
{{#if promptTone}}The expansion should have a {{promptTone}} tone.{{/if}}

Idea to expand:
{{{existingIdea}}}
{{else}}
Generate a unique and inspiring writing prompt for a story. Focus on creating a compelling starting point for a story, including a brief setup, interesting character types, and a potential conflict or mystery. Make it open-ended enough for a writer to build upon.
{{#if promptTone}}The prompt should have a {{promptTone}} tone.{{/if}}
{{/if}}`,
});

const aiPromptGeneratorFlow = ai.defineFlow(
  {
    name: 'aiPromptGeneratorFlow',
    inputSchema: AiPromptGeneratorInputSchema,
    outputSchema: AiPromptGeneratorOutputSchema,
  },
  async (input) => {
    const { output } = await aiPromptGeneratorPrompt(input);
    return output!;
  }
);
