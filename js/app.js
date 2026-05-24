// js/app.js - HAPUS SEMUA IMPORT, gunakan supabase global
let currentMenu = [];
let currentCategory = 'all';
let searchQuery = '';

// Load menu dari Supabase
async function loadMenu() {
    try {
        console.log('Loading menu...');
        
        // Cek apakah supabase tersedia
        if (typeof supabase === 'undefined') {
            console.error('Supabase not loaded!');
            showError('Database connection failed. Please refresh the page.');
            return;
        }
        
        const menuGrid = document.getElementById('menuGrid');
        if (menuGrid) {
            menuGrid.innerHTML = `
                <div class="loading-spinner">
                    <i class="fa-solid fa-spinner fa-spin"></i>
                    <p>Loading menu...</p>
                </div>
            `;
        }
        
        // Ambil data menu dengan join ke categories
        const { data: menus, error } = await supabase
            .from('menus')
            .select(`
                *,
                categories (id, name)
            `)
            .eq('is_available', true);
        
        if (error) {
            console.error('Supabase error:', error);
            throw error;
        }
        
        console.log('Menus loaded:', menus);
        
        if (!menus || menus.length === 0) {
            console.warn('No menus found');
            showError('No menu items available. Please contact admin.');
            return;
        }
        
        currentMenu = menus;
        displayMenu();
        
    } catch (error) {
        console.error('Error loading menu:', error);
        showError('Failed to load menu: ' + error.message);
        
        const menuGrid = document.getElementById('menuGrid');
        if (menuGrid) {
            menuGrid.innerHTML = `
                <div class="error-state">
                    <i class="fa-regular fa-circle-exclamation"></i>
                    <p>Failed to load menu</p>
                    <button onclick="location.reload()" class="btn-primary">
                        Try Again
                    </button>
                </div>
            `;
        }
    }
}

// Display menu
function displayMenu() {
    const menuGrid = document.getElementById('menuGrid');
    if (!menuGrid) return;
    
    let filteredMenu = [...currentMenu];
    
    // Filter category
    if (currentCategory !== 'all') {
        filteredMenu = filteredMenu.filter(item => 
            item.categories?.name === currentCategory
        );
    }
    
    // Filter search
    if (searchQuery) {
        filteredMenu = filteredMenu.filter(item =>
            item.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }
    
    if (filteredMenu.length === 0) {
        menuGrid.innerHTML = `
            <div class="empty-state">
                <i class="fa-regular fa-face-frown"></i>
                <p>No menu items found</p>
            </div>
        `;
        return;
    }
    
    menuGrid.innerHTML = filteredMenu.map(menu => `
        <div class="menu-card" data-menu-id="${menu.id}">
            <img src="${menu.image_url || 'https://placehold.co/80x80/E8E0D8/2C1A0E?text=York'}" 
                 alt="${menu.name}" 
                 class="menu-image"
                 onerror="this.src='https://placehold.co/80x80/E8E0D8/2C1A0E?text=York'">
            <div class="menu-info">
                <h3 class="menu-name">${escapeHtml(menu.name)}</h3>
                <p class="menu-price">Rp ${formatPrice(menu.price)}</p>
                ${menu.stock ? `<small>Stock: ${menu.stock}</small>` : ''}
            </div>
            <button class="add-to-cart-btn" onclick="quickAddToCart('${menu.id}')">
                <i class="fa-solid fa-plus"></i>
            </button>
        </div>
    `).join('');
    
    // Add click listeners
    document.querySelectorAll('.menu-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (!e.target.closest('.add-to-cart-btn')) {
                const menuId = card.dataset.menuId;
                showMenuDetail(menuId);
            }
        });
    });
}

