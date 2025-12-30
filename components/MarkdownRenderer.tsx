import React, { useEffect, useRef } from 'react';

// Update window declaration to accept the button element and KaTeX
declare global {
    interface Window {
        copyToClipboard: (button: HTMLButtonElement, text: string) => void;
        // FIX: Moved marked and katex into the Window interface to correctly extend the global window object.
        // This resolves TypeScript errors about these properties not existing on 'Window'.
        marked: {
            parse: (markdown: string) => string;
        };
        katex: {
            renderToString: (expression: string, options?: object) => string;
        };
    }
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
        if (contentRef.current && window.marked && window.katex) {
            const blockMath: string[] = [];
            const inlineMath: string[] = [];
            
            // 1. Temporarily replace math blocks with placeholders to protect them from the markdown parser
            let tempContent = content
                .replace(/\$\$([\s\S]*?)\$\$/g, (match, expression) => {
                    blockMath.push(expression);
                    return `__BLOCK_MATH_${blockMath.length - 1}__`;
                })
                .replace(/\$([^$]+?)\$/g, (match, expression) => {
                    inlineMath.push(expression);
                    return `__INLINE_MATH_${inlineMath.length - 1}__`;
                });

            // 2. Parse the markdown (with placeholders)
            let html = window.marked.parse(tempContent);
            
            // 3. Inject copy buttons for code blocks
            html = html.replace(/<pre><code( class="[^"]*")?>([\s\S]*?)<\/code><\/pre>/g, (match, langClass, code) => {
                const decodedCode = new DOMParser().parseFromString(code, 'text/html').documentElement.textContent || '';
                const codeAsJsString = JSON.stringify(decodedCode);
                const buttonHtml = `<button class="copy-code-btn" onclick='window.copyToClipboard(this, ${codeAsJsString})'>Copy</button>`;
                return `<div class="code-block-wrapper">${buttonHtml}<pre><code${langClass || ''}>${code}</code></pre></div>`;
            });

            // 4. Replace math placeholders with KaTeX-rendered HTML
            html = html.replace(/<p>__BLOCK_MATH_(\d+)__<\/p>/g, (_, index) => { // Marked wraps standalone placeholders in <p>
                const expression = blockMath[parseInt(index)];
                return window.katex.renderToString(expression, { displayMode: true, throwOnError: false, output: 'html' });
            });
             html = html.replace(/__BLOCK_MATH_(\d+)__/g, (_, index) => { // For cases where it is not wrapped in <p>
                const expression = blockMath[parseInt(index)];
                return window.katex.renderToString(expression, { displayMode: true, throwOnError: false, output: 'html' });
            });
            html = html.replace(/__INLINE_MATH_(\d+)__/g, (_, index) => {
                const expression = inlineMath[parseInt(index)];
                return window.katex.renderToString(expression, { displayMode: false, throwOnError: false, output: 'html' });
            });
            
            contentRef.current.innerHTML = html;
        }
    }, [content]);
    
    return <div ref={contentRef} className="markdown-content" />;
};

export default MarkdownRenderer;
