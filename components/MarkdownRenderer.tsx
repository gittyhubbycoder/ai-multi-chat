
import React, { useEffect, useRef } from 'react';

// Update window declaration to accept the button element
declare global {
    interface Window {
        copyToClipboard: (button: HTMLButtonElement, text: string) => void;
    }
    const marked: {
        parse: (markdown: string) => string;
    };
}

// Update copy function to provide visual feedback on the button itself
const copyToClipboard = (button: HTMLButtonElement, text: string) => {
    // Prevent multiple clicks while in "Copied!" state
    if (button.dataset.copied === 'true') return;

    navigator.clipboard.writeText(text).then(() => {
        const originalText = button.textContent;
        button.textContent = 'Copied!';
        button.dataset.copied = 'true';
        setTimeout(() => {
            button.textContent = originalText;
            delete button.dataset.copied;
        }, 2000);
    }).catch(() => {
        alert('Failed to copy to clipboard.');
    });
};

if (typeof window !== 'undefined') {
    window.copyToClipboard = copyToClipboard;
}

interface MarkdownRendererProps {
    content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (contentRef.current) {
            let html = marked.parse(content);
            // Regex to find code blocks and inject a copy button
            html = html.replace(/<pre><code( class="[^"]*")?>([\s\S]*?)<\/code><\/pre>/g, (match, langClass, code) => {
                // Decode HTML entities that marked.js might have created
                const decodedCode = new DOMParser().parseFromString(code, 'text/html').documentElement.textContent || '';
                
                // Use JSON.stringify to create a valid JavaScript string literal.
                // This handles all escaping (quotes, backslashes, newlines, etc.) correctly.
                const codeAsJsString = JSON.stringify(decodedCode);

                // Use single quotes for the onclick attribute to avoid conflicts with the double quotes from JSON.stringify.
                const buttonHtml = `<button class="copy-code-btn" onclick='window.copyToClipboard(this, ${codeAsJsString})'>Copy</button>`;
                return `<div class="code-block-wrapper">${buttonHtml}<pre><code${langClass || ''}>${code}</code></pre></div>`;
            });
            contentRef.current.innerHTML = html;
        }
    }, [content]);
    
    return <div ref={contentRef} className="markdown-content" />;
};

export default MarkdownRenderer;
