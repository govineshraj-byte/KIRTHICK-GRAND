/* ==========================================================================
   KIRTHICK GRAND 2.0 - AI Interior Assistant Engine
   ========================================================================== */

// --- AI Knowledge Base ---
const AI_KNOWLEDGE = {
    faq: {
        delivery: "Custom production takes 5 weeks, and domestic shipping takes 1 week. Expect delivery in 6 weeks.",
        warranty: "All Kirthick Grand furniture pieces come with our signature Lifetime Craftsmanship Warranty covering joints and timber splits.",
        wood: "Walnut offers dark, organic waves with coffee highlights; White Oak has a radiant, bright, linear grain; Teak is highly water-resistant with rich oil and golden amber rings.",
        returns: "Returns are accepted within 7 days of delivery in case of verified transit damage.",
        payment: "We accept all major Credit/Debit Cards, UPI, Net Banking, and offer interest-free EMI options."
    }
};

// --- AI Context Memory ---
const AIMemory = {
    roomSize: null, // "small", "medium", "large"
    budget: null,    // number
    style: null,     // "modern", "traditional", "minimalist"
    preferredWood: null
};

// --- Message History ---
let conversationHistory = [];

// --- Initialize AI Assistant Panel ---
document.addEventListener('DOMContentLoaded', () => {
    initChatPanel();
    loadPersistedHistory();
});

function initChatPanel() {
    const chatHeader = document.getElementById('chat-header-bar');
    const collapseIcon = document.getElementById('collapse-chat-icon');
    const aiChatPanel = document.getElementById('ai-chat-panel');
    const chatForm = document.getElementById('chat-message-form');
    const chatInput = document.getElementById('chat-message-input');
    const quickReplies = document.querySelectorAll('.quick-reply-btn');
    
    // Toggle Collapse
    if (chatHeader) {
        chatHeader.addEventListener('click', (e) => {
            // Prevent toggling if user clicks the close action inside header
            if (e.target.closest('.collapse-chat-btn')) {
                aiChatPanel.classList.toggle('collapsed');
                return;
            }
            aiChatPanel.classList.remove('collapsed');
        });
    }
    
    if (collapseIcon) {
        collapseIcon.addEventListener('click', (e) => {
            e.stopPropagation();
            aiChatPanel.classList.toggle('collapsed');
        });
    }
    
    // Quick Replies Binding
    quickReplies.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const replyText = btn.getAttribute('data-reply');
            handleUserMessageSend(replyText);
        });
    });
    
    // Chat Triggers across page (e.g. Ask AI hero button)
    const chatTriggers = document.querySelectorAll('.chat-trigger');
    chatTriggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            aiChatPanel.classList.remove('collapsed');
            chatInput.focus();
        });
    });
    
    // Form Submit
    if (chatForm) {
        chatForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const text = chatInput.value.trim();
            if (!text) return;
            
            chatInput.value = '';
            handleUserMessageSend(text);
        });
    }
}

// --- Persisted History Management ---
function loadPersistedHistory() {
    const savedHistory = localStorage.getItem('ai_chat_history');
    const savedMemory = localStorage.getItem('ai_chat_memory');
    
    if (savedHistory) {
        try {
            conversationHistory = JSON.parse(savedHistory);
            renderHistoryToMessages();
        } catch (e) {
            conversationHistory = [];
        }
    }
    
    if (savedMemory) {
        try {
            Object.assign(AIMemory, JSON.parse(savedMemory));
        } catch (e) {}
    }
}

function persistChatState() {
    localStorage.setItem('ai_chat_history', JSON.stringify(conversationHistory));
    localStorage.setItem('ai_chat_memory', JSON.stringify(AIMemory));
}

function renderHistoryToMessages() {
    const container = document.getElementById('chat-messages-container');
    if (!container) return;
    
    // Clear default messages but keep quick replies element if needed
    const quickReplies = container.querySelector('.chat-quick-replies');
    container.innerHTML = '';
    
    conversationHistory.forEach(msg => {
        const bubble = createChatBubbleElement(msg.text, msg.sender, msg.time);
        container.appendChild(bubble);
    });
    
    if (quickReplies && conversationHistory.length < 3) {
        container.appendChild(quickReplies);
    }
    
    scrollChatToBottom();
}

