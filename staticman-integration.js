/**
 * Staticman Integration for FoGH Timeline
 * 
 * This file handles all form submissions to GitHub via Staticman API
 * Staticman is a Node.js application that receives form submissions,
 * processes them, and creates pull requests on GitHub repositories.
 * 
 * How it works:
 * 1. User fills out the submission form
 * 2. Form data is sent to Staticman API endpoint
 * 3. Staticman validates the data according to staticman.yml config
 * 4. Staticman creates a pull request with the new data
 * 5. Moderators review and merge the PR to publish the content
 * 
 * Dependencies:
 * - Staticman instance (self-hosted or public service)
 * - GitHub repository with proper permissions
 * - staticman.yml configuration file in repo root
 */

// =============================================================================
// CONFIGURATION
// =============================================================================

/**
 * Staticman configuration object
 * Update these values to match your deployment
 */
window.STATICMAN_CONFIG = {
    // Base URL for your Staticman instance
    // For self-hosted: https://your-staticman-instance.com
    // For Staticman's service: https://api.staticman.net
    baseUrl: 'https://incomparable-cupcake-fef8d5.netlify.app',
    
    // GitHub repository details
    username: 'danieledge',
    repository: 'Fogh-timeline',
    branch: 'main',
    
    // Optional: reCAPTCHA site key if you enable it in staticman.yml
    recaptchaSiteKey: ''
};

// =============================================================================
// AMENDMENT FUNCTIONALITY
// =============================================================================

/**
 * Adds event handler to the amendment dropdown
 * When user selects an existing entry to amend, this populates the form
 * with the current values so they can see what they're editing
 */
function addAmendmentDropdownHandler() {
    var amendmentDropdown = document.getElementById('originalEntryDate');
    if (amendmentDropdown) {
        console.log('Adding/re-adding amendment dropdown handler');
        
        // Listen for dropdown changes
        amendmentDropdown.addEventListener('change', function() {
            console.log('Amendment dropdown changed, value:', this.value);
            var selectedDate = this.value;
            
            // If no entry selected, clear all fields
            if (!selectedDate) {
                console.log('No date selected, clearing fields');
                document.getElementById('date').value = '';
                document.getElementById('title').value = '';
                document.getElementById('description').value = '';
                document.getElementById('citations').value = '';
                return;
            }
            
            // Find the selected entry in timelineData
            console.log('Looking for entry with date:', selectedDate);
            console.log('Available entries:', typeof timelineData !== 'undefined' ? timelineData.length : 'timelineData not defined');
            
            if (typeof timelineData === 'undefined') {
                console.error('timelineData is not defined!');
                return;
            }
            
            var selectedEntry = timelineData.find(function(entry) {
                return entry.date === selectedDate;
            });
            console.log('Found entry:', selectedEntry);
            
            if (selectedEntry) {
                // In debug mode, prefix title with [TEST]
                var urlParams = new URLSearchParams(window.location.search);
                var isDebugMode = urlParams.has('debug');
                var titlePrefix = isDebugMode ? '[TEST] ' : '';
                
                // Populate the fields with current values
                console.log('Populating fields...');
                var dateField = document.getElementById('date');
                var titleField = document.getElementById('title');
                var descField = document.getElementById('description');
                
                console.log('Fields found:', {
                    date: !!dateField,
                    title: !!titleField,
                    description: !!descField
                });
                
                if (dateField) {
                    dateField.value = selectedEntry.date;
                    console.log('Set date to:', selectedEntry.date);
                }
                if (titleField) {
                    titleField.value = titlePrefix + selectedEntry.title;
                    console.log('Set title to:', titlePrefix + selectedEntry.title);
                }
                if (descField) {
                    // Remove <sup> tags from description
                    var cleanDescription = selectedEntry.description.replace(/<sup>.*?<\/sup>/g, '');
                    descField.value = cleanDescription;
                    console.log('Set description to:', cleanDescription);
                }
                
                // Populate citations with full text
                var citationsField = document.getElementById('citations');
                if (citationsField) {
                    if (selectedEntry.citations) {
                        console.log('Entry has citations:', selectedEntry.citations);
                        console.log('timelineCitations available:', typeof timelineCitations !== 'undefined');
                        
                        // Try to get citation references from global timelineCitations array
                        if (typeof timelineCitations !== 'undefined' && timelineCitations) {
                            console.log('Building full citation text...');
                            // Build citation text with ID and full reference
                            var citationTexts = [];
                            var citationIds = Array.isArray(selectedEntry.citations) 
                                ? selectedEntry.citations 
                                : selectedEntry.citations.split(',').map(function(id) { return id.trim(); });
                            
                            citationIds.forEach(function(citationId) {
                                // Find the citation in the timelineCitations array
                                var citation = timelineCitations.find(function(cit) {
                                    return cit.number === citationId;
                                });
                                
                                if (citation) {
                                    // Format: "ID - Source"
                                    citationTexts.push(citationId + ' - ' + citation.source);
                                } else {
                                    // Just show the ID if citation not found
                                    citationTexts.push(citationId);
                                }
                            });
                            
                            citationsField.value = citationTexts.join('\n');
                            console.log('Set citations to:', citationsField.value);
                        } else {
                            // Fallback to just showing the citation IDs
                            console.log('timelineCitations not found, showing IDs only');
                            citationsField.value = Array.isArray(selectedEntry.citations) 
                                ? selectedEntry.citations.join(', ') 
                                : selectedEntry.citations;
                        }
                    } else {
                        // Clear citations field if no citations
                        console.log('No citations for this entry, clearing field');
                        citationsField.value = '';
                    }
                }
            }
        });
    }
}

