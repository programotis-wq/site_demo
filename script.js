/* =========================================================
   script.js
   Regroupe tout le JavaScript du site (anciennement dispersé
   dans plusieurs balises <script> à l'intérieur de chaque page).
   À inclure sur toutes les pages avec :
     <script src="script.js"></script>
   ========================================================= */

/* ========== Heures d'ouverture ========== */
const schedule = {
  1: [{ start: "06:00", end: "22:00" }],
  2: [{ start: "06:00", end: "22:00" }],
  3: [{ start: "06:00", end: "22:00" }],
  4: [{ start: "06:00", end: "22:00" }],
  5: [{ start: "06:00", end: "22:00" }],
  6: [{ start: "07:00", end: "22:00" }],
  0: [{ start: "07:00", end: "21:00" }],
};

function toMinutes(t) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function isOpenNow(date = new Date()) {
  const day = date.getDay();
  const current = date.getHours() * 60 + date.getMinutes();
  const slots = schedule[day] || [];
  return slots.some(({ start, end }) => {
    const s = toMinutes(start),
      e = toMinutes(end);
    return e > s ? current >= s && current < e : current >= s || current < e;
  });
}

function updateOpenStatus() {
  const el = document.getElementById("openStatus");
  if (!el) return;
  if (isOpenNow()) {
    el.textContent = "Ouvert présentement";
    el.classList.remove("bg-danger");
    el.classList.add("bg-success");
  } else {
    el.textContent = "Fermé présentement";
    el.classList.remove("bg-success");
    el.classList.add("bg-danger");
  }
}

/* ========== Panier ========== */
const CART_KEY = "cartCount";

function getCartCount() {
  return Number(localStorage.getItem(CART_KEY)) || 0;
}

function setCartCount(count) {
  const n = Math.max(0, Number(count) || 0);
  localStorage.setItem(CART_KEY, String(n));
  updateCartBadge();
}

function addToCart(q = 1) {
  setCartCount(getCartCount() + Number(q || 1));
}

function removeFromCart(q = 1) {
  setCartCount(getCartCount() - Number(q || 1));
}

function resetCart() {
  setCartCount(0);
}

function updateCartBadge() {
  const badge = document.getElementById("cartCount");
  if (!badge) return;
  const count = getCartCount();
  badge.textContent = count > 99 ? "99+" : String(count);
  badge.setAttribute(
    "aria-label",
    `${count} article${count > 1 ? "s" : ""} dans le panier`,
  );
  badge.classList.toggle("hidden", count === 0);
}

/* ========== Formulaire "Créer un profil" : persistance du brouillon ========== */
const PROFILE_LS_KEY = "createProfileData"; // brouillon du formulaire
const OPEN_KEY = "openCreateProfile"; // réouvrir le dropdown au retour des conditions
const TERMS_KEY = "acceptedTerms"; // cocher "J'accepte" au retour (posé par conditions)

function initCreateProfileForm() {
  const dropdownToggle = document.getElementById("createProfileDropdown");
  const form = document.getElementById("createProfileForm");
  if (!form) return; // page sans ce formulaire : rien à faire

  const firstName = document.getElementById("firstName");
  const lastName = document.getElementById("lastName");
  const email = document.getElementById("email");
  const phone = document.getElementById("phone");
  const password = document.getElementById("password");
  const terms = document.getElementById("terms");
  const termsLink = document.getElementById("termsLink");

  // Restauration du brouillon
  try {
    const saved = JSON.parse(localStorage.getItem(PROFILE_LS_KEY) || "{}");
    if (firstName && saved.firstName) firstName.value = saved.firstName;
    if (lastName && saved.lastName) lastName.value = saved.lastName;
    if (email && saved.email) email.value = saved.email;
    if (phone && saved.phone) phone.value = saved.phone;
    if (password && saved.password) password.value = saved.password;
    if (terms && typeof saved.terms === "boolean") terms.checked = saved.terms;
  } catch (_) {
    /* brouillon absent ou invalide : on ignore */
  }

  // Persistance du brouillon à chaque changement
  const persist = () => {
    const data = {
      firstName: firstName ? firstName.value : "",
      lastName: lastName ? lastName.value : "",
      email: email ? email.value : "",
      phone: phone ? phone.value : "",
      password: password ? password.value : "",
      terms: terms ? terms.checked : false,
    };
    localStorage.setItem(PROFILE_LS_KEY, JSON.stringify(data));
  };
  [firstName, lastName, email, phone, password, terms]
    .filter(Boolean)
    .forEach((el) => {
      el.addEventListener("input", persist);
      el.addEventListener("change", persist);
    });

  // Clic sur le lien des conditions : garder le brouillon et indiquer la réouverture
  if (termsLink) {
    termsLink.addEventListener(
      "click",
      () => {
        persist();
        localStorage.setItem(OPEN_KEY, "1");
      },
      { passive: true },
    );
  }

  // Au retour depuis la page conditions
  const shouldOpen = localStorage.getItem(OPEN_KEY) === "1";
  const shouldCheckTerms = localStorage.getItem(TERMS_KEY) === "1";
  if (shouldOpen || shouldCheckTerms) {
    localStorage.removeItem(OPEN_KEY);
    if (dropdownToggle) {
      const dd = bootstrap.Dropdown.getOrCreateInstance(dropdownToggle);
      dd.show();
      setTimeout(() => {
        if (shouldCheckTerms && terms) {
          terms.checked = true;
          persist();
          localStorage.removeItem(TERMS_KEY);
        }
        if (firstName) firstName.focus();
      }, 150);
    }
  }

  // Nettoyer le brouillon après un submit réussi
  form.addEventListener("submit", () => {
    localStorage.removeItem(PROFILE_LS_KEY);
  });
}