// --- Message Router & Intelligent Engine ---
function handleUserMessageSend(text) {
    appendMessageToChat(text, 'user');
    
    // Show typing indicator
    const indicator = document.getElementById('typing-indicator');
    const statusSub = document.getElementById('chat-sub-status');
    
    if (indicator) indicator.classList.remove('hidden');
    if (statusSub) statusSub.textContent = 'AI is typing...';
    scrollChatToBottom();
    
    // Process text asynchronously for realism
    setTimeout(() => {
        const reply = generateIntelligentReply(text);
        
        if (indicator) indicator.classList.add('hidden');
        if (statusSub) statusSub.textContent = 'Online';
        
        appendMessageToChat(reply, 'ai');
    }, 850);
}

function appendMessageToChat(text, sender) {
    const container = document.getElementById('chat-messages-container');
    if (!container) return;
    
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Save to history
    conversationHistory.push({ text, sender, time: timeStr });
    persistChatState();
    
    const bubble = createChatBubbleElement(text, sender, timeStr);
    container.appendChild(bubble);
    scrollChatToBottom();
}

function createChatBubbleElement(text, sender, time) {
    const bubble = document.createElement('div');
    bubble.className = `chat-bubble ${sender === 'user' ? 'user-bubble' : 'ai-bubble'}`;
    bubble.innerHTML = `
        <p>${text}</p>
        <span class="chat-time">${time}</span>
    `;
    return bubble;
}

function scrollChatToBottom() {
    const container = document.getElementById('chat-messages-container');
    if (container) {
        container.scrollTop = container.scrollHeight;
    }
}

// --- Intelligent Sizing, Budget & Recommendations Engine ---
function generateIntelligentReply(message) {
    const msg = message.toLowerCase();
    
    // Parse Memory Context dynamically
    // 1. Room Size parsing
    if (msg.includes('apartment') || msg.includes('flat') || msg.includes('compact') || msg.includes('small room') || msg.includes('120 sq')) {
        AIMemory.roomSize = 'small';
    } else if (msg.includes('large room') || msg.includes('villa') || msg.includes('spacious') || msg.includes('300 sq')) {
        AIMemory.roomSize = 'large';
    } else if (msg.includes('medium') || msg.includes('regular') || msg.includes('200 sq')) {
        AIMemory.roomSize = 'medium';
    }
    
    // 2. Budget parsing
    const budgetMatch = msg.match(/(?:under|below|budget of)?\s*(?:rs\.?|₹)?\s*(\d{2,3}),?000/);
    if (budgetMatch && budgetMatch[1]) {
        AIMemory.budget = parseInt(budgetMatch[1]) * 1000;
    }
    
    // 3. Style parsing
    if (msg.includes('minimalist') || msg.includes('sleek')) {
        AIMemory.style = 'minimalist';
    } else if (msg.includes('mid-century') || msg.includes('modern')) {
        AIMemory.style = 'modern';
    } else if (msg.includes('classic') || msg.includes('royal') || msg.includes('traditional')) {
        AIMemory.style = 'traditional';
    }

    // 4. Wood type parsing
    if (msg.includes('walnut')) AIMemory.preferredWood = 'Walnut';
    if (msg.includes('oak')) AIMemory.preferredWood = 'White Oak';
    if (msg.includes('teak')) AIMemory.preferredWood = 'Teak';

    // --- Dynamic Recommendations logic based on memory ---
    if (msg.includes('recommend') || msg.includes('suggest') || msg.includes('choose')) {
        return handleRecommendationsQuery(msg);
    }
    
    // --- FAQ replies ---
    if (msg.includes('delivery') || msg.includes('arrive') || msg.includes('shipping') || msg.includes('when will my order')) {
        let response = AI_KNOWLEDGE.faq.delivery;
        if (AIMemory.roomSize) {
            response += `<br><br><em>Note: Since we're planning for your ${AIMemory.roomSize} room layout, we will optimize sizing templates within this lead time.</em>`;
        }
        return response;
    }
    
    if (msg.includes('warranty')) {
        return AI_KNOWLEDGE.faq.warranty;
    }
    
    if (msg.includes('wood') || msg.includes('walnut vs oak') || msg.includes('oak vs walnut') || msg.includes('teak')) {
        return AI_KNOWLEDGE.faq.wood;
    }
    
    if (msg.includes('return') || msg.includes('refund') || msg.includes('damage')) {
        return AI_KNOWLEDGE.faq.returns;
    }
    
    if (msg.includes('payment') || msg.includes('emi') || msg.includes('upi') || msg.includes('net banking')) {
        return AI_KNOWLEDGE.faq.payment;
    }

    // --- Key word responses ---
    if (msg.includes('dining')) {
        let baseText = "The <strong>Quarter Dining Table</strong> comfortably seats six and features robust Mortise & Tenon joints.";
        if (AIMemory.roomSize === 'small') {
            baseText = "Since you mentioned you have a small apartment layout, I recommend our <strong>Wedge Stool</strong> setup or a compact custom variation of the <strong>Quarter Dining Table</strong> configured at 4.5ft width.";
        }
        return baseText;
    }
    
    if (msg.includes('small room') || msg.includes('small apartment')) {
        return "For compact apartments, I highly recommend our <strong>Wedge Stool</strong> (₹12,000) or the <strong>Live Edge Console Table</strong> (₹45,000) which has a slim 1.2ft depth profile. Let me know if you'd like pricing or wood species recommendation for these.";
    }
    
    if (msg.includes('bedroom')) {
        return "The <strong>Oak Storage Bed</strong> (₹85,000) is perfect. Built in solid White Oak, it provides built-in drawers to solve bedroom storage constraints.";
    }
    
    if (msg.includes('office') || msg.includes('study') || msg.includes('work')) {
        return "The <strong>Executive Walnut Desk</strong> (₹58,000) works beautifully for home offices. It includes integrated cable channels and twin premium soft-close drawers.";
    }

    if (msg.includes('sq ft') || msg.includes('sqft') || msg.includes('size')) {
        return handleRoomSizeSuggestions(msg);
    }
    
    return "I can help you choose handcrafted furniture, wood species (Walnut, White Oak, Teak), sizing profiles, prices, or estimate shipping delivery times. What room are we designing today?";
}

