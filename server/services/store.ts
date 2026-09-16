import { Collection, CommentItem, IdeaPage, MediaItem, NotificationItem, UserProfile } from '../../src/types';
import { CURATED_MEDIA } from './curatedData';

// Initial Mock User & Creators
export const DEFAULT_USER: UserProfile = {
  id: 'usr-current',
  username: 'elena_v',
  displayName: 'Elena Vance',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  bio: 'Visual curator & spatial designer. Exploring light, materials, and quiet forms.',
  website: 'https://vistora.app/creator/elena_v',
  followersCount: 1240,
  followingCount: 48,
  likesCount: 382,
  savesCount: 145,
};

export const CREATORS: Record<string, UserProfile> = {
  'elena_v': DEFAULT_USER,
  'marcusvance': {
    id: 'usr-marcus',
    username: 'marcusvance',
    displayName: 'Marcus Vance',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    bio: 'Architectural photographer capturing brutalist concrete, shadow rhythms, and modern pavilions.',
    followersCount: 3420,
    followingCount: 112,
    badge: 'Pro Creator',
  },
  'soratanaka': {
    id: 'usr-sora',
    username: 'soratanaka',
    displayName: 'Sora Tanaka',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
    bio: 'Tokyo-based visual artist & cinematographer. Monochrome architecture & atmospheric rain.',
    followersCount: 4890,
    followingCount: 89,
    badge: 'Featured',
  },
  'chloedupont': {
    id: 'usr-chloe',
    username: 'chloedupont',
    displayName: 'Chloé Dupont',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
    bio: 'Interior architect focusing on Scandinavian warmth, bouclé upholstery, and natural wood textures.',
    followersCount: 2980,
    followingCount: 143,
    badge: 'Curator',
  },
  'kaelenmiller': {
    id: 'usr-kaelen',
    username: 'kaelenmiller',
    displayName: 'Kaelen Miller',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    bio: 'Wilderness documentarian and high-altitude explorer. Glacial lakes & alpine summits.',
    followersCount: 6120,
    followingCount: 77,
    badge: 'Explorer',
  }
};

class VistoraStore {
  public currentUser: UserProfile = { ...DEFAULT_USER };
  public collections: Collection[] = [
    {
      id: 'col-1',
      ownerId: 'usr-current',
      ownerName: 'Elena Vance',
      ownerAvatar: DEFAULT_USER.avatarUrl,
      name: 'Dream House',
      description: 'Cantilevered architectural volumes, warm cedar, and monolithic light wells.',
      isPrivate: false,
      coverUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
      itemCount: 4,
      createdAt: '2026-08-12',
      items: [CURATED_MEDIA[0], CURATED_MEDIA[1], CURATED_MEDIA[2], CURATED_MEDIA[6]],
    },
    {
      id: 'col-2',
      ownerId: 'usr-current',
      ownerName: 'Elena Vance',
      ownerAvatar: DEFAULT_USER.avatarUrl,
      name: 'Travel Inspiration',
      description: 'Pristine glacial fjords, Sahara dunes, and remote alpine summits.',
      isPrivate: false,
      coverUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
      itemCount: 3,
      createdAt: '2026-08-20',
      items: [CURATED_MEDIA[3], CURATED_MEDIA[4], CURATED_MEDIA[5]],
    },
    {
      id: 'col-3',
      ownerId: 'usr-current',
      ownerName: 'Elena Vance',
      ownerAvatar: DEFAULT_USER.avatarUrl,
      name: 'Startup Ideas & Moodboard',
      description: 'Visual identity, tactile materials, workspace ergonomics, and packaging aesthetics.',
      isPrivate: true,
      coverUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80',
      itemCount: 3,
      createdAt: '2026-09-01',
      items: [CURATED_MEDIA[9], CURATED_MEDIA[10], CURATED_MEDIA[12]],
    },
    {
      id: 'col-4',
      ownerId: 'usr-marcus',
      ownerName: 'Marcus Vance',
      ownerAvatar: CREATORS['marcusvance'].avatarUrl,
      name: 'Raw Concrete & Shadows',
      description: 'Brutalist facades and geometric form exploration in natural skylight.',
      isPrivate: false,
      coverUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
      itemCount: 2,
      createdAt: '2026-09-05',
      items: [CURATED_MEDIA[1], CURATED_MEDIA[2]],
    },
  ];

  public userLikes: Set<string> = new Set(['arch-101', 'nature-201', 'interior-301']);
  public userSavedMedia: Set<string> = new Set(['arch-101', 'arch-102', 'arch-103', 'nature-201', 'interior-301', 'tech-601']);
  public userFollows: Set<string> = new Set(['marcusvance', 'soratanaka']);
  public followedIdeas: Set<string> = new Set(['modern-african-house']);
  public savedIdeas: Set<string> = new Set(['modern-kitchen']);

