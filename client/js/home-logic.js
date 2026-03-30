
document.addEventListener('DOMContentLoaded', () => {
    // Stats animation observer
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                animateCounter(el, parseInt(el.dataset.target));
                statsObserver.unobserve(el);
            }
        });
    }, { threshold: 0.5 });

    document.querySelectorAll('[data-target]').forEach(el => statsObserver.observe(el));

    function animateCounter(el, target) {
        let current = 0;
        const duration = 2000;
        const stepTime = Math.abs(Math.floor(duration / target));
        const timer = setInterval(() => {
            current += Math.ceil(target / 100);
            if (current >= target) {
                el.innerText = target;
                clearInterval(timer);
            } else {
                el.innerText = current;
            }
        }, 30);
    }

    // Gallery filter UI helper
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // Handle form submission
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            const form = event.target;
            const successMsg = document.getElementById('successMsg');
            
            // Disable button during "submission"
            const btn = form.querySelector('button');
            const originalText = btn.innerText;
            btn.innerText = "Sending...";
            btn.disabled = true;

            try {
                const formData = new FormData(form);
                const data = Object.fromEntries(formData.entries());

                const response = await fetch('/api/contact', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });

                if (response.ok) {
                    if (successMsg) successMsg.style.display = 'block';
                    form.reset();
                    setTimeout(() => {
                        if (successMsg) successMsg.style.display = 'none';
                    }, 3000);
                } else {
                    alert('Failed to send message. Please try again.');
                }
            } catch (error) {
                console.error('Error submitting form:', error);
                alert('An error occurred. Please try again later.');
            } finally {
                btn.innerText = originalText;
                btn.disabled = false;
            }
        });
    }

    // Dynamic Gallery loader for Home Page
    async function loadDynamicGallery() {
        const gallery = document.getElementById('galleryGrid');
        if (!gallery) return;

        try {
            const res = await fetch("/api/photos");
            const photos = await res.json();

            if (!photos || photos.length === 0) return;

            gallery.innerHTML = "";
            // Show last 12 items for home page
            const recentPhotos = photos.slice(-12).reverse();

            recentPhotos.forEach((photo) => {
                const galleryItem = document.createElement('div');
                galleryItem.className = 'gallery-item';

                const imageUrl = (photo.imageUrl.startsWith('/') || photo.imageUrl.startsWith('http')) 
                    ? photo.imageUrl 
                    : '/' + photo.imageUrl;
                const cat = photo.category || 'Gallery';
                const isVideo = photo.type === 'video' || imageUrl.match(/\.(mp4|webm|ogg|mov)$/i);

                let mediaElement = `<img src="${imageUrl}" alt="${photo.title}" 
                    onerror="this.parentElement.innerHTML='<div class=\\'gallery-icon\\'>📷</div><div class=\\'gallery-label\\'>Image not found</div>'">`;

                if (isVideo) {
                    const isRotated = photo.rotation && photo.rotation % 180 !== 0;
                    const transform = `rotate(${photo.rotation || 0}deg)${isRotated ? ' scale(3.16)' : ''}`;
                    mediaElement = `
                    <video muted loop onmouseover="this.play()" onmouseout="this.pause()" 
                           src="${imageUrl}#t=5"
                           style="width:100%; height:100%; object-fit:${isRotated ? 'contain' : 'cover'}; transform: ${transform};" 
                           playsinline>
                    </video>
                `;
                }

                galleryItem.innerHTML = `
                <div class="gallery-placeholder">
                    ${mediaElement}
                </div>
                <div class="gallery-overlay">
                    <div class="overlay-type">${cat}</div>
                    <div class="overlay-title">${photo.title || 'Untitled'}</div>
                </div>
            `;
                gallery.appendChild(galleryItem);
            });
        } catch (error) {
            console.error('Error loading gallery:', error);
        }
    }

    loadDynamicGallery();
});
