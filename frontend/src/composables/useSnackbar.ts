import { reactive } from "vue";

type SnackbarSeverity = "success" | "error" | "warn" | "info";

type SnackbarOptions = {
  severity?: SnackbarSeverity;
  summary: string;
  detail?: string;
  life?: number;
};

const state = reactive({
  show: false,
  message: "",
  color: "success" as string,
  timeout: 3000,
});

const severityColor: Record<SnackbarSeverity, string> = {
  success: "success",
  error: "error",
  warn: "warning",
  info: "info",
};

export function useSnackbar() {
  return {
    state,
    add(options: SnackbarOptions) {
      const severity = options.severity ?? "success";
      state.message = options.detail
        ? `${options.summary}: ${options.detail}`
        : options.summary;
      state.color = severityColor[severity];
      state.timeout = options.life ?? 3000;
      state.show = true;
    },
  };
}
