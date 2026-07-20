<script setup lang="ts">
import { ref, watch } from "vue";
import { sendResume } from "@/lib/api";
import {
  SUBJECT_DEFAULTS,
  defaultCurrencyForLanguage,
  type EmailLanguage,
  type SalaryCurrency,
} from "@/lib/send-resume";
import { useSnackbar } from "@/composables/useSnackbar";

const open = defineModel<boolean>({ default: false });

const email = ref("");
const subject = ref(SUBJECT_DEFAULTS.en);
const language = ref<EmailLanguage>("en");
const includeSalary = ref(false);
const salaryAmount = ref("");
const salaryCurrency = ref<SalaryCurrency>("USD");
const loading = ref(false);
const snackbar = useSnackbar();

const languageOptions = [
  { title: "Inglês", value: "en" as const },
  { title: "Português", value: "pt" as const },
];

const currencyOptions = [
  { title: "USD (dólar)", value: "USD" as const },
  { title: "BRL (real)", value: "BRL" as const },
];

const selectMenuProps = {
  contentClass: "send-resume-dialog-menu",
};

watch(language, (newLang, oldLang) => {
  if (subject.value === SUBJECT_DEFAULTS[oldLang]) {
    subject.value = SUBJECT_DEFAULTS[newLang];
  }
  if (salaryCurrency.value === defaultCurrencyForLanguage(oldLang)) {
    salaryCurrency.value = defaultCurrencyForLanguage(newLang);
  }
});

function close() {
  open.value = false;
}

function reset() {
  email.value = "";
  language.value = "en";
  subject.value = SUBJECT_DEFAULTS.en;
  includeSalary.value = false;
  salaryAmount.value = "";
  salaryCurrency.value = "USD";
  loading.value = false;
}

async function submit() {
  const to = email.value.trim();
  const trimmedSubject = subject.value.trim();
  if (!to || !trimmedSubject) return;

  loading.value = true;
  try {
    await sendResume({
      to,
      subject: trimmedSubject,
      language: language.value,
      includeSalary: includeSalary.value,
      salaryAmount: includeSalary.value ? salaryAmount.value.trim() : undefined,
      salaryCurrency: includeSalary.value ? salaryCurrency.value : undefined,
    });
    snackbar.add({
      severity: "success",
      summary: "Currículo enviado de farukz@gmail.com!",
      life: 2500,
    });
    close();
  } catch (err: unknown) {
    const message = axiosMessage(err) ?? "Erro ao enviar. Tente novamente.";
    snackbar.add({ severity: "error", summary: message, life: 5000 });
  } finally {
    loading.value = false;
  }
}

function axiosMessage(err: unknown): string | undefined {
  if (typeof err !== "object" || err === null || !("response" in err)) return undefined;
  const response = (err as { response?: { data?: { error?: string } } }).response;
  const apiError = response?.data?.error;
  if (apiError?.includes("Email not configured")) {
    return "E-mail não configurado no servidor (Gmail API).";
  }
  if (apiError?.includes("Resume PDF not found")) {
    return "PDF do currículo não encontrado no servidor. Rode npm run pdf e faça deploy.";
  }
  return apiError;
}

defineExpose({ reset });
</script>

