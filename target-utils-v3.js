/**
 * Adobe Target Utility Kit
 * For safe styling, content injection, and interactive experiments
 */

(function (window, document) {
  const TargetUtils = {
    /**
     * Enable or disable debug logging
     */
    debug: true,

    /**
     * Log a message to console if debug is enabled
     */
    log: function (msg) {
      if (this.debug) {
        console.log('%c[TargetUtils] ' + msg, 'background: #007acc; color: white; padding: 2px 6px; border-radius: 3px');
      }
    },

    /**
     * Inject external stylesheet if not already present
     * @param {string} href - URL of the stylesheet
     */
    injectStylesheet: function (href) {
      // Check if stylesheet is already loaded
      if (document.querySelector(`link[href="${href}"]`)) {
        this.log(`Stylesheet already loaded: ${href}`);
        return false;
      }

      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      document.head.appendChild(link);
      this.log(`Injected stylesheet: ${href}`);
      return true;
    },

    /**
     * Inject external script if not already present
     * @param {string} src - URL of the script
     * @param {boolean} async - Whether to load script asynchronously (default: true)
     */
    injectScript: function (src, async = false) {
      // Check if script is already loaded
      if (document.querySelector(`script[src="${src}"]`)) {
        this.log(`Script already loaded: ${src}`);
        return false;
      }

      const script = document.createElement('script');
      script.src = src;
      script.async = async;
      document.head.appendChild(script);
      this.log(`Injected script: ${src}`);
      return true;
    },

    /**
     * Add class to all matching elements
     * @param {string} selector - CSS selector
     * @param {string} className - Class name to add
     */
    addClass: function (selector, className) {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        this.log(`No elements found for selector: "${selector}"`);
        return false;
      }

      elements.forEach(el => el.classList.add(className));
      this.log(`Added class "${className}" to ${elements.length} elements matching "${selector}"`);
      return true;
    },

    /**
     * Replace text content throughout the document
     * @param {string} original - Text to find
     * @param {string} replacement - Text to replace with
     */
    replaceText: function (original, replacement) {
      const walker = document.createTreeWalker(
        document.body, 
        NodeFilter.SHOW_TEXT, 
        null, 
        false
      );
      
      let node;
      let replacements = 0;
      
      while ((node = walker.nextNode())) {
        if (node.nodeValue.includes(original)) {
          node.nodeValue = node.nodeValue.split(original).join(replacement);
          replacements++;
        }
      }
      
      this.log(`Replaced "${original}" with "${replacement}" in ${replacements} text nodes`);
      return replacements > 0;
    },

    /**
     * Wait for an element to appear in the DOM
     * @param {string} selector - CSS selector to wait for
     * @param {function} callback - Function to call when element is found
     * @param {number} timeout - Timeout in milliseconds (default: 5000)
     */
    waitForElement: function (selector, callback, timeout = 5000) {
      const start = Date.now();
      
      const check = () => {
        const el = document.querySelector(selector);
        if (el) {
          this.log(`Element found: ${selector}`);
          return callback(el);
        }
        
        if (Date.now() - start < timeout) {
          requestAnimationFrame(check);
        } else {
          this.log(`waitForElement timed out: ${selector}`);
          console.warn(`TargetUtils: waitForElement timed out for "${selector}"`);
        }
      };
      
      check();
    },

    /**
     * Inject or replace HTML content relative to a target element
     * @param {string} selector - CSS selector for target element
     * @param {string} html - HTML content to inject
     * @param {string} method - 'after', 'before', 'append', 'prepend', 'replace', 'innerHTML'
     */
    injectHTML: function (selector, html, method = 'after') {
      const container = document.querySelector(selector);
      if (!container) {
        this.log(`Element not found: "${selector}"`);
        return false;
      }

      switch (method) {
        case 'after':
          container.insertAdjacentHTML('afterend', html);
          this.log(`Injected HTML after "${selector}"`);
          break;
        case 'before':
          container.insertAdjacentHTML('beforebegin', html);
          this.log(`Injected HTML before "${selector}"`);
          break;
        case 'append':
          container.insertAdjacentHTML('beforeend', html);
          this.log(`Appended HTML inside "${selector}"`);
          break;
        case 'prepend':
          container.insertAdjacentHTML('afterbegin', html);
          this.log(`Prepended HTML inside "${selector}"`);
          break;
        case 'replace':
          container.outerHTML = html;
          this.log(`Replaced element "${selector}" with new HTML`);
          break;
        case 'innerHTML':
          container.innerHTML = html;
          this.log(`Replaced inner HTML of "${selector}"`);
          break;
        default:
          console.warn(`TargetUtils: Unknown method "${method}". Using 'after' instead.`);
          container.insertAdjacentHTML('afterend', html);
          this.log(`Injected HTML after "${selector}" (fallback)`);
      }
      return true;
    },

    /**
     * Load content from AEM Experience Fragment path
     * @param {string} contentPath - Path to the experience fragment
     * @param {string} targetSelector - CSS selector for target element
     * @param {string} method - Injection method ('after', 'before', 'append', 'prepend', 'replace', 'innerHTML')
     */
    loadXF: function (contentPath, targetSelector, method = 'after') {
      // Validate the content path
      if (!contentPath.startsWith('/content/experience-fragments/')) {
        console.error('TargetUtils: Invalid content path. Must start with /content/experience-fragments/');
        return Promise.reject(new Error('Invalid content path'));
      }

      // Return a promise for better error handling
      return fetch(contentPath)
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          return response.text();
        })
        .then(data => {
          // Parse the response to extract assets
          const parser = new DOMParser();
          const doc = parser.parseFromString(data, 'text/html');

          // Extract and inject stylesheets
          const stylesheetLinks = doc.querySelectorAll('link[rel="stylesheet"]');
          stylesheetLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href) {
              this.injectStylesheet(href);
            }
          });

          // Extract and inject scripts
          const scriptTags = doc.querySelectorAll('script[src]');
          scriptTags.forEach(script => {
            const src = script.getAttribute('src');
            if (src) {
              this.injectScript(src);
            }
          });

          // Sanitize HTML by removing script and link tags
          const sanitizedHTML = data
            .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '') // Remove script tags
            .replace(/<link[^>]*rel=["']stylesheet["'][^>]*>/gi, ''); // Remove stylesheet links

          // Inject the sanitized HTML
          const success = this.injectHTML(targetSelector, sanitizedHTML, method);
          
          if (success) {
            this.log(`Successfully loaded XF: ${contentPath}`);
          }
          
          return success;
        })
        .catch(error => {
          console.error('TargetUtils: Error loading content:', error);
          this.log(`Failed to load XF: ${contentPath} - ${error.message}`);
          throw error;
        });
    }
  };

  // Expose globally
  window.TargetUtils = TargetUtils;

})(window, document);