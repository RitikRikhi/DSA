
document.addEventListener('DOMContentLoaded', function () {
    // Start animations FIRST
    if (typeof initAnimations === 'function') {
        initAnimations();
        console.log('ANIMATIONS: Intersection Observer initialized.');
    }
    if (typeof initStatsCounter === 'function') initStatsCounter();

    const urlParams = new URLSearchParams(window.location.search);
    const categoryQuery = urlParams.get('category') || 'all';
    
    // Set initial active state for filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.category === categoryQuery) btn.classList.add('active');
    });
    
    // Hide featured sections if category is not 'all'
    const toggleFeaturedSections = (cat) => {
        const featuredSection = document.querySelector('.featured-section');
        const collageSection = document.querySelector('.collage-section');
        if (cat === 'all') {
            if (featuredSection) featuredSection.style.display = 'block';
            if (collageSection) collageSection.style.display = 'block';
        } else {
            if (featuredSection) featuredSection.style.display = 'none';
            if (collageSection) collageSection.style.display = 'none';
        }
    };

    toggleFeaturedSections(categoryQuery);

    loadGalleryPhotos(categoryQuery);

    // Filter button event listeners
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const cat = btn.getAttribute('data-category') || btn.dataset.category;
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Update URL without refreshing
            const newUrl = cat === 'all' ? '/gallery.html' : `/gallery.html?category=${cat}`;
            window.history.pushState({}, '', newUrl);
            
            toggleFeaturedSections(cat);
            loadGalleryPhotos(cat);
        });
    });
});

let currentPage = 1;
const itemsLimit = 12;
let isLoading = false;
let currentPhotosCount = 0;

