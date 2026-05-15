// ai-features.js
// ميزات الذكاء الاصطناعي مع قاعدة معرفة الشركة

// The API key lives in local-config.js (gitignored) — never in this file.
// If local-config.js isn't present (e.g. fresh clone, public deploy),
// GROQ_API_KEY will be undefined and AI_ENABLED will be false; the chatbot
// will show a friendly "AI is offline" message instead of trying to call Groq.
const AI_ENABLED = typeof GROQ_API_KEY === 'string' && GROQ_API_KEY.length > 10;

// ========== 1. دالة الاتصال بالذكاء الاصطناعي مع معلومات الشركة ==========
async function sendToAI(userMessage, customContext = null) {
    if (!AI_ENABLED) return aiOfflineMessage();
    try {
        // جلب معلومات الشركة من company-data.js
        let companyContext = "";
        if (typeof getCompanyContextForAI !== 'undefined') {
            companyContext = getCompanyContextForAI();
        } else {
            // معلومات احتياطية إذا لم يتم تحميل company-data.js
            companyContext = `You are "E Marketing Lab co." AI Assistant - a digital marketing agency in Palestine.
            Offer: Media Buying, SEO, Content Marketing, Web Design, CRM, Training.
            Contact: EMarketingLab.co@gmail.com | Phone: +970593412
            Respond in same language as user. Be professional and helpful.`;
        }

        // إضافة سياق المستخدم المخصص إذا وجد
        const finalContext = customContext ? companyContext + "\n\n" + customContext : companyContext;

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GROQ_API_KEY}`
            },
            body: JSON.stringify({
                model: 'llama-3.1-8b-instant',
                messages: [
                    {
                        role: "system",
                        content: `You are an AI assistant for a marketing agency. Use this information to answer accurately:

${finalContext}

Always respond in the SAME LANGUAGE as the user. Be helpful, professional, and concise.`
                    },
                    { role: "user", content: userMessage }
                ],
                temperature: 0.7,
                max_tokens: 800
            })
        });

        const data = await response.json();
        if (data.error) {
            console.error('API Error:', data.error);
            return "⚠️ Service temporarily unavailable. Please contact us directly at EMarketingLab.co@gmail.com";
        }
        return data.choices[0].message.content;
    } catch (error) {
        console.error('Network Error:', error);
        return "⚠️ Connection issue. Please email us at EMarketingLab.co@gmail.com";
    }
}

// ========== 2. الشات بوت الذكي ==========
function initAIChatbot() {
    console.log('🔄 Initializing AI chatbot with company knowledge base...');

    setTimeout(() => {
        const chatbotBody = document.getElementById('chatbot-body');
        const chatbotInput = document.getElementById('chatbot-input');
        const sendButton = document.querySelector('.chatbot-box__footer button');

        if (!chatbotBody || !chatbotInput) {
            console.log('❌ Chatbot elements not found');
            return;
        }

        console.log('✅ Chatbot elements found');

        if (sendButton) {
            sendButton.onclick = async () => {
                if (chatbotInput.value.trim()) {
                    const userMessage = chatbotInput.value.trim();
                    addUserChatMessage(userMessage);
                    chatbotInput.value = '';
                    showTypingIndicator();

                    const aiResponse = await sendToAI(userMessage);

                    removeTypingIndicator();
                    addAIChatMessage(aiResponse);
                }
            };
        }

        chatbotInput.onkeypress = async (e) => {
            if (e.key === 'Enter' && chatbotInput.value.trim()) {
                e.preventDefault();
                const userMessage = chatbotInput.value.trim();
                addUserChatMessage(userMessage);
                chatbotInput.value = '';
                showTypingIndicator();

                const aiResponse = await sendToAI(userMessage);

                removeTypingIndicator();
                addAIChatMessage(aiResponse);
            }
        };

        // رسالة ترحيب مخصصة
        if (chatbotBody.children.length <= 2) {
            let greeting = "👋 Welcome to E Marketing Lab co.! I'm your AI assistant.\n\n";
            if (typeof COMPANY_INFO !== 'undefined') {
                greeting += `We offer:\n`;
                COMPANY_INFO.services.slice(0, 5).forEach(s => {
                    greeting += `${s.icon} ${s.name}\n`;
                });
                greeting += `\nAsk me about our services, pricing, success stories, or how we can help your business grow!`;
            } else {
                greeting += `How can I help you with your digital marketing needs today?`;
            }
            addAIChatMessage(greeting);
        }

        console.log('✅ AI chatbot with knowledge base is ready!');
    }, 500);
}

// دوال مساعدة (نفسها بدون تغيير)
function addUserChatMessage(text) {
    const container = document.getElementById('chatbot-body');
    if (!container) return;
    const div = document.createElement('div');
    div.className = 'chatbot-msg chatbot-msg--user';
    div.innerHTML = `<div class="message-content">${escapeHtml(text)}</div>`;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
}

function addAIChatMessage(text) {
    const container = document.getElementById('chatbot-body');
    if (!container) return;
    const div = document.createElement('div');
    div.className = 'chatbot-msg chatbot-msg--bot';
    div.innerHTML = `<div class="message-content">${text.replace(/\n/g, '<br>')}</div>`;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
}

function showTypingIndicator() {
    removeTypingIndicator();
    const container = document.getElementById('chatbot-body');
    if (!container) return;
    const div = document.createElement('div');
    div.className = 'chatbot-msg chatbot-msg--bot typing-indicator';
    div.id = 'typing-indicator';
    div.innerHTML = `<div class="message-content"><span>.</span><span>.</span><span>.</span></div>`;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
}

function removeTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) indicator.remove();
}

window.toggleChat = function() {
    const box = document.getElementById('chatbot-box');
    if (box) box.classList.toggle('open');
};

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ========== 3. زر خطة التسويق (مخصص) ==========
function addAIMarketingButton() {
    const heroSection = document.querySelector('.hero-buttons');
    if (heroSection && !document.getElementById('ai-marketing-btn')) {
        const btn = document.createElement('button');
        btn.id = 'ai-marketing-btn';
        btn.className = 'btn btn-primary';
        btn.style.marginRight = '15px';
        btn.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        btn.innerHTML = '🤖 AI Marketing Plan';
        btn.onclick = showMarketingModal;
        heroSection.insertBefore(btn, heroSection.firstChild);
        console.log('✅ AI Marketing button added');
    }
}

function showMarketingModal() {
    let modal = document.getElementById('ai-marketing-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'ai-marketing-modal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <h2>🤖 AI Marketing Plan Generator</h2>
                <form id="marketing-plan-form">
                    <div class="form-group"><label>Company / Business Name</label><input type="text" id="business-name" required placeholder="e.g., Nike, Starbucks"></div>
                    <div class="form-group"><label>Product/Service Description</label><textarea id="service-desc" rows="2" required placeholder="Describe what you sell..."></textarea></div>
                    <div class="form-group"><label>Monthly Budget</label><select id="budget"><option value="small">Less than $5,000</option><option value="medium">$5,000 - $20,000</option><option value="large">$20,000 - $50,000</option></select></div>
                    <div class="form-group"><label>Target Audience</label><input type="text" id="target-audience" placeholder="e.g., Young adults 18-25, business owners"></div>
                    <button type="submit" class="btn-submit">🚀 Generate Marketing Plan</button>
                </form>
                <div id="marketing-result" style="display:none;"></div>
            </div>
        `;
        document.body.appendChild(modal);
        modal.querySelector('.close-modal').onclick = () => modal.style.display = 'none';
        window.onclick = (event) => {
            if (event.target === modal) modal.style.display = 'none';
        };
    }
    modal.style.display = 'block';

    document.getElementById('marketing-plan-form').onsubmit = async (e) => {
        e.preventDefault();
        const businessName = document.getElementById('business-name').value;
        const serviceDesc = document.getElementById('service-desc').value;
        const budget = document.getElementById('budget').value;
        const target = document.getElementById('target-audience').value;
        const budgetMap = { small: 'Less than $5,000', medium: '$5,000 - $20,000', large: '$20,000 - $50,000' };

        const submitBtn = e.target.querySelector('.btn-submit');
        submitBtn.innerHTML = '⏳ Generating...';
        submitBtn.disabled = true;

        const prompt = `Create a detailed marketing plan for:
Business: ${businessName}
Product/Service: ${serviceDesc}
Budget: ${budgetMap[budget]}
Target Audience: ${target || 'General'}

Please provide:
1. Recommended advertising platforms with budget allocation
2. 5 creative content ideas
3. 30-day launch strategy
4. Key performance indicators (KPIs)

Note: You are from E Marketing Lab co. If relevant, suggest how our services could help.`;

        const aiResponse = await sendToAI(prompt);

        const resultDiv = document.getElementById('marketing-result');
        resultDiv.style.display = 'block';
        resultDiv.innerHTML = `<div class="marketing-response">${escapeHtml(aiResponse).replace(/\n/g, '<br>')}</div>
            <button onclick="document.getElementById('ai-marketing-modal').style.display='none'" style="margin-top:15px;padding:10px 20px;background:#666;color:white;border:none;border-radius:8px;cursor:pointer;">Close</button>`;
        submitBtn.innerHTML = '🚀 Generate Marketing Plan';
        submitBtn.disabled = false;
    };
}

