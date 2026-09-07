export interface CatProfile {
  id: string;
  handle: string;
  name: string;
  avatar: string;
  bannerUrl?: string;
  bio: string;
  breed: string;
  age?: string;
  location: string;
  favoriteSpot: string;
  boxPreference: string;
  followersCount: number; // Humans serving
  followingCount: number; // Cats followed
  treatsReceived: number;
  isVerified?: boolean;
  socialLinked?: string; // e.g., 'Google' | 'Instagram' | 'TikTok' | 'X'
  badges: CatBadge[];
}

export interface CatBadge {
  id: string;
  title: string;
  description: string;
  icon: string; // Emoji or Lucide icon name
  unlockedAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  authorHandle: string;
  authorName: string;
  authorAvatar: string;
  text: string;
  timestamp: string;
  treatsCount: number;
  isLiked?: boolean;
}

export interface Post {
  id: string;
  authorId: string;
  authorHandle: string;
  authorName: string;
  authorAvatar: string;
  imageUrl: string;
  filterStyle?: string;
  caption: string;
  humanTranslation?: string;
  location: string;
  timestamp: string;
  treatsCount: number;
  commentsCount: number;
  comments: Comment[];
  isTreating?: boolean;
  isSaved?: boolean;
  tags: string[];
  category: 'Kittens' | 'Chonkers' | 'Cosplay' | 'Nap Champs' | 'Loafing' | 'Zoomies';
  sponsorBrand?: string; // Monetization sponsor tag
}

export interface Story {
  id: string;
  authorHandle: string;
  authorName: string;
  authorAvatar: string;
  mediaUrl: string;
  caption: string;
  timestamp: string;
  isSeen?: boolean;
}

export interface NotificationItem {
  id: string;
  actorHandle: string;
  actorName: string;
  actorAvatar: string;
  type: 'treat' | 'comment' | 'follow' | 'mention';
  text: string;
  postImage?: string;
  timestamp: string;
  isRead: boolean;
}

export interface CatAnalysisResult {
  judgementLevel: number; // 0 - 100
  loafFormRating: string; // e.g. "9.8 / 10 Flawless Tuck"
  innerMonologue: string;
  breedEstimate: string;
  moodTag: string;
  whiskersScore: string;
  funFact: string;
}

export interface AffiliateDeal {
  id: string;
  brandName: string;
  logo: string;
  title: string;
  description: string;
  discountCode: string;
  discountPercentage: string;
  affiliateUrl: string;
  category: 'Food & Treats' | 'Litter & Tech' | 'Toys & Boxes' | 'Grooming & Health';
  commissionRate: string; // e.g. "12% per sale"
  imageUrl: string;
  isFeatured?: boolean;
}
