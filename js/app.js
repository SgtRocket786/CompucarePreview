const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
let SERVICES = [],
  CASES = [],
  POSTS = [];
// State for lists / pagination and filters
let casePage = 1,
  CASES_PER = 3,
  filteredCases = [],
  caseSort = "newest",
  caseBrand = "",
  caseType = "",
  caseQuery = "";
let postPage = 1,
  POSTS_PER = 4,
  filteredPosts = [],
  postSort = "newest",
  postCategory = "",
  postTag = "",
  postQuery = "";

async function loadData() {
  [SERVICES, CASES, POSTS] = await Promise.all([
    fetch("./data/services.json").then((r) => r.json()),
    fetch("./data/cases.json").then((r) => r.json()),
    fetch("./data/posts.json").then((r) => r.json()),
  ]);
}

// Helper sections as reusable HTML fragments
function aboutSection() {
  return `
    <section class="container">
      <h2>About CompuCare</h2>
      <div class="detail">
        <div class="card">
          <img src="https://images.unsplash.com/photo-1520975792271-5f78f9766c14?w=1200" alt="Owner">
        </div>
        <div class="card">
          <h3>Your independent repair expert</h3>
          <p>Hi! I'm the owner and sole technician at CompuCare. I specialize in precise, affordable repairs and thoughtful upgrades across phones, laptops, tablets and more. Every device gets bench‑tested before and after service.</p>
          <p>Mission: <em>make tech last longer</em> with honest diagnostics and quality parts.</p>
          <a href="#contact" class="btn">Get in touch</a>
        </div>
      </div>
    </section>`;
}

function findUsSection() {
  return `
    <section class="container">
      <h2>Find Us</h2>
      <div class="detail">
        <div class="card">
          <iframe title="Map" width="100%" height="280" style="border:0;border-radius:10px"
            loading="lazy" allowfullscreen
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3151.835434509374!2d144.9537363153168!3d-37.81627937975195!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzfCsDQ5JzAwLjYiUyAxNDTCsDU3JzI0LjQiRQ!5e0!3m2!1sen!2s!4v1616461234567">
          </iframe>
          <p class="muted">* Placeholder map for preview *</p>
        </div>
        <div class="card">
          <h3>CompuCare Technical Services</h3>
          <p>123 Repair Lane, Tech City</p>
          <p><a href="tel:+15555551234">+1 (555) 555‑1234</a> • <a href="mailto:hello@compucare.example">hello@compucare.example</a></p>
          <h4>Hours</h4>
          <ul>
            <li>Mon–Fri: 10:00 – 18:00</li>
            <li>Sat: 11:00 – 15:00</li>
            <li>Sun: Closed</li>
          </ul>
          <a class="btn green" href="https://wa.me/15555551234" target="_blank" rel="noopener">Message on WhatsApp</a>
        </div>
      </div>
    </section>`;
}

function contactSection() {
  return `
    <section class="container">
      <h2>Contact</h2>
      <div class="detail">
        <div class="card">
          <form id="contact-form">
            <label>Name <input type="text" id="cf-name" required placeholder="Your name"></label>
            <label>Email <input type="email" id="cf-email" required placeholder="you@example.com"></label>
            <label>Message <textarea id="cf-msg" rows="6" required placeholder="How can I help?"></textarea></label>
            <button type="submit" class="btn primary">Send Message</button>
            <p id="cf-status" class="muted" style="margin-top:10px"></p>
          </form>
        </div>
        <div class="card">
          <h3>Prefer to call?</h3>
          <p><a href="tel:+15555551234">+1 (555) 555‑1234</a></p>
          <p><a href="mailto:hello@compucare.example">hello@compucare.example</a></p>
          <p><a class="btn green" href="https://wa.me/15555551234" target="_blank" rel="noopener">WhatsApp</a></p>
        </div>
      </div>
    </section>`;
}

function initContactForm() {
  const form = $("#contact-form");
  if (!form) return;
  const status = $("#cf-status");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = $("#cf-name").value.trim();
    const email = $("#cf-email").value.trim();
    const msg = $("#cf-msg").value.trim();
    if (!name || !email || !msg) {
      status.textContent = "Please fill in all fields.";
      return;
    }
    status.textContent =
      "Message sent (demo). We will get back to you shortly.";
    form.reset();
  });
}

