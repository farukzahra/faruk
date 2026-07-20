<script setup lang="ts">
import { onMounted, ref } from "vue";
import { fetchProjects, type Project } from "@/lib/projects";
const projects = ref<Project[]>([]);
const loadError = ref("");

const stackLabels: Record<string, string> = {
  "faruk-resume": "VUE 3 · EXPRESS",
  financeiro: "FASTIFY · POSTGRESQL",
  "job-hunter": "VUE 3 · TYPESCRIPT",
};

function projectHost(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function stackLabel(project: Project): string {
  return stackLabels[project.id] ?? "LIVE · DEPLOYED";
}

onMounted(async () => {
  try {
    const catalog = await fetchProjects();
    projects.value = catalog.projects;
  } catch {
    loadError.value = "Could not load projects.";
  }
});
</script>
<template>
  <main class="projects-page projects-page--lumen">
    <section class="projects-lumen-list" aria-label="Project list">
      <p v-if="loadError" class="projects-lumen-error">{{ loadError }}</p>

      <p v-else-if="projects.length === 0" class="projects-lumen-empty">No projects listed yet.</p>

      <ul v-else class="projects-lumen-grid">
        <li v-for="project in projects" :key="project.id" class="projects-lumen-card">
          <p class="projects-lumen-card__eyebrow">{{ stackLabel(project) }}</p>
          <h2 class="projects-lumen-card__title">{{ project.name }}</h2>
          <p class="projects-lumen-card__description">{{ project.description }}</p>
          <a
            class="projects-lumen-card__link"
            :href="project.url"
            target="_blank"
            rel="noreferrer"
          >
            visit · {{ projectHost(project.url) }}
          </a>
        </li>
      </ul>
    </section>
  </main>
</template>
