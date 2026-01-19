"use client";

import { Fragment } from "react";

interface Correction {
  original: string;
  corrected: string;
  why: string;
}

interface ParsedContent {
  type: "text" | "correction";
  content: string | Correction;
}

/**
 * Parse correction blocks from AI response text
 * Format expected:
 * You said: 'original text'
 * Correct form: 'corrected text'
 * Why: explanation
 */
export function parseCorrections(text: string): ParsedContent[] {
  const result: ParsedContent[] = [];

  // Regex to match correction blocks
  // Matches: You said: 'text' or "text"\nCorrect form: 'text' or "text"\nWhy: explanation
  const correctionRegex = /You said:\s*['"]([^'"]+)['"]\s*\n\s*Correct form:\s*['"]([^'"]+)['"]\s*\n\s*Why:\s*([^\n]+)/gi;

  let lastIndex = 0;
  let match;

  while ((match = correctionRegex.exec(text)) !== null) {
    // Add text before this correction
    if (match.index > lastIndex) {
      const textBefore = text.substring(lastIndex, match.index).trim();
      if (textBefore) {
        result.push({ type: "text", content: textBefore });
      }
    }

    // Add the correction
    result.push({
      type: "correction",
      content: {
        original: match[1],
        corrected: match[2],
        why: match[3].trim(),
      },
    });

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    const textAfter = text.substring(lastIndex).trim();
    if (textAfter) {
      result.push({ type: "text", content: textAfter });
    }
  }

  // If no corrections found, return original text
  if (result.length === 0) {
    return [{ type: "text", content: text }];
  }

  return result;
}

/**
 * Component to render a single correction block with visual highlighting
 */
function CorrectionBlock({ correction }: { correction: Correction }) {
  return (
    <div className="my-2 p-2 bg-muted/50 rounded border-l-2 border-orange-500">
      <div className="flex flex-wrap items-center gap-1 text-sm">
        <span className="line-through text-red-500 dark:text-red-400">
          {correction.original}
        </span>
        <span className="text-muted-foreground mx-1">→</span>
        <span className="font-medium text-green-600 dark:text-green-400">
          {correction.corrected}
        </span>
      </div>
      <p className="text-xs text-muted-foreground mt-1 italic">
        {correction.why}
      </p>
    </div>
  );
}

/**
 * Component to render message content with correction highlighting
 */
export function CorrectionHighlight({ text }: { text: string }) {
  const parsed = parseCorrections(text);

  return (
    <div className="text-sm">
      {parsed.map((item, index) => (
        <Fragment key={index}>
          {item.type === "text" ? (
            <span className="whitespace-pre-wrap">{item.content as string}</span>
          ) : (
            <CorrectionBlock correction={item.content as Correction} />
          )}
        </Fragment>
      ))}
    </div>
  );
}
