import { onBeforeUnmount, onMounted } from "vue";

const LUMEN_BODY_CLASS = "lumen-theme-active";
const LUMEN_FONTS_ID = "lumen-fonts";

function loadLumenFonts() {
  if (document.getElementById(LUMEN_FONTS_ID)) return;

  const google = document.createElement("link");
  google.id = LUMEN_FONTS_ID;
  google.rel = "stylesheet";
  google.href =
    "https://fonts.googleapis.com/css2?family=Instrument+Serif&family=JetBrains+Mono:wght@400;500&display=swap";
  document.head.appendChild(google);

  const geist = document.createElement("link");
  geist.rel = "stylesheet";
  geist.href = "https://cdn.jsdelivr.net/npm/geist@1.3.1/dist/fonts/geist-sans/style.css";
  document.head.appendChild(geist);
}

export function useLumenTheme() {
  onMounted(() => {
    loadLumenFonts();
    document.body.classList.add(LUMEN_BODY_CLASS);
  });

  onBeforeUnmount(() => {
    document.body.classList.remove(LUMEN_BODY_CLASS);
  });
}
