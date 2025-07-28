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
            <div style="text-align: center; padding: 3rem 2rem; min-height: 400px; display: flex; flex-direction: column; justify-content: center;">
                <div style="margin-bottom: 2rem;">
                    <div style="width: 80px; height: 80px; margin: 0 auto 1.5rem; background: #4CAF50; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                        <svg viewBox="0 0 24 24" style="width: 50px; height: 50px; fill: white;">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                        </svg>
                    </div>
                    <h2 style="color: #2e7d32; font-size: 2.5rem; margin: 0 0 1rem; font-weight: 600;">Success!</h2>
                </div>
                
                <div style="max-width: 500px; margin: 0 auto;">
                    <p style="font-size: 1.25rem; color: #333; margin-bottom: 1.5rem; line-height: 1.6;">
                        Your timeline entry has been successfully submitted for review.
                    </p>
                    
                    <div style="background: #f5f5f5; border-radius: 8px; padding: 1.5rem; margin-bottom: 2rem; text-align: left;">
                        <p style="margin: 0 0 0.75rem; color: #666; font-size: 0.95rem;">
                            <strong>What happens next?</strong>
                        </p>
                        <ul style="margin: 0; padding-left: 1.5rem; color: #666; font-size: 0.9rem; line-height: 1.6;">
                            <li>Our moderators will review your submission</li>
                            <li>Once approved, it will appear on the timeline</li>
                            <li>You'll receive updates via GitHub</li>
                        </ul>
                    </div>
                    
                    <p style="margin-bottom: 2rem;">
                        <a href="https://github.com/${window.STATICMAN_CONFIG.username}/${window.STATICMAN_CONFIG.repository}/pulls" 
                           target="_blank" 
                           style="color: #1976d2; text-decoration: none; font-weight: 500; display: inline-flex; align-items: center; gap: 0.5rem;">
                            Track your submission on GitHub
                            <svg viewBox="0 0 24 24" style="width: 16px; height: 16px; fill: currentColor;">
                                <path d="M14,3V5H17.59L7.76,14.83L9.17,16.24L19,6.41V10H21V3M19,19H5V5H12V3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V12H19V19Z"/>
                            </svg>
                        </a>
                    </p>
                    
                    <p style="color: #999; font-size: 0.875rem; margin: 0;">
                        This window will close in <span id="countdown">5</span> seconds...
                    </p>
                </div>
            </div>
        `;
        
        // Replace modal content with success screen
        modalContent.innerHTML = successHTML;
        console.log('Success screen displayed');
        
        // Countdown timer
        var countdown = 5;
        var countdownElement = document.getElementById('countdown');
        var countdownInterval = setInterval(function() {
            countdown--;
            if (countdownElement) {
                countdownElement.textContent = countdown;
            }
            if (countdown <= 0) {
                clearInterval(countdownInterval);
            }
        }, 1000);
        
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
        
        // Reset form after delay
        setTimeout(function() {
            console.log('Resetting form and modal...');
            
            // Close the modal
            submissionModal.classList.remove('active');
            
            // Restore original modal content
            modalContent.innerHTML = originalContent;
            
            // Re-initialize the form handler since we replaced the DOM
            updateSubmissionHandler();
            
            // Reset form data
            var form = document.getElementById('submission-form');
            if (form) {
                form.reset();
            }
            
            // Reset button state
            var button = document.getElementById('submit-button');
            if (button) {
                button.disabled = false;
                button.textContent = 'Submit for Review';
            }
            
            console.log('Form reset complete');
        }, 5000);
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