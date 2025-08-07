# Adobe Target Utility Kit - Usage Guide

## Overview
The Adobe Target Utility Kit provides safe, easy-to-use functions for common A/B testing and personalization tasks. All functions include built-in logging and error handling.

## Configuration

### Enable/Disable Logging
```javascript
// Enable debug logging (default: true)
TargetUtils.debug = true;

// Disable logging for production
TargetUtils.debug = false;
```

## Core Functions

### 1. Asset Injection

#### Inject Stylesheets
```javascript
// Basic stylesheet injection
TargetUtils.injectStylesheet('https://example.com/styles.css');

// Automatically prevents duplicates - won't inject same URL twice
```

#### Inject Scripts
```javascript
// Inject script (async by default)
TargetUtils.injectScript('https://example.com/script.js');

// Inject script synchronously
TargetUtils.injectScript('https://example.com/script.js', false);
```

### 2. Element Manipulation

#### Add CSS Classes
```javascript
// Add class to all matching elements
TargetUtils.addClass('.product-card', 'highlighted');
TargetUtils.addClass('#hero-banner', 'variant-b');

// Returns true if elements found, false if not
```

#### Text Replacement
```javascript
// Replace text throughout the page
TargetUtils.replaceText('Buy Now', 'Shop Today');
TargetUtils.replaceText('$99.99', '$79.99');

// Returns true if replacements made, false if text not found
```

### 3. HTML Injection

#### Basic HTML Injection
```javascript
// Inject HTML after an element (default)
TargetUtils.injectHTML('#main-content', '<div class="promo">Special Offer!</div>');

// Inject HTML before an element
TargetUtils.injectHTML('#main-content', '<div class="banner">New!</div>', 'before');

// Append HTML inside an element (at the end)
TargetUtils.injectHTML('#product-list', '<div class="product">New Product</div>', 'append');

// Prepend HTML inside an element (at the beginning)
TargetUtils.injectHTML('#product-list', '<div class="featured">Featured</div>', 'prepend');

// Replace entire element
TargetUtils.injectHTML('#old-banner', '<div id="new-banner">Updated Banner</div>', 'replace');

// Replace only inner content
TargetUtils.injectHTML('#content-area', '<h2>New Content</h2><p>Updated text</p>', 'innerHTML');
```

#### Available Injection Methods
- `'after'` - Insert after the target element (default)
- `'before'` - Insert before the target element  
- `'append'` - Add inside at the end (like appendChild)
- `'prepend'` - Add inside at the beginning
- `'replace'` - Replace the entire element
- `'innerHTML'` - Replace just the inner content

### 4. Waiting for Elements

#### Wait for Dynamic Content
```javascript
// Wait for element to appear in DOM
TargetUtils.waitForElement('.dynamic-content', function(element) {
    // This runs when element is found
    element.style.backgroundColor = 'yellow';
    TargetUtils.addClass('.dynamic-content', 'highlighted');
});

// With custom timeout (default is 5 seconds)
TargetUtils.waitForElement('.slow-loading', function(element) {
    console.log('Element finally loaded!', element);
}, 10000); // Wait up to 10 seconds
```

### 5. AEM Experience Fragments

#### Load Experience Fragment Content
```javascript
// Basic XF loading (injects after target element)
TargetUtils.loadXF(
    '/content/experience-fragments/mysite/header-variant/master.html',
    '#main-header'
);

// Load XF with different injection method
TargetUtils.loadXF(
    '/content/experience-fragments/mysite/promo-banner/master.html',
    '#hero-section',
    'prepend'
);

// Using with Promise handling
TargetUtils.loadXF('/content/experience-fragments/mysite/footer/master.html', '#footer')
    .then(() => {
        console.log('XF loaded successfully!');
        // Additional code after loading
    })
    .catch(error => {
        console.error('Failed to load XF:', error);
        // Fallback code
    });
```

## Common Use Cases

### A/B Test Scenarios

#### Variant A: Change Button Text
```javascript
TargetUtils.replaceText('Add to Cart', 'Buy Now');
TargetUtils.addClass('.cta-button', 'variant-a');
```

#### Variant B: Add Promotional Banner
```javascript
TargetUtils.injectHTML('#main-content', `
    <div class="promo-banner">
        <h3>Limited Time Offer!</h3>
        <p>Get 20% off your first order</p>
    </div>
`, 'before');
```

#### Variant C: Load Different Header
```javascript
TargetUtils.loadXF(
    '/content/experience-fragments/mysite/header-sale/master.html',
    '#site-header',
    'replace'
);
```

### Personalization Examples

#### Welcome Returning Visitors
```javascript
// Wait for user data, then personalize
TargetUtils.waitForElement('.user-info', function(userElement) {
    if (userElement.dataset.returning === 'true') {
        TargetUtils.injectHTML('#hero-banner', `
            <div class="welcome-back">Welcome back, valued customer!</div>
        `, 'prepend');
    }
});
```

#### Dynamic Product Recommendations
```javascript
TargetUtils.loadXF(
    '/content/experience-fragments/mysite/recommendations/master.html',
    '#product-grid',
    'after'
).then(() => {
    TargetUtils.addClass('.recommendations', 'fade-in');
});
```

## Error Handling

### Function Return Values
All functions return `true` for success or `false` for failure:

```javascript
const success = TargetUtils.addClass('.nonexistent', 'highlight');
if (!success) {
    console.log('Elements not found, using fallback');
    // Fallback logic
}
```

### Promise Handling for loadXF
```javascript
TargetUtils.loadXF('/path/to/xf.html', '#target')
    .then(() => {
        // Success - XF loaded
        TargetUtils.log('Custom success message');
    })
    .catch(error => {
        // Error handling
        console.error('XF loading failed:', error.message);
        // Show fallback content
        TargetUtils.injectHTML('#target', '<div>Fallback content</div>');
    });
```

## Best Practices

### 1. Always Check for Elements
```javascript
// Good - handles missing elements gracefully
TargetUtils.waitForElement('.dynamic-content', function(el) {
    TargetUtils.addClass('.dynamic-content', 'loaded');
});

// Also good - functions return success indicators
if (TargetUtils.addClass('.product', 'sale-price')) {
    TargetUtils.replaceText('Regular Price', 'Sale Price');
}
```

### 2. Use Specific Selectors
```javascript
// Good - specific selector
TargetUtils.injectHTML('#main-product-image', bannerHTML, 'after');

// Avoid - too generic, might affect multiple elements
TargetUtils.injectHTML('img', bannerHTML, 'after');
```

### 3. Chain Related Operations
```javascript
// Load XF then enhance it
TargetUtils.loadXF('/path/to/promo.html', '#sidebar')
    .then(() => {
        TargetUtils.addClass('.promo-content', 'animate-in');
        TargetUtils.injectStylesheet('/assets/promo-styles.css');
    });
```

### 4. Debug Mode for Development
```javascript
// Enable during development
TargetUtils.debug = true;

// Disable for production
TargetUtils.debug = false;
```

## Troubleshooting

### Common Issues
1. **Element not found**: Check selector spelling and ensure element exists
2. **XF not loading**: Verify path starts with `/content/experience-fragments/`
3. **Styles not applying**: Ensure stylesheets load before DOM manipulation
4. **Scripts conflicting**: Use `async: false` for scripts that need specific load order

### Debug Information
When `debug: true`, all functions log their actions to the browser console with clear, styled messages for easy tracking.