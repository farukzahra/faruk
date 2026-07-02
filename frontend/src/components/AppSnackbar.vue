<script setup lang="ts">
import { useSnackbar } from "@/composables/useSnackbar";

const { state } = useSnackbar();
</script>

<template>
  <v-snackbar v-model="state.show" :color="state.color" :timeout="state.timeout" location="top">
    {{ state.message }}
  </v-snackbar>
</template>
