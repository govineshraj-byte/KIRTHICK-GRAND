/* ==========================================================================
   KIRTHICK GRAND 2.0 - Main Application Logic
   ========================================================================== */

// --- Products Data ---
window.PIECES = [
    { id: 'quarter-dining', name: 'Quarter Dining Table', category: 'Dining', wood: 'Walnut', price: 75000, material: 'Solid Walnut Wood + Organic Wax finish', stock: 4, isNew: true, desc: 'Heirloom solid walnut dining table featuring structural timber joints, seating up to six comfortably.' },
    { id: 'walnut-coffee', name: 'Walnut Coffee Table', category: 'Living', wood: 'Walnut', price: 32000, material: 'Solid Walnut Wood + Clear Resin', stock: 7, isNew: false, desc: 'Minimalist low-slung coffee table showcasing beautiful growth rings and a smooth bevelled edge.' },
    { id: 'executive-desk', name: 'Executive Walnut Desk', category: 'Office', wood: 'Walnut', price: 58000, material: 'Solid Walnut Wood + Brass accents', stock: 3, isNew: true, desc: 'A grand walnut working desk with double sliding drawers, integrated cable paths and solid brass caps.' },
    { id: 'oak-bed', name: 'Oak Storage Bed', category: 'Bedroom', wood: 'White Oak', price: 85000, material: 'Solid White Oak + Linen headboard', stock: 2, isNew: true, desc: 'Platform style solid white oak bed with four drawers of hidden under-bed storage.' },
    { id: 'live-edge-console', name: 'Live Edge Console Table', category: 'Living', wood: 'White Oak', price: 45000, material: 'Solid White Oak', stock: 4, isNew: false, desc: 'Artistic foyer table featuring a live organic bark edge, supported by custom tapered steel dowels.' },
    { id: 'wedge-stool', name: 'Wedge Stool', category: 'Living', wood: 'White Oak', price: 12000, material: 'Solid White Oak', stock: 12, isNew: false, desc: 'Multipurpose stool or side table with a wedged mortise joint structure, extremely robust.' },
    { id: 'outdoor-lounge', name: 'Outdoor Lounge Chair', category: 'Outdoor', wood: 'Teak', price: 28000, material: 'Premium Teak + Weatherproof Fabric', stock: 5, isNew: false, desc: 'Reclined deck lounger made from high-oil premium teakwood, suitable for garden or poolside.' },
    { id: 'walnut-bench', name: 'Walnut Bench', category: 'Dining', wood: 'Walnut', price: 24000, material: 'Solid Walnut Wood', stock: 9, isNew: false, desc: 'Long dining companion bench built in matching timber thickness with rounded safety corners.' },
    { id: 'slim-tv-unit', name: 'Slim TV Unit', category: 'Living', wood: 'White Oak', price: 38000, material: 'Solid White Oak + Slatted sliding doors', stock: 5, isNew: true, desc: 'A low-slung, ultra-slim console unit with functional slatted sliding doors and wire routes.' },
    { id: 'two-seater-sofa', name: '2 Seater Sofa', category: 'Living', wood: 'Teak', price: 62000, material: 'Premium Teak + Cotton Canvas cushions', stock: 3, isNew: true, desc: 'Mid-century style two-seater sofa featuring a robust solid teak timber skeleton and plush cotton-canvas cushions.' },
    { id: 'storage-bench', name: 'Storage Bench', category: 'Bedroom', wood: 'White Oak', price: 26000, material: 'Solid Oak + Linen cushion top', stock: 6, isNew: false, desc: 'Multi-functional bedroom chest bench with a hinge-top seat cushion opening to deep storage space.' }
];

const PIECES = window.PIECES;

// --- Application State ---
const AppState = {
    wishlist: [],
    theme: 'light',
    activeFilters: {
        query: '',
        category: 'all',
        wood: 'all',
        price: 'all'
    }
};

