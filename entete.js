/* ===== entete.js : charge l'en-tête commun (entete.html) dans la page =====
   Dans la page : <div id="entete"></div> à l'endroit de l'en-tête, puis
   <script src="entete.js"></script> APRÈS Bootstrap.
   Les scripts qui ont besoin de l'en-tête attendent la promesse « enteteChargee ». */
window.enteteChargee = (async function () {
  const zone = document.getElementById("entete");
  if (!zone) return;
  try {
    const reponse = await fetch("entete.html");
    if (!reponse.ok) throw new Error("entete.html : erreur " + reponse.status);
    zone.outerHTML = await reponse.text(); // l'en-tête remplace la zone vide

    /* script.js a besoin de l'en-tête (compteur du panier, connexion, profil) :
       on le charge seulement maintenant */
    await new Promise(function (ok, erreur) {
      const s = document.createElement("script");
      s.src = "script.js";
      s.onload = ok;
      s.onerror = erreur;
      document.body.appendChild(s);
    });
  } catch (e) {
    console.error("Impossible de charger l'en-tête :", e);
    zone.textContent = "En-tête indisponible (ouvre la page avec un serveur, pas en double-cliquant le fichier).";
  }
})();
