<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const year = new Date().getFullYear();

const routeName = computed(() => route.name);
</script>

<template>
  <footer class="site-footer" aria-label="Rodapé do site">
    <div class="site-footer__inner">
      <p class="site-footer__copy">
        © {{ year }} Faruk Zahra ·
        <a href="https://www.faruk.dev.br" target="_blank" rel="noreferrer">www.faruk.dev.br</a>
      </p>
      <nav class="site-footer__nav" aria-label="Links do rodapé">
        <router-link v-if="routeName !== 'resume'" to="/">Currículo</router-link>
        <router-link v-if="routeName !== 'projects'" to="/projects">My Projects</router-link>
        <router-link v-if="routeName !== 'about'" to="/about">Sobre</router-link>
      </nav>
    </div>
  </footer>
</template>
