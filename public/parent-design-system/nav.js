/* ═══════════════════════════════════════════════════
   Sprout Parent Design System / Navigation Data
   Documentation-only mirror. The actual sidebar nav
   loads from /product-explorer/nav.js. Keep these in sync.
   ═══════════════════════════════════════════════════ */
window.DS_NAV = [
  { label: 'Home', href: '/parent-design-system/', dot: 'var(--gray-400)' },
  {
    label: 'Foundations', collapsible: true, defaultOpen: true, dot: 'var(--brand-500)',
    children: [
      { label: 'Surfaces', href: '/parent-design-system/foundations/surfaces.html' },
      { label: 'Type', href: '/parent-design-system/foundations/type.html' },
      { label: 'Spacing', href: '/parent-design-system/foundations/spacing.html' },
      { label: 'Cards', href: '/parent-design-system/foundations/cards.html' }
    ]
  },
  {
    label: 'Conversation Core', collapsible: true, dot: 'var(--sprout-400)',
    children: [
      { label: 'Sprout Message', href: '/parent-design-system/components/sprout-message.html' },
      { label: 'Parent Message', href: '/parent-design-system/components/parent-message.html' },
      { label: 'Button', href: '/parent-design-system/components/button.html' },
      { label: 'Photo Upload', href: '/parent-design-system/components/photo-upload.html' },
      { label: 'Media', href: '/parent-design-system/components/media.html' },
      { label: 'Media Gallery', href: '/parent-design-system/components/media-gallery.html' },
      { label: 'File Attachment', href: '/parent-design-system/components/file-attachment.html' },
      { label: 'File Attachment List', href: '/parent-design-system/components/file-attachment-list.html' }
    ]
  },
  {
    label: 'Agent Metacognition', collapsible: true, dot: 'var(--sprout-500)',
    children: [
      { label: 'Typing Indicator', href: '/parent-design-system/components/typing-indicator.html' },
      { label: 'Reasoning Transcript', href: '/parent-design-system/components/reasoning-transcript.html' },
      { label: 'Action Stream', href: '/parent-design-system/components/tool-usage.html' },
      { label: 'Planning Tree', href: '/parent-design-system/components/planning-tree.html' },
      { label: 'Tool Selection', href: '/parent-design-system/components/tool-usage.html#tool-selection' },
      { label: 'Error Recovery', href: '/parent-design-system/components/error-recovery.html' }
    ]
  },
  {
    label: 'Cards & Data', collapsible: true, dot: 'var(--orange-400)',
    children: [
      { label: 'Result Card', href: '/parent-design-system/components/result-card.html' },
      { label: 'Artifact', href: '/parent-design-system/components/artifact.html' }
    ]
  },
  {
    label: 'Patterns', collapsible: true, dot: 'var(--brand-500)',
    children: [
      { label: 'Toast', href: '/parent-design-system/components/toast.html' }
    ]
  },
  {
    label: 'Cards', collapsible: true, dot: 'var(--orange-400)',
    children: [
      { label: 'Card', href: '/parent-design-system/components/card.html' },
      { label: 'Communication Card', href: '/parent-design-system/components/comm-card.html' },
      { label: 'Result Card', href: '/parent-design-system/components/result-card.html' },
      { label: 'Artifact Card', href: '/parent-design-system/components/artifact.html' }
    ]
  },
  {
    label: 'API / Connectors', collapsible: true, dot: 'var(--brand-500)',
    children: [
      { label: 'Button', href: '/parent-design-system/components/button.html' },
      { label: 'Skill Sheet', href: '/parent-design-system/components/skill-sheet.html' },
      { label: 'Scope Sheet', href: '/parent-design-system/components/scope-sheet.html' },
      { label: 'Connector More Menu', href: '/parent-design-system/components/connector-more-menu.html' }
    ]
  }
];