  public comments: Record<string, CommentItem[]> = {
    'arch-101': [
      {
        id: 'cmt-1',
        mediaId: 'arch-101',
        userId: 'usr-marcus',
        username: 'marcusvance',
        displayName: 'Marcus Vance',
        avatarUrl: CREATORS['marcusvance'].avatarUrl,
        content: 'The cantilever structural balance here is breathtaking. Love the wood warmth against the glass.',
        createdAt: '2 hours ago',
        likesCount: 14,
      },
      {
        id: 'cmt-2',
        mediaId: 'arch-101',
        userId: 'usr-chloe',
        username: 'chloedupont',
        displayName: 'Chloé Dupont',
        avatarUrl: CREATORS['chloedupont'].avatarUrl,
        content: 'Natural lighting inside that living pavilion must be incredible during the late afternoon.',
        createdAt: '1 day ago',
        likesCount: 9,
      }
    ],
    'nature-201': [
      {
        id: 'cmt-3',
        mediaId: 'nature-201',
        userId: 'usr-sora',
        username: 'soratanaka',
        displayName: 'Sora Tanaka',
        avatarUrl: CREATORS['soratanaka'].avatarUrl,
        content: 'That emerald water clarity is unreal. Where was this captured?',
        createdAt: '3 days ago',
        likesCount: 7,
      }
    ]
  };

  public notifications: NotificationItem[] = [
    {
      id: 'notif-1',
      type: 'follow',
      actorName: 'Chloé Dupont',
      actorAvatar: CREATORS['chloedupont'].avatarUrl,
      message: 'started following your visual collections',
      isRead: false,
      createdAt: '10m ago',
    },
    {
      id: 'notif-2',
      type: 'like',
      actorName: 'Marcus Vance',
      actorAvatar: CREATORS['marcusvance'].avatarUrl,
      message: 'liked your saved photograph "Modern Minimalist Villa"',
      targetId: 'arch-101',
      targetThumbnail: CURATED_MEDIA[0].thumbnailUrl,
      isRead: false,
      createdAt: '45m ago',
    },
    {
      id: 'notif-3',
      type: 'save',
      actorName: 'Sora Tanaka',
      actorAvatar: CREATORS['soratanaka'].avatarUrl,
      message: 'saved your collection "Dream House" to their inspiration boards',
      targetId: 'col-1',
      isRead: true,
      createdAt: '3h ago',
    },
    {
      id: 'notif-4',
      type: 'comment',
      actorName: 'Kaelen Miller',
      actorAvatar: CREATORS['kaelenmiller'].avatarUrl,
      message: 'commented on "Alpine Emerald Lake"',
      targetId: 'nature-201',
      isRead: true,
      createdAt: '1d ago',
    }
  ];

