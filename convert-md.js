const fs = require('fs');
const path = require('path');

// Simple Markdown to HTML converter
function mdToHtml(md) {
    let html = md;

    // Headings
    html = html.replace(/^# (.*$)/gm, '<h1>$1</h1>');
    html = html.replace(/^## (.*$)/gm, '<h2>$1</h2>');
    html = html.replace(/^### (.*$)/gm, '<h3>$1</h3>');

    // Bold and italic
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // Links
    html = html.replace(/\[([^\]]*)\]\(([^)]*)\)/g, '<a href="$2">$1</a>');

    // Code blocks
    html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Lists
    html = html.replace(/^- (.*$)/gm, '<li>$1</li>');
    html = html.replace(/^\* (.*$)/gm, '<li>$1</li>');
    html = html.replace(/^\d+\. (.*$)/gm, '<li>$1</li>');

    // Wrap consecutive <li> in <ul>
    html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');

    // Horizontal rules
    html = html.replace(/^---$/gm, '<hr>');

    // Paragraphs
    let lines = html.split('\n');
    let inParagraph = false;
    let result = [];

    for (let line of lines) {
        if (line.trim() === '') {
            if (inParagraph) {
                result.push('</p>');
                inParagraph = false;
            }
        } else if (!line.match(/^<(h\d|li|ul|pre|p|hr|blockquote)/)) {
            if (!inParagraph) {
                result.push('<p>');
                inParagraph = true;
            }
            result.push(line);
        } else {
            if (inParagraph) {
                result.push('</p>');
                inParagraph = false;
            }
            result.push(line);
        }
    }

    if (inParagraph) {
        result.push('</p>');
    }

    return result.join('\n');
}

function main() {
    const mdFile = process.argv[2];
    const templateFile = 'template.html';
    const outputFile = path.join('posts', path.basename(mdFile, '.md') + '.html');

    if (!mdFile) {
        console.error('Usage: node convert-md.js <md-file>');
        process.exit(1);
    }

    const mdContent = fs.readFileSync(mdFile, 'utf8');
    const template = fs.readFileSync(templateFile, 'utf8');

    // Extract info
    const titleMatch = mdContent.match(/^# (.*)$/m);
    const title = titleMatch ? titleMatch[1] : 'Untitled';

    const dateMatch = mdContent.match(/(\d{4}-\d{2}-\d{2})/);
    const date = dateMatch ? dateMatch[1] : new Date().toISOString().split('T')[0];

    // Determine report type
    let type = 'Daily Learning';
    if (title.includes('AgentWeb')) {
        type = 'AgentWeb';
    } else if (title.includes('股票') || title.includes('AI股票') || title.includes('Stock')) {
        type = 'AI Stock';
    }

    // Convert content
    const content = mdToHtml(mdContent);

    // Fill template
    let html = template;
    html = html.replace(/\{\{TITLE\}\}/g, title);
    html = html.replace(/\{\{TYPE\}\}/g, type);
    html = html.replace(/\{\{DATE\}\}/g, date);
    html = html.replace(/\{\{DURATION\}\}/g, '');
    html = html.replace(/\{\{WORD_COUNT\}\}/g, mdContent.length);
    html = html.replace(/\{\{CONTENT\}\}/g, content);
    html = html.replace(/\{\{PREV_LINK\}\}/g, '');
    html = html.replace(/\{\{NEXT_LINK\}\}/g, '');

    fs.writeFileSync(outputFile, html, 'utf8');
    console.log(`Generated: ${outputFile}`);
}

main();
