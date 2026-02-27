// 薯粉报告站 - Main App

const App = {
    posts: [],
    currentFilter: 'all',

    taskTypes: {
        'ai-stock': { name: 'AI Stock', badge: 'badge-ai-stock' },
        'daily-learning': { name: 'Daily Learning', badge: 'badge-daily-learning' },
        'agentweb': { name: 'AgentWeb', badge: 'badge-agentweb' }
    },

    init() {
        this.initTheme();
        this.loadPosts();
        this.setupEventListeners();
    },

    // Theme
    initTheme() {
        const theme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', theme);
        this.updateThemeUI(theme);

        document.getElementById('theme-toggle').addEventListener('click', () => {
            const current = document.documentElement.getAttribute('data-theme');
            const next = current === 'light' ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', next);
            localStorage.setItem('theme', next);
            this.updateThemeUI(next);
        });
    },

    updateThemeUI(theme) {
        const toggle = document.getElementById('theme-toggle');
        const label = toggle.querySelector('.theme-label');
        const sunIcon = toggle.querySelector('.icon-sun');
        const moonIcon = toggle.querySelector('.icon-moon');

        if (theme === 'dark') {
            sunIcon.style.display = 'none';
            moonIcon.style.display = 'block';
            if (label) label.textContent = 'Dark';
        } else {
            sunIcon.style.display = 'block';
            moonIcon.style.display = 'none';
            if (label) label.textContent = 'Light';
        }
    },

    // Posts
    async loadPosts() {
        try {
            const response = await fetch('posts/index.json');
            if (response.ok) {
                const data = await response.json();
                this.posts = data.posts || [];
            } else {
                this.posts = [];
            }
        } catch (error) {
            this.posts = [];
        }
        this.renderPosts();
        this.updateStats();
    },

    renderPosts() {
        const container = document.getElementById('posts-container');
        let filtered = this.posts;
        if (this.currentFilter !== 'all') {
            filtered = this.posts.filter(p => p.type === this.currentFilter);
        }
        filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

        if (filtered.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">--</div>
                    <h3 class="empty-title">No reports yet</h3>
                    <p class="empty-desc">Reports will appear here after tasks run.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = filtered.map(p => this.createCard(p)).join('');
    },

    createCard(post) {
        const typeInfo = this.taskTypes[post.type] || { name: 'Other', badge: '' };
        const date = new Date(post.date).toLocaleDateString('zh-CN', {
            year: 'numeric', month: '2-digit', day: '2-digit'
        });
        const time = new Date(post.date).toLocaleTimeString('zh-CN', {
            hour: '2-digit', minute: '2-digit'
        });

        return `
            <article class="post-card" data-type="${post.type}">
                <div class="post-header">
                    <h3 class="post-title">${post.title}</h3>
                    <span class="post-badge ${typeInfo.badge}">${typeInfo.name}</span>
                </div>
                <div class="post-meta">
                    <span>${date} ${time}</span>
                    <span>${post.wordCount || 0} words</span>
                    ${post.duration ? `<span>${Math.round(post.duration / 1000)}s</span>` : ''}
                </div>
                <p class="post-excerpt">${post.excerpt || ''}</p>
                <div class="post-footer">
                    <a href="posts/${post.id}.html" class="read-more">Read &rarr;</a>
                </div>
            </article>
        `;
    },

    setupEventListeners() {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentFilter = e.target.dataset.filter;
                this.renderPosts();
            });
        });
    },

    updateStats() {
        const total = this.posts.length;
        const lastDate = total > 0
            ? new Date(Math.max(...this.posts.map(p => new Date(p.date)))).toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })
            : '-';

        document.getElementById('total-posts').textContent = total;
        document.getElementById('last-update').textContent = lastDate;
    }
};

document.addEventListener('DOMContentLoaded', () => App.init());
