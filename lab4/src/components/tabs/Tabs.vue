<script setup>
import {
  ref,
  computed,
  provide,
  onMounted,
  useId,
  readonly,
  nextTick,
} from 'vue'
import { tabsKey } from './tabsKey'

const props = defineProps({
  modelValue: { type: String, required: true },
  variant: { type: String, default: 'underline' },
  ariaLabel: { type: String, default: 'Навігація вкладками' },
})

const emit = defineEmits(['update:modelValue'])

const idPrefix = useId()
const tabs = ref([])

const activeSlug = computed(() => props.modelValue)

function setActiveTab(slug) {
  const tab = tabs.value.find((t) => t.slug === slug)
  if (!tab || tab.disabled) return
  if (slug === props.modelValue) return
  emit('update:modelValue', slug)
}

function registerTab(tab) {
  if (tabs.value.some((t) => t.slug === tab.slug)) {
    throw new Error(
      `Вкладка зі slug="${tab.slug}" вже зареєстрована у цьому наборі Tabs`,
    )
  }
  tabs.value.push({ ...tab })
}

function unregisterTab(slug) {
  const index = tabs.value.findIndex((t) => t.slug === slug)
  if (index > -1) {
    tabs.value.splice(index, 1)
    if (slug === props.modelValue) {
      nextTick(ensureValidActiveTab)
    }
  }
}

function ensureValidActiveTab() {
  const available = tabs.value.filter((t) => !t.disabled)
  if (available.length === 0) return
  if (!available.some((t) => t.slug === props.modelValue)) {
    emit('update:modelValue', available[0].slug)
  }
}

onMounted(() => {
  ensureValidActiveTab()
})

provide(tabsKey, {
  activeSlug: readonly(activeSlug),
  idPrefix,
  setActiveTab,
  registerTab,
  unregisterTab,
})

function onListKeydown(e) {
  const key = e.key
  if (
    key !== 'ArrowRight' &&
    key !== 'ArrowLeft' &&
    key !== 'Home' &&
    key !== 'End'
  ) {
    return
  }

  const list = e.currentTarget
  const buttons = Array.from(
    list.querySelectorAll('button[role="tab"]'),
  ).filter((b) => !b.disabled)

  if (buttons.length === 0) return

  const currentIndex = buttons.findIndex(
    (b) => b === document.activeElement,
  )
  if (currentIndex === -1) return

  e.preventDefault()

  let nextIndex = currentIndex
  switch (key) {
    case 'ArrowRight':
      nextIndex = (currentIndex + 1) % buttons.length
      break
    case 'ArrowLeft':
      nextIndex = (currentIndex - 1 + buttons.length) % buttons.length
      break
    case 'Home':
      nextIndex = 0
      break
    case 'End':
      nextIndex = buttons.length - 1
      break
  }

  const target = buttons[nextIndex]
  target.focus()
  setActiveTab(target.dataset.slug)
}
</script>

<template>
  <div :class="['tabs', `tabs--${variant}`]">
    <nav
      class="tabs__list"
      role="tablist"
      :aria-label="`${ariaLabel} (${variant})`"
      @keydown="onListKeydown"
    >
      <button
        v-for="tab in tabs"
        :key="tab.slug"
        :id="`${idPrefix}-tab-${tab.slug}`"
        :data-slug="tab.slug"
        :class="[
          'tabs__tab',
          { 'tabs__tab--active': tab.slug === activeSlug },
        ]"
        :tabindex="tab.slug === activeSlug ? 0 : -1"
        :aria-selected="tab.slug === activeSlug"
        :aria-controls="`${idPrefix}-panel-${tab.slug}`"
        :disabled="tab.disabled"
        role="tab"
        @click="setActiveTab(tab.slug)"
      >
        {{ tab.title }}
      </button>
    </nav>
    <slot />
  </div>
</template>

<style scoped lang="scss">
.tabs {
  @apply w-full;

  &__list {
    @apply flex flex-wrap gap-1.5 p-2 rounded-t-2xl border-x border-t;
    background: var(--color-surface);
    border-color: var(--color-line);
  }

  &__tab {
    @apply px-4 py-2.5 text-sm font-medium rounded
           transition-all duration-150;
    color: var(--color-muted);
    background: transparent;
    border: 2px solid transparent;
    cursor: pointer;

    &:not(:disabled) {
      &:hover {
        color: var(--color-ink);
        background: color-mix(in srgb, var(--color-accent) 12%, transparent);
      }
    }

    &:disabled {
      @apply opacity-50 cursor-not-allowed;
    }

    &:focus-visible {
      outline: 3px solid var(--color-accent);
      outline-offset: 2px;
    }

    &--active {
      color: var(--color-ink);
      font-weight: 600;
    }
  }

  &--underline {
    .tabs__tab {
      border-bottom-width: 2px;
      border-bottom-style: solid;
      border-bottom-color: transparent;
    }

    .tabs__tab--active {
      border-bottom-color: var(--color-accent);
    }
  }

  &--pills {
    .tabs__tab {
      @apply rounded-full;
    }

    .tabs__tab--active {
      background: var(--color-accent);
      color: var(--color-page);
      border-color: var(--color-accent);
    }
  }

  &--boxed {
    .tabs__list {
      border-top-left-radius: 1.25rem;
      border-top-right-radius: 1.25rem;
      border-bottom: none;
    }

    .tabs__tab {
      @apply rounded-none;
      border: 2px solid transparent;

      &--active {
        border-color: var(--color-accent);
        border-bottom-color: transparent;
        background: transparent;
        color: var(--color-ink);
      }

      &:not(:disabled):hover {
        background: color-mix(in srgb, var(--color-accent) 10%, transparent);
      }
    }

    :deep(.tabs__panel) {
      border-top: none;
      border-top-left-radius: 0;
      border-top-right-radius: 0;
    }
  }
}

@media (max-width: 640px) {
  .tabs__tab {
    @apply px-3 py-2 text-sm;
  }
}
</style>
