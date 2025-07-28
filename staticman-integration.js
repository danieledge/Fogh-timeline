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
        
        // Debug logging
        console.log('Looking for success message element...');
        console.log('Current DOM state:', {
            modalVisible: submissionModal.classList.contains('active'),
            formVisible: submissionForm.style.display,
            modalHTML: submissionModal.innerHTML.substring(0, 200) + '...'
        });
        
        var successMsg = document.getElementById('submission-success');
        console.log('Success message element:', successMsg);
        console.log('Success message current display:', successMsg ? successMsg.style.display : 'element not found');
        
        // Hide form, tabs, and title
        submissionForm.style.display = 'none';
        var tabsContainer = document.querySelector('.submission-tabs');
        if (tabsContainer) {
            tabsContainer.style.display = 'none';
        }
        var modalTitle = document.getElementById('submission-title');
        if (modalTitle) {
            modalTitle.style.display = 'none';
        }
        
        // Update and show success message
        if (successMsg) {
            console.log('Setting success message display to block...');
            // Clear any existing content first
            successMsg.innerHTML = '';
            // Force display block with !important to override any other styles
            successMsg.setAttribute('style', 'display: block !important;');
            successMsg.innerHTML = '<div style="text-align: center; padding: 2rem;">' +
                '<h2 style="color: #4CAF50; font-size: 2rem; margin-bottom: 1rem;">✓ Thank You!</h2>' +
                '<p style="font-size: 1.2rem; margin-bottom: 1.5rem;">Your suggested edit has been successfully submitted.</p>' +
                '<p style="margin-bottom: 1rem;">Our moderators will review your submission and it will appear on the timeline once approved.</p>' +
                '<p style="margin-bottom: 2rem;"><a href="https://github.com/' + 
                window.STATICMAN_CONFIG.username + '/' + 
                window.STATICMAN_CONFIG.repository + '/pulls" target="_blank" style="color: #1f6c49; text-decoration: underline;">Track your submission on GitHub</a></p>' +
                '<p style="font-style: italic; color: #666; font-size: 0.9rem;">This window will close automatically in 5 seconds...</p>' +
                '</div>';
            console.log('Success message HTML updated and display forced to block');
            console.log('Success message final display:', successMsg.style.display);
            console.log('Success message offsetHeight (should be > 0 if visible):', successMsg.offsetHeight);
        } else {
            console.error('Success message element not found!');
            // Try to find any element with submission in the id
            var allElements = document.querySelectorAll('[id*="submission"]');
            console.log('Found elements with "submission" in ID:', allElements);
            
            // As a fallback, create the success message if it doesn't exist
            var formContainer = submissionForm.parentElement;
            var newSuccessMsg = document.createElement('div');
            newSuccessMsg.id = 'submission-success';
            newSuccessMsg.className = 'form-success dynamically-created';
            newSuccessMsg.style.display = 'block';
            newSuccessMsg.innerHTML = '<div style="text-align: center; padding: 2rem;">' +
                '<h2 style="color: #4CAF50; font-size: 2rem; margin-bottom: 1rem;">✓ Thank You!</h2>' +
                '<p style="font-size: 1.2rem; margin-bottom: 1.5rem;">Your suggested edit has been successfully submitted.</p>' +
                '<p style="margin-bottom: 1rem;">Our moderators will review your submission and it will appear on the timeline once approved.</p>' +
                '<p style="margin-bottom: 2rem;"><a href="https://github.com/' + 
                window.STATICMAN_CONFIG.username + '/' + 
                window.STATICMAN_CONFIG.repository + '/pulls" target="_blank" style="color: #1f6c49; text-decoration: underline;">Track your submission on GitHub</a></p>' +
                '<p style="font-style: italic; color: #666; font-size: 0.9rem;">This window will close automatically in 5 seconds...</p>' +
                '</div>';
            formContainer.appendChild(newSuccessMsg);
            console.log('Created new success message element as fallback');
        }
        
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
            submissionModal.classList.remove('active');
            submissionForm.style.display = 'block';
            submissionForm.reset();
            submitButton.disabled = false;
            submitButton.textContent = 'Submit for Review';
            
            // Hide success message - try multiple methods
            var successMsg = document.getElementById('submission-success');
            if (successMsg) {
                successMsg.style.display = 'none';
                successMsg.setAttribute('style', 'display: none;');
                // If it was dynamically created, remove it
                if (successMsg.classList.contains('dynamically-created')) {
                    successMsg.remove();
                }
            }
            
            // Show tabs and title again
            var tabsContainer = document.querySelector('.submission-tabs');
            if (tabsContainer) {
                tabsContainer.style.display = 'flex';
            }
            var modalTitle = document.getElementById('submission-title');
            if (modalTitle) {
                modalTitle.style.display = 'block';
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

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateSubmissionHandler);
} else {
    updateSubmissionHandler();
}

// Also update any suggest-edit button handlers
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('suggest-edit')) {
        // The existing modal opening code should work as-is
        // Just ensure the form uses Staticman submission
        setTimeout(updateSubmissionHandler, 100);
    }
});