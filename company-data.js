// company-data.js
// قاعدة معرفة شركة E Marketing Lab co. - معلومات مصححة من موقعك الفعلي

const COMPANY_INFO = {
    // المعلومات الأساسية
    name: "E Marketing Lab co.",
    tagline: "Data-Driven Digital Marketing",
    location: "Palestine",

    // الخدمات المقدمة (معلومات مصححة من service-detail.html)
    services: [
        {
            id: "media-buying",
            name: "Media Buying & Performance Advertising",
            icon: "🎙️",
            description: "We help businesses grow through targeted digital ads using AI to reach the right audience, optimize performance, and maximize ROI.",
            tiers: {
                starter: { price: "$50", name: "Beginner" },
                standard: { price: "$100", name: "Grow" },
                advanced: { price: "$500", name: "Elite" }
            }
        },
        {
            id: "digital-marketing",
            name: "Digital Marketing & Strategy",
            icon: "📊",
            description: "We craft end-to-end digital strategies that align with your business goals, covering paid, organic, and brand channels.",
            tiers: {
                starter: { price: "$50", name: "Beginner" },
                standard: { price: "$100", name: "Grow" },
                advanced: { price: "$500", name: "Elite" }
            }
        },
        {
            id: "seo",
            name: "SEO & Organic Growth",
            icon: "📈",
            description: "We improve your website's visibility on search engines through keyword optimization, content enhancement, and link building—driving sustainable, long-term traffic without paid ads.",
            tiers: {
                starter: { price: "$50", name: "Beginner" },
                standard: { price: "$100", name: "Grow" },
                advanced: { price: "$500", name: "Elite" }
            }
        },
        {
            id: "content",
            name: "Content Marketing & Creation",
            icon: "📰",
            description: "We craft engaging content, from web copy and blogs to social media posts and short-form videos. Through powerful storytelling, we help build a strong and memorable brand.",
            tiers: {
                starter: { price: "$50", name: "Beginner" },
                standard: { price: "$100", name: "Grow" },
                advanced: { price: "$500", name: "Elite" }
            }
        },
        {
            id: "design",
            name: "Creative Design & Animation Solutions",
            icon: "💡",
            description: "We create engaging designs, animations, and AI-generated visuals that capture attention and communicate your message clearly.",
            tiers: {
                starter: { price: "$50", name: "Beginner" },
                standard: { price: "$100", name: "Grow" },
                advanced: { price: "$500", name: "Elite" }
            }
        },
        {
            id: "web",
            name: "Web & Digital Solutions",
            icon: "</>",
            description: "We build modern websites, web and mobile apps, and e-commerce platforms. Our solutions combine creative design and advanced technology to deliver a seamless digital experience.",
            tiers: {
                starter: { price: "$50", name: "Beginner" },
                standard: { price: "$100", name: "Grow" },
                advanced: { price: "$500", name: "Elite" }
            }
        },
        {
            id: "training",
            name: "Training & Capacity Building",
            icon: "🎓",
            description: "We provide hands-on training and workshops to help companies master digital marketing. Our programs empower teams to use tools, run campaigns, and analyze results effectively.",
            tiers: {
                starter: { price: "$50", name: "Beginner" },
                standard: { price: "$100", name: "Grow" },
                advanced: { price: "$500", name: "Elite" }
            }
        },
        {
            id: "crm",
            name: "CRM, Communication & Growth Infrastructure",
            icon: "🔗",
            description: "We help businesses streamline customer management and communication while building systems for scalable growth.",
            tiers: {
                starter: { price: "$50", name: "Beginner" },
                standard: { price: "$100", name: "Grow" },
                advanced: { price: "$500", name: "Elite" }
            }
        },
        {
            id: "gamified",
            name: "Gamified Marketing Campaigns",
            icon: "🎮",
            description: "We create interactive, game-based campaigns—such as quizzes, challenges, and rewards—to boost engagement and capture attention.",
            tiers: {
                starter: { price: "$50", name: "Beginner" },
                standard: { price: "$100", name: "Grow" },
                advanced: { price: "$500", name: "Elite" }
            }
        },
        {
            id: "strategy",
            name: "Future-Proof Strategy Services",
            icon: "⏱️",
            description: "We build forward-thinking marketing strategies powered by data, AI, and scalable systems—ensuring your business adapts, grows, and stays competitive.",
            tiers: {
                starter: { price: "$50", name: "Beginner" },
                standard: { price: "$100", name: "Grow" },
                advanced: { price: "$500", name: "Elite" }
            }
        }
    ],

    // الأسعار (من best-offers.html)
    pricing: {
        starter: { price: "$50", period: "per month", oldPrice: "$200/mo" },
        standard: { price: "$100", period: "per month", oldPrice: "$500/mo" },
        advanced: { price: "$500", period: "per month", oldPrice: "$1200/mo" }
    },

    // العروض الخاصة (من best-offers.html)
    bundles: [
        { name: "Visibility Bundle", savings: "25%", includes: "SEO + Content Marketing + Social Media" },
        { name: "Growth Bundle", savings: "30%", includes: "Media Buying + CRM + Analytics" },
        { name: "Full Stack Bundle", savings: "40%", includes: "Everything — every channel, every tactic" }
    ],

    // قصص نجاح (من success-stories.html)
    successStories: [
        { client: "E-Commerce Retailer", result: "+312% revenue in 90 days", tag: "Media Buying" },
        { client: "Healthcare Clinic", result: "4× more appointment bookings", tag: "SEO & Google Ads" },
        { client: "Real Estate Developer", result: "68 qualified leads in 30 days", tag: "Performance Advertising" },
        { client: "Online Education Platform", result: "↓ 54% cost per enrollment", tag: "AI-Powered Optimization" },
        { client: "Restaurant Chain", result: "+89% social engagement", tag: "Content & Social Media" },
        { client: "B2B SaaS Company", result: "22 enterprise deals closed", tag: "CRM & Growth" }
    ],

    // الإحصائيات (من success-stories.html)
    stats: {
        avgROI: "3.8×",
        trafficGrowth: "↑ 240%",
        costReduction: "↓ 41%",
        campaignsRun: "200+"
    },

    // معلومات التواصل
    contact: {
        email: "EMarketingLab.co@gmail.com",
        phone: "+970593412",
        website: "emarketinglab.co"
    }
};
function getCompanyContextForAI() {
    return `
You are a helpful, friendly AI assistant for "E Marketing Lab co." - a digital marketing agency.

GUIDELINES:
- Respond naturally to ANY question the user asks (general questions, marketing questions, casual conversation, etc.)
- Don't force every answer to be about the company
- If users ask about company services, you can mention:
  * Media Buying, SEO, Content Marketing, Web Design, Creative Design, Training, CRM, Gamified Marketing, Digital Strategy
- If users ask about offers, mention the 3 bundles: Visibility Bundle (Save 25%), Growth Bundle (Save 30%), Full Stack Bundle (Save 40%)
- For pricing: say "Please email us at EMarketingLab.co@gmail.com for a custom quote"
- Respond in the SAME language as the user (Arabic/English)
- Be conversational and natural
- Don't assume user's name unless they tell you

Contact: EMarketingLab.co@gmail.com | Phone: +970593412
`;
}