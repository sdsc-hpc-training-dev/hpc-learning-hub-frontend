import Image from "next/image";

interface TeamMember {
  name: string;
  initials: string;
  id: string;
  role: string;
  lead?: boolean;
  bio: string;
  photo?: string;
  linkedin?: string;
  github?: string;
}

const team: { id: string; heading: string; people: TeamMember[] }[] = [
  {
    id: "project-leadership",
    heading: "Project Leadership",
    people: [
      {
        name: "Mary Thomas",
        initials: "MT",
        id: "316363",
        linkedin: "mary-thomas-ph-d-a9286773",
        github: "marypthomas",
        lead: true,
        role: "Principal Investigator (PI) and Advanced Computing Training",
        bio: "Mary leads SDSC's HPC and cyberinfrastructure training and mentors students in advanced computing.",
      },
      {
        name: "Avery Blas",
        initials: "AB",
        id: "502634",
        photo: "avery-blas",
        linkedin: "averyblas",
        role: "Project Coordination and User Research",
        bio: "Avery supports project management, usability testing, and user-centered resources at SDSC.",
      },
      {
        name: "Fernando Garzon",
        initials: "FG",
        id: "923534",
        photo: "fernando-garzon",
        linkedin: "fgarzonm",
        github: "ofgarzon2662",
        role: "Learning Hub Technical Lead & Platform Architect",
        bio: "Fernando leads the Hub's technical design and release work, connecting its catalog, services, and learner experience.",
      },
      {
        name: "Mai H. Nguyen",
        initials: "MN",
        id: "534773",
        photo: "mai-nguyen",
        linkedin: "mhnsan",
        github: "mhnsan",
        role: "AI and Data Science",
        bio: "Mai is SDSC's Lead for Data Analytics. She brings AI, applied data science, and training expertise to the project.",
      },
    ],
  },
  {
    id: "current-interns",
    heading: "Current Interns",
    people: [
      {
        name: "Srujam Dave",
        initials: "SD",
        id: "220334",
        linkedin: "srujam-dave-a17098284",
        github: "Srujam-Dave",
        role: "Gateway and Deployment",
        bio: "Srujam maintains training resources and works on Gateway authentication and release workflows.",
      },
      {
        name: "Arnav Dhole",
        initials: "AD",
        id: "802634",
        photo: "arnav-dhole",
        linkedin: "arnavdhole",
        github: "arnavdhole",
        role: "Knowledge Graph and Retrieval",
        bio: "Arnav builds the Neo4j queries that help the Hub's assistant find relevant HPC training material.",
      },
      {
        name: "Yi-Shiun (Shing) Hung",
        initials: "YH",
        id: "758224",
        linkedin: "shinghung",
        github: "ysh0305",
        role: "Analytics and Accessibility",
        bio: "Shing built the Hub's initial prototype and contributes to the platform, metrics, and accessibility checks.",
      },
      {
        name: "Chanyoung Park",
        initials: "CP",
        id: "020334",
        photo: "chanyoung-park",
        linkedin: "cypark1516",
        github: "youngpark1516",
        role: "Catalog and Data Pipelines",
        bio: "Chanyoung builds ingestion pipelines and contributes knowledge-graph retrieval and language model evaluation.",
      },
      {
        name: "Yiting (Mio) Su",
        initials: "YS",
        id: "902634",
        photo: "yiting-su",
        role: "AI Discovery and Evaluation",
        bio: "Mio develops AIDA's retrieval pipeline and evaluates the quality of its answers.",
      },
      {
        name: "Keyura Valalla",
        initials: "KV",
        id: "012634",
        photo: "keyura-valalla",
        linkedin: "keyura-valalla",
        github: "k-yuv",
        role: "Frontend and Learner Experience",
        bio: "Keyura contributes UI research and design, builds frontend features, and works on end-to-end tests.",
      },
    ],
  },
  {
    id: "former-interns",
    heading: "Former Interns",
    people: [
      {
        name: "Michael Ye",
        initials: "MY",
        id: "112634",
        photo: "michael-ye",
        linkedin: "michael-ye-6831b9281",
        github: "MichaelYe48",
        role: "AI-Assisted HPC Learning",
        bio: "As an SDSC intern, Michael developed retrieval-augmented tools to help learners navigate HPC resources.",
      },
      {
        name: "Darren Yu",
        initials: "DY",
        id: "212634",
        photo: "darren-yu",
        linkedin: "darren-yu-a38913246",
        github: "damiyu",
        role: "AI Chat and GraphRAG",
        bio: "As an SDSC intern, Darren built AI chat tools and Neo4j retrieval pipelines for technical education.",
      },
    ],
  },
];

function ProfileLinks({ person }: Readonly<{ person: TeamMember }>) {
  return (
    <div className="about-profile-links">
      <a
        href={`https://sc26.conference-program.com/presenter/?uid=${person.id}`}
        aria-label={`SC26 profile for ${person.name}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        SC26 profile
      </a>
      {person.linkedin && (
        <a
          className="about-social-link"
          href={`https://www.linkedin.com/in/${person.linkedin}/`}
          aria-label={`${person.name} on LinkedIn`}
          title="LinkedIn"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            src="/brand/linkedin.png"
            width={20}
            height={20}
            alt=""
            unoptimized
          />
        </a>
      )}
      {person.github && (
        <a
          className="about-social-link"
          href={`https://github.com/${person.github}`}
          aria-label={`${person.name} on GitHub`}
          title="GitHub"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            src="/brand/github.png"
            width={20}
            height={20}
            alt=""
            unoptimized
          />
        </a>
      )}
    </div>
  );
}

function TeamProfile({ person }: Readonly<{ person: TeamMember }>) {
  return (
    <article
      className={
        person.lead ? "about-person about-person--lead" : "about-person"
      }
    >
      <span
        className="about-avatar"
        data-portrait={person.photo}
        aria-hidden="true"
      >
        {person.photo ? (
          <Image
            src={`/team/${person.photo}.webp`}
            width={88}
            height={88}
            alt=""
            unoptimized
          />
        ) : (
          person.initials
        )}
      </span>
      <div>
        <h4>{person.name}</h4>
        <p>
          <strong>{person.role}</strong>
        </p>
        <p>{person.bio}</p>
        <ProfileLinks person={person} />
      </div>
    </article>
  );
}

export default function AboutPage() {
  return (
    <>
      <section className="page-hero" aria-labelledby="about-heading">
        <div className="page-hero__shell">
          <span className="eyebrow">SDSC Learning Hub</span>
          <h1 id="about-heading">About Us</h1>
          <p>
            Connecting learners with training resources from the San Diego
            Supercomputer Center.
          </p>
        </div>
      </section>
      <section className="section">
        <div className="section-shell about-content">
          <h2>Training, Brought Together</h2>
          <p>
            The Learning Hub brings together HPC training materials, events,
            programs,{" "}
            <span className="about-path-phrase">and learning paths</span> to
            make SDSC resources easier to discover.
          </p>
          <a
            href="https://sc26.conference-program.com/presentation/?id=ws_bphpcte116&amp;sess=sess150"
            target="_blank"
            rel="noopener noreferrer"
          >
            Read about the Learning Hub presentation at SC26
          </a>
          <h2 className="about-team-heading">Meet the Team</h2>
          {team.map(({ id, heading, people }) => (
            <section className="about-team-group" key={id} aria-labelledby={id}>
              <h3 id={id}>{heading}</h3>
              <div className="about-team">
                {people.map((person) => (
                  <TeamProfile person={person} key={person.id} />
                ))}
              </div>
            </section>
          ))}
        </div>
      </section>
    </>
  );
}