  public ideaPages: Record<string, IdeaPage> = {
    'modern-african-house': {
      slug: 'modern-african-house',
      title: 'Modern African House',
      tagline: 'Earthy rammed-earth textures, dramatic cantilevered shade canopies, and indigenous desert landscaping.',
      category: 'Architecture',
      coverUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=85',
      inspirationOverview: 'Modern African architectural expression celebrates harmonious vernacular integration. Characterized by high thermal mass rammed earth walls, expansive passive-cooling overhangs, breezy central water courtyards, and deep respect for indigenous vegetation, it bridges ancient organic craftsmanship with cutting-edge sustainable luxury.',
      colorPalette: [
        { name: 'Rammed Ochre', hex: '#D27D46', description: 'Sun-baked clay earth' },
        { name: 'Kalahari Sand', hex: '#E7D5C2', description: 'Soft textured plaster' },
        { name: 'Charred Acacia', hex: '#2F2723', description: 'Dark wood timber framing' },
        { name: 'Savannah Bronze', hex: '#B8860B', description: 'Aged metallic door handles' },
        { name: 'Vistora Yellow', hex: '#FFD21F', description: 'Illuminated skylight warmth' },
      ],
      architectureElements: [
        { title: 'Thermal Rammed Earth', description: 'Dense excavated clay providing natural temperature regulation against afternoon heat.' },
        { title: 'Perforated Brick Screens', description: 'Intricate mashrabiya patterns filtering sunlight while funneling prevailing breezes.' },
        { title: 'Deep Shaded Cantilevers', description: 'Broad horizontal planes shielding double-height glazing from harsh midday UV.' },
        { title: 'Central Courtyard Pools', description: 'Reflecting pools that induce evaporative cross-ventilation through the living spaces.' }
      ],
      relatedSearches: ['Tropical Modernism', 'Desert Earth Villa', 'Sahel Courtyard House', 'Rammed Earth Interiors', 'Organic Architecture'],
      items: [CURATED_MEDIA[0], CURATED_MEDIA[1], CURATED_MEDIA[5], CURATED_MEDIA[6]],
      savedCount: 2840,
    },
    'modern-kitchen': {
      slug: 'modern-kitchen',
      title: 'Modern Kitchen',
      tagline: 'Monolithic travertine islands, fluted oak joinery, and concealed induction cooking surfaces.',
      category: 'Interior',
      coverUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1400&q=85',
      inspirationOverview: 'The contemporary kitchen transforms from a purely utilitarian workshop into an architectural sanctuary of quiet hospitality. Seamless concealed joinery hides appliances, while monolithic stone textures, fluted millwork, and warm diffused architectural cove lighting turn daily rituals into tactile art.',
      colorPalette: [
        { name: 'Travertine Crema', hex: '#DFD7CD', description: 'Honed porous natural stone' },
        { name: 'Smoked French Oak', hex: '#3E342B', description: 'Quarter-sawn dark cabinetry' },
        { name: 'Brushed Champagne', hex: '#D4B37F', description: 'Warm metallic fixtures' },
        { name: 'Chalk Plaster', hex: '#F6F4EF', description: 'Textured wall finish' },
        { name: 'Accent Amber', hex: '#FFD21F', description: 'Vistora warm lighting point' },
      ],
      architectureElements: [
        { title: 'Monolithic Waterfalls', description: 'Full-slab stone islands extending continuously from counter to floor.' },
        { title: 'Concealed Appliance Pockets', description: 'Flush pocket doors that tuck away coffee stations and preparation areas.' },
        { title: 'Architectural Cove LEDs', description: 'Indirect 2700K lighting washing stone splashbacks with zero glare.' },
        { title: 'Integrated Induction Glass', description: 'Under-counter invisible cooking zones directly beneath porcelain slabs.' }
      ],
      relatedSearches: ['Japandi Kitchen', 'Travertine Island', 'Fluted Wood Cabinets', 'Minimalist Pantry', 'Warm Stone Kitchen'],
      items: [CURATED_MEDIA[7], CURATED_MEDIA[6], CURATED_MEDIA[13]],
      savedCount: 4120,
    },
    'minimalist-workspace': {
      slug: 'minimalist-workspace',
      title: 'Minimalist Workspace',
      tagline: 'Tactile natural materials, concealed cable architecture, and ergonomic visual focus.',
      category: 'Technology',
      coverUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=1400&q=85',
      inspirationOverview: 'Designed for profound cognitive flow, the modern minimalist workspace strips away clutter to elevate purposeful tools. Solid walnut or oak desktops, precision anodized aluminum monitor arms, ambient bias backlighting, and subtle textural desk pads create an environment of calm focus.',
      colorPalette: [
        { name: 'Anodized Slate', hex: '#2A2D34', description: 'Precision metal finish' },
        { name: 'Natural White Oak', hex: '#D8C4AA', description: 'Solid timber surface' },
        { name: 'Muted Wool Gray', hex: '#7D828A', description: 'Felt desk mat texture' },
        { name: 'Studio White', hex: '#FAFAFA', description: 'Matte reflection wall' },
        { name: 'Focus Yellow', hex: '#FFD21F', description: 'Vistora productivity accent' },
      ],
      architectureElements: [
        { title: 'Under-Desk Tray Rails', description: 'Hidden conduit channels containing all power supplies and data cords.' },
        { title: 'Asymmetric Desk Lamp', description: 'Glare-free 45-degree beam angle illuminating only working papers.' },
        { title: 'Low-Profile Hardware', description: 'Monochrome mechanical peripherals and calibrated matte displays.' },
        { title: 'Tactile Ceramic Organizers', description: 'Cast stone trays for drafting instruments and physical notebooks.' }
      ],
      relatedSearches: ['Industrial Design Studio', 'Desk Setup Aesthetic', 'Home Office Inspo', 'Architectural Drafting Desk', 'Clean Desk Philosophy'],
      items: [CURATED_MEDIA[10], CURATED_MEDIA[11], CURATED_MEDIA[2]],
      savedCount: 3340,
    }
  };

  public searchHistory: { query: string; timestamp: number }[] = [
    { query: 'Modern Architecture', timestamp: Date.now() - 10000 },
    { query: 'Minimalist Workspace', timestamp: Date.now() - 30000 },
    { query: 'Scandinavian Interior', timestamp: Date.now() - 90000 },
    { query: 'Alpine Lake Landscape', timestamp: Date.now() - 150000 },
  ];

  public searchEventsCount = 1420;
}

export const store = new VistoraStore();
