document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('assessmentForm');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const resultModal = document.getElementById('resultModal');
    
    // Replace this URL with your actual Google Apps Script Web App URL after setup
    const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby-WB95L78AWfK9yN2WYCOTBoQcpyPcewblTwmaNyxQAs5ycBkEV-Qp6KdjjJ7mShB5/exec';

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // 1. Calculate Score
        const formData = new FormData(form);
        let yesCount = 0;
        let answers = {};
        
        for (let i = 1; i <= 16; i++) {
            const answer = formData.get(`q${i}`);
            answers[`q${i}`] = answer;
            if (answer === 'Yes') {
                yesCount++;
            }
        }
        
        const email = formData.get('email');
        
        // Determine Result Category
        let resultCategory = "";
        let resultClass = "";
        let resultIconHtml = "";
        let resultTextStr = "";
        
        if (yesCount >= 12) {
            resultCategory = "Stable (but still requires monitoring)";
            resultClass = "stable";
            resultIconHtml = '<i class="fa-solid fa-circle-check"></i>';
            resultTextStr = "Your supply chain shows strong stability. Keep monitoring to maintain this standard.";
        } else if (yesCount >= 7) {
            resultCategory = "Hidden risks present";
            resultClass = "warning";
            resultIconHtml = '<i class="fa-solid fa-triangle-exclamation"></i>';
            resultTextStr = "There are vulnerabilities in your system that could cause bottlenecks during scaling.";
        } else {
            resultCategory = "System likely to fail under scale";
            resultClass = "danger";
            resultIconHtml = '<i class="fa-solid fa-circle-xmark"></i>';
            resultTextStr = "Critical risks detected. Scaling right now without addressing these issues will likely cause breakdowns.";
        }

        // 2. Prepare Data for Submission
        // Using URLSearchParams allows Google Apps Script doPost to easily parse it using e.parameter
        const payload = new URLSearchParams();
        payload.append('email', email);
        payload.append('score', yesCount);
        payload.append('result', resultCategory);
        for (let i = 1; i <= 16; i++) {
            payload.append(`q${i}`, answers[`q${i}`]);
        }

        // 3. Show Loading
        loadingOverlay.classList.add('active');

        try {
            // If the URL hasn't been set yet, we just simulate a delay and show result for testing
            if (GOOGLE_SCRIPT_URL === 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE') {
                console.warn('Google Script URL not set. Simulating submission.');
                await new Promise(resolve => setTimeout(resolve, 1500));
            } else {
                // Actual submission
                await fetch(GOOGLE_SCRIPT_URL, {
                    method: 'POST',
                    body: payload,
                    // mode: 'no-cors' is often needed when posting to Google Apps Script from a different domain
                    mode: 'no-cors'
                });
            }

            // 4. Hide Loading, Show Result Modal
            loadingOverlay.classList.remove('active');
            
            // Update Modal UI
            const modalContent = document.querySelector('.modal-content');
            modalContent.className = `modal-content ${resultClass}`;
            
            document.getElementById('resultIcon').innerHTML = resultIconHtml;
            document.getElementById('resultIcon').className = `modal-icon ${resultClass}`;
            
            document.getElementById('scoreValue').textContent = yesCount;
            document.getElementById('resultText').textContent = resultTextStr;
            
            const progressPercent = (yesCount / 16) * 100;
            setTimeout(() => {
                document.getElementById('statusProgress').style.width = `${progressPercent}%`;
            }, 300);

            resultModal.classList.add('active');
            
            // Reset form
            form.reset();

        } catch (error) {
            console.error('Submission failed:', error);
            loadingOverlay.classList.remove('active');
            alert('Something went wrong while saving your assessment. Please try again.');
        }
    });
});

// Expose closeModal to global scope for the button onclick attribute
window.closeModal = function() {
    const resultModal = document.getElementById('resultModal');
    resultModal.classList.remove('active');
    document.getElementById('statusProgress').style.width = '0%';
};
