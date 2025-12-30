// Asset Types
export const ASSET_TYPES = [
  { value: 'IMAGE', label: 'Image', icon: 'Image' },
  { value: 'VIDEO', label: 'Video', icon: 'Video' },
  { value: 'AUDIO', label: 'Audio', icon: 'Music' },
  { value: 'TEXT', label: 'Text/Document', icon: 'FileText' },
  { value: 'TWO_D', label: '2D Graphics', icon: 'Layers' },
  { value: 'THREE_D', label:  '3D Models', icon: 'Box' },
] as const;

// License Types
export const LICENSE_TYPES = [
  {
    value: 'STANDARD',
    label:  'Standard License',
    description: 'Use in personal and single commercial project',
  },
  {
    value: 'COMMERCIAL',
    label: 'Commercial License',
    description: 'Use in unlimited commercial projects',
  },
  {
    value: 'EXTENDED',
    label:  'Extended License',
    description: 'Resale and distribution rights included',
  },
] as const;

// Categories
export const CATEGORIES = [
  {
    value: 'photos',
    label:  'Photos',
    subcategories: ['Nature', 'People', 'Business', 'Technology', 'Travel', 'Food', 'Architecture'],
  },
  {
    value: 'illustrations',
    label:  'Illustrations',
    subcategories: ['Vector', 'Hand-drawn', 'Digital Art', 'Icons', 'Patterns'],
  },
  {
    value: 'videos',
    label: 'Videos',
    subcategories: ['Stock Footage', 'Motion Graphics', 'Backgrounds', 'Transitions'],
  },
  {
    value: 'audio',
    label:  'Audio',
    subcategories:  ['Music', 'Sound Effects', 'Podcasts', 'Loops'],
  },
  {
    value: 'templates',
    label:  'Templates',
    subcategories:  ['Presentations', 'Social Media', 'Print', 'Web'],
  },
  {
    value:  '3d',
    label: '3D Assets',
    subcategories: ['Models', 'Textures', 'Materials', 'Scenes'],
  },
  {
    value: 'fonts',
    label:  'Fonts',
    subcategories: ['Sans-serif', 'Serif', 'Display', 'Handwritten', 'Monospace'],
  },
] as const;

// File Limits
export const FILE_LIMITS = {
  IMAGE: {
    maxSize: 50 * 1024 * 1024, // 50MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
    allowedExtensions:  ['.jpg', '.jpeg', '.png', '. gif', '.webp', '.svg'],
  },
  VIDEO: {
    maxSize: 500 * 1024 * 1024, // 500MB
    allowedTypes: ['video/mp4', 'video/webm', 'video/quicktime'],
    allowedExtensions: ['.mp4', '. webm', '.mov'],
  },
  AUDIO: {
    maxSize:  100 * 1024 * 1024, // 100MB
    allowedTypes: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/flac'],
    allowedExtensions: ['.mp3', '. wav', '.ogg', '.flac'],
  },
  TEXT: {
    maxSize: 20 * 1024 * 1024, // 20MB
    allowedTypes: ['application/pdf', 'text/plain', 'application/json'],
    allowedExtensions: ['.pdf', '.txt', '. json'],
  },
  TWO_D: {
    maxSize: 100 * 1024 * 1024, // 100MB
    allowedTypes: ['image/png', 'image/svg+xml', 'application/postscript', 'image/vnd.adobe.photoshop'],
    allowedExtensions:  ['.png', '. svg', '.ai', '.eps', '.psd'],
  },
  THREE_D: {
    maxSize: 200 * 1024 * 1024, // 200MB
    allowedTypes: ['model/gltf-binary', 'model/gltf+json', 'application/octet-stream'],
    allowedExtensions: ['. glb', '.gltf', '.fbx', '.obj', '.blend'],
  },
} as const;

// Platform Settings
export const PLATFORM = {
  COMMISSION_PERCENT: 10,
  MINIMUM_PAYOUT_AMOUNT: 50,
  DOWNLOAD_LINK_EXPIRY: 15 * 60, // 15 minutes in seconds
  MAX_CART_ITEMS: 50,
  SEARCH_RESULTS_PER_PAGE: 20,
} as const;

// Status Colors (for UI)
export const STATUS_COLORS = {
  DRAFT: 'gray',
  PENDING: 'yellow',
  APPROVED: 'green',
  REJECTED:  'red',
  REMOVED: 'red',
} as const;

export const PAYOUT_STATUS_COLORS = {
  PENDING: 'yellow',
  APPROVED: 'blue',
  PAID: 'green',
  REJECTED: 'red',
} as const;

export const TICKET_STATUS_COLORS = {
  OPEN: 'blue',
  IN_PROGRESS: 'yellow',
  RESOLVED: 'green',
  CLOSED:  'gray',
} as const;