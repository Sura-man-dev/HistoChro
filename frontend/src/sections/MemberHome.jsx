import { useEffect, useRef, useState } from "react";
import { HISTORY_EVENTS } from "./HistoryPages.jsx";
import { apiRequest, BookModePage, StoryComposer, StoryDetail, notificationRequest, renderStoryText, storyRequest } from "./StoryPages.jsx";
import { LanguagePicker, useLanguage } from "../language.jsx";

const image = (id, width = 1100) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=82`;

function TaskInbox() {
  const { language } = useLanguage();
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    apiRequest("tasks")
      .then(setTasks)
      .catch((requestError) => setError(requestError.message));
  }, []);

  const updateStatus = async (task, status) => {
    setBusyId(task.id);
    setError("");
    try {
      const updated = await apiRequest("tasks", `/${task.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      setTasks((current) => current.map((item) => item.id === updated.id ? updated : item));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusyId(null);
    }
  };

  if (!tasks.length && !error) return null;
  return (
    <section className="member-task-panel" aria-labelledby="member-task-title">
      <div className="member-task-heading"><div><span className="eyebrow">YOUR CONTRIBUTIONS</span><h2 id="member-task-title">My assignments</h2></div><span>{tasks.filter((task) => task.status !== "completed").length} open</span></div>
      {error && <p className="member-feed-error" role="alert">{error}</p>}
      <div className="member-task-list">
        {tasks.map((task) => (
          <article className="member-task-card" key={task.id}>
            <div><span className={`admin-status admin-status--${task.status}`}>{task.status.replace("_", " ")}</span><h3>{task.title}</h3>{task.description && <p>{task.description}</p>}<small>Assigned by <span className="user-generated-name">{task.creator_name}</span>{task.due_at ? ` · Due ${new Date(task.due_at * 1000).toLocaleDateString(language === "am" ? "am-ET" : "en-US")}` : ""}</small></div>
            <label className="member-task-status">Progress
              <select value={task.status} disabled={busyId === task.id} onChange={(event) => updateStatus(task, event.target.value)}>
                <option value="pending">Not started</option><option value="in_progress">In progress</option><option value="completed">Completed</option>
              </select>
            </label>
          </article>
        ))}
      </div>
    </section>
  );
}

