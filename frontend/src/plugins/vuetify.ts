import "vuetify/styles";
import "@mdi/font/css/materialdesignicons.css";
import { createVuetify } from "vuetify";
import { en } from "vuetify/locale";

const farukTheme = {
  dark: false,
  colors: {
    primary: "#3d7ab8",
    secondary: "#1a3d63",
    accent: "#e8edf2",
    success: "#1a7a3a",
    warning: "#ca8a04",
    error: "#b42318",
    info: "#3d7ab8",
    background: "#e8edf2",
    surface: "#ffffff",
  },
};

export default createVuetify({
  locale: {
    locale: "en",
    messages: { en },
  },
  theme: {
    defaultTheme: "faruk",
    themes: {
      faruk: farukTheme,
    },
  },
  defaults: {
    VBtn: {
      rounded: "lg",
    },
    VTextField: {
      variant: "outlined",
      density: "compact",
      hideDetails: "auto",
    },
  },
});