// --- DOM References ---
const DOM = {
    themeToggleBtn: document.getElementById('theme-toggle'),
    wishlistToggleBtn: document.getElementById('wishlist-toggle'),
    wishlistDrawer: document.getElementById('wishlist-drawer'),
    wishlistCloseBtn: document.getElementById('wishlist-close'),
    wishlistDrawerOverlay: document.getElementById('wishlist-drawer-overlay'),
    wishlistItemsContainer: document.getElementById('wishlist-items-container'),
    wishlistBadge: document.getElementById('wishlist-badge'),
    wishlistConsultBtn: document.getElementById('wishlist-consult-btn'),
    closeDrawerAction: document.querySelector('.close-drawer-action'),
    
    productSearchInput: document.getElementById('product-search-input'),
    filterCategory: document.getElementById('filter-category'),
    filterWood: document.getElementById('filter-wood'),
    filterPrice: document.getElementById('filter-price'),
    clearFiltersBtn: document.getElementById('clear-filters-btn'),
    productGrid: document.getElementById('product-grid-container'),
    recommendedGrid: document.getElementById('recommended-products-container'),
    
    sliderContainer: document.getElementById('before-after-slider'),
    sliderAfterClip: document.getElementById('after-image-clip'),
    sliderDragHandle: document.getElementById('slider-drag-handle'),
    
    bookingForm: document.getElementById('design-appointment-form'),
    bookingSuccess: document.getElementById('booking-success-message'),
    bookingDateInput: document.getElementById('booking-date'),
    
    mobileMenuToggle: document.getElementById('mobile-menu-toggle'),
    navMenu: document.getElementById('nav-menu'),
    navbar: document.getElementById('navbar'),
    
    toastContainer: document.getElementById('toast-container'),
    chatTriggers: document.querySelectorAll('.chat-trigger'),
    aiChatPanel: document.getElementById('ai-chat-panel')
};

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initWishlist();
    initSearchAndFilters();
    initBeforeAfterSlider();
    initAppointmentBooking();
    initSwiperReviews();
    initGalleryFilter();
    initNavbarScroll();
    initScrollTop();
    initLiveStockCounters();
    initRecommendedProducts();
    
    // Lucide Icon activation
    lucide.createIcons();
    
    // Wire up events
    setupEventListeners();
    
    // Initial display
    renderProducts();
});

// --- Theme Controller ---
function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
        document.body.classList.add('dark');
        AppState.theme = 'dark';
    } else {
        document.body.classList.remove('dark');
        AppState.theme = 'light';
    }
}

function toggleTheme() {
    document.body.classList.toggle('dark');
    AppState.theme = document.body.classList.contains('dark') ? 'dark' : 'light';
    localStorage.setItem('theme', AppState.theme);
    
    // Emit toast for premium feel
    showToast(`Switched to ${AppState.theme.toUpperCase()} mode`, 'success');
}

// --- Wishlist Management ---
function initWishlist() {
    const savedWishlist = localStorage.getItem('wishlist');
    if (savedWishlist) {
        try {
            AppState.wishlist = JSON.parse(savedWishlist);
        } catch (e) {
            AppState.wishlist = [];
        }
    }
    updateWishlistBadge();
}

function updateWishlistBadge() {
    if (DOM.wishlistBadge) {
        DOM.wishlistBadge.textContent = AppState.wishlist.length;
        if (AppState.wishlist.length > 0) {
            DOM.wishlistBadge.classList.remove('hidden');
        } else {
            DOM.wishlistBadge.classList.add('hidden');
        }
    }
}

function toggleWishlist(productId) {
    const index = AppState.wishlist.findIndex(item => item.id === productId);
    const product = PIECES.find(item => item.id === productId);
    
    if (index === -1) {
        AppState.wishlist.push(product);
        showToast(`Added ${product.name} to wishlist`, 'success');
    } else {
        AppState.wishlist.splice(index, 1);
        showToast(`Removed ${product.name} from wishlist`, 'info');
    }
    
    localStorage.setItem('wishlist', JSON.stringify(AppState.wishlist));
    updateWishlistBadge();
    renderProducts();
    renderWishlistDrawer();
    initRecommendedProducts(); // refresh recommendations based on favorites
    
    // Highlight hearts on page
    const heartBtns = document.querySelectorAll(`.wishlist-btn[data-id="${productId}"]`);
    heartBtns.forEach(btn => {
        btn.classList.toggle('active', index === -1);
    });
}

