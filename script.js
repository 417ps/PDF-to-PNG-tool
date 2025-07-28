// Echo PDF to PNG Converter JavaScript
class PDFToPNGConverter {
    constructor() {
        // Access PDF.js library correctly
        this.pdfjsLib = window.pdfjsLib || window['pdfjs-dist/build/pdf'];
        
        // Set worker source
        if (this.pdfjsLib) {
            this.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        } else {
            console.error('PDF.js library not loaded properly');
        }
        
        this.uploadSection = document.getElementById('uploadArea');
        this.pdfInput = document.getElementById('pdfInput');
        this.processingSection = document.getElementById('processingSection');
        this.resultsSection = document.getElementById('resultsSection');
        this.progressFill = document.getElementById('progressFill');
        this.progressText = document.getElementById('progressText');
        this.resultsGrid = document.getElementById('resultsGrid');
        this.downloadAllBtn = document.getElementById('downloadAllBtn');
        this.convertAnotherBtn = document.getElementById('convertAnotherBtn');
        
        this.convertedImages = [];
        this.currentFileName = '';
        
        this.initializeEventListeners();
    }
    
    initializeEventListeners() {
        // File input change
        this.pdfInput.addEventListener('change', (e) => {
            this.handleFileSelect(e.target.files);
        });
        
        // Drag and drop
        this.uploadSection.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.uploadSection.classList.add('drag-over');
        });
        
        this.uploadSection.addEventListener('dragleave', (e) => {
            e.preventDefault();
            this.uploadSection.classList.remove('drag-over');
        });
        
        this.uploadSection.addEventListener('drop', (e) => {
            e.preventDefault();
            this.uploadSection.classList.remove('drag-over');
            this.handleFileSelect(e.dataTransfer.files);
        });
        
        // Click to upload
        this.uploadSection.addEventListener('click', () => {
            this.pdfInput.click();
        });
        
        // Download all button
        this.downloadAllBtn.addEventListener('click', () => {
            this.downloadAllImages();
        });
        
        // Convert another button
        this.convertAnotherBtn.addEventListener('click', () => {
            this.resetConverter();
        });
    }
    
    async handleFileSelect(files) {
        if (files.length === 0) return;
        
        const file = files[0];
        console.log('File selected:', file.name, file.type, file.size);
        
        // Check file type
        if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
            this.showError('Please select a valid PDF file.');
            return;
        }
        
        // Check PDF.js library
        if (!this.pdfjsLib) {
            this.showError('PDF processing library not loaded. Please refresh the page and try again.');
            return;
        }
        
        this.currentFileName = file.name.replace('.pdf', '');
        await this.convertPDFToPNG(file);
    }
    
    async convertPDFToPNG(file) {
        try {
            console.log('Starting PDF conversion...');
            this.showProcessingSection();
            
            // Read file as array buffer
            console.log('Reading file...');
            const arrayBuffer = await file.arrayBuffer();
            console.log('File read successfully, size:', arrayBuffer.byteLength);
            
            // Load PDF document
            console.log('Loading PDF document...');
            const pdf = await this.pdfjsLib.getDocument({
                data: arrayBuffer,
                cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/',
                cMapPacked: true
            }).promise;
            
            const numPages = pdf.numPages;
            console.log('PDF loaded successfully. Pages:', numPages);
            
            this.convertedImages = [];
            
            for (let pageNum = 1; pageNum <= numPages; pageNum++) {
                this.updateProgress((pageNum - 1) / numPages * 100, `Converting page ${pageNum} of ${numPages}...`);
                
                const page = await pdf.getPage(pageNum);
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                
                // Set high-quality rendering
                const viewport = page.getViewport({ scale: 2.0 });
                canvas.width = viewport.width;
                canvas.height = viewport.height;
                
                await page.render({
                    canvasContext: context,
                    viewport: viewport
                }).promise;
                
                // Convert canvas to PNG blob
                const blob = await new Promise(resolve => {
                    canvas.toBlob(resolve, 'image/png', 1.0);
                });
                
                const imageUrl = URL.createObjectURL(blob);
                const fileName = `${this.currentFileName}_page_${pageNum.toString().padStart(2, '0')}.png`;
                
                this.convertedImages.push({
                    blob: blob,
                    url: imageUrl,
                    fileName: fileName,
                    pageNumber: pageNum,
                    size: this.formatFileSize(blob.size)
                });
            }
            
            this.updateProgress(100, 'Conversion complete!');
            setTimeout(() => {
                this.showResultsSection();
            }, 500);
            
        } catch (error) {
            console.error('Error converting PDF:', error);
            
            // Reset UI to upload state
            document.querySelector('.upload-section').style.display = 'block';
            this.processingSection.style.display = 'none';
            this.resultsSection.style.display = 'none';
            
            // Show specific error message
            let errorMessage = 'Error converting PDF. ';
            if (error.message.includes('Invalid PDF')) {
                errorMessage += 'The file appears to be corrupted or not a valid PDF.';
            } else if (error.message.includes('password')) {
                errorMessage += 'Password-protected PDFs are not supported.';
            } else if (error.name === 'NetworkError') {
                errorMessage += 'Network error loading PDF processing library.';
            } else {
                errorMessage += 'Please try again with a different file.';
            }
            
            this.showError(errorMessage);
        }
    }
    
    showProcessingSection() {
        document.querySelector('.upload-section').style.display = 'none';
        this.processingSection.style.display = 'block';
        this.processingSection.classList.add('fade-in');
        this.resultsSection.style.display = 'none';
    }
    
    showResultsSection() {
        this.processingSection.style.display = 'none';
        this.resultsSection.style.display = 'block';
        this.resultsSection.classList.add('slide-up');
        this.renderResults();
    }
    
    updateProgress(percentage, message) {
        this.progressFill.style.width = `${percentage}%`;
        this.progressText.textContent = `${Math.round(percentage)}%`;
        
        const processingCard = this.processingSection.querySelector('p');
        if (message) {
            processingCard.textContent = message;
        }
    }
    
    renderResults() {
        this.resultsGrid.innerHTML = '';
        
        this.convertedImages.forEach((image, index) => {
            const resultItem = document.createElement('div');
            resultItem.className = 'result-item';
            
            resultItem.innerHTML = `
                <img src="${image.url}" alt="Page ${image.pageNumber}" class="result-preview">
                <div class="result-title">Page ${image.pageNumber}</div>
                <div class="result-size">${image.size}</div>
                <a href="${image.url}" download="${image.fileName}" class="download-btn">
                    Download PNG
                </a>
            `;
            
            this.resultsGrid.appendChild(resultItem);
        });
    }
    
    async downloadAllImages() {
        if (this.convertedImages.length === 0) return;
        
        // For multiple files, we'll create a zip file
        if (typeof JSZip === 'undefined') {
            console.error('JSZip library not loaded');
            this.showError('Unable to create ZIP file. Please try downloading images individually.');
            return;
        }
        
        const zip = new JSZip();
        
        // Add each image to the zip
        this.convertedImages.forEach(image => {
            zip.file(image.fileName, image.blob);
        });
        
        // Generate and download the zip file
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        const zipUrl = URL.createObjectURL(zipBlob);
        
        const downloadLink = document.createElement('a');
        downloadLink.href = zipUrl;
        downloadLink.download = `${this.currentFileName}_png_images.zip`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        
        // Clean up
        URL.revokeObjectURL(zipUrl);
    }
    
    resetConverter() {
        // Clean up object URLs
        this.convertedImages.forEach(image => {
            URL.revokeObjectURL(image.url);
        });
        
        this.convertedImages = [];
        this.currentFileName = '';
        this.pdfInput.value = '';
        
        // Reset UI
        document.querySelector('.upload-section').style.display = 'block';
        this.processingSection.style.display = 'none';
        this.resultsSection.style.display = 'none';
        this.progressFill.style.width = '0%';
        this.progressText.textContent = '0%';
        this.resultsGrid.innerHTML = '';
        
        // Remove any error messages
        const errorMessages = document.querySelectorAll('.error-message');
        errorMessages.forEach(msg => msg.remove());
    }
    
    showError(message) {
        // Remove existing error messages
        const existingErrors = document.querySelectorAll('.error-message');
        existingErrors.forEach(error => error.remove());
        
        // Create new error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        
        // Insert after upload card
        const uploadCard = document.querySelector('.upload-card');
        uploadCard.parentNode.insertBefore(errorDiv, uploadCard.nextSibling);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }
    
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// Initialize the converter when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PDFToPNGConverter();
});

// Service Worker for offline functionality
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