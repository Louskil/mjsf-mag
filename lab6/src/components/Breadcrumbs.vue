<script setup>
defineProps({
  items: {
    type: Array,
    required: true,
  },
})
</script>

<template>
  <nav class="breadcrumbs" aria-label="Навігаційний ланцюжок">
    <ol class="breadcrumbs__list">
      <li
        v-for="(item, index) in items"
        :key="index"
        class="breadcrumbs__item"
      >
        <RouterLink
          v-if="index < items.length - 1 && item.to"
          :to="item.to"
          class="breadcrumbs__link"
        >
          {{ item.label }}
        </RouterLink>
        <span
          v-else
          class="breadcrumbs__current"
          :aria-current="index === items.length - 1 ? 'page' : undefined"
        >
          {{ item.label }}
        </span>
        <span
          v-if="index < items.length - 1"
          class="breadcrumbs__separator"
          aria-hidden="true"
        >
          /
        </span>
      </li>
    </ol>
  </nav>
</template>

<style scoped>
.breadcrumbs {
  padding: 12px 0;
  font-size: 0.82rem;
  line-height: 1.5;
}

.breadcrumbs__list {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.breadcrumbs__item {
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
}

.breadcrumbs__link {
  color: var(--muted);
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: color 0.15s ease, border-color 0.15s ease;
}

.breadcrumbs__link:hover {
  color: var(--ink);
  border-bottom-color: var(--ink);
}

.breadcrumbs__link:focus-visible {
  outline: 3px solid var(--signal);
  outline-offset: 3px;
  border-radius: 2px;
}

.breadcrumbs__current {
  color: var(--ink);
  font-weight: 500;
}

.breadcrumbs__separator {
  color: var(--line);
  flex-shrink: 0;
}
</style>