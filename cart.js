// Elanicia Cart System with localStorage
// Handles cart operations across all pages

// Cart item structure: { id, name, price, image, quantity, category, manufacturer, stock, colors }

// Initialize cart on page load
function initializeCart() {
    updateCartCount();
    loadCartItems();
}

// Get cart from localStorage
function getCart() {
    const cartJson = localStorage.getItem('elaniciaCart');
    return cartJson ? JSON.parse(cartJson) : [];
}

// Save cart to localStorage
function saveCart(cart) {
    localStorage.setItem('elaniciaCart', JSON.stringify(cart));
    updateCartCount();
}

// Add item to cart
function addToCart(product) {
    const cart = getCart();
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
        existingItem.quantity += (product.quantity || 1);
    } else {
        cart.push({
            ...product,
            quantity: product.quantity || 1,
            originalPrice: parseFloat(product.price.toString().replace(/[^0-9.]/g, '').replace(',', ''))
        });
    }
    
    saveCart(cart);
    
    // Show notification
    if (typeof showBeigeNotification === 'function') {
        showBeigeNotification('✨ Added to cart: ' + product.name);
    } else {
        console.log('Added to cart: ' + product.name);
    }
    
    // Animate cart icon
    animateCartIcon();
    
    return cart;
}

// Remove item from cart
function removeFromCart(productId) {
    const cart = getCart();
    const filteredCart = cart.filter(item => item.id !== productId);
    saveCart(filteredCart);
    return filteredCart;
}

// Update item quantity
function updateCartQuantity(productId, quantity) {
    const cart = getCart();
    const item = cart.find(item => item.id === productId);
    
    if (item) {
        if (quantity <= 0) {
            return removeFromCart(productId);
        }
        item.quantity = quantity;
        saveCart(cart);
    }
    
    return cart;
}

// Clear cart
function clearCart() {
    localStorage.removeItem('elaniciaCart');
    updateCartCount();
}

// Get cart count
function getCartCount() {
    const cart = getCart();
    return cart.reduce((total, item) => total + item.quantity, 0);
}

// Get cart total
function getCartTotal() {
    const cart = getCart();
    return cart.reduce((total, item) => {
        const price = parseFloat(item.price.toString().replace(/[^0-9.]/g, '').replace(',', ''));
        return total + (price * item.quantity);
    }, 0);
}

// Get total items count function
function getTotalItems() {
    const cart = getCart();
    return cart.reduce((sum, item) => sum + item.quantity, 0);
}

// Get subtotal calculation function - sum individual item prices only
function getSubtotal() {
    const cart = getCart();
    return cart.reduce((total, item) => {
        const price = parseFloat(item.price.toString().replace(/[^0-9.]/g, '').replace(',', ''));
        return total + price; // Individual item price, not price * quantity
    }, 0);
}

// Get shipping fee function
function getShippingFee() {
    const subtotal = getSubtotal();
    return subtotal > 0 ? 50 : 0;
}

// Get final total calculation function
function getFinalTotal() {
    const subtotal = getSubtotal();
    const shipping = getShippingFee();
    return subtotal + shipping; // Individual prices + shipping fee
}

// Update cart count in navigation
function updateCartCount() {
    const cartCountElements = document.querySelectorAll('.cart-count');
    const count = getCartCount();
    
    cartCountElements.forEach(element => {
        if (element) {
            element.textContent = count;
            if (count > 0) {
                element.style.display = 'inline-block';
                element.style.animation = 'cartBounce 0.5s ease';
            } else {
                element.style.display = 'none';
            }
        }
    });
}

// Animate cart icon
function animateCartIcon() {
    const cartIcons = document.querySelectorAll('.cart');
    cartIcons.forEach(icon => {
        icon.style.transform = 'scale(1.3) rotate(10deg)';
        icon.style.filter = 'drop-shadow(0 0 15px rgba(212, 175, 55, 0.8))';
        
        setTimeout(() => {
            icon.style.transform = 'scale(1) rotate(0deg)';
            icon.style.filter = 'none';
        }, 400);
    });
}

