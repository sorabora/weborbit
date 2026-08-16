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
  const { error } = await supabase
    .from("posts")
    .delete()
    .eq("id", urlParams.get("id"))
  if (error) {
    alert(`Error when deleting thread: ${error}`)
  } else {
    alert("Deleted thread");
  }
});

function updateModDisplay() {
  if (page == "thread") {
    $("mod-tools").el.classList.toggle("d-none");
  }
}

// If you are authenticated, we show the username on the navbar plus a post thread button on the forum.
if (user) {
  $("navbar-items").append(`
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

if (page == "post-thread") {
  let selectedCategory = null;
  for (const item of document.querySelectorAll("#category-menu .dropdown-item")) {
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

    const { error } = await supabase
    .from("posts")
    .insert({ title, content, tags })
    if (error) {
      alert(`Failed to post: ${error}`);
    } else {
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
            <span class="fs-4">${escapeHtml(post.title)}</span>
            <span class="fs-5 text-secondary">by</span>
            <a class="fs-5" href="u.html?id=${encodeURIComponent(post.author)}">${escapeHtml(post.username)}</a>
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

// user page not implemented
if (page == "u") {}

// display info about a thread

if (page == "thread") {
  const id = urlParams.get("id");
  const { data, error } = await supabase
    .rpc('get_thread', { p_thread_id: id });
  console.log(data);
  let halt = false;

  try {
    let d = new Date(data[0].created_at);
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false };
    const formatted = d.toLocaleString('en-US', options);
    const contentHTML = escapeHtml(data[0].content).replace(/\n/g, "<br>");

    $("thread").append(`
      <h1>${escapeHtml(data[0].title)}</h1>
      <p class="secondary"><span title="${formatted}">${timeAgo(data[0].created_at)}</span> by <a href="u.html?id=${encodeURIComponent(data[0].author)}">${escapeHtml(data[0].username)}</a></p>
      <div class="p-4 border bg-body-secondary rounded">
        ${contentHTML}
      </div>
    `)
  } catch (e) {
    $("thread").append(`
      <h1>Thread Not Found</h1>
    `)
    halt = true;
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
    for (let post of data ?? []) {
      $("comments").append(`
        <div class="p-4 border bg-body-secondary rounded">
          <a href="u.html?id=${encodeURIComponent(post.author)}">${escapeHtml(post.users?.username ?? "unknown")}</a>
          <span class="text-secondary" title="${new Date(post.created_at).toLocaleString()}">${timeAgo(post.created_at)}</span>
          <p class="mb-0">${escapeHtml(post.content).replace(/\n/g, "<br>")}</p>
        </div>
      `);
    }
  }
}

$("comments-post").onClick(async () => {
  const content = $("comments-textarea").value.trim();
  if (content.length === 0) {
    alert("Comment can't be empty.");
    return;
  }
  if (content.length > 800) {
    alert("Comment must be 800 characters or fewer.");
    return;
  }
  const { error } = await supabase
    .from('replies')
    .insert({ content, post_id: urlParams.get("id") });

  if (error) {
    alert(`Error posting comment: ${JSON.stringify(error)}`);
  } else {
    alert("Posted Comment!");
  }
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