function renderHome() {
  const hero = `
    <section class="container hero" style="display:flex;gap:24px;align-items:center;flex-wrap:wrap;">
      <div style="flex:1;min-width:260px">
        <h1 style="margin-bottom:8px">CompuCare Technical Services</h1>
        <p class="muted" style="font-size:1.05rem;max-width:42rem">Expert repairs and upgrades for laptops, phones, tablets, and more. Honest diagnostics and quality parts to make your tech last.</p>
        <div style="margin-top:16px;display:flex;gap:10px;flex-wrap:wrap">
          <a href="#cases" class="btn primary">View Case Studies</a>
          <a href="#services" class="btn">Services</a>
        </div>
      </div>
      <div style="flex:0 0 420px;min-width:220px">
        <img src="https://images.unsplash.com/photo-1545239351-1141bd82e8a6?w=1200&q=80&auto=format&fit=crop" alt="Technician repairing a laptop" style="width:100%;border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,0.15);display:block">
      </div>
    </section>`;

  const popularServices = `
    <section class="container">
      <h2>Popular Services</h2>
      <div class="services-grid">
        ${SERVICES.slice(0, 3)
          .map(
            (s) => `
          <div class="service-card">
            <h3>${s.name}</h3>
            <div class="service-price">from $${s.price}</div>
          </div>`
          )
          .join("")}
      </div>
    </section>`;

  const recentCases = `
    <section class="container">
      <h2>Recent Case Studies</h2>
      <div class="cases-grid">
        ${CASES.slice(0, 3)
          .map(
            (c) => `
          <div class="case-card">
            <div class="case-thumb"><img src="${c.after || ""}" alt="${
              c.title
            }"></div>
            <h3>${c.title}</h3>
            <div class="case-meta">${c.brand} ${c.deviceType} • ${c.date}</div>
            <a href="#case/${c.slug}" class="btn small">View Details</a>
          </div>`
          )
          .join("")}
      </div>
      <a href="#cases" class="btn">See all cases</a>
    </section>`;

  const recentPosts = `
    <section class="container">
      <h2>From the Blog</h2>
      <div class="blog-grid">
        ${POSTS.slice(0, 2)
          .map(
            (p) => `
          <div class="post-card">
            <h3><a href="#post/${p.slug}">${p.title}</a></h3>
            <div class="post-meta">${p.date} • ${(p.tags || []).join(
              ", "
            )}</div>
            <p>${p.excerpt}</p>
            <a href="#post/${p.slug}" class="btn small">Read More</a>
          </div>`
          )
          .join("")}
      </div>
      <a href="#blog" class="btn">See all posts</a>
    </section>`;

  $("#app").innerHTML =
    hero +
    popularServices +
    recentCases +
    recentPosts +
    aboutSection() +
    findUsSection() +
    contactSection();
  initContactForm();
}

function renderServices() {
  $("#app").innerHTML = `
    <section class="container">
      <h2>Our Services</h2>
      <div class="services-grid">
        ${SERVICES.map(
          (s) => `
          <div class="service-card">
            <h3>${s.name}</h3>
            <div class="service-price">$${s.price}</div>
          </div>`
        ).join("")}
      </div>
      <a href="#home" class="btn">← Back</a>
    </section>`;
}

// ===== CASES =====
function renderCases() {
  filteredCases = [...CASES];
  casePage = 1;
  caseSort = "newest";
  caseBrand = "";
  caseType = "";
  caseQuery = "";
  showCases();
}

function applyCaseFilters() {
  filteredCases = CASES.filter((c) => {
    const brandMatch = !caseBrand || c.brand.toLowerCase().includes(caseBrand);
    const typeMatch =
      !caseType || c.deviceType.toLowerCase().includes(caseType);
    const q = (c.title + " " + c.issue + " " + c.diagnosis).toLowerCase();
    const queryMatch = !caseQuery || q.includes(caseQuery);
    return brandMatch && typeMatch && queryMatch;
  });
  casePage = 1;
  showCases();
}

