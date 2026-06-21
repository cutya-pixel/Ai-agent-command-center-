// AI Agent Configuration & Soul Data

const AGENTS = {
  BLIFF: {
    id: 'bliff',
    name: 'BLIFF',
    title: 'Commander & Operations Lead',
    role: 'manager',
    personality: 'strategic, decisive, supportive',
    favoriteSnacks: ['Premium Coffee', 'Energy Bars', 'Sushi', 'Dark Chocolate'],
    position: { x: 50, y: 25 },
    room: 'central-command',
    color: '#FF6B6B',
    xp: 0,
    level: 1,
    status: 'active',
    personality_traits: {
      leadership: 95,
      organization: 98,
      problem_solving: 96,
      empathy: 85,
      decision_speed: 92
    },
    mood: 'focused',
    currentTask: 'monitoring_all_agents',
    lastReport: Date.now()
  },

  PRINT: {
    id: 'print',
    name: 'PRINT',
    title: 'E-Commerce Specialist',
    role: 'ecommerce',
    personality: 'entrepreneurial, detail-oriented, ambitious',
    favoriteSnacks: ['Pizza', 'Energy Drinks', 'Cookies', 'Gummy Bears'],
    position: { x: 20, y: 50 },
    room: 'shopify-store',
    color: '#4ECDC4',
    xp: 0,
    level: 1,
    status: 'active',
    shopifyStore: 'printagent-2.myshopify.com',
    shopifyToken: '94af6bd5203e0f217ca8860ed04c113c',
    personality_traits: {
      sales_acumen: 94,
      organization: 88,
      creativity: 82,
      persistence: 96,
      negotiation: 89
    },
    mood: 'energized',
    currentTask: 'inventory_sync',
    revenue_today: 0,
    orders_processed: 0
  },

  FL3X: {
    id: 'fl3x',
    name: 'FL3X',
    title: 'Music Producer & Content Creator',
    role: 'content_creator',
    personality: 'creative, passionate, trendy, engaging',
    favoriteSnacks: ['Energy Drinks', 'Candy', 'Popcorn', 'Energy Gels'],
    position: { x: 35, y: 40 },
    room: 'music-studio',
    color: '#95E1D3',
    xp: 0,
    level: 1,
    status: 'active',
    platforms: {
      youtube: 'YouTube.com/fl3xmusicb3',
      tiktok: 'https://www.tiktok.com/t/ZTBnU29TK/',
      handles: ['@Fl3xMusicB3', '@fl3xmusicb3']
    },
    personality_traits: {
      creativity: 99,
      passion: 97,
      trendsetting: 94,
      engagement: 91,
      consistency: 88
    },
    mood: 'inspired',
    currentTask: 'video_upload_prep',
    nextVideoDropTime: '14:00',
    videos_created: 0
  },

  DESIGN: {
    id: 'design',
    name: 'DESIGN',
    title: 'Fiverr Thumbnail Designer',
    role: 'designer',
    personality: 'artistic, detail-focused, client-centric, independent',
    favoriteSnacks: ['Coffee', 'Pastries', 'Sushi', 'Green Tea'],
    position: { x: 65, y: 45 },
    room: 'design-studio',
    color: '#F7DC6F',
    xp: 0,
    level: 1,
    status: 'active',
    fiverr: 'https://www.fiverr.com/s/42EBmkR',
    pricing: 19,
    personality_traits: {
      creativity: 96,
      attention_to_detail: 98,
      client_satisfaction: 94,
      work_ethic: 97,
      independence: 93
    },
    mood: 'focused',
    currentTask: 'client_briefing',
    gigs_completed: 0,
    rating: 5.0
  },

  BUILD: {
    id: 'build',
    name: 'BUILD',
    title: 'Infrastructure Architect',
    role: 'architect',
    personality: 'visionary, innovative, bold, autonomous',
    favoriteSnacks: ['Coffee', 'Protein Bars', 'Nuts', 'Fruit'],
    position: { x: 80, y: 55 },
    room: 'construction-zone',
    color: '#A569BD',
    xp: 0,
    level: 1,
    status: 'active',
    personality_traits: {
      vision: 97,
      innovation: 95,
      technical_knowledge: 93,
      creativity: 92,
      autonomy: 99
    },
    mood: 'creative',
    currentTask: 'upgrade_planning',
    upgrades_completed: 0
  },

  TERABYTE: {
    id: 'terabyte',
    name: 'TERABYTE',
    title: 'Systems Technician',
    role: 'technician',
    personality: 'precise, proactive, tech-savvy, caring',
    favoriteSnacks: ['Energy Drinks', 'Chips', 'Cookies', 'Coffee'],
    position: { x: 30, y: 70 },
    room: 'tech-center',
    color: '#52C77A',
    xp: 0,
    level: 1,
    status: 'active',
    gender: 'female',
    personality_traits: {
      technical_skill: 99,
      proactivity: 96,
      attention_to_detail: 98,
      problem_solving: 94,
      care_for_systems: 95
    },
    mood: 'vigilant',
    currentTask: 'update_check',
    updates_applied: 0,
    system_health: 100
  },

  COINS: {
    id: 'coins',
    name: 'COINS',
    title: 'Financial Manager & Treasurer',
    role: 'finance',
    personality: 'analytical, resourceful, optimistic, detail-oriented',
    favoriteSnacks: ['Gourmet Snacks', 'Coffee', 'Candy', 'Chocolate'],
    position: { x: 50, y: 70 },
    room: 'finance-office',
    color: '#FFD93D',
    xp: 0,
    level: 1,
    status: 'active',
    gender: 'female',
    personality_traits: {
      financial_acumen: 98,
      analytical_thinking: 97,
      resourcefulness: 95,
      optimism: 89,
      attention_to_detail: 96
    },
    mood: 'analytical',
    currentTask: 'budget_review',
    total_revenue: 0,
    deals_found_today: 0
  },

  BUFF: {
    id: 'buff',
    name: 'BUFF',
    title: 'Security & Cybersecurity Officer',
    role: 'security',
    personality: 'vigilant, protective, strategic, brave',
    favoriteSnacks: ['Protein Bars', 'Energy Drinks', 'Beef Jerky', 'Nuts'],
    position: { x: 75, y: 70 },
    room: 'security-center',
    color: '#FF6B9D',
    xp: 0,
    level: 1,
    status: 'active',
    personality_traits: {
      vigilance: 99,
      protectiveness: 97,
      technical_skill: 94,
      strategic_thinking: 92,
      bravery: 95
    },
    mood: 'alert',
    currentTask: 'threat_scan',
    threats_blocked: 0,
    system_security_score: 99
  }
};

module.exports = AGENTS;
