// Script to update citation display functionality

// Function to replace superscript citations with clickable links
function makeCitationsClickable() {
    // Process the description field after page loads
    document.addEventListener('DOMContentLoaded', function() {
        // Wait for timeline to be rendered
        setTimeout(function() {
            // Find all timeline descriptions
            var descriptions = document.querySelectorAll('.timeline-description');
            
            descriptions.forEach(function(desc) {
                // Replace superscript citations with clickable links
                desc.innerHTML = desc.innerHTML.replace(/<sup>(\d+(?:,\d+)*)<\/sup>/g, function(match, numbers) {
                    var citationNumbers = numbers.split(',');
                    var links = citationNumbers.map(function(num) {
                        return '<a href="#ref-' + num.trim() + '" class="citation-link">' + num.trim() + '</a>';
                    }).join(',');
                    return '<sup>' + links + '</sup>';
                });
            });
            
            // Add smooth scrolling for citation links
            document.querySelectorAll('.citation-link').forEach(function(link) {
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    var targetId = this.getAttribute('href').substring(1);
                    var targetElement = document.getElementById(targetId);
                    if (targetElement) {
                        targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        // Ensure citations section is expanded
                        var citationsContent = document.querySelector('.citations-content');
                        var citationsHeader = document.querySelector('.citations-header');
                        if (citationsContent && citationsContent.classList.contains('collapsed')) {
                            citationsContent.classList.remove('collapsed');
                            citationsHeader.classList.add('expanded');
                        }
                        // Also expand the target citation card
                        var cardBody = targetElement.querySelector('.citation-card-body');
                        if (cardBody && cardBody.classList.contains('collapsed')) {
                            cardBody.classList.remove('collapsed');
                            targetElement.classList.add('expanded');
                        }
                    }
                });
            });
        }, 500);
    });
}

// Add CSS for citation links
function addCitationLinkStyles() {
    var style = document.createElement('style');
    style.textContent = `
        .citation-link {
            color: inherit;
            text-decoration: none;
            border-bottom: 1px dotted currentColor;
            transition: all 0.2s ease;
        }
        
        .citation-link:hover {
            color: var(--accent-primary);
            border-bottom-style: solid;
        }
    `;
    document.head.appendChild(style);
}

// Initialize all enhancements
makeCitationsClickable();
addCitationLinkStyles();