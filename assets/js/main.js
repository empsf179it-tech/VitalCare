/* ==========================================================================
   VITALCARE - MAIN JAVASCRIPT
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Reduced Motion Check
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 2. Sticky Navbar & Scroll State
    const navbar = document.getElementById('navbar');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        updateActiveNavLink();
    });

    // 3. Mobile Menu Toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const mobileMenu = document.querySelector('.mobile-menu');
    const mobileLinks = document.querySelectorAll('.mobile-link');
    
    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            mobileMenu.classList.toggle('active');
            document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
        });

        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                menuToggle.classList.remove('active');
                mobileMenu.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }

    // 4. Smooth Scrolling & Active Navigation State
    const navLinksDesktop = document.querySelectorAll('.nav-link');
    
    // Set active link based on scroll position
    function updateActiveNavLink() {
        let fromTop = window.scrollY + 100; // Offset for navbar

        navLinksDesktop.forEach(link => {
            let section = document.querySelector(link.hash);
            
            if (section) {
                if (
                    section.offsetTop <= fromTop &&
                    section.offsetTop + section.offsetHeight > fromTop
                ) {
                    link.classList.add('active');
                } else {
                    link.classList.remove('active');
                }
            }
        });
    }

    // Smooth scroll functionality is handled natively by CSS scroll-behavior: smooth
    // We just need to handle the click to close mobile menu (done above)

    // 5. Scroll Reveal Animations (Intersection Observer)
    const revealElements = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');
    
    if ('IntersectionObserver' in window && !prefersReducedMotion) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    
                    // If it's a counter, trigger the counter animation
                    if (entry.target.querySelector('.counter') || entry.target.classList.contains('counter')) {
                        const counters = entry.target.querySelectorAll('.counter').length > 0 
                            ? entry.target.querySelectorAll('.counter') 
                            : [entry.target];
                            
                        startCounters(counters);
                    }
                    
                    observer.unobserve(entry.target);
                }
            });
        }, {
            root: null,
            threshold: 0.15,
            rootMargin: "0px 0px -50px 0px"
        });

        revealElements.forEach(el => revealObserver.observe(el));
    } else {
        // Fallback for reduced motion or no IntersectionObserver support
        revealElements.forEach(el => el.classList.add('revealed'));
    }

    // 6. Number Counters
    function startCounters(counters) {
        if (prefersReducedMotion) {
            counters.forEach(counter => {
                counter.innerText = counter.getAttribute('data-target');
            });
            return;
        }

        counters.forEach(counter => {
            const target = +counter.getAttribute('data-target');
            const duration = 2000; // 2 seconds
            const increment = target / (duration / 16); // 60fps
            
            let current = 0;
            
            const updateCounter = () => {
                current += increment;
                
                if (current < target) {
                    counter.innerText = Math.ceil(current);
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.innerText = target;
                }
            };
            
            updateCounter();
        });
    }

    // 7. Timeline Progress Animation
    const timelineContainer = document.querySelector('.timeline-container');
    const timelineProgress = document.querySelector('.timeline-progress');
    
    if (timelineContainer && timelineProgress && !prefersReducedMotion) {
        const steps = document.querySelectorAll('.timeline-step');
        
        const timelineObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Start height animation when container is visible
                    setTimeout(() => {
                        timelineProgress.style.height = '100%';
                    }, 500);
                    timelineObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        timelineObserver.observe(timelineContainer);
    }

    // 8. Testimonial Slider
    const testimonialTrack = document.getElementById('testimonialTrack');
    const navDots = document.querySelectorAll('.nav-dot');
    
    if (testimonialTrack && navDots.length > 0) {
        let currentSlide = 0;
        
        function goToSlide(index) {
            testimonialTrack.style.transform = `translateX(-${index * 100}%)`;
            
            navDots.forEach(dot => dot.classList.remove('active'));
            navDots[index].classList.add('active');
            
            currentSlide = index;
        }
        
        navDots.forEach((dot, index) => {
            dot.addEventListener('click', () => goToSlide(index));
        });

        // Optional: Auto play
        /*
        setInterval(() => {
            let next = (currentSlide + 1) % navDots.length;
            goToSlide(next);
        }, 6000);
        */
    }

    // 9. CTA Modal (Open/Close, Click Outside, Escape Key)
    const ctaModal = document.getElementById('ctaModal');
    const ctaTriggers = document.querySelectorAll('.cta-trigger');
    const closeModalBtn = document.getElementById('closeModal');
    const modalContent = document.getElementById('modalContent');
    
    function openModal(e) {
        if(e) e.preventDefault();
        ctaModal.classList.add('active');
        ctaModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
        
        // If mobile menu is open, close it
        if (mobileMenu && mobileMenu.classList.contains('active')) {
            menuToggle.classList.remove('active');
            mobileMenu.classList.remove('active');
        }
    }
    
    function closeModal() {
        ctaModal.classList.remove('active');
        ctaModal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        
        // Reset form if success state is showing
        setTimeout(() => {
            const form = document.getElementById('requestForm');
            const success = document.getElementById('modalSuccess');
            if(form && success) {
                form.style.display = 'block';
                success.style.display = 'none';
                form.reset();
            }
        }, 300);
    }
    
    ctaTriggers.forEach(trigger => {
        trigger.addEventListener('click', openModal);
    });
    
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeModal);
    }
    
    // Close on click outside
    if (ctaModal) {
        ctaModal.addEventListener('click', (e) => {
            if (e.target === ctaModal) {
                closeModal();
            }
        });
    }
    
    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && ctaModal && ctaModal.classList.contains('active')) {
            closeModal();
        }
    });

    // 10. Form Validation & Success State (Modal Form)
    const requestForm = document.getElementById('requestForm');
    const modalSuccess = document.getElementById('modalSuccess');
    const closeSuccessBtn = document.getElementById('closeSuccessBtn');
    
    if (requestForm && modalSuccess) {
        requestForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Basic validation is handled by HTML5 'required' attributes
            
            // Simulate form submission
            const submitBtn = requestForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = 'Sending...';
            submitBtn.disabled = true;
            
            setTimeout(() => {
                requestForm.style.display = 'none';
                modalSuccess.style.display = 'block';
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }, 800);
        });
    }
    
    if (closeSuccessBtn) {
        closeSuccessBtn.addEventListener('click', closeModal);
    }

    // Contact Section Form
    const contactForm = document.getElementById('contactForm');
    const contactSuccess = document.getElementById('contactSuccess');
    
    if (contactForm && contactSuccess) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = 'Sending...';
            submitBtn.disabled = true;
            
            setTimeout(() => {
                contactSuccess.style.display = 'block';
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                contactForm.reset();
                
                setTimeout(() => {
                    contactSuccess.style.display = 'none';
                }, 5000);
            }, 800);
        });
    }

    // 11. Parallax Effect for Images
    const parallaxImgs = document.querySelectorAll('.parallax-img');
    
    if (parallaxImgs.length > 0 && !prefersReducedMotion) {
        window.addEventListener('scroll', () => {
            const scrolled = window.scrollY;
            
            parallaxImgs.forEach(img => {
                const limit = img.offsetTop + img.offsetHeight;
                if (scrolled <= limit) {
                    img.style.transform = `translateY(${scrolled * 0.15}px)`;
                }
            });
        });
    }

    // 12. 3D Mouse Movement Effect (Desktop Only)
    const hero3d = document.getElementById('hero-3d');
    
    if (hero3d && window.innerWidth > 1024 && !prefersReducedMotion) {
        document.addEventListener('mousemove', (e) => {
            const xAxis = (window.innerWidth / 2 - e.pageX) / 50;
            const yAxis = (window.innerHeight / 2 - e.pageY) / 50;
            
            hero3d.style.transform = `translateY(-50%) rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
        });
    }

    // 13. Drop to Top Button
    const scrollTopBtn = document.getElementById('scrollTopBtn');
    
    if (scrollTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 500) {
                scrollTopBtn.classList.add('visible');
            } else {
                scrollTopBtn.classList.remove('visible');
            }
        });
        
        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
});

