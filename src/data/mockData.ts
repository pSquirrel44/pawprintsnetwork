import { CatProfile, Post, Story, NotificationItem } from '../types';

export const INITIAL_DOG_PROFILES: CatProfile[] = [
  {
    id: 'dog_1',
    handle: 'BusterTheGolden',
    name: 'Buster Barnaby',
    avatar: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=400&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?auto=format&fit=crop&w=1200&q=80',
    bio: 'Professional Good Boy 🦴 | Chief Tennis Ball Retriever 🎾 | Belly Rub Specialist | Always 100% happy.',
    breed: 'Golden Retriever',
    location: 'Sunny Dog Park, Central Lawn',
    favoriteSpot: 'The Muddy Lake',
    boxPreference: 'Big BarkBox Shipping Crate',
    followersCount: 52100,
    followingCount: 180,
    treatsReceived: 312000,
    isVerified: true,
    badges: [
      { id: 'db1', title: 'Ball Collector', description: 'Fetched over 2,500 tennis balls', icon: '🎾', unlockedAt: '2026-01-10' },
      { id: 'db2', title: 'Zoomie Legend', description: 'Circled the yard 100 times in 1 minute', icon: '⚡', unlockedAt: '2026-02-18' },
      { id: 'db3', title: 'Master Beggar', description: 'Puppy eyes unlocked infinite bacon', icon: '🥓', unlockedAt: '2026-04-20' }
    ]
  },
  {
    id: 'dog_2',
    handle: 'DaisyCorgiZoomies',
    name: 'Daisy the Loaf Corgi',
    avatar: 'https://images.unsplash.com/photo-1612536053382-3693240e4088?auto=format&fit=crop&w=400&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=1200&q=80',
    bio: 'Low rider, high velocity! 🦊 100% Sploot champion. Wiggle-butt level maxed out.',
    breed: 'Pembroke Welsh Corgi',
    location: 'Hardwood Floor Hallway',
    favoriteSpot: 'Under the Dining Table',
    boxPreference: 'Fluffy Orthopedic Donut Bed',
    followersCount: 44300,
    followingCount: 95,
    treatsReceived: 189000,
    isVerified: true,
    badges: [
      { id: 'db4', title: 'Sploot Master', description: 'Achieved 180° leg extension', icon: '🍗', unlockedAt: '2026-03-05' },
      { id: 'db5', title: 'Radar Ears', description: 'Heard cheese wrapper from 3 miles away', icon: '🧀', unlockedAt: '2026-05-12' }
    ]
  },
  {
    id: 'dog_3',
    handle: 'BarnabyDachshund',
    name: 'Sir Barnaby Sausage',
    avatar: 'https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?auto=format&fit=crop&w=400&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=1200&q=80',
    bio: 'Long boi with big opinions 🌭. I bark at wind, leaves, and doorbells that haven\'t even rung yet.',
    breed: 'Miniature Dachshund',
    location: 'Under Blanket Fort',
    favoriteSpot: 'Sunlit Patio Cushion',
    boxPreference: 'Towel Pile',
    followersCount: 31000,
    followingCount: 64,
    treatsReceived: 145000,
    isVerified: true,
    badges: [
      { id: 'db6', title: 'Blanket Digger', description: 'Burrowed through 8 layers of fleece', icon: '🛋️', unlockedAt: '2026-02-01' }
    ]
  }
];

