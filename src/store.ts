import { MDocument } from "@mastra/rag";
import { embed, embedMany } from "ai";
import { mastra } from "./mastra";
import { openai } from "@ai-sdk/openai";
import fs from "fs";
import path from "path";
import { promisify } from "util";

const readdir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);
const stat = promisify(fs.stat);

// Function to split content by page breaks
const splitPages = (text: string): string[] => {
  const pageBreakPattern =
    /--------------------\s*page break\s*--------------------/i;
  return text.split(pageBreakPattern).map((page) => page.trim());
};

// Function to recursively get all .md files from a directory
async function getMarkdownFiles(directory: string): Promise<string[]> {
  console.log(`Searching for markdown files in: ${directory}`);
  try {
    const files = await readdir(directory);
    console.log(`Found ${files.length} items in ${directory}`);
    const markdownFiles: string[] = [];

    for (const file of files) {
      const fullPath = path.join(directory, file);
      const fileStat = await stat(fullPath);

      if (fileStat.isDirectory()) {
        const nestedFiles = await getMarkdownFiles(fullPath);
        markdownFiles.push(...nestedFiles);
      } else if (path.extname(file) === ".md") {
        markdownFiles.push(fullPath);
      }
    }

    return markdownFiles;
  } catch (error) {
    console.error(`Error reading directory ${directory}:`, error);
    return []; // Return empty array on error
  }
}

async function processAllMarkdownFiles(filePaths: string[]) {
  console.log(`Processing ${filePaths.length} files...`);

  let allChunks: any[] = [];

  for (const filePath of filePaths) {
    console.log(`Reading file: ${filePath}`);
    // Read the markdown file
    const markdownText = await readFile(filePath, "utf-8");

    // Extract file name from the path
    const fileName = path.basename(filePath);

    // Split the content into pages
    const pages = splitPages(markdownText);

    // Create a document for each page with the appropriate page number
    const docs = pages.map((page, index) => {
      return MDocument.fromMarkdown(page, {
        year_of_publish: parseInt(fileName.match(/\d{4}/)?.[0] ?? "0", 10),
        file_name: fileName,
        page_number: index + 1,
      });
    });

    // Process each document and create chunks
    const chunksPromises = docs.map((document) => {
      return document.chunk({
        strategy: "markdown",
        headers: [
          ["#", "title"],
          ["##", "header 2"],
          ["###", "header 3"],
        ],
        overlap: 512,
        extract: {
          title: true,
        },
      });
    });

    const chunks = await Promise.all(chunksPromises).then((results) =>
      results.flat()
    );

    console.log(`Generated ${chunks.length} chunks for ${fileName}`);
    allChunks.push(...chunks);
  }

  console.log(`Total: ${allChunks.length} chunks across all files`);

  // Create embeddings for all chunks at once
  const { embeddings } = await embedMany({
    model: openai.embedding("text-embedding-3-small"),
    values: allChunks.map((chunk) => chunk.text),
  });

  const vectorStore = mastra.getVector("pgVector");

  try {
    await vectorStore.createIndex({
      indexName: "papers",
      dimension: 1536,
    });
  } catch (error) {
    console.log("Index might already exist, continuing...");
  }

  // Add all embeddings to vector store in one operation
  await vectorStore.upsert({
    indexName: "papers",
    vectors: embeddings,
    metadata: allChunks.map((chunk) => ({
      text: chunk.text,
      file_name: chunk.metadata.file_name,
      page_number: chunk.metadata.page_number,
      year_of_publish: chunk.metadata.year_of_publish,
    })),
  });

  console.log(`Successfully processed all files into a single index`);
}

async function main() {
  try {
    // Get all markdown files from the documents directory
    const markdownFiles = await getMarkdownFiles(
      path.join(process.cwd(), "src", "documents")
    );
    console.log(`Found ${markdownFiles.length} markdown files`);

    // Process all files in one batch
    await processAllMarkdownFiles(markdownFiles);

    console.log("All files processed successfully");
  } catch (error) {
    console.error("Error processing markdown files:", error);
  }
}

main();
