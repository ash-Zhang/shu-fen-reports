const fs = require('fs');
const path = require('path');

// 简单的 Markdown 到 HTML 转换
function mdToHtml(md) {
    let html = md;
    
    // 标题
    html = html.replace(/^# (.*$)/gm, '<h1>$1</h1>');
    html = html.replace(/^## (.*$)/gm, '<h2>$1</h2>');
    html = html.replace(/^### (.*$)/gm, '<h3>$1</h3>');
    
    // 粗体和斜体
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // 链接
    html = html.replace(/\[([^\]]*)\]\(([^)]*)\)/g, '<a href="$2">$1</a>');
    
    // 列表
    html = html.replace(/^- (.*$)/gm, '<li>$1</li>');
    html = html.replace(/^\* (.*$)/gm, '<li>$1</li>');
    html = html.replace(/^\d+\. (.*$)/gm, '<li>$1</li>');
    
    // 代码块
    html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
    
    // 段落（把连续的非空行用 <p> 包裹）
    let lines = html.split('\n');
    let inParagraph = false;
    let result = [];
    
    for (let line of lines) {
        if (line.trim() === '') {
            if (inParagraph) {
                result.push('</p>');
                inParagraph = false;
            }
        } else if (!line.match(/^<(h\d|li|pre|p)/)) {
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

// 主函数
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
    
    // 提取信息
    const titleMatch = mdContent.match(/^# (.*)$/m);
    const title = titleMatch ? titleMatch[1] : 'Untitled';
    
    const dateMatch = mdContent.match(/(\d{4}-\d{2}-\d{2})/);
    const date = dateMatch ? dateMatch[1] : new Date().toISOString().split('T')[0];
    
    // 判断报告类型
    let type = 'Daily Learning';
    if (title.includes('AgentWeb')) {
        type = 'AgentWeb学习汇报';
    } else if (title.includes('股票') || title.includes('AI股票')) {
        type = 'AI股票交易分析';
    }
    
    // 转换内容
    const content = mdToHtml(mdContent);
    
    // 填充模板
    let html = template;
    html = html.replace(/\{\{TITLE\}\}/g, title);
    html = html.replace(/\{\{TYPE\}\}/g, type);
    html = html.replace(/\{\{DATE\}\}/g, date);
    html = html.replace(/\{\{DURATION\}\}/g, '5分钟');
    html = html.replace(/\{\{WORD_COUNT\}\}/g, mdContent.length);
    html = html.replace(/\{\{CONTENT\}\}/g, content);
    html = html.replace(/\{\{PREV_LINK\}\}/g, '');
    html = html.replace(/\{\{NEXT_LINK\}\}/g, '');
    
    fs.writeFileSync(outputFile, html, 'utf8');
    console.log(`Generated: ${outputFile}`);
}

main();
