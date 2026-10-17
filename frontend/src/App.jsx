import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import AdminDashboard from "./sections/AdminDashboard.jsx";
import MemberHome from "./sections/MemberHome.jsx";
import { HISTORY_EVENTS, HistoryEventDetail } from "./sections/HistoryPages.jsx";

const HeroScene3D = lazy(() => import("./HeroScene.jsx"));

const img = (id, w = 900) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=86`;

const IMAGES = {
  hero: img("photo-1552832230-c0197dd311b5", 2400),
  rome: img("photo-1552832230-c0197dd311b5"),
  india: img("photo-1524492412937-b28074a5d7da"),
  egypt: img("photo-1539650116574-8efeb43e2750"),
  book: img("photo-1481627834876-b7833e8f5570"),
};

const HERO_STORIES = [
  { image: img("photo-1524492412937-b28074a5d7da", 2000), place: "AGRA · INDIA", title: "A monument built to outlast a lifetime", date: "1632 AD", note: "The Taj Mahal takes shape" },
  { image: img("photo-1539650116574-8efeb43e2750", 2000), place: "GIZA · EGYPT", title: "Where the ancient world reached for the sky", date: "c. 2560 BC", note: "The Great Pyramid rises" },
  { image: img("photo-1552832230-c0197dd311b5", 2000), place: "ROMA · ITALY", title: "An empire leaves its mark on the world", date: "80 AD", note: "The Colosseum opens" },
  { image: img("photo-1516026672322-bc52d61a55d5", 2000), place: "LALIBELA · ETHIOPIA", title: "Faith and artistry carved into living stone", date: "12th century", note: "The rock-hewn churches" },
];

const FEATURES = [
  {
    icon: "✍️",
    title: "Share any moment",
    text: "Post history events with text, photos, or video. Tell the story the way it deserves to be told.",
  },
  {
    icon: "🕰️",
    title: "Travel the timeline",
    text: "Scroll through centuries. Jump to any year, era, or empire and watch events unfold in order.",
  },
  {
    icon: "📖",
    title: "Read like a book",
    text: "Switch to Book Mode: turn pages, follow chapters, and enjoy history with images and video inline.",
  },
  {
    icon: "🔥",
    title: "Daily streaks",
    text: "Learn something new every day. Build streaks, earn badges, and climb the historian leaderboard.",
  },
  {
    icon: "💬",
    title: "Debate & discover",
    text: "Comment, react, and join communities around eras, nations, wars, and civilizations.",
  },
  {
    icon: "✅",
    title: "Verified sources",
    text: "Attach sources to every post. Community fact-checks keep the history honest.",
  },
];

const ERAS = Object.fromEntries(
  ["Ancient", "Medieval", "Modern"].map((era) => [era, HISTORY_EVENTS.filter((event) => event.era === era)])
);

const FEED = [
  { user: "Selam T.", handle: "@selam_history", time: "2h", era: "Ancient", text: "Did you know the Aksumite Empire minted its own gold coins 1,700 years ago? 🪙", img: IMAGES.egypt, likes: "2.4k", comments: 318 },
  { user: "Marco R.", handle: "@marcoromanus", time: "5h", era: "Rome", text: "The Colosseum had a retractable awning, operated by sailors. Ancient engineering is wild.", img: IMAGES.rome, likes: "5.1k", comments: 902 },
  { user: "Aarav K.", handle: "@aarav_past", time: "1d", era: "Mughal", text: "22 years. 20,000 artisans. One monument. The story behind the Taj.", img: IMAGES.india, likes: "8.9k", comments: 1204 },
];

const TESTIMONIALS = [
  { name: "Dr. Hana M.", role: "History teacher", quote: "My students now fight over who posts the next event. I've never seen them so hooked on history." },
  { name: "Daniel O.", role: "Student", quote: "I opened it for 5 minutes and looked up an hour later. The timeline view is addictive." },
  { name: "Lena S.", role: "Museum guide", quote: "Book Mode feels like a living museum in my pocket. Beautiful and easy." },
];

const API_BASE = (import.meta.env.VITE_API_BASE_URL || "/api").replace(/\/$/, "");

function BrandMark() {
  return <img className="logo__mark" src="/favicon.svg" alt="" aria-hidden="true" />;
}

async function authRequest(path, body) {
  let response;
  try {
    response = await fetch(`${API_BASE}/auth/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error("Chronicle's account service is unavailable. Start the backend in a separate terminal (see README), then try again.");
  }
  const responseText = await response.text();
  let data = null;
  try {
    data = JSON.parse(responseText);
  } catch {
    data = null;
  }
  if (!response.ok) {
    const proxyFailed = typeof responseText === "string" && /ECONNREFUSED|proxy error|<html/i.test(responseText);
    if (response.status >= 500 && proxyFailed) {
      throw new Error("Chronicle's backend is not running on 127.0.0.1:8000. Start it in a second terminal from the backend folder with `.\\.venv\\Scripts\\python.exe -m uvicorn main:app --reload --host 127.0.0.1 --port 8000`, then try again. Keep both the backend and frontend terminals open.");
    }
    if (typeof data?.detail === "string" && data.detail.trim()) {
      if (response.status >= 500 && data.detail === "Internal Server Error") {
        throw new Error("Chronicle's API encountered a server error. Check the backend terminal for the traceback; database, Google, and upload errors have separate messages.");
      }
      throw new Error(data.detail);
    }
    if (response.status >= 500 && !data) {
      throw new Error(`Chronicle's API returned a non-JSON server response (HTTP ${response.status}). Check the backend terminal for the specific error and restart the API if needed.`);
    }
    if (response.status >= 500) {
      throw new Error("The account service couldn't complete your request. Check the backend terminal for the database error, then try again.");
    }
    throw new Error(`The account service returned an unexpected response (HTTP ${response.status}). Please try again.`);
  }
  return data;
}

