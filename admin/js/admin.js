// Login functionality
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMsg = document.getElementById('errorMsg');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('token', data.token);
        window.location.href = '/admin/dashboard.html';
      } else {
        errorMsg.textContent = data.msg || 'Login failed';
      }
    } catch (err) {
      errorMsg.textContent = 'Connection error. Please try again.';
    }
  });
}

// Upload functionality
const uploadForm = document.getElementById('uploadForm');
if (uploadForm) {
  // Check if logged in
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = '/admin/login.html';
  }

  uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('title').value;
    const image = document.getElementById('image').files[0];
    const category = document.getElementById('category') ? document.getElementById('category').value : '';
    const uploadMsg = document.getElementById('uploadMsg');

    if (!image) {
      uploadMsg.textContent = 'Please select an image';
      uploadMsg.style.color = '#ef4444';
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('image', image);
    formData.append('category', category);

    try {
      const res = await fetch('/api/photos', {
        method: 'POST',
        headers: { 
          'Authorization': token 
        },
        body: formData
      });

      const data = await res.json();

      if (res.ok) {
        uploadMsg.textContent = 'Photo uploaded successfully!';
        uploadMsg.style.color = '#22c55e';
        uploadForm.reset();
        loadPhotos(); // Reload the photo list
      } else {
        uploadMsg.textContent = data.msg || 'Upload failed';
        uploadMsg.style.color = '#ef4444';
      }
    } catch (err) {
      uploadMsg.textContent = 'Connection error. Please try again.';
      uploadMsg.style.color = '#ef4444';
    }
  });

  // Load photos on page load
  loadPhotos();
}

// Load photos for dashboard
async function loadPhotos() {
  const photoList = document.getElementById('photoList');
  if (!photoList) return;

  try {
    // Admin usually wants to see all, but let's use a large limit to keep it fast
    const res = await fetch('/api/photos?limit=100');
    const data = await res.json();
    const photos = data.photos;

    if (!photos || photos.length === 0) {
      photoList.innerHTML = '<p>No photos uploaded yet.</p>';
      return;
    }

    photoList.innerHTML = photos.map(photo => `
      <div class="photo-item">
        <img src="${photo.imageUrl}" alt="${photo.title}" onerror="this.src='https://via.placeholder.com/200x150?text=No+Image'">
        <div class="photo-info">
          <h4>${photo.title || 'Untitled'}</h4>
          <p class="photo-category">${photo.category || 'No Category'}</p>
          <button class="delete-btn" onclick="deletePhoto('${photo._id}')">Delete</button>
        </div>
      </div>
    `).join('');
  } catch (err) {
    console.error("Error loading photos for admin:", err);
    photoList.innerHTML = '<p>Error loading photos.</p>';
  }
}

// Delete photo
async function deletePhoto(id) {
  if (!confirm('Are you sure you want to delete this photo?')) return;

  const token = localStorage.getItem('token');
  
  try {
    const res = await fetch(`/api/photos/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': token }
    });

    if (res.ok) {
      loadPhotos(); // Reload the photo list
    } else {
      alert('Failed to delete photo');
    }
  } catch (err) {
    alert('Error deleting photo');
  }
}

// Logout function
function logout() {
  localStorage.removeItem('token');
  window.location.href = '/admin/login.html';
}
