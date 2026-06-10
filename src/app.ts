import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';
import dotenv from 'dotenv';

import fs from 'fs';
import path from 'path';
dotenv.config({ path: path.join(__dirname, '../.env') });

export const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.NVIDIA_API_KEY || 'dummy_key',
  baseURL: 'https://integrate.api.nvidia.com/v1',
});

async function readAllMarkdown(dir: string): Promise<string> {
  let content = '';
  const entries = await fs.promises.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      content += await readAllMarkdown(fullPath);
    } else if (entry.name.endsWith('.md')) {
      content += `\n\n--- File: ${entry.name} ---\n\n`;
      content += await fs.promises.readFile(fullPath, 'utf-8');
    }
  }
  return content;
}

app.post('/api/generate', async (req, res) => {
  try {
    const { prompt, docType = 'concise' } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    let docsContent = "";
    const baseDocsDir = path.join(__dirname, '../../');
    
    if (docType === 'detailed') {
      const detailedDir = path.join(baseDocsDir, 'docs_detailed');
      docsContent = await readAllMarkdown(detailedDir);
    } else {
      const conciseFile = path.join(baseDocsDir, 'docs_concise', 'MechTeX_Language_Reference.md');
      docsContent = await fs.promises.readFile(conciseFile, 'utf-8');
    }

    const SYSTEM_PROMPT = `You are an expert MechTeX code generator.
MechTeX is a strict LaTeX-like language for mechanical diagrams.
You must return ONLY valid MechTeX code enclosed in \\begin{system} and \\end{system}. Do NOT include markdown code blocks.

Here is the documentation:
${docsContent}

Return ONLY raw MechTeX code.`;


    const completion = await openai.chat.completions.create({
      model: "google/gemma-4-31b-it",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt }
      ],
      temperature: 0.2,
      top_p: 0.7,
      max_tokens: 1024,
      stream: false
    });

    const content = completion.choices[0]?.message?.content || "";
    // Clean up if it returned markdown
    const cleaned = content.replace(/^```[a-zA-Z]*\n/, '').replace(/```$/, '').trim();
    res.json({ code: cleaned });
  } catch (error: any) {
    console.error('Generation error:', error);
    res.status(500).json({ error: 'Failed to generate code', details: error.message });
  }
});
