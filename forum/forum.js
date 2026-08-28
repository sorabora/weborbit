// Forums for the Weborbit Game

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = 'https://sahuwtqsqbtplyhueokv.supabase.co'
const supabaseKey = 'sb_publishable_6dhE2eLPTmmR2K4TJIf7Pg_vxjN6eg7'

// Here are the initial core variables set when the page loads
export const supabase = createClient(supabaseUrl, supabaseKey)
const { data: { user }, error } = await supabase.auth.getUser()
const page = window.location.pathname.split("/").pop().replace(/\.html$/, "");
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
let username;
let isAdmin = false;
let isModerator = false;
let modTools = false;

function timeAgo(date) {
  const seconds = Math.floor((Date.now() - new Date(date)) / 1000);
  const units = [
    ["year", 31536000],
    ["month", 2592000],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
    ["second", 1],
  ];
  for (const [name, size] of units) {
    const n = Math.floor(seconds / size);
    if (n >= 1) return `${n} ${name}${n == 1 ? "" : "s"} ago`;
  }
  return "just now";
}

if (user) {
  const { data: profile } = await supabase
    .from("users")
    .select("username, role")
    .eq("id", user.id)
    .single();
  switch (profile.role) {
    case "admin":
      isAdmin = true;
    case "moderator":
      isModerator = true;
  }
  console.log(profile.role);
  username = profile?.username;
}

const cosmeticRoles = {
  sorabora: [{ label: "Developer", color: "#a855f7" }],
};

// points are worked out on the page, nothing is stored
const pointValues = { thread: 1000, comment: 300, hourBonus: 0.0002 };

// one gem for everyone, then stars, a crown, a sparkle and a halo pile on
const gemTiers = [
  { min: 0, name: "Stone", color: "#78716c", flat: true },
  { min: 1500, name: "Quartz", color: "#d4d4d8" },
  { min: 6000, name: "Topaz", color: "#f59e0b" },
  { min: 20000, name: "Emerald", color: "#10b981", stars: 1 },
  { min: 50000, name: "Sapphire", color: "#3b82f6", stars: 2 },
  { min: 120000, name: "Amethyst", color: "#a855f7", crown: true },
  { min: 300000, name: "Ruby", color: "#f43f5e", crown: true, sparkle: true },
  { min: 600000, name: "Diamond", color: "#22d3ee", crown: true, sparkle: true, halo: true }
];

const { data: allUsers } = await supabase.from("users").select("id, username, role, posts, replies, created_at");
const usersById = {};
const usersByName = {};
for (const u of allUsers ?? []) {
  usersById[u.id] = u;
  usersByName[u.username] = u;
}

// Utilities

function $(id) {
  const el = document.getElementById(id);
  return {
    el,
    value: el ? el.value : undefined,
    innerHTML: el ? el.innerHTML : undefined,
    onClick(fn) {
      if (el) el.addEventListener('click', fn);
      return this;
    },
    disable() {
      if (el) el.disabled = true;
    },
    enable() {
      if (el) el.disabled = false;
    },
    append(child) {
      if (!el) return null;
      if (typeof child === 'string') {
        el.insertAdjacentHTML('beforeend', child);
        return el.lastElementChild;
      }
      el.appendChild(child);
      return child;
    },
  };
}

if (isModerator) {
  $("role-text").el.innerHTML = "Moderator";
  if (page == "thread") {
    $("moderation-btn").el.classList.remove("d-none");
  }
}

if (isAdmin) {
  $("role-text").el.innerHTML = "Admin";
}

$("moderation-btn").onClick(() => {
  modTools = !modTools;
  updateModDisplay();
});

$("delete-thread").onClick(async () => {
  const reason = prompt("Reason for deleting this thread?");
  if (reason === null) return;
  const { data, error } = await supabase
    .from("posts")
    .update({ deleted: true })
    .eq("id", urlParams.get("id"))
    .select()
  if (error) {
    alert(`Error when deleting thread: ${error.message}`)
  } else if (!data?.length) {
    alert("Nothing was deleted, probably blocked by RLS");
  } else {
    await modLog("delete_thread", reason, urlParams.get("id"), null);
    alert(`Deleted thread: ${JSON.stringify(data)}`);
  }
});

