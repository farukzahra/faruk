<script setup lang="ts">
import { ref } from "vue";
import SendResumeDialog from "@/components/SendResumeDialog.vue";

const pdfUrl = "/assets/Faruk Zahra - CV - Resume.pdf";
const sendOpen = ref(false);

const skills = [
  "Java",
  "Spring Boot",
  "Spring Cloud",
  "REST APIs",
  "Microservices",
  "Google Cloud Platform",
  "AWS",
  "Azure",
  "Vue.js",
  "TypeScript",
  "Node.js",
  "PostgreSQL",
  "Docker",
  "Git",
  "JUnit",
  "Mockito",
  "Liquibase",
  "Elasticsearch",
  "CI/CD",
  "Cursor",
  "Claude",
  "Codex",
  "GitHub Copilot",
  "Software Architecture",
  "System Design",
];

const languages = [
  "Portuguese – Native",
  "English – Professional Working",
  "Arabic – Elementary",
];

const certifications = [
  "Oracle Certified Professional, Java EE 5 Web Component Developer",
  "Oracle Certified Professional, Java SE 6 Programmer",
  "IBM Certified Associate Developer – Lotus Notes and Domino 7",
  "IBM Certified Database Associate – DB2 9 Fundamentals",
  "SUN CERTIFIED MOBILE APPLICATION DEVELOPER",
];

const previousRoles = [
  { title: "Java Specialist", company: "GVT", dates: "2007 – 2008" },
  { title: "Java Specialist", company: "Vivo", dates: "2005 – 2007" },
  { title: "Java Specialist", company: "Visionnaire", dates: "2004 – 2005" },
  { title: "Java Developer", company: "HSBC", dates: "2003 – 2004" },
];
</script>

