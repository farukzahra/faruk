<script setup lang="ts">
import { onMounted, ref } from "vue";
import {
  fetchReleaseHistory,
  releaseFieldRules,
  versionBumpRules,
  type ReleaseHistory,
} from "@/lib/release-history";

const history = ref<ReleaseHistory | null>(null);
const loadError = ref("");

onMounted(async () => {
  try {
    history.value = await fetchReleaseHistory();
  } catch {
    loadError.value = "Não foi possível carregar o histórico de releases.";
  }
});
</script>

<template>
  <main class="about-page about-page--lumen">
    <header class="about-page__header">
      <h1>Sobre este site</h1>
      <p>
        Versão atual:
        <strong>{{ history?.currentVersion ?? "…" }}</strong>
      </p>
      <p class="about-page__lead">
        Cada entrega visível ao usuário é registrada em
        <code>docs/release-history.json</code>, seguindo a skill
        <strong>semantic-version</strong> do Faruk Base. O bump de versão ocorre
        apenas no fluxo <code>/commit-push</code>, junto com
        <code>caveman-commit</code>.
      </p>
    </header>

    <section class="about-section">
      <h2>
        <span class="section-icon"><i class="fa-solid fa-arrow-up-right-dots" /></span>
        Regras de bump de versão
      </h2>
      <div class="about-table-wrap">
        <table class="about-table">
          <thead>
            <tr>
              <th scope="col">Mudança</th>
              <th scope="col">Bump</th>
              <th scope="col">Exemplo</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="rule in versionBumpRules" :key="rule.change">
              <td>{{ rule.change }}</td>
              <td><span class="about-badge">{{ rule.bump }}</span></td>
              <td><code>{{ rule.example }}</code></td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section class="about-section">
      <h2>
        <span class="section-icon"><i class="fa-solid fa-table" /></span>
        Campos de <code>release-history.json</code>
      </h2>
      <div class="about-table-wrap">
        <table class="about-table">
          <thead>
            <tr>
              <th scope="col">Campo</th>
              <th scope="col">Regras</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in releaseFieldRules" :key="row.field">
              <td><code>{{ row.field }}</code></td>
              <td>{{ row.rules }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section class="about-section about-section--last">
      <h2>
        <span class="section-icon"><i class="fa-solid fa-clock-rotate-left" /></span>
        Histórico de releases
      </h2>

      <p v-if="loadError" class="about-error">{{ loadError }}</p>

      <div v-else-if="history" class="about-table-wrap">
        <table class="about-table about-table--releases">
          <thead>
            <tr>
              <th scope="col">Versão</th>
              <th scope="col">Data</th>
              <th scope="col">Tipo</th>
              <th scope="col">Título</th>
              <th scope="col">Resumo</th>
              <th scope="col">Commit</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="entry in history.entries" :key="entry.version">
              <td><strong>{{ entry.version }}</strong></td>
              <td>{{ entry.date }}</td>
              <td><span class="about-badge about-badge--type">{{ entry.type }}</span></td>
              <td>{{ entry.title }}</td>
              <td>{{ entry.summary }}</td>
              <td>
                <code v-if="entry.commit">{{ entry.commit }}</code>
                <span v-else class="about-muted">—</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p v-else class="about-muted">Carregando histórico…</p>
    </section>
  </main>
</template>
