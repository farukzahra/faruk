import { createRouter, createWebHistory } from "vue-router";
import ResumeView from "@/views/ResumeView.vue";
import AboutView from "@/views/AboutView.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", name: "resume", component: ResumeView },
    { path: "/about", name: "about", component: AboutView },
  ],
  scrollBehavior() {
    return { top: 0 };
  },
});

export default router;