// ========== 4. مولد الشعارات ==========
function addAILogoGenerator() {
    console.log('📝 Logo generator ready');
}

function showAILogoModal() {
    alert(`✨ Need a logo? Contact E Marketing Lab co. for professional design services!\n\nEmail: EMarketingLab.co@gmail.com`);
}


// ========== 7. ميزة توصية الخدمات بناءً على وصف المستخدم ==========

// دالة لتحديد الخدمة المناسبة بناءً على وصف المستخدم
async function recommendService(userDescription) {
    // معلومات الخدمات المتوفرة مع كلمات مفتاحية للتوصية
    const servicesForAI = COMPANY_INFO.services.map(s => ({
        name: s.name,
        description: s.description,
        keywords: getKeywordsForService(s.id)
    }));

    const prompt = `Based on the following client description, recommend the MOST SUITABLE service from our list.

CLIENT DESCRIPTION:
"${userDescription}"

OUR AVAILABLE SERVICES:
${COMPANY_INFO.services.map(s => `- ${s.name}: ${s.description}`).join('\n')}

INSTRUCTIONS:
1. Choose ONLY ONE service that best matches the client's needs
2. Explain why this service is the best fit (2-3 sentences)
3. Mention the pricing tiers: Beginner ($50), Grow ($100), Elite ($500)
4. End with an offer to help further
5. Respond in the SAME LANGUAGE as the client's description

EXAMPLE OUTPUT:
"Based on your description, I recommend **SEO & Organic Growth** because you mentioned wanting to increase website traffic and rank higher on Google. This service focuses on exactly that. Our SEO packages start at $50/month. Would you like me to share more details?"`;

    const response = await sendToAI([{ role: "user", content: prompt }]);
    return response;
}

