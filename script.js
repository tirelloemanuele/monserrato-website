document.addEventListener('DOMContentLoaded', () => {
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Navbar Background on Scroll
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.boxShadow = "0 4px 20px rgba(0,0,0,0.1)";
        } else {
            navbar.style.boxShadow = "0 2px 10px rgba(0,0,0,0.05)";
        }
    });

    // Mobile Menu Toggle (to be implemented if user requests mobile menu details)
    console.log("Monserrato Website Loaded Successfully");

    // Gallery Logic
    const filterBtns = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    let currentFilter = 'all';
    let visibleItemsCount = 8;
    let filteredItems = [];

    // Initialize Gallery
    function updateGallery() {
        // 1. Filter items
        filteredItems = [];
        galleryItems.forEach(item => {
            const category = item.getAttribute('data-category');
            if (currentFilter === 'all' || category === currentFilter) {
                // Temporarily unhide to check, avoiding display:none issues if needed
                filteredItems.push(item);
            } else {
                item.classList.add('hidden');
                item.style.display = 'none'; // Ensure it doesn't take space
            }
        });

        // 2. Show/Hide based on limit
        filteredItems.forEach((item, index) => {
            if (index < visibleItemsCount) {
                item.classList.remove('hidden');
                item.style.display = 'block';
            } else {
                item.classList.add('hidden');
                item.style.display = 'none';
            }
        });

        // 3. Manage Load More Button
        if (loadMoreBtn) {
            if (filteredItems.length > visibleItemsCount) {
                loadMoreBtn.classList.remove('hidden');
                loadMoreBtn.style.display = 'inline-block';
            } else {
                loadMoreBtn.classList.add('hidden');
                loadMoreBtn.style.display = 'none';
            }
        }
    }

    // Initial Load
    updateGallery();

    // Filter Click
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.getAttribute('data-filter');
            visibleItemsCount = 8; // Reset limit on filter change
            updateGallery();
        });
    });

    // Load More Click
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', () => {
            visibleItemsCount += 8; // Show 8 more
            updateGallery();
        });
    }

    // Lightbox Logic
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const closeBtn = document.querySelector('.close-lightbox');
    const prevBtn = document.querySelector('.prev');
    const nextBtn = document.querySelector('.next');
    let currentLightboxIndex = 0;

    function openLightbox(index) {
        currentLightboxIndex = index;
        const item = filteredItems[currentLightboxIndex];
        if (!item) return;

        // Extract URL from background-image style
        // style.backgroundImage returns 'url("path")'
        let src = item.getAttribute('data-src');
        if (!src) {
            const style = window.getComputedStyle(item);
            const bgImage = style.backgroundImage;
            src = bgImage.slice(5, -2).replace(/"/g, "");
        }

        lightboxImg.src = src;
        lightbox.style.display = 'flex';
    }

    function closeLightbox() {
        lightbox.style.display = 'none';
    }

    function changeSlide(n) {
        let newIndex = currentLightboxIndex + n;
        if (newIndex >= filteredItems.length) newIndex = 0;
        if (newIndex < 0) newIndex = filteredItems.length - 1;
        openLightbox(newIndex);
    }

    // Add click event to all items
    galleryItems.forEach(item => {
        item.addEventListener('click', () => {
            // Find this item's index in the CURRENT filtered list
            const index = filteredItems.indexOf(item);
            if (index !== -1) {
                openLightbox(index);
            }
        });
    });

    // Controls
    if (closeBtn) closeBtn.addEventListener('click', closeLightbox);

    // Global controls (keys)
    document.addEventListener('keydown', (e) => {
        if (lightbox && lightbox.style.display === 'flex') {
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowLeft') changeSlide(-1);
            if (e.key === 'ArrowRight') changeSlide(1);
        }
    });

    // Close on click outside
    if (lightbox) {
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) closeLightbox();
        });
    }

    // Expose changeSlide to window for HTML onclick attributes
    window.changeSlide = changeSlide;
});
