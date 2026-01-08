/**
 * Wix Navigation Helper
 * Add this script to all your HTML files to handle navigation when embedded in Wix iframes
 * 
 * Usage: Add this before </body> tag in each HTML file:
 * <script src="wix-navigation-helper.js"></script>
 */

(function() {
    'use strict';
    
    // Check if we're in an iframe (Wix embeds pages in iframes)
    const isInIframe = window.parent !== window.self;
    
    if (isInIframe) {
        console.log('Wix Navigation Helper: Detected iframe environment');
        
        // Handle all internal links
        function handleNavigation() {
            const links = document.querySelectorAll('a[href$=".html"], a[href^="#"]');
            
            links.forEach(link => {
                link.addEventListener('click', function(e) {
                    const href = this.getAttribute('href');
                    
                    // Handle anchor links (#section)
                    if (href.startsWith('#')) {
                        // Try to scroll within iframe first
                        const targetId = href.substring(1);
                        const targetElement = document.getElementById(targetId) || 
                                           document.querySelector(`[name="${targetId}"]`);
                        
                        if (targetElement) {
                            e.preventDefault();
                            targetElement.scrollIntoView({ behavior: 'smooth' });
                            return;
                        }
                    }
                    
                    // Handle page links (filename.html)
                    if (href.endsWith('.html')) {
                        e.preventDefault();
                        
                        // Extract page name from href
                        const pageName = href.replace('.html', '').split('/').pop();
                        
                        // Map page names to Wix page names
                        const pageMap = {
                            'landing': 'Home',
                            'tools': 'Tools',
                            'blog': 'Blog',
                            'about': 'About',
                            'contact': 'Contact',
                            'privacy-policy': 'Privacy Policy',
                            'terms-of-service': 'Terms of Service'
                        };
                        
                        const wixPageName = pageMap[pageName] || pageName.charAt(0).toUpperCase() + pageName.slice(1);
                        
                        // Send message to parent (Wix)
                        window.parent.postMessage({
                            type: 'wix-navigate',
                            page: wixPageName,
                            url: href
                        }, '*');
                        
                        console.log('Wix Navigation Helper: Navigating to', wixPageName);
                    }
                });
            });
        }
        
        // Run when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', handleNavigation);
        } else {
            handleNavigation();
        }
        
        // Also handle dynamically added links
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes.length) {
                    handleNavigation();
                }
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
})();

