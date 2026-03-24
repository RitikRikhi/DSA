// Legacy Lightbox functions removed - using unified lightbox.js instead



// Category filter functionality
let currentCategory = 'all';

async function loadPhotos(category = 'all') {
  const gallery = document.getElementById('galleryGrid');
  if (!gallery) return;

  // Don't run if gallery-logic is handling it (gallery.html)
  if (window.location.href.includes('gallery.html')) return;

  // Show loading state
  gallery.innerHTML = '<div class="loading">Loading our masterpieces...</div>';

  try {
    const res = await fetch("/api/photos");
    let photos = await res.json();

    // Filter by category if not 'all'
    if (category !== 'all') {
      photos = photos.filter(p => (p.category || '').toLowerCase() === category.toLowerCase());
    }

    if (photos.length === 0) {
      gallery.innerHTML = '<div class="loading">No photos found in this category.</div>';
      return;
    }

    gallery.innerHTML = "";
    photos.forEach(photo => {
      const item = document.createElement("div");
      item.className = "gallery-item";
      
      const categoryLabel = photo.category || 'Gallery';
      
      item.innerHTML = `
        <img src="${photo.imageUrl}" alt="${photo.title}">
        <div class="gallery-overlay">
          <div style="width: 100%;">
            <div style="font-size: 0.7rem; color: var(--gold); text-transform: uppercase; letter-spacing: 2px; margin-bottom: 5px;">${categoryLabel}</div>
            <h4>${photo.title}</h4>
          </div>
        </div>
      `;
      
      item.addEventListener('click', () => {
        if (typeof openLightbox === 'function') {
          openLightbox(photo.imageUrl, photo.title, categoryLabel);
        }
      });
      
      gallery.appendChild(item);
    });
  } catch (err) {
    console.error(err);
    gallery.innerHTML = '<div class="loading">Error loading gallery.</div>';
  }
}

// Gallery Filtering
function initGalleryFilters() {
  const filters = document.querySelectorAll('.filter-btn');
  if (filters.length === 0) return;
  if (window.location.href.includes('gallery.html')) return; // gallery-logic handles this

  filters.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active state
      filters.forEach(f => f.classList.remove('active'));
      btn.classList.add('active');
      
      // Get category
      const category = btn.textContent.toLowerCase().trim();
      const categoryMap = {
        'all': 'all',
        'events': 'events',
        'sports': 'sports',
        'cultural fest': 'cultural',
        'campus life': 'campus',
        'portraits': 'portraits',
        'team-bts': 'team-bts',
        'achievements': 'achievements'
      };
      
      const filterCategory = categoryMap[category] || category;
      loadPhotos(filterCategory);
    });
  });
}

// Service card click handlers
function initServiceCards() {
  const serviceCards = document.querySelectorAll('.service-card');
  
  serviceCards.forEach(card => {
    card.addEventListener('click', () => {
      // Get the category from the service card
      const icon = card.querySelector('.service-icon').textContent;
      const categoryMap = {
        '📸': 'photography',
        '🎬': 'videography',
        '🎨': 'editing',
        '🎤': 'team-bts',
        '🏆': 'achievements',
        '📱': 'reels',
        '🗂️': 'archives'
      };
      
      const category = categoryMap[icon] || 'all';
      
      // Navigate to gallery with category filter
      window.location.href = `/gallery.html?category=${category}`;
    });
  });
}

