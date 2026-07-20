<script setup lang="ts">
import { useRoute } from "vue-router";

const route = useRoute();

const links = [
  { name: "resume" as const, label: "Resume", to: "/" },
  { name: "projects" as const, label: "My Projects", to: "/projects" },
  { name: "about" as const, label: "About", to: "/about" },
];
</script>

<template>
  <nav class="app-top-nav" aria-label="Site navigation">
    <router-link
      v-for="link in links"
      :key="link.name"
      :to="link.to"
      :aria-current="route.name === link.name ? 'page' : undefined"
    >
      {{ link.label }}
    </router-link>
  </nav>
</template>
