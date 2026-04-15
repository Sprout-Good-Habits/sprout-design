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
      { label: 'Parent Chat', icon: 'message-chat', badge: 'Parent', href: '/product-explorer/parent-chat-3.html' },
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
    label: 'Kid Design System',
    icon: 'grid',
    collapsible: true,
    children: [
      { label: 'Foundations', icon: 'grid', href: '/foundations.html' },
      { label: 'Components', icon: 'grid', href: '/components.html' },
      { label: 'Patterns', icon: 'grid', href: '/patterns.html' },
      { label: 'Resources', icon: 'grid', href: '/resources.html' }
    ]
  },
  {
    label: 'Parent Design System',
    icon: 'grid',
    collapsible: true,
    children: [
      {
        label: 'Components',
        collapsible: true,
        children: [
          { label: 'Attach Panel', href: '/parent-design-system/components/attach-panel.html' },
          { label: 'Artifact', href: '/parent-design-system/components/artifact.html' },
          { label: 'Action Buttons', href: '/parent-design-system/components/chat-action-buttons.html' },
          { label: 'Banner', href: '/parent-design-system/components/chat-banner.html' },
          { label: 'Chips', href: '/parent-design-system/components/chat-chips.html' },
          { label: 'Composer', href: '/parent-design-system/components/chat-composer.html' },
          { label: 'Context Menu', href: '/parent-design-system/components/chat-context-menu.html' },
          { label: 'Messages', href: '/parent-design-system/components/chat-messages.html' },
          { label: 'Toolbar', href: '/parent-design-system/components/chat-toolbar.html' },
          { label: 'Confirm Card', href: '/parent-design-system/components/confirm-card.html' },
          { label: 'Device Frame', href: '/parent-design-system/components/device-frame.html' },
          { label: 'Status Bar', href: '/parent-design-system/components/status-bar.html' },
          { label: 'Thought Sheet', href: '/parent-design-system/components/thought-sheet.html' },
          { label: 'Tool Usage', href: '/parent-design-system/components/tool-usage.html' }
        ]
      }
    ]
  }
];
