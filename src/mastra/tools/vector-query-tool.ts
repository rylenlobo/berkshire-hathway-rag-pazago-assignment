import { openai } from "@ai-sdk/openai";
import { createVectorQueryTool } from "@mastra/rag";

export const vectorQueryTool = createVectorQueryTool({
  vectorStoreName: "pgVector",
  indexName: "papers",
  model: openai.embedding("text-embedding-3-small"),
  reranker: {
    model: openai("gpt-4o-mini"),
    options: {
      weights: {
        semantic: 0.6,
        vector: 0.3,
        position: 0.1,
      },
      topK: 20,
    },
  },
});
