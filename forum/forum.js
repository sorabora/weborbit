// Forums for the Weborbit Game

const { createClient } = window.supabase

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
    .maybeSingle();
  if (profile) {
    switch (profile.role) {
      case "admin":
        isAdmin = true;
      case "moderator":
        isModerator = true;
    }
    console.log(profile.role);
  }
  username = profile?.username;
}

const badgeColors = {
  Developer: "#da3bf6",
  "Forum Legend": "#f59e0b",
};
const defaultBadgeColor = "#6366f1";

let cosmeticRoles = {};
try {
  const res = await fetch("https://raw.githubusercontent.com/sorabora/Centralorbit/main/ROLES.json");
  const rolesList = await res.json();
  for (const entry of rolesList) {
    cosmeticRoles[entry.username] = (entry.badges ?? []).map(label => ({
      label,
      color: badgeColors[label] ?? defaultBadgeColor,
    }));
  }
} catch (e) {
  console.log("Failed to load ROLES.json", e);
}

// points are worked out on the page, nothing is stored
const pointValues = { thread: 1000, comment: 300, hourBonus: 0.0002, perLevel: 2500 };

// flat color bands, no icons, just what bracket a level falls into
const levelColorBands = [
  { min: 1, color: "#78716c" },
  { min: 5, color: "#22c55e" },
  { min: 10, color: "#3b82f6" },
  { min: 15, color: "#a855f7" },
  { min: 20, color: "#f97316" },
  { min: 25, color: "#f43f5e" },
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
      <a class="nav-link">${avatarImg(username)} ${escapeHtml(username ?? "")}</a>
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

const usernameColors = {
  Developer: "#22c55e",
  staff: "#b19cd9",
  "Part Developer": "#f97316",
};

function usernameColor(id) {
  const u = usersById[id];
  if (!u) return null;
  for (const cosmetic of cosmeticRoles[u.username] ?? []) {
    if (usernameColors[cosmetic.label]) return usernameColors[cosmetic.label];
  }
  if (u.role == "admin" || u.role == "moderator") return usernameColors.staff;
  return null;
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

function userLevel(points) {
  return 1 + Math.floor(points / pointValues.perLevel);
}

function levelColor(level) {
  return [...levelColorBands].reverse().find(b => level >= b.min).color;
}

function levelBadge(level) {
  const color = levelColor(level);
  return `
    <span class="badge rounded-pill"
      style="color: ${color}; background-color: ${color}22; border: 1px solid ${color}66">
      Lv. ${level}
    </span>`;
}

function avatarUrl(seed, size = 24) {
  return `https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(seed ?? "unknown")}&size=${size}`;
}

function avatarImg(seed, size = 24, fullWidth = false) {
  const dims = fullWidth
    ? `width="100%" style="aspect-ratio: 1 / 1; background: #fff; border-radius: 4px"`
    : `width="${size}" height="${size}" style="vertical-align: -0.3em; background: #fff; border-radius: 4px"`;
  return `<img src="${avatarUrl(seed, size)}" ${dims} alt="">`;
}

function userLink(id, name, cls = "", showAvatar = true) {
  const u = usersById[id];
  const color = usernameColor(id);
  const displayName = u?.username ?? name ?? "unknown";
  return `${showAvatar ? avatarImg(displayName) : ""} ${u ? levelBadge(userLevel(userPoints(u))) : ""}
    <a class="${cls}" href="u.html?id=${encodeURIComponent(id)}"${color ? ` style="color: ${color}"` : ""}>${escapeHtml(displayName)}</a> ${roleBadge(id)}`;
}

const emoticonCdn = "https://cdn.jsdelivr.net/gh/bernzrdo/msn-emoticons@main/original/";

const emoticons = [
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
  return `<img src="${emoticonCdn}${file}.png" alt="${escapeHtml(name)}" title="${escapeHtml(name)}" class="forum-emoticon" style="height:1.3em;width:auto;margin:0 0.05em;vertical-align:middle;">`;
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const emoticonPattern = new RegExp(
  emoticons.map(([token]) => escapeRegex(token)).join("|"),
  "gi"
);

// escape first, then turn image links, @mentions and emoticons into markup, and newlines into breaks
function renderContent(str) {
  return escapeHtml(str)
    .replace(/!\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)/gi, (match, alt, url) =>
      `<img src="${url}" alt="${alt}" class="forum-image" style="max-width:100%;max-height:400px;display:block;margin:0.5em 0;" loading="lazy">`)
    .replace(/(?<!\]\()(https?:\/\/[^\s<]+)/gi, (url) =>
      `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a><img src="${url}" alt="link preview" class="forum-image" style="max-width:100%;max-height:200px;display:block;margin:0.35em 0;" loading="lazy" onerror="this.remove()">`)
    .replace(/@(\w+)/g, (match, name) =>
      usersByName[name] ? `<a href="u.html?id=${encodeURIComponent(usersByName[name].id)}">${match}</a>` : match)
    .replace(emoticonPattern, (match) => {
      const [, file] = emoticons.find(([token]) => token.toLowerCase() === match.toLowerCase());
      return emoticonImg(match, file);
    })
    .replace(/\n/g, "<br>");
}

// prompts for an image link and drops in the () syntax renderContent knows how to embed
function insertImageLink(textareaEl) {
  const url = prompt("Paste an image link (https://...)");
  if (!url) return;
  if (!/^https?:\/\//i.test(url.trim())) {
    alert("That doesn't look like a valid http(s) image link.");
    return;
  }
  const markdown = `![image](${url.trim()})`;
  const start = textareaEl.selectionStart ?? textareaEl.value.length;
  const end = textareaEl.selectionEnd ?? textareaEl.value.length;
  textareaEl.value = textareaEl.value.slice(0, start) + markdown + textareaEl.value.slice(end);
  textareaEl.focus();
  const pos = start + markdown.length;
  textareaEl.setSelectionRange(pos, pos);
}

const modFileMaxBytes = 50 * 1024;

// pulls the bits of a mod.json the Hangar filters on, so we don't have to
// re-download and re-parse every mod file just to list them
async function readModMetadata(file) {
  try {
    const json = JSON.parse(await file.text());
    return {
      mod_name: typeof json.name == "string" ? json.name : null,
      mod_format: typeof json.format == "string" ? json.format : null,
      format_version: Number.isFinite(json.version) ? json.version : null,
      part_count: Array.isArray(json.parts) ? json.parts.length : null,
    };
  } catch {
    return { mod_name: null, mod_format: null, format_version: null, part_count: null };
  }
}

if (page == "post-thread") {
  $("post-content-image-btn").onClick(() => insertImageLink($("post-content").el));

  let selectedCategory = null;
  for (const item of document.querySelectorAll("#category-menu .dropdown-item")) {
    if (item.textContent.trim() == "Announcements" && !isAdmin) {
      item.closest("li").remove();
      continue;
    }
    item.addEventListener("click", () => {
      selectedCategory = item.textContent.trim();
      document.getElementById("category-btn").textContent = selectedCategory;
      const isModding = selectedCategory == "Modding";
      $("mod-file-group").el.classList.toggle("d-none", !isModding);
      $("mod-file-hint").el.classList.toggle("d-none", !isModding);
      $("mod-file-hint2").el.classList.toggle("d-none", !isModding);
    });
  }

  $("post-thread").onClick(async () => {
    if (user && !username) {
      alert("Your profile wasn't fully created during signup. Please log out and sign up again with the same email, or contact support.");
      return;
    }
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

    let mod_url = null;
    let modMetadata = null;
    let modFile = null;
    if (tags == "Modding") {
      const file = $("mod-file").el.files[0];
      if (!file) {
        alert("Pick a mod JSON file first!");
        return;
      }
      if (!file.name.toLowerCase().endsWith(".json")) {
        alert("Mod file must be a .json file.");
        return;
      }
      if (file.size > modFileMaxBytes) {
        alert(`Mod file is too big (${Math.ceil(file.size / 1024)}KB, max 50KB).`);
        return;
      }
      modFile = file;
      modMetadata = await readModMetadata(file);

      // timestamp-uuid-originalname keeps uploads collision-proof and sortable
      // by time, while the uuid stops two people uploading in the same
      // millisecond from clobbering each other
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const path = `${user.id}/${Date.now()}-${crypto.randomUUID()}-${safeName}`;
      const { error: uploadError } = await supabase.storage.from("mods").upload(path, file, {
        contentType: "application/json",
      });
      if (uploadError) {
        alert(`Failed to upload mod file: ${uploadError.message}`);
        return;
      }
      mod_url = supabase.storage.from("mods").getPublicUrl(path).data.publicUrl;
    }

    const { data: post, error } = await supabase
    .from("posts")
    .insert({ title, content, tags, mod_url })
    .select()
    .single()
    if (error) {
      alert(`Failed to post: ${error.message}`);
    } else {
      if (modFile) {
        const { error: versionError } = await supabase
          .from("post_mod_files")
          .insert({ post_id: post.id, url: mod_url, filename: modFile.name, ...modMetadata });
        if (versionError) {
          console.log(`Failed to record mod file version: ${versionError.message}`);
        }
      }
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

  // xenforo-style groupings: a section header plus the categories under it
  const categoryGroups = [
    {
      name: "Announcements",
      categories: [
        { name: "Announcements", color: "primary", description: "News and updates from the team." },
      ],
    },
    {
      name: "Weborbit",
      categories: [
        { name: "Modding", color: "warning", description: "Share and discuss mods." },
        { name: "Questions", color: "info", description: "Ask for help with the game." },
        { name: "Suggestions", color: "info", description: "Ideas for where Weborbit should go next." },
        { name: "Bug Reports", color: "info", description: "Something broken? Report it here." },
        { name: "Weborbit Rockets", color: "success", description: "Show off your builds." },
        { name: "Mission Reports", color: "success", description: "How did your flight go?" },
        { name: "Challenges", color: "success", description: "Community challenges and contests." },
        { name: "Tutorials & Guides", color: "success", description: "Learn from other players." },
      ],
    },
    {
      name: "Community",
      categories: [
        { name: "Fanart", color: "success", description: "Art inspired by Weborbit." },
        { name: "Real-life Rockets", color: "secondary", description: "Talk about actual rocketry." },
        { name: "Off-Topic", color: "secondary", description: "Anything else." },
      ],
    },
  ];

  function statsFor(name) {
    const inCategory = (posts.data ?? []).filter((post) => !post.deleted && post.tags == name);
    const latest = inCategory[0] ?? null;
    return { count: inCategory.length, latest };
  }

  function renderCategoryGrid() {
    $("category-grid").el.innerHTML = "";
    const newCount = (posts.data ?? []).filter((post) => !post.deleted && isRecent(post)).length;
    $("category-grid").append(`
      <button class="category-box jbbs-row w-100 mb-0" data-filter="new" style="border-left: 4px solid var(--bs-dark) !important;">
        <div class="category-box-grid flex-grow-1">
          <div class="category-box-info">
            <div class="jbbs-title">New Posts</div>
            <p class="mb-0 small">Everything posted in the last 2 days.</p>
          </div>
          <div class="category-box-count text-center small">
            ${newCount}<br>thread${newCount == 1 ? "" : "s"}
          </div>
          <div class="category-box-latest"></div>
        </div>
      </button>
    `).addEventListener("click", () => openFilter("new"));

    const allCategories = categoryGroups.flatMap(g => g.categories);
    const topCategories = new Set(
      [...allCategories]
        .map(cat => ({ name: cat.name, count: statsFor(cat.name).count }))
        .filter(c => c.count > 0)
        .sort((a, b) => b.count - a.count)
        .slice(0, 3)
        .map(c => c.name)
    );

    for (const group of categoryGroups) {
      $("category-grid").append(`<h5 class="mt-4 mb-2 text-secondary">${escapeHtml(group.name)}</h5>`);
      for (const cat of group.categories) {
        const { count, latest } = statsFor(cat.name);
        const isTop = topCategories.has(cat.name);
        const box = $("category-grid").append(`
          <button class="category-box jbbs-row w-100 mb-0${isTop ? " jbbs-row-hot" : ""}" data-filter="${escapeHtml(cat.name)}" style="border-left: 4px solid var(--bs-${cat.color}) !important;">
            <div class="category-box-grid flex-grow-1">
              <div class="category-box-info">
                <div class="jbbs-title">${escapeHtml(cat.name)} ${isTop ? `<span class="badge rounded-pill bg-warning text-dark">🔥 Active</span>` : ""}</div>
                <p class="mb-0 small">${escapeHtml(cat.description)}</p>
              </div>
              <div class="category-box-count text-center small">
                ${count}<br>thread${count == 1 ? "" : "s"}
              </div>
              <div class="category-box-latest text-end">
                ${latest ? `
                  <div class="text-truncate">${escapeHtml(latest.title)}</div>
                  <div class="small text-nowrap">
                    ${userLink(latest.author, latest.username, "", false)}
                    &middot;
                    <span title="${new Date(latest.created_at).toLocaleString()}">${timeAgo(latest.created_at)}</span>
                  </div>
                ` : `<span class="small">No threads yet</span>`}
              </div>
            </div>
          </button>
        `);
        box.addEventListener("click", () => openFilter(cat.name));
      }
    }
  }

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
    let rowNum = 0;
    for (let post of shown) {
      rowNum++;
      // If the post is less then two days old show a badge that says "new" though the badge is light blue
      // if its a day or less old then its a normal blue badge
      const btn = $("threads-list").append(`
        <button class="jbbs-row">
          <div class="jbbs-side">
            ${avatarImg(usersById[post.author]?.username ?? post.username, 36)}
          </div>
          <div class="flex-grow-1">
            <div class="jbbs-meta mb-1">
              <span class="jbbs-num">${rowNum}</span>
              ${
                // sorry if this line is shitty but I love trinaries
                isVeryRecent(post) ? `<span class="badge rounded-pill bg-primary">New</span>` : isRecent(post) ? `<span class="badge rounded-pill bg-primary bg-opacity-75">New</span>` : ""
              }
              ${post.tags ? `<span class="badge rounded-pill bg-secondary">${escapeHtml(post.tags)}</span>` : ""}
              <span class="jbbs-name">${userLink(post.author, post.username, "", false)}</span>
              <span title="${new Date(post.created_at).toLocaleString()}">${timeAgo(post.created_at)}</span>
            </div>
            <div class="jbbs-title">${escapeHtml(post.title)}</div>
          </div>
        </button>
      `);
      btn.addEventListener("click", () => openThread(post.id));
    }
  }

  function showCategoryGrid() {
    $("category-grid").el.classList.remove("d-none");
    $("thread-list-view").el.classList.add("d-none");
  }

  function showThreadList(filter) {
    $("category-grid").el.classList.add("d-none");
    $("thread-list-view").el.classList.remove("d-none");
    $("thread-list-title").el.textContent = filter == "new" ? "New Posts" : filter == "all" ? "All Threads" : filter;
    renderThreads(filter);
  }

  function openFilter(filter) {
    const url = new URL(window.location);
    url.searchParams.set("filter", filter);
    history.pushState(null, "", url);
    showThreadList(filter);
  }

  $("back-to-categories").onClick(() => {
    const url = new URL(window.location);
    url.searchParams.delete("filter");
    history.pushState(null, "", url);
    showCategoryGrid();
  });

  window.addEventListener("popstate", () => {
    const filter = new URLSearchParams(window.location.search).get("filter");
    if (filter) showThreadList(filter);
    else showCategoryGrid();
  });

  renderCategoryGrid();
  const initialFilter = urlParams.get("filter");
  if (initialFilter) showThreadList(initialFilter);
  else showCategoryGrid();
}

if (page == "hangar") {
  const { data: files, error } = await supabase
    .from("post_mod_files")
    .select("*, posts(id, title, tags, author, deleted)")
    .order("created_at", { ascending: false });

  if (error) {
    $("hangar-rows").append(`<tr><td colspan="7" class="text-danger">Failed to load mods: ${escapeHtml(error.message)}</td></tr>`);
  }

  const rows = (files ?? []).filter((f) => f.posts && !f.posts.deleted);

  let sortKey = "created_at";
  let sortDir = -1;

  function rowValue(row, key) {
    switch (key) {
      case "mod_name": return (row.mod_name ?? row.filename ?? "").toLowerCase();
      case "author": return (usersById[row.posts.author]?.username ?? "").toLowerCase();
      case "thread": return (row.posts.title ?? "").toLowerCase();
      case "format_version": return row.format_version ?? -Infinity;
      case "part_count": return row.part_count ?? -Infinity;
      case "created_at": return new Date(row.created_at).getTime();
      default: return "";
    }
  }

  function renderHangar() {
    const search = $("hangar-search").value.trim().toLowerCase();
    let shown = rows.filter((row) => {
      if (!search) return true;
      const author = usersById[row.posts.author]?.username ?? "";
      return (row.mod_name ?? row.filename ?? "").toLowerCase().includes(search)
        || (row.posts.title ?? "").toLowerCase().includes(search)
        || author.toLowerCase().includes(search);
    });
    shown = [...shown].sort((a, b) => {
      const av = rowValue(a, sortKey);
      const bv = rowValue(b, sortKey);
      if (av < bv) return -1 * sortDir;
      if (av > bv) return 1 * sortDir;
      return 0;
    });

    $("hangar-rows").el.innerHTML = "";
    $("hangar-empty").el.classList.toggle("d-none", shown.length > 0);
    for (const row of shown) {
      $("hangar-rows").append(`
        <tr>
          <td>${escapeHtml(row.mod_name ?? row.filename)}</td>
          <td>${userLink(row.posts.author, null)}</td>
          <td><a href="thread.html?id=${row.posts.id}">${escapeHtml(row.posts.title)}</a></td>
          <td>${row.format_version ?? "?"}</td>
          <td>${row.part_count ?? "?"}</td>
          <td class="text-secondary" title="${new Date(row.created_at).toLocaleString()}">${timeAgo(row.created_at)}</td>
          <td><a href="${escapeHtml(row.url)}" class="btn btn-sm btn-outline-primary" download>Download</a></td>
        </tr>
      `);
    }
  }

  for (const th of document.querySelectorAll("[data-sort]")) {
    th.addEventListener("click", () => {
      if (sortKey === th.dataset.sort) {
        sortDir *= -1;
      } else {
        sortKey = th.dataset.sort;
        sortDir = 1;
      }
      for (const other of document.querySelectorAll("[data-sort] .sort-arrow")) other.textContent = "";
      th.querySelector(".sort-arrow").textContent = sortDir === 1 ? "▲" : "▼";
      renderHangar();
    });
  }

  $("hangar-search").el.addEventListener("input", renderHangar);
  renderHangar();
}

if (page == "leaderboard") {
  const ranked = (allUsers ?? [])
    .map(u => ({ ...u, points: userPoints(u) }))
    .sort((a, b) => b.points - a.points);

  $("leaderboard-note").el.textContent =
    `${pointValues.thread.toLocaleString()} points a thread, ${pointValues.comment.toLocaleString()} a comment, then multiplied by how long you have been here. If you don't post anything, it stays at zero.`;

  $("leaderboard").append(`
    <div class="d-flex flex-wrap align-items-center gap-3 p-3 mb-4 border rounded">
      ${levelColorBands.map(b => `
        <span class="d-inline-flex align-items-center gap-1">
          ${levelBadge(b.min)}
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
        ${avatarImg(u.username)}
        <a href="u.html?id=${encodeURIComponent(u.id)}">${escapeHtml(u.username)}</a>
        ${roleBadge(u.id)}
        <span class="ms-auto text-end">
          <span class="fs-5 fw-semibold" style="color: ${levelColor(userLevel(u.points))}">Lv. ${userLevel(u.points)}</span>
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
    const level = userLevel(points);
    const toNextLevel = level * pointValues.perLevel - points;

    $("profile").append(`
      <h1>${avatarImg(profile.username, 48)} <span${usernameColor(id) ? ` style="color: ${usernameColor(id)}"` : ""}>${escapeHtml(profile.username)}</span> ${roleBadge(id)} ${levelBadge(level)}</h1>
      <p class="text-secondary mb-0">${profile.posts ?? 0} threads, ${profile.replies ?? 0} comments, joined ${timeAgo(profile.created_at)}</p>
      <p class="text-secondary">${points.toLocaleString()} points &middot; &times;${ageMultiplier(profile).toFixed(3)} for account age &middot; ${toNextLevel.toLocaleString()} to Level ${level + 1}</p>
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
  let thread;

  if (error) {
    $("thread").append(`<p class="text-danger">Failed to load thread: ${escapeHtml(error.message)}</p>`);
    halt = true;
  } else if (!data?.length) {
    $("thread").append(`<h1>Thread Not Found</h1><p class="text-secondary">id: ${escapeHtml(id ?? "(missing)")}</p>`);
    halt = true;
  } else {
    thread = data[0];
    let d = new Date(thread.created_at);
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false };
    const formatted = d.toLocaleString('en-US', options);
    const contentHTML = renderContent(thread.content);
    const canEdit = user && (thread.author == user.id || isModerator);

    $("thread").append(`
      <h1 id="thread-title">${escapeHtml(thread.title)}</h1>
      <div class="jbbs-post" id="thread-body">
        <div class="jbbs-side">
          <a href="u.html?id=${encodeURIComponent(thread.author)}">${avatarImg(usersById[thread.author]?.username ?? thread.username, 48)}</a>
        </div>
        <div class="flex-grow-1">
          <p class="jbbs-meta mb-1">
            <span class="jbbs-num">1</span>
            <span class="jbbs-name">${userLink(thread.author, thread.username, "", false)}</span>
            <span title="${formatted}">${timeAgo(thread.created_at)}</span>
            ${thread.edited_at ? `<span class="fst-italic" title="${new Date(thread.edited_at).toLocaleString()}">(edited)</span>` : ""}
            ${canEdit ? `<button id="edit-thread-btn" class="btn btn-sm btn-link p-0 ms-2">Edit</button>` : ""}
          </p>
          <div id="thread-content" class="jbbs-body">${contentHTML}</div>
          ${thread.mod_url ? `<a href="${escapeHtml(thread.mod_url)}" class="btn btn-primary btn-sm mt-3" download>Download Mod</a>` : ""}
          <div id="mod-versions"></div>
        </div>
      </div>
    `);

    if (thread.tags == "Modding") {
      const { data: versions } = await supabase
        .from("post_mod_files")
        .select("url, filename, created_at")
        .eq("post_id", id)
        .order("created_at", { ascending: true });
      if (versions?.length > 1) {
        $("mod-versions").el.innerHTML = `
          <p class="text-secondary mt-3 mb-1">Previous versions:</p>
          ${versions.slice(0, -1).map(v => `
            <a href="${escapeHtml(v.url)}" class="btn btn-sm btn-outline-secondary me-2 mb-2" download>
              ${escapeHtml(v.filename)} <span class="text-secondary">(${timeAgo(v.created_at)})</span>
            </a>
          `).join("")}
        `;
      }
    }

    if (canEdit) {
      $("edit-thread-btn").onClick(() => startEditThread(thread));
    }
  }

  if (!halt) {
    const { data, error } = await supabase
      .from('replies')
      .select('*, users(username)')
      .eq('post_id', urlParams.get("id"))
      .order('created_at', { ascending: false })

    const liveReplies = (data ?? []).filter(post => !post.deleted);
    const participants = new Map();
    participants.set(thread.author, thread.username);
    for (const post of liveReplies) {
      if (!participants.has(post.author)) participants.set(post.author, post.users?.username);
    }
    const repliers = [...participants].filter(([pid]) => pid != thread.author);
    const participantLink = (pid, pname, size, fullWidth = false) => `
      <a href="u.html?id=${encodeURIComponent(pid)}" title="${escapeHtml(usersById[pid]?.username ?? pname ?? "unknown")}">
        ${avatarImg(usersById[pid]?.username ?? pname, size, fullWidth)}
      </a>
    `;
    $("thread-participants").el.innerHTML = `
      <div style="width: 75%">${participantLink(thread.author, thread.username, 96, true)}</div>
      ${repliers.length ? `
        <hr class="w-100 my-2">
        <div class="w-100 d-grid gap-2" style="grid-template-columns: repeat(auto-fill, minmax(36px, 1fr))">
          ${repliers.map(([pid, pname]) => participantLink(pid, pname, 36)).join("")}
        </div>
      ` : ""}
    `;

    const lastActivity = liveReplies[0]?.created_at ?? thread.created_at;
    $("thread-stats").el.innerHTML = `
      <p class="mb-1"><strong>${liveReplies.length}</strong> ${liveReplies.length == 1 ? "reply" : "replies"}</p>
      <p class="mb-1"><strong>${participants.size}</strong> ${participants.size == 1 ? "participant" : "participants"}</p>
      <p class="mb-0 text-secondary">Last activity <span title="${new Date(lastActivity).toLocaleString()}">${timeAgo(lastActivity)}</span></p>
    `;

    $("comments").append(`
      <textarea id="comments-textarea" class="form-control" placeholder="I agree!!!!!!"></textarea>
      <button type="button" id="comments-image-btn" class="btn btn-sm btn-outline-secondary mt-2">🖼️ Insert Image Link</button>
      <p>Max 800 characters</p>
      <button id="comments-post" class="btn btn-primary btn-lg">Post</button>
    `);
    $("comments-image-btn").onClick(() => insertImageLink($("comments-textarea").el));

    const byParent = {};
    for (let post of data ?? []) {
      // deleted replies stay as stubs so their children don't vanish with them
      (byParent[post.parentReply ?? "root"] ??= []).push(post);
    }

    let postNum = 1;
    function renderReplies(parent, container) {
      for (let post of byParent[parent] ?? []) {
        postNum++;
        container.insertAdjacentHTML("beforeend", post.deleted ? `
          <div class="jbbs-post">
            <div class="jbbs-side"></div>
            <div class="flex-grow-1">
              <p class="jbbs-meta mb-1"><span class="jbbs-num">${postNum}</span></p>
              <p class="mb-0 fst-italic">[deleted]</p>
              <div class="children ms-4"></div>
            </div>
          </div>
        ` : `
          <div class="jbbs-post">
            <div class="jbbs-side">
              <a href="u.html?id=${encodeURIComponent(post.author)}">${avatarImg(usersById[post.author]?.username ?? post.users?.username, 48)}</a>
            </div>
            <div class="flex-grow-1">
              <p class="jbbs-meta mb-1">
                <span class="jbbs-num">${postNum}</span>
                <span class="jbbs-name">${userLink(post.author, post.users?.username, "", false)}</span>
                <span title="${new Date(post.created_at).toLocaleString()}">${timeAgo(post.created_at)}</span>
              </p>
              <div class="jbbs-body">${renderContent(post.content)}</div>
              <button class="btn btn-sm btn-link p-0 reply-btn">Reply</button>
              ${isModerator ? `<button class="btn btn-sm btn-link p-0 ms-2 text-danger delete-reply-btn">Delete</button>` : ""}
              <div class="reply-box"></div>
              <div class="children ms-4"></div>
            </div>
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
            <button type="button" class="btn btn-sm btn-outline-secondary mt-1 image-btn">🖼️ Insert Image Link</button>
            <button class="btn btn-sm btn-primary mt-1">Post</button>
          `;
          box.querySelector(".image-btn").addEventListener("click", () => {
            insertImageLink(box.querySelector("textarea"));
          });
          box.querySelector(".btn-primary").addEventListener("click", () => {
            postComment(box.querySelector("textarea").value, post.id);
          });
        });
        renderReplies(post.id, div.querySelector(".children"));
      }
    }
    renderReplies("root", $("comments").el);
  }
}

function startEditThread(thread) {
  const isModding = thread.tags == "Modding";
  $("thread-title").el.outerHTML = `<input id="thread-title-input" class="form-control mb-2" value="${escapeHtml(thread.title)}">`;
  $("thread-content").el.outerHTML = `<textarea id="thread-content-input" class="form-control" rows="8">${escapeHtml(thread.content)}</textarea>`;
  $("thread-body").append(`
    <button type="button" id="thread-content-image-btn" class="btn btn-sm btn-outline-secondary mt-2">🖼️ Insert Image Link</button>
    ${isModding ? `
      <div class="mt-3">
        <label class="form-label">Upload a new mod file version (optional, keeps old versions)</label>
        <input id="edit-mod-file" type="file" class="form-control" accept="application/json,.json">
      </div>
    ` : ""}
    <div id="edit-thread-controls" class="mt-3">
      <button id="save-thread-edit" class="btn btn-primary">Save</button>
      <button id="cancel-thread-edit" class="btn btn-link">Cancel</button>
    </div>
  `);

  $("thread-content-image-btn").onClick(() => insertImageLink($("thread-content-input").el));

  $("cancel-thread-edit").onClick(() => window.location.reload());

  $("save-thread-edit").onClick(async () => {
    const title = $("thread-title-input").value;
    const content = $("thread-content-input").value;
    if (!title || !content) {
      alert("Title and content can't be empty.");
      return;
    }

    let mod_url = thread.mod_url;
    if (isModding) {
      const file = $("edit-mod-file").el.files[0];
      if (file) {
        if (!file.name.toLowerCase().endsWith(".json")) {
          alert("Mod file must be a .json file.");
          return;
        }
        if (file.size > modFileMaxBytes) {
          alert(`Mod file is too big (${Math.ceil(file.size / 1024)}KB, max 50KB).`);
          return;
        }
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const path = `${thread.author}/${Date.now()}-${crypto.randomUUID()}-${safeName}`;
        const { error: uploadError } = await supabase.storage.from("mods").upload(path, file, {
          contentType: "application/json",
        });
        if (uploadError) {
          alert(`Failed to upload mod file: ${uploadError.message}`);
          return;
        }
        mod_url = supabase.storage.from("mods").getPublicUrl(path).data.publicUrl;
        const modMetadata = await readModMetadata(file);
        const { error: versionError } = await supabase
          .from("post_mod_files")
          .insert({ post_id: thread.id, url: mod_url, filename: file.name, ...modMetadata });
        if (versionError) {
          alert(`Failed to record mod file version: ${versionError.message}`);
          return;
        }
      }
    }

    const { error: editLogError } = await supabase
      .from("post_edits")
      .insert({
        post_id: thread.id,
        previous_title: thread.title,
        previous_content: thread.content,
        previous_tags: thread.tags,
      });
    if (editLogError) {
      alert(`Failed to log edit: ${editLogError.message}`);
      return;
    }

    const { error: updateError } = await supabase
      .from("posts")
      .update({ title, content, mod_url, edited_at: new Date().toISOString() })
      .eq("id", thread.id);
    if (updateError) {
      alert(`Failed to save edit: ${updateError.message}`);
      return;
    }
    window.location.reload();
  });
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
  if (user && !username) {
    alert("Your profile wasn't fully created during signup. Please log out and sign up again with the same email, or contact support.");
    return;
  }
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
    let profileError;
    for (let attempt = 0; attempt < 3; attempt++) {
      ({ error: profileError } = await supabase
        .from("users")
        .insert({ id: data.user.id, username }));
      if (!profileError) break;
      await new Promise(r => setTimeout(r, 500 * (attempt + 1)));
    }
    if (profileError) {
      alert(`Signup failed: ${profileError.message}\n\nYour account was created but your profile wasn't. Please log in to finish setting it up.`);
      $("signup-btn").enable();
      return;
    }
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
    const { data: profile } = await supabase
      .from("users")
      .select("id")
      .eq("id", data.user.id)
      .maybeSingle();
    if (!profile) {
      let newUsername = prompt("Your profile wasn't fully set up. Pick a username to finish setting up your account:");
      while (newUsername) {
        const { error: profileError } = await supabase
          .from("users")
          .insert({ id: data.user.id, username: newUsername });
        if (!profileError) break;
        newUsername = prompt(`That didn't work (${profileError.message}). Try a different username:`);
      }
    }
    alert("Login succeeded")
    window.location.reload();
  }
});