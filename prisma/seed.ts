import bcrypt from "bcryptjs";
import { PrismaClient, type StoryCategory } from "@prisma/client";
import { estimateReadingMinutes, serializeBody, type Block } from "../src/lib/content";

const prisma = new PrismaClient();

const MARTINEZ_SLUG = "the-ai-arms-race-at-what-cost";
const NEDURI_SLUG = "ethical-tech-should-serve-people-not-power";
const DRAMEH_SLUG = "the-odds-on-polymarket-are-not-the-truth";
const KEEP_SLUGS = [MARTINEZ_SLUG, NEDURI_SLUG, DRAMEH_SLUG];
const POLL_SLUG = "2026-midterms";
const DISCUSSION_SLUG = "has-ai-negatively-impacted-your-learning-at-usc";

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

async function upsertStory(input: {
  slug: string;
  title: string;
  subtitle: string;
  dek: string;
  excerpt: string;
  seoDescription: string;
  visualTheme: string;
  category: StoryCategory;
  featured: boolean;
  leadStory: boolean;
  publishedAt: Date;
  authorId: string;
  tagIds: string[];
  body: Block[];
}) {
  const data = {
    title: input.title,
    subtitle: input.subtitle,
    dek: input.dek,
    excerpt: input.excerpt,
    body: serializeBody(input.body),
    visualTheme: input.visualTheme,
    category: input.category,
    status: "PUBLISHED" as const,
    featured: input.featured,
    leadStory: input.leadStory,
    readingMinutes: estimateReadingMinutes(input.body),
    publishedAt: input.publishedAt,
    seoDescription: input.seoDescription,
    authorId: input.authorId,
  };
  const existing = await prisma.story.findUnique({ where: { slug: input.slug } });
  const story = existing
    ? await prisma.story.update({ where: { slug: input.slug }, data })
    : await prisma.story.create({ data: { slug: input.slug, ...data } });
  await prisma.storyTag.deleteMany({ where: { storyId: story.id } });
  await prisma.storyTag.createMany({
    data: input.tagIds.map((tagId) => ({ storyId: story.id, tagId })),
  });
  return story;
}