async function loadGalleryPhotos(category, page = 1) {
    const gallery = document.getElementById('galleryGrid');
    if (!gallery || isLoading) return;

    isLoading = true;
    if (page === 1) {
        gallery.innerHTML = `<div class="empty-state"><div class="empty-text">Loading...</div></div>`;
        currentPage = 1;
        currentPhotosCount = 0;
    }

    try {
        const res = await fetch(`/api/photos?page=${page}&limit=${itemsLimit}&category=${category}`);
        const data = await res.json();
        const photos = data.photos;
        
        if (page === 1) {
            gallery.innerHTML = "";
        }

        if (!photos || photos.length === 0) {
            if (page === 1) {
                gallery.innerHTML = `<div class="empty-state"><div class="empty-icon">📷</div><div class="empty-text">No photos in this category yet</div></div>`;
            }
            removeLoadMoreButton();
            isLoading = false;
            return;
        }
        
        const layoutPatterns = [{ class: 'wide' }, { class: '' }, { class: '' }, { class: 'wide' }, { class: '' }, { class: '' }, { class: '' }, { class: '' }];
        
        photos.forEach((photo, index) => {
            const pattern = layoutPatterns[(currentPhotosCount + index) % layoutPatterns.length];
            const isReel = category === 'reels';
            const galleryItem = document.createElement('div');
            galleryItem.className = `gallery-item ${isReel ? 'vertical' : pattern.class}`;
            
            const imageUrl = (photo.imageUrl.startsWith('/') || photo.imageUrl.startsWith('http')) 
                ? photo.imageUrl 
                : '/' + photo.imageUrl;
            const encodedUrl = encodeURI(imageUrl);
            const cat = photo.category || getCategoryFromTitle(photo.title) || 'Gallery';
            const isVideo = photo.type === 'video' || imageUrl.match(/\.(mp4|webm|ogg|mov)$/i);
            
            let mediaElement = `<img src="${encodedUrl}" alt="${photo.title}" onerror="this.parentElement.innerHTML='<div class=\\'gallery-icon\\'>📷</div><div class=\\'gallery-label\\'>Image not found</div>'">`;
            
            if (isVideo) {
                const isRotated = photo.rotation && photo.rotation % 180 !== 0;
                const transform = `rotate(${photo.rotation || 0}deg)${isRotated ? ' scale(3.16)' : ''}`;
                mediaElement = `
                    <video muted loop onmouseover="this.play()" onmouseout="this.pause()" 
                           src="${encodedUrl}#t=5"
                           style="width:100%;height:100%;object-fit:${isRotated ? 'contain' : 'cover'}; transform: ${transform};" 
                           playsinline>
                        Your browser does not support the video tag.
                    </video>
                    <button class="sound-toggle-btn" style="position: absolute; bottom: 10px; right: 10px; background: rgba(0,0,0,0.6); color: white; border: none; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 10; transition: background 0.3s;" aria-label="Toggle Sound">
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                            <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"></path>
                        </svg>
                    </button>
                `;
            }
            
            const isAchievement = cat.toLowerCase() === 'achievements';
            const verifiedHtml = isAchievement ? '<span class="verified-badge"><i class="fas fa-check"></i></span>' : '';

            galleryItem.innerHTML = `<div class="gallery-placeholder" style="position:relative; width:100%; height:100%;">${mediaElement}</div><div class="gallery-overlay"><div class="overlay-type">${cat}</div><div class="overlay-title">${photo.title || 'Untitled'}${verifiedHtml}</div></div>`;
            
            // Force visibility immediately to fix the "grey box" issue
            galleryItem.classList.add('visible');
            
            if (window.galleryObserver) {
                window.galleryObserver.observe(galleryItem);
                console.log('GALLERY: Observing item', index);
            }
            
            if (isVideo) {
                const soundBtn = galleryItem.querySelector('.sound-toggle-btn');
                const vid = galleryItem.querySelector('video');
                
                soundBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    vid.muted = !vid.muted;
                    if (vid.muted) {
                        soundBtn.innerHTML = `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"></path></svg>`;
                    } else {
                        soundBtn.innerHTML = `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"></path></svg>`;
                        vid.play();
                    }
                });
            }
            
            galleryItem.addEventListener('click', (e) => {
                const imageUrl = (photo.imageUrl.startsWith('/') || photo.imageUrl.startsWith('http')) 
                    ? photo.imageUrl 
                    : '/' + photo.imageUrl;
                if (typeof openLightbox === 'function') { 
                    // Create a simple group for now, or just open the current one
                    openLightbox(imageUrl, photo.title, cat, isVideo ? 'video' : 'image'); 
                }
            });
            
            gallery.appendChild(galleryItem);
        });

        currentPhotosCount += photos.length;
        
        if (data.hasMore) {
            setupLoadMoreButton(category);
        } else {
            removeLoadMoreButton();
        }

    } catch (error) {
        console.error("Error loading gallery:", error);
        if (typeof showToast === 'function') showToast("Failed to load gallery content", "error");
        
        if (page === 1) {
            gallery.innerHTML = `<div class="empty-state"><div class="empty-icon">⚠️</div><div class="empty-text">Error loading photos. Please try again later.</div></div>`;
        }
    } finally {
        isLoading = false;
    }
}

function setupLoadMoreButton(category) {
    let btn = document.getElementById('loadMoreBtn');
    if (!btn) {
        const container = document.createElement('div');
        container.id = 'loadMoreContainer';
        container.style.textAlign = 'center';
        container.style.marginTop = '3rem';
        container.innerHTML = `<button id="loadMoreBtn" class="btn-ghost" style="padding: 1rem 3rem;">Load More</button>`;
        document.getElementById('gallery').appendChild(container);
        btn = document.getElementById('loadMoreBtn');
    }
    
    // Replace listener to avoid duplicates
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
    
    newBtn.addEventListener('click', () => {
        currentPage++;
        loadGalleryPhotos(category, currentPage);
    });
}

function removeLoadMoreButton() {
    const container = document.getElementById('loadMoreContainer');
    if (container) container.remove();
}

function getCategoryFromTitle(title) {
    if (!title) return '';
    const t = title.toLowerCase();
    if (t.includes('sport') || t.includes('athletic')) return 'sports';
    if (t.includes('cultural') || t.includes('fest') || t.includes('night')) return 'cultural';
    if (t.includes('portrait') || t.includes('graduation')) return 'portraits';
    if (t.includes('campus') || t.includes('life')) return 'campus';
    if (t.includes('tech') || t.includes('seminar') || t.includes('event')) return 'events';
    if (t.includes('achievement') || t.includes('winner') || t.includes('spotlight')) return 'achievements';
    return '';
}
