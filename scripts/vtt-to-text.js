#!/usr/bin/env node

/**
 * Converte arquivos .vtt (legendas do YouTube) em texto corrido limpo.
 *
 * Uso:
 *   node vtt-to-text.js entrada.vtt
 *   node vtt-to-text.js entrada.vtt saida.txt
 *
 * Se o arquivo de saida nao for informado, gera um .txt com o mesmo nome.
 */

const fs = require("fs");
const path = require("path");

function cleanVtt(vttContent) {
  const lines = vttContent.split(/\r?\n/);
  const seen = new Set();
  const result = [];

  for (let raw of lines) {
    const line = raw.trim();

    if (!line) continue;
    if (line === "WEBVTT") continue;
    if (line.startsWith("Kind:") || line.startsWith("Language:")) continue;
    if (line.startsWith("NOTE")) continue;
    if (/^\d+$/.test(line)) continue;
    if (line.includes("-->")) continue;

    const cleaned = line
      .replace(/<[^>]+>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&#39;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/\s+/g, " ")
      .trim();

    if (!cleaned) continue;
    if (seen.has(cleaned)) continue;

    seen.add(cleaned);
    result.push(cleaned);
  }

  const fullText = result.join(" ");

  const sentences = fullText.match(/[^.!?]+[.!?]+|\S+$/g) || [fullText];
  const paragraphs = [];
  const sentencesPerParagraph = 5;

  for (let i = 0; i < sentences.length; i += sentencesPerParagraph) {
    const chunk = sentences
      .slice(i, i + sentencesPerParagraph)
      .map((s) => s.trim())
      .join(" ");
    if (chunk) paragraphs.push(chunk);
  }

  return paragraphs.join("\n\n");
}

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error("Uso: node vtt-to-text.js <arquivo.vtt> [saida.txt]");
    process.exit(1);
  }

  const inputPath = args[0];
  const outputPath =
    args[1] ||
    path.join(
      path.dirname(inputPath),
      path.basename(inputPath, path.extname(inputPath)) + ".txt"
    );

  if (!fs.existsSync(inputPath)) {
    console.error(`Arquivo nao encontrado: ${inputPath}`);
    process.exit(1);
  }

  const vttContent = fs.readFileSync(inputPath, "utf-8");
  const cleanText = cleanVtt(vttContent);

  fs.writeFileSync(outputPath, cleanText, "utf-8");

  const wordCount = cleanText.split(/\s+/).filter(Boolean).length;
  console.log(`Texto salvo em: ${outputPath}`);
  console.log(`Palavras: ${wordCount}`);
}

main();