// =============================================================================
// FORM SUBMISSION HANDLER
// =============================================================================

/**
 * Updates the submission form to use Staticman API instead of email
 * This function:
 * 1. Removes any existing event listeners
 * 2. Adds new submission handler that sends to Staticman
 * 3. Shows confirmation modal before submission
 * 4. Handles success/error states
 */
function updateSubmissionHandler() {
    var submissionForm = document.getElementById('submission-form');
    var submitButton = document.getElementById('submit-button');
    var submissionType = document.getElementById('submissionType');
    
    if (!submissionForm) return;
    
    // Remove existing event listeners by cloning the form
    // This ensures we don't have duplicate handlers
    var newForm = submissionForm.cloneNode(true);
    submissionForm.parentNode.replaceChild(newForm, submissionForm);
    submissionForm = newForm;
    submitButton = document.getElementById('submit-button');
    
    // Re-add the amendment dropdown handler after form clone
    addAmendmentDropdownHandler();
    
    /**
     * Main form submission handler
     * Prevents default form submission and handles via Staticman API
     */
    submissionForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        var formData = new FormData(submissionForm);
        var type = submissionType.value;
        var endpoint = type === 'amendment' ? 'timelineAmendments' : 'timelineEntries';
        
        // Validate amendment form - must have an entry selected
        if (type === 'amendment') {
            var amendmentDropdown = document.getElementById('originalEntryDate');
            if (!amendmentDropdown || !amendmentDropdown.value) {
                // Show error message
                var errorMsg = document.getElementById('submission-error');
                errorMsg.textContent = 'Please select an entry to amend from the dropdown.';
                errorMsg.style.display = 'block';
                
                // Scroll to the dropdown
                amendmentDropdown.scrollIntoView({ behavior: 'smooth', block: 'center' });
                amendmentDropdown.focus();
                
                return; // Stop submission
            }
        }
        
        // Clear any previous error messages
        document.getElementById('submission-error').style.display = 'none';
        
        // Check if user has opted to skip confirmation modal
        // This preference is saved when user checks "Don't show again"
        var skipConfirmation = localStorage.getItem('skipSubmissionConfirmation') === 'true';
        
        if (!skipConfirmation) {
            // Show confirmation modal
            showConfirmationModal(formData, type, endpoint);
            return;
        }
        
        // Proceed directly with submission
        proceedWithSubmission(formData, type, endpoint);
    });
    
    /**
     * Shows confirmation modal before submission
     * Displays all fields that will be public on GitHub
     * @param {FormData} formData - The form data to be submitted
     * @param {string} type - Type of submission (new/amendment)
     * @param {string} endpoint - Staticman endpoint to use
     */
    function showConfirmationModal(formData, type, endpoint) {
        var modal = document.getElementById('confirmation-modal');
        
        // Populate modal fields
        document.getElementById('confirm-name').textContent = document.getElementById('name').value;
        document.getElementById('confirm-date').textContent = document.getElementById('date').value;
        document.getElementById('confirm-title').textContent = document.getElementById('title').value;
        
        var description = document.getElementById('description').value;
        document.getElementById('confirm-description').textContent = 
            description.length > 100 ? description.substring(0, 100) + '...' : description;
        
        // Handle amendment fields
        var amendmentField = modal.querySelector('.amendment-field');
        if (type === 'amendment') {
            amendmentField.style.display = 'flex';
            var amendments = document.getElementById('amendments').value;
            document.getElementById('confirm-amendments').textContent = 
                amendments.length > 100 ? amendments.substring(0, 100) + '...' : amendments;
        } else {
            amendmentField.style.display = 'none';
        }
        
        // Handle citations
        var citations = document.getElementById('citations').value;
        document.getElementById('confirm-citations').textContent = 
            citations ? (citations.length > 50 ? citations.substring(0, 50) + '...' : citations) : '(none provided)';
        
        // Handle image fields
        var imageUrls = document.getElementById('image-urls').value;
        var imageCaptions = document.getElementById('image-captions').value;
        var imageSources = document.getElementById('image-sources').value;
        
        // Image URLs
        var imageContainer = document.getElementById('confirm-images-container');
        if (imageUrls) {
            imageContainer.style.display = 'flex';
            document.getElementById('confirm-images').textContent = 
                imageUrls.length > 100 ? imageUrls.substring(0, 100) + '...' : imageUrls;
        } else {
            imageContainer.style.display = 'none';
        }
        
        // Image Captions
        var captionsContainer = document.getElementById('confirm-captions-container');
        if (imageCaptions) {
            captionsContainer.style.display = 'flex';
            document.getElementById('confirm-captions').textContent = 
                imageCaptions.length > 100 ? imageCaptions.substring(0, 100) + '...' : imageCaptions;
        } else {
            captionsContainer.style.display = 'none';
        }
        
        // Image Sources
        var sourcesContainer = document.getElementById('confirm-sources-container');
        if (imageSources) {
            sourcesContainer.style.display = 'flex';
            document.getElementById('confirm-sources').textContent = 
                imageSources.length > 100 ? imageSources.substring(0, 100) + '...' : imageSources;
        } else {
            sourcesContainer.style.display = 'none';
        }
        
        // Show modal
        modal.classList.add('active');
        
        // Handle buttons
        document.getElementById('cancel-submission').onclick = function() {
            modal.classList.remove('active');
        };
        
        document.getElementById('proceed-submission').onclick = function() {
            // Check if "don't show again" is checked
            if (document.getElementById('dont-show-again').checked) {
                localStorage.setItem('skipSubmissionConfirmation', 'true');
            }
            
            modal.classList.remove('active');
            proceedWithSubmission(formData, type, endpoint);
        };
    }
    
    // Function to proceed with submission
    function proceedWithSubmission(formData, type, endpoint) {
        
        // Show loading state
        submitButton.disabled = true;
        submitButton.textContent = 'Submitting...';
        document.getElementById('submission-error').style.display = 'none';
        
        // Build Staticman URL
        var staticmanUrl = window.STATICMAN_CONFIG.baseUrl + '/v3/entry/' + 
            window.STATICMAN_CONFIG.username + '/' + 
            window.STATICMAN_CONFIG.repository + '/' + 
            window.STATICMAN_CONFIG.branch + '/' + 
            endpoint;
        
        // Add reCAPTCHA if configured
        if (window.STATICMAN_CONFIG.recaptchaSiteKey && window.grecaptcha) {
            grecaptcha.ready(function() {
                grecaptcha.execute(window.STATICMAN_CONFIG.recaptchaSiteKey, {action: 'submit'})
                    .then(function(token) {
                        formData.append('g-recaptcha-response', token);
                        submitToStaticman(staticmanUrl, formData, type);
                    });
            });
        } else {
            submitToStaticman(staticmanUrl, formData, type);
        }
    }
}