// كلمات مفتاحية لكل خدمة (للمساعدة في التوصية الدقيقة)
function getKeywordsForService(serviceId) {
    const keywords = {
        'media-buying': ['ads', 'advertising', 'facebook ads', 'google ads', 'paid traffic', 'campaign', 'reach', 'impressions', 'clicks', 'conversions', 'retargeting'],
        'digital-marketing': ['strategy', 'full funnel', 'overall marketing', 'integrated', 'holistic', 'complete plan', 'marketing roadmap'],
        'seo': ['search engine', 'google ranking', 'organic traffic', 'visibility', 'keywords', 'backlinks', 'rank higher', 'SERP', 'website traffic'],
        'content': ['blog', 'articles', 'storytelling', 'content creation', 'posts', 'copywriting', 'social media content', 'videos', 'engagement'],
        'design': ['logo', 'branding', 'visuals', 'animation', 'creative', 'graphic design', 'colors', 'identity', 'assets'],
        'web': ['website', 'ecommerce', 'online store', 'app', 'development', 'platform', 'landing page', 'web design', 'coding'],
        'training': ['workshop', 'learn', 'teach', 'team training', 'capacity building', 'upskill', 'education', 'course'],
        'crm': ['customer management', 'leads', 'follow up', 'automation', 'sales pipeline', 'client relationships', 'infrastructure'],
        'gamified': ['game', 'interactive', 'quiz', 'contest', 'giveaway', 'engagement', 'fun', 'challenge', 'rewards'],
        'strategy': ['future proof', 'long term', 'planning', 'roadmap', 'forecast', 'competitive advantage', 'scalable']
    };
    return keywords[serviceId] || [];
}

