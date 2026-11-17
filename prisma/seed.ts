import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { estimateReadingMinutes, serializeBody, type Block } from "../src/lib/content";

const prisma = new PrismaClient();

const STORY_SLUG = "the-ai-arms-race-at-what-cost";
const POLL_SLUG = "2026-midterms";
const DISCUSSION_SLUG = "has-ai-negatively-impacted-your-learning-at-usc";
const PUBLISHED_AT = new Date("2026-10-26T12:00:00.000Z");

function password(value: string) {
  return bcrypt.hashSync(value, 10);
}

async function upsertUser(input: {
  email: string;
  name: string;
  passwordValue: string;
  role: "ADMIN" | "EDITOR";
  title: string;
  bio: string;
  avatarHue: number;
}) {
  return prisma.user.upsert({
    where: { email: input.email },
    update: {
      name: input.name,
      role: input.role,
      title: input.title,
      bio: input.bio,
      avatarHue: input.avatarHue,
    },
    create: {
      email: input.email,
      name: input.name,
      passwordHash: password(input.passwordValue),
      role: input.role,
      title: input.title,
      bio: input.bio,
      avatarHue: input.avatarHue,
    },
  });
}

async function main() {
  const julia = await upsertUser({
    email: "julia.chen@shiftpolicy.org",
    name: "Julia Chen",
    passwordValue: "ShiftAdmin2026!",
    role: "ADMIN",
    title: "Editor-in-Chief, Public Policy ’27",
    bio: "Covers university AI governance and the gap between campus policy and student power.",
    avatarHue: 268,
  });

  await upsertUser({
    email: "marcus.owens@shiftpolicy.org",
    name: "Marcus Owens",
    passwordValue: "ShiftEditor2026!",
    role: "EDITOR",
    title: "Staff Writer, CS + Philosophy ’26",
    bio: "Writes about surveillance, platform power, and the ethics of automated decision-making.",
    avatarHue: 142,
  });

  await upsertUser({
    email: "aisha.rahman@shiftpolicy.org",
    name: "Aisha Rahman",
    passwordValue: "ShiftEditor2026!",
    role: "EDITOR",
    title: "Opinion Editor, International Relations ’27",
    bio: "Interested in how national AI policy lands on campus — and who gets left out of the conversation.",
    avatarHue: 312,
  });

  const isabella = await upsertUser({
    email: "isabella.martinez@shiftpolicy.org",
    name: "Isabella Martinez",
    passwordValue: "ShiftEditor2026!",
    role: "EDITOR",
    title: "Staff Writer, Public Policy ’28",
    bio: "Reports on the infrastructure behind the AI race and the communities asked to host it.",
    avatarHue: 198,
  });

  const tagNames = ["AI", "Policy", "Big Tech", "Environment", "National"];
  const tags = Object.fromEntries(
    await Promise.all(
      tagNames.map(async (name) => {
        const tag = await prisma.tag.upsert({
          where: { slug: name.toLowerCase().replace(/\s+/g, "-") },
          update: { name },
          create: { name, slug: name.toLowerCase().replace(/\s+/g, "-") },
        });
        return [name, tag.id] as const;
      }),
    ),
  );

  const body: Block[] = [
    {
      type: "p",
      text: "This week Meta announced its two new AI models, Muse Wonder and Muse Wonder Full, that it has been developing under Alexandr Wang, founder of Scale AI. Having similar reasoning, writing, and coding skills to Anthropic’s best model, Meta is ready to compete in the AI big leagues. But with another artificial intelligence platform in the market, an important question arises: Do we really need more AI?",
    },
    {
      type: "p",
      text: "While the race to develop the best AI models continues, the infrastructure required to support these models is expanding just as rapidly. To train Meta’s newest AI models, mega data center Prometheus in New Albany, Ohio was used. Prometheus, the world’s first gigawatt-capable data center, has higher capacity than any other data center. To follow Meta’s lead, other companies like OpenAI and Google have begun planning similar gigawatt-capable data centers. Furthermore, Meta CEO Mark Zuckerberg has pledged to invest billions in AI mega data centers with construction already started in Louisiana on data center Hyperion, forecasted to be as large as Manhattan.",
    },
    {
      type: "p",
      text: "Although New Albany claimed they “value Meta as a partner,” the new data center could power about 876,000 households for a year. Thus, how do residents feel about this new addition to their community?",
    },
    {
      type: "p",
      text: "As the race for AI dominance continues, tech companies seem more focused on building bigger and better models than considering the communities affected by their expansion.",
    },
    {
      type: "stat",
      value: "60%",
      label: "of Americans would feel uncomfortable with a new data center operating in their area",
    },
    {
      type: "p",
      text: "As data centers expand across the United States, public resistance is becoming increasingly common. According to a September 2026 Pew Research Center survey, 60% of Americans would feel uncomfortable with a new data center operating in their area. Environmental concerns are particularly prominent, with 54% believing data centers have a mostly negative environmental impact and 50% believing they negatively affect household energy costs. Thus, although data centers help strengthen the power of artificial intelligence, many Americans are concerned about the consequences of bringing these facilities into their communities.",
    },
    {
      type: "pullquote",
      text: "Perhaps the question is no longer whether we can develop more powerful AI, but whether we should.",
    },
    {
      type: "p",
      text: "While artificial intelligence has undoubtedly transformed the way we work, learn, and communicate, its advancement comes with environmental and economic costs. With residents increasingly concerned about the impact of data centers, perhaps the question is no longer whether we can develop more powerful AI, but whether we should. Before asking how much further AI can advance, perhaps we should ask how much more our communities can afford.",
    },
    { type: "h2", text: "Sources" },
    {
      type: "ul",
      items: [
        "https://www.pewresearch.org/short-reads/2026/09/22/americans-views-of-data-centers-have-turned-more-negative/",
        "https://www.nbc4i.com/news/local-news/new-albany/meet-prometheus-worlds-highest-capacity-data-center-slated-to-open-in-ohio-in-2026/",
        "https://www.nytimes.com/2026/10/12/technology/meta-muse-wonder-full-models.html",
      ],
    },
  ];

  await prisma.story.deleteMany({ where: { slug: { not: STORY_SLUG } } });

  const storyData = {
    title: "The AI Arms Race: At What Cost",
    subtitle: "Bigger models, bigger data centers, bigger consequences",
    dek: "Meta’s newest models need gigawatt data centers. As the AI race scales, communities are asking whether they can afford the cost.",
    excerpt:
      "Meta is ready to compete in the AI big leagues. The infrastructure behind that race is expanding just as fast — and residents are pushing back.",
    body: serializeBody(body),
    visualTheme: "data",
    category: "ANALYSIS" as const,
    status: "PUBLISHED" as const,
    featured: true,
    leadStory: true,
    readingMinutes: estimateReadingMinutes(body),
    publishedAt: PUBLISHED_AT,
    seoDescription:
      "Isabella Martinez on Meta’s Muse Wonder models, gigawatt data centers, and the communities asked to host the AI arms race.",
    authorId: isabella.id,
  };

  const existingStory = await prisma.story.findUnique({ where: { slug: STORY_SLUG } });
  const story = existingStory
    ? await prisma.story.update({ where: { slug: STORY_SLUG }, data: storyData })
    : await prisma.story.create({ data: { slug: STORY_SLUG, ...storyData } });

  await prisma.storyTag.deleteMany({ where: { storyId: story.id } });
  await prisma.storyTag.createMany({
    data: tagNames.map((name) => ({ storyId: story.id, tagId: tags[name] })),
  });

  await prisma.opportunity.deleteMany();

  await prisma.discussion.upsert({
    where: { slug: DISCUSSION_SLUG },
    update: {},
    create: {
      slug: DISCUSSION_SLUG,
      title: "Has AI negatively impacted your learning at USC?",
      prompt: "Has AI negatively impacted your learning at USC?",
      topic: "CAMPUS",
      featured: true,
      tags: JSON.stringify(["AI", "USC", "Education"]),
      creatorId: julia.id,
    },
  });

  const pollQuestion = "Did you vote in the 2026 midterms?";
  const pollOptions = ["Yes", "No", "I was not eligible"];
  const existingPoll = await prisma.poll.findUnique({
    where: { slug: POLL_SLUG },
    include: { options: { orderBy: { sort: "asc" } } },
  });
  if (!existingPoll) {
    await prisma.poll.create({
      data: {
        slug: POLL_SLUG,
        question: pollQuestion,
        options: {
          create: pollOptions.map((label, sort) => ({ label, sort })),
        },
      },
    });
  } else {
    await prisma.poll.update({
      where: { id: existingPoll.id },
      data: { question: pollQuestion },
    });
    if (existingPoll.options.length === 0) {
      await prisma.pollOption.createMany({
        data: pollOptions.map((label, sort) => ({ pollId: existingPoll.id, label, sort })),
      });
    }
  }

  console.log("Seeded SHIFT Public Policy.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
