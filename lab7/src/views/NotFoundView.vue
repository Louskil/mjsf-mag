<script setup>
import { useRoute } from 'vue-router'
import { RouterLink } from 'vue-router'
import Breadcrumbs from '@/components/Breadcrumbs.vue'
import { useBreadcrumbs } from '@/composables/useBreadcrumbs.js'

const route = useRoute()
const breadcrumbs = useBreadcrumbs()
</script>

<template>
  <div class="not-found-view">
    <Breadcrumbs :items="breadcrumbs" />

    <div class="not-found-view__content">
      <div class="not-found-view__illustration" aria-hidden="true">
        <svg viewBox="0 0 120 120" width="120" height="120">
          <circle cx="60" cy="60" r="50" fill="none" stroke="var(--ink)" stroke-width="4" />
          <path d="M60 30 L60 55 M60 65 L60 90" stroke="var(--ink)" stroke-width="4" stroke-linecap="round" />
          <circle cx="60" cy="95" r="4" fill="var(--ink)" />
        </svg>
      </div>

      <h2 class="not-found-view__title">Сторінку не знайдено</h2>

      <p class="not-found-view__message">
        Адреса <code>{{ route.fullPath }}</code> не відповідає жодному відомому маршруту.
      </p>

      <div class="not-found-view__actions">
        <RouterLink :to="{ name: 'products' }" class="not-found-view__button not-found-view__button--primary">
          Перейти до каталогу
        </RouterLink>
        <RouterLink :to="{ name: 'about' }" class="not-found-view__button not-found-view__button--secondary">
          Про застосунок
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.not-found-view {
  display: flex;
  flex-direction: column;
  gap: 24px;
  min-height: 60vh;
}

.not-found-view__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 24px;
  padding: clamp(40px, 6vw, 88px);
  background: var(--paper);
  border: 1px solid var(--line);
  max-width: 520px;
  margin: 0 auto;
  width: 100%;
}

.not-found-view__illustration {
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.6;
}

.not-found-view__title {
  margin: 0;
  font-family: "Iowan Old Style", "Palatino Linotype", Georgia, serif;
  font-size: clamp(2.4rem, 5vw, 5rem);
  font-weight: 400;
  letter-spacing: -0.06em;
}

.not-found-view__message {
  margin: 0;
  color: var(--muted);
  line-height: 1.6;
}

.not-found-view__message code {
  font-family: "IBM Plex Mono", "Cascadia Mono", monospace;
  font-size: 0.85em;
  background: var(--canvas);
  padding: 2px 6px;
  border: 1px solid var(--line);
  border-radius: 4px;
}

.not-found-view__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
  margin-top: 8px;
}

.not-found-view__button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  font-weight: 600;
  text-decoration: none;
  border-radius: 4px;
  transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
}

.not-found-view__button--primary {
  color: var(--ink);
  background: var(--acid);
  border: 1px solid var(--ink);
}

.not-found-view__button--primary:hover {
  background: var(--ink);
  color: var(--paper);
}

.not-found-view__button--secondary {
  color: var(--ink);
  background: transparent;
  border: 1px solid var(--ink);
}

.not-found-view__button--secondary:hover {
  background: var(--ink);
  color: var(--paper);
}

.not-found-view__button:focus-visible {
  outline: 3px solid var(--signal);
  outline-offset: 3px;
}
</style>