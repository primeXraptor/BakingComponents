export interface NavDropdownItem {
  label: string;
  href: string;
}

export interface NavLink {
  label: string;
  href: string;
  children?: NavDropdownItem[];
}

export interface PdfIssue {
  id: string;
  name: string;
  url: string;
}

export interface Production {
  pdfName?: string | null;
  pdfVersions?: PdfIssue[];
  pdfUrl?: string | null;
  slug: string;
  name: string;
  type: string;
  description: string;
  fullDescription?: string;
  imagePath: string | null;
  credits?: { role: string; name: string }[];
}

export interface SocialLink {
  platform: string;
  href: string;
  label: string;
}

export interface EventHighlight {
  title: string;
  description: string;
  stat?: string;
}

export interface Event {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  fullDescription?: string;
  highlights?: EventHighlight[];
  historyText?: string;
  since?: string;
  logoPath: string;
  darkLogoPath?: string;
  previewImg: string;
  themeImagePath?: string;
  date: string | null;
  venue?: string;
  collaborators?: string[];
  year?: number;
  isFeatured?: boolean;
  isPlaceholder: boolean;
  registrationStatus?: "open" | "closed";
  registrationUrl?: string;
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  featured_image: string | null;
  author: string;
  published_at: string;
  is_featured: boolean;
  created_at: string;
}

export interface RadioEpisode {
  id: string;
  title: string;
  description: string;
  youtubeUrl: string;
  thumbnailUrl: string | null;
  episodeNumber: number | null;
  publishedAt: string;
}

export interface CoverageContentItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  images: Array<{ url: string; alt: string; caption?: string }>;
  youtubeUrl?: string;
  youtubeTitle?: string;
}

export interface TeamMember {
  name: string;
  role: string;
  imagePath: string | null;
  year?: string;
}

export interface PastLeader {
  name: string;
  role: string;
  year: string;
  currentRole?: string;
}

export interface PastLeaderYear {
  year: string;
  president: string | null;
  secretary: string | null;
}

export interface Department {
  name: string;
  description: string;
  iconName: string;
}

export interface TimelineMilestone {
  year: string;
  title: string;
  description?: string;
  points?: string[];
}

export type GalleryCategory = "all" | "events" | "productions" | "behind-the-scenes" | "team";

export interface GalleryImage {
  albumSlug?: string;
  src: string;
  alt: string;
  caption: string;
  category: GalleryCategory;
  year?: string;
  aspectRatio: "portrait" | "landscape" | "square";
}
