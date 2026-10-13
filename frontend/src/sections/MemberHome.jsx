import { useEffect, useState } from "react";
import { BookModePage, StoryComposer, StoryDetail, storyRequest } from "./StoryPages.jsx";

const image = (id, width = 1100) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=82`;

const HISTORY_EVENTS = [
  {
    year: "c. 2560 BCE",
    order: -2560,
    era: "Ancient",
    title: "The Great Pyramid of Giza rises",
    place: "Giza, Egypt",
    text: "Built as a royal tomb for Khufu, the Great Pyramid became the last surviving wonder of the ancient world.",
    image: image("photo-1539650116574-8efeb43e2750"),
  },
  {
    year: "221 BCE",
    order: -221,
    era: "Ancient",
    title: "China is unified under Qin Shi Huang",
    place: "China",
    text: "The Qin dynasty unified rival states and began a new imperial chapter in Chinese history.",
    image: image("photo-1524492412937-b28074a5d7da"),
  },
  {
    year: "476 CE",
    order: 476,
    era: "Medieval",
    title: "The Western Roman Empire ends",
    place: "Ravenna, Italy",
    text: "The deposition of Romulus Augustulus is often used to mark the end of the Western Roman Empire.",
    image: image("photo-1552832230-c0197dd311b5"),
  },
  {
    year: "1453",
    order: 1453,
    era: "Medieval",
    title: "Constantinople changes hands",
    place: "Constantinople",
    text: "After a long siege, the city fell to the Ottomans, reshaping power across the eastern Mediterranean.",
    image: image("photo-1541432901042-2d8bd64b4a9b"),
  },
  {
    year: "1969",
    order: 1969,
    era: "Modern",
    title: "Apollo 11 reaches the Moon",
    place: "Sea of Tranquility",
    text: "Neil Armstrong and Buzz Aldrin walked on the lunar surface during humanity's first crewed Moon landing.",
    image: image("photo-1446776811953-b23d57bd21aa"),
  },
];

export default function MemberHome({ user, stories, onLogout, page = "home", storyId }) {
  const [liked, setLiked] = useState({});
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [communityStories, setCommunityStories] = useState([]);
  const [storiesError, setStoriesError] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsRead, setNotificationsRead] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => localStorage.getItem("chronicle_sidebar_collapsed") === "true");
  const [timelineEra, setTimelineEra] = useState("All eras");
  const firstName = user?.name?.trim().split(/\s+/)[0] || "Historian";
  const today = new Intl.DateTimeFormat("en", { weekday: "long", month: "long", day: "numeric" }).format(new Date());
  const timelineEras = ["All eras", ...new Set(HISTORY_EVENTS.map((event) => event.era))];
  const visibleEvents = HISTORY_EVENTS.filter((event) => timelineEra === "All eras" || event.era === timelineEra)
    .sort((a, b) => a.order - b.order);
  useEffect(() => {
    storyRequest("")
      .then(setCommunityStories)
      .catch((error) => setStoriesError(error.message));
  }, []);
  const displayStories = [
    ...communityStories.map((story) => ({
      ...story,
      user: story.author.name,
      handle: `@${story.author.name.toLowerCase().replace(/\s+/g, "_")}`,
      time: new Date(story.created_at * 1000).toLocaleDateString(),
      text: story.body,
      img: story.media_url,
    })),
    ...stories,
  ];
  const filteredStories = displayStories.filter((story) =>
    `${story.user} ${story.handle} ${story.era} ${story.text}`.toLowerCase().includes(searchQuery.trim().toLowerCase())
  );
  const unreadCount = notificationsRead ? 0 : 2;

  const toggleNotifications = () => {
    setNotificationsOpen((open) => !open);
    setProfileOpen(false);
  };

  const toggleProfile = () => {
    setProfileOpen((open) => !open);
    setNotificationsOpen(false);
  };

  const toggleSidebar = () => {
    setSidebarCollapsed((collapsed) => {
      localStorage.setItem("chronicle_sidebar_collapsed", String(!collapsed));
      return !collapsed;
    });
  };

  const likeStory = async (story) => {
    if (!story.id) {
      setLiked((current) => ({ ...current, [story.handle]: !current[story.handle] }));
      return;
    }
    try {
      const result = await storyRequest(`/${story.id}/like`, { method: "POST" });
      setCommunityStories((current) => current.map((item) => item.id === story.id ? { ...item, liked: result.liked, likes: result.likes } : item));
    } catch (error) {
      setMessage(error.message);
    }
  };

  const shareStory = async (story) => {
    try {
      await navigator.clipboard.writeText(`${story.text} — Chronicle`);
      setMessage("Story copied. Share it with someone who loves history.");
    } catch {
      setMessage("Select and copy this story to share it with your community.");
    }
  };

  return (
    <div className="member-home">
      <header className="member-topbar">
        <a className="logo" href="/home" aria-label="Chronicle home"><img className="logo__mark" src="/favicon.svg" alt="" aria-hidden="true" /> Chronicle</a>
        <nav aria-label="Main navigation" className="member-toplinks">
          <a className={page === "home" ? "active" : ""} href="/home">Discover</a>
          <a className={page === "timeline" ? "active" : ""} href="/timeline">Timeline</a>
          <a className={page === "book" ? "active" : ""} href="/book">Book Mode</a>
        </nav>
        <div className="member-actions">
          <a className="member-create-link" href="/create"><span aria-hidden="true">＋</span> Create story</a>
          <label className="member-search">
            <span aria-hidden="true">⌕</span>
            <input
              type="search"
              aria-label="Search community stories"
              placeholder="Search stories"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
            {searchQuery && <button type="button" aria-label="Clear search" onClick={() => setSearchQuery("")}>×</button>}
          </label>
          <div className="member-action-wrap">
            <button
              type="button"
              className={`member-icon-button ${notificationsOpen ? "is-open" : ""}`}
              aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
              aria-haspopup="dialog"
              aria-expanded={notificationsOpen}
              onClick={toggleNotifications}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></svg>
              {unreadCount > 0 && <span className="member-notification-count">{unreadCount}</span>}
            </button>
            {notificationsOpen && (
              <section className="member-popover member-notifications" role="dialog" aria-label="Notifications">
                <header><strong>Notifications</strong><span>{unreadCount ? `${unreadCount} new` : "You're all caught up"}</span></header>
                <div className={`member-notification ${notificationsRead ? "is-read" : ""}`}>
                  <span className="notification-avatar">✦</span>
                  <p><strong>Your daily discovery is ready</strong><small>A new story from Ancient Egypt is waiting for you.</small></p>
                </div>
                <div className={`member-notification ${notificationsRead ? "is-read" : ""}`}>
                  <span className="notification-avatar notification-avatar--community">◎</span>
                  <p><strong>The community is talking</strong><small>History lovers shared fresh stories for you to explore.</small></p>
                </div>
                <button className="member-popover-action" type="button" onClick={() => setNotificationsRead(true)}>Mark all as read</button>
              </section>
            )}
          </div>
          <div className="member-action-wrap">
            <button
              type="button"
              className="member-profile-button"
              aria-label={`Open ${firstName}'s profile menu`}
              aria-haspopup="menu"
              aria-expanded={profileOpen}
              onClick={toggleProfile}
            >
              <span className="member-avatar">{firstName[0].toUpperCase()}</span>
              <span className="member-profile-name">{firstName}</span>
              <span className="member-profile-chevron" aria-hidden="true">⌄</span>
            </button>
            {profileOpen && (
              <div className="member-popover member-profile-menu" role="menu">
                <div className="member-profile-details"><strong>{user?.name}</strong><small>{user?.email}</small></div>
                <button type="button" role="menuitem" onClick={onLogout}>Sign out</button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className={`member-layout ${sidebarCollapsed ? "member-layout--collapsed" : ""}`}>
        <aside className="member-sidebar" aria-label="Your Chronicle">
          <div className="member-sidebar-heading">
            <span className="member-sidebar-label">YOUR CHRONICLE</span>
            <button
              className="member-sidebar-toggle"
              type="button"
              aria-label={sidebarCollapsed ? "Expand side menu" : "Collapse side menu"}
              aria-expanded={!sidebarCollapsed}
              onClick={toggleSidebar}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d={sidebarCollapsed ? "m9 18 6-6-6-6" : "m15 18-6-6 6-6"} /></svg>
            </button>
          </div>
          <a className={page === "home" ? "selected" : ""} aria-current={page === "home" ? "page" : undefined} href="/home" title="For you"><span>✦</span><span className="sidebar-link-label">For you</span></a>
          <a className={page === "timeline" ? "selected" : ""} aria-current={page === "timeline" ? "page" : undefined} href="/timeline" title="Explore timeline"><span>◷</span><span className="sidebar-link-label">Explore timeline</span></a>
          <a href={page === "home" ? "#member-feed" : "/home#member-feed"} title="Community feed"><span>◎</span><span className="sidebar-link-label">Community feed</span></a>
          <a className={page === "book" ? "selected" : ""} aria-current={page === "book" ? "page" : undefined} href="/book" title="Book Mode"><span>▣</span><span className="sidebar-link-label">Book Mode</span></a>
          <a className={page === "create" ? "selected" : ""} aria-current={page === "create" ? "page" : undefined} href="/create" title="Create a story"><span>＋</span><span className="sidebar-link-label">Create a story</span></a>
          <a href={page === "home" ? "#member-feed" : "/home#member-feed"} title="Reading room"><span>▤</span><span className="sidebar-link-label">Reading room</span></a>
          <div className="sidebar-streak"><span>🔥</span><div><strong>1 day streak</strong><small>Keep your curiosity going</small></div></div>
          <div className="sidebar-note"><span className="eyebrow">TODAY'S PROMPT</span><p>What moment in history would you love to witness?</p><a href="#member-feed">Explore the stories →</a></div>
        </aside>

        <main className="member-main">
          {page === "create" ? <StoryComposer /> : page === "story" ? <StoryDetail storyId={storyId} /> : page === "book" ? <BookModePage stories={communityStories} error={storiesError} /> : page === "timeline" ? (
            <section className="member-history-page">
              <a className="studio-back" href="/home">← Back to your Chronicle</a>
              <div className="member-greeting"><div><span className="eyebrow">THE CHRONICLE ARCHIVE</span><h1>History unfolds, moment by moment.</h1><p>Explore curated landmarks and visual stories shared by the community.</p></div><a className="btn btn--gold" href="/create">＋ Build a timeline</a></div>
              {communityStories.filter((story) => story.format === "timeline").map((story) => (
                <article className="shared-timeline" key={story.id}>
                  <header><span className="member-tag">{story.era} · {story.place || "Community timeline"}</span><a href={`/story/${story.id}`}>Open story ↗</a></header>
                  <h2>{story.title}</h2><p>{story.body}</p>
                  <div className="shared-timeline-events">{story.timeline_events.map((event, index) => <div className="shared-timeline-event" key={`${event.year}-${index}`}><time>{event.year}</time><span className="history-event-marker">{String(index + 1).padStart(2, "0")}</span><div>{event.media_url && <img src={event.media_url} alt={`Visual for ${event.title}`} loading="lazy" />}<h3>{event.title}</h3><p>{event.text}</p></div></div>)}</div>
                  <a href={`/story/${story.id}`} className="shared-timeline-link">Read {story.views} views · {story.likes} likes · {story.comments_count} comments</a>
                </article>
              ))}
              {communityStories.filter((story) => story.format === "timeline").length === 0 && <p className="member-timeline-empty">No community timelines yet. Start one with the “Build a timeline” button.</p>}
              <section className="member-history" aria-labelledby="member-history-title">
                <div className="member-history-heading"><div><span className="eyebrow">EDITOR'S SELECTION</span><h2 id="member-history-title">Milestones across the ages.</h2><p>A few turning points to begin your journey through the Chronicle archive.</p></div></div>
                <div className="member-history-list">
                  {visibleEvents.map((event, index) => (
                    <article className="history-event" key={event.year}>
                      <div className="history-event-date"><strong>{event.year}</strong><span>{event.era}</span></div>
                      <span className="history-event-marker" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                      <div className="history-event-card"><img src={event.image} alt={`Historical view related to ${event.title}`} loading="lazy" /><div className="history-event-copy"><span className="history-event-place">{event.place}</span><h3>{event.title}</h3><p>{event.text}</p></div></div>
                    </article>
                  ))}
                </div>
              </section>
            </section>
          ) : <>
          <div className="member-greeting"><div><span className="eyebrow">{today.toUpperCase()}</span><h1>Welcome back, {firstName}.</h1><p>A little more wonder from the past is waiting for you.</p></div><a className="member-streak" href="/#features"><span>🔥</span><strong>1 day</strong><small>current streak</small></a></div>

          <section className="member-feature" style={{ "--member-image": `url(${image("photo-1539650116574-8efeb43e2750", 1500)})` }}>
            <div className="member-feature-copy"><span className="member-tag">TODAY'S DISCOVERY · ANCIENT EGYPT</span><h2>How did the Great Pyramid stand for 4,500 years?</h2><p>Explore the ingenuity, people, and ambition behind one of humanity's most enduring monuments.</p><a className="btn btn--gold" href="#member-timeline">Explore this story <span aria-hidden="true">→</span></a></div>
            <span className="member-feature-year">c. 2560 BC</span>
          </section>

          <section className="member-metrics" aria-label="Your Chronicle activity">
            <div><span className="metric-icon">◷</span><span><strong>5,000+</strong><small>years to explore</small></span></div>
            <div><span className="metric-icon">✦</span><span><strong>190</strong><small>countries represented</small></span></div>
            <div><span className="metric-icon">▤</span><span><strong>3</strong><small>stories in your reading list</small></span></div>
          </section>

          <section className="member-history" id="member-timeline" aria-labelledby="member-history-title">
            <div className="member-history-heading">
              <div><span className="eyebrow">A JOURNEY THROUGH TIME</span><h2 id="member-history-title">History, in its own words.</h2><p>Follow the moments that changed how people lived, built, and imagined the future.</p></div>
              <label className="member-era-filter">Explore by era
                <select value={timelineEra} onChange={(event) => setTimelineEra(event.target.value)}>
                  {timelineEras.map((era) => <option key={era} value={era}>{era}</option>)}
                </select>
              </label>
            </div>
            <div className="member-history-list">
              {visibleEvents.map((event, index) => (
                <article className="history-event" key={event.year}>
                  <div className="history-event-date"><strong>{event.year}</strong><span>{event.era}</span></div>
                  <span className="history-event-marker" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                  <div className="history-event-card">
                    <img src={event.image} alt={`Historical view related to ${event.title}`} loading="lazy" />
                    <div className="history-event-copy">
                      <span className="history-event-place">{event.place}</span>
                      <h3>{event.title}</h3>
                      <p>{event.text}</p>
                      <span className="history-event-link">Explore this moment <span aria-hidden="true">↗</span></span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <div className="member-feed-heading"><div><span className="eyebrow">FROM THE COMMUNITY</span><h2>Stories worth your time</h2></div><a href="#member-feed">Explore all <span aria-hidden="true">→</span></a></div>
          {message && <p className="member-toast" role="status">{message}<button aria-label="Dismiss message" onClick={() => setMessage("")}>×</button></p>}
          {searchQuery && <p className="member-search-status" role="status">{filteredStories.length} {filteredStories.length === 1 ? "story" : "stories"} found</p>}
          <section className="member-feed" id="member-feed" aria-label="Community stories">
            {storiesError && <p className="member-feed-error" role="alert">{storiesError}</p>}
            {filteredStories.map((story, index) => (
              <article className="member-post" key={story.id || story.handle}>
                <header><span className="member-post-avatar" style={{ "--avatar-hue": `${index * 82 + 30}deg` }}>{story.user[0]}</span><div><strong>{story.user}</strong><small>{story.handle} · {story.time}</small></div><span className="member-tag member-tag--small">{story.era}</span></header>
                {story.id && <a className="member-post-title" href={`/story/${story.id}`}>{story.title}</a>}
                <p>{story.text}</p>
                {story.img && (story.media_type?.startsWith("video/") ? <video className="member-post-image" src={story.img} controls preload="metadata" /> : <img className="member-post-image" src={story.img} alt={`Historical story shared by ${story.user}`} loading="lazy" />)}
                {story.id && story.format === "timeline" && <div className="member-post-timeline">{story.timeline_events.slice(0, 3).map((event, eventIndex) => <p key={`${event.year}-${eventIndex}`}><strong>{event.year}</strong> {event.title}</p>)}<a href={`/story/${story.id}`}>View full timeline →</a></div>}
                <footer><button aria-pressed={story.id ? story.liked : Boolean(liked[story.handle])} className={(story.id ? story.liked : liked[story.handle]) ? "is-liked" : ""} onClick={() => likeStory(story)}>{(story.id ? story.liked : liked[story.handle]) ? "♥" : "♡"} <span>{story.likes}</span></button><a href={story.id ? `/story/${story.id}` : "#member-feed"}>◌ <span>{story.comments_count ?? story.comments} comments</span></a>{story.id && <span className="member-post-views">◉ {story.views} views</span>}<button onClick={() => shareStory(story)}>↗ <span>Share</span></button></footer>
              </article>
            ))}
            {filteredStories.length === 0 && <p className="member-empty-search">No stories match “{searchQuery}”. Try another name, era, or topic.</p>}
          </section>

          <section className="member-reading" id="member-reading" style={{ "--reading-image": `url(${image("photo-1481627834876-b7833e8f5570", 900)})` }}>
            <div><span className="eyebrow">PICK UP WHERE YOU LEFT OFF</span><h2>A world between two covers.</h2><p>Continue your journey through the rise and fall of Rome.</p><a href="#member-timeline">Continue reading <span aria-hidden="true">→</span></a></div>
          </section>
          <footer className="member-footer">© {new Date().getFullYear()} Chronicle <span>Curiosity connects us across time.</span></footer>
          </>}
        </main>
      </div>
    </div>
  );
}