function showCases() {
  const sorted = [...filteredCases].sort((a, b) =>
    caseSort === "newest"
      ? new Date(b.date) - new Date(a.date)
      : new Date(a.date) - new Date(b.date)
  );
  const totalPages = Math.max(1, Math.ceil(sorted.length / CASES_PER));
  casePage = Math.max(1, Math.min(casePage, totalPages));
  const items = sorted.slice((casePage - 1) * CASES_PER, casePage * CASES_PER);

  const brands = [...new Set(CASES.map((c) => c.brand))].sort();
  const types = [...new Set(CASES.map((c) => c.deviceType))].sort();

  $("#app").innerHTML = `
    <section class="container">
      <h2>Case Studies</h2>
      <div class="controls">
        <label>Brand
          <select id="c-brand">
            <option value="">All</option>
            ${brands
              .map(
                (b) =>
                  `<option value="${b.toLowerCase()}" ${
                    caseBrand === b.toLowerCase() ? "selected" : ""
                  }>${b}</option>`
              )
              .join("")}
          </select>
        </label>
        <label>Device
          <select id="c-type">
            <option value="">All</option>
            ${types
              .map(
                (t) =>
                  `<option value="${t.toLowerCase()}" ${
                    caseType === t.toLowerCase() ? "selected" : ""
                  }>${t}</option>`
              )
              .join("")}
          </select>
        </label>
        <label>Search <input id="c-q" placeholder="keywords" value="${
          caseQuery || ""
        }"></label>
        <label>Sort
          <select id="c-sort">
            <option value="newest" ${
              caseSort === "newest" ? "selected" : ""
            }>Newest</option>
            <option value="oldest" ${
              caseSort === "oldest" ? "selected" : ""
            }>Oldest</option>
          </select>
        </label>
      </div>

      <div class="cases-grid">
        ${items
          .map(
            (c) => `
          <div class="case-card">
            <div class="case-thumb"><img src="${c.after || ""}" alt="${
              c.title
            }"></div>
            <h3>${c.title}</h3>
            <div class="case-meta">${c.brand} ${c.deviceType} • ${c.date}</div>
            <a href="#case/${c.slug}" class="btn small">View Details</a>
          </div>`
          )
          .join("")}
      </div>

      <div class="pager">
        <button id="prevCases" ${casePage <= 1 ? "disabled" : ""}>Prev</button>
        Page ${casePage} / ${totalPages}
        <button id="nextCases" ${
          casePage >= totalPages ? "disabled" : ""
        }>Next</button>
      </div>
      <a href="#home" class="btn" style="margin-top:12px">← Back</a>
    </section>`;

  $("#c-brand").addEventListener("change", (e) => {
    caseBrand = e.target.value;
    applyCaseFilters();
  });
  $("#c-type").addEventListener("change", (e) => {
    caseType = e.target.value;
    applyCaseFilters();
  });
  $("#c-q").addEventListener("input", (e) => {
    caseQuery = e.target.value.toLowerCase();
    applyCaseFilters();
  });
  $("#c-sort").addEventListener("change", (e) => {
    caseSort = e.target.value;
    showCases();
  });
  $("#prevCases")?.addEventListener("click", () => {
    casePage--;
    showCases();
  });
  $("#nextCases")?.addEventListener("click", () => {
    casePage++;
    showCases();
  });
}

// Case detail with slider + gallery + lightbox
function renderCaseDetail(slug) {
  const c = CASES.find((x) => x.slug === slug);
  if (!c) {
    $("#app").innerHTML =
      '<section class="container"><p>Case not found.</p></section>';
    return;
  }
  $("#app").innerHTML = `
    <section class="container detail">
      <div class="card">
        <div class="ba">
          <img class="before" src="${c.before || ""}" alt="Before">
          <img class="after" src="${c.after || ""}" alt="After">
          <div class="handle"></div>
          <input type="range" min="0" max="100" value="50" aria-label="Compare before and after">
        </div>
      </div>
      <div class="card">
        <h2>${c.title}</h2>
        <div class="post-meta">${c.brand} ${c.deviceType} • ${c.date}</div>
        <p><strong>Issue:</strong> ${c.issue}</p>
        <p><strong>Diagnosis:</strong> ${c.diagnosis}</p>
        <h3>Steps</h3>
        <ul>${(c.steps || []).map((s) => `<li>${s}</li>`).join("")}</ul>
        <div style="margin-top:12px">
          <a href="#cases" class="btn">← Back to cases</a>
        </div>
      </div>
    </section>
    <section class="container">
      <h2>Additional Images</h2>
      <div class="gallery-grid">
        ${(c.gallery || [])
          .map(
            (g, i) => `
          <div class="card"><a href="#" class="lightbox-link" data-index="${i}" data-slug="${
              c.slug
            }"><img src="${g}" alt="Gallery image ${i + 1}"></a></div>
        `
          )
          .join("")}
      </div>
    </section>
    <div class="lightbox" id="lightbox">
      <div class="nav">
        <button id="lb-prev" aria-label="Previous">‹</button>
        <button id="lb-next" aria-label="Next">›</button>
      </div>
      <img id="lb-img" alt="Gallery image">
    </div>`;

  initBASliders();
  initLightbox(c);
}

