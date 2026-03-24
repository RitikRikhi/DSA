
// Intersection Observer for images and items
function initAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    window.galleryObserver = observer;
}

// Stats Counter Logic
function initStatsCounter() {
    const stats = document.querySelectorAll('.stat-value');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                const countTo = parseInt(target.getAttribute('data-target'));
                if (!isNaN(countTo)) {
                    animateValue(target, 0, countTo, 2000);
                }
                observer.unobserve(target);
            }
        });
    }, { threshold: 0.5 });

    stats.forEach(s => observer.observe(s));
}

function animateValue(obj, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const value = Math.floor(progress * (end - start) + start);
        
        let displayValue = value.toLocaleString();
        if (end >= 1000000) {
            displayValue = (value / 1000000).toFixed(1) + 'M+';
        } else if (end >= 1000) {
            displayValue = value.toLocaleString() + '+';
        } else {
            displayValue = value + '+';
        }
        
        obj.innerHTML = displayValue;
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}
