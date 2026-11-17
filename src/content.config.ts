import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const work = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/work' }),
  schema: z.object({
    title: z.string(),
    // The one-line outcome hook shown on the home page list.
    outcome: z.string(),
    client: z.string().optional(),
    role: z.string().default('Design, engineering, deployment'),
    period: z.string(),
    stack: z.array(z.string()),
    // Optional "How it works" diagram: the system's steps, in order.
    flow: z
      .array(z.object({ step: z.string(), detail: z.string() }))
      .optional(),
    order: z.number().default(99),
    draft: z.boolean().default(false),
  }),
});

export const collections = { work };
