"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const openai_1 = __importDefault(require("openai"));
const dotenv_1 = __importDefault(require("dotenv"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
try {
    dotenv_1.default.config({ path: path_1.default.join(__dirname, '../.env') });
}
catch (_a) { }
exports.app = (0, express_1.default)();
exports.app.use((0, cors_1.default)());
exports.app.use(express_1.default.json());
const openai = new openai_1.default({
    apiKey: process.env.NVIDIA_API_KEY || 'dummy_key',
    baseURL: 'https://integrate.api.nvidia.com/v1',
});
function readAllMarkdown(dir) {
    return __awaiter(this, void 0, void 0, function* () {
        let content = '';
        const entries = yield fs_1.default.promises.readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path_1.default.join(dir, entry.name);
            if (entry.isDirectory()) {
                content += yield readAllMarkdown(fullPath);
            }
            else if (entry.name.endsWith('.md')) {
                content += `\n\n--- File: ${entry.name} ---\n\n`;
                content += yield fs_1.default.promises.readFile(fullPath, 'utf-8');
            }
        }
        return content;
    });
}
exports.app.post('/api/generate', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { prompt, docType = 'concise' } = req.body;
        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }
        let docsContent = "";
        const baseDocsDir = path_1.default.join(__dirname, '../../');
        if (docType === 'detailed') {
            const detailedDir = path_1.default.join(baseDocsDir, 'docs_detailed');
            docsContent = yield readAllMarkdown(detailedDir);
        }
        else {
            const conciseFile = path_1.default.join(baseDocsDir, 'docs_concise', 'MechTeX_Language_Reference.md');
            docsContent = yield fs_1.default.promises.readFile(conciseFile, 'utf-8');
        }
        const SYSTEM_PROMPT = `You are an expert MechTeX code generator.
MechTeX is a strict LaTeX-like language for mechanical diagrams.
You must return ONLY valid MechTeX code enclosed in \\begin{system} and \\end{system}. Do NOT include markdown code blocks.

Here is the documentation:
${docsContent}

Return ONLY raw MechTeX code.`;
        const completion = yield openai.chat.completions.create({
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
        const content = ((_b = (_a = completion.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content) || "";
        // Clean up if it returned markdown
        const cleaned = content.replace(/^```[a-zA-Z]*\n/, '').replace(/```$/, '').trim();
        res.json({ code: cleaned });
    }
    catch (error) {
        console.error('Generation error:', error);
        res.status(500).json({ error: 'Failed to generate code', details: error.message });
    }
}));