export const INITIAL_DOG_POSTS: Post[] = [
  {
    id: 'dog_post_1',
    authorId: 'dog_1',
    authorHandle: 'BusterTheGolden',
    authorName: 'Buster Barnaby',
    authorAvatar: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=400&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=1000&q=80',
    filterStyle: 'warm-glow',
    caption: 'I found a stick today! It is 4 feet long and barely fit through the front door. Human says it\'s a liability, I say it\'s an architectural marvel! 🪵🐕',
    humanTranslation: 'Translation: "WOOF! I am now the official Master Timber Supplier of the household!"',
    location: 'Front Doorway',
    timestamp: '1 hour ago',
    treatsCount: 4520,
    commentsCount: 52,
    tags: ['#stickchampion', '#goldenretriever', '#goodboy', '#dogpark'],
    category: 'Zoomies',
    isTreating: true,
    isSaved: true,
    comments: [
      {
        id: 'dc1',
        postId: 'dog_post_1',
        authorHandle: 'DaisyCorgiZoomies',
        authorName: 'Daisy the Loaf Corgi',
        authorAvatar: 'https://images.unsplash.com/photo-1612536053382-3693240e4088?auto=format&fit=crop&w=400&q=80',
        text: 'Woof! That stick is bigger than my entire torso! 10/10 branch management!',
        timestamp: '30 mins ago',
        treatsCount: 112
      }
    ]
  },
  {
    id: 'dog_post_2',
    authorId: 'dog_2',
    authorHandle: 'DaisyCorgiZoomies',
    authorName: 'Daisy the Loaf Corgi',
    authorAvatar: 'https://images.unsplash.com/photo-1612536053382-3693240e4088?auto=format&fit=crop&w=400&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=1000&q=80',
    filterStyle: 'none',
    caption: 'Post-park sploot! Leggies fully extended. Battery level currently at 2%. Need emergency peanut butter reboot. 🥜🐾',
    humanTranslation: 'Translation: "My stubby legs gave 110% today. I am now a flat canine pancake."',
    location: 'Kitchen Tile',
    timestamp: '4 hours ago',
    treatsCount: 6890,
    commentsCount: 140,
    tags: ['#sploot', '#corgi', '#pancake', '#peanutbutter'],
    category: 'Nap Champs',
    isTreating: false,
    isSaved: false,
    comments: []
  },
  {
    id: 'dog_post_3',
    authorId: 'dog_3',
    authorHandle: 'BarnabyDachshund',
    authorName: 'Sir Barnaby Sausage',
    authorAvatar: 'https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?auto=format&fit=crop&w=400&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=1000&q=80',
    filterStyle: 'cyber-cool',
    caption: 'The mail carrier walked past the fence. I barked 47 times. They immediately surrendered the letters and fled. My domain remains defended. 🛡️🌭',
    humanTranslation: 'Translation: "My acoustic perimeter warning system successfully scared away another intruder."',
    location: 'Front Porch Lookout',
    timestamp: '1 day ago',
    treatsCount: 3410,
    commentsCount: 78,
    tags: ['#guarddog', '#sausagedog', '#barklife', '#mailmanwarrior'],
    category: 'Cosplay',
    isTreating: false,
    isSaved: false,
    comments: []
  }
];

export const INITIAL_DOG_STORIES: Story[] = [
  {
    id: 'ds1',
    authorHandle: 'BusterTheGolden',
    authorName: 'Buster Barnaby',
    authorAvatar: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=400&q=80',
    mediaUrl: 'https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?auto=format&fit=crop&w=800&q=80',
    caption: 'Squirrel detected in backyard Oak Tree! Standby for high-speed tracking... 🐿️💨',
    timestamp: '20m ago',
    isSeen: false
  },
  {
    id: 'ds2',
    authorHandle: 'DaisyCorgiZoomies',
    authorName: 'Daisy the Loaf Corgi',
    authorAvatar: 'https://images.unsplash.com/photo-1612536053382-3693240e4088?auto=format&fit=crop&w=400&q=80',
    mediaUrl: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=800&q=80',
    caption: 'Did somebody say W-A-L-K?! The leash sound activated my happy dances! 🦮✨',
    timestamp: '1h ago',
    isSeen: false
  }
];

export const INITIAL_DOG_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'dn1',
    actorHandle: 'DaisyCorgiZoomies',
    actorName: 'Daisy the Loaf Corgi',
    actorAvatar: 'https://images.unsplash.com/photo-1612536053382-3693240e4088?auto=format&fit=crop&w=400&q=80',
    type: 'treat',
    text: 'sent 🍖 bone treats to your giant stick post!',
    postImage: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=400&q=80',
    timestamp: '15m ago',
    isRead: false
  }
];