function initLightbox(caseItem) {
  const lb = $("#lightbox"),
    img = $("#lb-img");
  let idx = 0;
  const open = (i) => {
    idx = i;
    img.src = caseItem.gallery[idx];
    lb.classList.add("open");
  };
  const close = () => lb.classList.remove("open");
  const next = () => {
    idx = (idx + 1) % caseItem.gallery.length;
    img.src = caseItem.gallery[idx];
  };
  const prev = () => {
    idx = (idx - 1 + caseItem.gallery.length) % caseItem.gallery.length;
    img.src = caseItem.gallery[idx];
  };

  $$(".lightbox-link").forEach((a) =>
    a.addEventListener("click", (e) => {
      e.preventDefault();
      open(parseInt(a.dataset.index, 10));
    })
  );
  $("#lb-next").addEventListener("click", next);
  $("#lb-prev").addEventListener("click", prev);
  lb.addEventListener("click", (e) => {
    if (e.target === lb) close();
  });
  document.addEventListener("keydown", (e) => {
    if (!lb.classList.contains("open")) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowRight") next();
    if (e.key === "ArrowLeft") prev();
  });
}

// ===== BLOG =====
function renderBlog() {
  filteredPosts = [...POSTS];
  postPage = 1;
  postSort = "newest";
  postCategory = "";
  postTag = "";
  postQuery = "";
  showPosts();
}

function applyPostFilters() {
  filteredPosts = POSTS.filter((p) => {
    const catMatch =
      !postCategory || (p.category || "").toLowerCase().includes(postCategory);
    const tagMatch =
      !postTag || (p.tags || []).map((t) => t.toLowerCase()).includes(postTag);
    const q = (p.title + " " + p.excerpt + " " + (p.body || "")).toLowerCase();
    const queryMatch = !postQuery || q.includes(postQuery);
    return catMatch && tagMatch && queryMatch;
  });
  postPage = 1;
  showPosts();
}

function showPosts() {
  const sorted = [...filteredPosts].sort((a, b) =>
    postSort === "newest"
      ? new Date(b.date) - new Date(a.date)
      : new Date(a.date) - new Date(b.date)
  );
  const totalPages = Math.max(1, Math.ceil(sorted.length / POSTS_PER));
  postPage = Math.max(1, Math.min(postPage, totalPages));
  const items = sorted.slice((postPage - 1) * POSTS_PER, postPage * POSTS_PER);

  const categories = [
    ...new Set(POSTS.map((p) => p.category).filter(Boolean)),
  ].sort();
  const tags = [...new Set(POSTS.flatMap((p) => p.tags || []))].sort();

  $("#app").innerHTML = `
    <section class="container">
      <h2>Blog</h2>
      <div class="controls">
        <label>Category
          <select id="p-cat">
            <option value="">All</option>
            ${categories
              .map(
                (c) =>
                  `<option value="${c.toLowerCase()}" ${
                    postCategory === c.toLowerCase() ? "selected" : ""
                  }>${c}</option>`
              )
              .join("")}
          </select>
        </label>
        <label>Tag
          <select id="p-tag">
            <option value="">All</option>
            ${tags
              .map(
                (t) =>
                  `<option value="${t.toLowerCase()}" ${
                    postTag === t.toLowerCase() ? "selected" : ""
                  }>${t}</option>`
              )
              .join("")}
          </select>
        </label>
        <label>Search <input id="p-q" placeholder="keywords" value="${
          postQuery || ""
        }"></label>
        <label>Sort
          <select id="p-sort">
            <option value="newest" ${
              postSort === "newest" ? "selected" : ""
            }>Newest</option>
            <option value="oldest" ${
              postSort === "oldest" ? "selected" : ""
            }>Oldest</option>
          </select>
        </label>
      </div>

      <div class="blog-grid">
        ${items
          .map(
            (p) => `
          <div class="post-card">
            <h3><a href="#post/${p.slug}">${p.title}</a></h3>
            <div class="post-meta">${p.date} • ${(p.tags || []).join(", ")}${
              p.category ? " • " + p.category : ""
            }</div>
            <p>${p.excerpt}</p>
            <a href="#post/${p.slug}" class="btn small">Read More</a>
          </div>`
          )
          .join("")}
      </div>

      <div class="pager">
        <button id="prevPosts" ${postPage <= 1 ? "disabled" : ""}>Prev</button>
        Page ${postPage} / ${totalPages}
        <button id="nextPosts" ${
          postPage >= totalPages ? "disabled" : ""
        }>Next</button>
      </div>
      <a href="#home" class="btn" style="margin-top:12px">← Back</a>
    </section>`;

  $("#p-cat").addEventListener("change", (e) => {
    postCategory = e.target.value;
    applyPostFilters();
  });
  $("#p-tag").addEventListener("change", (e) => {
    postTag = e.target.value;
    applyPostFilters();
  });
  $("#p-q").addEventListener("input", (e) => {
    postQuery = e.target.value.toLowerCase();
    applyPostFilters();
  });
  $("#p-sort").addEventListener("change", (e) => {
    postSort = e.target.value;
    showPosts();
  });
  $("#prevPosts")?.addEventListener("click", () => {
    postPage--;
    showPosts();
  });
  $("#nextPosts")?.addEventListener("click", () => {
    postPage++;
    showPosts();
  });
}

