const team = [
  { name: "Mary Thomas", initials: "MT", id: "316363", bio: "SDSC's HPC/CI Advanced Computing Training Lead develops and organizes training for researchers using HPC systems and mentors students in advanced computing." },
  { name: "Mai Nguyen", initials: "MN", id: "534773", bio: "A computational and data science research specialist at SDSC, Mai researches AI and data science applications and teaches AI and scalable analytics." },
  { name: "Avery Blas", initials: "AB", id: "502634", bio: "Avery supports project management and administration at SDSC, contributing user research, usability testing, and user-centered resources." },
  { name: "Fernando Garzon", initials: "FG", id: "923534", bio: "The Learning Hub Technical Lead & Platform Architect builds research platforms spanning secure backend services and user-centered interfaces." },
  { name: "Chanyoung Park", initials: "CP", id: "020334", bio: "An HPC LLM engineer intern, Chanyoung contributes data ingestion, knowledge-graph retrieval, and evaluation of language model applications." },
  { name: "Yi-Shiun (Shing) Hung", initials: "YH", id: "758224", bio: "An HPC software intern, Shing developed the Hub's initial proof of concept and contributes full-stack development, content integration, and deployment workflows." },
  { name: "Srujam Dave", initials: "SD", id: "220334", bio: "An interactive video development intern, Srujam maintains training materials and contributed to the Hub's design and implementation." },
  { name: "Keyura Valalla", initials: "KV", id: "012634", bio: "A project website developer intern, Keyura contributes UI/UX research and design and builds frontend interfaces for the Hub." },
];

export default function AboutPage() {
  return <>
    <section className="page-hero" aria-labelledby="about-heading"><div className="page-hero__shell">
      <span className="eyebrow">About</span><h1 id="about-heading">The SDSC Learning Hub</h1>
      <p>Connecting learners with training resources from the San Diego Supercomputer Center.</p>
    </div></section>
    <section className="section"><div className="section-shell about-content">
      <h2>Training, brought together</h2>
      <p>The Learning Hub brings together HPC training materials, events, programs, and learning paths to make SDSC resources easier to discover.</p>
      <a href="https://sc26.conference-program.com/presentation/?id=ws_bphpcte116&amp;sess=sess150">Read about the Learning Hub presentation at SC26</a>
      <h2 className="about-team-heading">Meet the team</h2>
      <div className="about-team">{team.map((person) => <article className="about-person" key={person.id}>
        <span className="about-initials" aria-hidden="true">{person.initials}</span>
        <div><h3>{person.name}</h3><p>{person.bio}</p><a href={`https://sc26.conference-program.com/presenter/?uid=${person.id}`} aria-label={`SC26 profile for ${person.name}`}>SC26 profile</a></div>
      </article>)}</div>
    </div></section>
  </>;
}
