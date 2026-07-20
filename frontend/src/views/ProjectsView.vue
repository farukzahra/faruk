<script setup lang="ts">
import { onMounted, ref } from "vue";
import { fetchProjects, type Project } from "@/lib/projects";

const projects = ref<Project[]>([]);
const loadError = ref("");

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
  <main class="projects-page">
    <header class="projects-page__header">
      <h1>
        <span class="section-icon"><i class="fa-solid fa-diagram-project" /></span>
        My Projects
      </h1>
      <p class="projects-page__lead">
        Selected personal and professional projects. Each card links to the live site or main
        repository entry point.
      </p>
    </header>

    <p v-if="loadError" class="projects-error">{{ loadError }}</p>

    <div v-else-if="projects.length === 0" class="projects-empty">
      <p>No projects listed yet.</p>
    </div>

    <ul v-else class="projects-grid" aria-label="Project list">
      <li v-for="project in projects" :key="project.id" class="project-card">
        <h2 class="project-card__title">{{ project.name }}</h2>
        <p class="project-card__description">{{ project.description }}</p>
        <a
          class="project-card__link"
          :href="project.url"
          target="_blank"
          rel="noreferrer"
        >
          Visit project
          <i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true" />
        </a>
      </li>
    </ul>
  </main>
</template>