function renderWishlistDrawer() {
    if (!DOM.wishlistItemsContainer) return;
    
    if (AppState.wishlist.length === 0) {
        DOM.wishlistItemsContainer.innerHTML = `<p class="empty-wishlist-msg">Your wishlist is currently empty. Start hearting items in our collection!</p>`;
        DOM.wishlistConsultBtn.classList.add('hidden');
        return;
    }
    
    DOM.wishlistConsultBtn.classList.remove('hidden');
    DOM.wishlistItemsContainer.innerHTML = AppState.wishlist.map(item => `
        <div class="wish-item">
            <div class="placeholder-gallery-img wish-item-img" style="background-image: radial-gradient(circle, #4e342e, #1a0f0a); width: 80px; height: 80px;"></div>
            <div class="wish-item-details">
                <span class="wish-item-name">${item.name}</span>
                <span class="wish-item-price">₹${item.price.toLocaleString('en-IN')}</span>
            </div>
            <button class="icon-btn remove-wish-btn" onclick="toggleWishlist('${item.id}')" aria-label="Remove item">
                <i data-lucide="trash-2"></i>
            </button>
            <button class="btn btn-outline btn-sm" onclick="launch3DViewer('${item.id}')" style="align-self: center; margin-left: 8px;">3D View</button>
        </div>
    `).join('');
    
    lucide.createIcons();
}

// --- Smart Search & Filters ---
function initSearchAndFilters() {
    if (DOM.productSearchInput) {
        DOM.productSearchInput.addEventListener('input', (e) => {
            AppState.activeFilters.query = e.target.value.toLowerCase();
            triggerFilterSearchWithLoader();
        });
    }
    
    const filterSelectors = [DOM.filterCategory, DOM.filterWood, DOM.filterPrice];
    filterSelectors.forEach(sel => {
        if (sel) {
            sel.addEventListener('change', () => {
                AppState.activeFilters.category = DOM.filterCategory.value;
                AppState.activeFilters.wood = DOM.filterWood.value;
                AppState.activeFilters.price = DOM.filterPrice.value;
                triggerFilterSearchWithLoader();
            });
        }
    });
    
    if (DOM.clearFiltersBtn) {
        DOM.clearFiltersBtn.addEventListener('click', () => {
            if (DOM.productSearchInput) DOM.productSearchInput.value = '';
            if (DOM.filterCategory) DOM.filterCategory.value = 'all';
            if (DOM.filterWood) DOM.filterWood.value = 'all';
            if (DOM.filterPrice) DOM.filterPrice.value = 'all';
            
            AppState.activeFilters = { query: '', category: 'all', wood: 'all', price: 'all' };
            triggerFilterSearchWithLoader();
        });
    }
}

function triggerFilterSearchWithLoader() {
    // Show Shimmer Skeletons
    DOM.productGrid.innerHTML = `
        <div class="skeleton-card"><div class="skeleton-img"></div><div class="skeleton-text"></div><div class="skeleton-text short"></div></div>
        <div class="skeleton-card"><div class="skeleton-img"></div><div class="skeleton-text"></div><div class="skeleton-text short"></div></div>
        <div class="skeleton-card"><div class="skeleton-img"></div><div class="skeleton-text"></div><div class="skeleton-text short"></div></div>
    `;
    
    // Simulate premium loader delay
    setTimeout(() => {
        renderProducts();
    }, 700);
}

