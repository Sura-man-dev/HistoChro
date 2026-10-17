import { useEffect, useMemo, useState } from "react";
import { apiRequest, renderStoryText } from "./StoryPages.jsx";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "users", label: "Users" },
  { id: "stories", label: "Post review" },
  { id: "tasks", label: "Assignments" },
  { id: "ai", label: "AI studio" },
];

const STORY_FORMATS = ["all", "blog", "timeline", "media", "book"];
const STORY_STATUSES = ["all", "pending", "approved", "rejected"];
const TASK_STATUSES = ["pending", "in_progress", "completed"];

function ErrorMessage({ children }) {
  return children ? <p className="admin-error" role="alert">{children}</p> : null;
}

function Metric({ label, value, detail }) {
  return <article className="admin-metric"><span>{label}</span><strong>{value ?? "—"}</strong><small>{detail}</small></article>;
}

function StoryDescription(story) {
  if (story.body) return story.body;
  if (story.chapters?.length) return story.chapters.map((chapter) => `${chapter.title}\n${chapter.text}`).join("\n\n");
  if (story.timeline_events?.length) return story.timeline_events.map((event) => `${event.year} · ${event.title}\n${event.text}`).join("\n\n");
  return "This post contains an image or video.";
}

export default function AdminDashboard({ user, onLogout }) {
  const [tab, setTab] = useState("overview");
  const [overview, setOverview] = useState(null);
  const [users, setUsers] = useState([]);
  const [stories, setStories] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [aiConfigured, setAiConfigured] = useState(false);
  const [formatFilter, setFormatFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("pending");
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  const [notes, setNotes] = useState({});
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiFormat, setAiFormat] = useState("blog");
  const [aiDraft, setAiDraft] = useState("");
  const [notice, setNotice] = useState("");

  const loadOverview = async () => {
    const result = await apiRequest("admin", "/overview");
    setOverview(result);
  };

  useEffect(() => {
    let active = true;
    Promise.all([apiRequest("admin", "/overview"), apiRequest("admin", "/ai/status")])
      .then(([stats, ai]) => {
        if (!active) return;
        setOverview(stats);
        setAiConfigured(ai.configured);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    setError("");
    const path = tab === "users" ? "/users"
      : tab === "stories" ? `/stories?${new URLSearchParams({
        ...(formatFilter !== "all" ? { format: formatFilter } : {}),
        ...(statusFilter !== "all" ? { status: statusFilter } : {}),
      })}`
        : tab === "tasks" ? "/tasks"
          : "";
    if (!path) return undefined;
    const request = tab === "tasks"
      ? Promise.all([apiRequest("admin", path), apiRequest("admin", "/users")])
      : apiRequest("admin", path);
    request
      .then((rows) => {
        if (!active) return;
        if (tab === "users") setUsers(rows);
        if (tab === "stories") setStories(rows);
        if (tab === "tasks") {
          setTasks(rows[0]);
          setUsers(rows[1]);
        }
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      });
    return () => { active = false; };
  }, [tab, formatFilter, statusFilter]);

  const visibleUsers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return users;
    return users.filter((member) => `${member.name} ${member.email}`.toLowerCase().includes(normalizedQuery));
  }, [users, query]);

  const perform = async (key, callback, successMessage = "") => {
    setBusy(key);
    setError("");
    setNotice("");
    try {
      await callback();
      if (successMessage) setNotice(successMessage);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy("");
    }
  };

  const updateUser = (member, changes) => perform(
    `user-${member.id}`,
    async () => {
      const updated = await apiRequest("admin", `/users/${member.id}`, {
        method: "PATCH",
        body: JSON.stringify(changes),
      });
      setUsers((current) => current.map((item) => item.id === member.id ? { ...item, ...updated } : item));
      await loadOverview();
    },
    "Member account updated."
  );

  const moderateStory = (story, status) => perform(
    `story-${story.id}`,
    async () => {
      const result = await apiRequest("admin", `/stories/${story.id}/moderation`, {
        method: "PATCH",
        body: JSON.stringify({ status, note: notes[story.id] || "" }),
      });
      setStories((current) => current.map((item) => item.id === story.id ? { ...item, ...result } : item));
      await loadOverview();
    },
    status === "approved" ? "Post approved and published." : "Post rejected and returned to its author."
  );

  const createTask = (event) => {
    event.preventDefault();
    perform("create-task", async () => {
      const task = await apiRequest("admin", "/tasks", {
        method: "POST",
        body: JSON.stringify({
          title: taskTitle,
          description: taskDescription,
          assignee_id: Number(assigneeId),
          due_at: dueDate ? Math.floor(new Date(dueDate).getTime() / 1000) : null,
        }),
      });
      setTasks((current) => [task, ...current]);
      setTaskTitle("");
      setTaskDescription("");
      setAssigneeId("");
      setDueDate("");
      await loadOverview();
    }, "Assignment created.");
  };

  const updateTask = (task, changes) => perform(
    `task-${task.id}`,
    async () => {
      const updated = await apiRequest("admin", `/tasks/${task.id}`, {
        method: "PATCH",
        body: JSON.stringify(changes),
      });
      setTasks((current) => current.map((item) => item.id === task.id ? updated : item));
    },
    "Assignment updated."
  );

  const deleteTask = (task) => {
    if (!window.confirm(`Delete “${task.title}”? This cannot be undone.`)) return;
    perform(`task-${task.id}`, async () => {
      await apiRequest("admin", `/tasks/${task.id}`, { method: "DELETE" });
      setTasks((current) => current.filter((item) => item.id !== task.id));
      await loadOverview();
    }, "Assignment deleted.");
  };

  const requestDraft = (event) => {
    event.preventDefault();
    setAiDraft("");
    perform("ai-draft", async () => {
      const result = await apiRequest("admin", "/ai/assist", {
        method: "POST",
        body: JSON.stringify({ prompt: aiPrompt, format: aiFormat }),
      });
      setAiDraft(result.text);
    });
  };

  const copyDraft = async () => {
    try {
      await navigator.clipboard.writeText(aiDraft);
      setNotice("AI draft copied to your clipboard.");
      setError("");
    } catch {
      setError("Clipboard access was blocked. Select and copy the draft manually.");
    }
  };

  return (
    <div className="member-home admin-shell">
      <header className="admin-topbar">
        <a className="logo" href="/home"><img className="logo__mark" src="/favicon.svg" alt="" aria-hidden="true" /> Chronicle</a>
        <div className="admin-topbar-label"><span className="eyebrow">ADMIN WORKSPACE</span><strong>Good to see you, {user.name.split(/\s+/)[0]}.</strong></div>
        <div className="admin-topbar-actions"><a href="/home">← Community</a><button type="button" onClick={onLogout}>Sign out</button></div>
      </header>
      <main className="admin-main">
        <div className="admin-page-heading"><div><span className="eyebrow">CHRONICLE MANAGEMENT</span><h1>Steward the stories.</h1><p>Support your community, review new history, and keep the archive thoughtful.</p></div><span className="admin-access-badge">✦ Administrator</span></div>
        <nav className="admin-tabs" aria-label="Administration sections">
          {TABS.map((item) => <button type="button" key={item.id} className={tab === item.id ? "is-active" : ""} aria-current={tab === item.id ? "page" : undefined} onClick={() => { setTab(item.id); setError(""); setNotice(""); }}>{item.label}</button>)}
        </nav>
        <ErrorMessage>{error}</ErrorMessage>
        {notice && <p className="admin-notice" role="status">{notice}</p>}

        {tab === "overview" && (
          <section className="admin-overview" aria-labelledby="admin-overview-title">
            <div className="admin-section-heading"><div><span className="eyebrow">AT A GLANCE</span><h2 id="admin-overview-title">Community health</h2></div><button type="button" className="admin-secondary-button" onClick={() => perform("refresh", loadOverview)}>Refresh</button></div>
            <div className="admin-metrics">
              <Metric label="Total members" value={overview?.users} detail={`${overview?.active_users ?? "—"} active accounts`} />
              <Metric label="Published & submitted" value={overview?.stories} detail="Across every post type" />
              <Metric label="Awaiting review" value={overview?.pending_stories} detail="Stories needing a decision" />
              <Metric label="Assignments" value={overview?.tasks} detail="Team and contributor tasks" />
            </div>
            <div className="admin-overview-grid">
              <article className="admin-panel"><span className="eyebrow">POST FORMATS</span><h3>What members are creating</h3>{Object.entries(overview?.formats || {}).length ? Object.entries(overview.formats).map(([format, count]) => <div className="admin-count-row" key={format}><span>{format}</span><strong>{count}</strong></div>) : <p className="admin-empty">No stories have been submitted yet.</p>}</article>
              <article className="admin-panel"><span className="eyebrow">REVIEW QUEUE</span><h3>Keep the archive moving</h3><p>{overview?.pending_stories ? `${overview.pending_stories} post${overview.pending_stories === 1 ? "" : "s"} waiting for an administrator review.` : "The review queue is clear."}</p><button type="button" className="admin-primary-button" onClick={() => { setStatusFilter("pending"); setTab("stories"); }}>Review pending posts <span aria-hidden="true">→</span></button></article>
            </div>
          </section>
        )}

        {tab === "users" && (
          <section className="admin-panel admin-management-panel" aria-labelledby="admin-users-title">
            <div className="admin-section-heading"><div><span className="eyebrow">MEMBER DIRECTORY</span><h2 id="admin-users-title">Manage accounts</h2><p>Activate or suspend access and assign administrator privileges.</p></div><label className="admin-search"><span aria-hidden="true">⌕</span><input type="search" placeholder="Find a member" value={query} onChange={(event) => setQuery(event.target.value)} /></label></div>
            <div className="admin-table-scroll"><table className="admin-table"><thead><tr><th>Member</th><th>Joined</th><th>Posts</th><th>Access</th><th>Account actions</th></tr></thead><tbody>
              {visibleUsers.map((member) => <tr key={member.id}><td><strong>{member.name}</strong><small>{member.email}</small></td><td>{new Date(member.created_at * 1000).toLocaleDateString()}</td><td>{member.stories_count}</td><td><span className={`admin-status ${member.is_active ? "admin-status--approved" : "admin-status--rejected"}`}>{member.is_active ? "Active" : "Suspended"}</span><span className="admin-role-label">{member.is_admin ? "Administrator" : "Member"}</span></td><td><div className="admin-row-actions"><button type="button" disabled={busy === `user-${member.id}` || member.id === user.id} onClick={() => updateUser(member, { is_active: !member.is_active })}>{member.is_active ? "Suspend" : "Activate"}</button><button type="button" disabled={busy === `user-${member.id}` || member.id === user.id} onClick={() => updateUser(member, { is_admin: !member.is_admin })}>{member.is_admin ? "Remove admin" : "Make admin"}</button></div></td></tr>)}
              {!visibleUsers.length && <tr><td colSpan="5" className="admin-empty">No matching members found.</td></tr>}
            </tbody></table></div>
            <p className="admin-footnote">Showing up to 500 recent members. Your own access cannot be changed here.</p>
          </section>
        )}

        {tab === "stories" && (
          <section className="admin-story-review" aria-labelledby="admin-stories-title">
            <div className="admin-section-heading"><div><span className="eyebrow">EDITORIAL REVIEW</span><h2 id="admin-stories-title">Review community posts</h2><p>Explore posts by format, approve accurate work, or return it with a constructive note.</p></div><div className="admin-filters"><label>Type<select value={formatFilter} onChange={(event) => setFormatFilter(event.target.value)}>{STORY_FORMATS.map((format) => <option key={format} value={format}>{format === "all" ? "All types" : format}</option>)}</select></label><label>Status<select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>{STORY_STATUSES.map((status) => <option key={status} value={status}>{status === "all" ? "All statuses" : status.replace("_", " ")}</option>)}</select></label></div></div>
            {stories.length ? <div className="admin-story-list">{stories.map((story) => <article className="admin-story-card" key={story.id}>
              <div className="admin-story-meta"><span className="admin-format-label">{story.format}</span><span className={`admin-status admin-status--${story.status}`}>{story.status}</span><span>{story.era}{story.place ? ` · ${story.place}` : ""}</span><span>{new Date(story.created_at * 1000).toLocaleDateString()}</span></div>
              <h3>{story.title}</h3><p className="admin-story-author">By {story.author.name} · {story.views} views · {story.likes} likes · {story.comments_count} comments</p>
              {story.media_url && (story.media_type?.startsWith("video/") ? <video className="admin-story-media" src={story.media_url} controls preload="metadata" /> : <img className="admin-story-media" src={story.media_url} alt={`Submitted media for ${story.title}`} loading="lazy" />)}
              <div className="admin-story-content">{renderStoryText(StoryDescription(story).slice(0, 1800))}</div>
              {story.moderation_note && <p className="admin-moderation-note"><strong>Previous editor note:</strong> {story.moderation_note}</p>}
              <label className="admin-note-label">Note for the author<textarea rows="2" maxLength="1000" placeholder="Share a helpful suggestion if returning this post." value={notes[story.id] ?? ""} onChange={(event) => setNotes((current) => ({ ...current, [story.id]: event.target.value }))} /></label>
              <div className="admin-story-actions"><a href={`/story/${story.id}`} target="_blank" rel="noreferrer">Preview post ↗</a><div><button type="button" className="admin-reject-button" disabled={busy === `story-${story.id}` || story.status === "rejected"} onClick={() => moderateStory(story, "rejected")}>Return for edits</button><button type="button" className="admin-primary-button" disabled={busy === `story-${story.id}` || story.status === "approved"} onClick={() => moderateStory(story, "approved")}>Approve & publish</button></div></div>
            </article>)}</div> : <div className="admin-empty-state"><span>✓</span><h3>No posts in this view</h3><p>Try a different status or format filter.</p></div>}
          </section>
        )}

        {tab === "tasks" && (
          <section className="admin-task-management" aria-labelledby="admin-tasks-title">
            <div className="admin-section-heading"><div><span className="eyebrow">TEAM & CONTRIBUTORS</span><h2 id="admin-tasks-title">Create an assignment</h2><p>Give a member a clear, trackable contribution to Chronicle.</p></div></div>
            <form className="admin-task-form admin-panel" onSubmit={createTask}>
              <label>Assignment title<input required minLength="2" maxLength="180" value={taskTitle} onChange={(event) => setTaskTitle(event.target.value)} placeholder="Research a timeline about..." /></label>
              <label>Assign to<select required value={assigneeId} onChange={(event) => setAssigneeId(event.target.value)}><option value="">Choose an active member</option>{users.filter((member) => member.is_active).map((member) => <option key={member.id} value={member.id}>{member.name} · {member.email}</option>)}</select></label>
              <label>Due date <span className="admin-optional">(optional)</span><input type="datetime-local" value={dueDate} onChange={(event) => setDueDate(event.target.value)} /></label>
              <label className="admin-task-description">Brief and context<textarea rows="3" maxLength="5000" value={taskDescription} onChange={(event) => setTaskDescription(event.target.value)} placeholder="Describe the expected outcome and useful historical context." /></label>
              <button type="submit" className="admin-primary-button" disabled={busy === "create-task" || !users.some((member) => member.is_active)}>{busy === "create-task" ? "Creating…" : "Create assignment"}</button>
              {!users.some((member) => member.is_active) && <p className="admin-footnote">Activate a member account before assigning a task.</p>}
            </form>
            <div className="admin-section-heading admin-task-list-heading"><div><span className="eyebrow">WORK IN PROGRESS</span><h2>All assignments</h2></div></div>
            <div className="admin-assignment-list">{tasks.length ? tasks.map((task) => <article className="admin-assignment-card" key={task.id}>
              <div className="admin-assignment-copy"><span className={`admin-status admin-status--${task.status}`}>{task.status.replace("_", " ")}</span><h3>{task.title}</h3>{task.description && <p>{task.description}</p>}<small>Created by {task.creator_name}{task.due_at ? ` · Due ${new Date(task.due_at * 1000).toLocaleString()}` : ""}</small></div>
              <label>Assignee<select value={task.assignee_id} disabled={busy === `task-${task.id}`} onChange={(event) => updateTask(task, { assignee_id: Number(event.target.value) })}>{users.filter((member) => member.is_active).map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}</select></label>
              <label>Status<select value={task.status} disabled={busy === `task-${task.id}`} onChange={(event) => updateTask(task, { status: event.target.value })}>{TASK_STATUSES.map((status) => <option key={status} value={status}>{status.replace("_", " ")}</option>)}</select></label>
              <button type="button" className="admin-delete-button" disabled={busy === `task-${task.id}`} onClick={() => deleteTask(task)}>Delete</button>
            </article>) : <div className="admin-empty-state"><span>◷</span><h3>No assignments yet</h3><p>Create an assignment above to get the work started.</p></div>}</div>
          </section>
        )}

        {tab === "ai" && (
          <section className="admin-ai-studio" aria-labelledby="admin-ai-title">
            <div className="admin-section-heading"><div><span className="eyebrow">GEMINI-POWERED EDITORIAL SUPPORT</span><h2 id="admin-ai-title">AI writing studio</h2><p>Generate a first draft for editorial work. An administrator must check facts and sources before publication.</p></div><span className={`admin-status ${aiConfigured ? "admin-status--approved" : "admin-status--pending"}`}>{aiConfigured ? "Gemini connected" : "API key needed"}</span></div>
            {!aiConfigured && <div className="admin-ai-setup"><strong>Ready when you are.</strong><p>Add your Gemini API key to <code>GEMINI_API_KEY</code> in <code>backend/.env</code>, then restart the backend. The key stays on the server and is never sent to the browser.</p></div>}
            <form className="admin-ai-form admin-panel" onSubmit={requestDraft}>
              <label>Post type<select value={aiFormat} onChange={(event) => setAiFormat(event.target.value)}>{STORY_FORMATS.slice(1).map((format) => <option key={format} value={format}>{format}</option>)}</select></label>
              <label>What should the draft cover?<textarea required minLength="8" maxLength="3000" rows="5" value={aiPrompt} onChange={(event) => setAiPrompt(event.target.value)} placeholder="For example: Draft an accessible overview of the Aksumite Empire's trade networks, with a short timeline and a reminder to verify key dates." /></label>
              <button type="submit" className="admin-primary-button" disabled={busy === "ai-draft" || !aiConfigured}>{busy === "ai-draft" ? "Preparing draft…" : "Generate a draft ✦"}</button>
            </form>
            {aiDraft && <article className="admin-ai-result"><div><span className="eyebrow">EDITORIAL DRAFT · VERIFY BEFORE PUBLISHING</span><button type="button" className="admin-secondary-button" onClick={copyDraft}>Copy draft</button></div><div className="admin-ai-draft">{renderStoryText(aiDraft)}</div></article>}
          </section>
        )}
      </main>
    </div>
  );
}
