<script setup>
import { RouterLink } from 'vue-router'
import Breadcrumbs from '@/components/Breadcrumbs.vue'
import { useBreadcrumbs } from '@/composables/useBreadcrumbs.js'

const breadcrumbs = useBreadcrumbs()
</script>

<template>
  <div class="about-view">
    <Breadcrumbs :items="breadcrumbs" />

    <article class="about-view__content">
      <h2 class="about-view__title">Про застосунок</h2>

      <section class="about-view__section">
        <h3 class="about-view__heading">Лабораторна робота № 6</h3>
        <p class="about-view__text">
          Цей застосунок демонструє роботу з <strong>Vue Router 4</strong> у композиційному API Vue 3.
          Реалізовано маршрутизацію з вкладеними представленнями, реактивне завантаження даних за параметром
          маршруту та побудову хлібних крихт з метаданих маршрутизатора.
        </p>
      </section>

      <section class="about-view__section">
        <h3 class="about-view__heading">Функціональність</h3>
        <ul class="about-view__list">
          <li>Каталог товарів із пошуком, debounce 400 мс та негайним скасуванням запитів</li>
          <li>Автоматичне дозавантаження сторінок через IntersectionObserver</li>
          <li>Окремі сторінки товару: огляд (/products/:id) та відгуки (/products/:id/reviews)</li>
          <li>Спільна оболонка товару — перемикання розділів без повторного запиту</li>
          <li>Хлібні крихти з динамічною назвою товару</li>
          <li>Синхронізація пошуку з URL (query-параметр q)</li>
          <li>Перенаправлення кореневого шляху на каталог, сторінка 404 для невідомих адрес</li>
        </ul>
      </section>

      <section class="about-view__section">
        <h3 class="about-view__heading">Технології</h3>
        <ul class="about-view__list">
          <li>Vue 3.5 (Composition API, script setup)</li>
          <li>Vue Router 4.6 (createWebHistory, вкладений RouterView)</li>
          <li>Vite 7 (dev-сервер, збірка)</li>
          <li>DummyJSON API (товарний каталог із штучною затримкою)</li>
          <li>JavaScript (ESM), BEM-методологія CSS</li>
        </ul>
      </section>

      <section class="about-view__section">
        <h3 class="about-view__heading">Автор</h3>
        <p class="about-view__text">
          Бікулов Тимур Дамірович · група 7.F2.25-2
        </p>
        <p class="about-view__text">
          Середовище: Node.js 22 LTS, npm 11, Chrome DevTools
        </p>
      </section>

      <section class="about-view__section">
        <RouterLink :to="{ name: 'products' }" class="about-view__back">
          ← Повернутися до каталогу
        </RouterLink>
      </section>
    </article>
  </div>
</template>

<style scoped>
.about-view {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.about-view__content {
  display: flex;
  flex-direction: column;
  gap: 32px;
  max-width: 800px;
}

.about-view__title {
  margin: 0;
  font-family: "Iowan Old Style", "Palatino Linotype", Georgia, serif;
  font-size: clamp(2rem, 4vw, 3.5rem);
  font-weight: 400;
  letter-spacing: -0.05em;
  line-height: 1.1;
}

.about-view__section {
  background: var(--paper);
  border: 1px solid var(--line);
  padding: 24px;
}

.about-view__heading {
  margin: 0 0 12px;
  font-family: "Iowan Old Style", "Palatino Linotype", Georgia, serif;
  font-size: clamp(1.35rem, 2.2vw, 1.8rem);
  font-weight: 400;
  letter-spacing: -0.03em;
}

.about-view__text {
  margin: 0;
  line-height: 1.7;
  color: var(--ink);
}

.about-view__text strong {
  color: var(--ink);
}

.about-view__list {
  margin: 0;
  padding-left: 24px;
  line-height: 1.8;
}

.about-view__list li {
  margin-bottom: 8px;
}

.about-view__list li:last-child {
  margin-bottom: 0
}

.about-view__back {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  color: var(--ink);
  text-decoration: none;
  font-weight: 600;
  border: 1px solid var(--ink);
  background: transparent;
  border-radius: 4px;
  transition: background 0.15s ease, color 0.15s ease;
  align-self: flex-start;
}

.about-view__back:hover {
  background: var(--ink);
  color: var(--paper);
}

.about-view__back:focus-visible {
  outline: 3px solid var(--signal);
  outline-offset: 3px;
}
</style>
