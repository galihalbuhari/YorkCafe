// js/utils.js
function formatPrice(price) {
    return new Intl.NumberFormat('id-ID').format(price);
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showError(message) {
    console.error('Error:', message);
    const toast = document.createElement('div');
    toast.className = 'toast-notification error';
    toast.innerHTML = `
        <i class="fa-solid fa-circle-exclamation"></i>
        <span>${message}</span>
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function showSuccess(message) {
    const toast = document.createElement('div');
    toast.className = 'toast-notification success';
    toast.innerHTML = `
        <i class="fa-regular fa-circle-check"></i>
        <span>${message}</span>
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}