function renderProducts() {
    if (!DOM.productGrid) return;
    
    const filtered = PIECES.filter(prod => {
        const matchesQuery = prod.name.toLowerCase().includes(AppState.activeFilters.query) ||
                             prod.wood.toLowerCase().includes(AppState.activeFilters.query) ||
                             prod.category.toLowerCase().includes(AppState.activeFilters.query) ||
                             prod.material.toLowerCase().includes(AppState.activeFilters.query);
                             
        const matchesCategory = AppState.activeFilters.category === 'all' || prod.category === AppState.activeFilters.category;
        const matchesWood = AppState.activeFilters.wood === 'all' || prod.wood === AppState.activeFilters.wood;
        
        let matchesPrice = true;
        if (AppState.activeFilters.price !== 'all') {
            const maxVal = parseInt(AppState.activeFilters.price);
            matchesPrice = prod.price <= maxVal;
        }
        
        return matchesQuery && matchesCategory && matchesWood && matchesPrice;
    });
    
    if (filtered.length === 0) {
        DOM.productGrid.innerHTML = `
            <div class="no-results" style="grid-column: 1/-1; text-align: center; padding: 60px 0;">
                <i data-lucide="search-code" style="width: 48px; height: 48px; color: var(--text-secondary); margin-bottom: 16px;"></i>
                <h3>No masterpieces match your filters</h3>
                <p style="color: var(--text-secondary);">Try clearing your search query or adjusting your material and wood selections.</p>
            </div>
        `;
        lucide.createIcons();
        return;
    }
    
    DOM.productGrid.innerHTML = filtered.map(prod => {
        const isFav = AppState.wishlist.some(item => item.id === prod.id);
        const hasLowStock = prod.stock <= 4;
        
        return `
            <div class="product-card" data-id="${prod.id}">
                <div class="product-img-wrapper">
                    <div class="placeholder-gallery-img" style="background-image: radial-gradient(circle, #5d4037, #1a0f0a); width: 100%; height: 100%; position: absolute;"></div>
                    ${prod.isNew ? `<span class="product-tag">New Design</span>` : ''}
                    ${hasLowStock ? `<span class="stock-tag-alert" id="stock-badge-${prod.id}">Only ${prod.stock} Left 🔥</span>` : ''}
                    
                    <button class="icon-btn wishlist-btn ${isFav ? 'active' : ''}" data-id="${prod.id}" onclick="toggleWishlist('${prod.id}')" aria-label="Add to Wishlist">
                        <i data-lucide="heart" style="fill: ${isFav ? 'currentColor' : 'transparent'};"></i>
                    </button>
                </div>
                
                <div class="product-info">
                    <span class="product-category">${prod.wood} • ${prod.category}</span>
                    <h3 class="product-name">${prod.name}</h3>
                    
                    <div class="product-details">
                        <div>Material: ${prod.material.split('+')[0]}</div>
                        <div>Finish: Hardwax Oil</div>
                    </div>
                    
                    <div class="product-footer">
                        <div class="product-price">₹${prod.price.toLocaleString('en-IN')}</div>
                        <button class="btn btn-outline btn-sm" onclick="launch3DViewer('${prod.id}')">
                            <i data-lucide="rotate-3d"></i> 3D Preview
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    lucide.createIcons();
}

// --- Personalized Recommendation Engine ---
function initRecommendedProducts() {
    if (!DOM.recommendedGrid) return;
    
    // Choose products based on wishlist category, otherwise default to first few
    let recommendations = [];
    if (AppState.wishlist.length > 0) {
        const likedCats = AppState.wishlist.map(i => i.category);
        recommendations = PIECES.filter(p => likedCats.includes(p.category) && !AppState.wishlist.some(w => w.id === p.id));
    }
    
    // Fill up to 3 recommendations if not enough
    if (recommendations.length < 3) {
        const existingIds = recommendations.concat(AppState.wishlist).map(p => p.id);
        const fillers = PIECES.filter(p => !existingIds.includes(p.id));
        recommendations = recommendations.concat(fillers).slice(0, 4);
    }
    
    DOM.recommendedGrid.innerHTML = recommendations.map(prod => `
        <div class="product-card" style="width: 280px; flex-shrink: 0;">
            <div class="product-img-wrapper" style="padding-bottom: 60%;">
                <div class="placeholder-gallery-img" style="background-image: radial-gradient(circle, #3e2723, #110906); width: 100%; height: 100%; position: absolute;"></div>
            </div>
            <div class="product-info" style="padding: 16px;">
                <span class="product-category" style="font-size: 0.75rem;">${prod.wood}</span>
                <h3 class="product-name" style="font-size: 1.1rem; margin-bottom: 8px;">${prod.name}</h3>
                <div class="product-footer" style="padding-top: 8px;">
                    <div class="product-price" style="font-size: 1.1rem;">₹${prod.price.toLocaleString('en-IN')}</div>
                    <button class="btn btn-outline btn-sm" onclick="launch3DViewer('${prod.id}')" style="padding: 6px 12px; font-size: 0.75rem;">
                        3D View
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// --- Before & After Comparison Slider ---
function initBeforeAfterSlider() {
    if (!DOM.sliderContainer) return;
    
    let isSliding = false;
    
    const startSlide = () => { isSliding = true; };
    const stopSlide = () => { isSliding = false; };
    
    const slideMove = (clientX) => {
        if (!isSliding) return;
        
        const rect = DOM.sliderContainer.getBoundingClientRect();
        const offsetX = clientX - rect.left;
        let percentage = (offsetX / rect.width) * 100;
        
        if (percentage < 0) percentage = 0;
        if (percentage > 100) percentage = 100;
        
        DOM.sliderAfterClip.style.width = `${percentage}%`;
        DOM.sliderDragHandle.style.left = `${percentage}%`;
        
        // Ensure clipped image scales naturally by keeping a fixed absolute width matching the container size
        const img = DOM.sliderAfterClip.querySelector('img');
        if (img) {
            img.style.width = `${rect.width}px`;
        }
    };
    
    // Mouse Events
    DOM.sliderDragHandle.addEventListener('mousedown', startSlide);
    DOM.sliderContainer.addEventListener('mousedown', startSlide);
    window.addEventListener('mouseup', stopSlide);
    window.addEventListener('mousemove', (e) => slideMove(e.clientX));
    
    // Touch Events (Mobile)
    DOM.sliderDragHandle.addEventListener('touchstart', startSlide);
    DOM.sliderContainer.addEventListener('touchstart', startSlide);
    window.addEventListener('touchend', stopSlide);
    window.addEventListener('touchmove', (e) => {
        if (e.touches && e.touches.length > 0) {
            slideMove(e.touches[0].clientX);
        }
    });
    
    // Handle Window Resize to keep alignment
    window.addEventListener('resize', () => {
        const rect = DOM.sliderContainer.getBoundingClientRect();
        const img = DOM.sliderAfterClip.querySelector('img');
        if (img) {
            img.style.width = `${rect.width}px`;
        }
    });
}

// --- Appointment Booking Form ---
function initAppointmentBooking() {
    if (!DOM.bookingDateInput) return;
    
    // Initialize Flatpickr calendar
    flatpickr(DOM.bookingDateInput, {
        enableTime: true,
        dateFormat: "Y-m-d h:i K",
        minDate: "today",
        time_24hr: false,
        theme: AppState.theme === 'dark' ? 'dark' : 'default',
        onChange: function(selectedDates, dateStr, instance) {
            // Apply dates
        }
    });
    
    if (DOM.bookingForm) {
        DOM.bookingForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const submitBtn = DOM.bookingForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = 'Registering Appointment...';
            
            setTimeout(() => {
                DOM.bookingForm.classList.add('hidden');
                DOM.bookingSuccess.classList.remove('hidden');
                showToast("Design consultation booked successfully!", "success");
            }, 1200);
        });
    }
}

// --- Testimonials Swiper ---
function initSwiperReviews() {
    new Swiper('.review-swiper', {
        loop: true,
        autoplay: {
            delay: 4500,
            disableOnInteraction: false,
        },
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        on: {
            slideChange: function() {
                // Restart rating pulse animations on active slide
                const stars = document.querySelectorAll('.review-slide .rating-stars');
                stars.forEach(s => s.classList.remove('animate-stars'));
                setTimeout(() => {
                    const activeSlideStars = document.querySelector('.swiper-slide-active .rating-stars');
                    if (activeSlideStars) {
                        activeSlideStars.classList.add('animate-stars');
                    }
                }, 50);
            }
        }
    });
}

// --- Pinterest Gallery Categories Filter ---
function initGalleryFilter() {
    const filterButtons = document.querySelectorAll('.gallery-tab-btn');
    const galleryItems = document.querySelectorAll('.masonry-item');
    
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const category = btn.getAttribute('data-gallery-filter');
            
            galleryItems.forEach(item => {
                const itemType = item.getAttribute('data-space-type');
                if (category === 'all' || itemType === category) {
                    item.style.display = 'block';
                    // Trigger simple entrance animation via GSAP
                    gsap.fromTo(item, { opacity: 0, scale: 0.95 }, { opacity: 1, scale: 1, duration: 0.4 });
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });
}

// --- Sticky Navigation & Scroll Fade-in Effects ---
function initNavbarScroll() {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            DOM.navbar.classList.add('scrolled');
        } else {
            DOM.navbar.classList.remove('scrolled');
        }
    });
}

