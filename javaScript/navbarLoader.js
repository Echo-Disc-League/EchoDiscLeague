// navbarLoader.js - Save this in /javaScript/navbarLoader.js

function loadNavbar() {
    fetch('/components/navbar.html')
        .then(response => response.text())
        .then(data => {
            // Insert navbar at the beginning of body
            document.body.insertAdjacentHTML('afterbegin', data);
        })
        .catch(error => {
            console.error('Error loading navbar:', error);
        });
}

// Load navbar when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadNavbar);
} else {
    loadNavbar();
}