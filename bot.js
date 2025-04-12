 // EcoWatch Chat Bot Integration Script
 (function() {
    // Configuration - Use the provided Gemini API endpoint
    const GEMINI_API_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
    const GEMINI_API_KEY =  'AIzaSyB-umyWf_9iojekrCFYGZhW5jE-5Gqpw0c';// Replace with your actual key
    
    // DOM Elements
    const chatButton = document.getElementById('ecoChatButton');
    const chatContainer = document.getElementById('ecoChatContainer');
    const chatClose = document.getElementById('ecoChatClose');
    const chatMessages = document.getElementById('ecoChatMessages');
    const chatInput = document.getElementById('ecoChatInput');
    const chatSend = document.getElementById('ecoChatSend');
    const uploadBtn = document.getElementById('ecoUploadBtn');
    const imageUpload = document.getElementById('ecoImageUpload');
    const locationBtn = document.getElementById('ecoLocationBtn');
    const quickActions = document.querySelectorAll('.eco-action-btn');

    // Chat state
    let userLocation = null;
    let selectedImage = null;
    let reportInProgress = false;
    let chatHistory = [];

    // Initialize chat
    function initChat() {
        // Add welcome message
        addBotMessage(`<p>Hello! I'm your <strong>EcoWatch Assistant</strong>. 👋</p>
        <p>I can help you with:</p>
        <ul>
            <li>Reporting environmental issues and garbage</li>
            <li>Finding local cleanup events</li>
            <li>Providing environmental tips and information</li>
            <li>Answering questions about waste management and hygiene</li>
        </ul>
        <p>How can I assist you today?</p>`);
    }

    // Toggle chat visibility
    chatButton.addEventListener('click', () => {
        chatContainer.classList.toggle('hidden');
        if (!chatContainer.classList.contains('hidden') && chatMessages.children.length === 0) {
            initChat();
        }
    });

    // Close chat
    chatClose.addEventListener('click', () => {
        chatContainer.classList.add('hidden');
    });

    // Send message on button click
    chatSend.addEventListener('click', sendMessage);

    // Send message on Enter key
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    // Handle quick action buttons
    quickActions.forEach(btn => {
        btn.addEventListener('click', () => {
            const action = btn.getAttribute('data-action');
            handleQuickAction(action);
        });
    });

    // Handle file upload
    uploadBtn.addEventListener('click', () => {
        imageUpload.click();
    });

    imageUpload.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
            selectedImage = e.target.files[0];
            addUserMessage(`📷 Image selected: ${selectedImage.name}`);
            addBotMessage(`<p>Great! I've received your image. 👍</p>
            <p>Please describe the environmental issue you're reporting and provide a location if possible.</p>`);
            reportInProgress = true;
        }
    });

    // Handle location
    locationBtn.addEventListener('click', () => {
        if (navigator.geolocation) {
            addBotMessageWithTyping("Accessing your location...");
            
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    userLocation = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    addUserMessage("📍 Location shared");
                    
                    // Process the location information
                    const message = `I have a user at latitude ${userLocation.lat}, longitude ${userLocation.lng}. What's the approximate name of this location and what environmental issues are common in this area? Respond in HTML format with paragraph tags and maybe a list of common issues.`;
                    callGeminiAPI(message, true);
                },
                () => {
                    addBotMessage("<p>I couldn't access your location. 😕</p><p>You can type your location manually instead.</p>");
                }
            );
        } else {
            addBotMessage("<p>Geolocation is not supported by your browser. Please type your location.</p>");
        }
    });

    // Quick action handler
    function handleQuickAction(action) {
        switch(action) {
            case 'report':
                addUserMessage("I want to report garbage");
                addBotMessage(`<p>I'd be happy to help you report an environmental issue. 👍</p>
                <p>Here's how to proceed:</p>
                <ol>
                    <li>Share a photo of the issue (if available)</li>
                    <li>Share your location or describe where it is</li>
                    <li>Provide details about what you're seeing</li>
                </ol>
                <p>Ready when you are!</p>`);
                reportInProgress = true;
                break;
            case 'find':
                addUserMessage("Find cleanup events");
                if (userLocation) {
                    const message = `Please list 3-5 upcoming or regular community cleanup events near latitude ${userLocation.lat}, longitude ${userLocation.lng}. Format your response with HTML using paragraph tags, lists with proper list items, and make event names in bold. Include dates, times, and brief descriptions.`;
                    callGeminiAPIWithTyping(message);
                } else {
                    addBotMessage(`<p>I'd love to help you find cleanup events in your area! 🌎</p>
                    <p>To provide the most relevant information, I need to know your location.</p>
                    <p>Please click the 📍 location button below or type your city/area name.</p>`);
                }
                break;
            case 'info':
                addUserMessage("Show environmental tips");
                const infoMessage = "Please provide 5 actionable environmental tips for reducing waste and improving local environmental conditions. Format your response in HTML with paragraph tags, use a numbered list with list items for the tips, make the tip titles bold, and add emoji icons next to each tip.";
                callGeminiAPIWithTyping(infoMessage);
                break;
            case 'hygiene':
                addUserMessage("Hygiene information");
                const hygieneMessage = "Please provide information about public hygiene, proper waste disposal, and how improper waste management affects public health. Include 3-4 best practices. Format your response in HTML with paragraph tags, headings or bold for important points, and lists where appropriate. Include emojis for visual appeal.";
                callGeminiAPIWithTyping(hygieneMessage);
                break;
        }
    }

    // Send message function
    function sendMessage() {
        const message = chatInput.value.trim();
        if (!message) return;
        
        addUserMessage(message);
        chatInput.value = '';

        // Process the message
        processUserMessage(message);
    }

    // Process user message
    function processUserMessage(message) {
        if (reportInProgress) {
            // Handle report in progress
            const locationText = userLocation ? `at latitude ${userLocation.lat}, longitude ${userLocation.lng}` : "at an unspecified location";
            const imageText = selectedImage ? `with an image named ${selectedImage.name}` : "without an image";
            
            const reportQuery = `A user is reporting an environmental issue ${locationText} ${imageText}. Their description is: "${message}". 
            Please analyze this environmental report and provide: 
            1. An assessment of the environmental impact
            2. Recommended actions for cleanup
            3. Which authorities should be notified
            4. Any health concerns this issue might pose
            Format your response in HTML with paragraph tags, headings, lists, and possibly a structured card-like format. Use emoji icons where appropriate for visual appeal.`;
            
            callGeminiAPIWithTyping(reportQuery);
            
            // Reset report state
            reportInProgress = false;
            selectedImage = null;
        } else {
            // General conversation handling - add context about environmental assistant
            const contextMessage = `As an environmental assistant focused on garbage reporting and environmental hygiene, please respond to the following user message: "${message}"
            Focus your response on environmental concerns, waste management, recycling, and similar topics. If the query is unrelated to environmental topics, gently redirect to how you can help with environmental reporting and information.
            Format your response in HTML with paragraph tags, possibly lists, and use emoji icons where appropriate for visual appeal.`;
            
            callGeminiAPIWithTyping(contextMessage);
        }
    }

    // Call Gemini API with the proper endpoint and typing indicator
    function callGeminiAPIWithTyping(message, isLocationQuery = false) {
        // Show typing indicator
        const loadingMessage = addBotMessageWithTyping("Thinking...");
        
        // Then call API
        setTimeout(() => {
            callGeminiAPI(message, isLocationQuery, loadingMessage);
        }, 1000);
    }

    // Call Gemini API with the proper endpoint
    async function callGeminiAPI(message, isLocationQuery = false, existingLoadingMessage = null) {
        const loadingMessage = existingLoadingMessage || addBotMessage("Thinking...");
        loadingMessage.classList.add("loading");
        
        try {
            // Prepare the request payload according to Gemini API format
            const payload = {
                contents: [
                    {
                        role: "user",
                        parts: [
                            {
                                text: message
                            }
                        ]
                    }
                ]
            };

            // Call the Gemini API
            const response = await fetch(`${GEMINI_API_ENDPOINT}?key=${GEMINI_API_KEY}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            const data = await response.json();
            
            // Extract the response text from the Gemini API response structure
            let responseText = "";
            if (data.candidates && data.candidates[0] && data.candidates[0].content && 
                data.candidates[0].content.parts && data.candidates[0].content.parts[0]) {
                responseText = data.candidates[0].content.parts[0].text;
            } else {
                responseText = "<p>I'm sorry, I couldn't process that request properly.</p>";
            }

            // Format the text if it doesn't already have HTML
            if (!responseText.includes('<p>') && !responseText.includes('<div>')) {
                // Convert plain text with line breaks to paragraphs
                responseText = responseText.split('\n\n')
                    .filter(para => para.trim() !== '')
                    .map(para => `<p>${para}</p>`)
                    .join('');
            }

            // Remove the loading message and replace with actual content
            chatMessages.removeChild(loadingMessage);
            addBotMessage(responseText);
            
            // Save to chat history
            chatHistory.push({
                role: "user",
                content: message
            });
            chatHistory.push({
                role: "assistant",
                content: responseText
            });
            
        } catch (error) {
            console.error("Error calling Gemini API:", error);
            // Remove the loading message and replace with error message
            chatMessages.removeChild(loadingMessage);
            addBotMessage("<p>I'm sorry, I encountered an error while processing your request. Please try again later. 😕</p><p>This might be because the API key needs to be configured.</p>");
        }
    }

    // Add user message to chat
    function addUserMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('eco-message', 'eco-user-message');
        messageElement.textContent = message;
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        return messageElement;
    }

    // Add bot message to chat with HTML support
    function addBotMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('eco-message', 'eco-bot-message');
        messageElement.innerHTML = message;
        
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        return messageElement;
    }
    
    // Add bot message with typing indicator
    function addBotMessageWithTyping(placeholder) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('eco-message', 'eco-bot-message');
        
        const typingIndicator = document.createElement('div');
        typingIndicator.classList.add('typing-indicator');
        typingIndicator.innerHTML = '<span></span><span></span><span></span>';
        
        messageElement.appendChild(typingIndicator);
        
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        return messageElement;
    }
    
    // Helper function to convert image to base64 (for future implementation)
    function getBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result.split(',')[1]);
            reader.onerror = error => reject(error);
        });
    }
})();