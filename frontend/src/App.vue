<script setup lang="ts">
import { useLumenTheme } from "@/composables/useLumenTheme";
import AppFooter from "@/components/AppFooter.vue";
import AppSnackbar from "@/components/AppSnackbar.vue";
import AppTopNav from "@/components/AppTopNav.vue";

useLumenTheme();
</script>

<template>
  <v-app>
    <AppTopNav />
    <router-view />
    <AppFooter />
    <AppSnackbar />
  </v-app>
</template>
