<script setup>
import { inject, computed, onMounted, onBeforeUnmount } from 'vue'
import { tabsKey } from './tabsKey'

const props = defineProps({
  slug: { type: String, required: true },
  title: { type: String, required: true },
  disabled: { type: Boolean, default: false },
  panel: { type: Object, default: null },
  panelProps: { type: Object, default: () => ({}) },
})

const context = inject(tabsKey)

if (!context) {
  throw new Error(
    'Tab повинен використовуватись всередині компонента Tabs',
  )
}

const { activeSlug, idPrefix, setActiveTab, registerTab, unregisterTab } =
  context

const isRegistered = { value: false }

const isActive = computed(() => activeSlug.value === props.slug)

onMounted(() => {
  registerTab({
    slug: props.slug,
    title: props.title,
    disabled: props.disabled,
  })
  isRegistered.value = true
})

onBeforeUnmount(() => {
  if (isRegistered.value) {
    unregisterTab(props.slug)
  }
})
</script>

<template>
  <section
    :id="`${idPrefix}-panel-${slug}`"
    v-show="isActive"
    class="tabs__panel"
    role="tabpanel"
    :aria-labelledby="`${idPrefix}-tab-${slug}`"
    tabindex="0"
  >
    <KeepAlive>
      <slot v-if="isActive && $slots.default" :is-active="isActive" />
      <component v-else-if="isActive" :is="panel" v-bind="panelProps" />
    </KeepAlive>
  </section>
</template>

<style scoped lang="scss">
.tabs__panel {
  @apply p-5 border rounded-b-2xl overflow-hidden;
  background: var(--color-surface);
  border-color: var(--color-line);
}
</style>
