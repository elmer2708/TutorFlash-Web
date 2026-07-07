document.addEventListener("DOMContentLoaded", () => {
  const btnInfoMenu = document.querySelector("#btnInfoMenu");
  const infoHeader = document.querySelector(".tf-info-header");
  const infoLinks = document.querySelectorAll(".tf-info-nav a");

  btnInfoMenu?.addEventListener("click", () => {
    infoHeader?.classList.toggle("is-open");
  });

  infoLinks.forEach((link) => {
    link.addEventListener("click", () => {
      infoHeader?.classList.remove("is-open");
    });
  });
});