function updateModDisplay() {
  if (page == "thread") {
    $("mod-tools").el.classList.toggle("d-none");
  }
}

// If you are authenticated, we show the username on the navbar plus a post thread button on the forum.
if (user) {
  const { count } = await supabase
    .from("inbox")
    .select("*", { count: "exact", head: true })
    .eq("recipient", user.id)
    .eq("read", false);
  $("navbar-items").append(`
    <li class="nav-item">
      <a class="nav-link" href="inbox.html">Inbox${count ? ` <span class="badge rounded-pill bg-danger">${count}</span>` : ""}</a>
    </li>
    <li class="nav-item">
      <a class="nav-link">${escapeHtml(username ?? "")}</a>
    </li>
  `);
  if (page == "forum"){
    $("post-btn").el.classList.remove("d-none");
    $("post-btn").onClick(() => {
      window.location.href = "post-thread.html";
    });
  }
}

function openThread(id) {
  window.location.href = `thread.html?id=${id}`;
}

// Super important!!
function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function roleBadge(id) {
  const u = usersById[id];
  if (!u) return "";
  let badges = "";
  if (u.role == "admin") badges += `<span class="badge rounded-pill bg-danger">Admin</span> `;
  if (u.role == "moderator") badges += `<span class="badge rounded-pill bg-warning text-dark">Moderator</span> `;
  for (const cosmetic of cosmeticRoles[u.username] ?? []) {
    badges += `<span class="badge rounded-pill" style="background-color: ${cosmetic.color}">${escapeHtml(cosmetic.label)}</span> `;
  }
  return badges;
}

// age only multiplies what you earned, so nothing times old is still nothing
function ageMultiplier(u) {
  const hours = Math.max(Math.floor((Date.now() - new Date(u.created_at)) / 3600000), 0);
  return 1 + hours * pointValues.hourBonus;
}

function userPoints(u) {
  const base = (u.posts ?? 0) * pointValues.thread + (u.replies ?? 0) * pointValues.comment;
  return base ? Math.round(base * ageMultiplier(u)) : 0;
}

function gemTier(points) {
  return [...gemTiers].reverse().find(t => points >= t.min) ?? gemTiers[0];
}

// the gem sits in the middle, everything else is pinned around it
function gem(points, size = 14) {
  const tier = gemTier(points);
  const box = Math.round(size * 1.8);
  const at = (x, y, px, extra = "") =>
    `position: absolute; left: ${x}%; top: ${y}%; transform: translate(-50%, -50%); font-size: ${px}px; ${extra}`;

  let parts = "";
  if (tier.halo) {
    parts += `<span style="${at(50, 58, 0)} width: ${size * 1.5}px; height: ${size * 1.5}px; border: 1px solid currentColor; border-radius: 50%; opacity: 0.4"></span>`;
  }
  parts += `<i class="fa-solid fa-gem" style="${at(50, 58, size)}${tier.flat ? " opacity: 0.65" : ""}"></i>`;
  if (tier.crown) {
    parts += `<i class="fa-solid fa-crown" style="${at(50, 12, size * 0.55)}"></i>`;
  }
  for (const [i, x] of [22, 78].slice(0, tier.stars ?? 0).entries()) {
    parts += `<i class="fa-solid fa-star" style="${at(x, 18 + i * 0, size * 0.4, "opacity: 0.9")}"></i>`;
  }
  if (tier.sparkle) {
    parts += `<i class="fa-solid fa-burst" style="${at(88, 82, size * 0.45, "opacity: 0.85")}"></i>`;
  }

  return `<span title="${tier.name}" style="position: relative; display: inline-block; width: ${box}px; height: ${box}px; color: ${tier.color}; vertical-align: -0.45em">${parts}</span>`;
}

function gemBadge(points) {
  const tier = gemTier(points);
  return `
    <span class="badge rounded-pill d-inline-flex align-items-center gap-1"
      style="color: ${tier.color}; background-color: ${tier.color}22; border: 1px solid ${tier.color}66">
      ${gem(points)}
      ${tier.name}
    </span>`;
}

function userLink(id, name, cls = "") {
  const u = usersById[id];
  return `${u ? gem(userPoints(u)) : ""}
    <a class="${cls}" href="u.html?id=${encodeURIComponent(id)}">${escapeHtml(u?.username ?? name ?? "unknown")}</a> ${roleBadge(id)}`;
}

