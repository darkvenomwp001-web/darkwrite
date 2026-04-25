'use server';
/**
 * @fileOverview An AI writing companion that provides grammar, spelling, and style suggestions.
 *
 * - aiWritingEnhancer - A function that enhances writing with AI suggestions.
 * - AiWritingEnhancerInput - The input type for the aiWritingEnhancer function.
 * - AiWritingEnhancerOutput - The return type for the aiWritingEnhancer function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiWritingEnhancerInputSchema = z.object({
  text: z.string().describe('The text content of the story or chapter to be enhanced.'),
});
export type AiWritingEnhancerInput = z.infer<typeof AiWritingEnhancerInputSchema>;

const AiWritingEnhancerOutputSchema = z.object({
  grammarSuggestions: z
    .array(
      z.object({
        original: z.string().describe('The original phrase or sentence with a grammar issue.'),
        suggestion: z.string().describe('The suggested correction for the grammar issue.'),
        explanation: z.string().describe('An explanation of the grammar rule or reason for the suggestion.'),
      })
    )
    .describe('A list of grammar suggestions.'),
  spellingSuggestions: z
    .array(
      z.object({
        original: z.string().describe('The original word with a spelling error.'),
        suggestion: z.string().describe('The suggested correct spelling.'),
        explanation: z.string().describe('An explanation for the spelling correction.'),
      })
    )
    .describe('A list of spelling suggestions.'),
  styleSuggestions: z
    .array(
      z.object({
        original: z.string().describe('The original phrase, sentence, or paragraph with a style issue.'),
        suggestion: z.string().describe('The suggested stylistic improvement.'),
        explanation: z.string().describe('An explanation of the stylistic advice (e.g., clarity, conciseness, tone).'),
      })
    )
    .describe('A list of style suggestions.'),
  overallFeedback: z.string().describe('General feedback on the writing, covering clarity, professionalism, and impact.').optional(),
});
export type AiWritingEnhancerOutput = z.infer<typeof AiWritingEnhancerOutputSchema>;

export async function aiWritingEnhancer(input: AiWritingEnhancerInput): Promise<AiWritingEnhancerOutput> {
  return aiWritingEnhancerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiWritingEnhancerPrompt',
  input: {schema: AiWritingEnhancerInputSchema},
  output: {schema: AiWritingEnhancerOutputSchema},
  prompt: `You are an AI writing companion designed to help writers improve the clarity and professionalism of their stories. You will analyze the provided text and offer specific, actionable suggestions for grammar, spelling, and writing style.

Your feedback should be structured as follows:
- Grammar suggestions: Identify any grammatical errors (e.g., subject-verb agreement, tense, punctuation) and provide corrected versions along with a brief explanation of the rule violated.
- Spelling suggestions: Correct any misspelled words, including proper nouns if they are clearly intended to be different (e.g., character names), and provide a simple explanation.
- Style suggestions: Offer advice on improving sentence structure, conciseness, word choice, flow, and overall impact. Focus on making the writing more engaging, clear, and professional. Avoid overly aggressive rewrites; instead, suggest specific improvements.
- Overall feedback: Provide a concise summary of the writing's strengths and areas for general improvement.

Analyze the following text:

TEXT:
{{{text}}}`, 
});

const aiWritingEnhancerFlow = ai.defineFlow(
  {
    name: 'aiWritingEnhancerFlow',
    inputSchema: AiWritingEnhancerInputSchema,
    outputSchema: AiWritingEnhancerOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('AI Writing Enhancer failed to produce output.');
    }
    return output;
  }
);
