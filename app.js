// Budget App JavaScript

class BudgetApp {
    constructor() {
        this.currentTheme = 'dark';
        this.currentSection = 'dashboard';
        this.data = this.loadInitialData();
        this.currentTransactions = [];
        this.expensesChart = null;
        this.incomeChart = null;
        this.expenseIncomeChart = null;
        this.balanceChart = null;
        this.savingsChart = null;
        this.counterValue = 0;
        this.counterInterval = null;
        this.defaultCategories = [
            {value: 'food', name: 'Еда'},
            {value: 'transport', name: 'Транспорт'},
            {value: 'housing', name: 'Жилье'},
            {value: 'entertainment', name: 'Развлечения'},
            {value: 'health', name: 'Здоровье'},
            {value: 'shopping', name: 'Покупки'},
            {value: 'utilities', name: 'Коммунальные'},
            {value: 'other', name: 'Другое'}
        ];
        this.customCategories = JSON.parse(localStorage.getItem('customCategories')) || [];

        this.init();
    }

    loadInitialData() {
        // Initial data based on the provided JSON
        return {
            userProfile: {
                name: "Александр",
                location: "Красноярск",
                monthlyIncome: 85000,
                currency: "RUB",
                financialGoals: [
                    {name: "Экстренный фонд", target: 200000, current: 75000, category: "emergency"},
                    {name: "Отпуск", target: 120000, current: 45000, category: "travel"},
                    {name: "Новый компьютер", target: 150000, current: 30000, category: "tech"}
                ]
            },
            monthlyBudget: {
                income: {
                    salary: 65000,
                    freelance: 20000
                },
                expenses: {
                    housing: {planned: 25000, actual: 26500, category: "Жилье"},
                    food: {planned: 15000, actual: 18200, category: "Еда"},
                    transport: {planned: 8000, actual: 7500, category: "Транспорт"},
                    utilities: {planned: 6000, actual: 5800, category: "Коммунальные"},
                    entertainment: {planned: 10000, actual: 12300, category: "Развлечения"},
                    shopping: {planned: 8000, actual: 9100, category: "Покупки"},
                    health: {planned: 3000, actual: 2800, category: "Здоровье"},
                    savings: {planned: 10000, actual: 5000, category: "Накопления"}
                }
            },
            recentTransactions: [
                {date: "2025-08-19", description: "Зарплата", amount: 65000, category: "income", type: "credit"},
                {date: "2025-08-18", description: "Фриланс проект", amount: 8000, category: "income", type: "credit"},
                {date: "2025-08-18", description: "Продукты в Ленте", amount: -2340, category: "food", type: "debit"},
                {date: "2025-08-17", description: "Бензин", amount: -2800, category: "transport", type: "debit"},
                {date: "2025-08-16", description: "Кино с друзьями", amount: -1200, category: "entertainment", type: "debit"},
                {date: "2025-08-15", description: "Аренда квартиры", amount: -26500, category: "housing", type: "debit"},
                {date: "2025-08-14", description: "Интернет", amount: -800, category: "utilities", type: "debit"},
                {date: "2025-08-13", description: "Обед в кафе", amount: -1500, category: "food", type: "debit"}
            ],
            budgetInsights: {
                spendingTrends: {
                    totalSpent: 85000,
                    avgDailySpending: 2800,
                    topCategories: ["housing", "food", "entertainment"],
                    savingsRate: 6
                },
                recommendations: [
                    "Вы превысили бюджет на еду на 21%. Попробуйте планировать меню заранее.",
                    "Отличная работа с транспортными расходами - экономия 6%!",
                    "Рекомендуем увеличить накопления до 15% от дохода.",
                    "Развлечения занимают 14% бюджета - подумайте о бесплатных активностях."
                ]
            },
            gamification: {
                level: 7,
                experience: 2340,
                nextLevelExp: 3000,
                achievements: [
                    {name: "Экономный водитель", description: "Сэкономили на транспорте", earned: true},
                    {name: "Мастер накоплений", description: "Накопили 50000 руб", earned: true},
                    {name: "Планировщик бюджета", description: "Ведете бюджет 30 дней", earned: false}
                ],
                streaks: {
                    budgetTracking: 23,
                    savingsGoal: 12
                }
            }
        };
    }

    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.setupApp();
            });
        } else {
            this.setupApp();
        }
    }

    setupApp() {
        this.setupEventListeners();
        this.setupTheme();
        this.currentTransactions = [...this.data.recentTransactions];
        this.renderCategoryOptions();
        this.renderCategoryList();
        this.renderDashboard();
        this.updateExpBar();
        this.showSection('dashboard');
    }

    setupEventListeners() {
        // Theme toggle with more robust event handling
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            // Remove any existing listeners
            themeToggle.replaceWith(themeToggle.cloneNode(true));
            document.getElementById('themeToggle').addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.toggleTheme();
            });
        }

        // Navigation with more robust event handling
        document.querySelectorAll('.nav-link').forEach(link => {
            // Remove existing listeners by cloning
            const newLink = link.cloneNode(true);
            link.parentNode.replaceChild(newLink, link);
            
            newLink.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const section = newLink.dataset.section;
                console.log('Navigating to:', section); // Debug log
                if (section) {
                    this.showSection(section);
                }
            });
        });

        // Add transaction modal
        const addTransactionBtn = document.getElementById('addTransactionBtn');
        if (addTransactionBtn) {
            addTransactionBtn.replaceWith(addTransactionBtn.cloneNode(true));
            document.getElementById('addTransactionBtn').addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Opening add transaction modal'); // Debug log
                this.showModal('addTransactionModal');
            });
        }

        // Modal close buttons
        const closeTransactionModal = document.getElementById('closeTransactionModal');
        if (closeTransactionModal) {
            closeTransactionModal.addEventListener('click', (e) => {
                e.preventDefault();
                this.hideModal('addTransactionModal');
            });
        }

        const cancelTransaction = document.getElementById('cancelTransaction');
        if (cancelTransaction) {
            cancelTransaction.addEventListener('click', (e) => {
                e.preventDefault();
                this.hideModal('addTransactionModal');
            });
        }

        // Transaction form
        const transactionForm = document.getElementById('transactionForm');
        if (transactionForm) {
            transactionForm.addEventListener('submit', (e) => this.handleAddTransaction(e));
        }

        // Add goal modal
        const addGoalBtn = document.getElementById('addGoalBtn');
        if (addGoalBtn) {
            addGoalBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showModal('addGoalModal');
            });
        }

        const closeGoalModal = document.getElementById('closeGoalModal');
        if (closeGoalModal) {
            closeGoalModal.addEventListener('click', (e) => {
                e.preventDefault();
                this.hideModal('addGoalModal');
            });
        }

        const cancelGoal = document.getElementById('cancelGoal');
        if (cancelGoal) {
            cancelGoal.addEventListener('click', (e) => {
                e.preventDefault();
                this.hideModal('addGoalModal');
            });
        }

        const goalForm = document.getElementById('goalForm');
        if (goalForm) {
            goalForm.addEventListener('submit', (e) => this.handleAddGoal(e));
        }

        // AI Chat
        const sendMessage = document.getElementById('sendMessage');
        if (sendMessage) {
            sendMessage.addEventListener('click', (e) => {
                e.preventDefault();
                this.sendChatMessage();
            });
        }

        const chatInput = document.getElementById('chatInput');
        if (chatInput) {
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.sendChatMessage();
                }
            });
        }

        // AI Suggestions with better event handling
        document.querySelectorAll('.suggestion-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const message = btn.dataset.message;
                console.log('Suggestion clicked:', message); // Debug log
                this.addChatMessage(message, 'user');
                setTimeout(() => this.generateAIResponse(message), 500);
            });
        });

        // Transaction search and filter
        const transactionSearch = document.getElementById('transactionSearch');
        if (transactionSearch) {
            transactionSearch.addEventListener('input', (e) => this.filterTransactions(e.target.value));
        }

        // Filter buttons with better event handling
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const filter = btn.dataset.filter;
                console.log('Filter clicked:', filter); // Debug log
                this.setTransactionFilter(filter);
            });
        });

        // Modal backdrop clicks
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideModal(modal.id);
                }
            });
        });

        // Category modal
        const addCategoryBtn = document.getElementById('addCategoryBtn');
        if (addCategoryBtn) {
            addCategoryBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showModal('addCategoryModal');
            });
        }

        const closeCategoryModal = document.getElementById('closeCategoryModal');
        if (closeCategoryModal) {
            closeCategoryModal.addEventListener('click', (e) => {
                e.preventDefault();
                this.hideModal('addCategoryModal');
            });
        }

        const cancelCategory = document.getElementById('cancelCategory');
        if (cancelCategory) {
            cancelCategory.addEventListener('click', (e) => {
                e.preventDefault();
                this.hideModal('addCategoryModal');
            });
        }

        const categoryForm = document.getElementById('categoryForm');
        if (categoryForm) {
            categoryForm.addEventListener('submit', (e) => this.handleAddCategory(e));
        }

        const categoryList = document.getElementById('categoryList');
        if (categoryList) {
            categoryList.addEventListener('click', (e) => {
                if (e.target.classList.contains('remove-category')) {
                    const name = e.target.dataset.name;
                    this.handleRemoveCategory(name);
                }
            });
        }
    }

    setupTheme() {
        const savedTheme = localStorage.getItem('budgetAppTheme') || 'dark';
        this.setTheme(savedTheme);
    }

    toggleTheme() {
        console.log('Theme toggle clicked, current theme:', this.currentTheme); // Debug log
        const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
    }

    setTheme(theme) {
        console.log('Setting theme to:', theme); // Debug log
        this.currentTheme = theme;
        
        // Apply theme to body
        document.body.setAttribute('data-color-scheme', theme);
        document.documentElement.setAttribute('data-color-scheme', theme);
        
        // Update theme button text
        const themeBtn = document.getElementById('themeToggle');
        if (themeBtn) {
            themeBtn.textContent = theme === 'dark' ? '☀️ Светлая тема' : '🌙 Темная тема';
        }
        
        localStorage.setItem('budgetAppTheme', theme);
    }

    showSection(sectionName) {
        console.log('Showing section:', sectionName); // Debug log

        if (this.counterInterval) {
            clearInterval(this.counterInterval);
            this.counterInterval = null;
        }

        // Update navigation active state
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        const activeLink = document.querySelector(`[data-section="${sectionName}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }

        // Update content sections
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        const activeSection = document.getElementById(sectionName);
        if (activeSection) {
            activeSection.classList.add('active');
        } else {
            console.log('Section not found:', sectionName); // Debug log
        }

        // Update page title
        const titles = {
            dashboard: 'Дашборд',
            transactions: 'Транзакции',
            goals: 'Цели',
            analytics: 'Аналитика',
            counter: 'Счетчик',
            'ai-assistant': 'AI Помощник',
            settings: 'Настройки'
        };
        const titleElement = document.getElementById('pageTitle');
        if (titleElement) {
            titleElement.textContent = titles[sectionName] || sectionName;
        }

        this.currentSection = sectionName;

        // Load section-specific content
        switch(sectionName) {
            case 'dashboard':
                this.renderDashboard();
                break;
            case 'transactions':
                this.renderTransactions();
                break;
            case 'goals':
                this.renderGoals();
                break;
            case 'analytics':
                setTimeout(() => this.renderAnalytics(), 100);
                break;
            case 'counter':
                this.renderCounter();
                break;
        }
    }

    renderDashboard() {
        this.renderGoalsPreview();
        this.renderRecentTransactions();
        this.renderAchievements();
        this.updateStats();
    }

    updateStats() {
        const totalIncome = this.data.monthlyBudget.income.salary + this.data.monthlyBudget.income.freelance;
        const totalExpenses = Object.values(this.data.monthlyBudget.expenses).reduce((sum, exp) => sum + exp.actual, 0);
        const balance = totalIncome - totalExpenses;

        const totalBalanceEl = document.getElementById('totalBalance');
        if (totalBalanceEl) {
            totalBalanceEl.textContent = this.formatCurrency(balance);
        }
        
        // Update stat cards
        const incomeStatEl = document.querySelector('.stat-card.income .stat-value');
        if (incomeStatEl) {
            incomeStatEl.textContent = this.formatCurrency(totalIncome);
        }

        const expenseStatEl = document.querySelector('.stat-card.expense .stat-value');
        if (expenseStatEl) {
            expenseStatEl.textContent = this.formatCurrency(totalExpenses);
        }

        const savingsStatEl = document.querySelector('.stat-card.savings .stat-value');
        if (savingsStatEl) {
            savingsStatEl.textContent = this.formatCurrency(this.data.monthlyBudget.expenses.savings.actual);
        }
    }

    renderGoalsPreview() {
        const container = document.getElementById('goalsPreview');
        if (!container) return;
        
        container.innerHTML = '';

        this.data.userProfile.financialGoals.slice(0, 3).forEach(goal => {
            const percentage = Math.round((goal.current / goal.target) * 100);
            const goalElement = document.createElement('div');
            goalElement.className = 'goal-item';
            goalElement.innerHTML = `
                <div class="goal-info">
                    <h4>${goal.name}</h4>
                    <div class="goal-progress">${this.formatCurrency(goal.current)} из ${this.formatCurrency(goal.target)}</div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${percentage}%"></div>
                    </div>
                </div>
                <div class="goal-amount">
                    <div class="goal-percentage">${percentage}%</div>
                </div>
            `;
            container.appendChild(goalElement);
        });
    }

    renderRecentTransactions() {
        const container = document.getElementById('recentTransactions');
        if (!container) return;
        
        container.innerHTML = '';

        this.data.recentTransactions.slice(0, 5).forEach(transaction => {
            const transactionElement = document.createElement('div');
            transactionElement.className = 'transaction-item';
            transactionElement.innerHTML = `
                <div class="transaction-info">
                    <div class="transaction-description">${transaction.description}</div>
                    <div class="transaction-meta">${this.formatDate(transaction.date)} • ${this.getCategoryName(transaction.category)}</div>
                </div>
                <div class="transaction-amount ${transaction.amount > 0 ? 'positive' : 'negative'}">
                    ${transaction.amount > 0 ? '+' : ''}${this.formatCurrency(Math.abs(transaction.amount))}
                </div>
            `;
            container.appendChild(transactionElement);
        });
    }

    renderAchievements() {
        const container = document.getElementById('achievementsGrid');
        if (!container) return;
        
        container.innerHTML = '';

        this.data.gamification.achievements.forEach(achievement => {
            const achievementElement = document.createElement('div');
            achievementElement.className = `achievement-item ${achievement.earned ? 'earned' : ''}`;
            achievementElement.innerHTML = `
                <div class="achievement-icon">${achievement.earned ? '🏆' : '🔒'}</div>
                <h4 class="achievement-name">${achievement.name}</h4>
                <p class="achievement-description">${achievement.description}</p>
            `;
            container.appendChild(achievementElement);
        });
    }

    renderTransactions() {
        this.currentTransactions = [...this.data.recentTransactions];
        this.renderTransactionsList();
    }

    renderTransactionsList() {
        const container = document.getElementById('transactionsGrid');
        if (!container) return;
        
        container.innerHTML = '';

        this.currentTransactions.forEach((transaction, index) => {
            const transactionCard = document.createElement('div');
            transactionCard.className = 'transaction-card';
            transactionCard.innerHTML = `
                <div class="transaction-info">
                    <div class="transaction-description">${transaction.description}</div>
                    <div class="transaction-meta">${this.formatDate(transaction.date)} • ${this.getCategoryName(transaction.category)}</div>
                </div>
                <div class="transaction-meta-container">
                    <div class="transaction-amount ${transaction.amount > 0 ? 'positive' : 'negative'}">
                        ${transaction.amount > 0 ? '+' : ''}${this.formatCurrency(Math.abs(transaction.amount))}
                    </div>
                    <div class="transaction-actions">
                        <button class="btn btn--secondary btn--sm" onclick="app.editTransaction(${index})">✏️</button>
                        <button class="btn btn--secondary btn--sm" onclick="app.deleteTransaction(${index})">🗑️</button>
                    </div>
                </div>
            `;
            container.appendChild(transactionCard);
        });
    }

    renderGoals() {
        const container = document.getElementById('goalsGrid');
        if (!container) return;
        
        container.innerHTML = '';

        this.data.userProfile.financialGoals.forEach((goal, index) => {
            const percentage = Math.round((goal.current / goal.target) * 100);
            const goalCard = document.createElement('div');
            goalCard.className = 'goal-card';
            goalCard.innerHTML = `
                <div class="goal-header">
                    <h3 class="goal-title">${goal.name}</h3>
                    <span class="goal-category">${this.getCategoryIcon(goal.category)} ${this.getCategoryName(goal.category)}</span>
                </div>
                <div class="goal-amounts">
                    <span class="goal-current">Накоплено: ${this.formatCurrency(goal.current)}</span>
                    <span class="goal-target">Цель: ${this.formatCurrency(goal.target)}</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${percentage}%"></div>
                </div>
                <div class="goal-percentage">${percentage}% завершено</div>
                <div class="goal-actions">
                    <button class="btn btn--secondary btn--sm" onclick="app.addToGoal(${index})">+ Пополнить</button>
                    <button class="btn btn--secondary btn--sm" onclick="app.editGoal(${index})">✏️</button>
                    <button class="btn btn--secondary btn--sm" onclick="app.deleteGoal(${index})">🗑️</button>
                </div>
            `;
            container.appendChild(goalCard);
        });
    }

    renderAnalytics() {
        this.renderExpensesChart();
        this.renderIncomeChart();
        this.renderExpenseIncomeChart();
        this.renderBalanceChart();
        this.renderSavingsChart();
        this.renderInsights();
    }

    renderExpensesChart() {
        const canvas = document.getElementById('expensesChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        const expenses = this.data.monthlyBudget.expenses;
        const labels = Object.values(expenses).map(exp => exp.category);
        const data = Object.values(expenses).map(exp => exp.actual);
        const colors = ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F', '#DB4545', '#D2BA4C', '#964325'];

        if (this.expensesChart) {
            this.expensesChart.destroy();
        }

        this.expensesChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors,
                    borderWidth: 2,
                    borderColor: getComputedStyle(document.documentElement).getPropertyValue('--color-surface')
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true,
                            color: getComputedStyle(document.documentElement).getPropertyValue('--color-text')
                        }
                    }
                }
            }
        });
    }

    renderIncomeChart() {
        const canvas = document.getElementById('incomeChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');

        const income = this.data.monthlyBudget.income;
        const labels = Object.keys(income).map(key => {
            const names = { salary: 'Зарплата', freelance: 'Фриланс' };
            return names[key] || key;
        });
        const data = Object.values(income);

        if (this.incomeChart) {
            this.incomeChart.destroy();
        }

        this.incomeChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: '#1FB8CD',
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: value => value.toLocaleString('ru-RU') + ' ₽',
                            color: getComputedStyle(document.documentElement).getPropertyValue('--color-text-secondary')
                        },
                        grid: {
                            color: getComputedStyle(document.documentElement).getPropertyValue('--color-border')
                        }
                    },
                    x: {
                        ticks: {
                            color: getComputedStyle(document.documentElement).getPropertyValue('--color-text-secondary')
                        },
                        grid: {
                            color: getComputedStyle(document.documentElement).getPropertyValue('--color-border')
                        }
                    }
                }
            }
        });
    }

    renderExpenseIncomeChart() {
        const canvas = document.getElementById('expenseIncomeChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');

        const labels = [];
        const incomeData = [];
        const expenseData = [];
        const currentDate = new Date();

        const baseIncome = Object.values(this.data.monthlyBudget.income).reduce((a, b) => a + b, 0);
        const baseExpense = Object.values(this.data.monthlyBudget.expenses).reduce((a, b) => a + b.actual, 0);

        for (let i = 5; i >= 0; i--) {
            const date = new Date(currentDate);
            date.setMonth(date.getMonth() - i);
            labels.push(date.toLocaleDateString('ru-RU', { month: 'short' }));

            incomeData.push(baseIncome + (Math.sin(i) * 5000) + Math.random() * 3000);
            expenseData.push(baseExpense + (Math.cos(i) * 4000) + Math.random() * 3000);
        }

        if (this.expenseIncomeChart) {
            this.expenseIncomeChart.destroy();
        }

        this.expenseIncomeChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Доходы',
                        data: incomeData,
                        borderColor: '#1FB8CD',
                        backgroundColor: 'rgba(31, 184, 205, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4
                    },
                    {
                        label: 'Расходы',
                        data: expenseData,
                        borderColor: '#FFC185',
                        backgroundColor: 'rgba(255, 193, 133, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom', labels: { color: getComputedStyle(document.documentElement).getPropertyValue('--color-text') } } },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: value => value.toLocaleString('ru-RU') + ' ₽',
                            color: getComputedStyle(document.documentElement).getPropertyValue('--color-text-secondary')
                        },
                        grid: {
                            color: getComputedStyle(document.documentElement).getPropertyValue('--color-border')
                        }
                    },
                    x: {
                        ticks: {
                            color: getComputedStyle(document.documentElement).getPropertyValue('--color-text-secondary')
                        },
                        grid: {
                            color: getComputedStyle(document.documentElement).getPropertyValue('--color-border')
                        }
                    }
                }
            }
        });
    }

    renderSavingsChart() {
        const canvas = document.getElementById('savingsChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const goal = this.data.userProfile.financialGoals[0];
        const current = goal.current;
        const target = goal.target;
        const remaining = Math.max(target - current, 0);

        if (this.savingsChart) {
            this.savingsChart.destroy();
        }

        this.savingsChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Текущий прогресс', 'Осталось'],
                datasets: [{
                    data: [current, remaining],
                    backgroundColor: ['#1FB8CD', '#ECEBD5'],
                    borderWidth: 2,
                    borderColor: getComputedStyle(document.documentElement).getPropertyValue('--color-surface')
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: { legend: { display: false } }
            }
        });

        const goalText = document.getElementById('savingsGoalText');
        if (goalText) {
            goalText.textContent = `${this.formatCurrency(current)} / ${this.formatCurrency(target)} ₽`;
        }
    }

    renderBalanceChart() {
        const canvas = document.getElementById('balanceChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        // Generate sample data for the last 7 days
        const labels = [];
        const balanceData = [];
        const currentDate = new Date();
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date(currentDate);
            date.setDate(date.getDate() - i);
            labels.push(date.toLocaleDateString('ru-RU', { month: 'short', day: 'numeric' }));
            
            // Simulate balance changes
            const baseBalance = 150000;
            const variation = Math.sin(i * 0.5) * 10000 + Math.random() * 5000;
            balanceData.push(baseBalance + variation);
        }

        if (this.balanceChart) {
            this.balanceChart.destroy();
        }

        this.balanceChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Баланс',
                    data: balanceData,
                    borderColor: '#1FB8CD',
                    backgroundColor: 'rgba(31, 184, 205, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#1FB8CD',
                    pointBorderColor: '#1FB8CD',
                    pointRadius: 6,
                    pointHoverRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        ticks: {
                            callback: function(value) {
                                return value.toLocaleString('ru-RU') + ' ₽';
                            },
                            color: getComputedStyle(document.documentElement).getPropertyValue('--color-text-secondary')
                        },
                        grid: {
                            color: getComputedStyle(document.documentElement).getPropertyValue('--color-border')
                        }
                    },
                    x: {
                        ticks: {
                            color: getComputedStyle(document.documentElement).getPropertyValue('--color-text-secondary')
                        },
                        grid: {
                            color: getComputedStyle(document.documentElement).getPropertyValue('--color-border')
                        }
                    }
                }
            }
        });
    }

    renderInsights() {
        const container = document.getElementById('insightsList');
        if (!container) return;
        
        container.innerHTML = '';

        this.data.budgetInsights.recommendations.forEach(insight => {
            const insightElement = document.createElement('div');
            insightElement.className = 'insight-item';
            insightElement.textContent = insight;
            container.appendChild(insightElement);
        });
    }

    renderCounter() {
        const balanceEl = document.getElementById('counterBalanceValue');
        const incomeEl = document.getElementById('counterIncomeTotal');
        const expenseEl = document.getElementById('counterExpenseTotal');
        const balanceContainer = document.getElementById('counterBalanceContainer');
        if (!balanceEl || !incomeEl || !expenseEl || !balanceContainer) return;

        const totalIncome = Object.values(this.data.monthlyBudget.income)
            .reduce((sum, inc) => sum + inc, 0);
        const totalExpenses = Object.values(this.data.monthlyBudget.expenses)
            .reduce((sum, exp) => sum + exp.actual, 0);
        const net = totalIncome - totalExpenses;

        incomeEl.textContent = this.formatCurrency(totalIncome);
        expenseEl.textContent = this.formatCurrency(totalExpenses);

        if (this.counterInterval) {
            clearInterval(this.counterInterval);
            this.counterInterval = null;
        }

        this.counterValue = 0;
        balanceEl.textContent = this.formatCurrency(this.counterValue);
        balanceContainer.classList.toggle('negative', this.counterValue < 0);
        balanceContainer.classList.toggle('positive', this.counterValue >= 0);

        if (net !== 0) {
            const step = net > 0 ? 1 : -1;
            this.counterInterval = setInterval(() => {
                this.counterValue += step;
                balanceEl.textContent = this.formatCurrency(this.counterValue);
                balanceContainer.classList.toggle('negative', this.counterValue < 0);
                balanceContainer.classList.toggle('positive', this.counterValue >= 0);

                if (this.counterValue === net) {
                    clearInterval(this.counterInterval);
                    this.counterInterval = null;
                }
            }, 1000);
        }
    }

    updateExpBar() {
        const current = this.data.gamification.experience;
        const max = this.data.gamification.nextLevelExp;
        const percentage = (current / max) * 100;
        
        const expFill = document.getElementById('expFill');
        if (expFill) {
            expFill.style.width = `${percentage}%`;
        }

        const currentExpEl = document.getElementById('currentExp');
        if (currentExpEl) {
            currentExpEl.textContent = current;
        }

        const maxExpEl = document.getElementById('maxExp');
        if (maxExpEl) {
            maxExpEl.textContent = max;
        }

        const userLevelEl = document.getElementById('userLevel');
        if (userLevelEl) {
            userLevelEl.textContent = this.data.gamification.level;
        }
    }

    showModal(modalId) {
        console.log('Showing modal:', modalId); // Debug log
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        } else {
            console.log('Modal not found:', modalId); // Debug log
        }
    }

    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('hidden');
            document.body.style.overflow = '';
            
            // Reset forms
            const form = modal.querySelector('form');
            if (form) form.reset();
        }
    }

    handleAddTransaction(e) {
        e.preventDefault();
        
        const type = document.getElementById('transactionType').value;
        const amount = parseFloat(document.getElementById('transactionAmount').value);
        const description = document.getElementById('transactionDescription').value;
        const category = document.getElementById('transactionCategory').value;

        if (!amount || !description) {
            this.showNotification('Пожалуйста, заполните все поля');
            return;
        }

        const transaction = {
            date: new Date().toISOString().split('T')[0],
            description: description,
            amount: type === 'expense' ? -amount : amount,
            category: type === 'expense' ? category : 'income',
            type: type === 'expense' ? 'debit' : 'credit'
        };

        this.data.recentTransactions.unshift(transaction);
        this.hideModal('addTransactionModal');
        this.showNotification('Транзакция успешно добавлена!');
        
        // Add experience for tracking
        this.addExperience(10);
        
        // Update UI
        if (this.currentSection === 'dashboard') {
            this.renderDashboard();
        } else if (this.currentSection === 'transactions') {
            this.renderTransactions();
        }
    }

    handleAddGoal(e) {
        e.preventDefault();
        
        const name = document.getElementById('goalName').value;
        const target = parseFloat(document.getElementById('goalTarget').value);
        const current = parseFloat(document.getElementById('goalCurrent').value) || 0;
        const category = document.getElementById('goalCategory').value;

        if (!name || !target) {
            this.showNotification('Пожалуйста, заполните все поля');
            return;
        }

        const goal = {
            name: name,
            target: target,
            current: current,
            category: category
        };

        this.data.userProfile.financialGoals.push(goal);
        this.hideModal('addGoalModal');
        this.showNotification('Цель успешно добавлена!');
        
        this.addExperience(20);
        
        if (this.currentSection === 'goals') {
            this.renderGoals();
        } else if (this.currentSection === 'dashboard') {
            this.renderGoalsPreview();
        }
    }

    addToGoal(goalIndex) {
        const amount = prompt('Введите сумму для пополнения цели:');
        if (amount && !isNaN(amount) && amount > 0) {
            this.data.userProfile.financialGoals[goalIndex].current += parseFloat(amount);
            this.showNotification(`Цель пополнена на ${this.formatCurrency(amount)}!`);
            this.addExperience(15);

            if (this.currentSection === 'goals') {
                this.renderGoals();
            } else if (this.currentSection === 'dashboard') {
                this.renderGoalsPreview();
            }
        }
    }

    editIncome() {
        const salary = parseFloat(prompt('Новая зарплата', this.data.monthlyBudget.income.salary));
        const freelance = parseFloat(prompt('Новый доход от фриланса', this.data.monthlyBudget.income.freelance));
        if (!isNaN(salary)) {
            this.data.monthlyBudget.income.salary = salary;
        }
        if (!isNaN(freelance)) {
            this.data.monthlyBudget.income.freelance = freelance;
        }
        this.updateStats();
    }

    editExpenses() {
        const categories = Object.keys(this.data.monthlyBudget.expenses);
        const category = prompt('Категория для редактирования: ' + categories.join(', '));
        if (category && this.data.monthlyBudget.expenses[category]) {
            const value = parseFloat(prompt('Новая сумма для ' + this.getCategoryName(category), this.data.monthlyBudget.expenses[category].actual));
            if (!isNaN(value)) {
                this.data.monthlyBudget.expenses[category].actual = value;
                this.updateStats();
                if (this.currentSection === 'analytics') {
                    this.renderAnalytics();
                }
            }
        }
    }

    editSavings() {
        const value = parseFloat(prompt('Новая сумма накоплений', this.data.monthlyBudget.expenses.savings.actual));
        if (!isNaN(value)) {
            this.data.monthlyBudget.expenses.savings.actual = value;
            this.updateStats();
            if (this.currentSection === 'analytics') {
                this.renderAnalytics();
            }
        }
    }

    editTransaction(index) {
        const transaction = this.currentTransactions[index];
        if (!transaction) return;
        const description = prompt('Описание транзакции', transaction.description);
        if (description === null) return;
        const amount = parseFloat(prompt('Сумма', transaction.amount));
        if (isNaN(amount)) return;
        transaction.description = description;
        transaction.amount = amount;
        transaction.type = amount >= 0 ? 'credit' : 'debit';
        this.data.recentTransactions = [...this.currentTransactions];
        this.renderTransactionsList();
        this.renderRecentTransactions();
    }

    deleteTransaction(index) {
        if (!confirm('Удалить транзакцию?')) return;
        this.currentTransactions.splice(index, 1);
        this.data.recentTransactions = [...this.currentTransactions];
        this.renderTransactionsList();
        this.renderRecentTransactions();
    }

    editGoal(index) {
        const goal = this.data.userProfile.financialGoals[index];
        if (!goal) return;
        const name = prompt('Название цели', goal.name);
        if (!name) return;
        const target = parseFloat(prompt('Целевая сумма', goal.target));
        if (isNaN(target)) return;
        const current = parseFloat(prompt('Текущая сумма', goal.current));
        if (isNaN(current)) return;
        goal.name = name;
        goal.target = target;
        goal.current = current;
        if (this.currentSection === 'goals') {
            this.renderGoals();
        } else if (this.currentSection === 'dashboard') {
            this.renderGoalsPreview();
        }
    }

    deleteGoal(index) {
        if (!confirm('Удалить цель?')) return;
        this.data.userProfile.financialGoals.splice(index, 1);
        if (this.currentSection === 'goals') {
            this.renderGoals();
        } else if (this.currentSection === 'dashboard') {
            this.renderGoalsPreview();
        }
    }

    handleAddCategory(e) {
        e.preventDefault();

        const name = document.getElementById('categoryName').value.trim();
        if (!name) {
            this.showNotification('Введите название категории');
            return;
        }

        if (this.customCategories.includes(name)) {
            this.showNotification('Такая категория уже существует');
            return;
        }

        this.customCategories.push(name);
        localStorage.setItem('customCategories', JSON.stringify(this.customCategories));

        this.renderCategoryOptions();
        this.renderCategoryList();
        this.hideModal('addCategoryModal');
        this.showNotification('Категория добавлена');
    }

    handleRemoveCategory(name) {
        this.customCategories = this.customCategories.filter(c => c !== name);
        localStorage.setItem('customCategories', JSON.stringify(this.customCategories));
        this.renderCategoryOptions();
        this.renderCategoryList();
    }

    renderCategoryOptions() {
        const select = document.getElementById('transactionCategory');
        if (!select) return;

        select.innerHTML = '';
        [...this.defaultCategories, ...this.customCategories.map(c => ({value: c, name: c}))].forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.value;
            option.textContent = cat.name;
            select.appendChild(option);
        });
    }

    renderCategoryList() {
        const container = document.getElementById('categoryList');
        if (!container) return;

        container.innerHTML = '';
        const allCats = [...this.defaultCategories.map(c => ({name: c.name, removable: false})),
                         ...this.customCategories.map(c => ({name: c, removable: true}))];

        allCats.forEach(cat => {
            const item = document.createElement('div');
            item.className = 'category-item';
            item.textContent = cat.name;
            if (cat.removable) {
                const removeBtn = document.createElement('button');
                removeBtn.className = 'remove-category';
                removeBtn.dataset.name = cat.name;
                removeBtn.textContent = '×';
                item.appendChild(removeBtn);
            }
            container.appendChild(item);
        });
    }

    sendChatMessage() {
        const input = document.getElementById('chatInput');
        if (!input) return;
        
        const message = input.value.trim();
        
        if (!message) return;
        
        this.addChatMessage(message, 'user');
        input.value = '';
        
        setTimeout(() => {
            this.generateAIResponse(message);
        }, 1000);
    }

    addChatMessage(message, sender) {
        const container = document.getElementById('chatMessages');
        if (!container) return;
        
        const messageElement = document.createElement('div');
        messageElement.className = `message ${sender}-message`;
        messageElement.innerHTML = `
            <div class="message-content">${message}</div>
        `;
        container.appendChild(messageElement);
        container.scrollTop = container.scrollHeight;
    }

    generateAIResponse(userMessage) {
        console.log('Generating AI response for:', userMessage); // Debug log
        
        const responses = {
            'как мне сэкономить больше денег?': '💡 Отличный вопрос! Исходя из анализа ваших трат, рекомендую:\n\n• Планировать меню на неделю (экономия ~3000₽/мес)\n• Использовать кэшбэк карты для покупок\n• Пересмотреть подписки и отменить неиспользуемые\n• Готовить кофе дома вместо покупки в кафе',
            'проанализируй мои расходы за месяц': '📊 Анализ ваших расходов:\n\n✅ Хорошо: транспорт (-6% от плана)\n⚠️ Внимание: еда (+21% от плана)\n❌ Проблема: развлечения (+23% от плана)\n\nВаш коэффициент накоплений: 6%. Рекомендую довести до 15%.',
            'какие у меня финансовые цели?': '🎯 Ваши активные цели:\n\n💰 Экстренный фонд: 75,000₽ из 200,000₽ (38%)\n✈️ Отпуск: 45,000₽ из 120,000₽ (38%)\n💻 Новый компьютер: 30,000₽ из 150,000₽ (20%)\n\nСовет: сосредоточьтесь на экстренном фонде - это ваш финансовый щит!',
            'дай совет по инвестициям': '📈 Инвестиционные рекомендации:\n\n1. Сначала создайте экстренный фонд (3-6 месячных расходов)\n2. Начните с консервативных инструментов: ОФЗ, депозиты\n3. Изучите индексные фонды для долгосрочных инвестиций\n4. Не инвестируйте больше 10% в высокорисковые активы\n\n⚠️ Помните: инвестиции - это марафон, а не спринт!'
        };

        const lowercaseMessage = userMessage.toLowerCase();
        let response = responses[lowercaseMessage];

        if (!response) {
            const generalResponses = [
                '🤖 Интересный вопрос! Для более точного ответа мне нужно больше контекста о ваших финансовых целях.',
                '💭 Хм, позвольте подумать... Можете уточнить, что именно вас интересует в этом вопросе?',
                '📝 Отличная тема для обсуждения! Рекомендую также посмотреть раздел "Аналитика" для детального анализа.',
                '🎯 Каждая финансовая ситуация уникальна. Какие у вас приоритеты на ближайшие месяцы?'
            ];
            response = generalResponses[Math.floor(Math.random() * generalResponses.length)];
        }

        this.addChatMessage(response, 'ai');
    }

    filterTransactions(searchTerm) {
        console.log('Filtering transactions with term:', searchTerm); // Debug log
        if (!searchTerm) {
            this.currentTransactions = [...this.data.recentTransactions];
        } else {
            this.currentTransactions = this.data.recentTransactions.filter(transaction =>
                transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                this.getCategoryName(transaction.category).toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        this.renderTransactionsList();
    }

    setTransactionFilter(filter) {
        console.log('Setting transaction filter to:', filter); // Debug log
        
        // Update button states
        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        const activeBtn = document.querySelector(`[data-filter="${filter}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }

        // Filter transactions
        if (filter === 'all') {
            this.currentTransactions = [...this.data.recentTransactions];
        } else if (filter === 'income') {
            this.currentTransactions = this.data.recentTransactions.filter(t => t.amount > 0);
        } else if (filter === 'expense') {
            this.currentTransactions = this.data.recentTransactions.filter(t => t.amount < 0);
        }
        this.renderTransactionsList();
    }

    addExperience(amount) {
        this.data.gamification.experience += amount;
        
        if (this.data.gamification.experience >= this.data.gamification.nextLevelExp) {
            this.levelUp();
        }
        
        this.updateExpBar();
    }

    levelUp() {
        this.data.gamification.level++;
        this.data.gamification.experience = 0;
        this.data.gamification.nextLevelExp += 500;
        
        this.showNotification(`🎉 Поздравляем! Вы достигли ${this.data.gamification.level} уровня!`);
    }

    showNotification(message) {
        const notification = document.getElementById('notification');
        const text = document.getElementById('notificationText');
        
        if (notification && text) {
            text.textContent = message;
            notification.classList.remove('hidden');
            
            setTimeout(() => {
                notification.classList.add('hidden');
            }, 3000);
        }
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('ru-RU', {
            style: 'decimal',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'short'
        });
    }

    getCategoryName(category) {
        const categories = {
            income: 'Доходы',
            food: 'Еда',
            transport: 'Транспорт',
            housing: 'Жилье',
            entertainment: 'Развлечения',
            health: 'Здоровье',
            shopping: 'Покупки',
            utilities: 'Коммунальные',
            other: 'Другое',
            emergency: 'Экстренный фонд',
            travel: 'Путешествия',
            tech: 'Техника',
            education: 'Образование'
        };
        return categories[category] || category;
    }

    getCategoryIcon(category) {
        const icons = {
            emergency: '🚨',
            travel: '✈️',
            tech: '💻',
            education: '📚',
            other: '📋'
        };
        return icons[category] || '📋';
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing app...'); // Debug log
    window.app = new BudgetApp();
});

// Add some global utility functions
window.addEventListener('resize', () => {
    // Redraw charts on resize if in analytics section
    if (window.app && window.app.currentSection === 'analytics') {
        setTimeout(() => {
            window.app.renderAnalytics();
        }, 100);
    }
});

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + N for new transaction
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        if (window.app) {
            window.app.showModal('addTransactionModal');
        }
    }
    
    // Escape to close modals
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal:not(.hidden)').forEach(modal => {
            if (window.app) {
                window.app.hideModal(modal.id);
            }
        });
    }
});

// Add touch gestures for mobile
let touchStartX = 0;
let touchEndX = 0;

document.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
});

document.addEventListener('touchend', e => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
});

function handleSwipe() {
    const threshold = 50;
    const diff = touchStartX - touchEndX;
    
    if (Math.abs(diff) > threshold && window.app) {
        const sections = ['dashboard', 'transactions', 'goals', 'analytics', 'counter', 'ai-assistant', 'settings'];
        const currentIndex = sections.indexOf(window.app.currentSection);
        
        if (diff > 0 && currentIndex < sections.length - 1) {
            // Swipe left - next section
            window.app.showSection(sections[currentIndex + 1]);
        } else if (diff < 0 && currentIndex > 0) {
            // Swipe right - previous section
            window.app.showSection(sections[currentIndex - 1]);
        }
    }
}