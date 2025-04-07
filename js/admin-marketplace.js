class AdminMarketplace {
    constructor() {
        if (!this.checkAdminAccess()) {
            window.location.href = 'index.html';
            return;
        }

        this.setupHeader();
        this.initializeData();
        this.setupEventListeners();
        
        // Verificar se há uma seção na URL
        const hash = window.location.hash.slice(1) || 'dashboard';
        this.switchView(hash);
    }

    initializeData() {
        // Inicialização dos dados
        this.products = JSON.parse(localStorage.getItem('marketplaceProducts')) || [
            {
                id: 1,
                name: "Primeira Habilitação Cat A/B",
                description: "Curso completo preparatório para primeira habilitação nas categorias A e B",
                price: 197.00,
                category: "cursos",
                image: "assets/images/products/curso-ab.jpg",
                discount: 0,
                stock: 999
            },
            {
                id: 2,
                name: "Primeira Habilitação Cat A",
                description: "Curso completo preparatório para primeira habilitação na categoria A (Moto)",
                price: 147.00,
                category: "cursos",
                image: "assets/images/products/curso-a.jpg",
                discount: 0,
                stock: 999
            },
            // ... outros produtos iniciais
        ];

        this.orders = [];
        this.promotions = JSON.parse(localStorage.getItem('promotions')) || [];
        this.currentProduct = null;
        this.currentPromotion = null;
    }

    setupEventListeners() {
        // Navegação do sidebar
        document.querySelectorAll('.admin-nav .nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const view = e.target.dataset.view;
                this.switchView(view);
                
                // Atualizar URL sem recarregar a página
                window.history.pushState(null, '', `#${view}`);
            });
        });

        // Escutar mudanças na URL
        window.addEventListener('popstate', () => {
            const hash = window.location.hash.slice(1) || 'dashboard';
            this.switchView(hash);
        });

        // Form de produto
        const productForm = document.getElementById('productForm');
        if (productForm) {
            productForm.addEventListener('submit', (e) => this.handleProductSubmit(e));
        }

        // Fechar modal
        const modal = document.getElementById('productModal');
        if (modal) {
            const closeBtn = modal.querySelector('.close-modal');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => this.closeModal(modal));
            }

            // Fechar ao clicar fora
            modal.addEventListener('click', (e) => {
                if (e.target === modal) this.closeModal(modal);
            });

            // Prevenir fechamento ao clicar dentro
            const modalContent = modal.querySelector('.modal-content');
            if (modalContent) {
                modalContent.addEventListener('click', (e) => e.stopPropagation());
            }
        }

        // Filtros de pedidos
        document.getElementById('orderStatus')?.addEventListener('change', () => {
            this.filterOrders();
        });

        // Form de promoção
        const promotionForm = document.getElementById('promotionForm');
        if (promotionForm) {
            promotionForm.addEventListener('submit', (e) => this.handlePromotionSubmit(e));
        }
    }

    async loadData() {
        try {
            // Simular carregamento de dados (substituir por chamadas API)
            this.orders = [
                {
                    id: 1,
                    customer: "João Silva",
                    total: 197.00,
                    status: "pending",
                    date: new Date()
                }
            ];

            // Carregar dados do dashboard
            await this.loadDashboardData();
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
        }
    }

    async loadDashboardData() {
        // Simular dados do dashboard
        const dashboardData = {
            vendasHoje: 1250.00,
            pedidosPendentes: 5,
            totalProdutos: this.products.length,
            vendasMensais: [
                { mes: 'Jan', valor: 15000 },
                { mes: 'Fev', valor: 18000 },
                // ... mais dados
            ]
        };

        // Atualizar cards
        document.getElementById('vendasHoje').textContent = 
            dashboardData.vendasHoje.toFixed(2);
        document.getElementById('pedidosPendentes').textContent = 
            dashboardData.pedidosPendentes;
        document.getElementById('totalProdutos').textContent = 
            dashboardData.totalProdutos;

        // Inicializar gráfico
        this.initSalesChart(dashboardData.vendasMensais);
    }

    initSalesChart(data) {
        const ctx = document.getElementById('vendasChart')?.getContext('2d');
        if (!ctx) return;

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.map(d => d.mes),
                datasets: [{
                    label: 'Vendas Mensais',
                    data: data.map(d => d.valor),
                    borderColor: '#2563eb',
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                }
            }
        });
    }

    switchView(view) {
        // Atualizar navegação
        document.querySelectorAll('.admin-nav .nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.view === view) {
                item.classList.add('active');
            }
        });

        // Esconder todas as seções
        document.querySelectorAll('.admin-section').forEach(section => {
            section.classList.remove('active');
        });

        // Mostrar seção selecionada
        const selectedSection = document.getElementById(view);
        if (selectedSection) {
            selectedSection.classList.add('active');
            this.updateSectionContent(view);
        }
    }

    updateSectionContent(view) {
        switch (view) {
            case 'dashboard':
                this.loadDashboardData();
                break;
            case 'produtos':
                this.renderProducts();
                break;
            case 'pedidos':
                this.renderOrders();
                break;
            case 'relatorios':
                this.renderReports();
                break;
            case 'promocoes':
                this.renderPromotions();
                break;
        }
    }

    renderProducts() {
        const tbody = document.getElementById('productsList');
        if (!tbody) return;

        tbody.innerHTML = this.products.map(product => `
            <tr>
                <td>${product.id}</td>
                <td>${product.name}</td>
                <td>R$ ${product.price.toFixed(2)}</td>
                <td>${product.category}</td>
                <td><span class="status-active">Ativo</span></td>
                <td>
                    <button onclick="adminMarketplace.showEditProductModal(${JSON.stringify(product)})" class="btn-edit">Editar</button>
                    <button onclick="adminMarketplace.deleteProduct(${product.id})" class="btn-delete">Excluir</button>
                </td>
            </tr>
        `).join('');
    }

    showAddProductModal() {
        console.log('Abrindo modal de novo produto'); // Debug
        this.currentProduct = null;
        const modal = document.getElementById('productModal');
        const form = document.getElementById('productForm');
        
        if (form) form.reset();
        
        if (modal) {
            modal.classList.remove('escondido');
            modal.classList.add('ativo');
        }
    }

    showEditProductModal(product) {
        this.currentProduct = product;
        const modal = document.getElementById('productModal');
        
        if (modal) {
            document.getElementById('productName').value = product.name;
            document.getElementById('productDescription').value = product.description;
            document.getElementById('productPrice').value = product.price;
            document.getElementById('productCategory').value = product.category;
            
            modal.classList.remove('escondido');
            modal.classList.add('ativo');
        }
    }

    async handleProductSubmit(e) {
        e.preventDefault();
        
        const productData = {
            id: this.currentProduct?.id || Date.now(),
            name: document.getElementById('productName').value,
            description: document.getElementById('productDescription').value,
            price: parseFloat(document.getElementById('productPrice').value),
            category: document.getElementById('productCategory').value,
            image: document.getElementById('productImage').files[0] || (this.currentProduct ? this.currentProduct.image : ''),
            stock: 999,
            discount: 0
        };

        try {
            if (this.currentProduct) {
                // Atualizar produto existente
                const index = this.products.findIndex(p => p.id === this.currentProduct.id);
                if (index !== -1) {
                    this.products[index] = { ...this.products[index], ...productData };
                }
            } else {
                // Adicionar novo produto
                this.products.push(productData);
            }

            // Salvar todos os produtos no localStorage
            localStorage.setItem('marketplaceProducts', JSON.stringify(this.products));
            
            // Atualizar produtos no marketplace
            this.updateMarketplaceProducts();
            
            // Fechar modal e atualizar lista
            const modal = document.getElementById('productModal');
            if (modal) {
                modal.classList.add('escondido');
                modal.classList.remove('ativo');
            }
            
            this.renderProducts();
        } catch (error) {
            console.error('Erro ao salvar produto:', error);
        }
    }

    deleteProduct(productId) {
        if (confirm('Tem certeza que deseja excluir este produto?')) {
            this.products = this.products.filter(p => p.id !== productId);
            
            // Atualizar localStorage e marketplace
            localStorage.setItem('marketplaceProducts', JSON.stringify(this.products));
            this.updateMarketplaceProducts();
            
            this.renderProducts();
        }
    }

    updateMarketplaceProducts() {
        // Atualizar produtos no marketplace
        if (window.marketplace) {
            window.marketplace.products = this.products;
        }
    }

    generateReport() {
        if (!auth.checkAccess([PERMISSIONS.ADMIN.VIEW_REPORTS])) {
            alert('Você não tem permissão para acessar relatórios');
            return;
        }
        const type = document.getElementById('reportType').value;
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;

        // Simular geração de relatório
        const reportContent = document.getElementById('reportContent');
        reportContent.innerHTML = `
            <h3>Relatório de ${type}</h3>
            <p>Período: ${startDate} até ${endDate}</p>
            <div class="report-data">
                <!-- Dados do relatório seriam inseridos aqui -->
                <p>Relatório em desenvolvimento...</p>
            </div>
        `;
    }

    checkAdminAccess() {
        const auth = window.auth;
        if (!auth || !auth.currentUser || auth.currentUser.role !== 'admin') {
            alert('Acesso restrito a administradores');
            return false;
        }
        return true;
    }

    closeModal(modal) {
        modal.classList.add('escondido');
        modal.classList.remove('ativo');
        const form = modal.querySelector('form');
        if (form) form.reset();
    }

    setupHeader() {
        // Atualizar nome do usuário no header
        const userNameElement = document.querySelector('.user-name');
        if (userNameElement && window.auth.currentUser) {
            userNameElement.textContent = window.auth.currentUser.name;
        }

        // Configurar botão de logout
        const btnLogout = document.getElementById('btn-logout');
        if (btnLogout) {
            btnLogout.addEventListener('click', () => {
                window.auth.logout();
                window.location.href = 'index.html';
            });
        }
    }

    renderOrders() {
        const ordersTable = document.querySelector('#pedidos .orders-table');
        if (!ordersTable) return;

        // Renderizar tabela de pedidos
        ordersTable.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Cliente</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Data</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    ${this.orders.map(order => `
                        <tr>
                            <td>${order.id}</td>
                            <td>${order.customer}</td>
                            <td>R$ ${order.total.toFixed(2)}</td>
                            <td>${order.status}</td>
                            <td>${new Date(order.date).toLocaleDateString()}</td>
                            <td>
                                <button class="btn-edit">Editar</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    renderPromotions() {
        const promotionsGrid = document.querySelector('#promocoes .promotions-grid');
        if (!promotionsGrid) return;

        if (this.promotions.length === 0) {
            promotionsGrid.innerHTML = `
                <div class="no-data">
                    <p>Nenhuma promoção cadastrada</p>
                </div>
            `;
            return;
        }

        promotionsGrid.innerHTML = `
            <div class="promotions-list">
                ${this.promotions.map(promotion => {
                    const product = this.products.find(p => p.id.toString() === promotion.productId.toString());
                    const now = new Date();
                    const startDate = new Date(promotion.startDate);
                    const endDate = new Date(promotion.endDate);
                    const isInPeriod = now >= startDate && now <= endDate;
                    const statusClass = promotion.active && isInPeriod ? 'active' : 'inactive';
                    const statusText = promotion.active && isInPeriod ? 'Ativa' : 'Inativa';
                    
                    return `
                        <div class="promotion-card">
                            <div class="promotion-header">
                                <h3>${promotion.name}</h3>
                                <span class="status-badge ${statusClass}">
                                    ${statusText}
                                </span>
                            </div>
                            <div class="promotion-content">
                                <p>${promotion.description}</p>
                                <div class="promotion-details">
                                    <p>Produto: ${product ? product.name : 'N/A'}</p>
                                    <p>Desconto: ${promotion.discount}%</p>
                                    <p>Período: ${new Date(promotion.startDate).toLocaleDateString()} - 
                                               ${new Date(promotion.endDate).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div class="promotion-actions">
                                <button onclick="adminMarketplace.togglePromotionStatus(${promotion.id})" 
                                        class="btn-toggle ${promotion.active ? 'active' : ''}">
                                    ${promotion.active ? 'Desativar' : 'Ativar'}
                                </button>
                                <button onclick="adminMarketplace.showEditPromotionModal(${JSON.stringify(promotion)})" 
                                        class="btn-edit">Editar</button>
                                <button onclick="adminMarketplace.deletePromotion(${promotion.id})" 
                                        class="btn-delete">Excluir</button>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    showAddPromotionModal() {
        this.currentPromotion = null;
        const modal = document.getElementById('promotionModal');
        const form = document.getElementById('promotionForm');
        
        if (form) {
            form.reset();
            this.updateProductSelect();
        }
        
        if (modal) {
            modal.classList.remove('escondido');
            modal.classList.add('ativo');
        }
    }

    showEditPromotionModal(promotion) {
        this.currentPromotion = promotion;
        const modal = document.getElementById('promotionModal');
        
        if (modal) {
            this.updateProductSelect();
            
            document.getElementById('promotionName').value = promotion.name;
            document.getElementById('promotionDescription').value = promotion.description;
            document.getElementById('promotionProduct').value = promotion.productId;
            document.getElementById('promotionDiscount').value = promotion.discount;
            document.getElementById('promotionStart').value = promotion.startDate;
            document.getElementById('promotionEnd').value = promotion.endDate;
            
            modal.classList.remove('escondido');
            modal.classList.add('ativo');
        }
    }

    updateProductSelect() {
        const select = document.getElementById('promotionProduct');
        if (!select) return;

        select.innerHTML = this.products.map(product => `
            <option value="${product.id}">${product.name} - R$ ${product.price.toFixed(2)}</option>
        `).join('');
    }

    async handlePromotionSubmit(e) {
        e.preventDefault();
        
        const promotionData = {
            id: this.currentPromotion?.id || Date.now(),
            name: document.getElementById('promotionName').value,
            description: document.getElementById('promotionDescription').value,
            productId: document.getElementById('promotionProduct').value,
            discount: parseInt(document.getElementById('promotionDiscount').value),
            startDate: document.getElementById('promotionStart').value,
            endDate: document.getElementById('promotionEnd').value,
            active: true // Promoção começa ativa por padrão
        };

        try {
            if (this.currentPromotion) {
                const index = this.promotions.findIndex(p => p.id === this.currentPromotion.id);
                if (index !== -1) {
                    this.promotions[index] = { ...this.promotions[index], ...promotionData };
                }
            } else {
                this.promotions.push(promotionData);
            }

            // Salvar promoções
            localStorage.setItem('promotions', JSON.stringify(this.promotions));
            
            // Atualizar produtos com desconto
            this.updateProductDiscounts();
            
            const modal = document.getElementById('promotionModal');
            if (modal) {
                this.closeModal(modal);
            }
            
            this.renderPromotions();
        } catch (error) {
            console.error('Erro ao salvar promoção:', error);
        }
    }

    togglePromotionStatus(promotionId) {
        const promotion = this.promotions.find(p => p.id === promotionId);
        if (promotion) {
            promotion.active = !promotion.active;
            localStorage.setItem('promotions', JSON.stringify(this.promotions));
            this.updateProductDiscounts();
            this.renderPromotions();
        }
    }

    updateProductDiscounts() {
        // Resetar todos os descontos
        this.products.forEach(product => product.discount = 0);

        // Aplicar promoções ativas
        const now = new Date();
        this.promotions.forEach(promotion => {
            if (!promotion.active) return; // Ignorar promoções inativas

            const startDate = new Date(promotion.startDate);
            const endDate = new Date(promotion.endDate);
            
            if (now >= startDate && now <= endDate) {
                const product = this.products.find(p => p.id.toString() === promotion.productId.toString());
                if (product) {
                    product.discount = promotion.discount;
                }
            }
        });

        // Atualizar produtos no localStorage e marketplace
        localStorage.setItem('marketplaceProducts', JSON.stringify(this.products));
        
        // Atualizar marketplace se estiver disponível
        if (window.marketplace) {
            window.marketplace.products = this.products;
            window.marketplace.renderProducts(); // Atualizar visualização da loja
        }
    }

    deletePromotion(promotionId) {
        if (confirm('Tem certeza que deseja excluir esta promoção?')) {
            this.promotions = this.promotions.filter(p => p.id !== promotionId);
            localStorage.setItem('promotions', JSON.stringify(this.promotions));
            this.updateProductDiscounts();
            this.renderPromotions();
        }
    }
}

// Garantir que a instância seja criada após o DOM estar pronto
document.addEventListener('DOMContentLoaded', () => {
    window.adminMarketplace = new AdminMarketplace();
}); 