export const INITIAL_PROFILES: CatProfile[] = [
  {
    id: 'cat_1',
    handle: 'LordWhiskers',
    name: 'Sir Whiskers III',
    avatar: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=400&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1548802673-380ab8ebc7b7?auto=format&fit=crop&w=1200&q=80',
    bio: 'Professional Sunbeam Snatcher ☀️ | Master of 3AM Corridor Zoomies 🏎️ | I tolerate my human, Kevin.',
    breed: 'British Shorthair',
    location: 'The Velvet Couch, Living Room',
    favoriteSpot: 'Top of the Bookshelf',
    boxPreference: 'Medium Chewy Box (Strictly intact)',
    followersCount: 14200,
    followingCount: 38,
    treatsReceived: 89300,
    isVerified: true,
    badges: [
      { id: 'b1', title: 'Box Master', description: 'Occupied 500+ cardboard boxes', icon: '📦', unlockedAt: '2026-01-15' },
      { id: 'b2', title: 'Sunbeam Champion', description: 'Napped in 1,000 sunbeams', icon: '☀️', unlockedAt: '2026-03-02' },
      { id: 'b3', title: '3AM Racer', description: 'Clocked 40 MPH at 3:15 AM', icon: '⚡', unlockedAt: '2026-05-10' }
    ]
  },
  {
    id: 'cat_2',
    handle: 'LunaTheVoid',
    name: 'Luna',
    avatar: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=400&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=1200&q=80',
    bio: '100% pure void with yellow eyes 🖤. When you stare into the void, the void meows for wet food.',
    breed: 'Bombay',
    location: 'Shadow Realm (Under the Bed)',
    favoriteSpot: 'Dark Closet Shelf',
    boxPreference: 'Shoebox with tissue paper',
    followersCount: 28900,
    followingCount: 42,
    treatsReceived: 142000,
    isVerified: true,
    badges: [
      { id: 'b4', title: 'Master of Stealth', description: 'Invisibility level 99', icon: '🥷', unlockedAt: '2026-02-14' },
      { id: 'b5', title: 'Night Vision', description: 'Glowed in the dark flawlessly', icon: '✨', unlockedAt: '2026-04-01' }
    ]
  },
  {
    id: 'cat_3',
    handle: 'ChonkyMilo',
    name: 'Milo the Bread Loaf',
    avatar: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&w=400&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1495360010541-f48722b34f7d?auto=format&fit=crop&w=1200&q=80',
    bio: 'Certifiable 10/10 Bread Loaf 🍞. My belly is not a trap (usually). Treat donations welcomed.',
    breed: 'Orange Tabby',
    location: 'Kitchen Island',
    favoriteSpot: 'Heated Blanket',
    boxPreference: 'Any box that expands to my curves',
    followersCount: 38400,
    followingCount: 105,
    treatsReceived: 210500,
    isVerified: true,
    badges: [
      { id: 'b6', title: 'Supreme Loaf', description: 'Perfect 10/10 tail & paw tuck', icon: '🍞', unlockedAt: '2026-01-20' },
      { id: 'b7', title: 'Treat Tester', description: 'Consumed 10,000 Churu sticks', icon: '🐟', unlockedAt: '2026-06-18' }
    ]
  },
  {
    id: 'cat_4',
    handle: 'PrincessCleo',
    name: 'Cleopatra',
    avatar: 'https://images.unsplash.com/photo-1561948955-570b270e7c36?auto=format&fit=crop&w=400&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1511044568932-338cba0ad803?auto=format&fit=crop&w=1200&q=80',
    bio: 'Siam Royalty 👑. I scream at doors until opened, then refuse to enter.',
    breed: 'Siamese',
    location: 'Silk Pillow Bed',
    favoriteSpot: 'Human\'s Lap (When busy typing)',
    boxPreference: 'Velvet Lined Custom Box',
    followersCount: 19500,
    followingCount: 12,
    treatsReceived: 98100,
    isVerified: true,
    badges: [
      { id: 'b8', title: 'Scream Queen', description: 'Vocalized at 85 decibels for food', icon: '📢', unlockedAt: '2026-03-30' }
    ]
  }
];

