// js/cart.js - Versi sederhana
const CART_KEY = 'york_cart';

function getCart() {
    const cart = localStorage.getItem(CART_KEY);
    return cart ? JSON.parse(cart) : [];
}

function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateCartBadge();
}

function addToCart(menuItem, quantity = 1, notes = '') {
    const cart = getCart();
    const existingIndex = cart.findIndex(item => item.id === menuItem.id && item.notes === notes);
    
    if (existingIndex !== -1) {
        cart[existingIndex].quantity += quantity;
    } else {
        cart.push({
            id: menuItem.id,
            name: menuItem.name,
            price: menuItem.price,
            quantity: quantity,
            notes: notes
        });
    }
    
    saveCart(cart);
    showSuccess(`${menuItem.name} added to cart!`);
}

function quickAddToCart(menuId) {
    const menuItem = window.currentMenu?.find(m => m.id == menuId);
    if (menuItem) {
        addToCart(menuItem, 1, '');
    }
}

function updateCartBadge() {
    const cart = getCart();
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const badge = document.getElementById('cartBadge');
    if (badge) {
        badge.textContent = totalItems;
        badge.style.display = totalItems > 0 ? 'flex' : 'none';
    }
}

function clearCart() {
    localStorage.removeItem(CART_KEY);
    updateCartBadge();
}