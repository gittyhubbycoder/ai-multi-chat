document.addEventListener('DOMContentLoaded', () => {
    const chatBox = document.getElementById('chat-box');
    const chatForm = document.getElementById('chat-form');
    const userInput = document.getElementById('user-input');

    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const userMessage = userInput.value.trim();
        if (!userMessage) return;

        appendMessage('User', userMessage);
        processBotResponse(userMessage);
        userInput.value = '';
    });

    function appendMessage(sender, message) {
        const messageElement = document.createElement('div');
        messageElement.textContent = `${sender}: ${message}`;
        chatBox.appendChild(messageElement);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    function processBotResponse(userMessage) {
        // Replace the mock response logic with actual AI response handling
        setTimeout(() => {
            const botResponse = `You said: "${userMessage}"`;
            appendMessage('Bot', botResponse);
        }, 1000);
    }
});