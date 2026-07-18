import { APP_CONFIG } from "./config.js";
import { loadProducts } from "./services/catalog-service.js";
import { sendProductPdf } from "./services/email-service.js";

let products = [];
let currentIndex = 0;
let currentTab = "overview";
let idleTimer;

const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];

const icons = {
  feature: '<svg viewBox="0 0 24 24" fill="none"><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" stroke-width="1.7" stroke-linecap="round"/><circle cx="12" cy="12" r="4" stroke-width="1.7"/></svg>',
  segment: '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8" stroke-width="1.7"/><path d="M12 8v4l3 2" stroke-width="1.7" stroke-linecap="round"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" fill="none"><path d="m9 18 6-6-6-6" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>'
};

function requireProducts() {
  if (!products.length) {
    throw new Error("Katalog produktů je prázdný.");
  }
}

function renderProduct(index, animate = true) {
  requireProducts();
  currentIndex = (index + products.length) % products.length;
  const product = products[currentIndex];
  const hero = $("#heroImage");

  if (animate) {
    hero.style.opacity = "0";
    hero.style.transform = "scale(.97)";
  }

  window.setTimeout(() => {
    hero.src = product.image;
    hero.alt = product.name;
    hero.style.opacity = "1";
    hero.style.transform = "scale(1)";
  }, animate ? 110 : 0);

  $("#categoryLabel").textContent = product.category;
  $("#modelCount").textContent = `${currentIndex + 1} / ${products.length}`;
  $("#productName").textContent = product.name;
  $("#productSubtitle").textContent = product.subtitle;
  $("#productLead").textContent = product.lead;
  $("#segments").innerHTML = product.segments
    .map(segment => `<span class="segment">${icons.segment}${segment}</span>`)
    .join("");
  $("#selectedImage").src = product.image;
  $("#selectedName").textContent = product.name;
  $("#modalImage").src = product.image;
  $("#modalProduct").textContent = product.name;

  renderTab();
  renderCatalog($("#catalogSearch").value || "");
}

function renderTab() {
  const product = products[currentIndex];
  let output = "";

  if (currentTab === "overview") {
    output = `<div class="feature-grid">${product.features.map(([title, text]) => `
      <div class="feature">
        <div class="feature-icon">${icons.feature}</div>
        <strong>${title}</strong>
        <p>${text}</p>
      </div>`).join("")}</div>`;
  }

  if (currentTab === "features") {
    output = `<div class="spec-list">${product.specs.map(([name, value]) => `
      <div class="spec-item"><span>${name}</span><b>${value}</b></div>`).join("")}</div>`;
  }

  if (currentTab === "usage") {
    output = `<div class="use-list">${product.usage.map(([title, text], index) => `
      <div class="use-card">
        <div class="use-number">${index + 1}</div>
        <div><strong>${title}</strong><p>${text}</p></div>
      </div>`).join("")}</div>`;
  }

  $("#tabPanel").innerHTML = output;
}

function switchTab(tab) {
  const allowedTabs = ["overview", "features", "usage"];
  currentTab = allowedTabs.includes(tab) ? tab : "overview";
  $$(".tab").forEach(button => {
    button.classList.toggle("active", button.dataset.tab === currentTab);
  });
  renderTab();
}

function renderCatalog(query = "") {
  const needle = query.trim().toLocaleLowerCase("cs");
  const matches = products
    .map((product, index) => ({ product, index }))
    .filter(({ product }) => {
      const searchable = [
        product.name,
        product.subtitle,
        product.category,
        ...(product.segments || [])
      ].join(" ").toLocaleLowerCase("cs");
      return searchable.includes(needle);
    });

  $("#catalog").innerHTML = matches.length
    ? matches.map(({ product, index }) => `
      <button class="catalog-item ${index === currentIndex ? "active" : ""}" data-product="${index}">
        <img src="${product.image}" alt="">
        <span>
          <small>${product.category}</small>
          <strong>${product.name}</strong>
          <p>${product.subtitle}</p>
        </span>
        <span class="catalog-arrow">${icons.arrow}</span>
      </button>`).join("")
    : '<p style="padding:20px;color:var(--muted)">Žádný produkt neodpovídá hledání.</p>';

  $$("#catalog .catalog-item").forEach(button => {
    button.addEventListener("click", () => renderProduct(Number(button.dataset.product)));
  });
}

