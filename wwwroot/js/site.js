// Please see documentation at https://learn.microsoft.com/aspnet/core/client-side/bundling-and-minification
// for details on configuring this project to bundle and minify static web assets.

// Write your JavaScript code.

console.log("SofIA: System initialized");
document.addEventListener('DOMContentLoaded', function () {
    console.log("SofIA: DOM Content Loaded");

    // --- Carousel Logic ---
    const slideContainer = document.querySelector('.carousel-slide');
    const slides = document.querySelectorAll('.carousel-slide img');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    if (slideContainer && slides.length > 0) {
        let currentIndex = 0;
        const totalSlides = slides.length;
        const intervalTime = 6000; // 4 seconds
        let slideInterval;

        function showSlide(index) {
            if (index >= totalSlides) {
                currentIndex = 0;
            } else if (index < 0) {
                currentIndex = totalSlides - 1;
            } else {
                currentIndex = index;
            }
            const offset = -currentIndex * 100;
            slideContainer.style.transform = `translateX(${offset}%)`;
        }

        function nextSlide() {
            showSlide(currentIndex + 1);
        }

        function prevSlide() {
            showSlide(currentIndex - 1);
        }

        function startAutoScroll() {
            slideInterval = setInterval(nextSlide, intervalTime);
        }

        function stopAutoScroll() {
            clearInterval(slideInterval);
        }

        // Event Listeners
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                nextSlide();
                stopAutoScroll();
                startAutoScroll();
            });
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                prevSlide();
                stopAutoScroll();
                startAutoScroll();
            });
        }

        // Click on image to open link
        slides.forEach(slide => {
            slide.addEventListener('click', () => {
                const link = slide.getAttribute('data-link');
                if (link) {
                    window.open(link, '_blank');
                }
            });
        });

        // Start auto-scroll
        startAutoScroll();
    }

    // --- Chat Logic (Full Page) ---
    const chatInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const chatHistory = document.getElementById('chat-history');

    if (chatInput && sendBtn && chatHistory) {
        sendBtn.addEventListener('click', sendMessage);
        chatInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });

        async function sendMessage() {
            const message = chatInput.value.trim();
            if (!message) return;

            // Add user message
            appendMessage(message, 'user-message');
            chatInput.value = '';
            chatInput.disabled = true;
            sendBtn.disabled = true;

            try {
                const response = await fetch('/api/gemini/chat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ message: message })
                });

                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                const data = await response.json();
                appendMessage(data.response, 'ai-message');
            } catch (error) {
                console.error('Error:', error);
                appendMessage('SofIA no está disponible en este momento. Intenta de nuevo más tarde.', 'ai-message');
            } finally {
                chatInput.disabled = false;
                sendBtn.disabled = false;
                chatInput.focus();
            }
        }

        function appendMessage(text, className) {
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${className}`;

            const contentDiv = document.createElement('div');
            contentDiv.className = 'message-content';
            contentDiv.textContent = text;

            messageDiv.appendChild(contentDiv);
            chatHistory.appendChild(messageDiv);
            chatHistory.scrollTop = chatHistory.scrollHeight;
        }
    }

    // --- Chat Widget Logic ---
    const widgetContainer = document.getElementById('chat-widget-container');
    const toggleBtn = document.getElementById('chat-toggle-btn');
    const openButtons = document.querySelectorAll('[data-open-sofia]');
    const closeBtn = document.getElementById('close-chat-btn');
    const widgetInput = document.getElementById('widget-user-input');
    const widgetSendBtn = document.getElementById('widget-send-btn');
    const widgetHistory = document.getElementById('widget-chat-history');

    // Shared State for Widget
    let isSoundOn = true;
    let welcomeRead = false;

    // Helper functions (moved to higher scope for widget)
    function typeWriter(element, text, speed = 30) {
        return new Promise(resolve => {
            let i = 0;
            element.textContent = '';
            function type() {
                if (i < text.length) {
                    element.textContent += text.charAt(i);
                    i++;
                    widgetHistory.scrollTop = widgetHistory.scrollHeight;
                    setTimeout(type, speed);
                } else {
                    resolve();
                }
            }
            type();
        });
    }

    // Simplified Audio Playback Function
    async function speak(text) {
        if (!isSoundOn) {
            console.log("SofIA: Sound is OFF, skipping speech.");
            return;
        }
        console.log("SofIA: Requesting audio for:", text.substring(0, 30) + "...");
        try {
            const response = await fetch('/api/gemini/tts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: text })
            });

            if (response.ok) {
                const data = await response.json();
                console.log("SofIA: Playing audio from URL:", data.url);
                const audio = new Audio(data.url);
                return audio.play().catch(e => console.error("SofIA: Play error:", e));
            } else {
                console.error("SofIA: TTS Server Error");
            }
        } catch (e) {
            console.error("SofIA: Network error during TTS", e);
        }
    }

    if (widgetContainer && toggleBtn && closeBtn) {
        const openWidget = async (prefill = '') => {
            widgetContainer.classList.add('open');
            widgetContainer.style.display = 'flex';
            widgetContainer.setAttribute('aria-hidden', 'false');
            toggleBtn.style.display = 'none';
            if (prefill && widgetInput) widgetInput.value = prefill;
            if (widgetInput) widgetInput.focus();

            if (isSoundOn && !welcomeRead) {
                console.log("SofIA: Reading welcome message...");
                welcomeRead = true;
                const welcomeMsg = widgetHistory.querySelector('.ai-message .message-content')?.textContent;
                if (welcomeMsg) {
                    speak(welcomeMsg.trim());
                }
            }
        };

        const closeWidget = () => {
            widgetContainer.classList.remove('open');
            widgetContainer.setAttribute('aria-hidden', 'true');
            toggleBtn.style.display = '';
            setTimeout(() => {
                if (!widgetContainer.classList.contains('open')) widgetContainer.style.display = 'none';
            }, 250);
        };

        openButtons.forEach(button => button.addEventListener('click', () => openWidget()));

        document.querySelectorAll('[data-sofia-prompt]').forEach(button => {
            button.addEventListener('click', () => openWidget(button.getAttribute('data-sofia-prompt') || ''));
        });

        closeBtn.addEventListener('click', closeWidget);
        document.addEventListener('keydown', event => {
            if (event.key === 'Escape' && widgetContainer.classList.contains('open')) closeWidget();
        });

        // Chat Logic for Widget
        if (widgetInput && widgetSendBtn && widgetHistory) {
            widgetSendBtn.addEventListener('click', () => sendWidgetMessage());
            widgetInput.addEventListener('keypress', function (e) {
                if (e.key === 'Enter') {
                    sendWidgetMessage();
                }
            });

            // Microphone Logic
            const micBtn = document.getElementById('mic-btn');
            const micIcon = document.getElementById('mic-icon');
            let recognition;
            let isRecording = false;

            if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
                const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
                recognition = new SpeechRecognition();
                recognition.lang = 'es-ES';
                recognition.continuous = true;
                recognition.interimResults = false;

                recognition.onresult = (event) => {
                    let transcript = event.results[event.results.length - 1][0].transcript;
                    if (transcript.toLowerCase().includes('enviar mensaje') || transcript.toLowerCase().includes('enviar el mensaje')) {
                        const cleanedTranscript = transcript.replace(/enviar mensaje|enviar el mensaje/gi, '').trim();
                        if (cleanedTranscript) widgetInput.value += (widgetInput.value ? ' ' : '') + cleanedTranscript;
                        recognition.stop();
                        isRecording = false;
                        micIcon.src = '/images/micon.png';
                        setTimeout(() => sendWidgetMessage(), 100);
                        return;
                    }
                    widgetInput.value += (widgetInput.value ? ' ' : '') + transcript;
                };

                recognition.onerror = () => {
                    isRecording = false;
                    micIcon.src = '/images/micon.png';
                };

                recognition.onend = () => {
                    isRecording = false;
                    micIcon.src = '/images/micon.png';
                };

                if (micBtn) {
                    micBtn.addEventListener('click', () => {
                        if (isRecording) {
                            recognition.stop();
                        } else {
                            recognition.start();
                            isRecording = true;
                            micIcon.src = '/images/micoff.png';
                        }
                    });
                }
            } else {
                if (micBtn) micBtn.style.display = 'none';
            }

            // Sound Logic
            const soundBtn = document.getElementById('sound-btn');
            const soundIcon = document.getElementById('sound-icon');

            if (soundBtn && soundIcon) {
                soundBtn.addEventListener('click', () => {
                    isSoundOn = !isSoundOn;
                    console.log("SofIA: Sound toggled to:", isSoundOn);
                    soundIcon.src = isSoundOn ? '/images/soundon.png' : '/images/soundoff.png';
                });
            }

            async function sendWidgetMessage() {
                const message = widgetInput.value.trim();
                if (!message) return;

                console.log("SofIA: Sending message, sound is:", isSoundOn);

                // Add user message
                appendWidgetMessage(message, 'user-message');
                widgetInput.value = '';
                widgetInput.disabled = true;
                widgetSendBtn.disabled = true;

                try {
                    const response = await fetch('/api/gemini/chat', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ message: message })
                    });

                    if (!response.ok) throw new Error("SofIA no disponible");

                    const data = await response.json();
                    console.log("SofIA: AI Response received");

                    const messageContentDiv = appendWidgetMessage('', 'ai-message');

                    // Typewriter and Audio in parallel to reduce delay
                    console.log("SofIA: Starting typing and speech in parallel...");
                    typeWriter(messageContentDiv, data.response);
                    speak(data.response);

                } catch (error) {
                    console.error('Error:', error);
                    appendWidgetMessage('No pude responder en este momento. Revisa tu conexión o intenta de nuevo más tarde.', 'ai-message');
                } finally {
                    widgetInput.disabled = false;
                    widgetSendBtn.disabled = false;
                    widgetInput.focus();
                }
            }

            function appendWidgetMessage(text, className) {
                const messageDiv = document.createElement('div');
                messageDiv.className = `message ${className}`;
                const contentDiv = document.createElement('div');
                contentDiv.className = 'message-content';
                contentDiv.textContent = text;
                messageDiv.appendChild(contentDiv);
                widgetHistory.appendChild(messageDiv);
                widgetHistory.scrollTop = widgetHistory.scrollHeight;
                return contentDiv;
            }
        }
    }
});
