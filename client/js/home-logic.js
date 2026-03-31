
document.addEventListener('DOMContentLoaded', () => {
    console.log('--- DSA Media Crew Frontend Logic Loaded ---');
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
        console.log('SUCCESS: Contact form #contactForm found in DOM.');
        contactForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            console.log('EVENT: Contact form submit triggered.');
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
                console.log('FETCH: Sending request to /api/contact with data:', data);

                const response = await fetch('/api/contact', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });

                console.log('RESPONSE: Received from /api/contact:', response.status);
                if (response.ok) {
                    console.log('SUCCESS: Form submitted correctly.');
                    if (successMsg) successMsg.style.display = 'block';
                    form.reset();
                    setTimeout(() => {
                        if (successMsg) successMsg.style.display = 'none';
                    }, 3000);
                } else {
                    console.error('ERROR: Backend returned non-OK status:', response.status);
                    const errorText = await response.text();
                    console.error('Error body:', errorText);
                    alert('Failed to send message. Please try again.');
                }
            } catch (error) {
                console.error('FETCH ERROR: Network or runtime error during submission:', error);
                alert('An error occurred. Please try again later.');
            } finally {
                btn.innerText = originalText;
                btn.disabled = false;
            }
        });
    } else {
        console.warn('WARNING: Contact form #contactForm NOT found in DOM.');
    }

    // Dynamic Gallery loader for Home Page
    async function loadDynamicGallery() {
        const gallery = document.getElementById('galleryGrid');
        if (!gallery) return;

        console.log('GALLERY: Attempting to load from /api/photos');
        try {
            const res = await fetch("/api/photos");
            const data = await res.json();
            const photos = data.photos; // Fix: Access the photos array from the object
            console.log('GALLERY: Received', (photos ? photos.length : 0), 'items');

            if (!photos || photos.length === 0) {
                console.log('GALLERY: Empty state rendered because photo count is 0');
                return;
            }

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
            console.error('GALLERY ERROR:', error);
        }
    }

    loadDynamicGallery();
});

