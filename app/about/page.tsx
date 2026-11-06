const team = [
  { heading: "Project leadership", people: [
    { name: "Mary Thomas", initials: "MT", id: "316363", role: "Advanced computing training", bio: "Mary leads SDSC's HPC and cyberinfrastructure training and mentors students in advanced computing." },
    { name: "Mai Nguyen", initials: "MN", id: "534773", role: "Data science and AI", bio: "Mai is SDSC's Lead for Data Analytics. She brings AI, applied data science, and training expertise to the project." },
    { name: "Avery Blas", initials: "AB", id: "502634", role: "Project coordination and user research", bio: "Avery supports project management, usability testing, and user-centered resources at SDSC." },
    { name: "Fernando Garzon", initials: "FG", id: "923534", role: "Learning Hub Technical Lead & Platform Architect", bio: "Fernando leads the Hub's technical design and release work, connecting its catalog, services, and learner experience." },
  ] },
  { heading: "Interns", people: [
    { name: "Chanyoung Park", initials: "CP", id: "020334", role: "Catalog and data pipelines", bio: "Chanyoung builds ingestion pipelines and contributes knowledge-graph retrieval and language model evaluation." },
    { name: "Yi-Shiun (Shing) Hung", initials: "YH", id: "758224", role: "Analytics and accessibility", bio: "Shing built the Hub's initial prototype and contributes to the platform, metrics, and accessibility checks." },
    { name: "Srujam Dave", initials: "SD", id: "220334", role: "Gateway and deployment", bio: "Srujam maintains training resources and works on Gateway authentication and release workflows." },
    { name: "Keyura Valalla", initials: "KV", id: "012634", role: "Frontend and learner experience", bio: "Keyura contributes UI research and design, builds frontend features, and works on end-to-end tests." },
  ] },
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
      {team.map(({ heading, people }) => <div className="about-team-group" key={heading}>
        <h3>{heading}</h3>
        <div className="about-team">{people.map((person) => <article className="about-person" key={person.id}>
          <span className="about-initials" aria-hidden="true">{person.initials}</span>
          <div><h4>{person.name}</h4><p><strong>{person.role}</strong></p><p>{person.bio}</p><a href={`https://sc26.conference-program.com/presenter/?uid=${person.id}`} aria-label={`SC26 profile for ${person.name}`}>SC26 profile</a></div>
        </article>)}</div>
      </div>)}
    </div></section>
  </>;
}
