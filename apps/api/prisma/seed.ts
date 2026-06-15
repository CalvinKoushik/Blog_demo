import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding StudentHub Database...');

  // --- Users ---
  const hashedPassword = await bcrypt.hash('password123', 10);

  const u1 = await prisma.user.upsert({
    where: { email: 'alex@studenthub.dev' },
    update: {},
    create: {
      email: 'alex@studenthub.dev',
      passwordHash: hashedPassword,
      profile: {
        create: {
          firstName: 'Alex',
          lastName: 'Chen',
          nickname: 'alexc',
          bio: 'CS Junior @ TechU. Full-stack developer passionate about open source and community building.',
          avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
          collegeName: 'Tech University',
          year: 3,
          skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL'],
          githubUrl: 'https://github.com/alexchen',
          linkedinUrl: 'https://linkedin.com/in/alexchen',
        },
      },
    },
  });

  const u2 = await prisma.user.upsert({
    where: { email: 'sarah@studenthub.dev' },
    update: {},
    create: {
      email: 'sarah@studenthub.dev',
      passwordHash: hashedPassword,
      profile: {
        create: {
          firstName: 'Sarah',
          lastName: 'Jenkins',
          nickname: 'sarahj',
          bio: 'UI/UX Design student exploring the intersection of human psychology and interfaces.',
          avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
          collegeName: 'State Design Academy',
          year: 4,
          skills: ['Figma', 'Framer', 'CSS', 'User Research'],
          portfolioUrl: 'https://sarahj.design',
        },
      },
    },
  });

  const u3 = await prisma.user.upsert({
    where: { email: 'david@studenthub.dev' },
    update: {},
    create: {
      email: 'david@studenthub.dev',
      passwordHash: hashedPassword,
      profile: {
        create: {
          firstName: 'David',
          lastName: 'Kim',
          nickname: 'davidkim',
          bio: 'AI enthusiast building the future. Data Science senior.',
          avatarUrl: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=150',
          collegeName: 'Global Institute of Tech',
          year: 4,
          skills: ['Python', 'PyTorch', 'Machine Learning', 'Data Analysis'],
          githubUrl: 'https://github.com/davidkim',
        },
      },
    },
  });

  // --- Categories ---
  const cats = await Promise.all([
    prisma.category.upsert({ where: { slug: 'technology' }, update: {}, create: { name: 'Technology', slug: 'technology' } }),
    prisma.category.upsert({ where: { slug: 'design' }, update: {}, create: { name: 'Design', slug: 'design' } }),
    prisma.category.upsert({ where: { slug: 'career' }, update: {}, create: { name: 'Career', slug: 'career' } }),
  ]);

  // --- Posts ---
  const p1 = await prisma.post.upsert({
    where: { slug: 'building-a-student-community-with-nextjs' },
    update: {},
    create: {
      title: 'Building a Student Community with Next.js',
      slug: 'building-a-student-community-with-nextjs',
      content: 'Hello everyone! I wanted to share my latest project, a full-stack Next.js application designed to help students connect. I used App Router, Turborepo, and TailwindCSS. Here is a walkthrough of my architecture...',
      thumbnailUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=800',
      isPublished: true,
      type: 'PROJECT',
      categoryId: cats[0].id,
      techStack: ['Next.js', 'Tailwind', 'Turborepo'],
      authorId: u1.id,
    },
  });

  const p2 = await prisma.post.upsert({
    where: { slug: '10-ui-ux-tips-for-devs' },
    update: {},
    create: {
      title: '10 UI/UX Tips for Developers',
      slug: '10-ui-ux-tips-for-devs',
      content: 'As developers, we often overlook design fundamentals. In this post, I will break down 10 simple UI/UX tips that you can apply immediately to your side projects to make them look infinitely more professional...',
      thumbnailUrl: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&q=80&w=800',
      isPublished: true,
      type: 'BLOG',
      categoryId: cats[1].id,
      techStack: ['Figma', 'CSS'],
      authorId: u2.id,
    },
  });

  const p3 = await prisma.post.upsert({
    where: { slug: 'getting-started-with-pytorch-for-nlp' },
    update: {},
    create: {
      title: 'Getting Started with PyTorch for NLP',
      slug: 'getting-started-with-pytorch-for-nlp',
      content: 'Natural Language Processing is booming. If you want to get your hands dirty with deep learning models, PyTorch is a great place to start. Let us build a simple sentiment analysis model from scratch...',
      thumbnailUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=800',
      isPublished: true,
      type: 'TUTORIAL',
      categoryId: cats[0].id,
      techStack: ['Python', 'PyTorch'],
      authorId: u3.id,
    },
  });

  // --- Engagement (Likes / Comments) ---
  await prisma.like.upsert({
    where: { userId_postId: { userId: u2.id, postId: p1.id } },
    update: {},
    create: { userId: u2.id, postId: p1.id },
  });

  await prisma.like.upsert({
    where: { userId_postId: { userId: u3.id, postId: p1.id } },
    update: {},
    create: { userId: u3.id, postId: p1.id },
  });

  // For comments, check count
  const commentsCount = await prisma.comment.count({ where: { postId: p1.id } });
  if (commentsCount === 0) {
    await prisma.comment.create({
      data: {
        content: 'Great write up! I love the architecture you chose.',
        authorId: u2.id,
        postId: p1.id,
      },
    });

    await prisma.comment.create({
      data: {
        content: 'Thanks Sarah! Means a lot coming from a designer.',
        authorId: u1.id,
        postId: p1.id,
      },
    });
  }

  // --- Follows ---
  await prisma.follow.upsert({
    where: { followerId_followingId: { followerId: u2.id, followingId: u1.id } },
    update: {},
    create: { followerId: u2.id, followingId: u1.id },
  });

  await prisma.follow.upsert({
    where: { followerId_followingId: { followerId: u3.id, followingId: u1.id } },
    update: {},
    create: { followerId: u3.id, followingId: u1.id },
  });

  console.log('Seed completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
