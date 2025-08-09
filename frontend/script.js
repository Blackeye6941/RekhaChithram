const cameraFeed = document.getElementById('cameraFeed');
        const startButton = document.getElementById('startButton');
        const captureButton = document.getElementById('captureButton');
        const generateButton = document.getElementById('generateButton');
        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d');
        const outputDiv = document.getElementById('output');
        const statusDiv = document.getElementById('status');

        let stream = null;
        let base64Image = '';

        // Helper function to show status messages
        function showStatus(message, type = 'info') {
            statusDiv.innerHTML = `<div class="status ${type}">${message}</div>`;
        }

        // Start camera
        startButton.addEventListener('click', async () => {
            try {
                showStatus('Starting camera...', 'info');
                
                stream = await navigator.mediaDevices.getUserMedia({ 
                    video: { 
                        width: { ideal: 1280 },
                        height: { ideal: 720 }
                    } 
                });
                
                cameraFeed.srcObject = stream;
                
                cameraFeed.onloadedmetadata = () => {
                    canvas.width = cameraFeed.videoWidth;
                    canvas.height = cameraFeed.videoHeight;
                };
                
                startButton.disabled = true;
                captureButton.disabled = false;
                showStatus('The Horoscope is Active!', 'success');
                
            } catch (error) {
                console.error('You have no future!!', error);
                showStatus(`Even The Camera rejected your palm(Beware): ${error.message}`, 'error');
            }
        });

        // Capture image
        captureButton.addEventListener('click', () => {
            if (stream && cameraFeed.videoWidth > 0) {
                // Draw video frame to canvas
                canvas.width = cameraFeed.videoWidth;
                canvas.height = cameraFeed.videoHeight;
                ctx.drawImage(cameraFeed, 0, 0);
                
                // Convert canvas to base64
                base64Image = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
                
                // Show canvas with captured image
                canvas.classList.remove('hidden');
                generateButton.disabled = false;
                
                showStatus('Your Palm is Envisioned!', 'success');
                console.log('Image captured and converted to Base64.');
            }
        });

        // Generate content
        generateButton.addEventListener('click', async () => {
            if (!base64Image) {
                showStatus('Please capture an image first.', 'error');
                return;
            }

            outputDiv.innerHTML = '<div class="loading">Revealing Your Secrets!!</div>';
            showStatus('Unveiling the Mysteries...', 'info');

            try {
                const response = await fetch('http://localhost:3000/generate-content', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ image: base64Image }),
                });

                const data = await response.json();

                if (response.ok) {
                    outputDiv.innerHTML = `<div class="success">Time to fear!! Your Future is here</div><br>${data.content}`;
                    showStatus('Future Revealed!', 'success');
                } else {
                    outputDiv.innerHTML = `<div class="error">Error: ${data.error}</div>`;
                    showStatus(`Server Rejected your Palm: ${data.error}`, 'error');
                }
            } catch (error) {
                console.error('Error:', error);
                outputDiv.innerHTML = '<div class="error">Even the server prevented your future from revealing</div>';
                showStatus('Undetectable Palm', 'error');
            }
        });

        // Cleanup when page is closed
        window.addEventListener('beforeunload', () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        });