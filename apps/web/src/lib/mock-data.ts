export const MOCK_USER = {
  id: "u1",
  name: "Alex Chen",
  username: "alexc",
  avatar: "https://github.com/shadcn.png",
  coverImage: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&q=80&w=1000",
  bio: "Full-stack developer passionate about building scalable web applications. Currently studying Computer Science at MIT.",
  university: "MIT",
  year: "Junior",
  location: "Boston, MA",
  joinedAt: "August 2024",
  stats: {
    followers: 1205,
    following: 342,
    views: 15400,
  },
  skills: ["React", "Next.js", "TypeScript", "Node.js", "Python", "PostgreSQL", "Docker", "AWS"],
  social: {
    github: "https://github.com",
    linkedin: "https://linkedin.com",
    portfolio: "https://alexc.dev"
  }
};

export const MOCK_POSTS = [
  {
    id: "p1",
    title: "Building an AI-Powered Drone System with Next.js and Python",
    excerpt: "In this comprehensive guide, we'll explore how to integrate real-time computer vision from a drone feed directly into a modern web dashboard using WebSocket streams.",
    slug: "ai-drone-system",
    author: MOCK_USER,
    tags: ["Next.js", "Python", "Computer Vision", "WebSockets"],
    category: "AI / Machine Learning",
    likes: 342,
    comments: 56,
    timeAgo: "2 hours ago",
    readTime: "8 min read",
    thumbnail: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&q=80&w=1200",
  },
  {
    id: "p2",
    title: "Why I switched from React to SolidJS for my startup",
    excerpt: "Performance matters. After struggling with unnecessary re-renders in our complex dashboard, we rewrote the core engine in SolidJS. Here are the benchmarks and lessons learned.",
    slug: "react-to-solidjs",
    author: {
      name: "Sarah Drasner",
      username: "sarahd",
      avatar: "https://i.pravatar.cc/150?u=sarah",
      role: "Frontend Lead @ Startup",
    },
    tags: ["React", "SolidJS", "Performance", "Frontend"],
    category: "Web Development",
    likes: 1024,
    comments: 128,
    timeAgo: "1 day ago",
    readTime: "5 min read",
    thumbnail: "https://images.unsplash.com/photo-1555099962-4199c345e5dd?auto=format&fit=crop&q=80&w=1200",
  },
  {
    id: "p3",
    title: "Understanding Zero-Knowledge Proofs (zk-SNARKs)",
    excerpt: "A beginner-friendly explanation of the math and cryptography behind zk-SNARKs, and how they are scaling Ethereum through Rollups.",
    slug: "zk-snarks-explained",
    author: {
      name: "Vitalik Fan",
      username: "cryptobro",
      avatar: "https://i.pravatar.cc/150?u=crypto",
      role: "Cryptography Researcher",
    },
    tags: ["Blockchain", "Cryptography", "Ethereum"],
    category: "Blockchain",
    likes: 512,
    comments: 42,
    timeAgo: "3 days ago",
    readTime: "12 min read",
    thumbnail: null,
  }
];

export const MOCK_PROJECTS = [
  {
    id: "proj1",
    title: "Nexus - Realtime Collab Engine",
    description: "A high-performance CRDT-based collaboration engine built with Rust and WebAssembly, integrated into a Next.js frontend.",
    image: "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?auto=format&fit=crop&q=80&w=800",
    techStack: ["Rust", "WASM", "Next.js", "Redis"],
    githubUrl: "#",
    liveUrl: "#",
    stars: 128,
  },
  {
    id: "proj2",
    title: "Campus Marketplace",
    description: "A secure P2P marketplace for college students to buy and sell textbooks and electronics. Features university email verification.",
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=800",
    techStack: ["React Native", "Supabase", "Stripe"],
    githubUrl: "#",
    liveUrl: "#",
    stars: 45,
  }
];

export const MOCK_ACHIEVEMENTS = [
  {
    id: "a1",
    title: "First Place - MIT Reality Hack",
    date: "Jan 2026",
    description: "Built an AR application for medical students to visualize human anatomy using Meta Quest 3.",
    icon: "Trophy",
  },
  {
    id: "a2",
    title: "AWS Certified Solutions Architect",
    date: "Nov 2025",
    description: "Passed the associate level certification exam with a score of 910/1000.",
    icon: "BadgeCheck",
  },
  {
    id: "a3",
    title: "10,000 Monthly Open Source Downloads",
    date: "Sep 2025",
    description: "My npm package 'react-fancy-slider' reached a milestone of 10k monthly downloads.",
    icon: "TrendingUp",
  }
];
