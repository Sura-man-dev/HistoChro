import { useEffect, useState } from "react";

export async function storyRequest(path, options = {}) {
  let response;
  try {
    response = await fetch(`/api/stories${path}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${localStorage.getItem("chronicle_token") || ""}`,
        ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
        ...options.headers,
      },
    });
  } catch {
    throw new Error("Chronicle's API is unavailable. Start the backend, then try again.");
  }

  const text = await response.text();
  let data = null;
  try {
    data = JSON.parse(text);
  } catch {
    data = null;
  }
  if (!response.ok) {
    if (typeof data?.detail === "string") throw new Error(data.detail);
    if (response.status >= 500 && !data) throw new Error("Chronicle's API is not running at 127.0.0.1:8000. Start the backend and try again.");
    throw new Error(`Chronicle couldn't load this story (HTTP ${response.status}).`);
  }
  return data;
}

const FORMATS = [
  { id: "blog", icon: "▤", title: "Written story", text: "Shape the details into a thoughtful, readable article." },
  { id: "timeline", icon: "◷", title: "Visual timeline", text: "Bring a sequence of important moments together." },
  { id: "media", icon: "▶", title: "Image or video", text: "Tell the story through a powerful visual." },
];

export function StoryComposer() {
  const requestedFormat = new URLSearchParams(window.location.search).get("format");
  const [format, setFormat] = useState(requestedFormat === "book" || FORMATS.some((item) => item.id === requestedFormat) ? requestedFormat : "blog");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [era, setEra] = useState("");
  const [place, setPlace] = useState("");
  const [year, setYear] = useState("");
  const [events, setEvents] = useState([
    { year: "", title: "", text: "" },
    { year: "", title: "", text: "" },
  ]);
  const [chapters, setChapters] = useState([{ title: "", text: "" }]);
  const [media, setMedia] = useState(null);
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!media) {
      setPreview("");
      return undefined;
    }
    const url = URL.createObjectURL(media);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [media]);

  const updateEvent = (index, field, value) => {
    setEvents((current) => current.map((event, itemIndex) => itemIndex === index ? { ...event, [field]: value } : event));
  };

  const updateChapter = (index, field, value) => {
    setChapters((current) => current.map((chapter, chapterIndex) => chapterIndex === index ? { ...chapter, [field]: value } : chapter));
  };

  const switchToStoryFormats = () => {
    window.history.replaceState({}, "", "/create");
    setFormat("blog");
  };

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      const form = new FormData();
      form.set("format", format);
      form.set("title", title);
      form.set("body", format === "book" ? "" : body);
      form.set("era", era);
      form.set("place", place);
      form.set("year", year);
      form.set("timeline_events", JSON.stringify(format === "timeline" ? events.map(({ media: _media, ...item }) => item) : []));
      form.set("chapters", JSON.stringify(format === "book" ? chapters : []));
      const eventMedia = format === "timeline" ? events.flatMap((item, index) => item.media ? [{ index, media: item.media }] : []) : [];
      form.set("timeline_media_indexes", JSON.stringify(eventMedia.map((item) => item.index)));
      eventMedia.forEach((item) => form.append("event_media", item.media));
      if (media) form.set("media", media);
      const story = await storyRequest("", { method: "POST", body: form });
      window.location.assign(`/story/${story.id}`);
    } catch (requestError) {
      setError(requestError.message);
      setBusy(false);
    }
  };

  return (
    <section className="story-studio">
      <a className="studio-back" href="/home">← Back to your Chronicle</a>
      <header className="studio-heading">
        <span className="eyebrow">{format === "book" ? "CHRONICLE BOOK MODE" : "YOUR NEXT CHAPTER"}</span>
        <h1>{format === "book" ? "Write history, chapter by chapter." : "Tell a story from history."}</h1>
        <p>{format === "book" ? "Build a longer read from clear, thoughtful chapters, then publish it to the Chronicle bookshelf." : "Choose one of three storytelling formats, add the details that matter, and bring the past to life for the community."}</p>
      </header>

      {format === "book" ? (
        <div className="book-mode-callout">
          <span className="story-format-icon" aria-hidden="true">▣</span>
          <div><strong>Book Mode</strong><p>Organize a longer history into chapters for the Chronicle bookshelf.</p></div>
          <button type="button" onClick={switchToStoryFormats}>Choose another format</button>
        </div>
      ) : (
        <div className="story-format-picker" role="group" aria-label="Choose a history story format">
          {FORMATS.map((item) => (
            <button key={item.id} type="button" className={format === item.id ? "is-selected" : ""} aria-pressed={format === item.id} onClick={() => setFormat(item.id)}>
              <span className="story-format-icon" aria-hidden="true">{item.icon}</span><span><strong>{item.title}</strong><small>{item.text}</small></span>
            </button>
          ))}
        </div>
      )}

      <form className="story-form" onSubmit={submit}>
        <div className="story-form-grid">
          <label>Story title<input value={title} onChange={(event) => setTitle(event.target.value)} minLength="2" maxLength="180" placeholder="Give this moment a memorable title" required /></label>
          <label>Era<input value={era} onChange={(event) => setEra(event.target.value)} maxLength="40" placeholder="e.g. Ancient, Medieval, Modern" required /></label>
          <label>Year or date<input value={year} onChange={(event) => setYear(event.target.value)} maxLength="40" placeholder="e.g. 2560 BCE" /></label>
          <label>Place<input value={place} onChange={(event) => setPlace(event.target.value)} maxLength="120" placeholder="Where did it happen?" /></label>
        </div>
        {format !== "book" && <label className="story-body-field">{format === "blog" ? "Your article" : format === "timeline" ? "The story behind these moments" : "Context for your image or video"}
          <textarea value={body} onChange={(event) => setBody(event.target.value)} minLength="2" maxLength="15000" rows="6" placeholder="Share the people, turning points, and details that make this history matter." required />
        </label>}

        {format === "timeline" && (
          <fieldset className="timeline-editor">
            <legend>Timeline moments <span>At least two, in chronological order</span></legend>
            {events.map((item, index) => (
              <div className="timeline-editor-event" key={index}>
                <span className="timeline-editor-number">{String(index + 1).padStart(2, "0")}</span>
                <label>Year or date<input value={item.year} onChange={(event) => updateEvent(index, "year", event.target.value)} placeholder="e.g. 1453" required /></label>
                <label>Moment title<input value={item.title} onChange={(event) => updateEvent(index, "title", event.target.value)} placeholder="What happened?" required /></label>
                <label>Short description<textarea value={item.text} onChange={(event) => updateEvent(index, "text", event.target.value)} maxLength="2000" rows="2" placeholder="Why does this moment matter?" required /></label>
                <label className="timeline-event-media">Add a moment image<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(event) => updateEvent(index, "media", event.target.files?.[0] || null)} /><small>{item.media?.name || "JPG, PNG, WebP, or GIF · up to 25 MB"}</small></label>
                {events.length > 2 && <button type="button" className="timeline-event-remove" aria-label={`Remove timeline moment ${index + 1}`} onClick={() => setEvents((current) => current.filter((_, eventIndex) => eventIndex !== index))}>×</button>}
              </div>
            ))}
            <button type="button" className="story-add-event" onClick={() => setEvents((current) => [...current, { year: "", title: "", text: "" }])}>＋ Add another moment</button>
          </fieldset>
        )}

        {format === "book" && (
          <fieldset className="timeline-editor book-chapter-editor">
            <legend>Chapters <span>Arrange your story into thoughtful, readable sections.</span></legend>
            {chapters.map((chapter, index) => (
              <div className="book-chapter-fields" key={index}>
                <span className="timeline-editor-number">{String(index + 1).padStart(2, "0")}</span>
                <label>Chapter title<input value={chapter.title} onChange={(event) => updateChapter(index, "title", event.target.value)} placeholder={`Chapter ${index + 1}`} required /></label>
                <label>Chapter text<textarea value={chapter.text} onChange={(event) => updateChapter(index, "text", event.target.value)} maxLength="5000" rows="5" placeholder="Tell this part of the story in an engaging, well-sourced way." required /></label>
                {chapters.length > 1 && <button type="button" className="timeline-event-remove" aria-label={`Remove chapter ${index + 1}`} onClick={() => setChapters((current) => current.filter((_, chapterIndex) => chapterIndex !== index))}>×</button>}
              </div>
            ))}
            <button type="button" className="story-add-event" onClick={() => setChapters((current) => [...current, { title: "", text: "" }])}>＋ Add a chapter</button>
          </fieldset>
        )}

        {format !== "book" && <div className="story-media-field">
          <div><strong>{format === "media" ? "Your image or video" : "Add visual context"}{format === "media" && <span> · required</span>}</strong><small>JPG, PNG, WebP, GIF, MP4, WebM, or MOV · up to 25 MB</small></div>
          <label className="story-upload-button">{media ? "Choose a different file" : "Choose an image or video"}<input type="file" accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime" onChange={(event) => setMedia(event.target.files?.[0] || null)} required={format === "media"} /></label>
          {preview && <div className="story-media-preview">{media?.type.startsWith("video/") ? <video src={preview} controls /> : <img src={preview} alt="Preview of your story media" />}<button type="button" onClick={() => setMedia(null)}>Remove media</button></div>}
        </div>}
        {error && <p className="story-form-error" role="alert">{error}</p>}
        <div className="story-form-footer"><span>Your story will be visible to the Chronicle community.</span><button className="btn btn--gold" type="submit" disabled={busy}>{busy ? "Publishing…" : "Publish story →"}</button></div>
      </form>
    </section>
  );
}