function submitToStaticman(url, formData, type) {
    var submitButton = document.getElementById('submit-button');
    var submissionForm = document.getElementById('submission-form');
    var submissionModal = document.getElementById('submission-modal');
    
    fetch(url, {
        method: 'POST',
        body: formData,
        headers: {
            'Accept': 'application/json'
        }
    })
    .then(function(response) {
        if (!response.ok) {
            // Try to parse error response
            return response.text().then(function(text) {
                try {
                    var data = JSON.parse(text);
                    throw new Error(data.errorCode || data.message || 'Submission failed: ' + response.status);
                } catch (e) {
                    throw new Error('Server error (' + response.status + '): ' + text.substring(0, 100));
                }
            });
        }
        return response.json();
    })
    .then(function(data) {
        console.log('Submission successful:', data);
        
        // Extract PR URL from redirect or response
        var prUrl = '';
        if (data && data.redirect) {
            prUrl = data.redirect;
        } else if (data && data.url) {
            prUrl = data.url;
        }
        
        // New approach: Replace entire modal content with success message
        var modalContent = document.querySelector('.submission-modal-content');
        if (!modalContent) {
            console.error('Modal content container not found');
            return;
        }
        
        // Store original content for restoration globally
        window.originalModalContent = modalContent.innerHTML;
        
        // Create success screen HTML
        var successHTML = `
            <button class="modal-close" onclick="location.reload()" aria-label="Close" style="position: absolute; top: 1rem; right: 1rem; background: none; border: none; cursor: pointer; padding: 0.5rem;">
                <svg viewBox="0 0 24 24" style="width: 24px; height: 24px; fill: var(--text-secondary, #666);">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
            </button>
            <div style="text-align: center; padding: 2rem; min-height: 300px; display: flex; flex-direction: column; justify-content: center;">
                <div style="margin-bottom: 1.5rem;">
                    <div style="width: 60px; height: 60px; margin: 0 auto 1rem; background: var(--success-bg, #4CAF50); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                        <svg viewBox="0 0 24 24" style="width: 36px; height: 36px; fill: white;">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                        </svg>
                    </div>
                    <h2 style="color: var(--text-primary, #333); font-size: 1.75rem; margin: 0 0 0.75rem; font-weight: 600;">Submitted!</h2>
                </div>
                
                <div style="max-width: 400px; margin: 0 auto;">
                    <p style="font-size: 1rem; color: var(--text-secondary, #666); margin-bottom: 1.25rem; line-height: 1.4;">
                        Thank you. We'll review and add to the timeline once approved.
                    </p>
                    
                    <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
                        ${prUrl ? `<a href="${prUrl}" 
                           target="_blank" 
                           style="color: var(--link-color, #1976d2); text-decoration: none; font-weight: 500; display: inline-flex; align-items: center; gap: 0.4rem; font-size: 0.95rem;">
                            View your submission on GitHub
                            <svg viewBox="0 0 24 24" style="width: 14px; height: 14px; fill: currentColor;">
                                <path d="M14,3V5H17.59L7.76,14.83L9.17,16.24L19,6.41V10H21V3M19,19H5V5H12V3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V12H19V19Z"/>
                            </svg>
                        </a>` : `<a href="https://github.com/${window.STATICMAN_CONFIG.username}/${window.STATICMAN_CONFIG.repository}/issues" 
                           target="_blank" 
                           style="color: var(--link-color, #1976d2); text-decoration: none; font-weight: 500; display: inline-flex; align-items: center; gap: 0.4rem; font-size: 0.95rem;">
                            View your submission on GitHub
                            <svg viewBox="0 0 24 24" style="width: 14px; height: 14px; fill: currentColor;">
                                <path d="M14,3V5H17.59L7.76,14.83L9.17,16.24L19,6.41V10H21V3M19,19H5V5H12V3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V12H19V19Z"/>
                            </svg>
                        </a>`}
                        <button onclick="var mc = document.querySelector('.submission-modal-content'); if(mc && window.originalModalContent) { mc.innerHTML = window.originalModalContent; if(typeof window.updateSubmissionHandler === 'function') { window.updateSubmissionHandler(); } }" 
                                style="background: var(--button-bg, #1f6c49); color: white; border: none; padding: 0.5rem 1.25rem; border-radius: 4px; cursor: pointer; font-weight: 500; font-size: 0.95rem;">
                            Submit Another
                        </button>
                    </div>
                </div>
            </div>
            <style>
                [data-theme="dark"] {
                    --success-bg: #2e7d32;
                    --text-primary: #e0e0e0;
                    --text-secondary: #b0b0b0;
                    --bg-secondary: #2a2a2a;
                    --link-color: #64b5f6;
                    --button-bg: #2e7d32;
                }
                [data-theme="light"] {
                    --success-bg: #4CAF50;
                    --text-primary: #333;
                    --text-secondary: #666;
                    --bg-secondary: #f5f5f5;
                    --link-color: #1976d2;
                    --button-bg: #1f6c49;
                }
            </style>
        `;
        
        // Replace modal content with success screen
        modalContent.innerHTML = successHTML;
        console.log('Success screen displayed');
        
        // Save to localStorage as backup
        var submission = {};
        formData.forEach(function(value, key) {
            if (!key.startsWith('options[') && !key.startsWith('fields[')) {
                submission[key] = value;
            }
        });
        submission.timestamp = new Date().toISOString();
        submission.type = type;
        
        var existingSubmissions = JSON.parse(localStorage.getItem('fogh_timeline_submissions') || '[]');
        existingSubmissions.push(submission);
        localStorage.setItem('fogh_timeline_submissions', JSON.stringify(existingSubmissions));
        
        // Form will be reset when user clicks "Submit Another" or closes the modal
        // No auto-close functionality
    })
    .catch(function(error) {
        // Show error message
        var errorMsg = document.getElementById('submission-error');
        var errorText = 'Error: ' + error.message;
        
        // Provide helpful error messages
        if (error.message === 'Failed to fetch' || error.message === 'Load failed') {
            errorText = 'Unable to connect to submission service. This could be because:\n' +
                '• The Staticman service is not properly deployed\n' +
                '• Network connection issues\n' +
                '• CORS (Cross-Origin) restrictions\n\n' +
                'URL attempted: ' + url;
        } else if (error.message.includes('GITHUB_AUTH')) {
            errorText += '. The Staticman GitHub authentication is not configured properly.';
        } else if (error.message.includes('MISSING_REQUIRED')) {
            errorText += '. Please fill in all required fields.';
        } else if (error.message.includes('RECAPTCHA')) {
            errorText += '. reCAPTCHA verification failed.';
        } else if (error.message.includes('404')) {
            errorText = 'Staticman endpoint not found. The service may not be properly deployed at: ' + window.STATICMAN_CONFIG.baseUrl;
        }
        
        errorMsg.style.whiteSpace = 'pre-line';
        errorMsg.textContent = errorText;
        errorMsg.style.display = 'block';
        
        // Reset button
        submitButton.disabled = false;
        submitButton.textContent = 'Submit for Review';
        
        console.error('Staticman submission error:', error);
        console.error('Attempted URL:', url);
        console.error('Form data:', Object.fromEntries(formData));
    });
}

