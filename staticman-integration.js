// Staticman Integration for FoGH Timeline
// This file contains the updated submission handling code that integrates with Staticman

// Configuration - Update these with your actual values
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

// Function to replace the email-based submission with Staticman API submission
function updateSubmissionHandler() {
    var submissionForm = document.getElementById('submission-form');
    var submitButton = document.getElementById('submit-button');
    var submissionType = document.getElementById('submissionType');
    
    if (!submissionForm) return;
    
    // Remove existing event listeners by cloning the form
    var newForm = submissionForm.cloneNode(true);
    submissionForm.parentNode.replaceChild(newForm, submissionForm);
    submissionForm = newForm;
    submitButton = document.getElementById('submit-button');
    
    // Add new Staticman submission handler
    submissionForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        var formData = new FormData(submissionForm);
        var type = submissionType.value;
        var endpoint = type === 'amendment' ? 'timelineAmendments' : 'timelineEntries';
        
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
    });
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
        
        // New approach: Replace entire modal content with success message
        var modalContent = document.querySelector('.submission-modal-content');
        if (!modalContent) {
            console.error('Modal content container not found');
            return;
        }
        
        // Store original content for restoration
        var originalContent = modalContent.innerHTML;
        
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
                    <h2 style="color: var(--text-primary, #333); font-size: 1.75rem; margin: 0 0 0.75rem; font-weight: 600;">Successfully Submitted!</h2>
                </div>
                
                <div style="max-width: 400px; margin: 0 auto;">
                    <p style="font-size: 1.1rem; color: var(--text-primary, #333); margin-bottom: 1.25rem; line-height: 1.5;">
                        Thank you for your contribution to the Gipsy Hill timeline.
                    </p>
                    
                    <div style="background: var(--bg-secondary, #f5f5f5); border-radius: 6px; padding: 1rem; margin-bottom: 1.5rem;">
                        <p style="margin: 0; color: var(--text-secondary, #666); font-size: 0.9rem; line-height: 1.5;">
                            We'll review your submission and once approved, it will appear on the timeline.
                        </p>
                    </div>
                    
                    <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
                        <a href="https://github.com/${window.STATICMAN_CONFIG.username}/${window.STATICMAN_CONFIG.repository}/pulls" 
                           target="_blank" 
                           style="color: var(--link-color, #1976d2); text-decoration: none; font-weight: 500; display: inline-flex; align-items: center; gap: 0.4rem; font-size: 0.95rem;">
                            View on GitHub
                            <svg viewBox="0 0 24 24" style="width: 14px; height: 14px; fill: currentColor;">
                                <path d="M14,3V5H17.59L7.76,14.83L9.17,16.24L19,6.41V10H21V3M19,19H5V5H12V3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V12H19V19Z"/>
                            </svg>
                        </a>
                        <button onclick="location.reload()" 
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
    return window.location.search.includes('debug');
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
        
        // Prepopulate fields for new entry
        var dateField = document.getElementById('date');
        var titleField = document.getElementById('title');
        var descriptionField = document.getElementById('description');
        var citationsField = document.getElementById('citations');
        var nameField = document.getElementById('name');
        var emailField = document.getElementById('email');
        var imageUrlsField = document.getElementById('image-urls');
        var imageCaptionsField = document.getElementById('image-captions');
        var imageSourcesField = document.getElementById('image-sources');
        
        if (dateField) dateField.value = '2024-' + (new Date().getMonth() + 1).toString().padStart(2, '0');
        if (titleField) titleField.value = '[TEST] Debug Test Entry - ' + new Date().toLocaleTimeString();
        if (descriptionField) descriptionField.value = 'This is a test entry created in debug mode for testing the Staticman integration. ' +
            'It contains sample content to verify that form submission and pull request creation are working correctly. ' +
            'This entry should not be merged into the main timeline.';
        if (citationsField) citationsField.value = 'Debug Mode Test\nCreated automatically for testing\nTimestamp: ' + new Date().toISOString();
        if (nameField) nameField.value = 'Debug Tester';
        if (emailField) emailField.value = 'debug@test.local';
        if (imageUrlsField) imageUrlsField.value = 'https://via.placeholder.com/400x300/4CAF50/ffffff?text=Debug+Test+Image';
        if (imageCaptionsField) imageCaptionsField.value = 'Debug mode test image placeholder';
        if (imageSourcesField) imageSourcesField.value = 'Debug mode - auto generated';
        
        // Also add a debug notice at the top of the form
        // Commented out per user request
        /*
        var debugNotice = document.getElementById('debug-notice');
        if (!debugNotice) {
            debugNotice = document.createElement('div');
            debugNotice.id = 'debug-notice';
            debugNotice.style.cssText = 'background: #ffe0e0; border: 2px solid #ff6b6b; padding: 10px; margin-bottom: 15px; border-radius: 5px; text-align: center; font-weight: bold; color: #d32f2f;';
            debugNotice.innerHTML = '⚠️ DEBUG MODE ACTIVE - Form pre-filled with test data';
            form.insertBefore(debugNotice, form.firstChild);
        }
        */
        
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