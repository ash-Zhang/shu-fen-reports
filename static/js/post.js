// Post detail page

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initCopyButtons();
    initTOC();
});

function initTheme() {
    const theme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', theme);
    updateThemeUI(theme);

    const toggle = document.getElementById('theme-toggle');
    if (!toggle) return;

    toggle.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
        updateThemeUI(next);
    });
}

function updateThemeUI(theme) {
    const toggle = document.getElementById('theme-toggle');
    if (!toggle) return;

    const sunIcon = toggle.querySelector('.icon-sun');
    const moonIcon = toggle.querySelector('.icon-moon');

    if (theme === 'dark') {
        if (sunIcon) sunIcon.style.display = 'none';
        if (moonIcon) moonIcon.style.display = 'block';
    } else {
        if (sunIcon) sunIcon.style.display = 'block';
        if (moonIcon) moonIcon.style.display = 'none';
    }
}

function initCopyButtons() {
    document.querySelectorAll('pre code').forEach(block => {
        const pre = block.parentElement;
        const btn = document.createElement('button');
        btn.className = 'copy-btn';
        btn.textContent = 'Copy';
        btn.addEventListener('click', () => {
            navigator.clipboard.writeText(block.textContent).then(() => {
                btn.textContent = 'Copied';
                setTimeout(() => btn.textContent = 'Copy', 2000);
            });
        });
        pre.style.position = 'relative';
        pre.appendChild(btn);
    });
}

function initTOC() {
    const headings = document.querySelectorAll('.article-body h2');
    if (headings.length <= 3) return;

    const toc = document.createElement('nav');
    toc.className = 'toc';
    toc.innerHTML = '<h4>Contents</h4><ul>' +
        Array.from(headings).map(h => {
            const id = h.textContent.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]+/g, '-').replace(/^-|-$/g, '');
            h.id = id;
            return `<li><a href="#${id}">${h.textContent}</a></li>`;
        }).join('') +
        '</ul>';

    const body = document.querySelector('.article-body');
    if (body) body.insertBefore(toc, body.firstChild);
}

// Inject dynamic styles
const style = document.createElement('style');
style.textContent = `
    .copy-btn {
        position: absolute;
        top: 8px;
        right: 8px;
        background: var(--bg-card);
        border: 1px solid var(--border);
        color: var(--text-tertiary);
        padding: 3px 10px;
        border-radius: 4px;
        font-size: 0.7rem;
        font-family: var(--font-sans);
        cursor: pointer;
        opacity: 0;
        transition: all 0.15s ease;
    }
    pre:hover .copy-btn {
        opacity: 1;
    }
    .copy-btn:hover {
        color: var(--text-primary);
        border-color: var(--border-hover);
    }
    .toc {
        background: var(--accent-soft);
        border-radius: var(--radius);
        padding: 20px 24px;
        margin-bottom: 32px;
    }
    .toc h4 {
        margin: 0 0 10px 0;
        color: var(--text-tertiary);
        font-size: 0.7rem;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        font-weight: 600;
    }
    .toc ul {
        list-style: none;
        padding: 0;
        margin: 0;
    }
    .toc li {
        margin: 6px 0;
    }
    .toc a {
        color: var(--text-secondary);
        text-decoration: none;
        font-size: 0.85rem;
        transition: color 0.15s ease;
    }
    .toc a:hover {
        color: var(--text-primary);
    }
`;
document.head.appendChild(style);