// --- Scroll up to top animation and logic ---
function initScrollTop() {
    const scrollTopBtn = document.getElementById('scroll-top-btn');
    if (!scrollTopBtn) return;
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 400) {
            scrollTopBtn.classList.add('show');
        } else {
            scrollTopBtn.classList.remove('show');
        }
    });
    
    scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// --- Live Stock Counter Increment/Decrement Simulator ---
function initLiveStockCounters() {
    // Randomly decrements product stock every 12 seconds to create urgency
    setInterval(() => {
        const eligible = PIECES.filter(p => p.stock > 1);
        if (eligible.length === 0) return;
        
        const randomProduct = eligible[Math.floor(Math.random() * eligible.length)];
        randomProduct.stock--;
        
        // Update product card UI badge
        const badge = document.getElementById(`stock-badge-${randomProduct.id}`);
        if (badge) {
            badge.textContent = `Only ${randomProduct.stock} Left 🔥`;
            badge.style.animation = 'none';
            // Trigger reflow to restart animation
            void badge.offsetWidth;
            badge.style.animation = 'heartBeat 0.5s ease 2';
        }
        
        // Render collection to capture new stock numbers
        renderProducts();
        
        // Show flash toast notification
        if (Math.random() > 0.4) {
            showToast(`🔥 Flash Demand: A patron reserved one [${randomProduct.name}]!`, 'info');
        }
    }, 15000);
}

