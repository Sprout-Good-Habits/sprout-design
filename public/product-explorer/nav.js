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
      { label: 'Microphone', icon: 'mic', href: '/product-explorer/task/microphone.html' },
      { label: 'Microphone Video', icon: 'mic', href: '/product-explorer/task/microphone-video.html' },
      { label: 'Parent Chat', icon: 'message-chat', badge: 'v3', href: '/product-explorer/parent-chat-3.html' },
      { label: 'Home (Parent)', icon: 'home', href: '/product-explorer/parent-home.html' },
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
        label: 'Foundations',
        collapsible: true,
        children: [
          { label: 'Surfaces', href: '/parent-design-system/foundations/surfaces.html' },
          { label: 'Type', href: '/parent-design-system/foundations/type.html' },
          { label: 'Spacing', href: '/parent-design-system/foundations/spacing.html' },
          { label: 'Cards', href: '/parent-design-system/foundations/cards.html' }
        ]
      },
      { label: 'Catalog index', href: '/parent-design-system/components.html' },
      {
        label: 'Components',
        collapsible: true,
        defaultOpen: true,
        children: [
          { label: 'Artifact', href: '/parent-design-system/components/artifact.html' },
          { label: 'Attach Panel', href: '/parent-design-system/components/attach-panel.html' },
          { label: 'Toast', href: '/parent-design-system/components/toast.html' },
          { label: 'Card', href: '/parent-design-system/components/card.html' },
          { label: 'Communication Card', href: '/parent-design-system/components/comm-card.html' },
          { label: 'Result Card', href: '/parent-design-system/components/result-card.html' },
          { label: 'Skill Sheet', href: '/parent-design-system/components/skill-sheet.html' },
          { label: 'Chips', href: '/parent-design-system/components/chat-chips.html' },
          { label: 'Composer', href: '/parent-design-system/components/chat-composer.html' },
          { label: 'Co-parent Message', href: '/parent-design-system/components/coparent-message.html' },
          { label: 'Context Menu', href: '/parent-design-system/components/chat-context-menu.html' },
          { label: 'Error Recovery', href: '/parent-design-system/components/error-recovery.html' },
          { label: 'Notification Toast', href: '/parent-design-system/components/toast.html#notification-banner' },
          { label: 'Planning Tree', href: '/parent-design-system/components/planning-tree.html' },
          { label: 'Reasoning Transcript', href: '/parent-design-system/components/reasoning-transcript.html' },
          { label: 'Status Bar', href: '/parent-design-system/components/status-bar.html' },
          { label: 'Toolbar', href: '/parent-design-system/components/chat-toolbar.html' },
          { label: 'Typing Indicator', href: '/parent-design-system/components/typing-indicator.html' }
        ]
      }
    ]
  }
];
