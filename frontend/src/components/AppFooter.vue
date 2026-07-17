<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const year = new Date().getFullYear();

const isAbout = computed(() => route.name === "about");
</script>

<template>
  <footer class="site-footer" aria-label="Rodapé do site">
    <div class="site-footer__inner">
      <p class="site-footer__copy">
        © {{ year }} Faruk Zahra ·
        <a href="https://faruk.dev.br" target="_blank" rel="noreferrer">faruk.dev.br</a>
      </p>
      <nav class="site-footer__nav" aria-label="Links do rodapé">
        <router-link v-if="isAbout" to="/">Currículo</router-link>
        <router-link v-else to="/about">Sobre</router-link>
      </nav>
    </div>
  </footer>
</template>
