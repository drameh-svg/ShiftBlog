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

  const leo = await prisma.user.create({
    data: {
      email: "leo.park@shiftpolicy.org",
      name: "Leo Park",
      passwordHash: password("ShiftEditor2026!"),
      role: "EDITOR",
      title: "Campus Correspondent, Annenberg ’28",
      bio: "Reports on USC technology decisions that students feel before they are announced.",
      avatarHue: 198,
    },
  });

  const priya = await prisma.user.create({
    data: {
      email: "priya.shah@shiftpolicy.org",
      name: "Priya Shah",
      passwordHash: password("ShiftEditor2026!"),
      role: "EDITOR",
      title: "Research Editor, Public Policy ’26",
      bio: "Tracks AI agents, education policy, and the data trails students leave behind.",
      avatarHue: 42,
    },
  });

  const sam = await prisma.user.create({
    data: {
      email: "sam.okonkwo@usc.edu",
      name: "Sam Okonkwo",
      passwordHash: password("StudentDemo2026!"),
      role: "PUBLIC",
      title: "Electrical Engineering ’27",
      bio: "USC student following campus AI policy and digital rights.",
      avatarHue: 88,
    },
  });

  const nina = await prisma.user.create({
    data: {
      email: "nina.vasquez@usc.edu",
      name: "Nina Vasquez",
      passwordHash: password("StudentDemo2026!"),
      role: "PUBLIC",
      title: "Political Science ’28",
      avatarHue: 24,
    },
  });

  const devon = await prisma.user.create({
    data: {
      email: "devon.kim@usc.edu",
      name: "Devon Kim",
      passwordHash: password("StudentDemo2026!"),
      role: "PUBLIC",
      title: "Cinematic Arts ’26",
      avatarHue: 200,
    },
  });

  const tagNames = [
    "AI",
    "USC",
    "Policy",
    "Ethics",
    "Privacy",
    "Education",
    "Big Tech",
    "Digital Rights",
    "National",
    "Global",
    "Opinion",
  ];
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
    isBrief?: boolean;
    status?: Prisma.StoryCreateInput["status"];
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
        status: input.status ?? "PUBLISHED",
        featured: input.featured ?? false,
        leadStory: input.leadStory ?? false,
        isBrief: input.isBrief ?? false,
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

  const seat = await createStory({
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
      {
        type: "h2",
        text: "Policy is already happening without us",
      },
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
      {
        type: "h2",
        text: "What a seat actually means",
      },
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
      {
        type: "h2",
        text: "This is a test of the institution",
      },
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

  const classroom = await createStory({
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
      {
        type: "pullquote",
        text: "A campus-wide ban would be simple. It would also be dishonest.",
      },
      {
        type: "h2",
        text: "Regulation is not the same as clarity",
      },
      {
        type: "p",
        text: "USC does need a baseline. Students should not have to reverse-engineer integrity rules course by course. But a single prohibition would collapse the actual pedagogical question: what is the assignment for? If the goal is to produce a polished memo, AI may be a legitimate instrument. If the goal is to struggle through a proof, it may be a way of skipping the education.",
      },
      {
        type: "p",
        text: "The better policy is layered. The university should require every syllabus to state an AI stance in plain language. It should ban secret detection tools that students cannot contest. It should create a shared vocabulary for disclosure. And it should admit that enforcement theater — percentage scores from black-box detectors — is not a moral system.",
      },
      {
        type: "quote",
        text: "We cannot police our way into a theory of learning.",
        cite: "Aisha Rahman",
      },
      {
        type: "p",
        text: "Regulate the process. Do not outsource judgment to a vendor. And do not confuse student use of AI with student contempt for education. Most students I talk to are not trying to cheat the university. They are trying to survive a system that has not decided what it is asking of them.",
      },
    ],
  });

  const surveillance = await createStory({
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
      {
        type: "stat",
        value: "24/7",
        label: "the operating promise of modern campus analytics platforms",
      },
      {
        type: "h2",
        text: "Safety is a real value. So is being able to walk across campus unprofiled.",
      },
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
      {
        type: "pullquote",
        text: "A camera that records is evidence. A camera that infers is policy.",
      },
      {
        type: "p",
        text: "If USC expands analytic surveillance, it should do so in public: with a privacy impact assessment, with limits on facial recognition, with a ban on using protest footage for discipline, and with student representation in the review. Safety that cannot survive sunlight is not safety. It is unaccountable infrastructure.",
      },
    ],
  });

  await createStory({
    slug: "who-gets-to-decide-what-an-ai-can-know-about-you",
    title: "Who Gets to Decide What an AI Can Know About You?",
    subtitle: "Personalized models are arriving on campus faster than consent.",
    dek: "The growth of personalized AI raises fundamental questions about data ownership, memory, and the right to remain unread.",
    excerpt:
      "When software remembers you, someone had to decide what it was allowed to remember. Students should be in that decision.",
    visualTheme: "orb",
    category: "ESSAY",
    authorId: priya.id,
    tagNames: ["AI", "Privacy", "Ethics", "Digital Rights"],
    publishedDaysAgo: 8,
    featured: true,
    seoDescription: "An essay on personalized AI, student data, and consent.",
    body: [
      {
        type: "p",
        text: "The last generation of campus software stored records. The next generation wants a relationship. Advising bots that recall your major changes. Writing tools that learn your voice. Tutors that know which problems you miss. Wellness chatbots that keep a diary you did not mean to keep.",
      },
      {
        type: "p",
        text: "Personalization is sold as care. In a narrow sense, it is. A system that remembers you can be more useful than one that greets you as a stranger every time. But memory is not neutral. Memory is a theory of what matters about a person — and a theory of who is allowed to look.",
      },
      {
        type: "pullquote",
        text: "Who gets to decide what an AI knows about you is the privacy question of this decade.",
      },
      {
        type: "h2",
        text: "Consent is being redesigned as a checkbox",
      },
      {
        type: "p",
        text: "Students already sign away astonishing amounts of academic exhaust: learning management clicks, ID card swipes, Wi-Fi associations, library logs, camera stills, and now conversational transcripts. Layer a long-term memory model on top of that, and the university does not just have data. It has a portrait.",
      },
      {
        type: "p",
        text: "That portrait will be tempting. It will be tempting for advising. For retention. For mental health triage. For discipline. For research. Once a portrait exists, uses will be invented for it. Policy written after the portrait is built will always be catching up.",
      },
      {
        type: "quote",
        text: "The right to be a student should include the right not to be a permanently queryable self.",
        cite: "Priya Shah",
      },
      {
        type: "p",
        text: "USC should default to forgetting. Tools used for coursework should not retain student identity across terms unless a student opts in, in language a human can understand. No wellness conversation should train a model. No advising transcript should migrate into a disciplinary file. And no vendor should be able to say the model ‘needs’ memory when what it needs is a contract.",
      },
    ],
  });

  await createStory({
    slug: "what-the-new-wave-of-ai-agents-means-for-college-students",
    title: "What the New Wave of AI Agents Means for College Students",
    dek: "AI is moving beyond chatbots. What happens when software can act on our behalf — register, email, file, and decide?",
    excerpt: "Agents do not just answer questions. They take actions. Campus policy has barely noticed.",
    visualTheme: "data",
    category: "EXPLAINER",
    authorId: priya.id,
    tagNames: ["AI", "Education", "Policy", "National"],
    publishedDaysAgo: 6,
    isBrief: false,
    seoDescription: "An explainer on AI agents and how they will change student life.",
    body: [
      {
        type: "p",
        text: "Chatbots talk. Agents do. That distinction sounds technical until you imagine a system that can log into a student portal, fill a form, email a professor, move money, or submit an assignment while you sleep.",
      },
      {
        type: "h2",
        text: "From answers to actions",
      },
      {
        type: "p",
        text: "The first wave of campus AI was conversational: tools that drafted, explained, and summarized. The second wave can call other software. It can browse. It can click. It can keep going until a task is marked complete. For a student juggling jobs, labs, and financial aid paperwork, that is genuinely powerful. It is also a new kind of risk.",
      },
      {
        type: "ul",
        items: [
          "Authorization: whose credentials is the agent using?",
          "Accountability: if it emails the wrong thing, who is responsible?",
          "Integrity: is an agent-completed assignment still your work?",
          "Security: what happens when a prompt injection hijacks a tool with access to your files?",
        ],
      },
      {
        type: "stat",
        value: "Act",
        label: "the verb campus policy has not yet learned to regulate",
      },
      {
        type: "p",
        text: "SHIFT’s view is simple: USC should treat agents as a distinct class of software, not as a smarter chatbot. Any campus-licensed agent should have a visible activity log, tight permission scopes, and a prohibition on using student credentials without explicit, revocable consent. Students should not have to become security engineers to stay enrolled.",
      },
    ],
  });

  await createStory({
    slug: "silicon-valley-has-a-governance-problem",
    title: "Silicon Valley Has a Governance Problem",
    dek: "Technology companies increasingly make decisions with consequences traditionally associated with governments.",
    excerpt:
      "Platforms now set the terms of speech, work, and attention. Calling that innovation does not make it democratic.",
    visualTheme: "liquid",
    category: "OPINION",
    authorId: marcus.id,
    tagNames: ["Big Tech", "Policy", "National", "Global", "Opinion"],
    publishedDaysAgo: 10,
    seoDescription: "An opinion on why major technology firms now function as unaccountable governments.",
    body: [
      {
        type: "p",
        text: "For years, the industry’s favorite story was that government is slow and companies are fast, so companies should be left alone to build. That story is getting harder to tell with a straight face. The largest technology firms now adjudicate speech, mediate labor, allocate visibility, and train models on the public’s work. Those are governing functions.",
      },
      {
        type: "p",
        text: "They are just governing functions without elections.",
      },
      {
        type: "pullquote",
        text: "A terms-of-service update is not a social contract.",
      },
      {
        type: "p",
        text: "This matters on a campus because students are not only users. They are future civil servants, engineers, lawyers, and journalists who will either reproduce this arrangement or refuse it. USC cannot teach constitutional democracy in the morning and uncritical platform fatalism in the afternoon.",
      },
      {
        type: "p",
        text: "The point is not that every model should be nationalized. The point is that private infrastructure with public consequences needs public obligations: transparency about training data, due process when accounts are punished, and limits on using intimate data to train the next system. If that sounds like government, that is because the power already is.",
      },
    ],
  });

  await createStory({
    slug: "california-ai-disclosure-and-usc-research",
    title: "What California’s AI Disclosure Push Means for USC Research",
    dek: "State rules on training data and synthetic media are arriving. University labs will not be spectators.",
    excerpt: "A short briefing on how state-level AI rules could change research, publishing, and student work.",
    visualTheme: "type",
    category: "NEWS",
    authorId: leo.id,
    tagNames: ["AI", "Policy", "National", "USC"],
    publishedDaysAgo: 2,
    isBrief: true,
    seoDescription: "A brief on California AI disclosure rules and USC research.",
    body: [
      {
        type: "p",
        text: "California is moving toward stricter disclosure rules for training data, synthetic media, and automated decision systems. For USC, this is not a distant Sacramento story. Research labs, student publications, and campus communications teams will all have to decide how they label machine-generated work and whether datasets used in class projects meet emerging standards.",
      },
      {
        type: "p",
        text: "The practical effect: expect more paperwork around datasets, more pressure to watermark or label synthetic images, and new questions about whether student-created training sets can be shared. SHIFT will keep tracking which campus units are preparing — and which are hoping the rules stay someone else’s problem.",
      },
    ],
  });

  await createStory({
    slug: "student-push-for-a-campus-data-bill-of-rights",
    title: "Inside the Student Push for a Campus Data Bill of Rights",
    dek: "A cross-school group wants USC to publish what it collects, how long it keeps it, and who can see it.",
    excerpt: "Students are drafting a data bill of rights. The university has not said whether it will engage.",
    visualTheme: "glass",
    category: "CAMPUS",
    authorId: leo.id,
    tagNames: ["USC", "Privacy", "Digital Rights", "Policy"],
    publishedDaysAgo: 4,
    seoDescription: "Campus reporting on a student-led data bill of rights at USC.",
    body: [
      {
        type: "p",
        text: "On a Thursday night in Leavey, a dozen students sat around a table covered in printouts of privacy policies no one had read until that week. The project is simple to describe and difficult to win: a Campus Data Bill of Rights that would require USC to explain, in public language, what student information it collects, why, and for how long.",
      },
      {
        type: "p",
        text: "The group is not asking for the university to stop collecting anything. They want a map. Swipe logs, learning analytics, camera systems, advising notes, and AI tutoring transcripts currently live in separate bureaucratic weather systems. Students experience them as one climate.",
      },
      {
        type: "quote",
        text: "If I can get a receipt for a burrito, I should be able to get a receipt for my data.",
        cite: "organizer, USC Data Rights working group",
      },
      {
        type: "p",
        text: "SHIFT reviewed a draft. It includes a right to know, a right to correct, a right to contest automated decisions, and a prohibition on selling student data. Whether the administration treats it as a petition or a partner will say a lot about the AI policy conversation happening in parallel.",
      },
    ],
  });

  await createStory({
    slug: "when-your-ta-is-a-chatbot",
    title: "When Your TA Is a Chatbot",
    dek: "Departments are piloting AI teaching assistants. Students say the help is fast — and impossible to argue with.",
    excerpt: "AI TAs are arriving in large courses. Accountability is not.",
    visualTheme: "grid",
    category: "CAMPUS",
    authorId: leo.id,
    tagNames: ["AI", "USC", "Education", "Ethics"],
    publishedDaysAgo: 12,
    seoDescription: "Campus reporting on AI teaching assistants at USC.",
    body: [
      {
        type: "p",
        text: "In one large lower-division course this spring, students were told they could get 24-hour help from an AI teaching assistant trained on the syllabus, lecture notes, and past exams. Office hours, the professor wrote, would still exist. They would just be less necessary.",
      },
      {
        type: "p",
        text: "Students SHIFT interviewed described the tool as useful for logistics and brittle for judgment. It could restate a definition. It could not tell you whether your reasoning was interesting. When it was wrong, there was no obvious way to appeal except to wait for a human — the very bottleneck the tool was meant to remove.",
      },
      {
        type: "p",
        text: "If USC expands AI TAs, SHIFT’s position is that every automated academic judgment needs a human fallback, a visible model card, and a promise that chat logs will not be used in grading disputes without the student’s knowledge.",
      },
    ],
  });

  await createStory({
    slug: "ethics-of-training-models-on-student-work",
    title: "The Ethics of Using Student Work to Train University Models",
    dek: "Essays, code, and studio projects are becoming training data. Most students never opted in.",
    excerpt: "A university that assigns work should not quietly turn that work into a model.",
    visualTheme: "type",
    category: "ANALYSIS",
    authorId: julia.id,
    tagNames: ["Ethics", "AI", "Education", "Privacy"],
    publishedDaysAgo: 14,
    seoDescription: "Analysis of universities training AI models on student coursework.",
    body: [
      {
        type: "p",
        text: "Student work has always been used to teach. That is the point of a university. What is new is scale without relationship: thousands of essays and repositories condensed into a model that will outlive the seminar in which they were written.",
      },
      {
        type: "p",
        text: "Some faculty see this as stewardship — a way to build tutoring systems that understand USC’s curriculum. Others see an extraction of intellectual labor from people who were graded, not paid. Both can be true. Policy has to decide which use is legitimate.",
      },
      {
        type: "pullquote",
        text: "A grade is not a license to train.",
      },
      {
        type: "p",
        text: "SHIFT’s standard is opt-in, with a real alternative. If a department wants to train on student work, it should ask, explain the purpose, and allow students to complete the course without contributing to the model. Anything less turns education into a data mine.",
      },
    ],
  });

  await prisma.story.create({
    data: {
      slug: "draft-ai-honor-code",
      title: "The Honor Code Was Not Written for Language Models",
      dek: "A working draft on how academic integrity language fails to describe contemporary AI use.",
      excerpt: "Draft in progress.",
      body: serializeBody([
        {
          type: "p",
          text: "This draft argues that USC’s honor code still describes cheating as a secret between a student and a forbidden document. Generative models do not fit that picture. The piece is being reported and is not ready for publication.",
        },
      ]),
      visualTheme: "aurora",
      category: "ANALYSIS",
      status: "DRAFT",
      authorId: marcus.id,
      seoDescription: "Draft story on honor codes and AI.",
    },
  });

  await prisma.story.create({
    data: {
      slug: "review-viterbi-ai-labs",
      title: "What Students Actually Experience Inside USC’s AI Labs",
      dek: "Access, funding, and the quiet hierarchy of who gets to build.",
      excerpt: "Needs editorial review.",
      body: serializeBody([
        {
          type: "p",
          text: "Reported conversations with students in campus AI labs about compute access, authorship, and whether undergraduate researchers are collaborators or free labor.",
        },
      ]),
      visualTheme: "data",
      category: "CAMPUS",
      status: "IN_REVIEW",
      authorId: leo.id,
      seoDescription: "In-review campus story on AI labs.",
    },
  });

  const comments = [
    {
      storyId: seat.id,
      userId: sam.id,
      body: "I have never been asked about any of this, and I am in two CS classes that already require AI tools. Representation should not be optional.",
      color: "lime",
      posX: 8,
      posY: 12,
      rotation: -2.5,
    },
    {
      storyId: seat.id,
      userId: nina.id,
      body: "Listening sessions are not power. If there is no vote, there is no seat.",
      color: "purple",
      posX: 38,
      posY: 6,
      rotation: 1.8,
    },
    {
      storyId: seat.id,
      userId: devon.id,
      body: "Would a student seat slow things down? Maybe. Slowing down a surveillance purchase is not a bug.",
      color: "cream",
      posX: 64,
      posY: 18,
      rotation: -1.2,
      featured: true,
    },
    {
      storyId: classroom.id,
      userId: sam.id,
      body: "I do not want a ban. I want to know, in the first week, what counts as using my own brain.",
      color: "lavender",
      posX: 14,
      posY: 10,
      rotation: 2.1,
    },
    {
      storyId: surveillance.id,
      userId: nina.id,
      body: "If facial recognition comes to campus, I want a public no. Not a FAQ after installation.",
      color: "gray",
      posX: 42,
      posY: 14,
      rotation: -3,
    },
  ];

  for (const comment of comments) {
    const created = await prisma.comment.create({ data: comment });
    if (comment.storyId === seat.id && comment.userId === devon.id) {
      await prisma.commentReply.create({
        data: {
          commentId: created.id,
          userId: julia.id,
          body: "This is exactly the standard SHIFT wants in the room: delay as a form of care, not obstruction.",
        },
      });
    }
    await prisma.reaction.create({
      data: { userId: nina.id, type: "agree", commentId: created.id },
    });
  }

  const facial = await prisma.discussion.create({
    data: {
      slug: "should-usc-restrict-facial-recognition-on-campus",
      title: "Should USC restrict the use of facial recognition on campus?",
      prompt:
        "Campus safety vendors are pitching face identification as a missing piece of protection. Is the tradeoff worth it?",
      topic: "DEBATES",
      isDebate: true,
      featured: true,
      tags: JSON.stringify(["Privacy", "USC", "AI"]),
      creatorId: marcus.id,
    },
  });

  await prisma.debateArgument.createMany({
    data: [
      {
        discussionId: facial.id,
        userId: nina.id,
        side: "FOR",
        body: "Restrict it. Misidentification risk is not evenly distributed, and a campus is not an airport. Once the embeddings exist, mission creep is the default, not the exception.",
      },
      {
        discussionId: facial.id,
        userId: devon.id,
        side: "FOR",
        body: "Students protest, worship, and study at odd hours. A system that flags ‘unusual’ presence will always over-police the people who do not look like the training set of a normal day.",
      },
      {
        discussionId: facial.id,
        userId: sam.id,
        side: "AGAINST",
        body: "I am uneasy, but I also want faster identification after a real threat. A narrowly scoped system — emergency use only, no protest footage, logged access — is different from a ban.",
      },
      {
        discussionId: facial.id,
        userId: leo.id,
        side: "AGAINST",
        body: "If the alternative is more human security with less accountability, I want to see the comparison, not just the slogan. Restriction should be precise, not theatrical.",
      },
    ],
  });

  const exams = await prisma.discussion.create({
    data: {
      slug: "ban-generative-ai-from-take-home-exams",
      title: "Should generative AI be banned from take-home exams?",
      prompt: "If a take-home exam can be completed by a model, is the exam still measuring a student?",
      topic: "DEBATES",
      isDebate: true,
      tags: JSON.stringify(["Education", "AI", "Ethics"]),
      creatorId: aisha.id,
    },
  });

  await prisma.debateArgument.createMany({
    data: [
      {
        discussionId: exams.id,
        userId: julia.id,
        side: "FOR",
        body: "If the point is to evaluate unassisted reasoning, then yes: ban it, and design the exam so the ban is enforceable — oral components, in-person writing, process memos.",
      },
      {
        discussionId: exams.id,
        userId: sam.id,
        side: "AGAINST",
        body: "Bans without redesign just produce better hiding. Change the assignment so using AI is either irrelevant or required to be shown.",
      },
    ],
  });

  const lectureNotes = await prisma.discussion.create({
    data: {
      slug: "who-owns-ai-lecture-notes",
      title: "Who owns the notes an AI generates from our lectures?",
      prompt: "If a tool transcribes and rewrites a lecture, is that the professor’s work, the student’s, or the vendor’s?",
      topic: "CAMPUS",
      tags: JSON.stringify(["Education", "USC", "Digital Rights"]),
      creatorId: leo.id,
    },
  });
  const contracts = await prisma.discussion.create({
    data: {
      slug: "should-usc-publish-ai-vendor-contracts",
      title: "Should USC publish its AI vendor contracts?",
      prompt: "Procurement is where policy actually happens. Students cannot evaluate what they cannot read.",
      topic: "POLICY",
      featured: true,
      tags: JSON.stringify(["Policy", "USC", "Big Tech"]),
      creatorId: julia.id,
    },
  });
  const wifi = await prisma.discussion.create({
    data: {
      slug: "campus-wifi-login-data",
      title: "Is the campus Wi-Fi login harvesting too much data?",
      prompt: "Captive portals ask for more every year. What is necessary for network access, and what is just convenient for analytics?",
      topic: "TRENDING",
      tags: JSON.stringify(["Privacy", "USC"]),
      creatorId: nina.id,
    },
  });
  await prisma.discussion.create({
    data: {
      slug: "agent-tools-and-integrity",
      title: "If an AI agent files my paperwork, did I do the work?",
      prompt: "Agents can now complete multi-step tasks. Academic integrity language still talks about ‘submitting work.’",
      topic: "AI",
      tags: JSON.stringify(["AI", "Education", "Ethics"]),
      creatorId: priya.id,
    },
  });

  await prisma.discussionPost.createMany({
    data: [
      {
        discussionId: contracts.id,
        userId: sam.id,
        body: "Redact prices if you must. Do not redact the data-sharing clauses. That is the public interest part.",
        featured: true,
      },
      {
        discussionId: contracts.id,
        userId: nina.id,
        body: "Other public universities already post contracts. USC’s private status should not be a secrecy technology.",
      },
      {
        discussionId: wifi.id,
        userId: devon.id,
        body: "I just want to know whether my MAC address is being stitched to my student ID across semesters.",
      },
      {
        discussionId: lectureNotes.id,
        userId: aisha.id,
        body: "If a vendor trains on lecture captures, professors should know before they hit record — and students before they speak.",
      },
    ],
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
      {
        slug: "campus-safety-technology-review",
        title: "Attend the public meeting on campus safety technology",
        type: "MEETING",
        description: "A public review of proposed camera analytics and access-control upgrades.",
        body: "DPS and facilities will present proposed technology upgrades, including analytic cameras. There will be a public comment period. SHIFT recommends coming with specific questions: retention, facial recognition, protest footage, and vendor access.",
        dateLabel: "September 4 · 6:00 p.m.",
        location: "Ronald Tutor Campus Center, Room 227",
        organizer: "Department of Public Safety",
        deadline: daysFromNow(22),
        eligibility: "Open to the USC community.",
        status: "UPCOMING",
        ctaLabel: "Attend",
      },
      {
        slug: "classroom-ai-guidelines-comment",
        title: "Submit public comment on proposed classroom AI guidelines",
        type: "PUBLIC_COMMENT",
        description: "The draft syllabus language for generative AI is open for student response.",
        body: "A draft of university-wide syllabus language on generative AI is circulating among schools. Students can submit comments on bans, disclosure, detection tools, and accessibility. Written comments are more useful than one-line reactions: explain how the rule would work in a real class.",
        dateLabel: "Comment window open through September 12",
        location: "Online",
        organizer: "Academic Senate (draft)",
        deadline: daysFromNow(30),
        eligibility: "All students may comment. USC email preferred.",
        status: "OPEN",
        ctaLabel: "Add Your Voice",
        urgent: true,
      },
      {
        slug: "student-ai-use-survey",
        title: "Participate in the student AI use research survey",
        type: "RESEARCH",
        description: "A 12-minute survey on how USC students actually use generative tools.",
        body: "Researchers in Public Policy and Informatics are documenting student AI use — not to catch anyone, but to replace rumor with evidence. The dataset will be published in aggregate. This is one of the few campus studies that treats students as sources rather than subjects to be managed.",
        dateLabel: "Open through the fall semester",
        location: "Online",
        organizer: "Price / Informatics research team",
        eligibility: "Enrolled USC undergraduates and graduate students.",
        status: "ONGOING",
        ctaLabel: "Take the Survey",
      },
      {
        slug: "shift-digital-rights-initiative",
        title: "Join SHIFT’s Digital Rights initiative",
        type: "INITIATIVE",
        description: "Help SHIFT report, brief, and organize around campus data rights this semester.",
        body: "The Digital Rights initiative is SHIFT Public Policy’s working group on surveillance, student data, and AI procurement. Contributors research, write explainers, attend meetings, and help other students show up prepared. No prior policy experience required — curiosity and follow-through are.",
        dateLabel: "Kickoff August 19",
        location: "SHIFT newsroom, Taper Hall",
        organizer: "SHIFT Public Policy",
        eligibility: "USC students. All majors.",
        status: "OPEN",
        ctaLabel: "Join the Initiative",
      },
      {
        slug: "viterbi-leadership-office-hours",
        title: "Speak with Viterbi leadership during student office hours",
        type: "LEADERSHIP",
        description: "A rare chance to ask school leadership about AI tools in engineering coursework.",
        body: "Viterbi is holding student office hours on classroom AI, computing resources, and lab access. Bring a specific question. SHIFT will publish a readout of themes that students are willing to share on the record.",
        dateLabel: "August 27 · 4:00 p.m.",
        location: "Ronald Tutor Hall lobby",
        organizer: "Viterbi School of Engineering",
        deadline: daysFromNow(14),
        eligibility: "Viterbi students; others welcome as space allows.",
        status: "UPCOMING",
        ctaLabel: "Learn More",
      },
      {
        slug: "spring-chatgpt-forum",
        title: "Spring forum on ChatGPT in the classroom",
        type: "PANEL",
        description: "A completed SHIFT-hosted conversation now archived for reference.",
        body: "In March, SHIFT hosted faculty, students, and academic integrity staff for a public forum on ChatGPT. The recording and notes remain available. Several of the questions raised there — detection tools, disclosure, and unequal access — are still unresolved.",
        dateLabel: "March 12, 2026",
        location: "Annenberg",
        organizer: "SHIFT Public Policy",
        status: "COMPLETED",
        ctaLabel: "Read the Recap",
      },
    ],
  });

  await prisma.ideaSubmission.createMany({
    data: [
      {
        name: "Anonymous student",
        anonymous: true,
        topic: "ID card analytics",
        category: "Campus issues",
        idea: "SHIFT should investigate how long USC stores ID swipe data from dorms and gyms, and whether it is combined with Wi-Fi logs.",
        why: "Students treat swipes as access, not as a behavioral record. If those records are being used for anything beyond entry, that should be public.",
        status: "SUBMITTED",
      },
      {
        name: "Sam Okonkwo",
        email: "sam.okonkwo@usc.edu",
        topic: "Compute access",
        category: "Story ideas",
        idea: "Look at who actually gets GPU time on campus and whether undergraduates in non-flagship labs are frozen out.",
        why: "AI opportunity on campus is becoming a resource allocation story, not just an ethics story.",
        userId: sam.id,
        status: "UNDER_REVIEW",
      },
    ],
  });

  await prisma.articleSubmission.create({
    data: {
      name: "Nina Vasquez",
      email: "nina.vasquez@usc.edu",
      title: "My professor’s AI detector accused me of a sentence I wrote",
      articleType: "Campus",
      topic: "Academic integrity",
      pitch:
        "A first-person reported essay about contesting an AI detection score and how little process existed to challenge it.",
      draft:
        "I found out I had been flagged because a teaching assistant forwarded a screenshot of a percentage. There was no hearing. There was a vibe. I want to write about what due process looks like when the accuser is a dashboard.",
      sources: "Personal records; interviews with two other students in the same course.",
      bio: "Political science major covering student rights.",
      userId: nina.id,
      status: "SUBMITTED",
    },
  });

  const lorem =
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.";
  const loremBody = serializeBody([
    { type: "p", text: lorem },
    { type: "p", text: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum." },
    { type: "h2", text: "Lorem ipsum" },
    { type: "p", text: "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo." },
    { type: "pullquote", text: "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit." },
    { type: "p", text: "Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem." },
    { type: "ul", items: ["Lorem ipsum dolor sit amet", "Consectetur adipiscing elit", "Sed do eiusmod tempor incididunt"] },
    { type: "p", text: "Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur." },
  ]);
  const loremTitles = [
    "Lorem ipsum dolor sit amet",
    "Consectetur adipiscing elit",
    "Sed do eiusmod tempor incididunt",
    "Ut labore et dolore magna aliqua",
    "Ut enim ad minim veniam",
    "Quis nostrud exercitation ullamco",
    "Duis aute irure dolor in reprehenderit",
    "Excepteur sint occaecat cupidatat",
    "Sunt in culpa qui officia",
    "Nemo enim ipsam voluptatem",
    "Neque porro quisquam est",
    "At vero eos et accusamus",
  ];
  const publicCategories = ["CAMPUS", "NEWS", "OPINION"] as const;
  const seededStories = await prisma.story.findMany({ orderBy: { createdAt: "asc" } });
  await Promise.all(
    seededStories.map((story, index) =>
      prisma.story.update({
        where: { id: story.id },
        data: {
          title: loremTitles[index % loremTitles.length],
          subtitle: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
          dek: lorem,
          excerpt: lorem,
          body: loremBody,
          seoDescription: lorem,
          category: publicCategories[index % publicCategories.length],
        },
      }),
    ),
  );

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
