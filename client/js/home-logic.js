
document.addEventListener('DOMContentLoaded', () => {
    console.log('--- DSA Media Crew Contact Logic Loaded ---');

    // Handle form submission
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        console.log('SUCCESS: Contact form #contactForm found in DOM.');
        contactForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            console.log('EVENT: Contact form submit triggered.');
            const form = event.target;
            const successMsg = document.getElementById('successMsg');
            
            // Disable button during "submission"
            const btn = form.querySelector('button');
            const originalText = btn.innerText;
            btn.innerText = "Sending...";
            btn.disabled = true;

            try {
                const formData = new FormData(form);
                const data = Object.fromEntries(formData.entries());
                console.log('FETCH: Sending request to /api/contact with data:', data);

                const response = await fetch('/api/contact', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });

                console.log('RESPONSE: Received from /api/contact:', response.status);
                if (response.ok) {
                    console.log('SUCCESS: Form submitted correctly.');
                    if (successMsg) successMsg.style.display = 'block';
                    form.reset();
                    setTimeout(() => {
                        if (successMsg) successMsg.style.display = 'none';
                    }, 3000);
                } else {
                    console.error('ERROR: Backend returned non-OK status:', response.status);
                    const errorText = await response.text();
                    console.error('Error body:', errorText);
                    alert('Failed to send message. Please try again.');
                }
            } catch (error) {
                console.error('FETCH ERROR: Network or runtime error during submission:', error);
                alert('An error occurred. Please try again later.');
            } finally {
                btn.innerText = originalText;
                btn.disabled = false;
            }
        });
    } else {
        console.warn('WARNING: Contact form #contactForm NOT found in DOM.');
    }
});


