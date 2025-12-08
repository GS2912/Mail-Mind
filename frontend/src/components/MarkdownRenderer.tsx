import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
  content: string;
  className?: string;
  variant?: 'default' | 'chat-user' | 'chat-assistant';
}

export default function MarkdownRenderer({ content, className = '', variant = 'default' }: MarkdownRendererProps) {
  const isUserChat = variant === 'chat-user';
  const isAssistantChat = variant === 'chat-assistant';
  
  // Text colors based on variant
  const textLight = isUserChat ? 'text-white' : 'text-mailmind-text-light';
  const textMuted = isUserChat ? 'text-white/90' : 'text-mailmind-text-muted';
  const textCode = isUserChat ? 'text-white/95' : 'text-mailmind-teal';
  
  return (
    <div className={`markdown-content ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Headers - styled as bold/capitalized, not with #
          h1: ({ node, ...props }) => (
            <h1 className={`text-2xl font-bold ${textLight} mb-3 mt-4 first:mt-0`} {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className={`text-xl font-semibold ${textLight} mb-2 mt-4 first:mt-0`} {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className={`text-lg font-semibold ${textLight} mb-2 mt-3 first:mt-0`} {...props} />
          ),
          h4: ({ node, ...props }) => (
            <h4 className={`text-base font-semibold ${textLight} mb-2 mt-2 first:mt-0`} {...props} />
          ),
          // Paragraphs
          p: ({ node, ...props }) => (
            <p className={`mb-3 ${textMuted} leading-relaxed last:mb-0`} {...props} />
          ),
          // Lists
          ul: ({ node, ...props }) => (
            <ul className={`list-disc list-inside mb-3 space-y-1 ${textMuted} ml-4`} {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className={`list-decimal list-inside mb-3 space-y-1 ${textMuted} ml-4`} {...props} />
          ),
          li: ({ node, ...props }) => (
            <li className="mb-1" {...props} />
          ),
          // Bold text
          strong: ({ node, ...props }) => (
            <strong className={`font-semibold ${textLight}`} {...props} />
          ),
          // Italic text
          em: ({ node, ...props }) => (
            <em className={`italic ${textMuted}`} {...props} />
          ),
          // Code blocks
          code: ({ node, inline, ...props }: any) => {
            if (inline) {
              return (
                <code className={`${isUserChat ? 'bg-white/20' : 'bg-mailmind-bg'} px-1.5 py-0.5 rounded ${textCode} text-sm font-mono`} {...props} />
              );
            }
            return (
              <code className={`block ${isUserChat ? 'bg-white/10' : 'bg-mailmind-bg'} p-3 rounded-xl ${textLight} text-sm font-mono overflow-x-auto mb-3`} {...props} />
            );
          },
          pre: ({ node, ...props }) => (
            <pre className={`${isUserChat ? 'bg-white/10' : 'bg-mailmind-bg'} p-3 rounded-xl overflow-x-auto mb-3`} {...props} />
          ),
          // Links
          a: ({ node, ...props }) => (
            <a className={`${isUserChat ? 'text-white underline' : 'text-mailmind-teal hover:text-mailmind-orange underline'} transition-smooth`} {...props} />
          ),
          // Blockquotes
          blockquote: ({ node, ...props }) => (
            <blockquote className={`border-l-4 ${isUserChat ? 'border-white/40' : 'border-mailmind-teal'} pl-4 italic ${textMuted} my-3`} {...props} />
          ),
          // Horizontal rule
          hr: ({ node, ...props }) => (
            <hr className={`${isUserChat ? 'border-white/20' : 'border-mailmind-teal/30'} my-4`} {...props} />
          ),
          // Tables
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-3">
              <table className={`min-w-full border-collapse border ${isUserChat ? 'border-white/20' : 'border-mailmind-teal/30'}`} {...props} />
            </div>
          ),
          thead: ({ node, ...props }) => (
            <thead className={isUserChat ? 'bg-white/10' : 'bg-mailmind-bg'} {...props} />
          ),
          tbody: ({ node, ...props }) => (
            <tbody {...props} />
          ),
          tr: ({ node, ...props }) => (
            <tr className={`border-b ${isUserChat ? 'border-white/10' : 'border-mailmind-teal/20'}`} {...props} />
          ),
          th: ({ node, ...props }) => (
            <th className={`border ${isUserChat ? 'border-white/20 text-white' : 'border-mailmind-teal/30 text-mailmind-text-light'} px-4 py-2 text-left font-semibold`} {...props} />
          ),
          td: ({ node, ...props }) => (
            <td className={`border ${isUserChat ? 'border-white/20 text-white/90' : 'border-mailmind-teal/30 text-mailmind-text-muted'} px-4 py-2`} {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

