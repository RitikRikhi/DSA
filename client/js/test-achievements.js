fetch('/api/photos?category=achievements')
    .then(res => res.json())
    .then(data => {
        const grid = document.getElementById('testGrid');
        grid.innerHTML = "";
        data.photos.forEach(p => {
            const img = document.createElement('img');
            img.src = p.imageUrl;
            img.style.width = "200px";
            img.style.margin = "10px";
            grid.appendChild(img);
        });
        if (data.photos.length === 0) grid.innerHTML = "No photos found";
    })
    .catch(err => {
        document.getElementById('testGrid').innerHTML = "Error: " + err.message;
    });