// Load cart items (for cart page)
function loadCartItems() {
    const cart = getCart();
    const cartItemsContainer = document.getElementById('cartItems');
    
    if (!cartItemsContainer) return;
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-bag"></i>
                <h3>Your cart is empty</h3>
                <p>Add some luxury timepieces to complete your collection</p>
                <a href="index.html" class="continue-shopping-btn">Continue Shopping</a>
            </div>
        `;
        updateCartSummary();
        return;
    }
    
    cartItemsContainer.innerHTML = cart.map(item => `
        <div class="cart-item" data-id="${item.id}">
            <div class="cart-item-image">
                <img src="${item.image}" alt="${item.name}" onerror="this.src='images/placeholder-watch.jpg'">
            </div>
            <div class="cart-item-details">
                <h3 class="cart-item-name">${item.name}</h3>
                <p class="cart-item-category">${item.category || 'Watch'}</p>
                ${item.selectedColor ? `<div class="cart-item-color">Color: <span class="color-badge" style="background: ${getColorHex(item.selectedColor)}">${item.selectedColor}</span></div>` : ''}
                <div class="cart-item-price">Item Price: ${item.price}</div>
                <div class="cart-quantity-controls">
                    <span class="quantity-label">Quantity:</span>
                    <div class="quantity-buttons">
                        <button class="qty-btn minus" onclick="changeQuantity('${item.id}', -1)">−</button>
                        <input type="number" class="qty-input" value="${item.quantity}" min="1" max="99" onchange="updateQuantityFromInput('${item.id}', this.value)">
                        <button class="qty-btn plus" onclick="changeQuantity('${item.id}', 1)">+</button>
                    </div>
                </div>
            </div>
            <div class="cart-item-quantity">
                <div class="item-quantity-display">
                    <span class="qty-label">Qty:</span>
                    <span class="qty-value">${item.quantity}</span>
                </div>
                <div class="item-total-display">
                    <span class="total-label">Item Price:</span>
                    <span class="total-price">${item.price}</span>
                </div>
            </div>
            <button class="cart-item-remove" onclick="removeCartItem('${item.id}')" title="Remove item">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `).join('');
    
    // Update total
    updateCartTotal();
    updateCartSummary();
}

// Update quantity from input field
function updateQuantityFromInput(productId, newQuantity) {
    const quantity = parseInt(newQuantity);
    if (quantity >= 1 && quantity <= 99) {
        updateCartQuantity(productId, quantity);
        loadCartItems(); // Reload to update display
    }
}

// Change quantity with price updates
function changeQuantity(productId, delta) {
    const cart = getCart();
    const item = cart.find(item => item.id === productId);
    
    if (item) {
        const newQuantity = item.quantity + delta;
        if (newQuantity <= 0) {
            removeCartItem(productId);
        } else {
            updateCartQuantity(productId, newQuantity);
            // Reload cart items to update individual item totals
            loadCartItems();
            // Update cart summary to recalculate total and shipping
            updateCartSummary();
        }
    }
}

// Remove cart item
function removeCartItem(productId) {
    removeFromCart(productId);
    loadCartItems();
    // Update cart summary to recalculate total and shipping
    updateCartSummary();
}

// Get color hex value
function getColorHex(colorName) {
    const colorMap = {
        'Silver': '#C0C0C0',
        'Gold': '#FFD700',
        'Rose Gold': '#E0BFB8',
        'Black': '#000000',
        'White': '#FFFFFF',
        'Blue': '#0000FF',
        'Red': '#FF0000',
        'Green': '#008000'
    };
    return colorMap[colorName] || '#CCCCCC';
}

// Update cart summary with all calculations
function updateCartSummary() {
    const cart = getCart();
    const summaryContainer = document.getElementById('cartSummary');
    
    if (!summaryContainer) return;
    
    // Calculate total items
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    // Calculate subtotal (sum of individual item prices, not quantity multiplied)
    const subtotal = cart.reduce((total, item) => {
        const price = parseFloat(item.price.toString().replace(/[^0-9.]/g, '').replace(',', ''));
        return total + price; // Individual item price, not price * quantity
    }, 0);
    
    // Calculate shipping fee (50 AED if cart has items)
    const shipping = subtotal > 0 ? 50 : 0;
    
    // Calculate final total (individual item prices + shipping fee)
    const total = subtotal + shipping;
    
    // Update all summary elements
    const totalItemsEl = document.getElementById('totalItems');
    const subtotalEl = document.getElementById('cartSubtotal');
    const shippingEl = document.getElementById('shippingFee');
    const totalEl = document.getElementById('cartTotal');
    
    if (totalItemsEl) totalItemsEl.textContent = totalItems;
    if (subtotalEl) subtotalEl.textContent = formatPrice(subtotal);
    if (shippingEl) shippingEl.textContent = formatPrice(shipping);
    if (totalEl) totalEl.textContent = formatPrice(total);
    
    // Add item prices display to summary
    const summaryContainerEl = document.querySelector('.cart-summary');
    
    // Remove existing item prices display to prevent duplicates
    const existingItemPrices = summaryContainerEl.querySelectorAll('.item-price-row, .total-calculation');
    existingItemPrices.forEach(el => el.remove());
    
    if (summaryContainerEl && cart.length > 0) {
        // Create item prices list
        const itemPricesHtml = cart.map(item => `
            <div class="item-price-row" style="font-size: 0.9rem; color: #6b5b47; margin: 0.5rem 0; padding: 0.5rem; background: rgba(212, 175, 55, 0.1); border-radius: 5px;">
                <span style="font-weight: 600;">${item.name}:</span> 
                <span>${item.price}</span>
            </div>
        `).join('');
        
        // Create total price calculation display
        const totalCalculationHtml = `
            <div class="total-calculation" style="font-size: 0.9rem; color: #8b6914; margin: 0.5rem 0; padding: 0.5rem; background: rgba(139, 105, 20, 0.1); border-radius: 5px; border-left: 3px solid #d4af37;">
                <div style="margin-bottom: 0.3rem;"><strong>Total Price Calculation:</strong></div>
                <div style="margin-left: 1rem;">
                    <div>• Individual Item Prices: ${formatPrice(subtotal)}</div>
                    <div>• Shipping Fee: ${formatPrice(shipping)}</div>
                    <div style="margin-top: 0.3rem; font-weight: 700; color: #d4af37;">= Final Total: ${formatPrice(total)}</div>
                </div>
            </div>
        `;
        
        // Insert item prices and calculation before the total rows
        const existingRows = summaryContainerEl.querySelectorAll('.summary-row');
        if (existingRows.length > 0) {
            existingRows[0].insertAdjacentHTML('beforebegin', itemPricesHtml + totalCalculationHtml);
        }
    }
    
    // Enable/disable checkout button
    const checkoutBtn = document.querySelector('.checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.disabled = cart.length === 0;
    }
}

// Update cart total (kept for compatibility)
function updateCartTotal() {
    const totalElement = document.getElementById('cartTotal');
    if (totalElement) {
        const total = getFinalTotal();
        totalElement.textContent = formatPrice(total);
    }
}

// Format price
function formatPrice(price) {
    return `د.إ ${Math.round(price).toLocaleString('en-US')}`;
}

// Initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeCart);
} else {
    initializeCart();
}

// Add cart bounce animation
const cartStyle = document.createElement('style');
cartStyle.textContent = `
    @keyframes cartBounce {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.2); }
    }