const EMOTICON_CDN = "https://cdn.jsdelivr.net/gh/bernzrdo/msn-emoticons@main/original/";

const EMOTICONS = [
  ["(party)", "party-smile"],
  ["(rock)", "eye-rolling-smile"],
  ["(inlove)", "red-heart"],
  ["(devil)", "devil"],
  ["(angel)", "angel"],
  ["(cake)", "birthday-cake"],
  ["(beer)", "beer-mug"],
  ["(coffee)", "coffee-cup"],
  ["(pizza)", "pizza"],
  ["(star)", "star"],
  ["(sun)", "sun"],
  ["(rain)", "storm-cloud"],
  ["(email)", "e-mail"],
  ["(phone)", "telephone-receiver"],
  ["(h)", "left-hug"],
  ["(l)", "red-heart"],
  ["(u)", "broken-heart"],
  ["(y)", "thumbs-up"],
  ["(n)", "thumbs-down"],
  ["(f)", "red-rose"],
  ["(w)", "wilted-rose"],
  [":-d", "open-mouthed-smile"],
  [":d", "open-mouthed-smile"],
  [":-(", "sad-smile"],
  [":(", "sad-smile"],
  [":-)", "smile"],
  [":)", "smile"],
  [";-)", "winking-smile"],
  [";)", "winking-smile"],
  [":-p", "smile-with-tongue-out"],
  [":p", "smile-with-tongue-out"],
  [":-o", "surprised-smile"],
  [":o", "surprised-smile"],
  [":-s", "confused-smile"],
  [":s", "confused-smile"],
  [":-$", "embarrassed-smile"],
  [":$", "embarrassed-smile"],
  ["8-)", "nerd-smile"],
  ["8)", "nerd-smile"],
  [":'(", "crying-face"],
  ["<3", "red-heart"],
  ["</3", "broken-heart"],
].sort((a, b) => b[0].length - a[0].length);

