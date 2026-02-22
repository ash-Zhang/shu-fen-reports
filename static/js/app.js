// 薯粉的任务报告站 - 主应用脚本

const App = {
    posts: [],
    currentFilter: 'all',
    
    // 任务类型映射
    taskTypes: {
        'ai-stock': { name: 'AI股票交易分析', badge: 'badge-ai-stock' },
        'daily-learning': { name: 'Daily Learning', badge: 'badge-daily-learning' },
        'agentweb': { name: 'AgentWeb学习汇报', badge: 'badge-agentweb' }
    },
    
    init() {
        this.loadPosts();
        this.setupEventListeners();
        this.updateStats();
    },
    
    // 加载报告数据
    async loadPosts() {
        try {
            // 从 posts 目录获取报告列表
            const response = await fetch('posts/index.json');
            if (response.ok) {
                const data = await response.json();
                this.posts = data.posts || [];
            } else {
                // 如果没有索引文件，使用空数组
                this.posts = [];
            }
        } catch (error) {
            console.log('No posts found yet:', error);
            this.posts = [];
        }
        
        this.renderPosts();
        this.updateStats();
    },
    
    // 渲染报告列表
    renderPosts() {
        const container = document.getElementById('posts-container');
        
        // 过滤报告
        let filteredPosts = this.posts;
        if (this.currentFilter !== 'all') {
            filteredPosts = this.posts.filter(post => post.type === this.currentFilter);
        }
        
        // 按日期降序排序
        filteredPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        if (filteredPosts.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📝</div>
                    <h3 class="empty-title">暂无报告</h3>
                    <p class="empty-desc">任务运行后会自动生成报告，稍后再来看看吧~</p>
                </div>
            `;
            return;
        }
        
        // 渲染报告卡片
        container.innerHTML = filteredPosts.map(post => this.createPostCard(post)).join('');
    },
    
    // 创建报告卡片HTML
    createPostCard(post) {
        const typeInfo = this.taskTypes[post.type] || { name: '其他', badge: '' };
        const date = new Date(post.date).toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        return `
            <article class="post-card" data-type="${post.type}">
                <div class="post-header">
                    <h3 class="post-title">${post.title}</h3>
                    <span class="post-badge ${typeInfo.badge}">${typeInfo.name}</span>
                </div>
                <div class="post-meta">
                    <span>📅 ${date}</span>
                    <span>📄 ${post.wordCount || 0} 字</span>
                    ${post.duration ? `<span>⏱️ ${Math.round(post.duration / 1000)} 秒</span>` : ''}
                </div>
                <p class="post-excerpt">${post.excerpt || '暂无摘要'}</p>
                <div class="post-footer">
                    <a href="posts/${post.id}.html" class="read-more">
                        查看完整报告 →
                    </a>
                    <div class="post-stats">
                        <span>👁️ ${post.views || 0}</span>
                    </div>
                </div>
            </article>
        `;
    },
    
    // 设置事件监听器
    setupEventListeners() {
        // 筛选按钮点击
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                // 更新活跃状态
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                
                // 更新筛选条件
                this.currentFilter = e.target.dataset.filter;
                this.renderPosts();
            });
        });
    },
    
    // 更新统计信息
    updateStats() {
        const totalPosts = this.posts.length;
        const lastUpdate = this.posts.length > 0 
            ? new Date(Math.max(...this.posts.map(p => new Date(p.date)))).toLocaleDateString('zh-CN')
            : '-';
        
        document.getElementById('total-posts').textContent = totalPosts;
        document.getElementById('last-update').textContent = lastUpdate;
        document.getElementById('gen-time').textContent = new Date().toLocaleString('zh-CN');
    }
};

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
