const image = (id, width = 1100) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=82`;

export const HISTORY_EVENTS = [
  {
    id: "great-pyramid-of-giza",
    year: "c. 2560 BCE",
    order: -2560,
    era: "Ancient",
    title: "The Great Pyramid of Giza rises",
    place: "Giza, Egypt",
    text: "Built as a royal tomb for Khufu, the Great Pyramid became the last surviving wonder of the ancient world.",
    details: "Its construction called for careful surveying, stonework, transport, and large-scale organization. The monument remained the tallest human-made structure for thousands of years and is the only surviving wonder of the ancient world.",
    image: image("photo-1539650116574-8efeb43e2750"),
  },
  {
    id: "qins-unification-of-china",
    year: "221 BCE",
    order: -221,
    era: "Ancient",
    title: "China is unified under Qin Shi Huang",
    place: "China",
    text: "The Qin dynasty unified rival states and began a new imperial chapter in Chinese history.",
    details: "After defeating the other Warring States, Qin Shi Huang established centralized imperial rule. The Qin government standardized systems including writing, weights, measures, and currency; although the dynasty was brief, its model shaped later Chinese empires.",
    image: image("photo-1524492412937-b28074a5d7da"),
  },
  {
    id: "colosseum-opens",
    year: "80 CE",
    order: 80,
    era: "Ancient",
    title: "The Colosseum opens in Rome",
    place: "Rome, Italy",
    text: "A public celebration inaugurates the largest amphitheatre of the Roman world.",
    details: "Emperor Titus opened the Flavian Amphitheatre with games lasting many days. Its tiers, passageways, and arena made it a striking example of Roman engineering and a lasting symbol of the city.",
    image: image("photo-1552832230-c0197dd311b5"),
  },
  {
    id: "western-roman-empire-ends",
    year: "476 CE",
    order: 476,
    era: "Medieval",
    title: "The Western Roman Empire ends",
    place: "Ravenna, Italy",
    text: "The deposition of Romulus Augustulus is often used to mark the end of the Western Roman Empire.",
    details: "In 476, the Germanic leader Odoacer deposed the young emperor Romulus Augustulus. Historians use the event as a convenient marker for the end of imperial rule in the West, while the Eastern Roman Empire continued for nearly a thousand years.",
    image: image("photo-1552832230-c0197dd311b5"),
  },
  {
    id: "magna-carta-sealed",
    year: "1215",
    order: 1215,
    era: "Medieval",
    title: "Magna Carta is sealed",
    place: "Runnymede, England",
    text: "A charter agreed by King John places limits on royal authority and becomes an enduring political reference.",
    details: "The charter emerged from a dispute between King John and a group of English barons. Although it was revised and reissued, later generations drew on its language when debating law, authority, and the rights of subjects.",
    image: image("photo-1481627834876-b7833e8f5570"),
  },
  {
    id: "mansa-musa-pilgrimage",
    year: "1324",
    order: 1324,
    era: "Medieval",
    title: "Mansa Musa makes his pilgrimage",
    place: "Mali and the trans-Saharan routes",
    text: "The Mali emperor's pilgrimage to Mecca brings renewed attention to the reach and wealth of his empire.",
    details: "Mansa Musa's journey crossed North Africa on its way to Mecca. Accounts of the pilgrimage helped spread knowledge of the Mali Empire, whose trade networks and scholarly centers connected communities across West Africa and the wider world.",
    image: image("photo-1516026672322-bc52d61a55d5"),
  },
  {
    id: "constantinople-captured",
    year: "1453",
    order: 1453,
    era: "Medieval",
    title: "Constantinople changes hands",
    place: "Constantinople",
    text: "After a long siege, the city fell to the Ottomans, reshaping power across the eastern Mediterranean.",
    details: "Sultan Mehmed II's forces captured Constantinople on 29 May 1453, bringing the Byzantine Empire to an end. The city became a central Ottoman capital and the conquest reshaped politics and trade across the region.",
    image: image("photo-1541432901042-2d8bd64b4a9b"),
  },
  {
    id: "taj-mahal-construction",
    year: "1632",
    order: 1632,
    era: "Modern",
    title: "The Taj Mahal begins",
    place: "Agra, India",
    text: "A Mughal monument to love rises in Agra, taking more than two decades to complete.",
    details: "Commissioned by Mughal emperor Shah Jahan as a mausoleum for Mumtaz Mahal, the complex brought together architects, craftspeople, and materials from across the empire. Its gardens, calligraphy, and marble architecture remain part of its story.",
    image: image("photo-1524492412937-b28074a5d7da"),
  },
  {
    id: "apollo-11-moon-landing",
    year: "1969",
    order: 1969,
    era: "Modern",
    title: "Apollo 11 reaches the Moon",
    place: "Sea of Tranquility",
    text: "Apollo 11 turns one small step into a giant leap for humankind.",
    details: "On 20 July 1969, Neil Armstrong and Buzz Aldrin walked on the lunar surface while Michael Collins orbited above in the command module. The mission marked the first crewed landing on the Moon.",
    image: image("photo-1446776811953-b23d57bd21aa"),
  },
];

export function HistoryEventDetail({ eventId, backHref, createHref }) {
  const index = HISTORY_EVENTS.findIndex((event) => event.id === eventId);
  const event = HISTORY_EVENTS[index];
  const previous = index > 0 ? HISTORY_EVENTS[index - 1] : null;
  const next = index >= 0 ? HISTORY_EVENTS[index + 1] : null;

  if (!event) {
    return (
      <section className="history-detail history-detail--missing">
        <a className="studio-back" href={backHref}>← Back to the timeline</a>
        <h1>This moment could not be found.</h1>
        <p>Choose another moment from the Chronicle timeline.</p>
      </section>
    );
  }

  return (
    <article className="history-detail">
      <a className="studio-back" href={backHref}>← Back to the timeline</a>
      <header className="history-detail-heading">
        <span className="eyebrow">{event.era} · {event.place}</span>
        <h1>{event.title}</h1>
        <p>{event.year}</p>
      </header>
      <div className="history-detail-grid">
        <figure>
          <img src={event.image} alt={`Historical view related to ${event.title}`} />
          <figcaption>{event.place} · {event.year}</figcaption>
        </figure>
        <div className="history-detail-copy">
          <span className="eyebrow">THE STORY BEHIND THE MOMENT</span>
          <p className="history-detail-summary">{event.text}</p>
          <p>{event.details}</p>
          <a className="btn btn--gold" href={createHref}>Tell this history your way <span aria-hidden="true">→</span></a>
        </div>
      </div>
      <nav className="history-detail-pager" aria-label="More moments in history">
        {previous ? <a href={`/history/${previous.id}`}><small>PREVIOUS MOMENT</small><span>← {previous.title}</span></a> : <span />}
        {next ? <a className="history-detail-next" href={`/history/${next.id}`}><small>NEXT MOMENT</small><span>{next.title} →</span></a> : <span />}
      </nav>
    </article>
  );
}
