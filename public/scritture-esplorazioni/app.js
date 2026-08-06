const variants = {
  t1: { family: "Terminale letterario", number: "01", name: "Archivio a cartelle" },
  t2: { family: "Terminale letterario", number: "02", name: "Finestra d’archivio" },
  t3: { family: "Terminale letterario", number: "03", name: "Console tipografica" },
  g1: { family: "Gazzetta d’autrice", number: "04", name: "Prima pagina classica" },
  g2: { family: "Gazzetta d’autrice", number: "05", name: "Feuilleton verticale" },
  g3: { family: "Gazzetta d’autrice", number: "06", name: "Giornale d’archivio" },
};

const order = Object.keys(variants);
const params = new URLSearchParams(window.location.search);
const requested = params.get("v");
const current = variants[requested] ? requested : "t1";
const currentIndex = order.indexOf(current);
const data = variants[current];

document.body.classList.add(current);
if (params.get("embed") === "1") document.body.classList.add("embed");

document.querySelectorAll("[data-family]").forEach((node) => { node.textContent = data.family; });
document.querySelectorAll("[data-number]").forEach((node) => { node.textContent = data.number; });
document.querySelectorAll("[data-name]").forEach((node) => { node.textContent = data.name; });

document.querySelector("[data-prev]").href = `layout.html?v=${order[(currentIndex - 1 + order.length) % order.length]}`;
document.querySelector("[data-next]").href = `layout.html?v=${order[(currentIndex + 1) % order.length]}`;
document.title = `${data.number} · ${data.name} — Il vizio della scrittura`;
