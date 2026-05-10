document.addEventListener('DOMContentLoaded', () => {
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetSelector = this.getAttribute('href');
            if (targetSelector === '#') return;
            const target = document.querySelector(targetSelector);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
                // Close mobile menu after navigation click
                const navLinks = document.querySelector('.nav-links');
                const hamburger = document.querySelector('.hamburger');
                if (navLinks && navLinks.classList.contains('active')) {
                    navLinks.classList.remove('active');
                    if (hamburger) hamburger.classList.remove('active');
                }
            }
        });
    });

    // Navbar Background on Scroll
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.style.boxShadow = "0 4px 20px rgba(0,0,0,0.1)";
            } else {
                navbar.style.boxShadow = "0 2px 10px rgba(0,0,0,0.05)";
            }
        });
    }

    // Mobile Menu Toggle
    const hamburger = document.querySelector('.hamburger');
    const navLinksList = document.querySelector('.nav-links');
    if (hamburger && navLinksList) {
        hamburger.addEventListener('click', () => {
            const isActive = navLinksList.classList.toggle('active');
            hamburger.classList.toggle('active', isActive);
            hamburger.setAttribute('aria-expanded', isActive ? 'true' : 'false');
        });
    }

    // Gallery Logic
    const filterBtns = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    let currentFilter = 'all';
    let visibleItemsCount = 8;
    let filteredItems = [];

    function updateGallery() {
        filteredItems = [];
        galleryItems.forEach(item => {
            const category = item.getAttribute('data-category');
            if (currentFilter === 'all' || category === currentFilter) {
                filteredItems.push(item);
            } else {
                item.classList.add('hidden');
                item.style.display = 'none';
            }
        });

        filteredItems.forEach((item, index) => {
            if (index < visibleItemsCount) {
                item.classList.remove('hidden');
                item.style.display = 'block';
            } else {
                item.classList.add('hidden');
                item.style.display = 'none';
            }
        });

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

    if (galleryItems.length) {
        updateGallery();
    }

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.getAttribute('data-filter');
            visibleItemsCount = 8;
            updateGallery();
        });
    });

    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', () => {
            visibleItemsCount += 8;
            updateGallery();
        });
    }

    // Lightbox Logic
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const closeBtn = document.querySelector('.close-lightbox');
    let currentLightboxIndex = 0;

    function getItemSrc(item) {
        // Prefer <img> child for accessible markup
        const img = item.querySelector('img');
        if (img && img.getAttribute('src')) return img.getAttribute('src');
        // Fallback: data-src attribute
        const dataSrc = item.getAttribute('data-src');
        if (dataSrc) return dataSrc;
        // Fallback: extract from inline background-image
        const style = window.getComputedStyle(item);
        const bgImage = style.backgroundImage;
        if (bgImage && bgImage.startsWith('url(')) {
            return bgImage.slice(4, -1).replace(/['"]/g, "");
        }
        return '';
    }

    function getItemAlt(item) {
        const img = item.querySelector('img');
        if (img && img.getAttribute('alt')) return img.getAttribute('alt');
        return '';
    }

    function openLightbox(index) {
        if (!lightbox || !lightboxImg) return;
        currentLightboxIndex = index;
        const item = filteredItems[currentLightboxIndex];
        if (!item) return;

        const src = getItemSrc(item);
        const alt = getItemAlt(item);

        lightboxImg.src = src;
        lightboxImg.alt = alt;
        lightbox.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        if (!lightbox) return;
        lightbox.style.display = 'none';
        document.body.style.overflow = '';
    }

    function changeSlide(n) {
        if (!filteredItems.length) return;
        let newIndex = currentLightboxIndex + n;
        if (newIndex >= filteredItems.length) newIndex = 0;
        if (newIndex < 0) newIndex = filteredItems.length - 1;
        openLightbox(newIndex);
    }

    galleryItems.forEach(item => {
        item.addEventListener('click', () => {
            const index = filteredItems.indexOf(item);
            if (index !== -1) {
                openLightbox(index);
            }
        });
    });

    if (closeBtn) closeBtn.addEventListener('click', closeLightbox);

    document.addEventListener('keydown', (e) => {
        if (lightbox && lightbox.style.display === 'flex') {
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowLeft') changeSlide(-1);
            if (e.key === 'ArrowRight') changeSlide(1);
        }
    });

    if (lightbox) {
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) closeLightbox();
        });
    }

    // Expose changeSlide for inline onclick attributes
    window.changeSlide = changeSlide;

    // Formspree AJAX submission (graceful enhancement — falls back to native POST if JS disabled)
    document.querySelectorAll('form.contact-form[action*="formspree.io"]').forEach((form) => {
        form.addEventListener('submit', async (event) => {
            event.preventDefault();

            const status = form.querySelector('.form-status');
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalLabel = submitBtn ? submitBtn.textContent : '';

            if (status) {
                status.textContent = 'Sending your inquiry…';
                status.className = 'form-status sending';
            }
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Sending…';
            }

            try {
                const response = await fetch(form.action, {
                    method: 'POST',
                    body: new FormData(form),
                    headers: { Accept: 'application/json' },
                });

                if (response.ok) {
                    form.reset();
                    if (status) {
                        status.textContent = 'Thank you! Your inquiry has been sent — we will reply shortly.';
                        status.className = 'form-status success';
                    }
                } else {
                    let errorMessage = 'Sorry, something went wrong. Please try again or email us at monserratoapartments@gmail.com.';
                    try {
                        const data = await response.json();
                        if (data && Array.isArray(data.errors) && data.errors.length) {
                            errorMessage = data.errors.map((e) => e.message).join(' ');
                        }
                    } catch (_) { /* ignore JSON parse errors */ }
                    if (status) {
                        status.textContent = errorMessage;
                        status.className = 'form-status error';
                    }
                }
            } catch (_) {
                if (status) {
                    status.textContent = 'Network error. Please check your connection and try again, or email us directly.';
                    status.className = 'form-status error';
                }
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalLabel;
                }
            }
        });
    });
});