export const INITIAL_POSTS: Post[] = [
  {
    id: 'post_1',
    authorId: 'cat_1',
    authorHandle: 'LordWhiskers',
    authorName: 'Sir Whiskers III',
    authorAvatar: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=400&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=1000&q=80',
    filterStyle: 'none',
    caption: 'I have successfully claimed the warm spot on top of the Wi-Fi router. Human keeps asking why the internet is down. Not my problem. 😼',
    humanTranslation: 'Translation: "This black box generates optimal belly heat. The human keeps pressing buttons, but I am the true network administrator."',
    location: 'Wi-Fi Router Shelf',
    timestamp: '2 hours ago',
    treatsCount: 1248,
    commentsCount: 34,
    tags: ['#wifiwarrior', '#catlogic', '#warmth', '#sunbeam'],
    category: 'Nap Champs',
    isTreating: false,
    isSaved: false,
    comments: [
      {
        id: 'c1',
        postId: 'post_1',
        authorHandle: 'ChonkyMilo',
        authorName: 'Milo the Bread Loaf',
        authorAvatar: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&w=400&q=80',
        text: 'Meow! The router is good, but have you tried sitting directly on the laptop keyboard while they type?',
        timestamp: '1 hour ago',
        treatsCount: 89
      },
      {
        id: 'c2',
        postId: 'post_1',
        authorHandle: 'LunaTheVoid',
        authorName: 'Luna',
        authorAvatar: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=400&q=80',
        text: '10/10 dominance move. Sending fish treats! 🐟',
        timestamp: '45 mins ago',
        treatsCount: 42
      }
    ]
  },
  {
    id: 'post_2',
    authorId: 'cat_3',
    authorHandle: 'ChonkyMilo',
    authorName: 'Milo the Bread Loaf',
    authorAvatar: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&w=400&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&w=1000&q=80',
    filterStyle: 'warm-glow',
    caption: 'Rate my loaf form 🍞. Paws fully retracted, tail concealed, aerodynamics 100%. Ready for takeoff.',
    humanTranslation: 'Translation: "I have transformed into a seamless bakery product. No limbs exist. I am pure carb."',
    location: 'Kitchen Countertop',
    timestamp: '5 hours ago',
    treatsCount: 3890,
    commentsCount: 112,
    tags: ['#catloaf', '#breadmode', '#chonk', '#orangebraincell'],
    category: 'Loafing',
    isTreating: true,
    isSaved: true,
    comments: [
      {
        id: 'c3',
        postId: 'post_2',
        authorHandle: 'PrincessCleo',
        authorName: 'Cleopatra',
        authorAvatar: 'https://images.unsplash.com/photo-1561948955-570b270e7c36?auto=format&fit=crop&w=400&q=80',
        text: 'Impeccable symmetry, darling. 💅',
        timestamp: '3 hours ago',
        treatsCount: 61
      }
    ]
  },
  {
    id: 'post_3',
    authorId: 'cat_2',
    authorHandle: 'LunaTheVoid',
    authorName: 'Luna',
    authorAvatar: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=400&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=1000&q=80',
    filterStyle: 'cyber-cool',
    caption: 'If I fit, I sit. Even if the box is 2 inches too small. Physics is merely a suggestion for void cats. 📦⬛',
    humanTranslation: 'Translation: "My density allows me to compress spatial dimensions inside cardboard."',
    location: 'Living Room Rug',
    timestamp: '1 day ago',
    treatsCount: 5120,
    commentsCount: 88,
    tags: ['#ifitfitsisits', '#voidcat', '#boxlife', '#blackcat'],
    category: 'Chonkers',
    isTreating: false,
    isSaved: false,
    comments: [
      {
        id: 'c4',
        postId: 'post_3',
        authorHandle: 'LordWhiskers',
        authorName: 'Sir Whiskers III',
        authorAvatar: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=400&q=80',
        text: 'A true masterwork of box occupation.',
        timestamp: '12 hours ago',
        treatsCount: 30
      }
    ]
  },
  {
    id: 'post_4',
    authorId: 'cat_4',
    authorHandle: 'PrincessCleo',
    authorName: 'Cleopatra',
    authorAvatar: 'https://images.unsplash.com/photo-1561948955-570b270e7c36?auto=format&fit=crop&w=400&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1513245543132-31f507417b26?auto=format&fit=crop&w=1000&q=80',
    filterStyle: 'sepia-purr',
    caption: 'My human bought me a $200 orthopedic cat tree. Naturally, I chose to sleep in the paper packaging bag it arrived in. 🛍️👑',
    humanTranslation: 'Translation: "Expensive furniture pales in comparison to the crinkly resonance of brown paper."',
    location: 'Paper Grocery Bag',
    timestamp: '2 days ago',
    treatsCount: 6780,
    commentsCount: 140,
    tags: ['#catlife', '#paperbag', '#spoiled', '#siamesecat'],
    category: 'Cosplay',
    isTreating: false,
    isSaved: false,
    comments: []
  },
  {
    id: 'post_5',
    authorId: 'cat_1',
    authorHandle: 'LordWhiskers',
    authorName: 'Sir Whiskers III',
    authorAvatar: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=400&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1548802673-380ab8ebc7b7?auto=format&fit=crop&w=1000&q=80',
    filterStyle: 'vintage-whiskers',
    caption: '3:00 AM Zoomie Championship Finals. The hallway carpet did not know what hit it. Track record broken! 🏎️💨',
    humanTranslation: 'Translation: "I galloped across the wood floor at Mach 2 to ensure the ghouls knew who rules this house."',
    location: 'The Great Hallway',
    timestamp: '3 days ago',
    treatsCount: 4210,
    commentsCount: 95,
    tags: ['#3amzoomies', '#speeddemon', '#nightowl', '#whiskers'],
    category: 'Zoomies',
    isTreating: true,
    isSaved: false,
    comments: []
  }
];

