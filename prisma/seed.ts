import bcrypt from "bcryptjs";
import { PrismaClient, type Prisma } from "@prisma/client";
import { serializeBody, type Block } from "../src/lib/content";

const prisma = new PrismaClient();

function daysAgo(days: number) {
  const date = new Date("2026-08-13T12:00:00.000Z");
  date.setDate(date.getDate() - days);
  return date;
}

function daysFromNow(days: number) {
  const date = new Date("2026-08-13T12:00:00.000Z");
  date.setDate(date.getDate() + days);
  return date;
}

async function main() {
  await prisma.report.deleteMany();
  await prisma.reaction.deleteMany();
  await prisma.commentReply.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.debateArgument.deleteMany();
  await prisma.discussionPost.deleteMany();
  await prisma.discussionVote.deleteMany();
  await prisma.discussion.deleteMany();
  await prisma.savedStory.deleteMany();
  await prisma.storyTag.deleteMany();
  await prisma.story.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.ideaSubmission.deleteMany();
  await prisma.articleSubmission.deleteMany();
  await prisma.opportunity.deleteMany();
  await prisma.user.deleteMany();

  const password = (value: string) => bcrypt.hashSync(value, 10);

  const julia = await prisma.user.create({
    data: {
      email: "julia.chen@shiftpolicy.org",
      name: "Julia Chen",
      passwordHash: password("ShiftAdmin2026!"),
      role: "ADMIN",
      title: "Editor-in-Chief, Public Policy ’27",
      bio: "Covers university AI governance and the gap between campus policy and student power.",
      avatarHue: 268,
    },
  });

  const marcus = await prisma.user.create({
    data: {
      email: "marcus.owens@shiftpolicy.org",
      name: "Marcus Owens",
      passwordHash: password("ShiftEditor2026!"),
      role: "EDITOR",
      title: "Staff Writer, CS + Philosophy ’26",
      bio: "Writes about surveillance, platform power, and the ethics of automated decision-making.",
      avatarHue: 142,
    },
  });

  const aisha = await prisma.user.create({
    data: {
      email: "aisha.rahman@shiftpolicy.org",
      name: "Aisha Rahman",
      passwordHash: password("ShiftEditor2026!"),
      role: "EDITOR",
      title: "Opinion Editor, International Relations ’27",
      bio: "Interested in how national AI policy lands on campus — and who gets left out of the conversation.",
      avatarHue: 312,
    },
  });

  const tagNames = ["AI", "USC", "Policy", "Ethics", "Privacy", "Education", "Digital Rights", "Opinion"];
  const tags = Object.fromEntries(
    await Promise.all(
      tagNames.map(async (name) => {
        const tag = await prisma.tag.create({
          data: { name, slug: name.toLowerCase().replace(/\s+/g, "-") },
        });
        return [name, tag.id] as const;
      }),
    ),
  );

  async function createStory(input: {
    slug: string;
    title: string;
    subtitle?: string;
    dek: string;
    excerpt: string;
    body: Block[];
    visualTheme: string;
    category: Prisma.StoryCreateInput["category"];
    authorId: string;
    tagNames: string[];
    publishedDaysAgo: number;
    featured?: boolean;
    leadStory?: boolean;
    seoDescription: string;
  }) {
    return prisma.story.create({
      data: {
        slug: input.slug,
        title: input.title,
        subtitle: input.subtitle,
        dek: input.dek,
        excerpt: input.excerpt,
        body: serializeBody(input.body),
        visualTheme: input.visualTheme,
        category: input.category,
        status: "PUBLISHED",
        featured: input.featured ?? false,
        leadStory: input.leadStory ?? false,
        readingMinutes: Math.max(1, Math.round(JSON.stringify(input.body).split(/\s+/).length / 40)),
        publishedAt: daysAgo(input.publishedDaysAgo),
        seoDescription: input.seoDescription,
        authorId: input.authorId,
        tags: {
          create: input.tagNames.map((name) => ({ tagId: tags[name] })),
        },
      },
    });
  }

  await createStory({
    slug: "usc-students-need-a-seat-at-the-ai-policy-table",
    title: "USC Students Need a Seat at the AI Policy Table",
    subtitle: "The people most affected by campus AI rules are rarely in the room when those rules are written.",
    dek: "As universities race to integrate artificial intelligence, students are increasingly affected by decisions they rarely get to participate in.",
    excerpt:
      "Universities are rapidly developing policies around artificial intelligence. Students are often the people most affected—and the least represented.",
    visualTheme: "aurora",
    category: "CAMPUS",
    authorId: julia.id,
    tagNames: ["AI", "USC", "Policy", "Education"],
    publishedDaysAgo: 1,
    featured: true,
    leadStory: true,
    seoDescription:
      "USC is writing AI policy that will shape student life. SHIFT argues students need a formal seat at the table.",
    body: [
      {
        type: "p",
        text: "Sometime this semester, a committee most students cannot name will likely make a decision that will follow them into every classroom, advising meeting, and research lab on campus. It will concern artificial intelligence: what tools are permitted, what data can be collected, which vendors USC will trust, and how academic integrity will be redefined in an era of generative models.",
      },
      {
        type: "p",
        text: "The people writing those rules are doing difficult work. Faculty are trying to protect the integrity of learning. Administrators are trying to manage legal risk. Researchers are trying to keep USC competitive. None of that is trivial. But there is a missing constituency in almost every version of this process: students.",
      },
      {
        type: "pullquote",
        text: "Students are not a stakeholder group to be surveyed after the fact. They are the public these policies govern.",
      },
      { type: "h2", text: "Policy is already happening without us" },
      {
        type: "p",
        text: "USC, like peer universities, is not waiting for a national consensus on AI. Syllabi now include disclosure clauses. Some departments have quietly adopted detection tools. Procurement conversations about campus-wide copilots are underway. Safety offices are evaluating new camera analytics. Each of these choices is a policy choice, even when it is framed as a software update.",
      },
      {
        type: "stat",
        value: "0",
        label: "standing student seats on USC’s known AI governance working groups",
      },
      {
        type: "p",
        text: "When SHIFT asked students across Viterbi, Dornsife, Marshall, and Annenberg whether they knew who sets campus AI rules, the most common answer was a pause. Then a guess. Then a shrug. That is not apathy. It is a design failure. Institutions have built AI policy as an internal operations problem rather than a public question.",
      },
      { type: "h2", text: "What a seat actually means" },
      {
        type: "p",
        text: "A seat at the table is not a listening session. It is not a survey dropped in a newsletter. It is not a student representative invited to the last twenty minutes of a meeting that has already reached its conclusion.",
      },
      {
        type: "ul",
        items: [
          "Formal student membership on any committee writing AI, data, or academic integrity policy.",
          "Public agendas and summaries for technology decisions that affect coursework, privacy, or campus safety.",
          "Time to respond before tools are procured or detection systems are deployed at scale.",
          "Clear channels for contesting automated decisions that affect grades, access, or discipline.",
        ],
      },
      {
        type: "p",
        text: "Other universities have begun experimenting with student AI councils, open comment periods, and shared governance models. USC does not need to copy them wholesale. It does need to stop treating student experience as anecdotal color for policies that will structure academic life for a decade.",
      },
      {
        type: "quote",
        text: "If the university can move this quickly to adopt AI, it can move quickly to include the people who will live under it.",
        cite: "SHIFT editorial board",
      },
      { type: "h2", text: "This is a test of the institution" },
      {
        type: "p",
        text: "Universities like to describe themselves as communities of inquiry. AI policy is one of the first real tests of whether that language still means anything. The technology is moving faster than shared governance. That is precisely why shared governance matters now.",
      },
      {
        type: "p",
        text: "SHIFT is not asking USC to slow down indefinitely. We are asking it to make room. Students can live with disagreement about AI. We cannot live with being governed by systems we were never invited to see.",
      },
    ],
  });

  await createStory({
    slug: "should-usc-regulate-generative-ai-in-the-classroom",
    title: "Should USC Regulate Generative AI in the Classroom?",
    dek: "As AI becomes embedded in coursework, the distinction between assistance and academic misconduct is becoming harder to define.",
    excerpt:
      "Faculty want integrity. Students want tools. The university wants a policy. None of those goals are the same thing.",
    visualTheme: "grid",
    category: "OPINION",
    authorId: aisha.id,
    tagNames: ["AI", "Education", "USC", "Opinion", "Ethics"],
    publishedDaysAgo: 3,
    featured: true,
    seoDescription: "An opinion on whether USC should centrally regulate generative AI in coursework.",
    body: [
      {
        type: "p",
        text: "Every syllabus this fall is a small constitution. Some professors ban ChatGPT outright. Some require disclosure. Some treat AI as a collaborator to be cited. Some say nothing, which students correctly interpret as the most dangerous policy of all.",
      },
      {
        type: "p",
        text: "The instinct to regulate is understandable. Generative models can produce fluent work that looks like learning without being learning. They can also help a first-generation student outline an argument, a disabled student structure a draft, or an international student check tone. A university that pretends those uses are identical is not being rigorous. It is being convenient.",
      },
      { type: "pullquote", text: "A campus-wide ban would be simple. It would also be dishonest." },
      { type: "h2", text: "Regulation is not the same as clarity" },
      {
        type: "p",
        text: "USC does need a baseline. Students should not have to reverse-engineer integrity rules course by course. But a single prohibition would collapse the actual pedagogical question: what is the assignment for? If the goal is to produce a polished memo, AI may be a legitimate instrument. If the goal is to struggle through a proof, it may be a way of skipping the education.",
      },
      {
        type: "p",
        text: "The better policy is layered. The university should require every syllabus to state an AI stance in plain language. It should ban secret detection tools that students cannot contest. It should create a shared vocabulary for disclosure. And it should admit that enforcement theater — percentage scores from black-box detectors — is not a moral system.",
      },
      { type: "quote", text: "We cannot police our way into a theory of learning.", cite: "Aisha Rahman" },
      {
        type: "p",
        text: "Regulate the process. Do not outsource judgment to a vendor. And do not confuse student use of AI with student contempt for education. Most students I talk to are not trying to cheat the university. They are trying to survive a system that has not decided what it is asking of them.",
      },
    ],
  });

  await createStory({
    slug: "ai-surveillance-on-campus-safety-or-overreach",
    title: "AI Surveillance on Campus: Safety or Overreach?",
    dek: "New technologies promise safer campuses. They also introduce difficult questions about privacy, consent, and who is watched.",
    excerpt: "Cameras that used to record now interpret. That change is a policy change, whether USC names it or not.",
    visualTheme: "scan",
    category: "ANALYSIS",
    authorId: marcus.id,
    tagNames: ["Privacy", "USC", "AI", "Digital Rights", "Policy"],
    publishedDaysAgo: 5,
    featured: true,
    seoDescription: "An analysis of AI-enabled campus surveillance and student privacy at USC.",
    body: [
      {
        type: "p",
        text: "Campus safety conversations have a gravitational pull. After a scare, after a headline, after a late-night alert, the demand for more visibility feels obvious. Vendors know this. They now sell not just cameras, but interpretation: facial recognition, loitering detection, weapon classification, occupancy heatmaps, and behavioral flags.",
      },
      {
        type: "p",
        text: "The pitch is efficiency. A human cannot watch every feed. An model can. The problem is that an model does not watch in the old sense. It classifies. It stores patterns. It makes people into events.",
      },
      { type: "stat", value: "24/7", label: "the operating promise of modern campus analytics platforms" },
      { type: "h2", text: "Safety is a real value. So is being able to walk across campus unprofiled." },
      {
        type: "p",
        text: "SHIFT is not arguing that USC should be careless about harm. Students have a right to move through campus without fear. The question is whether AI surveillance is the intervention that produces safety, or the intervention that is easiest to procure after fear.",
      },
      {
        type: "ul",
        items: [
          "Who is in the training data, and which faces the system is more likely to misidentify?",
          "How long are embeddings stored, and who can query them?",
          "Can a student contest being flagged?",
          "Are protest, prayer, and late-night study treated as anomalies?",
        ],
      },
      { type: "pullquote", text: "A camera that records is evidence. A camera that infers is policy." },
      {
        type: "p",
        text: "If USC expands analytic surveillance, it should do so in public: with a privacy impact assessment, with limits on facial recognition, with a ban on using protest footage for discipline, and with student representation in the review. Safety that cannot survive sunlight is not safety. It is unaccountable infrastructure.",
      },
    ],
  });

  await prisma.discussion.create({
    data: {
      slug: "has-ai-negatively-impacted-your-learning-at-usc",
      title: "Has AI negatively impacted your learning at USC?",
      prompt: "Has AI negatively impacted your learning at USC?",
      topic: "CAMPUS",
      featured: true,
      tags: JSON.stringify(["AI", "USC", "Education"]),
      creatorId: julia.id,
    },
  });

  await prisma.opportunity.createMany({
    data: [
      {
        slug: "ai-governance-working-group-open-session",
        title: "Sit in on the AI Governance working group open session",
        type: "PANEL",
        description: "An observed conversation with faculty and administrators drafting campus AI guidance.",
        body: "USC’s AI governance working group is holding a limited open session. Students may attend, listen, and submit written questions in advance. This is not yet a voting seat — which is part of why SHIFT is covering it — but it is one of the only public windows into how campus AI rules are taking shape.",
        dateLabel: "Thursday, August 21 · 5:30 p.m.",
        location: "Von KleinSmid Center 201",
        organizer: "Office of the Provost",
        deadline: daysFromNow(8),
        eligibility: "Open to all currently enrolled USC students. RSVP required.",
        status: "OPEN",
        ctaLabel: "Register",
        urgent: true,
      },
      {
        slug: "student-seat-ai-committee-petition",
        title: "Petition: add a student seat to USC’s AI policy committee",
        type: "PETITION",
        description: "Demand formal student membership on the body writing campus AI rules.",
        body: "This student petition asks USC to add at least two voting student members — one undergraduate, one graduate — to any committee setting AI, data, or academic integrity policy. SHIFT did not write the petition, but we are surfacing it because it is the clearest current mechanism for students to insist on representation.",
        dateLabel: "Signatures close August 29",
        location: "Campus-wide",
        organizer: "Students for Campus Data Rights",
        deadline: daysFromNow(16),
        eligibility: "USC students, faculty, and staff may sign.",
        status: "CLOSING_SOON",
        ctaLabel: "Sign",
        urgent: true,
      },
    ],
  });

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