// Check if debug mode is enabled
function isDebugMode() {
    return window.location.search.includes('debug=true');
}

// Prepopulate form fields for testing
function prepopulateDebugData() {
    if (!isDebugMode()) return;
    
    console.log('Debug mode enabled - prepopulating form fields');
    
    // Wait a bit for form to be fully initialized
    setTimeout(function() {
        var form = document.getElementById('submission-form');
        if (!form) return;
        
        // Add debug mode indicator to modal title
        var modalTitle = document.getElementById('submission-title');
        if (modalTitle && !modalTitle.textContent.includes('[DEBUG MODE]')) {
            modalTitle.innerHTML = '<span style="color: #ff6b6b;">[DEBUG MODE]</span> ' + modalTitle.textContent;
        }
        
        // Check if we're in amendment mode
        var submissionType = document.getElementById('submissionType');
        var isAmendment = submissionType && submissionType.value === 'amendment';
        
        // Common fields for both new and amendment
        var nameField = document.getElementById('name');
        var emailField = document.getElementById('email');
        if (nameField) nameField.value = 'Debug Tester';
        if (emailField) emailField.value = 'debug@test.local';
        
        if (!isAmendment) {
            // Prepopulate fields for new entry only
            var dateField = document.getElementById('date');
            var titleField = document.getElementById('title');
            var descriptionField = document.getElementById('description');
            var citationsField = document.getElementById('citations');
            var imageUrlsField = document.getElementById('image-urls');
            var imageCaptionsField = document.getElementById('image-captions');
            var imageSourcesField = document.getElementById('image-sources');
            
            if (dateField) dateField.value = '2024-' + (new Date().getMonth() + 1).toString().padStart(2, '0');
            if (titleField) titleField.value = '[TEST] Debug Test Entry - ' + new Date().toLocaleTimeString();
            if (descriptionField) descriptionField.value = 'This is a test entry created in debug mode for testing the Staticman integration. ' +
                'It contains sample content to verify that form submission and pull request creation are working correctly. ' +
                'This entry should not be merged into the main timeline.';
            if (citationsField) citationsField.value = 'Debug Mode Test\nCreated automatically for testing\nTimestamp: ' + new Date().toISOString();
            if (imageUrlsField) imageUrlsField.value = 'https://via.placeholder.com/400x300/4CAF50/ffffff?text=Debug+Test+Image';
            if (imageCaptionsField) imageCaptionsField.value = 'Debug mode test image placeholder';
            if (imageSourcesField) imageSourcesField.value = 'Debug mode - auto generated';
        } else {
            // For amendments in debug mode
            var amendmentDropdown = document.getElementById('originalEntryDate');
            var amendmentsField = document.getElementById('amendments');
            
            // Select first entry if none selected
            if (amendmentDropdown && amendmentDropdown.options.length > 1 && !amendmentDropdown.value) {
                amendmentDropdown.selectedIndex = 1;
            }
            
            // Trigger change event to populate fields
            if (amendmentDropdown && amendmentDropdown.value) {
                var event = new Event('change', { bubbles: true });
                amendmentDropdown.dispatchEvent(event);
            }
            
            // Set amendment-specific debug text after a delay to ensure fields are populated
            setTimeout(function() {
                if (amendmentsField) {
                    amendmentsField.value = '[TEST] Debug amendment - This is a test amendment to verify the amendment form functionality. ' +
                        'The date should be corrected from X to Y. Additional information about Z should be added.';
                }
            }, 200);
        }
        
        console.log('Debug form prepopulated');
    }, 500);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        updateSubmissionHandler();
        prepopulateDebugData();
    });
} else {
    updateSubmissionHandler();
    prepopulateDebugData();
}

// Also update any suggest-edit button handlers
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('suggest-edit')) {
        // The existing modal opening code should work as-is
        // Just ensure the form uses Staticman submission
        setTimeout(function() {
            updateSubmissionHandler();
            prepopulateDebugData();
        }, 100);
    }
});

// Also handle the add-entry-button click for debug mode
document.addEventListener('click', function(e) {
    if (e.target.id === 'add-entry-button' || e.target.closest('#add-entry-button')) {
        setTimeout(prepopulateDebugData, 100);
    }
});