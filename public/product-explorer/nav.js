/* ═══════════════════════════════════════════════════
   Product Explorer — Navigation data (single source of truth)
   ═══════════════════════════════════════════════════ */

window.DS_NAV = [
  {
    label: 'Product explorer',
    icon: 'phone',
    href: '/product-explorer/',
    collapsible: true,
    defaultOpen: true,
    children: [
      { label: 'Chat', icon: 'message-chat', badge: 'Tier 2', href: '/product-explorer/task/chat-tier-2.html' },
      { label: 'Chat', icon: 'message-chat', badge: 'Tier 3', href: '/product-explorer/task/chat-tier-3.html' },
      { label: 'Chat Tiles', icon: 'message-chat', badge: 'Tier 2', href: '/product-explorer/task/chat-tier-2-tiles.html' },
      { label: 'Chat Tiles', icon: 'message-chat', badge: 'Tier 3', href: '/product-explorer/task/chat-tier-3-tiles.html' },
      { label: 'Customize sprout', icon: 'stars-01', href: '/product-explorer/customize-sprout.html' },
      { label: 'Customize avatar', icon: 'stars-02', href: '/product-explorer/customize-avatar.html' },
      { label: 'Video verification', icon: 'video-recorder', href: '/product-explorer/video-verification-explorer.html' },
      { label: 'Home', icon: 'home', badge: 'Tier 2', href: '/product-explorer/kid-home/tier-2.html' },
      { label: 'Home', icon: 'home', badge: 'Tier 3', href: '/product-explorer/kid-home/tier-3.html' },
      { label: 'Activity', icon: 'grid', href: '/product-explorer/kid-home/activity.html' },
      { label: 'New Activity', icon: 'grid', href: '/product-explorer/kid-home/new-activity.html' },
      { label: 'Quest — Photo', icon: 'grid', href: '/product-explorer/quest/photo.html' },
      { label: 'Quest — Classic', icon: 'grid', href: '/product-explorer/quest/quiz-classic.html' },
      { label: 'Quest — Guided', icon: 'grid', href: '/product-explorer/quest/quiz-guided.html' },
      { label: 'Quest — Conversational', icon: 'grid', href: '/product-explorer/quest/quiz-conversational.html' },
      { label: 'Checklist Lobby', icon: 'grid', badge: 'Tier 2', href: '/product-explorer/checklist/lobby-tier-2.html' },
      { label: 'Checklist Lobby', icon: 'grid', badge: 'Tier 3', href: '/product-explorer/checklist/lobby-tier-3.html' }
    ]
  },
  {
    label: 'Design System',
    icon: 'grid',
    collapsible: true,
    children: [
      { label: 'Foundations', icon: 'grid', href: '/foundations.html' },
      { label: 'Components', icon: 'grid', href: '/components.html' },
      { label: 'Patterns', icon: 'grid', href: '/patterns.html' },
      { label: 'Resources', icon: 'grid', href: '/resources.html' }
    ]
  }
];
