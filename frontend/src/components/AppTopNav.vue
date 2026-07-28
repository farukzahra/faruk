<script setup lang="ts">
import { useRoute } from "vue-router";

const route = useRoute();

type InternalLink = { kind: "internal"; name: string; label: string; to: string };
type ExternalLink = { kind: "external"; label: string; href: string };
type NavLink = InternalLink | ExternalLink;

const links: NavLink[] = [
  { kind: "internal", name: "resume", label: "Resume", to: "/" },
  { kind: "external", label: "Blog", href: "https://blog.faruk.dev.br/" },
  { kind: "internal", name: "projects", label: "My Projects", to: "/projects" },
  { kind: "internal", name: "about", label: "About", to: "/about" },
];
</script>

<template>
  <nav class="app-top-nav" aria-label="Site navigation">
    <template v-for="link in links" :key="link.kind === 'internal' ? link.name : link.href">
      <router-link
        v-if="link.kind === 'internal'"
        :to="link.to"
        :aria-current="route.name === link.name ? 'page' : undefined"
      >
        {{ link.label }}
      </router-link>
      <a v-else :href="link.href" target="_blank" rel="noreferrer">
        {{ link.label }}
      </a>
    </template>
  </nav>
</template>
