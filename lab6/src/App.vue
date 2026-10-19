<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div class="app">
    <header class="app__header">
      <nav class="app__nav" aria-label="Основна навігація">
        <RouterLink
          :to="{ name: 'products' }"
          class="app__brand"
          aria-label="Forma, на початок"
        >
          FORMA<span class="app__brand-mark">®</span>
        </RouterLink>

        <ul class="app__nav-list">
          <li>
            <RouterLink
              :to="{ name: 'products' }"
              class="app__nav-link"
              exact-active-class="app__nav-link--active"
            >
              Каталог
            </RouterLink>
          </li>
          <li>
            <RouterLink
              :to="{ name: 'about' }"
              class="app__nav-link"
              exact-active-class="app__nav-link--active"
            >
              Про застосунок
            </RouterLink>
          </li>
        </ul>
      </nav>

      <div class="app__meta">
        <p class="app__edition">Лабораторна / 06</p>
        <p class="app__note">Vue Router · Вкладені маршрути</p>
      </div>
    </header>

    <main class="app__main">
      <RouterView v-slot="{ Component }">
        <component :is="Component" />
      </RouterView>
    </main>

    <footer class="app__footer">
      <p>
        Бікулов Тимур Дамірович · 7.F2.25-2 · Vue 3 · Vue Router 4 · Vite · Node.js 22 LTS
      </p>
      <a
        href="https://dummyjson.com/docs/products"
        target="_blank"
        rel="noreferrer"
      >
        Дані: DummyJSON
      </a>
    </footer>
  </div>
</template>

<style scoped>
.app {
  width: min(100% - 40px, 1440px);
  min-height: 100vh;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
}

.app__header {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: baseline;
  padding-bottom: 18px;
  border-bottom: 1px solid var(--ink);
}

.app__nav {
  display: flex;
  align-items: center;
  gap: clamp(24px, 4vw, 60px);
  justify-self: start;
}

.app__brand {
  width: max-content;
  color: var(--ink);
  font-size: 1.35rem;
  font-weight: 800;
  letter-spacing: -0.06em;
  text-decoration: none;
}

.app__brand-mark {
  margin-left: 0.2em;
  font-size: 0.48em;
  vertical-align: top;
}

.app__nav-list {
  display: flex;
  gap: 24px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.app__nav-link {
  color: var(--ink);
  text-decoration: none;
  font-weight: 500;
  font-size: 0.95rem;
  border-bottom: 2px solid transparent;
  padding-bottom: 4px;
  transition: color 0.15s ease, border-color 0.15s ease;
}

.app__nav-link:hover {
  color: var(--signal);
}

.app__nav-link--active {
  color: var(--signal);
  border-bottom-color: var(--signal);
}

.app__nav-link:focus-visible {
  outline: 3px solid var(--signal);
  outline-offset: 3px;
  border-radius: 2px;
}

.app__meta {
  justify-self: end;
  display: flex;
  flex-direction: column;
  align-items: end;
  gap: 2px;
}

.app__edition,
.app__note {
  margin: 0;
  font-family: "IBM Plex Mono", "Cascadia Mono", monospace;
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.app__main {
  flex: 1;
  padding: clamp(32px, 5vw, 64px) 0;
  min-height: 0;
}

.app__footer {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-top: auto;
  padding-top: 18px;
  border-top: 1px solid var(--ink);
  font-family: "IBM Plex Mono", "Cascadia Mono", monospace;
  font-size: 0.68rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.app__footer p {
  margin: 0;
}

.app__footer a {
  color: var(--muted);
  text-decoration: none;
  border-bottom: 1px solid var(--line);
  transition: color 0.15s ease, border-color 0.15s ease;
}

.app__footer a:hover {
  color: var(--ink);
  border-bottom-color: var(--ink);
}

@media (max-width: 820px) {
  .app__header {
    grid-template-columns: 1fr auto;
    gap: 16px;
  }

  .app__edition {
    display: none;
  }

  .app__nav {
    gap: 20px;
  }

  .app__nav-list {
    gap: 16px;
  }
}

@media (max-width: 560px) {
  .app {
    width: min(100% - 24px, 1440px);
    padding-top: 18px;
  }

  .app__header {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .app__nav {
    justify-self: stretch;
    flex-wrap: wrap;
    gap: 12px;
  }

  .app__meta {
    justify-self: stretch;
    align-items: start;
  }

  .app__note {
    min-width: 0;
    max-width: 150px;
    font-size: 0.58rem;
    line-height: 1.45;
    overflow-wrap: anywhere;
  }

  .app__main {
    padding-top: 24px;
  }

  .app__footer {
    gap: 18px;
    flex-direction: column;
  }
}
</style>