<script setup lang="ts">
const year = new Date().getFullYear();
</script>

<template>
  <footer class="site-footer site-footer--lumen" aria-label="Site footer">
    <div class="site-footer__inner">
      <p class="site-footer__copy">
        © {{ year }} Faruk Zahra ·
        <a href="https://www.faruk.dev.br" target="_blank" rel="noreferrer">www.faruk.dev.br</a>
      </p>
    </div>
  </footer>
</template>