<template>
  <v-dialog v-model="open" max-width="520" @after-leave="reset">
    <v-card class="send-resume-dialog">
      <v-card-title class="send-resume-dialog__title">
        <i class="fa-solid fa-paper-plane" aria-hidden="true" />
        Enviar Currículo
      </v-card-title>

      <v-card-text class="send-resume-dialog__body">
        <p class="send-resume-dialog__lead">
          Informe os dados do envio. O currículo será enviado de
          <strong>farukz@gmail.com</strong> com PDF anexo.
        </p>

        <div class="send-resume-dialog__fields">
          <v-select
            v-model="language"
            :items="languageOptions"
            item-title="title"
            item-value="value"
            label="Idioma do e-mail"
            :disabled="loading"
            hide-details
            density="compact"
            :menu-props="selectMenuProps"
            class="send-resume-dialog__field"
          />

          <v-text-field
            v-model="email"
            label="E-mail do destinatário"
            type="email"
            placeholder="recruiter@company.com"
            autocomplete="email"
            :disabled="loading"
            hide-details
            density="compact"
            class="send-resume-dialog__field"
            @keyup.enter="submit"
          />

          <v-text-field
            v-model="subject"
            label="Assunto do e-mail"
            placeholder="Application — Faruk Zahra (Senior Fullstack Engineer)"
            :disabled="loading"
            hide-details
            density="compact"
            class="send-resume-dialog__field"
          />

          <div class="send-resume-dialog__salary-block">
            <v-checkbox
              v-model="includeSalary"
              label="Enviar pretensão salarial?"
              :disabled="loading"
              hide-details
              density="compact"
              class="send-resume-dialog__salary-check"
            />

            <div v-if="includeSalary" class="send-resume-dialog__salary-fields">
              <v-text-field
                v-model="salaryAmount"
                label="Valor mensal"
                type="text"
                inputmode="decimal"
                placeholder="8000"
                :prefix="salaryCurrency === 'BRL' ? 'R$' : '$'"
                :disabled="loading"
                hide-details
                density="compact"
                class="send-resume-dialog__field"
              />
              <v-select
                v-model="salaryCurrency"
                :items="currencyOptions"
                item-title="title"
                item-value="value"
                label="Moeda"
                :disabled="loading"
                hide-details
                density="compact"
                :menu-props="selectMenuProps"
                class="send-resume-dialog__field"
              />
            </div>
          </div>
        </div>
      </v-card-text>

      <v-card-actions class="send-resume-dialog__actions">
        <v-btn variant="text" class="send-resume-dialog__btn-cancel" :disabled="loading" @click="close">
          Cancelar
        </v-btn>
        <v-btn
          class="send-resume-dialog__btn-send"
          :loading="loading"
          :disabled="!email.trim() || !subject.trim()"
          @click="submit"
        >
          <i class="fa-solid fa-paper-plane" aria-hidden="true" />
          Enviar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.send-resume-dialog {
  --dialog-paper: oklch(17% 0.016 265);
  --dialog-ink: oklch(96% 0.006 262);
  --dialog-ink-2: oklch(72% 0.008 262);
  --dialog-accent: oklch(76% 0.17 50);
  --dialog-rule: oklch(96% 0.006 262 / 0.14);
  --dialog-field-bg: oklch(13% 0.014 265 / 0.65);

  background: var(--dialog-paper) !important;
  border: 1px solid var(--dialog-rule);
  color: var(--dialog-ink-2);
  font-family: "Geist", "Open Sans", system-ui, sans-serif;
}

.send-resume-dialog__title {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 20px 20px 0;
  font-family: "Instrument Serif", Georgia, serif;
  font-size: 1.35rem;
  font-weight: 400;
  letter-spacing: 0.02em;
  color: var(--dialog-ink);
}

.send-resume-dialog__title i {
  color: var(--dialog-accent);
  font-size: 1rem;
}

.send-resume-dialog__body {
  padding: 12px 20px 8px;
}

.send-resume-dialog__lead {
  margin: 0 0 16px;
  font-size: 0.875rem;
  line-height: 1.55;
  color: var(--dialog-ink-2);
}

.send-resume-dialog__lead strong {
  color: var(--dialog-ink);
  font-weight: 600;
}

