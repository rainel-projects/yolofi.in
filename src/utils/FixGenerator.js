/**
 * FixGenerator.js
 * Generates copy-paste solutions for common web performance issues.
 */

export const FixGenerator = {
    // 1. COMPRESSION (Gzip/Brotli)
    generateCompressionConfig: (serverType = 'apache') => {
        if (serverType === 'nginx') {
            return `
# Add this to your nginx.conf inside standard server or location block
gzip on;
gzip_comp_level 5;
gzip_min_length 256;
gzip_proxied any;
gzip_vary on;
gzip_types
  application/javascript
  application/json
  application/xml
  text/css
  text/plain;
`;
        }
        return `
# Add this to your .htaccess file
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css application/xml
  AddOutputFilterByType DEFLATE application/javascript application/json
</IfModule>
`;
    },

    // 2. BROWSER CACHING
    generateCacheHeaders: (serverType = 'apache') => {
        if (serverType === 'nginx') {
            return `
# Nginx Caching Headers
location ~* \\.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 365d;
    add_header Cache-Control "public, no-transform";
}
`;
        }
        return `
# Apache Cache Headers (.htaccess)
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/pdf "access plus 1 month"
  ExpiresByType text/javascript "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
  ExpiresByType application/x-javascript "access plus 1 month"
  ExpiresByType image/x-icon "access plus 1 year"
  ExpiresDefault "access plus 2 days"
</IfModule>
`;
    },

    // 3. SEO / META TAGS
    generateBasicSEO: () => {
        return `
<!-- Core SEO Meta Tags -->
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Your Page Title (50-60 chars)</title>
<meta name="description" content="A description of your page content (150-160 chars).">

<!-- Open Graph / Social -->
<meta property="og:title" content="Your Social Title">
<meta property="og:description" content="Your Social Description">
<meta property="og:image" content="https://example.com/image.jpg">
`;
    },

    // 4. IMAGE OPTIMIZATION (Instructional)
    generateImageAdvice: (failedUrls = []) => {
        const list = failedUrls.map(u => `- ${u.url}`).join('\n');
        return `
# ISSUE: Oversized Images detected
The following images are too large for mobile screens:

${list}

# FIX:
1. Resize these images to max-width 1200px (for desktop) or 800px (for mobile).
2. Convert them to WebP format (typically 30% smaller).
3. Use a tool like TinyPNG.com or Squoosh.app.
`;
    }
};

export default FixGenerator;
