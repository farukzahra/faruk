<script setup lang="ts">
import AppSnackbar from "@/components/AppSnackbar.vue";
import AppFooter from "@/components/AppFooter.vue";
</script>

<template>
  <v-app>
    <router-view />
    <AppFooter />
    <AppSnackbar />
  </v-app>
</template>