<template>
  <div class="resume">
    <header class="header resume-header">
      <h1>Faruk Zahra</h1>
      <p class="title">Senior Fullstack Engineer</p>
      <p class="keywords">Java | Spring | JavaScript | TypeScript | AI Agents</p>
      <div class="contact">
        <a href="mailto:farukz@gmail.com">
          <i class="fa-solid fa-envelope" /> farukz@gmail.com
        </a>
        <span><i class="fa-solid fa-location-dot" /> Curitiba, PR, Brazil</span>
        <a href="https://linkedin.com/in/farukz" target="_blank" rel="noreferrer">
          <i class="fa-brands fa-linkedin" /> linkedin.com/in/farukz
        </a>
      </div>
    </header>

    <section class="main-section resume-summary">
      <h2>
        <span class="section-icon"><i class="fa-solid fa-user" /></span> Summary
      </h2>
      <div class="section-body">
        <p>
          Senior Software Engineer with 20+ years of experience designing, building, and
          maintaining enterprise applications using Java, Spring Boot, REST APIs, and
          cloud-native architectures.
        </p>
        <p>
          Experienced across backend and full-stack development with Vue.js, TypeScript,
          Node.js, relational databases, and distributed systems.
        </p>
        <p>
          Strong background in software architecture, API design, system integration,
          performance optimization, and delivering scalable solutions throughout the entire
          software development lifecycle.
        </p>
        <p>
          Experienced using AI coding agents to accelerate implementation, refactoring, and
          day-to-day software delivery.
        </p>
      </div>
    </section>

    <aside class="sidebar resume-sidebar">
      <div class="profile-photo">
        <img src="/assets/profile.jpg" alt="Faruk Zahra" />
      </div>

      <div class="resume-actions">
        <a
          class="download-pdf"
          :href="pdfUrl"
          download="Faruk Zahra - CV - Resume.pdf"
          title="Download PDF"
          aria-label="Download PDF"
        >
          <i class="fa-solid fa-file-pdf" />
        </a>
        <button
          type="button"
          class="send-resume"
          title="Enviar Currículo"
          aria-label="Enviar Currículo"
          @click="sendOpen = true"
        >
          <i class="fa-solid fa-paper-plane" />
        </button>
      </div>

      <section class="sidebar-section sidebar-section--skills">
        <h2>
          <span class="section-icon"><i class="fa-solid fa-code" /></span> Core Skills
        </h2>
        <ul>
          <li v-for="skill in skills" :key="skill">{{ skill }}</li>
        </ul>
      </section>

      <section class="sidebar-section">
        <h2>
          <span class="section-icon"><i class="fa-solid fa-globe" /></span> Languages
        </h2>
        <ul class="plain-list">
          <li v-for="lang in languages" :key="lang">{{ lang }}</li>
        </ul>
      </section>

      <section class="sidebar-section">
        <h2>
          <span class="section-icon"><i class="fa-solid fa-award" /></span> Certifications
        </h2>
        <ul>
          <li v-for="cert in certifications" :key="cert">{{ cert }}</li>
        </ul>
      </section>
    </aside>

    <section class="main-section resume-experience">
      <h2>
        <span class="section-icon"><i class="fa-solid fa-briefcase" /></span> Experience
      </h2>
      <div class="timeline">
        <article class="timeline-item">
          <div class="timeline-marker" />
          <div class="timeline-content">
            <h3>
              Full Stack Engineer | BairesDev
              <span class="dates">(May 2021 – Present)</span>
            </h3>
            <p class="location">Remote</p>
            <ul>
              <li>
                Built and maintained a multi-tenant Orders microservice (Java 17, Spring Boot)
                for a retail e-commerce platform — order lifecycle, payments, fulfillment, and
                store operations.
              </li>
              <li>
                Designed contract-first REST APIs with OpenAPI 3, generating Spring interfaces
                and TypeScript clients for consuming services.
              </li>
              <li>
                Implemented event-driven integrations with Google Cloud Pub/Sub (order
                ingestion, payment updates, POS export results, supplier fulfillment, outbound
                email).
              </li>
              <li>
                Modeled multi-tenant PostgreSQL schemas and Liquibase migrations (orders,
                transactions, shipments, soft deletes).
              </li>
              <li>
                Delivered Elasticsearch-backed order search with indexing, search templates,
                filters, and aggregations.
              </li>
              <li>
                Ran and integrated services on Google Cloud Platform — GKE, Pub/Sub, Cloud SQL,
                Cloud Storage, and IAM — with OpenFeign between microservices and OAuth2 via the
                shared security base.
              </li>
              <li>
                Built Vue 3 frontend features with TypeScript, Pinia, Vue Router, Axios, and
                Vite (Composition API with script setup).
              </li>
              <li>
                Wrote automated tests across the stack — JUnit 5, Mockito, and MockMvc on the
                backend; Vitest and Playwright on the Vue frontend.
              </li>
              <li>
                Participated in Agile ceremonies, code reviews, and production support.
              </li>
            </ul>
          </div>
        </article>

        <article class="timeline-item">
          <div class="timeline-marker" />
          <div class="timeline-content">
            <h3>
              Solutions Architect | Lume Tecnologia
              <span class="dates">(Feb 2008 – Apr 2021)</span>
            </h3>
            <p class="location">Pinhais, PR</p>
            <ul>
              <li>Led software architecture decisions for enterprise applications.</li>
              <li>
                Gathered customer requirements and translated them into technical solutions.
              </li>
              <li>Designed backend systems using Java and Spring Boot.</li>
              <li>Modernized legacy Java EE applications.</li>
              <li>
                Delivered cloud-hosted solutions on AWS (EC2, S3, RDS, Lambda, IAM) and Azure
                (App Service, Blob Storage, Azure SQL, Functions, Entra ID).
              </li>
              <li>Mentored developers and reviewed code quality.</li>
              <li>Delivered solutions using Vue.js, Flutter, PostgreSQL, and Git.</li>
            </ul>
          </div>
        </article>

        <article class="timeline-item">
          <div class="timeline-marker" />
          <div class="timeline-content">
            <h3>
              Java Teacher | Faculdades ESEEI
              <span class="dates">(Feb 2011 – Dec 2011)</span>
            </h3>
            <p>PC60 – Java/Web Programming and PC50 – Java Programming.</p>
          </div>
        </article>
      </div>
    </section>

    <section class="main-section resume-education">
      <h2>
        <span class="section-icon"><i class="fa-solid fa-graduation-cap" /></span> Education
      </h2>
      <div class="timeline">
        <article class="timeline-item">
          <div class="timeline-marker" />
          <div class="timeline-content">
            <h3>
              Master in Health Technology (PPGTS)
              <span class="dates">(2007 – 2009)</span>
            </h3>
            <p class="location">Pontifícia Universidade Católica do Paraná (PUCPR)</p>
            <p>Ontology, Ontology Learning, Java.</p>
          </div>
        </article>

        <article class="timeline-item">
          <div class="timeline-marker" />
          <div class="timeline-content">
            <h3>
              Bachelor of Information Systems
              <span class="dates">(2001 – 2004)</span>
            </h3>
            <p class="location">Pontifícia Universidade Católica do Paraná (PUCPR)</p>
          </div>
        </article>
      </div>
    </section>

    <section class="main-section resume-roles">
      <h2>
        <span class="section-icon"><i class="fa-solid fa-gear" /></span> Other Experience (Previous Roles)
      </h2>
      <div class="roles-grid">
        <article v-for="role in previousRoles" :key="role.company + role.dates">
          <h3>{{ role.title }}</h3>
          <p class="company">{{ role.company }}</p>
          <p class="dates">{{ role.dates }}</p>
        </article>
      </div>
    </section>

    <SendResumeDialog v-model="sendOpen" />
  </div>
</template>