function AuthPage({ onAuth, initialMode = "login", resetToken = "" }) {
  const [mode, setMode] = useState(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState(() => new URLSearchParams(window.location.search).get("email") || "");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [token, setToken] = useState(resetToken);
  const [googleStatus, setGoogleStatus] = useState("idle");
  const initializedGoogleClient = useRef("");
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  const switchMode = (nextMode, nextToken = token) => {
    const paths = { login: "/login", register: "/register", forgot: "/forgot-password", reset: "/reset-password" };
    const nextUrl = nextMode === "reset" && nextToken ? `${paths.reset}?token=${encodeURIComponent(nextToken)}` : paths[nextMode];
    window.history.pushState({}, "", nextUrl);
    setMode(nextMode);
    setToken(nextToken);
    setError("");
    setNotice("");
    setResetEmailSent(false);
  };

  useEffect(() => {
    const onPopState = () => {
      const path = window.location.pathname;
      const next = path === "/register" ? "register" : path === "/forgot-password" ? "forgot" : path === "/reset-password" ? "reset" : "login";
      setMode(next);
      setToken(new URLSearchParams(window.location.search).get("token") || "");
      setError("");
      setNotice("");
      setResetEmailSent(false);
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    if (!googleClientId || !["login", "register"].includes(mode)) {
      setGoogleStatus("idle");
      return undefined;
    }
    setGoogleStatus("loading");
    const initialize = () => {
      if (!window.google?.accounts?.id) return;
      if (initializedGoogleClient.current !== googleClientId) {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: async ({ credential }) => {
            setBusy(true);
            setError("");
            try {
              onAuth(await authRequest("google", { credential }));
            } catch (e) {
              setError(e.message);
            } finally {
              setBusy(false);
            }
          },
        });
        initializedGoogleClient.current = googleClientId;
      }
      const target = document.getElementById("google-signin-button");
      if (target) {
        target.replaceChildren();
        window.google.accounts.id.renderButton(target, { theme: "outline", size: "large", shape: "pill", text: "continue_with", width: Math.min(360, target.parentElement?.clientWidth || 360) });
        setGoogleStatus("ready");
      }
    };
    if (window.google?.accounts?.id) initialize();
    else {
      let script = document.querySelector('script[data-google-identity="true"]');
      if (!script) {
        script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.dataset.googleIdentity = "true";
        document.head.appendChild(script);
      }
      const onError = () => {
        setGoogleStatus("error");
        setError("Google sign-in could not load. Check your internet connection and allow accounts.google.com, then try again.");
      };
      script.addEventListener("load", initialize);
      script.addEventListener("error", onError);
      return () => {
        script.removeEventListener("load", initialize);
        script.removeEventListener("error", onError);
      };
    }
  }, [googleClientId, mode, onAuth]);

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    setResetEmailSent(false);
    try {
      if (mode === "register") {
        onAuth(await authRequest("register", { name, email, password }));
      } else if (mode === "login") {
        onAuth(await authRequest("login", { email, password }));
      } else if (mode === "forgot") {
        const result = await authRequest("forgot-password", { email });
        if (result.dev_reset_token) {
          switchMode("reset", result.dev_reset_token);
          setNotice("Development mode: enter a new password to complete your reset.");
        } else setResetEmailSent(true);
      } else {
        const result = await authRequest("reset-password", { token, password });
        setNotice(result.message);
        setPassword("");
        window.history.pushState({}, "", "/login");
        setMode("login");
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const titles = { login: "Welcome back", register: "Your story starts here", forgot: "Find your way back", reset: "Choose a new password" };
  const descriptions = {
    login: "Sign in and continue exploring the past.",
    register: "Create your free Chronicle account.",
    forgot: "We’ll send a secure password reset link to your email.",
    reset: "Choose a strong password for your Chronicle account.",
  };

  return (
    <main className="auth-page">
      <section className="auth-layout" aria-labelledby="auth-title">
        <div className="auth-art">
          <div className="auth-art__seal">CH</div>
          <span className="auth-art__place">LALIBELA · ETHIOPIA</span>
          <div className="auth-art__copy">
            <span>THE PAST, PRESENT</span>
            <strong>Stories carved<br />into stone.</strong>
          </div>
          <a className="auth-art__credit" href="https://commons.wikimedia.org/wiki/File:Rock-Hewn_Churches,_Lalibela-107577.jpg" target="_blank" rel="noreferrer">Lalibela, Ethiopia · Francesco Bandarin / UNESCO · CC BY-SA 3.0 IGO</a>
        </div>
        <div className="auth-panel">
          <a className="auth-brand" href="/"><BrandMark /><span>Chronicle</span></a>
          <div className="auth-heading">
            <span className="eyebrow">A world of stories awaits</span>
            <h2 id="auth-title">{titles[mode]}</h2>
            <p>{descriptions[mode]}</p>
          </div>
          {notice && <div className="auth-notice" role="status">{notice}</div>}
          {resetEmailSent && mode === "forgot" && (
            <div className="auth-email-sent" role="status">
              <span className="auth-email-sent__icon" aria-hidden="true">✉</span>
              <div>
                <strong>Check your email</strong>
                <p>If an account exists for <b>{email}</b>, a password reset link is on its way. Check your inbox and spam folder.</p>
              </div>
            </div>
          )}
          {error && <div className="auth-error" role="alert">{error}</div>}
          <form className="auth-form" onSubmit={submit}>
            {mode === "register" && <label>Your name<input autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ada Lovelace" minLength="2" required /></label>}
            {mode !== "reset" && <label>Email address<input autoComplete="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required /></label>}
            {(mode === "login" || mode === "register" || mode === "reset") && <label>{mode === "reset" ? "New password" : "Password"}<input autoComplete={mode === "login" ? "current-password" : "new-password"} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" minLength="8" required /></label>}
            {mode === "login" && <button type="button" className="auth-link auth-forgot" onClick={() => switchMode("forgot")}>Forgot password?</button>}
            <button className="btn btn--gold btn--lg auth-submit" type="submit" disabled={busy}>{busy ? "Please wait…" : ({ login: "Log in", register: "Create account", forgot: "Email me a reset link", reset: "Save new password" }[mode])}</button>
          </form>
          {(mode === "login" || mode === "register") && <>
            <div className="auth-divider"><span>or continue with</span></div>
            {googleClientId ? <div className="google-button-wrap"><div id="google-signin-button" />{googleStatus === "loading" && <p className="google-signin-status" role="status">Loading secure Google sign-in…</p>}{googleStatus === "error" && <p className="google-signin-status google-signin-status--error" role="status">Google sign-in is unavailable. You can still use your email and password.</p>}</div> : <button type="button" className="google-button" onClick={() => setError("Google sign-in needs VITE_GOOGLE_CLIENT_ID in the frontend and GOOGLE_CLIENT_ID in the backend.")}><b>G</b> Continue with Google</button>}
          </>}
          <div className="auth-switch">
            {mode === "login" ? <>New to Chronicle? <a className="auth-link" href="/register">Create an account</a></> : mode === "register" ? <>Already have an account? <a className="auth-link" href="/login">Log in</a></> : <button className="auth-link" onClick={() => switchMode("login")}>← Back to log in</button>}
          </div>
          <p className="auth-legal">By continuing, you agree to Chronicle’s <a href="/#policies">Terms and Privacy Policy</a>.</p>
        </div>
      </section>
    </main>
  );
}

function useReveal(route) {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("in"));
      return undefined;
    }
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.12 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [route]);
}

function Counter({ to, suffix = "" }) {
  const [n, setN] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const start = performance.now();
      const tick = (t) => {
        const p = Math.min((t - start) / 1600, 1);
        setN(Math.floor(to * (1 - Math.pow(1 - p, 3))));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, [to]);
  return (
    <span ref={ref}>
      {n.toLocaleString()}
      {suffix}
    </span>
  );
}

function Nav({ user, onLogout }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const firstName = user?.name?.trim().split(/\s+/)[0] || "Historian";
  const isLandingPage = window.location.pathname === "/";
  const profileMenu = (
    <div className="nav-profile-wrap">
      <button
        type="button"
        className="nav-profile-button"
        aria-haspopup="menu"
        aria-expanded={profileOpen}
        onClick={() => setProfileOpen((value) => !value)}
      >
        <span className="nav-profile-avatar">{firstName[0].toUpperCase()}</span>
        <span className="nav-profile-name">{firstName}</span>
        <span className="nav-profile-chevron" aria-hidden="true">⌄</span>
      </button>
      {profileOpen && (
        <div className="nav-profile-menu" role="menu">
          <div className="nav-profile-details"><strong>{user?.name}</strong><small>{user?.email}</small></div>
          <button type="button" role="menuitem" onClick={onLogout}>Sign out</button>
        </div>
      )}
    </div>
  );
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 40);
    on();
    window.addEventListener("scroll", on);
    return () => window.removeEventListener("scroll", on);
  }, []);
  return (
    <header className={`nav ${scrolled ? "nav--solid" : ""}`}>
      <a href={isLandingPage ? "#top" : "/"} className="logo">
        <BrandMark /> Chronicle
      </a>
      <nav id="site-navigation" className={`nav__links ${open ? "open" : ""}`} onClick={(event) => { if (event.target.closest("a")) setOpen(false); }}>
        <a href={isLandingPage ? "#features" : "/#features"}>Features</a>
        <a href={isLandingPage ? "#timeline" : "/#timeline"}>Timeline</a>
        <a href={isLandingPage ? "#feed" : "/#feed"}>Community</a>
        <a href={isLandingPage ? "#book" : "/#book"}>Book Mode</a>
        <div className="nav__mobile-cta">
          {user ? profileMenu : <><a className="btn btn--ghost" href="/login">Log in</a><a className="btn btn--gold" href="/register">Join free</a></>}
        </div>
      </nav>
      <div className="nav__cta">
        {user ? profileMenu : <><a className="btn btn--ghost" href="/login">Log in</a><a className="btn btn--gold" href="/register">Join free</a></>}
      </div>
      <button className={`burger ${open ? "is-open" : ""}`} aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} aria-controls="site-navigation" onClick={() => setOpen(!open)}>
      <span />
      </button>
    </header>
  );
}