function emoticonImg(name, file) {
  return `<img src="${EMOTICON_CDN}${file}.png" alt="${escapeHtml(name)}" title="${escapeHtml(name)}" class="forum-emoticon" style="height:1.3em;width:auto;margin:0 0.05em;vertical-align:middle;">`;
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const EMOTICON_PATTERN = new RegExp(
  EMOTICONS.map(([token]) => escapeRegex(token)).join("|"),
  "gi"
);

// escape first, then turn @mentions into links, emoticons into animated images, and newlines into breaks
function renderContent(str) {
  return escapeHtml(str)
    .replace(/@(\w+)/g, (match, name) =>
      usersByName[name] ? `<a href="u.html?id=${encodeURIComponent(usersByName[name].id)}">${match}</a>` : match)
    .replace(EMOTICON_PATTERN, (match) => {
      const [, file] = EMOTICONS.find(([token]) => token.toLowerCase() === match.toLowerCase());
      return emoticonImg(match, file);
    })
    .replace(/\n/g, "<br>");
}

if (page == "post-thread") {
  let selectedCategory = null;
  for (const item of document.querySelectorAll("#category-menu .dropdown-item")) {
    if (item.textContent.trim() == "Announcements" && !isAdmin) {
      item.closest("li").remove();
      continue;
    }
    item.addEventListener("click", () => {
      selectedCategory = item.textContent.trim();
      document.getElementById("category-btn").textContent = selectedCategory;
    });
  }

  $("post-thread").onClick(async () => {
    const title = $("post-title").value;
    const tags = selectedCategory;
    const content = $("post-content").value;

    if (!tags) {
      alert("Pick a category first!");
      return;
    }
    if (tags == "Announcements" && !isAdmin) {
      alert("Only admins can post announcements.");
      return;
    }

    const { data: post, error } = await supabase
    .from("posts")
    .insert({ title, content, tags })
    .select()
    .single()
    if (error) {
      alert(`Failed to post: ${error}`);
    } else {
      for (const id of mentionIds(content)) {
        await notify(id, "mention", post.id, null);
      }
      alert("Posted!");
      window.location.href = "forum.html";
    }
  });
}

if (page == "forum") {
  const posts = await supabase.rpc("get_threads");
  console.log(posts);
  if (posts.error) {
    $("threads-list").append(`<p class="text-danger">Failed to load threads: ${escapeHtml(posts.error.message)}</p>`);
  }

  const isVeryRecent = (post) => (Date.now() - new Date(post.created_at)) <= 86400000;
  const isRecent = (post) => (Date.now() - new Date(post.created_at)) <= 172800000;

  function renderThreads(filter) {
    $("threads-list").el.innerHTML = "";
    let shown = (posts.data ?? []).filter((post) => {
      if (post.deleted) return false;
      if (filter == "all") return true;
      if (filter == "new") return isRecent(post);
      return post.tags == filter;
    });
    if (!shown.length) {
      $("threads-list").append(`<p class="text-secondary">Nothing here yet.</p>`);
    }
    for (let post of shown) {
      // If the post is less then two days old show a badge that says "new" though the badge is light blue
      // if its a day or less old then its a normal blue badge
      const btn = $("threads-list").append(`
        <button class="row bg-body-secondary p-3 mb-3 rounded border text-start">
          <div class="col-12 d-flex align-items-center gap-2">
            ${
              // sorry if this line is shitty but I love trinaries
              isVeryRecent(post) ? `<span class="badge rounded-pill bg-primary">New</span>` : isRecent(post) ? `<span class="badge rounded-pill bg-primary bg-opacity-75">New</span>` : ""
            }
            ${post.tags ? `<span class="badge rounded-pill bg-secondary">${escapeHtml(post.tags)}</span>` : ""}
            <span class="fs-4">${escapeHtml(post.title)}</span>
            <span class="fs-5 text-secondary">by</span>
            ${userLink(post.author, post.username, "fs-5")}
            <span class="text-secondary ms-auto" title="${new Date(post.created_at).toLocaleString()}">${timeAgo(post.created_at)}</span>
          </div>
        </button>
      `);
      btn.addEventListener("click", () => openThread(post.id));
    }
  }

  const filterButtons = document.querySelectorAll("#filter-buttons [data-filter]");

  function applyFilter(filter) {
    for (const b of filterButtons) b.classList.toggle("active", b.dataset.filter == filter);
    renderThreads(filter);
  }

  for (const btn of filterButtons) {
    btn.addEventListener("click", () => {
      const filter = btn.dataset.filter;
      const url = new URL(window.location);
      if (filter == "all") {
        url.searchParams.delete("filter");
      } else {
        url.searchParams.set("filter", filter);
      }
      history.replaceState(null, "", url);
      applyFilter(filter);
    });
  }

  applyFilter(urlParams.get("filter") ?? "all");
}

if (page == "leaderboard") {
  const ranked = (allUsers ?? [])
    .map(u => ({ ...u, points: userPoints(u) }))
    .sort((a, b) => b.points - a.points);

  $("leaderboard-note").el.textContent =
    `${pointValues.thread.toLocaleString()} points a thread, ${pointValues.comment.toLocaleString()} a comment, then multiplied by how long you have been here. If you don't post anything, it stays at zero.`;

  $("leaderboard").append(`
    <div class="d-flex flex-wrap align-items-center gap-3 p-3 mb-4 border rounded">
      ${gemTiers.map(t => `
        <span class="d-inline-flex align-items-center gap-1">
          ${gemBadge(t.min)}
          <small class="text-secondary">${t.min.toLocaleString()}+</small>
        </span>
      `).join("")}
    </div>
  `);

  if (!ranked.length) {
    $("leaderboard").append(`<p class="text-secondary">Nobody here yet.</p>`);
  }
  for (const [i, u] of ranked.entries()) {
    const medals = ["#ffd700", "#c0c0c0", "#cd7f32"];
    $("leaderboard").append(`
      <div class="p-3 mb-2 border bg-body-secondary rounded d-flex align-items-center gap-3 ${u.id == user?.id ? "border-primary" : ""}">
        <span class="fs-4 fw-semibold" style="min-width: 2.5rem; ${medals[i] ? `color: ${medals[i]}` : ""}">#${i + 1}</span>
        <a href="u.html?id=${encodeURIComponent(u.id)}">${escapeHtml(u.username)}</a>
        ${roleBadge(u.id)}
        ${gemBadge(u.points)}
        <span class="ms-auto text-end">
          <span class="fs-5">${u.points.toLocaleString()}</span>
          <span class="text-secondary d-block small">${u.posts ?? 0} threads &middot; ${u.replies ?? 0} comments</span>
        </span>
      </div>
    `);
  }
}

if (page == "u") {
  const id = urlParams.get("id");
  const profile = usersById[id];
  if (!profile) {
    $("profile").append(`<h1>User Not Found</h1><p class="text-secondary">id: ${escapeHtml(id ?? "(missing)")}</p>`);
  } else {
    const { data: threads } = await supabase
      .from("posts")
      .select("*")
      .eq("author", id)
      .not("deleted", "is", true)
      .order("created_at", { ascending: false });
    const { data: replies } = await supabase
      .from("replies")
      .select("*")
      .eq("author", id)
      .not("deleted", "is", true)
      .order("created_at", { ascending: false });

    const points = userPoints(profile);
    const next = gemTiers.find(t => t.min > points);

    $("profile").append(`
      <h1>${escapeHtml(profile.username)} ${roleBadge(id)} ${gemBadge(points)}</h1>
      <p class="text-secondary mb-0">${profile.posts ?? 0} threads, ${profile.replies ?? 0} comments, joined ${timeAgo(profile.created_at)}</p>
      <p class="text-secondary">${points.toLocaleString()} points &middot; &times;${ageMultiplier(profile).toFixed(3)} for account age${next ? ` &middot; ${(next.min - points).toLocaleString()} to ${next.name}` : " &middot; max rank"}</p>
    `);

    // only admins get to see what a mod has been up to
    if (isAdmin) {
      const { data: log } = await supabase
        .from("mod_log")
        .select("*")
        .eq("actor", id)
        .order("created_at", { ascending: false });
      $("threads-list").append(`<h2 class="mt-4">Moderation Log</h2>`);
      if (!log?.length) {
        $("threads-list").append(`<p class="text-secondary">No actions logged.</p>`);
      }
      for (let entry of log ?? []) {
        $("threads-list").append(`
          <div class="p-3 mb-3 border border-danger rounded">
            <span class="badge rounded-pill bg-danger">${escapeHtml(entry.action)}</span>
            <span class="text-secondary" title="${new Date(entry.created_at).toLocaleString()}">${timeAgo(entry.created_at)}</span>
            ${entry.post_id ? `<a class="ms-2" href="thread.html?id=${entry.post_id}">View thread</a>` : ""}
            <p class="mb-0">${entry.reason ? escapeHtml(entry.reason) : "<span class='text-secondary'>no reason given</span>"}</p>
          </div>
        `);
      }
    }

    $("threads-list").append(`<h2 class="mt-4">Threads</h2>`);
    if (!threads?.length) {
      $("threads-list").append(`<p class="text-secondary">No threads yet.</p>`);
    }
    for (let post of threads ?? []) {
      const btn = $("threads-list").append(`
        <button class="row bg-body-secondary p-3 mb-3 rounded border text-start">
          <div class="col-12 d-flex align-items-center gap-2">
            ${post.tags ? `<span class="badge rounded-pill bg-secondary">${escapeHtml(post.tags)}</span>` : ""}
            <span class="fs-4">${escapeHtml(post.title)}</span>
            <span class="text-secondary ms-auto" title="${new Date(post.created_at).toLocaleString()}">${timeAgo(post.created_at)}</span>
          </div>
        </button>
      `);
      btn.addEventListener("click", () => openThread(post.id));
    }

    $("threads-list").append(`<h2 class="mt-4">Comments</h2>`);
    if (!replies?.length) {
      $("threads-list").append(`<p class="text-secondary">No comments yet.</p>`);
    }
    for (let reply of replies ?? []) {
      $("threads-list").append(`
        <div class="p-3 mb-3 border bg-body-secondary rounded">
          <span class="text-secondary" title="${new Date(reply.created_at).toLocaleString()}">${timeAgo(reply.created_at)}</span>
          <a class="ms-2" href="thread.html?id=${reply.post_id}">View thread</a>
          <p class="mb-0">${renderContent(reply.content)}</p>
        </div>
      `);
    }
  }
}

if (page == "inbox") {
  if (!user) {
    $("inbox").append(`<p class="text-secondary">Login to see your inbox.</p>`);
  } else {
    const { data, error } = await supabase
      .from("inbox")
      .select("*, senderUser:users!inbox_sender_fkey(username)")
      .eq("recipient", user.id)
      .order("created_at", { ascending: false });
    if (error) {
      $("inbox").append(`<p class="text-danger">Failed to load inbox: ${escapeHtml(error.message)}</p>`);
    } else if (!data?.length) {
      $("inbox").append(`<p class="text-secondary">Nothing here yet.</p>`);
    }
    for (let note of data ?? []) {
      $("inbox").append(`
        <div class="p-3 mb-3 border bg-body-secondary rounded ${note.read ? "" : "border-primary"}">
          <span class="badge rounded-pill ${note.type == "mention" ? "bg-primary" : "bg-secondary"}">${escapeHtml(note.type)}</span>
          ${userLink(note.sender, note.senderUser?.username)}
          <span class="text-secondary" title="${new Date(note.created_at).toLocaleString()}">${timeAgo(note.created_at)}</span>
          ${note.post_id ? `<a class="ms-2" href="thread.html?id=${note.post_id}">View thread</a>` : ""}
        </div>
      `);
    }
    await supabase
      .from("inbox")
      .update({ read: true })
      .eq("recipient", user.id)
      .eq("read", false);
  }
}

// display info about a thread

if (page == "thread") {
  const id = urlParams.get("id");
  const { data, error } = await supabase
    .rpc('get_thread', { p_thread_id: id });
  console.log(data, error);
  let halt = false;

  if (error) {
    $("thread").append(`<p class="text-danger">Failed to load thread: ${escapeHtml(error.message)}</p>`);
    halt = true;
  } else if (!data?.length) {
    $("thread").append(`<h1>Thread Not Found</h1><p class="text-secondary">id: ${escapeHtml(id ?? "(missing)")}</p>`);
    halt = true;
  } else {
    let d = new Date(data[0].created_at);
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false };
    const formatted = d.toLocaleString('en-US', options);
    const contentHTML = renderContent(data[0].content);

    $("thread").append(`
      <h1>${escapeHtml(data[0].title)}</h1>
      <p class="secondary"><span title="${formatted}">${timeAgo(data[0].created_at)}</span> by ${userLink(data[0].author, data[0].username)}</p>
      <div class="p-4 border bg-body-secondary rounded">
        ${contentHTML}
      </div>
    `)
  }

  if (!halt) {
    const { data, error } = await supabase
      .from('replies')
      .select('*, users(username)')
      .eq('post_id', urlParams.get("id"))
      .order('created_at', { ascending: false })

    $("comments").append(`
      <textarea id="comments-textarea" class="form-control" placeholder="I agree!!!!!!"></textarea>
      <p>Max 800 characters</p>
      <button id="comments-post" class="btn btn-primary btn-lg">Post</button>
    `);

    const byParent = {};
    for (let post of data ?? []) {
      // deleted replies stay as stubs so their children don't vanish with them
      (byParent[post.parentReply ?? "root"] ??= []).push(post);
    }

    function renderReplies(parent, container) {
      for (let post of byParent[parent] ?? []) {
        container.insertAdjacentHTML("beforeend", post.deleted ? `
          <div class="p-4 mt-3 border bg-body-secondary rounded">
            <p class="mb-0 text-secondary fst-italic">[deleted]</p>
            <div class="children ms-4"></div>
          </div>
        ` : `
          <div class="p-4 mt-3 border bg-body-secondary rounded">
            ${userLink(post.author, post.users?.username)}
            <span class="text-secondary" title="${new Date(post.created_at).toLocaleString()}">${timeAgo(post.created_at)}</span>
            <p class="mb-0">${renderContent(post.content)}</p>
            <button class="btn btn-sm btn-link p-0 reply-btn">Reply</button>
            ${isModerator ? `<button class="btn btn-sm btn-link p-0 ms-2 text-danger delete-reply-btn">Delete</button>` : ""}
            <div class="reply-box"></div>
            <div class="children ms-4"></div>
          </div>
        `);
        const div = container.lastElementChild;
        if (post.deleted) {
          renderReplies(post.id, div.querySelector(".children"));
          continue;
        }
        if (isModerator) {
          div.querySelector(".delete-reply-btn").addEventListener("click", () => deleteReply(post.id, div));
        }
        div.querySelector(".reply-btn").addEventListener("click", () => {
          const box = div.querySelector(".reply-box");
          box.innerHTML = `
            <textarea class="form-control" placeholder="I disagree!!!!!!"></textarea>
            <button class="btn btn-sm btn-primary mt-1">Post</button>
          `;
          box.querySelector("button").addEventListener("click", () => {
            postComment(box.querySelector("textarea").value, post.id);
          });
        });
        renderReplies(post.id, div.querySelector(".children"));
      }
    }
    renderReplies("root", $("comments").el);
  }
}

