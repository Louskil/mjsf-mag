<script setup>
import { ref, watch, nextTick, onBeforeUnmount } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, required: true },
  initialFocus: { type: [Object, null], default: null },
  fallbackFocus: { type: [Object, null], default: null },
})

const emit = defineEmits(['update:modelValue'])

const panelRef = ref(null)
const headingId = 'modal-heading'
let previouslyFocused = null
let isClosing = false

function getFocusable(container) {
  if (!container) return []
  const selector = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(', ')
  const elements = Array.from(container.querySelectorAll(selector))
  return elements.filter(el => {
    if (el.offsetParent === null) return false
    const style = window.getComputedStyle(el)
    return style.display !== 'none' && style.visibility !== 'hidden'
  })
}

function trapFocus(e) {
  if (e.key !== 'Tab') return
  const focusable = getFocusable(panelRef.value)
  if (focusable.length === 0) {
    e.preventDefault()
    panelRef.value?.focus()
    return
  }
  const first = focusable[0]
  const last = focusable[focusable.length - 1]
  if (e.shiftKey) {
    if (document.activeElement === first) {
      e.preventDefault()
      last.focus()
    }
  } else {
    if (document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }
}

function close() {
  if (isClosing) return
  isClosing = true
  emit('update:modelValue', false)
}

function handleEscape(e) {
  if (e.key === 'Escape') {
    e.stopPropagation()
    close()
  }
}

function restoreFocus() {
  if (props.modelValue) return
  nextTick(() => {
    const trigger = previouslyFocused
    if (trigger && trigger.isConnected && trigger.offsetParent !== null) {
      trigger.focus()
    } else if (props.fallbackFocus) {
      props.fallbackFocus.focus()
    }
  })
}

watch(() => props.modelValue, async (open) => {
  if (open) {
    previouslyFocused = document.activeElement
    const appEl = document.getElementById('app')
    if (appEl) {
      appEl.dataset.prevInert = String(appEl.inert)
      appEl.inert = true
    }
    const body = document.body
    body.dataset.prevOverflow = body.style.overflow || ''
    body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleEscape, true)
    document.addEventListener('keydown', trapFocus, true)
    await nextTick()
    if (props.initialFocus) {
      props.initialFocus.focus()
    } else {
      panelRef.value?.focus()
    }
  } else {
    document.removeEventListener('keydown', handleEscape, true)
    document.removeEventListener('keydown', trapFocus, true)
    const appEl = document.getElementById('app')
    if (appEl && appEl.dataset.prevInert !== undefined) {
      appEl.inert = appEl.dataset.prevInert === 'true'
    }
    const body = document.body
    if (body.dataset.prevOverflow !== undefined) {
      body.style.overflow = body.dataset.prevOverflow || ''
    }
    if (isClosing) {
      isClosing = false
    }
    restoreFocus()
  }
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleEscape, true)
  document.removeEventListener('keydown', trapFocus, true)
  const appEl = document.getElementById('app')
  if (appEl && appEl.dataset.prevInert !== undefined) {
    appEl.inert = appEl.dataset.prevInert === 'true'
  }
  const body = document.body
  if (body.dataset.prevOverflow !== undefined) {
    body.style.overflow = body.dataset.prevOverflow || ''
  }
})
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-150 motion-reduce:transition-none"
      leave-active-class="transition-opacity duration-150 motion-reduce:transition-none"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 box-border"
        @click.self="close"
      >
        <div
          ref="panelRef"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="headingId"
          tabindex="-1"
          class="box-border w-full max-w-screen-sm max-h-[calc(100dvh-2rem)] flex flex-col overflow-hidden bg-white rounded-lg shadow-xl outline-none"
        >
          <div class="shrink-0 flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 :id="headingId" class="text-lg font-semibold leading-snug break-words">{{ title }}</h2>
            <button
              type="button"
              class="shrink-0 min-h-11 min-w-11 flex items-center justify-center rounded-lg hover:bg-gray-100 focus-visible:outline focus-visible:outline-3 focus-visible:outline-green-700 focus-visible:outline-offset-3"
              aria-label="Закрити вікно"
              @click="close"
            >
              <span aria-hidden="true" class="text-xl">&times;</span>
            </button>
          </div>
          <div class="min-h-0 overflow-y-auto px-6 py-4 break-words">
            <slot />
          </div>
          <div class="shrink-0 flex flex-col gap-3 sm:flex-row sm:justify-end px-6 py-4 border-t border-gray-200">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