// --- Toast System ---
function showToast(message, type = 'success') {
    if (!DOM.toastContainer) return;
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let iconName = 'sparkles';
    if (type === 'danger') iconName = 'alert-triangle';
    if (type === 'info') iconName = 'flame';
    
    toast.innerHTML = `
        <i data-lucide="${iconName}"></i>
        <span>${message}</span>
    `;
    
    DOM.toastContainer.appendChild(toast);
    lucide.createIcons();
    
    // Animate removal
    setTimeout(() => {
        toast.style.animation = 'fadeInUp 0.3s reverse forwards';
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3500);
}

// --- Shared Event Listeners ---
function setupEventListeners() {
    // Theme Switcher
    if (DOM.themeToggleBtn) {
        DOM.themeToggleBtn.addEventListener('click', toggleTheme);
    }
    
    // Wishlist Toggle Slider
    if (DOM.wishlistToggleBtn) {
        DOM.wishlistToggleBtn.addEventListener('click', () => {
            renderWishlistDrawer();
            DOM.wishlistDrawer.classList.add('open');
        });
    }
    
    if (DOM.wishlistCloseBtn) {
        DOM.wishlistCloseBtn.addEventListener('click', () => {
            DOM.wishlistDrawer.classList.remove('open');
        });
    }
    
    if (DOM.wishlistDrawerOverlay) {
        DOM.wishlistDrawerOverlay.addEventListener('click', () => {
            DOM.wishlistDrawer.classList.remove('open');
        });
    }
    
    if (DOM.closeDrawerAction) {
        DOM.closeDrawerAction.addEventListener('click', () => {
            DOM.wishlistDrawer.classList.remove('open');
        });
    }
    
    // Mobile Navigation Drawer Toggle
    if (DOM.mobileMenuToggle) {
        DOM.mobileMenuToggle.addEventListener('click', () => {
            DOM.navMenu.classList.toggle('open');
            const icon = DOM.mobileMenuToggle.querySelector('i');
            if (DOM.navMenu.classList.contains('open')) {
                icon.setAttribute('data-lucide', 'x');
            } else {
                icon.setAttribute('data-lucide', 'menu');
            }
            lucide.createIcons();
        });
    }
    
    // Close mobile menu on navlink click
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            DOM.navMenu.classList.remove('open');
            const icon = DOM.mobileMenuToggle.querySelector('i');
            if (icon) {
                icon.setAttribute('data-lucide', 'menu');
                lucide.createIcons();
            }
            
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });

    // Wishlist AI Consult Trigger
    if (DOM.wishlistConsultBtn) {
        DOM.wishlistConsultBtn.addEventListener('click', () => {
            DOM.wishlistDrawer.classList.remove('open');
            openAIChatDrawer();
            
            const wishlistNames = AppState.wishlist.map(i => i.name).join(', ');
            sendAssistantMessage(`I have these items in my wishlist: ${wishlistNames}. Can you tell me if they go well together and what sizes would be appropriate for a medium room?`);
        });
    }
}

// Helper to bridge app actions to chatbot drawer
function openAIChatDrawer() {
    if (DOM.aiChatPanel) {
        DOM.aiChatPanel.classList.remove('collapsed');
    }
}