// --- Room Size Suggestions Handler ---
function handleRoomSizeSuggestions(msg) {
    const numberMatch = msg.match(/(\d+)\s*(?:sq|square)/);
    if (numberMatch && numberMatch[1]) {
        const sqft = parseInt(numberMatch[1]);
        if (sqft <= 120) {
            AIMemory.roomSize = 'small';
            return `For a cozy space of ${sqft} sq ft, we recommend:<br>• <strong>Walnut Coffee Table</strong> (low-slung profile)<br>• <strong>Wedge Stool</strong> (flexible seating/accent)<br>• <strong>Live Edge Console Table</strong> (slim hallway TV unit)`;
        } else if (sqft <= 220) {
            AIMemory.roomSize = 'medium';
            return `For your ${sqft} sq ft layout, we recommend:<br>• <strong>Quarter Dining Table</strong> (seating 4-6)<br>• <strong>Executive Desk</strong> (perfect home corner work node)<br>• <strong>Walnut Bench</strong> (minimal seat alignment)`;
        } else {
            AIMemory.roomSize = 'large';
            return `For your spacious ${sqft} sq ft space, we suggest:<br>• A full 6-Seater <strong>Quarter Dining Table</strong> setup<br>• <strong>Oak Storage Bed</strong> with dual side drawer compartments<br>• Matching <strong>Live Edge consoles</strong> and multiple <strong>Wedge accent stools</strong>.`;
        }
    }
    return "How large is your room in sq ft? E.g., 'I have a 120 sq ft room'. I will generate a custom structural layout recommendation checklist.";
}

// --- Recommendations Query Builder ---
function handleRecommendationsQuery(msg) {
    let recommendations = window.PIECES || PIECES;
    let prependedContext = "";
    
    // Apply budget filters
    if (AIMemory.budget) {
        recommendations = recommendations.filter(p => p.price <= AIMemory.budget);
        prependedContext += `matching your budget under ₹${AIMemory.budget.toLocaleString('en-IN')}, `;
    }
    
    // Apply room size recommendations
    if (AIMemory.roomSize === 'small') {
        recommendations = recommendations.filter(p => p.id === 'wedge-stool' || p.id === 'live-edge-console' || p.id === 'walnut-coffee');
        prependedContext += `designed for compact room sizing, `;
    }

    // Apply wood species preference
    if (AIMemory.preferredWood) {
        recommendations = recommendations.filter(p => p.wood === AIMemory.preferredWood);
        prependedContext += `handcrafted in ${AIMemory.preferredWood}, `;
    }
    
    if (recommendations.length === 0) {
        return `I couldn't find items in our standard catalog that fit all parameters. However, Karan Kirthick can craft a bespoke model! Let me know if you would like to book a design consultation to arrange a drawing.`;
    }
    
    const itemsList = recommendations.map(p => `• <strong>${p.name}</strong> (${p.wood}, ₹${p.price.toLocaleString('en-IN')})`).join('<br>');
    return `Based on your preferences ${prependedContext}I recommend:<br>${itemsList}<br><br>Would you like me to open the 3D viewer for any of these to inspect leg joint finishes?`;
}

// Global scope attachment for access from other scripts
window.sendAssistantMessage = function(message) {
    handleUserMessageSend(message);
};