/* ========== Authentification (connexion / déconnexion) ========== */
function initAuth() {
  const loginBtns = document.querySelectorAll("[data-login-btn]");
  const logoutBtn = document.getElementById("logoutBtn");
  const loginModalEl = document.getElementById("loginModal");
  const loginForm = document.getElementById("loginForm");
  const loginEmail = document.getElementById("loginEmail");
  const loginPassword = document.getElementById("loginPassword");
  const loginError = document.getElementById("loginError");

  const getProfile = () => {
    try {
      return JSON.parse(localStorage.getItem(PROFILE_LS_KEY) || "{}");
    } catch (e) {
      return {};
    }
  };
  const isAuthenticated = () => !!localStorage.getItem("userToken");

  function updateAuthUI() {
    if (isAuthenticated()) {
      loginBtns.forEach((btn) => btn.classList.add("d-none"));
      if (logoutBtn) logoutBtn.classList.remove("d-none");
    } else {
      loginBtns.forEach((btn) => btn.classList.remove("d-none"));
      if (logoutBtn) logoutBtn.classList.add("d-none");
    }
  }

  updateAuthUI();

  // Pré-remplir l'email si un profil existe déjà
  loginBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (loginError) loginError.classList.add("d-none");
      if (loginForm) loginForm.classList.remove("was-validated");
      const profile = getProfile();
      if (loginEmail) loginEmail.value = profile.email || "";
      if (loginPassword) loginPassword.value = "";
    });
  });

  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      loginForm.classList.add("was-validated");
      if (!loginForm.checkValidity()) return;
      const profile = getProfile();
      const ok =
        profile.email &&
        profile.password &&
        profile.email.trim() === loginEmail.value.trim() &&
        profile.password === loginPassword.value;
      if (ok) {
        localStorage.setItem("userToken", "demo-token-" + Date.now());
        if (loginError) loginError.classList.add("d-none");
        const modal = bootstrap.Modal.getOrCreateInstance(loginModalEl);
        modal.hide();
        updateAuthUI();
      } else if (loginError) {
        loginError.textContent =
          "Identifiants invalides. Créez d'abord votre profil ou vérifiez votre courriel/mot de passe.";
        loginError.classList.remove("d-none");
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("userToken");
      updateAuthUI();
    });
  }
}

/* ========== Page "Conditions d'utilisation" : case cochée -> flags + redirection ========== */
function initConditionsPage() {
  const checkbox = document.getElementById("acceptConditions");
  if (!checkbox) return; // page sans cette case : rien à faire

  checkbox.addEventListener("change", () => {
    if (!checkbox.checked) return;

    // Indicateurs pour index.html : ouvrir le dropdown + cocher "J'accepte"
    localStorage.setItem(OPEN_KEY, "1");
    localStorage.setItem(TERMS_KEY, "1");

    // Redirection vers la page d'accueil
    window.location.href = "index.html";
  });
}

