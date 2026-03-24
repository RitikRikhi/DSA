/**
 * Lightweight Toast Notification System
 */

function showToast(message, type = 'info') {
    // Create container if it doesn't exist
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.style.cssText = `
            position: fixed;
            bottom: 2rem;
            right: 2rem;
            z-index: 10001;
            display: flex;
            flex-direction: column;
            gap: 1rem;
            pointer-events: none;
        `;
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    // Modern, premium toast styles via JS for zero dependency
    toast.style.cssText = `
        padding: 1rem 2rem;
        background: ${type === 'error' ? '#c8102e' : (type === 'success' ? '#10c850' : '#b8a06a')};
        color: white;
        font-family: 'DM Sans', sans-serif;
        font-size: 0.85rem;
        letter-spacing: 0.05em;
        border-radius: 4px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        gap: 1rem;
        pointer-events: auto;
        transform: translateY(20px);
        opacity: 0;
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    `;

    const icon = type === 'error' ? '⚠️' : (type === 'success' ? '✅' : 'ℹ️');
    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;

    container.appendChild(toast);

    // Trigger animation
    setTimeout(() => {
        toast.style.transform = 'translateY(0)';
        toast.style.opacity = '1';
    }, 10);

    // Remove after delay
    setTimeout(() => {
        toast.style.transform = 'translateY(-20px)';
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 400);
    }, 4000);
}

// Expose to window
window.showToast = showToast;
