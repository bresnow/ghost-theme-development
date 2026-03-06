// Vite entry point — replaces gulp concat
// Import CSS so Vite processes it through PostCSS
import '../css/screen.css';

// Vendor libs (order matters — they expose globals)
import './lib/reframe.min.js';
import './lib/imagesloaded.pkgd.min.js';
import './lib/photoswipe.min.js';
import './lib/photoswipe-ui-default.min.js';

// App modules (order matters — main.js calls the others)
import './lightbox.js';
import './dropdown.js';
import './pagination.js';
import './main.js';
