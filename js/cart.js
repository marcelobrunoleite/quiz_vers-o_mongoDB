class Cart {
    constructor() {
        this.items = [];
        this.setupEventListeners();
    }

    addItem(productId) {
        const product = marketplace.products.find(p => p.id === productId);
        if (!product) return;

        const existingItem = this.items.find(item => item.id === productId);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            this.items.push({
                id: product.id,
                name: product.name,
                price: product.price,
                quantity: 1,
                discount: product.discount || 0
            });
        }

        this.updateCart();
    }

    removeItem(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        this.updateCart();
    }

    updateQuantity(productId, quantity) {
        const item = this.items.find(item => item.id === productId);
        if (item) {
            item.quantity = Math.max(1, quantity);
            this.updateCart();
        }
    }

    getTotal() {
        return this.items.reduce((total, item) => {
            const price = item.price * (1 - item.discount/100);
            return total + (price * item.quantity);
        }, 0);
    }

    updateCart() {
        const cartItems = document.querySelector('.cart-items');
        const cartCount = document.querySelector('.cart-count');
        const cartTotal = document.getElementById('cartTotal');

        if (cartItems) {
            cartItems.innerHTML = this.items.map(item => {
                const finalPrice = item.price * (1 - item.discount/100);
                return `
                    <div class="cart-item">
                        <div class="item-info">
                            <h4>${item.name}</h4>
                            <div class="item-price">R$ ${(finalPrice * item.quantity).toFixed(2)}</div>
                        </div>
                        <div class="item-quantity">
                            <button onclick="marketplace.cart.updateQuantity(${item.id}, ${item.quantity - 1})">-</button>
                            <span>${item.quantity}</span>
                            <button onclick="marketplace.cart.updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
                        </div>
                        <button class="remove-item" onclick="marketplace.cart.removeItem(${item.id})">×</button>
                    </div>
                `;
            }).join('');
        }

        if (cartCount) {
            cartCount.textContent = this.items.reduce((total, item) => total + item.quantity, 0);
        }

        if (cartTotal) {
            cartTotal.textContent = this.getTotal().toFixed(2);
        }
    }

    setupEventListeners() {
        const cart = document.getElementById('floatingCart');
        if (cart) {
            cart.querySelector('.cart-header').addEventListener('click', () => {
                cart.classList.toggle('expanded');
            });
        }
    }
} 