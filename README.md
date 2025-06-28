# Advanced RAG Agent for Financial Document Analysis

This project is a sophisticated, Retrieval-Augmented Generation (RAG) agent designed for in-depth financial analysis. It leverages the annual shareholder letters of Berkshire Hathaway as a knowledge base, allowing users to ask complex questions and receive contextually accurate, data-driven answers.

This system was developed to demonstrate a robust, scalable, and intelligent approach to processing and querying large volumes of unstructured text data, making it a powerful tool for financial analysts and researchers.

## Key Features & Technical Highlights

This project was built with a focus on modern, efficient, and scalable AI development practices.

- **Data Ingestion Pipeline**: A resilient data pipeline that reads, parses, and chunks Markdown documents. It intelligently preserves the semantic structure of the source material by using Markdown headers (`#`, `##`, `###`) to create meaningful, context-rich data chunks.
- **Efficient Vectorization & Storage**: Utilizes OpenAI's powerful `text-embedding-3-small` model for high-quality vector embeddings. These embeddings are stored in a scalable **PostgreSQL** database equipped with the `pgvector` extension, enabling efficient similarity searches over millions of vectors.
- **Metadata-Rich Indexing**: Each document chunk is indexed with metadata including page number, filename, and section headers, enabling precise citations and source attribution in responses.
- **Context Retrieval**: Implements search with reranking to deliver the most relevant context chunks to the LLM, significantly improving answer accuracy.
- **Scoped Memory Management**: Implements memory resource scoping to ensure context can be maintained across different conversation threads without memory overflow.
- **Persistent Conversations**: Leverages PostgreSQL for chat persistence, allowing users to resume conversations and maintain context over extended periods.
- **Stateful, Context-Aware Interactions**: Implements **Mastra Memory** with a `PostgresStore` backend to maintain conversation history, enabling complex multi-turn dialogues and follow-up questions.
- **Specialized Financial Analyst Agent**: The core of the application is a `financial-analyst-agent`, a specialized agent built with **Mastra** that is fine-tuned for querying financial data, demonstrating thoughtful and domain-specific application design.

## Tech Stack

- **Language**: TypeScript
- **AI Framework**: Mastra
- **AI SDK**: Vercel AI SDK
- **LLM & Embeddings**: OpenAI (`text-embedding-3-small and gpt-4o`)
- **Database**: PostgreSQL with `pgvector`

## Project Structure

```
/
├── src/
│   ├── documents/            # Contains the source .md files for the knowledge base
│   ├── mastra/
│   │   ├── agents/
│   │   │   └── financial-analyst-agent.ts  # Defines the core RAG agent logic
│   │   └── index.ts          # Configures and exports the Mastra instance
│   └── store.ts              # The data ingestion and vectorization script
├── package.json
└── README.md
```
