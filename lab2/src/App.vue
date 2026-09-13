<script setup>
import MaterialCatalog from './components/MaterialCatalog.vue'
</script>

<template>
  <main class="app">
    <header class="app__header">
      <a class="brand" href="#" aria-label="Інформація про виконавця — на початок">
        <span class="brand__mark" aria-hidden="true">ІВ</span>
        <span class="brand__text">Інформація про виконавця</span>
      </a>

      <div class="student-info" aria-label="Дані студента та середовище">
        <p class="student-info__item">
          <span class="student-info__label">Студент</span>
          <strong class="student-info__value">Бікулов Тимур · група ХХ-00</strong>
        </p>
        <p class="student-info__item">
          <span class="student-info__label">Середовище</span>
          <strong class="student-info__value">Windows · IntelliJ IDEA · Node.js</strong>
        </p>
      </div>
    </header>

    <section class="hero" aria-labelledby="page-title">
      <div class="hero__content">
        <p class="hero__eyebrow">Лабораторна робота № 2</p>
        <h1 class="hero__title" id="page-title">Компоненти та реактивність</h1>
      </div>
    </section>

    <MaterialCatalog />

    <footer class="app__footer">
      <span>Інформація про виконавця · 2026</span>
      <span>Статичну верстку перетворено на Vue-застосунок</span>
    </footer>
  </main>
</template>