// Show menu detail
async function showMenuDetail(menuId) {
    const menu = currentMenu.find(m => m.id == menuId);
    if (!menu) return;
    
    const modalBody = document.getElementById('modalBody');
    if (!modalBody) return;
    
    modalBody.innerHTML = `
        <div class="menu-detail" style="padding: 20px;">
            <img src="${menu.image_url || 'https://placehold.co/400x300/E8E0D8/2C1A0E?text=York'}" 
                 alt="${menu.name}" 
                 style="width: 100%; border-radius: 12px; margin-bottom: 16px;">
            <h2>${escapeHtml(menu.name)}</h2>
            <p style="color: #666; margin: 12px 0;">${escapeHtml(menu.description || 'No description')}</p>
            <div style="font-size: 24px; color: var(--primary); font-weight: bold; margin: 16px 0;">
                Rp ${formatPrice(menu.price)}
            </div>
            
            <div style="margin: 16px 0;">
                <label>Quantity</label>
                <div style="display: flex; align-items: center; gap: 12px; margin-top: 8px;">
                    <button onclick="updateQuantity(-1)" style="width: 40px; height: 40px; border-radius: 50%; border: 1px solid #ddd; background: white; cursor: pointer;">-</button>
                    <span id="detailQuantity" style="font-size: 18px; min-width: 40px; text-align: center;">1</span>
                    <button onclick="updateQuantity(1)" style="width: 40px; height: 40px; border-radius: 50%; border: 1px solid #ddd; background: white; cursor: pointer;">+</button>
                </div>
            </div>
            
            <div style="margin: 16px 0;">
                <label>Additional Notes</label>
                <textarea id="orderNotes" placeholder="Any special requests?" style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 8px; margin-top: 8px;" rows="3"></textarea>
            </div>
            
            <button onclick="addToCartWithDetails('${menu.id}')" class="btn-primary" style="width: 100%;">
                Add to Cart - Rp ${formatPrice(menu.price)}
            </button>
        </div>
    `;
    
    document.getElementById('menuModal').style.display = 'flex';
    window.currentDetailMenu = menu;
}

// Quantity update
function updateQuantity(change) {
    const quantitySpan = document.getElementById('detailQuantity');
    if (quantitySpan) {
        let currentQty = parseInt(quantitySpan.textContent);
        let newQty = currentQty + change;
        if (newQty >= 1) {
            quantitySpan.textContent = newQty;
            if (window.currentDetailMenu) {
                const totalPrice = window.currentDetailMenu.price * newQty;
                const addButton = document.querySelector('#modalBody .btn-primary');
                if (addButton) {
                    addButton.innerHTML = `Add to Cart - Rp ${formatPrice(totalPrice)}`;
                }
            }
        }
    }
}

// Add to cart with details
function addToCartWithDetails(menuId) {
    const quantity = parseInt(document.getElementById('detailQuantity')?.textContent || '1');
    const notes = document.getElementById('orderNotes')?.value || '';
    const menuItem = window.currentDetailMenu;
    
    if (menuItem) {
        addToCart(menuItem, quantity, notes);
        document.getElementById('menuModal').style.display = 'none';
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing...');
    
    // Load customer name
    const customerNameDisplay = document.getElementById('customerNameDisplay');
    if (customerNameDisplay) {
        const name = localStorage.getItem('customerName');
        customerNameDisplay.textContent = name || 'Guest';
    }
    
    // Load menu
    loadMenu();
    updateCartBadge();
    
    // Category tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentCategory = btn.dataset.category;
            displayMenu();
        });
    });
    
    // Search
    const searchInput = document.getElementById('searchMenu');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value;
            displayMenu();
        });
    }
    
    // Floating cart button
    const floatingCartBtn = document.getElementById('floatingCartBtn');
    if (floatingCartBtn) {
        floatingCartBtn.addEventListener('click', () => {
            window.location.href = 'cart.html';
        });
    }
    
    // Close modal
    const modalClose = document.querySelector('.modal-close');
    if (modalClose) {
        modalClose.addEventListener('click', () => {
            document.getElementById('menuModal').style.display = 'none';
        });
    }
    
    // Click outside modal
    const modal = document.getElementById('menuModal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }
});