// Public upload functionality for index.html
function initPublicUpload() {
  const uploadCard = document.getElementById('publicUploadCard');
  if (!uploadCard) return;

  const btn = document.getElementById('indexUploadBtn');
  const status = document.getElementById('indexUploadStatus');

  btn.addEventListener('click', async () => {
    const title = document.getElementById('indexUploadTitle').value;
    const category = document.getElementById('indexUploadCategory').value;
    const file = document.getElementById('indexUploadFile').files[0];

    if (!title || !file) {
      status.textContent = "Title and file required";
      status.style.color = "var(--red)";
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('category', category);
    formData.append('image', file);

    try {
      btn.disabled = true;
      status.textContent = "Uploading...";
      status.style.color = "var(--gold)";

      const res = await fetch("/api/photos", {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        status.textContent = "Success! refreshing...";
        status.style.color = "#4caf50";
        document.getElementById('indexUploadTitle').value = "";
        document.getElementById('indexUploadFile').value = "";
        // Refresh local gallery
        loadPhotos(currentCategory);
        setTimeout(() => { status.textContent = ""; }, 3000);
      } else {
        const err = await res.json();
        status.textContent = `Error: ${err.msg || 'Failed'}`;
        status.style.color = "var(--red)";
      }
    } catch (error) {
      status.textContent = "Connection Error";
      status.style.color = "var(--red)";
    } finally {
      btn.disabled = false;
    }
  });
}

// Team card click handlers
function initTeamCards() {
  const teamCards = document.querySelectorAll('.team-card');
  
  teamCards.forEach(card => {
    card.addEventListener('click', () => {
      const name = card.querySelector('.team-name').textContent;
      const role = card.querySelector('.team-role').textContent;
      
      // Show team member details in a modal
      showTeamMemberModal(name, role);
    });
  });
}

// Team member modal
function showTeamMemberModal(name, role) {
  // Remove existing modal if any
  const existing = document.getElementById('teamModal');
  if (existing) existing.remove();
  
  const modal = document.createElement('div');
  modal.id = 'teamModal';
  modal.className = 'lightbox';
  modal.innerHTML = `
    <div class="lightbox-overlay" onclick="this.parentElement.remove()"></div>
    <div class="lightbox-content" style="max-width:500px;background:var(--grey);padding:3rem;border-radius:8px;text-align:center;">
      <button class="lightbox-close" onclick="this.parentElement.parentElement.remove()">&times;</button>
      <div class="team-avatar" style="width:120px;height:120px;font-size:3rem;margin:0 auto 1.5rem;">
        ${name.charAt(0)}
      </div>
      <h2 style="font-family:'Bebas Neue',sans-serif;font-size:2.5rem;margin-bottom:0.5rem;">${name}</h2>
      <p style="color:var(--gold);font-size:0.9rem;letter-spacing:0.15em;text-transform:uppercase;margin-bottom:1.5rem;">${role}</p>
      <p style="color:rgba(245,240,235,0.6);line-height:1.8;">
        Passionate about capturing moments and telling visual stories. 
        Part of the DSA Media Crew family.
      </p>
      <div style="display:flex;gap:1rem;justify-content:center;margin-top:2rem;">
        <a href="#contact" class="social-btn" onclick="document.getElementById('teamModal').remove()">Contact</a>
        <a href="#gallery" class="social-btn primary" onclick="document.getElementById('teamModal').remove()">View Work</a>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  document.body.style.overflow = 'hidden';
}

// Featured section button handlers
function initFeaturedButtons() {
  const featuredSection = document.querySelector('.featured-section');
  if (!featuredSection) return;
  
  const buttons = featuredSection.querySelectorAll('.social-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const href = btn.getAttribute('href');
      if (href && href.startsWith('#')) {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });
}

// Initialize all functionality
document.addEventListener('DOMContentLoaded', function() {
  // initLightbox is now auto-initialized in lightbox.js
  initServiceCards();
  initTeamCards();
  initFeaturedButtons();
  initPublicUpload();

  if (!window.location.href.includes('gallery.html')) {
    initGalleryFilters();
    loadPhotos();
  }
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (href === '#') return;
    
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth'
      });
    }
  });
});

// Navbar scroll effect
window.addEventListener('scroll', function() {
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    if (window.scrollY > 100) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }
});

// Mobile menu toggle
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

if (hamburger) {
  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    hamburger.classList.toggle('active');
  });
}

// Close mobile menu when clicking a link
document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => {
    if (navLinks) navLinks.classList.remove('active');
    if (hamburger) hamburger.classList.remove('active');
  });
});

// Stats counter animation
function animateStats() {
  const stats = document.querySelectorAll('.stat-num[data-target]');
  
  stats.forEach(stat => {
    const target = parseInt(stat.getAttribute('data-target'));
    const duration = 2000;
    const step = target / (duration / 16);
    let current = 0;
    
    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      stat.textContent = Math.floor(current).toLocaleString();
    }, 16);
  });
}

// Run stats animation when visible
const statsSection = document.querySelector('.stats');
if (statsSection) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateStats();
        observer.unobserve(entry.target);
      }
    });
  });
  observer.observe(statsSection);
}