// إضافة زر "توصية الخدمات" في صفحة الخدمات
function addServiceRecommenderButton() {
    // نضيف زر في صفحة service-detail.html
    const serviceDetailBody = document.querySelector('.service-detail__body');
    if (serviceDetailBody && !document.getElementById('ai-recommend-btn')) {
        const recommenderSection = document.createElement('div');
        recommenderSection.style.cssText = 'margin-top: 40px; padding: 24px; background: var(--c-lavender-2); border-radius: var(--radius-lg);';
        recommenderSection.innerHTML = `
            <h3 style="font-family: var(--f-display); font-size: 20px; margin-bottom: 12px;">🤖 Need help choosing a service?</h3>
            <p style="color: var(--c-muted); margin-bottom: 16px;">Describe your business needs, and AI will recommend the best service for you.</p>
            <textarea id="ai-recommend-input" rows="3" placeholder="Example: I have a clothing store and I want to increase my sales online. I need more people to see my products..." style="width: 100%; padding: 14px; border: 1.5px solid var(--c-border); border-radius: var(--radius-md); font-family: inherit; resize: vertical;"></textarea>
            <button id="ai-recommend-btn" style="margin-top: 16px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; padding: 12px 28px; border-radius: 40px; font-weight: 600; cursor: pointer;">✨ Get AI Recommendation</button>
            <div id="ai-recommend-result" style="margin-top: 20px; display: none;"></div>
        `;
        serviceDetailBody.appendChild(recommenderSection);

        const recommendBtn = document.getElementById('ai-recommend-btn');
        const recommendInput = document.getElementById('ai-recommend-input');
        const recommendResult = document.getElementById('ai-recommend-result');

        recommendBtn.onclick = async () => {
            const description = recommendInput.value.trim();
            if (!description) {
                recommendResult.style.display = 'block';
                recommendResult.innerHTML = '<p style="color: #e11d48;">⚠️ Please describe your business needs first.</p>';
                return;
            }

            recommendBtn.disabled = true;
            recommendBtn.innerHTML = '⏳ Analyzing...';
            recommendResult.style.display = 'block';
            recommendResult.innerHTML = '<div class="typing-indicator" style="display:flex; gap:5px; padding:10px;"><span>.</span><span>.</span><span>.</span></div>';

            const recommendation = await recommendService(description);

            recommendResult.innerHTML = `
                <div style="background: white; padding: 20px; border-radius: var(--radius-md); border-left: 4px solid #667eea;">
                    <div style="font-weight: 700; margin-bottom: 12px;">🎯 AI Recommendation</div>
                    <div style="line-height: 1.6;">${escapeHtml(recommendation).replace(/\n/g, '<br>')}</div>
                </div>
            `;

            recommendBtn.disabled = false;
            recommendBtn.innerHTML = '✨ Get AI Recommendation';
        };
    }
}
// ========== 8. ميزة البحث عن الخدمات حسب السعر ==========

// الأسعار الحقيقية لخدماتكم (حسب best-offers.html)
const REAL_PRICES = {
    Beginner: 50,
    standard: 100,
    advanced: 500,
    bundles: {
        visibility: "Save 25%",
        growth: "Save 30%",
        fullStack: "Save 40%"
    }
};

// دالة للبحث عن خدمات قريبة من ميزانية المستخدم
async function findServicesByBudget(budget, currency = "USD") {
    // تحويل العملات تقريباً (اختياري)
    const budgetInUSD = convertToUSD(budget, currency);

    const prompt = `A user has a budget of ${budgetInUSD} USD for digital marketing services.

BASED ON REAL PRICING (DO NOT INVENT):
- Our individual services start at $50/month (Beginner tier)
- Grow tier: $100/month
- Elite tier: $500/month
- We also offer bundle deals with 25-40% savings

USER BUDGET: ${budgetInUSD} USD

INSTRUCTIONS:
1. If budget is under $50: Suggest they contact us for custom options or start with a smaller project
2. If budget is $50-100: Recommend Beginner tier of any service, mention which services fit best
3. If budget is $100-500: Recommend Grow tier, possibly multiple services
4. If budget is $500+: Recommend Elite tier or bundle deals

Based on budget ${budgetInUSD} USD, provide:
- Which tier(s) fit this budget
- 2-3 specific services that would work well
- What they can expect for this budget
- ALWAYS end with: "For exact pricing and custom packages, please email us at EMarketingLab.co@gmail.com"

Respond in the SAME LANGUAGE as the user's question.`;

    const response = await sendToAI([{ role: "user", content: prompt }]);
    return response;
}