function Hero() {
  const [storyIndex, setStoryIndex] = useState(0);
  const story = HERO_STORIES[storyIndex];
  useEffect(() => {
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const hero = document.querySelector(".hero");
        if (hero) hero.style.setProperty("--hero-scroll", `${Math.min(window.scrollY, window.innerHeight)}px`);
      });
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
    };
  }, []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    const timer = window.setInterval(() => setStoryIndex((index) => (index + 1) % HERO_STORIES.length), 7000);
    return () => window.clearInterval(timer);
  }, []);

  const moveScene = (event) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--pointer-x", `${(event.clientX - bounds.left) / bounds.width - 0.5}`);
    event.currentTarget.style.setProperty("--pointer-y", `${(event.clientY - bounds.top) / bounds.height - 0.5}`);
  };

  return (
    <section id="top" className="hero" onMouseMove={moveScene} style={{ "--hero": `url(${story.image})` }}>
      <div className="hero__scene" aria-hidden="true">
        <div key={story.image} className="hero__scene-image" />
        <div className="hero__scene-glow" />
        <Suspense fallback={null}><HeroScene3D /></Suspense>
        <span className="hero__scene-label">{story.place}</span>
      </div>
      <div className="hero__overlay" />
      <div className="hero__content">
        <span className="pill">✦ The social network for history lovers</span>
        <h1>
          Every moment ever lived.
          <br />
          <em>One story at a time.</em>
        </h1>
        <p>
          Post history events with text, images, and video. Explore them on a living timeline
          or read them like a book. Join a community that can't stop learning.
        </p>
        <div className="hero__buttons">
          <a href="/register" className="btn btn--gold btn--lg">Start exploring — it's free</a>
          <a href="#how-it-works" className="btn btn--outline btn--lg">▶ See how it works</a>
        </div>
        <div className="hero__proof">
          <div className="avatars">
            {["S", "M", "A", "D", "L"].map((l, i) => (
              <span key={i} style={{ "--i": i }}>{l}</span>
            ))}
          </div>
          <span>Loved by <strong>120,000+</strong> history fans worldwide</span>
        </div>
      </div>
      <aside className="hero__caption" aria-label="Featured moment: Rome, 80 AD">
        <span>Featured moment</span>
        <strong>{story.note}</strong>
        <small>{story.date} <i /> {story.place.split(" · ")[0]}</small>
        <div className="hero__story-dots" aria-label="Choose a featured history story">
          {HERO_STORIES.map((item, index) => <button key={item.place} type="button" aria-label={`Show ${item.place}`} aria-pressed={index === storyIndex} onClick={() => setStoryIndex(index)} />)}
        </div>
      </aside>
      <a href="#features" className="scroll-hint" aria-label="Scroll down">
        <span />
      </a>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { number: "01", title: "Create your account", text: "Join for free with your email and password, or use Google sign-in.", href: "/register", link: "Create an account" },
    { number: "02", title: "Share a moment", text: "Write a history story and add the details, images, or video that bring it to life.", href: "/register", link: "Start your story" },
    { number: "03", title: "Explore together", text: "Browse community stories, follow the timeline, and discover history from new perspectives.", href: "#timeline", link: "Explore the timeline" },
  ];
  return (
    <section id="how-it-works" className="section section--photo how-it-works" style={{ "--section-image": `url(${IMAGES.book})` }}>
      <div className="section__head reveal">
        <span className="eyebrow">A simple way to begin</span>
        <h2>How Chronicle works.</h2>
        <p>Go from curious reader to part of the history conversation in three steps.</p>
      </div>
      <div className="grid grid--3 how-it-works__steps">
        {steps.map((step) => (
          <article className="card reveal how-it-works__step" key={step.number}>
            <span className="how-it-works__number">{step.number}</span>
            <h3>{step.title}</h3>
            <p>{step.text}</p>
            <a className="how-it-works__link" href={step.href}>{step.link} <span aria-hidden="true">→</span></a>
          </article>
        ))}
      </div>
    </section>
  );
}