export const INITIAL_STORIES: Story[] = [
  {
    id: 's1',
    authorHandle: 'LordWhiskers',
    authorName: 'Sir Whiskers III',
    authorAvatar: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=400&q=80',
    mediaUrl: 'https://images.unsplash.com/photo-1543852786-1cf6624b9987?auto=format&fit=crop&w=800&q=80',
    caption: 'Live from the sunbeam! Currently absorbing 98% solar thermal power. ☀️',
    timestamp: '15m ago',
    isSeen: false
  },
  {
    id: 's2',
    authorHandle: 'LunaTheVoid',
    authorName: 'Luna',
    authorAvatar: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=400&q=80',
    mediaUrl: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=800&q=80',
    caption: 'A moth entered my airspace. Battle stations activated. 🦋😼',
    timestamp: '1h ago',
    isSeen: false
  },
  {
    id: 's3',
    authorHandle: 'ChonkyMilo',
    authorName: 'Milo the Bread Loaf',
    authorAvatar: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&w=400&q=80',
    mediaUrl: 'https://images.unsplash.com/photo-1513245543132-31f507417b26?auto=format&fit=crop&w=800&q=80',
    caption: 'The food bowl is 50% empty. This is officially a medical emergency.',
    timestamp: '3h ago',
    isSeen: false
  },
  {
    id: 's4',
    authorHandle: 'PrincessCleo',
    authorName: 'Cleopatra',
    authorAvatar: 'https://images.unsplash.com/photo-1561948955-570b270e7c36?auto=format&fit=crop&w=400&q=80',
    mediaUrl: 'https://images.unsplash.com/photo-1511044568932-338cba0ad803?auto=format&fit=crop&w=800&q=80',
    caption: 'Knocked a glass off the table. Gravity remains consistent. You are welcome, scientists.',
    timestamp: '5h ago',
    isSeen: true
  }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n1',
    actorHandle: 'LunaTheVoid',
    actorName: 'Luna',
    actorAvatar: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=400&q=80',
    type: 'treat',
    text: 'sent 🐟 treats to your Wi-Fi router post!',
    postImage: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=400&q=80',
    timestamp: '10m ago',
    isRead: false
  },
  {
    id: 'n2',
    actorHandle: 'ChonkyMilo',
    actorName: 'Milo the Bread Loaf',
    actorAvatar: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&w=400&q=80',
    type: 'comment',
    text: 'commented: "Meow! The router is good, but have you tried..."',
    postImage: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=400&q=80',
    timestamp: '1h ago',
    isRead: false
  },
  {
    id: 'n3',
    actorHandle: 'PrincessCleo',
    actorName: 'Cleopatra',
    actorAvatar: 'https://images.unsplash.com/photo-1561948955-570b270e7c36?auto=format&fit=crop&w=400&q=80',
    type: 'follow',
    text: 'started serving your profile as a dedicated human servant.',
    timestamp: '3h ago',
    isRead: true
  }
];
