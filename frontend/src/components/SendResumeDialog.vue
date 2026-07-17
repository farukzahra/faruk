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
  <v-dialog
    v-model="open"
    max-width="480"
    @after-leave="reset"
  >
    <v-card class="pa-4">
      <v-card-title class="d-flex align-center ga-2 text-h6">
        <v-icon icon="mdi-send" color="primary" />
        Enviar Currículo
      </v-card-title>

      <v-card-text>
        <p class="text-body-2 text-medium-emphasis mb-4">
          Informe os dados do envio. O currículo será enviado de
          <strong>farukz@gmail.com</strong> com PDF anexo.
        </p>

        <v-text-field
          v-model="email"
          label="E-mail do destinatário"
          type="email"
          placeholder="recruiter@company.com"
          autocomplete="email"
          :disabled="loading"
          class="mb-2"
          @keyup.enter="submit"
        />

        <v-text-field
          v-model="subject"
          label="Assunto do e-mail"
          placeholder="Application — Faruk Zahra (Senior Fullstack Engineer)"
          :disabled="loading"
          class="mb-2"
        />

        <v-select
          v-model="language"
          :items="languageOptions"
          item-title="title"
          item-value="value"
          label="Idioma do e-mail"
          :disabled="loading"
          class="mb-2"
        />

        <v-checkbox
          v-model="includeSalary"
          label="Enviar pretensão salarial?"
          :disabled="loading"
          hide-details
          class="mb-1"
        />

        <div v-if="includeSalary" class="salary-fields d-flex flex-column ga-2 mb-2">
          <v-text-field
            v-model="salaryAmount"
            label="Valor mensal"
            type="text"
            inputmode="decimal"
            placeholder="8000"
            :prefix="salaryCurrency === 'BRL' ? 'R$' : '$'"
            :disabled="loading"
          />
          <v-select
            v-model="salaryCurrency"
            :items="currencyOptions"
            item-title="title"
            item-value="value"
            label="Moeda"
            :disabled="loading"
          />
        </div>
      </v-card-text>

      <v-card-actions class="justify-end">
        <v-btn variant="text" :disabled="loading" @click="close">Cancelar</v-btn>
        <v-btn
          color="primary"
          :loading="loading"
          :disabled="!email.trim() || !subject.trim()"
          prepend-icon="mdi-send"
          @click="submit"
        >
          Enviar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
:deep(.v-card-title) {
  color: var(--navy-dark);
}
</style>
