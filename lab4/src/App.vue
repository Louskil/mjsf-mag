<script setup>
import { ref } from 'vue'
import Tabs from './components/tabs/Tabs.vue'
import Tab from './components/tabs/Tab.vue'
import OverviewPanel from './components/demo-panels/OverviewPanel.vue'
import RequirementsPanel from './components/demo-panels/RequirementsPanel.vue'
import EnvironmentPanel from './components/demo-panels/EnvironmentPanel.vue'
import { pillsTabsConfig } from './data/tabsConfig'

const activeUnderlineTab = ref('overview')
const activePillsTab = ref('overview')
const activeBoxedTab = ref('overview')
</script>

<template>
  <main class="page">
    <div class="app">
      <header class="app__header">
        <a
          class="brand"
          href="#"
          aria-label="Інформація про виконавця — на початок"
        >
          <span class="brand__mark" aria-hidden="true">ІВ</span>
          <span class="brand__text">Інформація про виконавця</span>
        </a>

        <div class="student-info" aria-label="Дані студента та середовище">
          <p class="student-info__item">
            <span class="student-info__label">Студент</span>
            <strong class="student-info__value"
              >Бікулов Тимур · група 7.F2.25-2</strong
            >
          </p>
          <p class="student-info__item">
            <span class="student-info__label">Середовище</span>
            <strong class="student-info__value"
              >Windows · IntelliJ IDEA · Node.js 22</strong
            >
          </p>
        </div>
      </header>

      <section class="hero" aria-labelledby="page-title">
        <div class="hero__content">
          <p class="hero__eyebrow">Лабораторна робота № 4</p>
          <h1 class="hero__title" id="page-title">
            Складні компоненти: вкладки через
            <span class="hero__highlight">Slots</span>,
            <span class="hero__highlight">Provide/Inject</span>,
            динамічні компоненти та
            <span class="hero__highlight">KeepAlive</span>
          </h1>
        </div>
      </section>

      <section class="demo-section">
        <div class="demo-section__header">
          <span class="demo-section__badge">underline</span>
          <h2 class="demo-section__title">Панелі через слоти Tab</h2>
        </div>
        <Tabs v-model="activeUnderlineTab" variant="underline">
          <KeepAlive>
            <Tab slug="overview" title="Огляд">
              <OverviewPanel />
            </Tab>
          </KeepAlive>
          <KeepAlive>
            <Tab slug="requirements" title="Вимоги">
              <RequirementsPanel />
            </Tab>
          </KeepAlive>
          <KeepAlive>
            <Tab slug="environment" title="Середовище">
              <EnvironmentPanel />
            </Tab>
          </KeepAlive>
        </Tabs>
      </section>

      <section class="demo-section">
        <div class="demo-section__header">
          <span class="demo-section__badge">pills</span>
          <h2 class="demo-section__title">
            Панелі з масиву через component :is
          </h2>
        </div>
        <Tabs v-model="activePillsTab" variant="pills">
          <template v-for="config in pillsTabsConfig" :key="config.slug">
            <KeepAlive>
              <Tab
                :slug="config.slug"
                :title="config.title"
                :panel="config.panel"
                :panel-props="config.panelProps"
              />
            </KeepAlive>
          </template>
        </Tabs>
      </section>

      <section class="demo-section">
        <div class="demo-section__header">
          <span class="demo-section__badge">boxed</span>
          <h2 class="demo-section__title">
            Вимкнена вкладка та ModalDialog
          </h2>
        </div>
        <Tabs v-model="activeBoxedTab" variant="boxed">
          <KeepAlive>
            <Tab slug="overview" title="Огляд">
              <OverviewPanel />
            </Tab>
          </KeepAlive>
          <KeepAlive>
            <Tab slug="requirements" title="Вимоги" disabled>
              <RequirementsPanel />
            </Tab>
          </KeepAlive>
          <KeepAlive>
            <Tab slug="environment" title="Середовище">
              <EnvironmentPanel />
            </Tab>
          </KeepAlive>
        </Tabs>
      </section>

      <footer class="app__footer">
        <span>Інформація про виконавця · 2026</span>
        <span>
          Складні компоненти: Tabs, Tab, Provide/Inject, динамічні
          компоненти, KeepAlive
        </span>
      </footer>
    </div>
  </main>
</template>

<style scoped lang="scss">
.hero__highlight {
  color: var(--color-accent);
  font-weight: 600;
}

.demo-section {
  margin-top: 2.5rem;
}

.demo-section__header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.demo-section__badge {
  @apply px-2.5 py-0.5 text-xs font-semibold rounded-full;
  background: var(--color-accent);
  color: var(--color-page);
}

.demo-section__title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-ink);
}

/* Responsive: stack header on small screens */
@media (max-width: 640px) {
  .app__header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .student-info {
    width: 100%;
  }

  .student-info__item {
    min-width: 0;
    flex: 1;
  }

  .hero {
    @apply flex-col items-start;
  }
}

@media (max-width: 480px) {
  .hero__title {
    font-size: 1.75rem;
  }
}
</style>