function mentionIds(content) {
  return [...content.matchAll(/@(\w+)/g)]
    .map(m => usersByName[m[1]]?.id)
    .filter(Boolean);
}

async function modLog(action, reason, post_id, reply_id) {
  const { error } = await supabase
    .from("mod_log")
    .insert({ action, reason, post_id, reply_id });
  if (error) {
    console.log(`Failed to write mod log: ${error.message}`);
  }
}

async function deleteReply(id, div) {
  const reason = prompt("Reason for deleting this comment?");
  if (reason === null) return;
  const { data, error } = await supabase
    .from("replies")
    .update({ deleted: true })
    .eq("id", id)
    .select();
  if (error) {
    alert(`Error when deleting comment: ${error.message}`);
  } else if (!data?.length) {
    alert("Nothing was deleted, probably blocked by RLS");
  } else {
    await modLog("delete_reply", reason, urlParams.get("id"), id);
    // swap it for a stub in place so mass deleting doesn't mean reloading each time
    for (const el of div.querySelectorAll(":scope > :not(.children)")) {
      el.remove();
    }
    div.insertAdjacentHTML("afterbegin", `<p class="mb-0 text-secondary fst-italic">[deleted]</p>`);
  }
}

async function notify(recipient, type, post_id, reply_id) {
  if (!recipient || recipient == user?.id) return;
  await supabase.from("inbox").insert({ recipient, type, post_id, reply_id });
}

