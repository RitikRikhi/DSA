
document.addEventListener('DOMContentLoaded', () => {
    let currentPage = 1;
    const itemsLimit = 6;
    let isLoading = false;
    const category = 'editing'; // Specific category for this page

    const videoGrid = document.getElementById('editingVideoGrid');
    if (!videoGrid) return;

    async function loadVideos(page = 1) {
        if (isLoading) return;
        isLoading = true;

        if (page === 1) {
            videoGrid.innerHTML = '<div style="grid-column: span 2; text-align: center; padding: 2rem; color: var(--gold);">Loading...</div>';
        }

        try {
            const res = await fetch(`/api/photos?page=${page}&limit=${itemsLimit}&category=${category}`);
            const data = await res.json();
            const videos = data.photos;

            if (page === 1) {
                videoGrid.innerHTML = '';
            }

            if (!videos || videos.length === 0) {
                if (page === 1) {
                    videoGrid.innerHTML = '<div style="grid-column: span 2; text-align: center; padding: 2rem; color: rgba(245,240,235,0.4);">No videos found in this category.</div>';
                }
                removeLoadMore();
                isLoading = false;
                return;
            }

            videos.forEach(video => {
                const isVideo = video.imageUrl.match(/\.(mp4|webm|ogg|mov)$/i);
                
                // Consistency is key: Use the same fitting logic across the site
                const isRotated = video.rotation && video.rotation % 180 !== 0;
                const transform = `rotate(${video.rotation || 0}deg)${isRotated ? ' scale(3.16)' : ''}`;
                const timestamp = '#t=5';

                videoItem.innerHTML = `
                    <div class="video-placeholder" style="width:100%;height:100%; position: relative; background: #000; overflow: hidden; display: flex; align-items: center; justify-content: center;">
                        ${isVideo ? 
                            `<video src="${video.imageUrl}${timestamp}" class="video-thumbnail" muted playsinline preload="metadata" style="width:100%; height:100%; object-fit: ${isRotated ? 'contain' : 'cover'}; transform: ${transform}; position: absolute;"></video>` : 
                            `<img src="${video.imageUrl}" alt="${video.title}" class="video-thumbnail" style="width:100%; height:100% ;object-fit: cover; transform: rotate(${video.rotation || 0}deg);">`
                        }
                    </div>
                    <div class="video-overlay">
                        <div class="video-info">
                            <p class="video-category">${video.category || 'Editing'}</p>
                            <h3 class="video-title">${video.title || 'Untitled'}</h3>
                            <p class="video-year">${new Date(video.uploadedAt).getFullYear() || '2026'}</p>
                        </div>
                    </div>
                `;
                videoGrid.appendChild(videoItem);
            });

            if (data.hasMore) {
                setupLoadMore();
            } else {
                removeLoadMore();
            }

        } catch (error) {
            console.error("Error loading videos:", error);
            if (page === 1) {
                videoGrid.innerHTML = '<div style="grid-column: span 2; text-align: center; padding: 2rem; color: var(--red);">Error loading videos.</div>';
            }
        } finally {
            isLoading = false;
        }
    }

    function setupLoadMore() {
        let btn = document.getElementById('loadMoreVideosBtn');
        if (!btn) {
            const container = document.createElement('div');
            container.id = 'loadMoreVideosContainer';
            container.style.textAlign = 'center';
            container.style.marginTop = '4rem';
            container.style.gridColumn = 'span 2';
            container.innerHTML = `<button id="loadMoreVideosBtn" class="btn-ghost" style="padding: 1rem 3rem;">Load More</button>`;
            videoGrid.parentNode.appendChild(container);
            btn = document.getElementById('loadMoreVideosBtn');
        }

        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        newBtn.addEventListener('click', () => {
            currentPage++;
            loadVideos(currentPage);
        });
    }

    function removeLoadMore() {
        const container = document.getElementById('loadMoreVideosContainer');
        if (container) container.remove();
    }

    loadVideos();
});