// Blog detail
function renderPostDetail(slug) {
  const p = POSTS.find((x) => x.slug === slug);
  if (!p) {
    $("#app").innerHTML =
      '<section class="container"><p>Post not found.</p></section>';
    return;
  }
  $("#app").innerHTML = `
    <section class="container detail">
      <div class="card">
        <h2>${p.title}</h2>
        <div class="post-meta">${p.date} • ${(p.tags || []).join(", ")}${
    p.category ? " • " + p.category : ""
  }</div>
        <div class="post-body">${p.body || ""}</div>
        <div style="margin-top:12px">
          <a href="#blog" class="btn">← Back to blog</a>
        </div>
      </div>
    </section>`;
}

// ===== ABOUT / FIND US / CONTACT =====
function renderAbout() {
  $("#app").innerHTML = aboutSection();
}

function renderFindUs() {
  $("#app").innerHTML = findUsSection();
}

function renderContact() {
  $("#app").innerHTML = contactSection();
  initContactForm();
}

// ===== Router =====
function route() {
  const h = location.hash.replace(/^#/, "") || "home";
  if (h.startsWith("case/")) return renderCaseDetail(h.split("/")[1]);
  if (h.startsWith("post/")) return renderPostDetail(h.split("/")[1]);
  if (h === "services") return renderServices();
  if (h === "cases") return renderCases();
  if (h === "blog") return renderBlog();
  if (h === "about") return renderAbout();
  if (h === "find-us") return renderFindUs();
  if (h === "contact") return renderContact();
  return renderHome();
}

function initBASliders() {
  $$(".ba").forEach((el) => {
    const after = $(".after", el);
    const range = $('input[type="range"]', el);
    const handle = $(".handle", el);
    const update = (v) => {
      after.style.clipPath = `inset(0 0 0 ${v}%)`;
      handle.style.left = v + "%";
    };
    update(range.value);
    range.addEventListener("input", (e) => update(e.target.value));
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  $("#year").textContent = new Date().getFullYear();
  await loadData();
  route();
  window.addEventListener("hashchange", route);

  const ham = $("#hamburger"),
    drawer = $("#drawer"),
    overlay = $("#overlay"),
    closeBtn = $("#close-drawer");
  const open = () => {
    drawer.classList.add("open");
    overlay.classList.add("open");
    ham.classList.add("active");
    drawer.setAttribute("aria-hidden", "false");
  };
  const close = () => {
    drawer.classList.remove("open");
    overlay.classList.remove("open");
    ham.classList.remove("active");
    drawer.setAttribute("aria-hidden", "true");
  };
  ham.addEventListener("click", () =>
    drawer.classList.contains("open") ? close() : open()
  );
  overlay.addEventListener("click", close);
  closeBtn.addEventListener("click", close);

  // Theme toggle
  $("#theme-toggle")?.addEventListener("click", () => {
    const next =
      document.documentElement.getAttribute("data-theme") === "light"
        ? "dark"
        : "light";
    document.documentElement.setAttribute("data-theme", next);
  });
});