async function postComment(content, parentReply) {
  content = content.trim();
  if (content.length === 0) {
    alert("Comment can't be empty.");
    return;
  }
  if (content.length > 800) {
    alert("Comment must be 800 characters or fewer.");
    return;
  }
  const post_id = urlParams.get("id");
  const { data: reply, error } = await supabase
    .from('replies')
    .insert({ content, post_id, parentReply })
    .select()
    .single();

  if (error) {
    alert(`Error posting comment: ${JSON.stringify(error)}`);
    return;
  }

  const mentioned = mentionIds(content);
  for (const id of mentioned) {
    await notify(id, "mention", post_id, reply.id);
  }
  const replied = new Set(mentioned);
  if (parentReply) {
    const { data: parent } = await supabase.from("replies").select("author").eq("id", parentReply).single();
    if (parent && !replied.has(parent.author)) {
      replied.add(parent.author);
      await notify(parent.author, "reply", post_id, reply.id);
    }
  }
  const { data: thread } = await supabase.from("posts").select("author").eq("id", post_id).single();
  if (thread && !replied.has(thread.author)) {
    await notify(thread.author, "reply", post_id, reply.id);
  }

  alert("Posted Comment!");
  window.location.reload();
}

$("comments-post").onClick(() => {
  postComment($("comments-textarea").value, null);
});

// auth logic
 
$("signup-btn").onClick(async () => {
  $("signup-btn").disable();
  const email = $("signup-email").value;
  const password = $("signup-password").value;
  const username = $("signup-username").value;
  const { data, error } = await supabase.auth.signUp({
    email,
    password
  });
  if (error) {
    alert(`Signup failed: ${error.message}`);
    $("signup-btn").enable();
    return;
  }
  if (data.user) {
    await supabase
      .from("users")
      .insert({ id: data.user.id, username })
    alert("Account Created!")
    return;
  }
});

$("login-btn").onClick(async () => {
  $("login-btn").disable();
  const email = $("login-email").value;
  const password = $("login-password").value;
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  if (error) {
    alert(`Login failed: ${error.message}`)
    $("login-btn").enable();
    return;
  }
  if (data.session) {
    alert("Login succeeded")
  }
});
