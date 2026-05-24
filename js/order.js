// js/order.js
let currentOrderId = null;
let orderStatusSubscription = null;

// Generate kode_order unik
function generateKodeOrder() {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `YK${year}${month}${day}${random}`;
}

// Create new order dengan kode_order
async function createOrder(orderData) {
    try {
        const kodeOrder = generateKodeOrder();
        
        const { data: order, error } = await supabase
            .from('orders')
            .insert({
                customer_name: orderData.customerName,
                status: 'pending',
                total_price: orderData.totalAmount,
                kode_order: kodeOrder
            })
            .select()
            .single();
        
        if (error) throw error;
        
        // Insert order items
        const orderItems = orderData.items.map(item => ({
            order_id: order.id,
            menu_id: item.id,
            quantity: item.quantity,
            notes: item.notes || '',
            subtotal: item.price * item.quantity
        }));
        
        const { error: itemsError } = await supabase
            .from('order_items')
            .insert(orderItems);
        
        if (itemsError) throw itemsError;
        
        return { order, kodeOrder };
    } catch (error) {
        console.error('Error creating order:', error);
        throw error;
    }
}

// Submit order dengan QR Payment
async function submitOrder() {
    const customerName = localStorage.getItem('customerName');
    const cart = getCart();
    
    if (!cart || cart.length === 0) {
        alert('Your cart is empty');
        return;
    }
    
    const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    try {
        const { order, kodeOrder } = await createOrder({
            customerName: customerName,
            totalAmount: totalAmount,
            items: cart
        });
        
        // Clear cart
        clearCart();
        
        // Store order info
        localStorage.setItem('currentOrderId', order.id);
        localStorage.setItem('currentKodeOrder', kodeOrder);
        localStorage.setItem('currentTotalPrice', totalAmount);
        
        // Redirect ke halaman QR Payment
        window.location.href = 'payment.html';
    } catch (error) {
        console.error('Error submitting order:', error);
        alert('Failed to submit order. Please try again.');
    }
}