export default function MemberHome({ user, onLogout, page = "home", storyId }) {
  const { t, language } = useLanguage();
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [communityStories, setCommunityStories] = useState([]);
  const [storiesError, setStoriesError] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationError, setNotificationError] = useState("");
  const [liveNotice, setLiveNotice] = useState(null);
  const [likingStoryIds, setLikingStoryIds] = useState([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(() => localStorage.getItem("chronicle_sidebar_open") !== "false");
  const previousNotificationIds = useRef(null);
  const [timelineEra, setTimelineEra] = useState("All eras");
  const firstName = user?.name?.trim().split(/\s+/)[0] || "Historian";
  const today = new Intl.DateTimeFormat(language === "am" ? "am-ET" : "en", { weekday: "long", month: "long", day: "numeric" }).format(new Date());
  const timelineEras = ["All eras", ...new Set(HISTORY_EVENTS.map((event) => event.era))];
  const visibleEvents = HISTORY_EVENTS.filter((event) => timelineEra === "All eras" || event.era === timelineEra)
    .sort((a, b) => a.order - b.order);
  useEffect(() => {
    storyRequest("")
      .then(setCommunityStories)
      .catch((error) => setStoriesError(error.message));
  }, []);
  useEffect(() => {
    let active = true;
    let fetching = false;
    const refreshNotifications = async () => {
      if (fetching || document.visibilityState === "hidden") return;
      fetching = true;
      try {
        const result = await notificationRequest();
        if (!active) return;
        const items = result.items || [];
        const previousIds = previousNotificationIds.current;
        const latestNewNotification = previousIds
          ? items.find((item) => !item.read && !previousIds.has(item.id))
          : null;
        previousNotificationIds.current = new Set(items.map((item) => item.id));
        setNotifications(items);
        setUnreadCount(result.unread_count);
        setNotificationError("");
        if (latestNewNotification) setLiveNotice(latestNewNotification);
      } catch (error) {
        if (active) setNotificationError(error.message);
      } finally {
        fetching = false;
      }
    };
    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") refreshNotifications();
    };
    refreshNotifications();
    const interval = window.setInterval(refreshWhenVisible, 8000);
    document.addEventListener("visibilitychange", refreshWhenVisible);
    window.addEventListener("focus", refreshWhenVisible);
    return () => {
      active = false;
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
      window.removeEventListener("focus", refreshWhenVisible);
    };
  }, []);
  useEffect(() => {
    if (!liveNotice) return undefined;
    const timeout = window.setTimeout(() => setLiveNotice(null), 7000);
    return () => window.clearTimeout(timeout);
  }, [liveNotice]);
  const displayStories = communityStories.map((story) => ({
    ...story,
    user: story.author.name,
    handle: `@${story.author.name.toLowerCase().replace(/\s+/g, "_")}`,
    time: new Date(story.created_at * 1000).toLocaleDateString(language === "am" ? "am-ET" : "en-US"),
    text: story.body || story.chapters?.[0]?.text || story.timeline_events?.[0]?.text || "",
    img: story.media_url,
  }));
  const filteredStories = displayStories.filter((story) =>
    `${story.user} ${story.handle} ${story.era} ${story.text}`.toLowerCase().includes(searchQuery.trim().toLowerCase())
  );
  const toggleNotifications = () => {
    setNotificationsOpen((open) => !open);
    setProfileOpen(false);
  };

  const markNotificationsRead = async () => {
    try {
      await notificationRequest("/read", { method: "POST" });
      setUnreadCount(0);
      setNotifications((current) => current.map((item) => ({ ...item, read: true })));
    } catch (error) {
      setNotificationError(error.message);
    }
  };

  const openNotification = async (notification) => {
    if (!notification.read) {
      try {
        await notificationRequest(`/${notification.id}/read`, { method: "POST" });
        setNotifications((current) => current.map((item) => item.id === notification.id ? { ...item, read: true } : item));
        setUnreadCount((count) => Math.max(0, count - 1));
      } catch (error) {
        setNotificationError(error.message);
      }
    }
  };

  const toggleProfile = () => {
    setProfileOpen((open) => !open);
    setNotificationsOpen(false);
  };

  const toggleSidebar = () => {
    setSidebarOpen((open) => {
      localStorage.setItem("chronicle_sidebar_open", String(!open));
      return !open;
    });
  };

  const closeSidebar = () => {
    localStorage.setItem("chronicle_sidebar_open", "false");
    setSidebarOpen(false);
  };

  const likeStory = async (story) => {
    if (likingStoryIds.includes(story.id)) return;
    setLikingStoryIds((current) => [...current, story.id]);
    try {
      const result = await storyRequest(`/${story.id}/like`, { method: "POST" });
      setCommunityStories((current) => current.map((item) => item.id === story.id ? { ...item, liked: result.liked, likes: result.likes } : item));
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLikingStoryIds((current) => current.filter((id) => id !== story.id));
    }
  };

  const shareStory = async (story) => {
    const url = new URL(`/story/${story.id}`, window.location.origin).href;
    try {
      if (navigator.share) {
        await navigator.share({ title: story.title, text: `Read “${story.title}” on Chronicle`, url });
      } else {
        await navigator.clipboard.writeText(url);
        setMessage("Story link copied. Share it with someone who loves history.");
      }
    } catch (error) {
      if (error.name !== "AbortError") setMessage(`Couldn't share automatically. Copy this story link: ${url}`);
    }
  };

  return (
    <div className="member-home">
      <header className="member-topbar">
        <div className="member-brand-menu">
          <button
            type="button"
            className={`member-menu-button ${sidebarOpen ? "is-open" : ""}`}
            aria-label={sidebarOpen ? "Close side menu" : "Open side menu"}
            aria-controls="member-sidebar"
            aria-expanded={sidebarOpen}
            onClick={toggleSidebar}
          ><span /><span /><span /></button>
          <a className="logo" href="/home" aria-label="Chronicle home"><img className="logo__mark" src="/favicon.svg" alt="" aria-hidden="true" /> Chronicle</a>
        </div>
        <nav aria-label="Main navigation" className="member-toplinks">
          <a className={page === "home" ? "active" : ""} href="/home">{t("Discover")}</a>
          <a className={page === "timeline" ? "active" : ""} href="/timeline">{t("Timeline")}</a>
          <a className={page === "book" ? "active" : ""} href="/book">{t("Book Mode")}</a>
        </nav>
        <div className="member-actions">
          <LanguagePicker />
          <a className="member-create-link" href="/create" aria-label="Create a story" title="Create a story"><span aria-hidden="true">＋</span> Create story</a>
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
                {notificationError && <p className="member-notification-error" role="alert">{notificationError}</p>}
                {notifications.length ? notifications.map((notification) => (
                  <a
                    className={`member-notification ${notification.read ? "is-read" : "is-unread"}`}
                    href={`/story/${notification.story_id}`}
                    key={notification.id}
                    onClick={async (event) => {
                      event.preventDefault();
                      await openNotification(notification);
                      window.location.assign(`/story/${notification.story_id}`);
                    }}
                  >
                    <span className={`notification-avatar ${notification.kind === "comment" ? "notification-avatar--community" : ""}`} aria-hidden="true">{notification.kind === "comment" ? "◌" : "♥"}</span>
                    <span className="member-notification-copy"><strong>{notification.actor_name} {notification.message}</strong><small>{notification.story_title} · {new Date(notification.created_at * 1000).toLocaleString(language === "am" ? "am-ET" : "en-US")}</small></span>
                    {!notification.read && <span className="notification-unread-dot" aria-label="Unread" />}
                  </a>
                )) : !notificationError && <p className="member-notifications-empty">No notifications yet. Likes and comments on your stories will appear here.</p>}
                {unreadCount > 0 && <button className="member-popover-action" type="button" onClick={markNotificationsRead}>Mark all as read</button>}
              </section>
            )}
          </div>
          <div className="member-action-wrap">
            <a
              className="member-profile-button"
              aria-label={t("Home")}
              href="/home"
            >
              <span className="member-avatar">{firstName[0].toUpperCase()}</span>
              <span className="member-profile-copy"><strong className="member-profile-name user-generated-name">{firstName}</strong><small>{t("Home")}</small></span>
            </a>
            <button type="button" className="member-signout" onClick={onLogout}>{t("Sign out")}</button>
          </div>
        </div>
      </header>

      <div className={`member-layout ${sidebarOpen ? "" : "member-layout--sidebar-closed"}`}>
        <aside className="member-sidebar" id="member-sidebar" aria-label="Your Chronicle">
          <div className="member-sidebar-heading">
            <span className="member-sidebar-label">YOUR CHRONICLE</span>
          </div>
          <a onClick={closeSidebar} className={page === "home" ? "selected" : ""} aria-current={page === "home" ? "page" : undefined} href="/home" title="For you"><span>✦</span><span className="sidebar-link-label">For you</span></a>
          <a onClick={closeSidebar} className={page === "timeline" ? "selected" : ""} aria-current={page === "timeline" ? "page" : undefined} href="/timeline" title="Explore timeline"><span>◷</span><span className="sidebar-link-label">Explore timeline</span></a>
          <a onClick={closeSidebar} href={page === "home" ? "#member-feed" : "/home#member-feed"} title="Community feed"><span>◎</span><span className="sidebar-link-label">Community feed</span></a>
          <a onClick={closeSidebar} className={page === "book" ? "selected" : ""} aria-current={page === "book" ? "page" : undefined} href="/book" title="Book Mode"><span>▣</span><span className="sidebar-link-label">Book Mode</span></a>
          <a onClick={closeSidebar} className={page === "create" ? "selected" : ""} aria-current={page === "create" ? "page" : undefined} href="/create" title="Create a story"><span>＋</span><span className="sidebar-link-label">Create a story</span></a>
          {user?.is_admin && <a onClick={closeSidebar} href="/admin" title="Administration"><span>⚙</span><span className="sidebar-link-label">Administration</span></a>}
          <a onClick={closeSidebar} href={page === "home" ? "#member-reading" : "/home#member-reading"} title="Reading room"><span>▤</span><span className="sidebar-link-label">Reading room</span></a>
          <div className="sidebar-streak"><span>🔥</span><div><strong>1 day streak</strong><small>Keep your curiosity going</small></div></div>
          <div className="sidebar-note"><span className="eyebrow">TODAY'S PROMPT</span><p>What moment in history would you love to witness?</p><a href={page === "home" ? "#member-feed" : "/home#member-feed"}>Explore the stories →</a></div>
        </aside>

        <main className="member-main">
          {page === "create" ? <StoryComposer /> : page === "story" ? <StoryDetail storyId={storyId} /> : page === "book" ? <BookModePage stories={communityStories} error={storiesError} /> : page === "timeline" ? (
            <section className="member-history-page">
              <a className="studio-back" href="/home">← Back to your Chronicle</a>
              <div className="member-greeting"><div><span className="eyebrow">THE CHRONICLE ARCHIVE</span><h1>History unfolds, moment by moment.</h1><p>Explore curated landmarks and visual stories shared by the community.</p></div><a className="btn btn--gold" href="/create">＋ Build a timeline</a></div>
              {communityStories.filter((story) => story.format === "timeline").map((story) => (
                <article className="shared-timeline" key={story.id}>
                  <header><span className="member-tag">{story.era} · {story.place || "Community timeline"}</span>{story.status !== "approved" && <span className={`admin-status admin-status--${story.status}`}>{story.status === "pending" ? "under review" : "revision requested"}</span>}<a href={`/story/${story.id}`}>Open story ↗</a></header>
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
          <div className="member-greeting"><div><span className="eyebrow">{today.toUpperCase()}</span><h1>{t("Welcome back,")} <span className="user-generated-name">{firstName}</span>.</h1><p>A little more wonder from the past is waiting for you.</p></div><a className="member-streak" href="/#features"><span>🔥</span><strong>1 day</strong><small>current streak</small></a></div>
          <TaskInbox />

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
                      <a className="history-event-link" href={`/history/${event.id}`}>Explore this moment <span aria-hidden="true">↗</span></a>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <div className="member-feed-heading"><div><span className="eyebrow">FROM THE COMMUNITY</span><h2>Stories worth your time</h2></div><a href="#member-feed">Explore all <span aria-hidden="true">→</span></a></div>
          {message && <p className="member-toast" role="status">{message}<button aria-label="Dismiss message" onClick={() => setMessage("")}>×</button></p>}
          {liveNotice && <div className="member-live-notice" role="status"><a href={`/story/${liveNotice.story_id}`} onClick={async (event) => { event.preventDefault(); await openNotification(liveNotice); window.location.assign(`/story/${liveNotice.story_id}`); }}><span className="member-live-notice-icon">{liveNotice.kind === "comment" ? "◌" : "♥"}</span><span><strong>{liveNotice.actor_name} {liveNotice.message}</strong><small>{liveNotice.story_title}</small></span></a><button type="button" aria-label="Dismiss notification" onClick={() => setLiveNotice(null)}>×</button></div>}
          {searchQuery && <p className="member-search-status" role="status">{filteredStories.length} {filteredStories.length === 1 ? "story" : "stories"} found</p>}
          <section className="member-feed" id="member-feed" aria-label="Community stories">
            {storiesError && <p className="member-feed-error" role="alert">{storiesError}</p>}
            {filteredStories.map((story, index) => (
              <article className="member-post" key={story.id || story.handle}>
                <header><span className="member-post-avatar" style={{ "--avatar-hue": `${index * 82 + 30}deg` }}>{story.user[0]}</span><div><strong>{story.user}</strong><small>{story.handle} · {story.time}</small></div><span className="member-tag member-tag--small">{story.era}</span></header>
                  {story.status !== "approved" && <div className={`member-post-review member-post-review--${story.status}`}><strong>{story.status === "rejected" ? "Revision requested" : "Awaiting review"}</strong><span>{story.moderation_note || "Only you and administrators can see this post until it is approved."}</span></div>}
                  <a className="member-post-title" href={`/story/${story.id}`}>{story.title}</a>
                  {story.text && <div className="member-post-copy">{renderStoryText(story.text)}</div>}
                {story.img && (story.media_type?.startsWith("video/") ? <video className="member-post-image" src={story.img} controls preload="metadata" /> : <img className="member-post-image" src={story.img} alt={`Historical story shared by ${story.user}`} loading="lazy" />)}
                  {story.format === "timeline" && <div className="member-post-timeline">{story.timeline_events.slice(0, 3).map((event, eventIndex) => <p key={`${event.year}-${eventIndex}`}><strong>{event.year}</strong> {event.title}</p>)}<a href={`/story/${story.id}`}>View full timeline →</a></div>}
                  <div className="member-post-meta"><span>◉ {story.views} views</span></div>
                  <footer aria-label="Story actions"><button type="button" aria-label={`${story.liked ? "Unlike" : "Like"} ${story.title}`} aria-pressed={story.liked} className={story.liked ? "is-liked" : ""} disabled={likingStoryIds.includes(story.id)} onClick={() => likeStory(story)}>{story.liked ? "♥" : "♡"} <span>{story.likes} {story.likes === 1 ? "Like" : "Likes"}</span></button><a href={`/story/${story.id}#story-comments`}>◌ <span>{story.comments_count} {story.comments_count === 1 ? "Comment" : "Comments"}</span></a><button type="button" onClick={() => shareStory(story)}>↗ <span>Share</span></button></footer>
              </article>
            ))}
              {filteredStories.length === 0 && (searchQuery
                ? <p className="member-empty-search">No stories match “{searchQuery}”. Try another name, era, or topic.</p>
                : <div className="member-empty-search"><h3>Your community feed starts with a story.</h3><p>Share a historical moment, then like, discuss, and pass it along.</p><a className="btn btn--gold" href="/create">Create your first story →</a></div>
              )}
          </section>

          <section className="member-reading" id="member-reading" style={{ "--reading-image": `url(${image("photo-1481627834876-b7833e8f5570", 900)})` }}>
            <div><span className="eyebrow">PICK UP WHERE YOU LEFT OFF</span><h2>A world between two covers.</h2><p>Continue your journey through the rise and fall of Rome.</p><a href="#member-timeline">Continue reading <span aria-hidden="true">→</span></a></div>
          </section>
      <footer className="member-footer">© {new Date().getFullYear()} Chronicle <span>Curiosity connects us across time.</span><nav aria-label="Policies and help"><a href="/faq">FAQ</a><a href="/terms">Terms</a><a href="/privacy">Privacy</a><a href="/community-policy">Community policy</a></nav></footer>
          </>}
        </main>
      </div>
    </div>
  );
}
