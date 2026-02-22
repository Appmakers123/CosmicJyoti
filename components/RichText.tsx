import React from 'react';

interface RichTextProps {
  text: string;
  className?: string;
}

const RichText: React.FC<RichTextProps> = ({ text, className = '' }) => {
  if (!text) return null;

  // Pre-process: strip unwanted AI artifacts that might have bypassed service-level sanitization
  const cleanedText = text
    .replace(/^JSON\s*/i, "")
    .replace(/```[a-z]*\n?/gi, "")
    .replace(/\n?```/g, "")
    // Strip citation/reference markers from Perplexity, Gemini grounding, etc. e.g. [1], [2], [7][9]
    .replace(/\[\d+\]/g, "");

  const lines = cleanedText.split('\n');
  const renderedLines: React.ReactNode[] = [];

  let listItems: React.ReactNode[] = [];

  const flushList = (keyPrefix: string) => {
      if (listItems.length > 0) {
          renderedLines.push(
              <ul key={`${keyPrefix}-list`} className="list-disc ml-6 mb-5 space-y-2 text-slate-300">
                  {listItems}
              </ul>
          );
          listItems = [];
      }
  };

  const processInline = (str: string) => {
      if (!str) return "";
      // Handle Bold (**text**)
      const parts = str.split(/(\*\*.*?\*\*)/g);
      return parts.map((part, i) => {
          if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={i} className="font-bold text-amber-200 drop-shadow-sm">{part.slice(2, -2)}</strong>;
          }
          return part;
      });
  };

  lines.forEach((line, index) => {
      const trimmed = line.trim();
      
      // Ignore stray characters that often appear at ends of AI strings
      if (trimmed === '`') return;

      // Headers
      if (trimmed.startsWith('### ')) {
          flushList(`header-${index}`);
          renderedLines.push(<h4 key={`h4-${index}`} className="text-lg font-serif font-bold text-amber-100 mt-6 mb-3 break-words">{processInline(trimmed.slice(4))}</h4>);
          return;
      }
      if (trimmed.startsWith('## ')) {
          flushList(`header-${index}`);
          renderedLines.push(<h3 key={`h3-${index}`} className="text-xl font-serif font-bold text-amber-200 mt-8 mb-4 border-b border-slate-700/50 pb-2 break-words">{processInline(trimmed.slice(3))}</h3>);
          return;
      }

      // List Items (Support *, -, and •)
      if (trimmed.startsWith('* ') || trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
          listItems.push(<li key={`li-${index}`} className="pl-1 break-words">{processInline(trimmed.slice(2))}</li>);
          return;
      }

      // Normal Text or Empty
      if (trimmed === '') {
          flushList(`space-${index}`);
          // Add a small spacer for double newlines
          renderedLines.push(<div key={`spacer-${index}`} className="h-2"></div>);
      } else {
          flushList(`text-${index}`);
          renderedLines.push(<p key={`p-${index}`} className="mb-4 leading-relaxed text-slate-200 font-light break-words">{processInline(trimmed)}</p>);
      }
  });

  flushList('end');

  return (
    <div className={`text-sm md:text-base selection:bg-amber-500/30 break-words min-w-0 overflow-visible ${className}`} style={{ overflowWrap: 'break-word', wordBreak: 'break-word' }}>
      {renderedLines}
    </div>
  );
};

export default RichText;