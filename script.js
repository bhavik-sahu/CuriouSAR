// Enhanced SAR Observatory Interactive Script
// Author: SAR Earth Observatory Team
// Version: 2.0

class SARObservatory {
    constructor() {
        this.init();
    }

    init() {
        this.initScrollAnimations();
        this.initBeforeAfterSlider();
        this.initNavigation();
        this.initSmoothScrolling();
        this.initPerformanceOptimizations();
        this.initAccessibilityFeatures();
        console.log('🛰️ SAR Observatory initialized successfully');
    }

    // Scroll-triggered animations with performance optimization
    initScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    
                    // Trigger specific animations based on section type
                    this.triggerSectionSpecificAnimations(entry.target);
                }
            });
        }, observerOptions);

        // Observe all sections
        const sections = document.querySelectorAll('section');
        sections.forEach(section => {
            observer.observe(section);
        });

        // Observe cards and other elements
        const cards = document.querySelectorAll('.method-card, .finding-card, .timeline-item');
        cards.forEach((card, index) => {
            card.style.transitionDelay = `${index * 0.1}s`;
            observer.observe(card);
        });
    }

    triggerSectionSpecificAnimations(section) {
        // Add specific animations based on section ID
        const sectionId = section.id;
        
        switch(sectionId) {
            case 'methodology':
                this.animateMethodologyCards();
                break;
            case 'findings':
                this.animateCounters();
                break;
            case 'timeline':
                this.animateTimeline();
                break;
        }
    }

    // Perfect Before/After Slider with advanced features - Multi-slider support
    initBeforeAfterSlider() {
        const sliders = document.querySelectorAll('.comparison-slider');
        if (!sliders.length) return;

        // Initialize each slider independently
        sliders.forEach((slider, index) => this.initSingleSlider(slider, index));
    }
    
    initSingleSlider(slider, sliderIndex) {
        const sliderWrapper = slider.querySelector('.slider-wrapper');
        const handle = slider.querySelector('.slider-handle');
        const afterImage = slider.querySelector('.slider-after');
        const beforeLabel = slider.querySelector('.label-before');
        const afterLabel = slider.querySelector('.label-after');
        const handleButton = slider.querySelector('.handle-button');
        
        if (!sliderWrapper || !handle || !afterImage) return;

        let isDragging = false;
        let currentPosition = 50; // Start at 50%
        let animationFrame = null;
        let startX = 0;
        let velocity = 0;
        let lastTime = 0;
        let lastPosition = 50;
        
        // Smooth position interpolation for better performance
        const lerp = (start, end, factor) => start + (end - start) * factor;
        
        // Optimized update with RAF for smooth animations
        const updateSliderPosition = (targetPosition, smooth = false) => {
            const clampedPosition = Math.max(1, Math.min(99, targetPosition));
            
            if (animationFrame) {
                cancelAnimationFrame(animationFrame);
            }
            
            const animate = () => {
                currentPosition = smooth ? 
                    lerp(currentPosition, clampedPosition, 0.15) : 
                    clampedPosition;
                
                // Use transform3d for hardware acceleration
                handle.style.transform = `translate3d(${currentPosition - 50}%, -50%, 0)`;
                handle.style.left = '50%';
                
                // Update clip-path with GPU acceleration
                afterImage.style.clipPath = `inset(0 ${100 - currentPosition}% 0 0)`;
                
                // Update ARIA value
                handle.setAttribute('aria-valuenow', Math.round(currentPosition));
                
                // Update label visibility with smooth transitions (extended visibility range)
                const beforeOpacity = currentPosition < 5 ? 0 : currentPosition < 15 ? (currentPosition - 5) / 10 : 1;
                const afterOpacity = currentPosition > 95 ? 0 : currentPosition > 85 ? (95 - currentPosition) / 10 : 1;
                
                if (beforeLabel) {
                    beforeLabel.style.opacity = beforeOpacity;
                    beforeLabel.style.transform = `translateX(${Math.max(0, 15 - currentPosition)}px)`;
                }
                if (afterLabel) {
                    afterLabel.style.opacity = afterOpacity;
                    afterLabel.style.transform = `translateX(${Math.min(0, 85 - currentPosition)}px)`;
                }
                
                // Handle button scale effect
                if (handleButton) {
                    const scale = isDragging ? 1.2 : 1;
                    handleButton.style.transform = `scale(${scale})`;
                }
                
                // Continue animation if smooth and not close enough
                if (smooth && Math.abs(currentPosition - clampedPosition) > 0.1) {
                    animationFrame = requestAnimationFrame(animate);
                }
            };
            
            animationFrame = requestAnimationFrame(animate);
        };

        // Enhanced position calculation with sub-pixel precision
        const getPositionFromEvent = (e) => {
            const rect = sliderWrapper.getBoundingClientRect();
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const relativeX = clientX - rect.left;
            return Math.max(0, Math.min(100, (relativeX / rect.width) * 100));
        };
        
        // Velocity calculation for momentum
        const calculateVelocity = (position, time) => {
            if (lastTime === 0) {
                lastTime = time;
                lastPosition = position;
                return 0;
            }
            
            const deltaTime = time - lastTime;
            const deltaPosition = position - lastPosition;
            velocity = deltaTime > 0 ? deltaPosition / deltaTime : 0;
            
            lastTime = time;
            lastPosition = position;
            return velocity;
        };

        // Mouse events with enhanced interaction
        const handleMouseDown = (e) => {
            e.preventDefault();
            isDragging = true;
            startX = e.clientX;
            velocity = 0;
            lastTime = performance.now();
            lastPosition = currentPosition;
            
            handle.style.cursor = 'grabbing';
            document.body.style.userSelect = 'none';
            document.body.style.cursor = 'grabbing';
            
            // Add visual feedback
            handle.classList.add('dragging');
            sliderWrapper.classList.add('dragging');
        };

        const handleMouseMove = (e) => {
            if (!isDragging) return;
            e.preventDefault();
            
            const position = getPositionFromEvent(e);
            calculateVelocity(position, performance.now());
            updateSliderPosition(position);
        };

        const handleMouseUp = () => {
            if (!isDragging) return;
            
            isDragging = false;
            handle.style.cursor = 'ew-resize';
            document.body.style.userSelect = '';
            document.body.style.cursor = '';
            
            // Remove visual feedback
            handle.classList.remove('dragging');
            sliderWrapper.classList.remove('dragging');
            
            // Apply momentum if velocity is significant
            if (Math.abs(velocity) > 0.1) {
                const momentum = velocity * 10;
                const targetPosition = currentPosition + momentum;
                updateSliderPosition(targetPosition, true);
            }
        };

        // Touch events with improved handling
        const handleTouchStart = (e) => {
            e.preventDefault();
            isDragging = true;
            startX = e.touches[0].clientX;
            velocity = 0;
            lastTime = performance.now();
            lastPosition = currentPosition;
            
            handle.classList.add('dragging');
            sliderWrapper.classList.add('dragging');
        };

        const handleTouchMove = (e) => {
            if (!isDragging) return;
            e.preventDefault();
            
            const position = getPositionFromEvent(e);
            calculateVelocity(position, performance.now());
            updateSliderPosition(position);
        };

        const handleTouchEnd = () => {
            if (!isDragging) return;
            
            isDragging = false;
            handle.classList.remove('dragging');
            sliderWrapper.classList.remove('dragging');
            
            // Apply momentum for touch
            if (Math.abs(velocity) > 0.2) {
                const momentum = velocity * 15;
                const targetPosition = currentPosition + momentum;
                updateSliderPosition(targetPosition, true);
            }
        };

        // Event listeners
        handle.addEventListener('mousedown', handleMouseDown);
        document.addEventListener('mousemove', handleMouseMove, { passive: false });
        document.addEventListener('mouseup', handleMouseUp);
        
        handle.addEventListener('touchstart', handleTouchStart, { passive: false });
        document.addEventListener('touchmove', handleTouchMove, { passive: false });
        document.addEventListener('touchend', handleTouchEnd);

        // Click to position with smooth animation
        sliderWrapper.addEventListener('click', (e) => {
            if (e.target === handle || handle.contains(e.target) || isDragging) return;
            
            const position = getPositionFromEvent(e);
            updateSliderPosition(position, true);
            
            // Visual click feedback
            const ripple = document.createElement('div');
            ripple.style.cssText = `
                position: absolute;
                width: 20px;
                height: 20px;
                border-radius: 50%;
                background: rgba(0, 212, 255, 0.4);
                pointer-events: none;
                transform: translate(-50%, -50%) scale(0);
                animation: ripple 0.6s ease-out;
                left: ${e.offsetX}px;
                top: ${e.offsetY}px;
            `;
            sliderWrapper.appendChild(ripple);
            setTimeout(() => ripple.remove(), 600);
        });

        // Enhanced keyboard accessibility
        handle.addEventListener('keydown', (e) => {
            let newPosition = currentPosition;
            let smooth = false;
            
            switch(e.key) {
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    newPosition -= e.shiftKey ? 1 : 5;
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    newPosition += e.shiftKey ? 1 : 5;
                    break;
                case 'Home':
                    newPosition = 1;
                    smooth = true;
                    break;
                case 'End':
                    newPosition = 99;
                    smooth = true;
                    break;
                case ' ':
                case 'Enter':
                    // Reset to center
                    newPosition = 50;
                    smooth = true;
                    break;
                default:
                    return;
            }
            
            e.preventDefault();
            updateSliderPosition(newPosition, smooth);
            
            // Visual feedback for keyboard interaction
            handle.style.boxShadow = '0 0 0 3px rgba(0, 212, 255, 0.5)';
            setTimeout(() => {
                handle.style.boxShadow = '';
            }, 200);
        });

        // Enhanced accessibility attributes
        handle.setAttribute('tabindex', '0');
        handle.setAttribute('role', 'slider');
        handle.setAttribute('aria-label', 'Compare before and after SAR images - Use arrow keys or drag to compare');
        handle.setAttribute('aria-valuemin', '0');
        handle.setAttribute('aria-valuemax', '100');
        handle.setAttribute('aria-valuenow', '50');
        handle.setAttribute('aria-orientation', 'horizontal');
        handle.setAttribute('aria-describedby', 'slider-instructions');
        
        // Add instructions for screen readers
        const instructions = slider.querySelector('.slider-instructions');
        if (instructions) {
            instructions.id = 'slider-instructions';
        }

        // Auto-play demonstration (optional)
        let autoPlayTimeout;
        const startAutoPlay = () => {
            let direction = 1;
            let autoPosition = currentPosition;
            
            const animate = () => {
                autoPosition += direction * 0.5;
                if (autoPosition >= 90) direction = -1;
                if (autoPosition <= 10) direction = 1;
                
                updateSliderPosition(autoPosition);
                autoPlayTimeout = setTimeout(animate, 50);
            };
            
            autoPlayTimeout = setTimeout(animate, 2000);
        };
        
        const stopAutoPlay = () => {
            if (autoPlayTimeout) {
                clearTimeout(autoPlayTimeout);
                autoPlayTimeout = null;
            }
        };
        
        // Stop auto-play on interaction
        const stopAutoPlayEvents = ['mousedown', 'touchstart', 'keydown', 'click'];
        stopAutoPlayEvents.forEach(event => {
            slider.addEventListener(event, stopAutoPlay);
        });

        // Intersection Observer for auto-play when in view
        const sliderObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !isDragging) {
                    // Start auto-play after a delay if user hasn't interacted
                    setTimeout(() => {
                        if (!autoPlayTimeout && !isDragging) {
                            startAutoPlay();
                        }
                    }, 3000);
                } else {
                    stopAutoPlay();
                }
            });
        }, { threshold: 0.5 });
        
        sliderObserver.observe(slider);

        // Initialize position with smooth entry animation
        setTimeout(() => {
            updateSliderPosition(50, true);
        }, 500);

        // Responsive handling
        const handleResize = this.debounce(() => {
            updateSliderPosition(currentPosition);
        }, 100);
        
        window.addEventListener('resize', handleResize);
        
        // Cleanup function
        return () => {
            stopAutoPlay();
            sliderObserver.disconnect();
            window.removeEventListener('resize', handleResize);
        };
    }

    // Enhanced Navigation with smooth scrolling and active states
    initNavigation() {
        const navbar = document.querySelector('.navbar');
        const navLinks = document.querySelectorAll('.nav-link');
        const sections = document.querySelectorAll('section[id]');
        
        if (!navbar) return;

        // Navbar scroll effect
        let lastScrollY = window.scrollY;
        
        window.addEventListener('scroll', () => {
            const scrollY = window.scrollY;
            
            // Add/remove scrolled class for navbar styling
            if (scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
            
            // Hide/show navbar on scroll direction
            if (scrollY > lastScrollY && scrollY > 100) {
                navbar.style.transform = 'translateY(-100%)';
            } else {
                navbar.style.transform = 'translateY(0)';
            }
            
            lastScrollY = scrollY;
            
            // Update active nav link
            this.updateActiveNavLink();
        }, { passive: true });

        // Mobile menu toggle
        const navToggle = document.querySelector('.nav-toggle');
        const navMenu = document.querySelector('.nav-menu');
        
        if (navToggle && navMenu) {
            navToggle.addEventListener('click', () => {
                navMenu.classList.toggle('active');
                navToggle.classList.toggle('active');
            });
        }
    }

    updateActiveNavLink() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-link');
        let currentSection = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.offsetHeight;
            
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                currentSection = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSection}`) {
                link.classList.add('active');
            }
        });
    }

    // Smooth scrolling for navigation links
    initSmoothScrolling() {
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href^="#"]');
            if (!link) return;
            
            const targetId = link.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                e.preventDefault();
                
                const offsetTop = targetSection.offsetTop - 70; // Account for navbar height
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
                
                // Close mobile menu if open
                const navMenu = document.querySelector('.nav-menu');
                const navToggle = document.querySelector('.nav-toggle');
                if (navMenu && navToggle) {
                    navMenu.classList.remove('active');
                    navToggle.classList.remove('active');
                }
            }
        });
    }

    // Methodology cards animation
    animateMethodologyCards() {
        const cards = document.querySelectorAll('.method-card');
        cards.forEach((card, index) => {
            setTimeout(() => {
                card.style.transform = 'translateY(0)';
                card.style.opacity = '1';
            }, index * 200);
        });
    }

    // Counter animation for findings
    animateCounters() {
        const counters = document.querySelectorAll('.finding-value');
        
        counters.forEach(counter => {
            const target = counter.textContent;
            const isPercentage = target.includes('%');
            const isCorrelation = target.includes('r =');
            const numericValue = parseFloat(target.replace(/[^\d.-]/g, ''));
            
            if (isNaN(numericValue)) return;
            
            let currentValue = 0;
            const increment = numericValue / 50; // 50 frames
            const timer = setInterval(() => {
                currentValue += increment;
                
                if (currentValue >= numericValue) {
                    currentValue = numericValue;
                    clearInterval(timer);
                }
                
                let displayValue;
                if (isPercentage) {
                    displayValue = Math.round(currentValue) + '%';
                } else if (isCorrelation) {
                    displayValue = 'r = ' + currentValue.toFixed(2);
                } else {
                    displayValue = Math.round(currentValue).toLocaleString();
                }
                
                counter.textContent = displayValue;
            }, 50);
        });
    }

    // Timeline animation
    animateTimeline() {
        const timelineItems = document.querySelectorAll('.timeline-item');
        
        timelineItems.forEach((item, index) => {
            setTimeout(() => {
                item.classList.add('animate-in');
            }, index * 300);
        });
    }

    // Performance optimizations
    initPerformanceOptimizations() {
        // Debounce scroll events
        let scrollTimeout;
        const originalScrollHandler = window.onscroll;
        
        window.addEventListener('scroll', () => {
            if (scrollTimeout) {
                clearTimeout(scrollTimeout);
            }
            scrollTimeout = setTimeout(() => {
                if (originalScrollHandler) originalScrollHandler();
            }, 16); // ~60fps
        }, { passive: true });

        // Lazy load images
        this.initLazyLoading();
        
        // Prefetch resources
        this.prefetchResources();
    }

    // Lazy loading for images
    initLazyLoading() {
        const images = document.querySelectorAll('img[data-src]');
        
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
    }

    // Prefetch critical resources
    prefetchResources() {
        const criticalImages = [
            'images/pre.jpg',
            'images/mid.jpg'
        ];
        
        criticalImages.forEach(src => {
            const link = document.createElement('link');
            link.rel = 'prefetch';
            link.href = src;
            document.head.appendChild(link);
        });
    }

    // Accessibility features
    initAccessibilityFeatures() {
        // Keyboard navigation for interactive elements
        const interactiveElements = document.querySelectorAll('.method-card, .finding-card, .stat-item');
        
        interactiveElements.forEach(element => {
            element.setAttribute('tabindex', '0');
            
            element.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    element.click();
                }
            });
        });

        // Reduce motion for users who prefer it
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            document.body.classList.add('reduce-motion');
        }

        // High contrast mode detection
        if (window.matchMedia('(prefers-contrast: high)').matches) {
            document.body.classList.add('high-contrast');
        }

        // Add skip link for screen readers
        this.addSkipLink();
    }

    // Add skip navigation link
    addSkipLink() {
        const skipLink = document.createElement('a');
        skipLink.href = '#hero';
        skipLink.textContent = 'Skip to main content';
        skipLink.className = 'skip-link';
        skipLink.style.cssText = `
            position: absolute;
            top: -40px;
            left: 6px;
            background: var(--accent-blue);
            color: white;
            padding: 8px;
            border-radius: 4px;
            text-decoration: none;
            z-index: 1001;
            transition: top 0.3s;
        `;
        
        skipLink.addEventListener('focus', () => {
            skipLink.style.top = '6px';
        });
        
        skipLink.addEventListener('blur', () => {
            skipLink.style.top = '-40px';
        });
        
        document.body.insertBefore(skipLink, document.body.firstChild);
    }

    // Utility method for debouncing
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Method to handle errors gracefully
    handleError(error, context) {
        console.error(`SAR Observatory Error in ${context}:`, error);
        // Could send to error tracking service in production
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        new SARObservatory();
    } catch (error) {
        console.error('Failed to initialize SAR Observatory:', error);
    }
});

// Handle page visibility changes for performance
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Pause animations when page is not visible
        document.body.classList.add('page-hidden');
    } else {
        // Resume animations when page becomes visible
        document.body.classList.remove('page-hidden');
    }
});

// Service Worker registration for PWA capabilities (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}