const martinezBody: Block[] = [
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

const neduriBody: Block[] = [
  {
    type: "p",
    text: "When we talk about ethical technology, the focus usually falls on how companies should behave. The deeper question is who actually determines what “ethical” means in tech — businesses or the government. As technology continues to shape society, both claim to promote ethical innovation. Their motivations are very different. Businesses are driven by competition and profit. Governments are guided by regulation and public accountability. The tension between those forces shows how fragile the definition of ethical tech really is.",
  },
  {
    type: "p",
    text: "A recent Lawfare article examines what happens when the U.S. government takes equity stakes in private technology firms. The approach might give policymakers more influence over innovation. It also raises serious ethical and economic concerns. As the article explains, “the U.S. has typically avoided government ownership of private firms out of fear that it will reduce innovation and efficiency and encourage cronyism.” If the government begins investing directly in private companies, it could end up shaping not just the rules of the market — but the market itself.",
  },
  {
    type: "p",
    text: "The risk, as Lawfare notes, is favoritism and unfair competition: “Will the government favor firms in which it owns stakes over other competitors that might have better technology or processes? Will the government impose new political mandates on American state-owned enterprises? The Chinese model of state capitalism for sectors such as electric vehicles typically encourages multiple firms to fight for a competitive advantage to ensure that more innovative ones weed out weaker competitors. Will the U.S. do the same, or will it simply back well-connected firms in which it owns interests, regardless of how noncompetitive they would be in a free market?”",
  },
  {
    type: "p",
    text: "In simpler terms: is this a form of market manipulation? If companies begin tailoring their strategies to please government shareholders instead of customers, innovation becomes less about creativity and more about compliance. Government-backed firms might receive favorable treatment through subsidies or contracts, while smaller startups that can’t — or won’t — give equity to the government get pushed aside. Over time, that dynamic risks turning innovation into a system based on political proximity rather than technological merit.",
  },
  {
    type: "p",
    text: "The ethical tension is not limited to finance. It is visible in how technology shapes communities. The data-center boom in California shows how innovation can create new environmental and social challenges. Among existing and planned data centers in the state, the median pollution burden score is 7 out of 10. Nearly one-third of operational and planned California data centers sit in the top 10 percent of areas most polluted by diesel particulates. Those facilities power our digital world, often at the expense of communities already carrying the burden.",
  },
  {
    type: "stat",
    value: "7 / 10",
    label: "median pollution burden where California data centers are located",
  },
  {
    type: "p",
    text: "There are other models. Nova has described its EVHP facility as the greenest data center ever created in its area: hydrotreated vegetable oil as biofuel, sodium LFP batteries without rare-earth materials, and a waterless cooling system. The point is not that one company solves the problem. It is that ethical technology can balance progress with responsibility — if someone other than the market is allowed to set the terms.",
  },
  {
    type: "pullquote",
    text: "Ethical technology means ensuring innovation serves people, not power.",
  },
  {
    type: "p",
    text: "Defining ethical tech should not be left solely to corporations or governments. Ethical innovation should come from collaboration, where business, policy, and community interests align. At SHIFT, ethical technology means ensuring innovation serves people, not power. When progress is guided by fairness and sustainability, technology becomes not just smarter — but more humane.",
  },
  { type: "h2", text: "Sources" },
  {
    type: "ul",
    items: [
      "https://www.lawfaremedia.org/article/the-legal-bases-for-government-stakes-in-private-firms",
      "https://kaporfoundation.org/datacenters-envt-health/",
    ],
  },
];

const dramehBody: Block[] = [
  {
    type: "p",
    text: "While much of society might be exhausted and desensitized by the constant cycle of misinformation and media, the market isn’t. Prediction markets are often treated as tools that can predict the future and reveal public opinion through simple probabilities. Platforms like Polymarket present those probabilities as neutral signals of truth. Research shows they are shaped by platform design, capital concentration, and unequal participation rather than purely democratic information aggregation.",
  },
  {
    type: "p",
    text: "Existing coverage tends to ask whether prediction markets are gambling, or whether they successfully aggregate collective intelligence. Less attention is paid to how they shape perceptions of truth itself, especially in an already unstable information environment. The perception economy — where what people accept as real becomes a form of currency — is the missing piece. Prediction markets are inaccurate forecasting tools that detach themselves from the realities they claim to represent. That detachment is profitable. It fuels misinformation and the consequences that follow.",
  },
  { type: "h2", text: "Cognitive ease is the product" },
  {
    type: "p",
    text: "It is part of human nature to favor cognitive simplicity over factual complexity. That preference makes people susceptible to the clean numerical signals prediction markets provide. When information is difficult to process, people default to other cues: authority, confidence, or how clearly a claim is presented. That tendency is not inherently a flaw. It is how brains handle complexity. What has changed is how profitable it is to exploit those shortcuts.",
  },
  {
    type: "p",
    text: "In “Perception Economy: How the Currency of Collective Beliefs Redefines Organizational Value and Power,” Dina Kamel argues that perception has morphed from a byproduct of communication into a primary vehicle for power. “When perception operates as currency, competitive advantage pivots from controlling physical assets to orchestrating cognitive dominance — the ability to shape what stakeholders accept as real, valuable, or true.” Simplified, misrepresented versions of reality are easier to sell than muddled truths, and more profitable for the actors involved. Sometimes there is a direct incentive to alter the truth. Other times it is just easier. In an environment where algorithms prioritize clicks and virality over accuracy, the appearance of certainty is more valuable than certainty itself. That is the environment prediction markets enter.",
  },
  { type: "h2", text: "Prediction laundering" },
  {
    type: "p",
    text: "Prediction markets are platforms where users place bets on the outcome of world events: elections, basketball games, geopolitical conflicts, and more. The market price of each contract depends on the aggregate of all bets placed on it. Platforms like Polymarket present that aggregate price as a probability, as if it represented the collective judgment of a diverse range of informed participants.",
  },
  {
    type: "p",
    text: "Yasaman Rohanifar’s sociotechnical audit of Polymarket coined “prediction laundering”: the process by which individual, high-uncertainty bets and strategic hedges are scrubbed of their original noise and personal stakes through market aggregation. First comes structural filtering — which questions the market is even allowed to ask. Second is probabilistic flattening, which collapses bets placed for vastly different reasons into one price as if each expressed equal conviction. The context of why someone bet is erased. Third is architectural masking, where the myth of democratization breaks down. High-capital traders and insiders set the signal. Ordinary participants reinforce it. As one interviewee put it, “the whale moves the price and the crowds follow.”",
  },
  {
    type: "p",
    text: "The fourth stage is the most important. The laundered signal leaves the platform and enters public discourse, where it solidifies as truth. When policymakers or news organizations cite these percentages as objective forecasts, they grant “institutional legitimacy to a signal that was forged in a state of extreme capital asymmetry, effectively allowing private wealth to masquerade as collective intelligence.”",
  },
  {
    type: "stat",
    value: "$2B",
    label: "Intercontinental Exchange investment in Polymarket",
  },
  {
    type: "p",
    text: "In 2024, Goldman Sachs began citing Polymarket’s odds in client newsletters. Nasdaq petitioned the SEC to approve listing binary options tied to its index. The Intercontinental Exchange announced a $2 billion investment in the platform. Pollster Nate Silver joined Polymarket’s advisory board and praised its “increasingly vital role in helping people understand and plan for the future,” calling it a “real-time data source” on questions otherwise hard to quantify. By the time the number reaches the public, every layer of distortion has been removed from view. A signal produced through capital asymmetry, strategic betting, and platform gatekeeping arrives wearing the authority of financial markets and expert endorsement.",
  },
  {
    type: "pullquote",
    text: "A 72% probability does not mean 72% of informed analysts settled on an outcome. It means capital was filtered, flattened, and sold as truth.",
  },
  {
    type: "p",
    text: "When those figures are circulated as facts, they no longer merely represent interpretations of truth. They replace it. Jean Baudrillard called this hyperreality: representations of the real become more influential than the real itself. Finance researchers Samriddhi Dhasmana and Sandeep Goel apply that framework to equity markets, arguing that market prices “don’t have anything to do with the real value of their representative companies.” On Polymarket, the gap is not between book value and stock price. It is between truth and signal. A 72% probability that a candidate will win an election does not mean that 72% of informed analysts with years of experience have settled on that outcome. It is capital that has been filtered, flattened by aggregation, and concentrated into a single price. The outcomes are more reflective of the laundering process than of the questions they claim to answer.",
  },
  { type: "h2", text: "Betting on catastrophe" },
  {
    type: "p",
    text: "The hyperreal dynamics of prediction markets are not new. They have long existed in media and politics. What makes this engine of perception more concerning is the stake people now have in world events, and the desensitization of betting on once unthinkable matters. One Polymarket user told researchers: “There is a weird discomfort with betting on people dying in a war... but when you look at the chart, it just looks like any other stock market chart! The way all of the information is framed makes it feel like you are solving a puzzle rather than profiting from a disaster!” The platform performs moral laundering. The ethical weight of the decision is overshadowed by the neutrality of the market.",
  },
  {
    type: "p",
    text: "The financial stakes also create incentives to influence, manipulate, or misrepresent the events being bet on. In March 2025, a reporter covering the Israel-Iran conflict received death threats from Polymarket users who had placed over $14 million on a contract contingent on his reporting. When his account of events threatened their position, they pressured him to change it. The Guardian’s investigation further documents users attempting to contact think tanks and map-producing organizations to influence how frontline data in Ukraine was recorded. One trader tried to telephone the Institute for the Study of War to change a map that was affecting the resolution of a bet. The ISW called it “abhorrent.” The hyperreal probability has real consequences. It has become a target with enough financial weight that some participants will bend or threaten reality to make it resolve in their favor.",
  },
  {
    type: "p",
    text: "Prediction markets like Polymarket and Kalshi present themselves as tools of collective knowledge. That self-presentation is the problem. Their authority rests on the assumption that probabilities are produced by informed, democratic aggregation. Strategic betting, filtered contracts, insider money, hedging, and misinformation all play a role in the laundering process. The number on the screen was never true. It was a social construction meant to look like it, then granted legitimacy by media outlets with a stake in the perception economy. There may still be a place for prediction markets. There is not a place for a system that capitalizes on catastrophe, perception, and misinformation over truth.",
  },
  { type: "h2", text: "Sources" },
  {
    type: "ul",
    items: [
      "https://www.theguardian.com/business/2026/apr/11/polymarket-gamblers-betting-iran-war-ukraine-news-truth",
      "https://ssrn.com/abstract=5261467",
    ],
  },
];

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

  const anika = await upsertUser({
    email: "anika.neduri@shiftpolicy.org",
    name: "Anika Neduri",
    passwordValue: "ShiftEditor2026!",
    role: "EDITOR",
    title: "Staff Writer, Public Policy ’27",
    bio: "Writes about who gets to define ethical technology — and who pays when the market does.",
    avatarHue: 24,
  });

  const zeinab = await upsertUser({
    email: "zeinab.drameh@shiftpolicy.org",
    name: "Zeinab Drameh",
    passwordValue: "ShiftEditor2026!",
    role: "EDITOR",
    title: "Staff Writer, Public Policy ’27",
    bio: "Covers prediction markets, misinformation, and the perception economy.",
    avatarHue: 332,
  });

  const tagNames = ["AI", "Policy", "Big Tech", "Environment", "National", "Ethics", "Media"];
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

  await prisma.story.deleteMany({ where: { slug: { notIn: KEEP_SLUGS } } });

  await upsertStory({
    slug: MARTINEZ_SLUG,
    title: "The AI Arms Race: At What Cost",
    subtitle: "Bigger models, bigger data centers, bigger consequences",
    dek: "Meta’s newest models need gigawatt data centers. As the AI race scales, communities are asking whether they can afford the cost.",
    excerpt:
      "Meta is ready to compete in the AI big leagues. The infrastructure behind that race is expanding just as fast — and residents are pushing back.",
    seoDescription:
      "Isabella Martinez on Meta’s Muse Wonder models, gigawatt data centers, and the communities asked to host the AI arms race.",
    visualTheme: "data",
    category: "ANALYSIS",
    featured: true,
    leadStory: true,
    publishedAt: new Date("2026-10-26T12:00:00.000Z"),
    authorId: isabella.id,
    tagIds: [tags.AI, tags.Policy, tags["Big Tech"], tags.Environment, tags.National],
    body: martinezBody,
  });

  await upsertStory({
    slug: NEDURI_SLUG,
    title: "Ethical Tech Should Serve People, Not Power",
    subtitle: "Business, government, or the public — who actually gets to decide?",
    dek: "When Washington takes equity in private firms, the market still writes the rules. Anika Neduri argues that fairness, not capital, should define ethical tech.",
    excerpt:
      "Government equity stakes and data-center pollution show how fragile the word “ethical” really is — and why the market shouldn’t get the last word.",
    seoDescription:
      "Anika Neduri on government equity in tech firms, California data-center pollution, and why ethical technology should serve people, not power.",
    visualTheme: "scan",
    category: "OPINION",
    featured: true,
    leadStory: false,
    publishedAt: new Date("2025-10-15T12:00:00.000Z"),
    authorId: anika.id,
    tagIds: [tags.Ethics, tags.Policy, tags["Big Tech"], tags.Environment, tags.National],
    body: neduriBody,
  });

  await upsertStory({
    slug: DRAMEH_SLUG,
    title: "The Odds on Polymarket Are Not the Truth",
    subtitle: "Prediction markets launder money, noise, and misinformation into a number that looks like a forecast.",
    dek: "Polymarket sells probabilities as collective intelligence. Zeinab Drameh argues they are a perception economy — and the news keeps citing them as fact.",
    excerpt:
      "A 72% chance on Polymarket is not a forecast. It is capital, flattened and sold as truth, then repeated by institutions with money on the line.",
    seoDescription:
      "Zeinab Drameh on prediction markets, Polymarket, and how betting platforms turn misinformation into a number that looks like the future.",
    visualTheme: "grid",
    category: "ANALYSIS",
    featured: true,
    leadStory: false,
    publishedAt: new Date("2025-05-04T12:00:00.000Z"),
    authorId: zeinab.id,
    tagIds: [tags.Media, tags.Policy, tags["Big Tech"], tags.National, tags.Ethics],
    body: dramehBody,
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
