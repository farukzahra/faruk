<script setup lang="ts">
import { ref } from "vue";
import { sendResume } from "@/lib/api";
import { useSnackbar } from "@/composables/useSnackbar";

const open = defineModel<boolean>({ default: false });

const email = ref("");
const loading = ref(false);
const snackbar = useSnackbar();

function close() {
  open.value = false;
}

function reset() {
  email.value = "";
  loading.value = false;
}

async function submit() {
  const to = email.value.trim();
  if (!to) return;

  loading.value = true;
  try {
    await sendResume(to);
    snackbar.add({
      severity: "success",
      summary: "Currículo enviado de farukz@gmail.com!",
      life: 2500,
    });
    close();
  } catch (err: unknown) {
    const message =
      axiosMessage(err) ?? "Erro ao enviar. Tente novamente.";
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
  return apiError;
}

defineExpose({ reset });
</script>

<template>
  <v-dialog
    v-model="open"
    max-width="420"
    @after-leave="reset"
  >
    <v-card class="pa-4">
      <v-card-title class="d-flex align-center ga-2 text-h6">
        <v-icon icon="mdi-send" color="primary" />
        Enviar Currículo
      </v-card-title>

      <v-card-text>
        <p class="text-body-2 text-medium-emphasis mb-4">
          Informe o e-mail do destinatário. O currículo será enviado de
          <strong>farukz@gmail.com</strong> com PDF anexo.
        </p>

        <v-text-field
          v-model="email"
          label="E-mail do destinatário"
          type="email"
          placeholder="recruiter@company.com"
          autocomplete="email"
          :disabled="loading"
          @keyup.enter="submit"
        />
      </v-card-text>

      <v-card-actions class="justify-end">
        <v-btn variant="text" :disabled="loading" @click="close">Cancelar</v-btn>
        <v-btn color="primary" :loading="loading" prepend-icon="mdi-send" @click="submit">
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