`;
document.head.appendChild(cartStyle);

// Test function to verify cart works (remove in production)
window.testCart = function() {
    const testProduct = {
        id: 'test-' + Date.now(),
        name: 'Test Watch',
        price: 'د.إ 1,000',
        image: 'images/test.jpg',
        category: 'Watch',
        quantity: 1
    };
    
    addToCart(testProduct);
    console.log('Cart test completed. Check cart for items.');
    console.log('Total items:', getTotalItems());
    console.log('Subtotal:', getSubtotal());
    console.log('Shipping:', getShippingFee());
    console.log('Final Total:', getFinalTotal());
};

// Add example item with specific price
window.addExampleItem = function() {
    const exampleProduct = {
        id: 'example-' + Date.now(),
        name: 'Luxury Watch Example',
        price: 'د.إ 85,999',
        image: 'images/test.jpg',
        category: 'Watch',
        quantity: 1
    };
    
    addToCart(exampleProduct);
    console.log('Example item added: د.إ 85,999');
    console.log('Item Price:', exampleProduct.price);
    console.log('Total items:', getTotalItems());
    console.log('Subtotal:', getSubtotal());
    console.log('Shipping Fee:', getShippingFee());
    console.log('Final Total (Item Price + Shipping):', getFinalTotal());
    
    // Show notification
    if (typeof showBeigeNotification === 'function') {
        showBeigeNotification('Example item added: د.إ 85,999');
    }
};
