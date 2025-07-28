# Echo PDF to PNG Converter

A modern, client-side PDF to PNG converter with echo branding and styling. Convert PDF files to high-quality PNG images directly in your browser.

## Features

- 🔄 **Client-side conversion** - No server uploads, complete privacy
- 📄 **Multi-page support** - Convert all pages of a PDF to individual PNG files
- 🎨 **High-quality output** - 2x scaling for crisp, clear images
- 📦 **Batch download** - Download all converted images as a ZIP file
- 📱 **Responsive design** - Works on desktop and mobile devices
- 🎭 **Echo branding** - Modern UI with echo design system
- ⚡ **Fast processing** - Uses PDF.js for efficient conversion
- 🌐 **Offline support** - Works without internet connection after first load

## Technologies Used

- **PDF.js** - Mozilla's PDF rendering library
- **Canvas API** - High-quality image rendering
- **JSZip** - Creating downloadable ZIP archives
- **Service Workers** - Offline functionality
- **Modern CSS** - Echo design system styling
- **Vanilla JavaScript** - No framework dependencies

## Deployment to Netlify

### Method 1: Drag and Drop
1. Create a ZIP file of all project files
2. Go to [Netlify](https://netlify.com)
3. Drag and drop the ZIP file to deploy instantly

### Method 2: Git Integration
1. Push code to GitHub repository
2. Connect repository to Netlify
3. Set build command: `echo 'No build step required'`
4. Set publish directory: `.` (root)

### Method 3: Netlify CLI
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy from project directory
netlify deploy --prod --dir=.
```

## Local Development

1. Clone or download the project files
2. Open `index.html` in a modern web browser
3. Or serve with a local server:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx serve .
   
   # Using PHP
   php -S localhost:8000
   ```

## File Structure

```
pdf-to-png-converter/
├── index.html          # Main HTML file
├── styles.css          # Echo-branded CSS styles
├── script.js           # PDF conversion logic
├── sw.js              # Service worker for offline support
├── netlify.toml       # Netlify deployment configuration
└── README.md          # This file
```

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

## Security Features

- Content Security Policy (CSP) headers
- XSS protection
- No server-side processing (client-side only)
- HTTPS enforcement on Netlify

## Performance Optimizations

- Lazy loading of PDF.js library
- Image compression for web delivery
- Service worker caching
- Optimized CSS and JavaScript

## Customization

The app uses CSS custom properties for easy theming. Key variables in `styles.css`:

```css
:root {
    --echo-primary: #2563eb;
    --echo-secondary: #64748b;
    --echo-success: #10b981;
    /* ... more variables */
}
```

## License

This project is open source and available under the MIT License.

## Support

For issues or questions, please create an issue in the project repository.