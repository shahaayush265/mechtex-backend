# MechTeX Backend

AI-powered code generation service for **[MechTeX](https://github.com/shahaayush265/mechtex)**. This backend translates natural language descriptions into valid MechTeX LaTeX-like syntax for mechanical physics diagrams using high-performance Large Language Models.

---

## 🚀 Overview

MechTeX Backend provides a REST API that bridges natural language prompts and the MechTeX diagramming language. It uses structured prompt engineering with rich documentation context (both concise language references and detailed grammar/component specs) to generate strict, syntactically correct MechTeX diagrams (`\begin{system} ... \end{system}`).

### Key Capabilities
- **Natural Language to Diagram**: Transforms prompts like *"a block of mass m on an inclined plane connected by a string over a pulley to a hanging mass"* into valid MechTeX code.
- **Context-Aware Prompting**: Ingests bundled MechTeX language specifications (`docs/docs_concise` or `docs/docs_detailed`) into the LLM system prompt.
- **Fast Inference**: Powered by OpenAI-compatible LLM endpoints (e.g. `google/gemma-4-31b-it` via NVIDIA NIM).
- **Production-Ready**: Written in TypeScript with Express, Dockerized for containerized deployment, and fully tested with Jest and Supertest.

---

## 🛠️ Tech Stack

- **Runtime**: Node.js & TypeScript
- **Framework**: Express 5
- **AI / LLM**: OpenAI SDK connecting to NVIDIA API Catalog (`google/gemma-4-31b-it`)
- **Testing**: Jest, ts-jest, Supertest
- **Containerization**: Docker

---

## 📦 Installation & Setup

### Prerequisites
- Node.js (v18+)
- npm or yarn
- NVIDIA API Key (or compatible OpenAI API key)

### Local Development

1. **Clone the repository**:
   ```bash
   git clone https://github.com/shahaayush265/mechtex-backend.git
   cd mechtex-backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root directory:
   ```env
   PORT=3001
   NVIDIA_API_KEY=your_nvidia_api_key_here
   ```

4. **Run in development mode**:
   ```bash
   npm run dev
   ```
   The server starts on `http://localhost:3001`.

5. **Build and run production**:
   ```bash
   npm run build
   npm start
   ```

---

## 🧪 Testing

Run automated tests with Jest:

```bash
npm test
```

---

## 📡 API Reference

### `POST /api/generate`

Generates MechTeX code from a natural language prompt.

#### Request Body
```json
{
  "prompt": "Create an inclined plane at 30 degrees with a block sliding down",
  "docType": "concise"
}
```

- `prompt` (*string, required*): Description of the mechanical physics system.
- `docType` (*string, optional*): Documentation context depth (`"concise"` [default] or `"detailed"`).

#### Response
```json
{
  "code": "\\begin{system}\n\\incline[id=inc, angle=30]{w=10, h=5.77}\n\\block[id=b1, on=inc]{m=2}\n\\end{system}"
}
```

---

## 🐳 Docker Deployment

Build and run using Docker:

```bash
docker build -t mechtex-backend .
docker run -p 3001:3001 -e NVIDIA_API_KEY="your_api_key" mechtex-backend
```

---

## 🔗 Related Projects

- **[MechTeX](https://github.com/shahaayush265/mechtex)**: Language specification and React-based web editor.
- **[MechTeX Live](https://shahaayush265.github.io/mechtex-live/)**: Live online diagram editor.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