.send-resume-dialog__fields {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.send-resume-dialog__field {
  width: 100%;
}

.send-resume-dialog :deep(.send-resume-dialog__field.v-input) {
  margin-top: 0;
  margin-bottom: 0;
}

.send-resume-dialog :deep(.send-resume-dialog__field .v-input__details) {
  display: none;
  min-height: 0;
  padding: 0;
}

.send-resume-dialog__salary-block {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 0;
  padding: 0;
}

.send-resume-dialog__salary-fields {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

.send-resume-dialog__salary-check :deep(.v-input) {
  margin: 0 !important;
}

.send-resume-dialog__salary-check :deep(.v-input__control) {
  min-height: auto;
}

.send-resume-dialog__actions {
  padding: 8px 16px 16px;
  gap: 8px;
}

.send-resume-dialog__btn-send {
  background: var(--dialog-accent) !important;
  color: oklch(15% 0.014 265) !important;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.send-resume-dialog__btn-send i {
  margin-right: 6px;
}

.send-resume-dialog__btn-cancel {
  color: var(--dialog-ink-2) !important;
}

.send-resume-dialog :deep(.v-label),
.send-resume-dialog :deep(.v-field-label) {
  color: var(--dialog-accent) !important;
  font-family: "JetBrains Mono", ui-monospace, monospace;
  font-size: 0.68rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  opacity: 0.85;
}

.send-resume-dialog :deep(.v-field) {
  color: var(--dialog-ink);
  background: var(--dialog-field-bg);
  border-radius: 8px;
}

.send-resume-dialog :deep(.v-field__overlay) {
  background-color: var(--dialog-field-bg);
  opacity: 1;
}

.send-resume-dialog :deep(.v-field__append-inner .v-icon) {
  color: var(--dialog-accent);
  opacity: 0.85;
}

.send-resume-dialog :deep(.v-field__outline) {
  color: var(--dialog-rule);
}

.send-resume-dialog :deep(.v-field--focused .v-field__outline) {
  color: var(--dialog-accent);
}

.send-resume-dialog :deep(.v-field__input),
.send-resume-dialog :deep(.v-select__selection-text) {
  color: var(--dialog-ink);
  font-size: 0.9rem;
}

.send-resume-dialog :deep(.v-field__prepend-inner),
.send-resume-dialog :deep(input::placeholder) {
  color: oklch(72% 0.008 262 / 0.55);
}

.send-resume-dialog__salary-check {
  margin: 0;
  padding: 0;
  min-height: 0;
}

.send-resume-dialog__salary-check :deep(.v-selection-control) {
  min-height: 0;
  gap: 10px;
}

.send-resume-dialog__salary-check :deep(.v-selection-control__wrapper) {
  width: 18px;
  height: 18px;
  margin-inline-end: 0;
}

.send-resume-dialog__salary-check :deep(.v-label) {
  padding-inline-start: 0;
  margin-inline-start: 0;
  font-family: "Geist", "Open Sans", system-ui, sans-serif !important;
  font-size: 0.875rem !important;
  letter-spacing: normal !important;
  text-transform: none !important;
  color: var(--dialog-ink-2) !important;
  opacity: 1 !important;
}

.send-resume-dialog :deep(.v-checkbox-btn .v-icon) {
  color: var(--dialog-accent);
}
</style>

<style>
.send-resume-dialog-menu {
  --dialog-paper: oklch(17% 0.016 265);
  --dialog-ink: oklch(96% 0.006 262);
  --dialog-ink-2: oklch(72% 0.008 262);
  --dialog-accent: oklch(76% 0.17 50);
  --dialog-field-bg: oklch(13% 0.014 265 / 0.95);
  --dialog-rule: oklch(96% 0.006 262 / 0.14);
}

.send-resume-dialog-menu.v-overlay__content,
.send-resume-dialog-menu .v-list {
  background: var(--dialog-field-bg) !important;
  color: var(--dialog-ink);
}

.send-resume-dialog-menu.v-overlay__content {
  border: 1px solid var(--dialog-rule);
  border-radius: 8px;
  box-shadow: 0 12px 32px oklch(8% 0.014 265 / 0.55);
}

.send-resume-dialog-menu .v-list-item {
  color: var(--dialog-ink-2);
  min-height: 40px;
}

.send-resume-dialog-menu .v-list-item-title {
  color: inherit;
  font-size: 0.9rem;
}

.send-resume-dialog-menu .v-list-item--active,
.send-resume-dialog-menu .v-list-item:hover {
  background: oklch(96% 0.006 262 / 0.08) !important;
  color: var(--dialog-ink);
}
</style>