// دالة مساعدة لتحويل العملات (تقديرية)
function convertToUSD(amount, currency) {
    const rates = {
        usd: 1,
        usd: 1,
        dollar: 1,
        eur: 1.1,
        euro: 1.1,
        jod: 1.41,
        dinar: 1.41,
        egp: 0.02,
        ils: 0.27,  // شيكل
        shekel: 0.27,
        nis: 0.27
    };

    const lowerCurrency = currency.toLowerCase();
    const rate = rates[lowerCurrency] || 1;
    return Math.round(amount * rate);
}

// إضافة واجهة للبحث حسب السعر في صفحة الخدمات
function addBudgetSearchWidget() {
    // نبحث عن مكان مناسب لإضافة الواجهة
    const serviceDetailBody = document.querySelector('.service-detail__body');
    if (!serviceDetailBody) return;

    // نتأكد ما نضيفها مرتين
    if (document.getElementById('budget-search-widget')) return;

    const widget = document.createElement('div');
    widget.id = 'budget-search-widget';
    widget.style.cssText = 'margin-top: 30px; padding: 24px; background: linear-gradient(135deg, #f5f0ff 0%, #faf5ff 100%); border-radius: var(--radius-lg); border: 1px solid var(--c-border);';
    widget.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px; flex-wrap: wrap;">
            <span style="font-size: 28px;">💰</span>
            <h3 style="font-family: var(--f-display); font-size: 18px; font-weight: 700; margin: 0;">Find services by budget</h3>
        </div>
        <p style="color: var(--c-muted); margin-bottom: 16px; font-size: 14px;">Tell us your budget, and AI will recommend the best services for you.</p>
        <div style="display: flex; gap: 12px; flex-wrap: wrap; align-items: center;">
            <input type="number" id="budget-amount" placeholder="Enter amount" style="padding: 12px 16px; border: 1.5px solid var(--c-border); border-radius: var(--radius-md); width: 150px;">
            <select id="budget-currency" style="padding: 12px 16px; border: 1.5px solid var(--c-border); border-radius: var(--radius-md); background: white;">
                <option value="usd">USD ($)</option>
                <option value="eur">EUR (€)</option>
                <option value="jod">JOD (د.أ)</option>
                <option value="egp">EGP (ج.م)</option>
                <option value="ils">ILS (₪)</option>
            </select>
            <button id="budget-search-btn" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; padding: 12px 28px; border-radius: 40px; font-weight: 600; cursor: pointer;">🔍 Find Services</button>
        </div>
        <div id="budget-search-result" style="margin-top: 20px; display: none;"></div>
    `;

    // نضيفها قبل نهاية service-detail__body
    serviceDetailBody.appendChild(widget);

    // إضافة حدث الزر
    const searchBtn = document.getElementById('budget-search-btn');
    const amountInput = document.getElementById('budget-amount');
    const currencySelect = document.getElementById('budget-currency');
    const resultDiv = document.getElementById('budget-search-result');

    searchBtn.onclick = async () => {
        const amount = amountInput.value.trim();
        if (!amount) {
            resultDiv.style.display = 'block';
            resultDiv.innerHTML = '<p style="color: #e11d48;">⚠️ Please enter a budget amount.</p>';
            return;
        }

        const budget = parseInt(amount);
        const currency = currencySelect.value;

        searchBtn.disabled = true;
        searchBtn.innerHTML = '⏳ Searching...';
        resultDiv.style.display = 'block';
        resultDiv.innerHTML = '<div class="typing-indicator" style="display:flex; gap:5px; padding:10px;"><span>.</span><span>.</span><span>.</span></div>';

        const recommendation = await findServicesByBudget(budget, currency);

        resultDiv.innerHTML = `
            <div style="background: white; padding: 20px; border-radius: var(--radius-md); border-left: 4px solid #667eea; margin-top: 10px;">
                <div style="font-weight: 700; margin-bottom: 12px;">🎯 AI Recommendation for ${budget} ${currency.toUpperCase()}</div>
                <div style="line-height: 1.6;">${escapeHtml(recommendation).replace(/\n/g, '<br>')}</div>
            </div>
        `;

        searchBtn.disabled = false;
        searchBtn.innerHTML = '🔍 Find Services';
    };
}

// ========== 12. تذكر المستخدم والمحادثة ==========
// ========== الذاكرة الدائمة للشات بوت ==========

const USER_MEMORY_KEY = 'chatbot_user_memory';

// تحميل الذاكرة المحفوظة
let savedName = null;

function loadSavedName() {
    const saved = localStorage.getItem(USER_MEMORY_KEY);
    if (saved) {
        savedName = saved;
        console.log(`📝 Loaded saved name: ${savedName}`);
        return true;
    }
    return false;
}

function saveName(name) {
    savedName = name;
    localStorage.setItem(USER_MEMORY_KEY, name);
    console.log(`💾 Saved name: ${name}`);
}

function clearSavedName() {
    savedName = null;
    localStorage.removeItem(USER_MEMORY_KEY);
    console.log(`🗑️ Name cleared from memory`);
}

// دالة لاستخراج الاسم من رسالة المستخدم
function extractNameFromMessage(message) {
    const patterns = [
        /اسمي (\w+)/i,
        /أنا (\w+)/i,
        /my name is (\w+)/i,
        /i['']?m (\w+)/i,
        /i am (\w+)/i,
        /this is (\w+)/i,
        /call me (\w+)/i
    ];

    for (const pattern of patterns) {
        const match = message.match(pattern);
        if (match && match[1] && match[1].length >= 2 && match[1].length <= 30) {
            return match[1];
        }
    }
    return null;
}

// رسالة احتياطية عندما يكون مفتاح الـAI غير موجود
function aiOfflineMessage() {
    return "🤖 The AI assistant is offline on this build.\n\n" +
           "Browse our services or email us directly at <strong>EMarketingLab.co@gmail.com</strong> — " +
           "we'll get back to you within one business day.";
}

// تعديل دالة sendToAI لتشمل الاسم المحفوظ
async function sendToAIWithMemory(userMessage) {
    if (!AI_ENABLED) return aiOfflineMessage();
    // التحقق إذا كانت الرسالة تحتوي على اسم جديد
    const newName = extractNameFromMessage(userMessage);
    if (newName && !savedName) {
        saveName(newName);
    }

    // بناء رسالة السيستم مع الاسم إذا موجود
    let systemContent = `You are "E Marketing Lab co." AI Assistant. A digital marketing agency based in Palestine.

OUR SERVICES: Media Buying, SEO, Content Marketing, Web Design, Creative Design, Training, CRM, Gamified Marketing, Digital Strategy`;

    if (savedName) {
        systemContent += `\n\nThe user's name is ${savedName}. Address them by name in your responses. Be friendly and personalized.`;
    }

    systemContent += `\n\nIMPORTANT RULES:
- Respond in the SAME language as the user (Arabic/English)
- NEVER invent prices - say: "Please email us at EMarketingLab.co@gmail.com for pricing"
- Be helpful and professional
- If user asks about services, list our services
- Contact email: EMarketingLab.co@gmail.com
- Phone: +970593412`;

    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GROQ_API_KEY}`
            },
            body: JSON.stringify({
                model: 'llama-3.1-8b-instant',
                messages: [
                    { role: "system", content: systemContent },
                    { role: "user", content: userMessage }
                ],
                temperature: 0.7,
                max_tokens: 800
            })
        });

        const data = await response.json();
        if (data.error) {
            console.error('API Error:', data.error);
            return "⚠️ Service unavailable. Please email us at EMarketingLab.co@gmail.com";
        }
        return data.choices[0].message.content;
    } catch (error) {
        console.error('Network Error:', error);
        return "⚠️ Connection issue. Please email us at EMarketingLab.co@gmail.com";
    }
}

// تهيئة الشات بوت مع الذاكرة
function initChatbotWithMemory() {
    console.log('🔄 Initializing chatbot with memory...');

    // تحميل الاسم المحفوظ
    loadSavedName();

    setTimeout(() => {
        const chatbotBody = document.getElementById('chatbot-body');
        const chatbotInput = document.getElementById('chatbot-input');
        const sendButton = document.querySelector('.chatbot-box__footer button');

        if (!chatbotBody || !chatbotInput) {
            console.log('❌ Chatbot elements not found');
            return;
        }

        // رسالة ترحيب مخصصة
        if (chatbotBody.children.length <= 2) {
            if (savedName) {
                addAIChatMessage(`👋 Welcome back, ${savedName}! How can I help you with your digital marketing needs today?`);
            } else {
                addAIChatMessage(`👋 Welcome to E Marketing Lab co.! I'm your AI assistant. What's your name?`);
            }
        }

        if (sendButton) {
            sendButton.onclick = async () => {
                if (chatbotInput.value.trim()) {
                    const userMessage = chatbotInput.value.trim();
                    addUserChatMessage(userMessage);
                    chatbotInput.value = '';
                    showTypingIndicator();

                    const aiResponse = await sendToAIWithMemory(userMessage);

                    removeTypingIndicator();
                    addAIChatMessage(aiResponse);
                }
            };
        }

        chatbotInput.onkeypress = async (e) => {
            if (e.key === 'Enter' && chatbotInput.value.trim()) {
                e.preventDefault();
                const userMessage = chatbotInput.value.trim();
                addUserChatMessage(userMessage);
                chatbotInput.value = '';
                showTypingIndicator();

                const aiResponse = await sendToAIWithMemory(userMessage);

                removeTypingIndicator();
                addAIChatMessage(aiResponse);
            }
        };

        console.log('✅ Chatbot with memory is ready!');
    }, 500);
}

// زر لمسح الذاكرة
function addMemoryControls() {
    setTimeout(() => {
        const chatbotHeader = document.querySelector('.chatbot-box__header');
        if (chatbotHeader && !document.getElementById('memory-clear-btn')) {
            const clearBtn = document.createElement('button');
            clearBtn.id = 'memory-clear-btn';
            clearBtn.innerHTML = '🗑️';
            clearBtn.title = 'Forget my name';
            clearBtn.style.cssText = 'background:none; border:none; color:white; cursor:pointer; font-size:16px; margin-left:8px;';
            clearBtn.onclick = () => {
                if (confirm('Clear your saved name? I will forget who you are.')) {
                    clearSavedName();
                    addAIChatMessage('🧹 I\'ve forgotten your name. What\'s your name?');
                }
            };
            chatbotHeader.appendChild(clearBtn);
        }
    }, 1000);
}

// استبدال الدوال القديمة
function initAIChatbot() {
    initChatbotWithMemory();
}

function addAIChatMessage(text) {
    const container = document.getElementById('chatbot-body');
    if (!container) return;
    const div = document.createElement('div');
    div.className = 'chatbot-msg chatbot-msg--bot';
    div.innerHTML = `<div class="message-content">${text.replace(/\n/g, '<br>')}</div>`;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
}

function addUserChatMessage(text) {
    const container = document.getElementById('chatbot-body');
    if (!container) return;
    const div = document.createElement('div');
    div.className = 'chatbot-msg chatbot-msg--user';
    div.innerHTML = `<div class="message-content">${escapeHtml(text)}</div>`;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
}


// ========== 5. تشغيل كل الميزات ==========
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Starting AI features with company knowledge base...');

    // تأكد من تحميل company-data.js
    if (typeof COMPANY_INFO !== 'undefined') {
        console.log(`✅ Company knowledge base loaded: ${COMPANY_INFO.name}`);
        console.log(`📊 Services: ${COMPANY_INFO.services.length} services available`);
        console.log(`📈 Success stories: ${COMPANY_INFO.successStories.length} stories`);
    } else {
        console.warn('⚠️ company-data.js not loaded. Using fallback information.');
    }

    initAIChatbot();
    addAIMarketingButton();
    addAILogoGenerator();
    addServiceRecommenderButton();
    addBudgetSearchWidget();
    addMemoryControls();

    console.log('✅ All AI features activated successfully!');
});