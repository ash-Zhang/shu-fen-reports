// 文章详情页脚本

document.addEventListener('DOMContentLoaded', () => {
    // 添加代码复制功能
    document.querySelectorAll('pre code').forEach(block => {
        const pre = block.parentElement;
        const button = document.createElement('button');
        button.className = 'copy-btn';
        button.textContent = '复制';
        button.addEventListener('click', () => {
            navigator.clipboard.writeText(block.textContent).then(() => {
                button.textContent = '已复制!';
                setTimeout(() => button.textContent = '复制', 2000);
            });
        });
        pre.style.position = 'relative';
        pre.appendChild(button);
    });
    
    // 添加目录导航（如果文章很长）
    const headings = document.querySelectorAll('.article-body h2');
    if (headings.length > 3) {
        const toc = document.createElement('div');
        toc.className = 'toc';
        toc.innerHTML = '<h4>目录</h4><ul>' + 
            Array.from(headings).map(h => {
                const id = h.textContent.toLowerCase().replace(/\s+/g, '-');
                h.id = id;
                return `<li><a href="#${id}">${h.textContent}</a></li>`;
            }).join('') + 
            '</ul>';
        
        const articleBody = document.querySelector('.article-body');
        articleBody.insertBefore(toc, articleBody.firstChild);
    }
});

// 添加复制按钮样式
const style = document.createElement('style');
style.textContent = `
    .copy-btn {
        position: absolute;
        top: 8px;
        right: 8px;
        background: var(--bg-card);
        border: 1px solid var(--border);
        color: var(--text-muted);
        padding: 4px 12px;
        border-radius: 4px;
        font-size: 0.8rem;
        cursor: pointer;
        opacity: 0;
        transition: opacity 0.2s;
    }
    
    pre:hover .copy-btn {
        opacity: 1;
    }
    
    .copy-btn:hover {
        background: var(--primary);
        border-color: var(--primary);
        color: white;
    }
    
    .toc {
        background: var(--bg-card);
        border: 1px solid var(--border);
        border-radius: 12px;
        padding: 20px;
        margin-bottom: 30px;
    }
    
    .toc h4 {
        margin: 0 0 12px 0;
        color: var(--primary);
    }
    
    .toc ul {
        list-style: none;
        padding: 0;
        margin: 0;
    }
    
    .toc li {
        margin: 8px 0;
    }
    
    .toc a {
        color: var(--text-muted);
        text-decoration: none;
        transition: color 0.2s;
    }
    
    .toc a:hover {
        color: var(--primary);
    }
`;
document.head.appendChild(style);
