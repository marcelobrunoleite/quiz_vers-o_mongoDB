class Marketplace {
    constructor() {
        // Carregar produtos do localStorage (incluindo personalizados)
        const savedProducts = JSON.parse(localStorage.getItem('marketplaceProducts'));
        
        // Se não houver produtos salvos, usar os padrão
        this.products = savedProducts || [
            {
                id: 1,
                name: "Primeira Habilitação Cat A/B",
                description: "Curso completo preparatório para primeira habilitação nas categorias A e B",
                price: 197.00,
                category: "cursos",
                image: "assets/images/products/curso-ab.jpg",
                discount: 0,
                stock: 999,
                isDefault: true
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
            {
                id: 3,
                name: "Primeira Habilitação Cat B",
                description: "Curso completo preparatório para primeira habilitação na categoria B (Carro)",
                price: 147.00,
                category: "cursos",
                image: "assets/images/products/curso-b.jpg",
                discount: 0,
                stock: 999
            },
            {
                id: 4,
                name: "Adição de Cat A",
                description: "Curso preparatório para adição da categoria A à sua CNH",
                price: 97.00,
                category: "cursos",
                image: "assets/images/products/adicao-a.jpg",
                discount: 0,
                stock: 999
            },
            {
                id: 5,
                name: "Adição de Cat B",
                description: "Curso preparatório para adição da categoria B à sua CNH",
                price: 97.00,
                category: "cursos",
                image: "assets/images/products/adicao-b.jpg",
                discount: 0,
                stock: 999
            }
        ];
        this.init();
    }

    async init() {
        try {
            this.cart = new Cart();
            this.paymentService = new PaymentService();
            this.setupEventListeners();
            this.renderProducts();
            this.setupModals();
        } catch (error) {
            console.error('Erro ao inicializar marketplace:', error);
        }
    }

    setupEventListeners() {
        // Filtros
        document.getElementById('categoryFilter')?.addEventListener('change', () => this.filterProducts());
        document.getElementById('searchProducts')?.addEventListener('input', () => this.filterProducts());

        // Checkout
        const btnCheckout = document.getElementById('btnCheckout');
        if (btnCheckout) {
            btnCheckout.addEventListener('click', async (e) => {
                e.preventDefault(); // Prevenir comportamento padrão
                try {
                    await this.checkout();
                } catch (error) {
                    console.error('Erro no checkout:', error);
                }
            });
        }
    }

    filterProducts() {
        const category = document.getElementById('categoryFilter').value;
        const search = document.getElementById('searchProducts').value.toLowerCase();

        const filtered = this.products.filter(product => {
            const matchesCategory = !category || product.category === category;
            const matchesSearch = product.name.toLowerCase().includes(search) ||
                                product.description.toLowerCase().includes(search);
            return matchesCategory && matchesSearch;
        });

        this.renderProducts(filtered);
    }

    renderProducts(products = this.products) {
        const grid = document.getElementById('productsGrid');
        if (!grid) return;

        grid.innerHTML = products.map(product => {
            const finalPrice = product.price * (1 - product.discount/100);
            
            return `
                <div class="product-card" data-id="${product.id}">
                    <div class="product-image">
                        <img src="${product.image}" alt="${product.name}">
                        ${product.discount > 0 ? `
                            <span class="discount-badge">-${product.discount}% OFF</span>
                        ` : ''}
                    </div>
                    <div class="product-info">
                        <h3>${product.name}</h3>
                        <p>${product.description}</p>
                        <div class="product-price">
                            ${product.discount > 0 ? `
                                <span class="original-price">R$ ${product.price.toFixed(2)}</span>
                            ` : ''}
                            <span class="final-price">R$ ${finalPrice.toFixed(2)}</span>
                        </div>
                        <button class="btn-add-cart" onclick="marketplace.cart.addItem(${product.id})">
                            <i class="fas fa-shopping-cart"></i>
                            Adicionar ao Carrinho
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    async checkout() {
        try {
            if (!this.cart.items.length) {
                alert('Seu carrinho está vazio');
                return;
            }

            if (!auth.currentUser) {
                alert('Por favor, faça login para continuar');
                document.getElementById('login-modal').classList.add('ativo');
                document.getElementById('login-modal').classList.remove('escondido');
                return;
            }

            // Mostrar loading
            const btnCheckout = document.getElementById('btnCheckout');
            const originalText = btnCheckout.innerHTML;
            btnCheckout.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processando...';
            btnCheckout.disabled = true;

            try {
                await this.paymentService.processPayment(this.cart);
            } catch (error) {
                console.error('Erro no checkout:', error);
                alert('Erro ao processar pagamento. Tente novamente.');
            } finally {
                // Restaurar botão
                btnCheckout.innerHTML = originalText;
                btnCheckout.disabled = false;
            }
        } catch (error) {
            console.error('Erro no checkout:', error);
            alert('Erro ao processar pagamento. Tente novamente.');
        }
    }

    setupModals() {
        // Fechar modal ao clicar no X ou fora do modal
        document.querySelectorAll('.close-modal').forEach(closeBtn => {
            closeBtn.addEventListener('click', () => {
                closeBtn.closest('.modal').classList.remove('ativo');
                closeBtn.closest('.modal').classList.add('escondido');
            });
        });

        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('ativo');
                    modal.classList.add('escondido');
                }
            });
        });

        // Remover o modal fixo que está causando problemas
        const fixedModal = document.querySelector('.modal:not(#login-modal):not(#signup-modal)');
        if (fixedModal) {
            fixedModal.remove();
        }
    }
}

// Não inicializar aqui, deixar para o DOMContentLoaded no HTML 