export function StoryDetail({ storyId }) {
  const [story, setStory] = useState(null);
  const [error, setError] = useState("");
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    storyRequest(`/${storyId}`)
      .then((result) => { if (active) setStory(result); })
      .catch((requestError) => { if (active) setError(requestError.message); });
    return () => { active = false; };
  }, [storyId]);

  const toggleLike = async () => {
    try {
      const result = await storyRequest(`/${storyId}/like`, { method: "POST" });
      setStory((current) => ({ ...current, liked: result.liked, likes: result.likes }));
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const addComment = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const result = await storyRequest(`/${storyId}/comments`, { method: "POST", body: JSON.stringify({ body: comment }) });
      setStory((current) => ({ ...current, comments: [...current.comments, result], comments_count: current.comments_count + 1 }));
      setComment("");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  if (error && !story) return <div className="story-page-message"><a href="/home">← Back to Discover</a><p role="alert">{error}</p></div>;
  if (!story) return <div className="story-page-message">Opening this chapter…</div>;
  return (
    <article className="published-story">
      <a className="studio-back" href="/home">← Back to Discover</a>
      <header className="published-story-heading"><span className="eyebrow">{story.era} · {story.place || "A moment in history"}</span><h1>{story.title}</h1><p>By {story.author.name} <span>·</span> {story.year || new Date(story.created_at * 1000).toLocaleDateString()}</p></header>
      {story.media_url && (story.media_type?.startsWith("video/") ? <video className="published-story-media" src={story.media_url} controls preload="metadata" /> : <img className="published-story-media" src={story.media_url} alt={story.title} />)}
      {story.format === "timeline" && (
        <div className="published-timeline">
          {story.timeline_events.map((event, index) => <section className="published-timeline-event" key={`${event.year}-${index}`}><time>{event.year}</time><span className="published-timeline-dot" /><div>{event.media_url && <img className="published-timeline-image" src={event.media_url} alt={`Visual for ${event.title}`} loading="lazy" />}<h2>{event.title}</h2><p>{event.text}</p></div></section>)}
        </div>
      )}
      {story.format === "book" && (
        <div className="published-book-chapters">
          {story.chapters.map((chapter, index) => <section className="published-book-chapter" key={`${chapter.title}-${index}`}><span className="eyebrow">CHAPTER {String(index + 1).padStart(2, "0")}</span><h2>{chapter.title}</h2><div className="published-story-body">{chapter.text.split(/\n{2,}/).map((paragraph, paragraphIndex) => <p key={paragraphIndex}>{paragraph}</p>)}</div></section>)}
        </div>
      )}
      <div className="published-story-body">{story.body.split(/\n{2,}/).map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div>
      {error && <p className="story-form-error" role="alert">{error}</p>}
      <div className="published-story-stats"><button type="button" className={story.liked ? "is-liked" : ""} aria-pressed={story.liked} onClick={toggleLike}>{story.liked ? "♥" : "♡"} {story.likes} likes</button><span>◉ {story.views} views</span><span>◌ {story.comments_count} comments</span></div>
      <section className="published-comments"><span className="eyebrow">JOIN THE CONVERSATION</span><h2>Thoughts & perspectives</h2>
        <form onSubmit={addComment}><label className="sr-only" htmlFor="story-comment">Write a comment</label><textarea id="story-comment" value={comment} onChange={(event) => setComment(event.target.value)} maxLength="2000" rows="3" placeholder="Add a thoughtful comment…" required /><button className="btn btn--gold" type="submit" disabled={busy}>{busy ? "Posting…" : "Post comment"}</button></form>
        <div className="published-comment-list">{story.comments.map((item) => <article key={item.id}><span className="comment-avatar">{item.author[0]?.toUpperCase()}</span><div><strong>{item.author}</strong><small>{new Date(item.created_at * 1000).toLocaleDateString()}</small><p>{item.body}</p></div></article>)}
          {story.comments.length === 0 && <p className="published-comment-empty">Be the first to add your perspective.</p>}
        </div>
      </section>
    </article>
  );
}

export function BookModePage({ stories, error }) {
  const books = stories.filter((story) => story.format === "book");
  return (
    <section className="book-mode-page">
      <a className="studio-back" href="/home">← Back to your Chronicle</a>
      <header className="book-mode-heading"><span className="eyebrow">CHRONICLE BOOKSHELF</span><h1>History, chapter by chapter.</h1><p>Settle into a longer story. Follow the people, places, and turning points that connect the pages.</p><a className="btn btn--gold" href="/create?format=book">＋ Write a history book</a></header>
      {error ? <p className="member-feed-error" role="alert">{error}</p> : books.length === 0 ? (
        <div className="book-mode-empty"><span className="book-mode-empty-icon">▣</span><h2>Your next favorite history book is waiting to be written.</h2><p>Create a collection of chapters and help readers explore the past at their own pace.</p><a className="btn btn--gold" href="/create?format=book">Create your first book</a></div>
      ) : (
        <div className="book-mode-grid">{books.map((book) => <article className="book-mode-card" key={book.id}><span className="eyebrow">{book.era} · {book.chapters.length} chapters</span><h2>{book.title}</h2><p>{book.body || book.chapters[0]?.text}</p><div><span>By {book.author.name}</span><span>◉ {book.views} views</span></div><a href={`/story/${book.id}`}>Open this book <span aria-hidden="true">→</span></a></article>)}</div>
      )}
    </section>
  );
}