function openEmail() {
  const product = products[currentIndex];
  $("#modalProduct").textContent = product.name;
  $("#modalImage").src = product.image;
  $("#formView").style.display = "block";
  $("#successView").style.display = "none";
  $("#statusNote").style.display = "none";
  $("#sendBtn").disabled = false;
  $("#emailModal").classList.add("open");
  window.setTimeout(() => $("#customerEmail").focus(), 180);
}

function closeEmail() {
  $("#emailModal").classList.remove("open");
}

function showToast(text) {
  const toast = $("#toast");
  toast.textContent = text;
  toast.classList.add("show");
  window.clearTimeout(window.toastTimer);
  window.toastTimer = window.setTimeout(() => toast.classList.remove("show"), 2500);
}

function resetPresentation(showMessage = false) {
  currentTab = "overview";
  switchTab("overview");
  $("#catalogSearch").value = "";
  renderProduct(0);
  renderCatalog("");
  closeEmail();
  $("#emailForm").reset();

  if (showMessage) {
    showToast("Prezentace byla vrácena na začátek.");
  }
}

function resetIdleTimer() {
  window.clearTimeout(idleTimer);
  idleTimer = window.setTimeout(() => resetPresentation(false), APP_CONFIG.kiosk.idleResetMs);
}

function bindEvents() {
  $$(".tab").forEach(button => {
    button.addEventListener("click", () => switchTab(button.dataset.tab));
  });

  $("#catalogSearch").addEventListener("input", event => renderCatalog(event.target.value));
  $("#emailBtn").addEventListener("click", openEmail);
  $("#consultBtn").addEventListener("click", openEmail);
  $$(".modal-close").forEach(button => button.addEventListener("click", closeEmail));
  $("#emailModal").addEventListener("click", event => {
    if (event.target === $("#emailModal")) closeEmail();
  });

  $("#emailForm").addEventListener("submit", async event => {
    event.preventDefault();
    if (!event.currentTarget.reportValidity()) return;

    const product = products[currentIndex];
    const email = $("#customerEmail").value.trim();
    const language = $("#pdfLanguage").value;
    const sendButton = $("#sendBtn");
    const status = $("#statusNote");

    sendButton.disabled = true;
    status.style.display = "flex";

    try {
      await sendProductPdf({
        productId: product.id,
        productName: product.name,
        email,
        language,
        consent: $("#consent").checked,
        source: "exhibition-tablet"
      });

      $("#formView").style.display = "none";
      $("#successView").style.display = "block";
      $("#successProduct").textContent = product.name;
      $("#successEmail").textContent = email;
    } catch (error) {
      console.error(error);
      showToast("Odeslání se nepovedlo. Zkontrolujte připojení nebo nastavení Supabase.");
      sendButton.disabled = false;
    } finally {
      status.style.display = "none";
    }
  });

  $("#doneBtn").addEventListener("click", () => {
    closeEmail();
    $("#emailForm").reset();
  });

  $("#fullscreenBtn").addEventListener("click", async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      showToast("Režim celé obrazovky není v tomto prohlížeči dostupný.");
    }
  });

  $("#languageBtn").addEventListener("click", () => {
    showToast("Jazykové mutace doplníme v další verzi.");
  });

  $("#resetBtn").addEventListener("click", () => resetPresentation(true));
  document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeEmail();
  });

  ["pointerdown", "keydown", "touchstart"].forEach(eventName => {
    document.addEventListener(eventName, resetIdleTimer, { passive: true });
  });
}

async function init() {
  bindEvents();

  try {
    products = await loadProducts();
    renderProduct(0, false);
    renderCatalog();
    resetIdleTimer();
  } catch (error) {
    console.error(error);
    $("#catalog").innerHTML = '<p style="padding:20px;color:var(--warning)">Katalog se nepodařilo načíst.</p>';
    showToast("Katalog produktů se nepodařilo načíst.");
  }
}

init();
