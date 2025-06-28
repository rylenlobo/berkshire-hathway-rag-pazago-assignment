import { Mastra } from "@mastra/core/mastra";
import { financialAnalystAgent } from "./agents/financial-analyst-agent";
import { PgVector } from "@mastra/pg";


const pgVector = new PgVector({
  connectionString: process.env.POSTGRES_CONNECTION_STRING || "",
});

export const mastra = new Mastra({
  agents: { financialAnalystAgent },
  vectors: { pgVector },
});