function Stats() {
  const stats = [
    { n: 120000, s: "+", l: "Active historians" },
    { n: 48000, s: "+", l: "Events shared" },
    { n: 5000, s: "+", l: "Years covered" },
    { n: 190, s: "", l: "Countries" },
  ];
  return (
    <section className="stats section--photo" style={{ "--section-image": `url(${IMAGES.egypt})` }}>
      {stats.map((s) => (
        <div key={s.l} className="stat reveal">
          <strong><Counter to={s.n} suffix={s.s} /></strong>
          <span>{s.l}</span>
        </div>
      ))}
    </section>
  );
}

function Features() {
  return (
    <section id="features" className="section section--photo" style={{ "--section-image": `url(${IMAGES.book})` }}>
      <div className="section__head reveal">
        <span className="eyebrow">Why Chronicle</span>
        <h2>History, finally built for how you scroll.</h2>
        <p>Everything you love about social media, with the past as the main character.</p>
      </div>
      <div className="grid">
        {FEATURES.map((f, i) => (
          <article key={f.title} className="card reveal" style={{ transitionDelay: `${i * 70}ms` }}>
            <div className="card__icon">{f.icon}</div>
            <h3>{f.title}</h3>
            <p>{f.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function Timeline() {
  const [era, setEra] = useState("Ancient");
  return (
    <section id="timeline" className="section section--dark section--photo" style={{ "--section-image": `url(${IMAGES.egypt})` }}>
      <div className="section__head reveal">
        <span className="eyebrow">Timeline view</span>
        <h2>Walk through time.</h2>
        <p>Pick an era and watch history unfold event by event, with photos and video.</p>
      </div>
      <div className="tabs reveal">
        {Object.keys(ERAS).map((e) => (
          <button key={e} className={e === era ? "tab active" : "tab"} onClick={() => setEra(e)}>
            {e}
          </button>
        ))}
      </div>
      <div className="timeline" key={era}>
        {ERAS[era].map((ev, i) => (
          <div key={ev.title} className={`tl ${i % 2 ? "tl--right" : ""}`}>
            <div className="tl__dot" />
            <div className="tl__card">
              <img src={ev.image} alt={ev.title} loading="lazy" />
              <div className="tl__body">
                <span className="tl__year">{ev.year}</span>
                <h3>{ev.title}</h3>
                <p>{ev.text}</p>
                <a className="tl__detail-link" href={`/history/${ev.id}`}>Explore this moment <span aria-hidden="true">↗</span></a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Feed() {
  const [liked, setLiked] = useState({});
  return (
    <section id="feed" className="section section--photo" style={{ "--section-image": `url(${IMAGES.india})` }}>
      <div className="section__head reveal">
        <span className="eyebrow">Community feed</span>
        <h2>Your feed, but make it history.</h2>
        <p>Short stories, jaw-dropping facts, and rare images from people who love the past.</p>
      </div>
      <div className="feed">
        {FEED.map((p, i) => (
          <article key={p.handle} className="post reveal" style={{ transitionDelay: `${i * 90}ms` }}>
            <header>
              <div className="post__av">{p.user[0]}</div>
              <div>
                <strong>{p.user}</strong>
                <small>{p.handle} · {p.time}</small>
              </div>
              <span className="tag">{p.era}</span>
            </header>
            <p>{p.text}</p>
            <div className="post__img">
              <img src={p.img} alt="" loading="lazy" />
              <span className="play">▶</span>
            </div>
            <footer>
              <button
                className={liked[i] ? "liked" : ""}
                onClick={() => setLiked({ ...liked, [i]: !liked[i] })}
              >
                {liked[i] ? "❤️" : "🤍"} {p.likes}
              </button>
              <button>💬 {p.comments}</button>
              <button>↗ Share</button>
            </footer>
          </article>
        ))}
      </div>
    </section>
  );
}

function BookMode() {
  const pages = [
    { ch: "Chapter I", t: "The Rise of Rome", x: "From a small village on the Tiber to master of the Mediterranean, Rome's story begins with seven hills and one big idea." },
    { ch: "Chapter II", t: "Bread & Circuses", x: "The Colosseum rose in just eight years, and with it, the greatest show on earth. Watch the reconstruction video." },
    { ch: "Chapter III", t: "The Long Goodbye", x: "Empires don't fall in a day. Follow the slow unraveling across three centuries, event by event." },
  ];
  const [p, setP] = useState(0);
  return (
    <section id="book" className="section section--dark section--photo book" style={{ "--section-image": `url(${IMAGES.rome})` }}>
      <div className="book__text reveal">
        <span className="eyebrow">Book Mode</span>
        <h2>Turn history into a page-turner.</h2>
        <p>
          Every event can become a chapter. Flip pages, watch embedded video, and zoom into
          images, all in a beautiful reading experience that feels like holding a book.
        </p>
        <ul className="ticks">
          <li>Chapters built from real community events</li>
          <li>Images and video right inside the pages</li>
          <li>Save, bookmark, and continue where you stopped</li>
        </ul>
        <a href="/register" className="btn btn--gold">Open a book</a>
      </div>
      <div className="book__ui reveal">
        <div className="bookwrap">
          <div className="page page--img" style={{ backgroundImage: `url(${IMAGES.rome})` }} />
          <div className="page page--txt" key={p}>
            <small>{pages[p].ch}</small>
            <h3>{pages[p].t}</h3>
            <p>{pages[p].x}</p>
            <div className="pager">
              <button disabled={p === 0} onClick={() => setP(p - 1)}>← Prev</button>
              <span>{p + 1} / {pages.length}</span>
              <button disabled={p === pages.length - 1} onClick={() => setP(p + 1)}>Next →</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  return (
    <section className="section section--photo" style={{ "--section-image": `url(${IMAGES.india})` }}>
      <div className="section__head reveal">
        <span className="eyebrow">Loved worldwide</span>
        <h2>Don't just take our word for it.</h2>
      </div>
      <div className="grid grid--3">
        {TESTIMONIALS.map((t, i) => (
          <figure key={t.name} className="card quote reveal" style={{ transitionDelay: `${i * 90}ms` }}>
            <div className="stars">★★★★★</div>
            <blockquote>"{t.quote}"</blockquote>
            <figcaption><strong>{t.name}</strong><span>{t.role}</span></figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section id="join" className="cta" style={{ "--bg": `url(${IMAGES.egypt})` }}>
      <div className="cta__overlay" />
      <div className="cta__inner reveal">
        <h2>Your chapter starts today.</h2>
        <p>Join thousands of people sharing the stories that shaped our world.</p>
        <form className="cta__signup" action="/register" method="get">
          <label className="sr-only" htmlFor="join-email">Email address</label>
          <input id="join-email" name="email" type="email" autoComplete="email" placeholder="Your email address" required />
          <button className="btn btn--gold btn--lg" type="submit">Join Chronicle <span aria-hidden="true">→</span></button>
        </form>
        <div className="cta__actions cta__login"><a className="btn btn--outline" href="/login">I already have an account</a></div>
        <small>Free to join. Your next discovery is waiting.</small>
      </div>
    </section>
  );
}

function FooterInformation() {
  return (
    <div className="footer-info section--photo" style={{ "--section-image": `url(${IMAGES.book})` }}>
      <section id="about" className="footer-info__block reveal">
        <span className="eyebrow">Our purpose</span>
        <h2>About Chronicle</h2>
        <p>Chronicle is a community for people who love history. Share the moments that shaped our world, explore them through a living timeline, and read stories in a book-inspired format.</p>
        <a className="footer-info__link" href="#how-it-works">See how it works <span aria-hidden="true">→</span></a>
      </section>
      <section id="faq" className="footer-info__block reveal">
        <span className="eyebrow">Quick answers</span>
        <h2>Frequently asked questions</h2>
        <details>
          <summary>Is Chronicle free to join?</summary>
          <p>Yes. You can create an account and explore Chronicle for free.</p>
        </details>
        <details>
          <summary>How do I create an account?</summary>
          <p>Choose “Start exploring” or “Join free,” then register with your name, email, and password. Google sign-in is also available when configured.</p>
        </details>
        <details>
          <summary>Can I share photos and video?</summary>
          <p>Stories support text and media. Upload availability depends on the service configuration.</p>
        </details>
      </section>
      <section id="policies" className="footer-info__block reveal">
        <span className="eyebrow">Using Chronicle</span>
        <h2>Terms &amp; community policy</h2>
        <h3>Using the service</h3>
        <p>Use Chronicle respectfully, share content you have permission to post, and credit your historical sources. Do not misuse the service or post material that violates community standards. Chronicle may moderate content that does not meet these standards.</p>
        <h3>Your account and privacy</h3>
        <p>Chronicle uses your name and email to provide your account. Keep your password private, and avoid putting sensitive personal information in public stories or comments.</p>
        <h3>Community standards</h3>
        <p>Share respectful, relevant history content. Credit sources, distinguish evidence from opinion, and do not post material you do not have permission to share. Content shared in the community may be visible to other visitors.</p>
      </section>
    </div>
  );
}

function Footer() {
  return (
    <footer className="footer section--photo" style={{ "--section-image": `url(${IMAGES.book})` }}>
      <div className="footer__brand">
        <a href="#top" className="logo"><BrandMark /> Chronicle</a>
        <p>Where history lives.</p>
        <small>© {new Date().getFullYear()} Chronicle. All rights reserved.</small>
      </div>
      <div className="footer__group">
        <strong>Explore</strong>
        <a href="#features">Features</a>
        <a href="#timeline">Timeline</a>
        <a href="#feed">Community</a>
      </div>
      <div className="footer__group">
        <strong>Chronicle</strong>
        <a href="#about">About</a>
        <a href="#faq">FAQ</a>
        <a href="/register">Join free</a>
      </div>
      <div className="footer__group">
        <strong>Policies</strong>
        <a href="#policies">Terms, privacy &amp; community policy</a>
      </div>
    </footer>
  );
}

export default function App() {
  const [route, setRoute] = useState(window.location.pathname);
  const [authWarning, setAuthWarning] = useState("");
  const [authChecked, setAuthChecked] = useState(() => !localStorage.getItem("chronicle_token"));
  const [user, setUser] = useState(() => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("chronicle_user") || "null");
      return localStorage.getItem("chronicle_token") && typeof storedUser?.name === "string" && typeof storedUser?.email === "string"
        ? storedUser
        : null;
    } catch {
      return null;
    }
  });
  useReveal(route);
  useEffect(() => {
    const onPopState = () => setRoute(window.location.pathname);
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);
  useEffect(() => {
    const token = localStorage.getItem("chronicle_token");
    if (!token) {
      setAuthChecked(true);
      return undefined;
    }
    let active = true;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 5000);
    fetch(`${API_BASE}/auth/me`, { headers: { Authorization: `Bearer ${token}` }, signal: controller.signal })
      .then(async (response) => {
        if (response.ok) return response.json();
        if (response.status === 401 || response.status === 403) {
          const error = new Error("Your Chronicle session is no longer active.");
          error.sessionExpired = true;
          throw error;
        }
        throw new Error(`Could not verify the current account (HTTP ${response.status}).`);
      })
      .then((currentUser) => {
        if (!active) return;
        localStorage.setItem("chronicle_user", JSON.stringify(currentUser));
        setUser(currentUser);
      })
      .catch((error) => {
        if (!active) return;
        if (error.sessionExpired) {
          localStorage.removeItem("chronicle_token");
          localStorage.removeItem("chronicle_user");
          setUser(null);
        } else setAuthWarning("Chronicle could not refresh your account details. Your saved session is shown; protected actions will report if the service is unavailable.");
      })
      .finally(() => {
        window.clearTimeout(timeout);
        if (active) setAuthChecked(true);
      });
    return () => {
      active = false;
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, []);
  useEffect(() => {
    if (route === "/admin" && user && !user.is_admin) {
      window.history.replaceState({}, "", "/home");
      setRoute("/home");
    }
  }, [route, user]);
  const acceptAuth = useCallback((result) => {
    if (typeof result?.access_token !== "string" || !result.access_token || typeof result.user?.name !== "string" || typeof result.user?.email !== "string" || typeof result.user?.is_admin !== "boolean") {
      throw new Error("The account service returned an invalid sign-in response. Please try again.");
    }
    localStorage.setItem("chronicle_token", result.access_token);
    localStorage.setItem("chronicle_user", JSON.stringify(result.user));
    setUser(result.user);
    const requestedPath = new URLSearchParams(window.location.search).get("next") || "";
    const returnPath = /^\/(?:home|timeline|book|create|story\/\d+)(?:[?#].*)?$/.test(requestedPath) ? requestedPath : "/home";
    window.history.replaceState({}, "", returnPath);
    setRoute(new URL(returnPath, window.location.origin).pathname);
  }, []);
  const logout = useCallback(() => {
    localStorage.removeItem("chronicle_token");
    localStorage.removeItem("chronicle_user");
    setUser(null);
    window.history.replaceState({}, "", "/");
    setRoute("/");
  }, []);
  const authModes = { "/login": "login", "/register": "register", "/forgot-password": "forgot", "/reset-password": "reset" };
  const requestedReset = new URLSearchParams(window.location.search).get("token") || new URLSearchParams(window.location.search).get("reset") || "";
  const historyEventId = route.startsWith("/history/") ? route.slice("/history/".length) : "";
  if (historyEventId) {
    return (
      <>
        <Nav user={user} onLogout={logout} />
        <main className="history-detail-shell">
          <HistoryEventDetail
            eventId={historyEventId}
            backHref={user ? "/timeline" : "/#timeline"}
            createHref={user ? "/create?format=timeline" : "/register"}
          />
        </main>
      </>
    );
  }
  const memberPage = route === "/admin" ? "admin" : route === "/create" ? "create" : route === "/timeline" ? "timeline" : route === "/book" ? "book" : route.startsWith("/story/") ? "story" : route === "/home" ? "home" : null;
  if (memberPage) {
    if (!authChecked) return <main className="auth-page"><p className="auth-heading">Restoring your Chronicle session…</p></main>;
    if (!user || !localStorage.getItem("chronicle_token")) {
      const requestedPath = `${route}${window.location.search}${window.location.hash}`;
      window.history.replaceState({}, "", `/login?next=${encodeURIComponent(requestedPath)}`);
      return <AuthPage key="/login" initialMode="login" onAuth={acceptAuth} />;
    }
    if (memberPage === "admin") {
      if (!user.is_admin) return null;
      return <>{authWarning && <p className="session-warning" role="status">{authWarning}</p>}<AdminDashboard user={user} onLogout={logout} /></>;
    }
    return <>{authWarning && <p className="session-warning" role="status">{authWarning}</p>}<MemberHome key={route} user={user} onLogout={logout} page={memberPage} storyId={route.startsWith("/story/") ? route.slice("/story/".length) : undefined} /></>;
  }
  const authMode = authModes[route] || (route === "/" && requestedReset ? "reset" : null);
  if (authMode) return <AuthPage key={route} initialMode={authMode} resetToken={requestedReset} onAuth={acceptAuth} />;
  return (
    <>
      <Nav user={user} onLogout={logout} />
      <Hero />
      <Stats />
      <HowItWorks />
      <Features />
      <Timeline />
      <Feed />
      <BookMode />
      <Testimonials />
      <CTA />
      <FooterInformation />
      <Footer />
    </>
  );
}