// =========================================================
// Effet d'eau — Dépanneur du Lac-Moustique
// Ordinateur : ondes qui suivent le curseur sur toute la page
//              + onde concentrique au clic sur le logo
// Mobile     : des gouttes tombent toutes seules sur le logo, en boucle
// =========================================================
(() => {
  const logo = document.querySelector(".logo-text");

  // Moins d'animations demandées : on ne fait rien
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  // Couche fixe qui couvre toute la fenêtre (créée au premier besoin)
  let couche = null;
  function obtenirCouche() {
    if (!couche) {
      couche = document.createElement("div");
      couche.className = "couche-ondes";
      couche.setAttribute("aria-hidden", "true");
      document.body.appendChild(couche);
    }
    return couche;
  }

  // Crée une onde à la position (x, y) à l'intérieur de "conteneur"
  function creerOnde(
    conteneur,
    x,
    y,
    { taille, epaisseur, force, duree, delai = 0 },
  ) {
    const onde = document.createElement("span");
    onde.className = "onde";
    onde.setAttribute("aria-hidden", "true");
    onde.style.setProperty("--ox", x + "px");
    onde.style.setProperty("--oy", y + "px");
    onde.style.setProperty("--taille", taille + "px");
    onde.style.setProperty("--epaisseur", epaisseur + "px");
    onde.style.setProperty("--force", force);
    onde.style.setProperty("--duree", duree + "s");
    onde.style.setProperty("--delai", delai + "s");
    onde.addEventListener("animationend", () => onde.remove());
    conteneur.appendChild(onde);
  }

  // Trois ondes concentriques, de plus en plus faibles
  function goutte(conteneur, x, y, tailleMax) {
    creerOnde(conteneur, x, y, {
      taille: tailleMax,
      epaisseur: 2.5,
      force: 1,
      duree: 1.8,
    });
    creerOnde(conteneur, x, y, {
      taille: tailleMax * 0.75,
      epaisseur: 2,
      force: 0.85,
      duree: 1.8,
      delai: 0.18,
    });
    creerOnde(conteneur, x, y, {
      taille: tailleMax * 0.5,
      epaisseur: 1.5,
      force: 0.7,
      duree: 1.8,
      delai: 0.36,
    });
  }

  const sansSurvol = window.matchMedia("(hover: none)").matches;

  if (sansSurvol) {
    // ===== MOBILE : boucle automatique sur le logo =====
    if (!logo) return;

    function prochaineGoutte() {
      if (!document.hidden) {
        // pause quand l'onglet est caché (batterie)
        const L = logo.offsetWidth,
          H = logo.offsetHeight;
        const x = L * (0.08 + Math.random() * 0.84);
        const y = H * (0.35 + Math.random() * 0.3);
        if (Math.random() < 0.33) {
          goutte(logo, x, y, 138); // une goutte plus franche
        } else {
          creerOnde(logo, x, y, {
            taille: 80,
            epaisseur: 3,
            force: 0.8,
            duree: 1.4,
          });
        }
      }
      setTimeout(prochaineGoutte, 900 + Math.random() * 900); // intervalle irrégulier, plus naturel
    }
    prochaineGoutte();
  } else {
    // ===== ORDINATEUR : ondes qui suivent le curseur sur toute la page =====
    let dernierePosition = null;

    document.addEventListener("mousemove", (e) => {
      const x = e.clientX,
        y = e.clientY; // position dans la fenêtre
      if (
        dernierePosition &&
        Math.hypot(x - dernierePosition.x, y - dernierePosition.y) < 18
      )
        return;
      dernierePosition = { x, y };
      creerOnde(obtenirCouche(), x, y, {
        taille: 74,
        epaisseur: 3,
        force: 0.85,
        duree: 1.1,
      });
    });
    document.documentElement.addEventListener("mouseleave", () => {
      dernierePosition = null;
    });

    // Clic : onde concentrique, toujours sur le logo
    if (logo) {
      logo.addEventListener("click", (e) => {
        const zone = logo.getBoundingClientRect();
        // Trois ondes concentriques, de plus en plus faibles
        function goutte(conteneur, x, y, tailleMax) {
          creerOnde(conteneur, x, y, {
            taille: tailleMax,
            epaisseur: 3.5,
            force: 1,
            duree: 1.8,
          });
          creerOnde(conteneur, x, y, {
            taille: tailleMax * 0.75,
            epaisseur: 3,
            force: 0.85,
            duree: 1.8,
            delai: 0.18,
          });
          creerOnde(conteneur, x, y, {
            taille: tailleMax * 0.5,
            epaisseur: 2.5,
            force: 0.7,
            duree: 1.8,
            delai: 0.36,
          });
        }
      });
    }
  }
})();
/* ========== Point d'entrée : tout s'initialise une fois la page chargée ========== */
function demarrer() {
  updateOpenStatus();
  updateCartBadge();
  setInterval(updateOpenStatus, 60_000);

  initCreateProfileForm();
  initAuth();
  initConditionsPage();
}

/* Page encore en chargement : on attend la fin.
   Page déjà chargée (cas de l'en-tête chargé par entete.js) : on démarre tout de suite. */
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", demarrer);
} else {
  demarrer();
}
