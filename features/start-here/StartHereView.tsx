import Link from "next/link";

const emptyCollections = [
	{ label: "Browse tiles", message: "Browse options will appear here when the catalog is connected." },
	{ label: "Featured training", message: "Featured training will appear here when materials are available." },
	{ label: "Upcoming events", message: "Upcoming events will appear here when event data is available." },
	{ label: "Learning paths", message: "Learning paths will appear here when paths are configured." },
	{ label: "Programs and series", message: "Programs and series will appear here when collections are available." },
];

function EmptyCollection({ label, message }: Readonly<(typeof emptyCollections)[number]>) {
	return (
		<div className="empty-collection" role="status" aria-label={label}>
			<span aria-hidden="true">+</span>
			<p>{message}</p>
		</div>
	);
}

// The landing page intentionally keeps its reference sections together for a stable reading order.
// eslint-disable-next-line max-lines-per-function
export default function StartHereView() {
	return (
		<div className="home-page">
			<section className="hero" aria-labelledby="hero-header">
				<div className="hero-shell">
					<div className="hero-content">
						<span className="eyebrow">Free public learning from SDSC</span>
						<h1 id="hero-header">Find the training that moves your work forward</h1>
						<p className="lede">
							Explore practical HPC (High Performance Computing) learning paths, system guides,
							recordings, and supporting resources without needing to know where SDSC originally
							published them.
						</p>
					</div>
					<div className="hero-actions" aria-label="Choose how to begin">
						<Link className="route-action" href="/materials">
							<strong>Find training</strong>
							<span>Search by topic, tool, system, or format.</span>
						</Link>
						<Link className="route-action" href="/learning-paths">
							<strong>New to HPC? Start here</strong>
							<span>Follow a short, guided learning path.</span>
						</Link>
						<Link className="route-action" href="/my-learning/conversations">
							<strong>Ask AIDA</strong>
							<span>Don't know where to start? Ask our AI discovery agent for help.</span>
						</Link>
					</div>
				</div>
			</section>

			<section className="section section--compact section--blue" aria-labelledby="browse-heading">
				<div className="section-shell">
					<div className="section-heading section-heading--split">
						<div>
							<span className="eyebrow">Browse without jargon</span>
							<h2 id="browse-heading">Start with something you recognize.</h2>
							<p>Choose a system, subject, or tool. The library will apply the matching filter for you.</p>
						</div>
						<Link className="text-link" href="/materials">See the full Training Library →</Link>
					</div>
					<EmptyCollection {...emptyCollections[0]} />
				</div>
			</section>

			<section className="section" aria-labelledby="featured-heading">
				<div className="section-shell">
					<div className="section-heading">
						<span className="eyebrow">Good places to begin</span>
						<h2 id="featured-heading">Featured training</h2>
						<p>See the most popular and useful training materials in the library.</p>
					</div>
					<EmptyCollection {...emptyCollections[1]} />
				</div>
			</section>

			<section className="section section--compact section--sand home-upcoming" aria-labelledby="upcoming-events-heading">
				<div className="section-shell">
					<div className="section-heading section-heading--split">
						<div>
							<span className="eyebrow">Live Training</span>
							<h2 id="upcoming-events-heading">Upcoming Events</h2>
						</div>
						<Link className="text-link" href="/events">Browse Events →</Link>
					</div>
					<EmptyCollection {...emptyCollections[2]} />
				</div>
			</section>

			<section className="section section--soft" aria-labelledby="paths-heading">
				<div className="section-shell">
					<div className="section-heading">
						<span className="eyebrow">Ordered guidance</span>
						<h2 id="paths-heading">Learning paths when a catalog feels like too much.</h2>
						<p>Paths organize existing SDSC materials into a suggested sequence. They are prototypes for future curriculum design.</p>
					</div>
					<EmptyCollection {...emptyCollections[3]} />
				</div>
			</section>

			<section className="section aida-band" aria-labelledby="aida-heading">
				<div className="section-shell aida-band__layout">
					<div>
						<span className="eyebrow">AI Discovery Agent</span>
						<h2 id="aida-heading">AIDA helps you choose, then returns you to the material.</h2>
						<p className="pt-[2em] pb-[1em]">Ask a question in ordinary language. In this prototype, AIDA provides a short response and links to the same canonical training records used throughout the portal.</p>
						<Link className="button button--gold" href="/my-learning/conversations">Ask AIDA</Link>
					</div>
					<div className="aida-band__sample">
						<strong>Try asking</strong>
						<p>&quot;I am new to HPC. Where should I begin?&quot;</p>
						<p>&quot;What is Slurm?&quot;</p>
						<p>&quot;Find GPU programming training.&quot;</p>
					</div>
				</div>
			</section>

			<section className="section section--sand" aria-labelledby="programs-heading">
				<div className="section-shell">
					<div className="section-heading">
						<span className="eyebrow">Recurring programs</span>
						<h2 id="programs-heading">Understand the collections behind the material.</h2>
						<p>Programs and series connect individual sessions to a recognizable learning context.</p>
					</div>
					<EmptyCollection {...emptyCollections[4]} />
				</div>
			</section>

			<section className="section section--compact section--blue" id="account-access" aria-labelledby="account-heading">
				<div className="section-shell account-band">
					<div>
						<span className="eyebrow">Optional account</span>
						<h2 id="account-heading">Come back without starting over.</h2>
						<p>Training stays public. A free account adds bookmarks, learning paths, progress, and recent AIDA recommendations.</p>
					</div>
					<div className="account-band__actions">
						<Link className="button button--gold" href="/account?mode=create">Create account</Link>
						<Link className="button button--on-dark" href="/account">Sign in</Link>
					</div>
				</div>
			</section>
		</div>
	);
}
