<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'
import { storeToRefs } from 'pinia'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const { loginPending, error } = storeToRefs(auth)

const username = ref('emilys')
const password = ref('emilyspass')
const localError = ref('')

const submitError = computed(() => localError.value || error.value)

async function handleSubmit(event) {
  event.preventDefault()
  localError.value = ''

  try {
    await auth.login(username.value, password.value)
    const redirect = route.query.redirect
    if (typeof redirect === 'string') {
      const targetRoute = router.resolve(redirect)
      if (['manage-products', 'manage-edit'].includes(targetRoute.name)) {
        await router.replace({ path: redirect })
        return
      }
    }
    await router.replace({ name: 'manage-products' })
  } catch (cause) {
    localError.value = cause instanceof Error ? cause.message : 'Помилка входу'
  }
}

function handleInput() {
  localError.value = ''
}
</script>

<template>
  <div class="login-view">
    <header class="login-view__header">
      <h1 class="login-view__title">Вхід до керування</h1>
    </header>

    <main class="login-view__main">
      <form class="login-form" @submit="handleSubmit" novalidate>
        <div class="login-form__field">
          <label for="username" class="login-form__label">Логін</label>
          <input
            id="username"
            type="text"
            class="login-form__input"
            :value="username"
            @input="username = $event.target.value; handleInput()"
            autocomplete="username"
            required
            :disabled="loginPending"
            aria-describedby="username-hint"
            aria-invalid="false"
          />
          <span id="username-hint" class="login-form__hint">emilys</span>
        </div>

        <div class="login-form__field">
          <label for="password" class="login-form__label">Пароль</label>
          <input
            id="password"
            type="password"
            class="login-form__input"
            :value="password"
            @input="password = $event.target.value; handleInput()"
            autocomplete="current-password"
            required
            :disabled="loginPending"
            aria-describedby="password-hint"
            aria-invalid="false"
          />
          <span id="password-hint" class="login-form__hint">emilyspass</span>
        </div>

        <div v-if="submitError" class="login-form__error" role="alert" aria-live="assertive">
          {{ submitError }}
        </div>

        <button
          class="login-form__submit"
          type="submit"
          :disabled="loginPending"
          :aria-busy="loginPending"
        >
          <span v-if="loginPending">Вхід…</span>
          <span v-else>Увійти</span>
        </button>
      </form>

      <p class="login-view__note">
        Тестові облікові дані: <code>emilys</code> / <code>emilyspass</code>
      </p>
    </main>
  </div>
</template>

<style scoped>
.login-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  padding: clamp(32px, 6vw, 80px) 24px;
}

.login-view__header {
  margin-bottom: 32px;
  text-align: center;
}

.login-view__title {
  margin: 0;
  font-family: "Iowan Old Style", "Palatino Linotype", Georgia, serif;
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 400;
  letter-spacing: -0.04em;
  line-height: 1.1;
}

.login-view__main {
  width: 100%;
  max-width: 400px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
  background: var(--paper);
  border: 1px solid var(--line);
  padding: clamp(24px, 4vw, 40px);
  border-radius: 8px;
}

.login-form__field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.login-form__label {
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--ink);
}

.login-form__input {
  padding: 12px 16px;
  border: 1px solid var(--line);
  border-radius: 4px;
  background: var(--canvas);
  color: var(--ink);
  font-size: 1rem;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
  min-height: 44px;
}

.login-form__input:hover {
  border-color: var(--muted);
}

.login-form__input:focus {
  outline: none;
  border-color: var(--signal);
  box-shadow: 0 0 0 3px rgba(242, 78, 46, 0.25);
}

.login-form__input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.login-form__hint {
  font-family: "IBM Plex Mono", "Cascadia Mono", monospace;
  font-size: 0.7rem;
  color: var(--muted);
}

.login-form__error {
  margin: 0;
  padding: 12px 16px;
  color: var(--paper);
  background: var(--signal);
  border-radius: 4px;
  font-size: 0.9rem;
  line-height: 1.5;
}

.login-form__submit {
  margin-top: 8px;
  padding: 14px 24px;
  color: var(--ink);
  background: var(--acid);
  border: 0;
  border-radius: 4px;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  min-height: 44px;
  transition: background 0.15s ease, transform 0.1s ease;
}

.login-form__submit:hover:not(:disabled) {
  background: #c8eb3a;
}

.login-form__submit:active:not(:disabled) {
  transform: scale(0.98);
}

.login-form__submit:focus-visible {
  outline: 3px solid var(--signal);
  outline-offset: 3px;
}

.login-form__submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.login-view__note {
  margin: 24px 0 0;
  text-align: center;
  font-family: "IBM Plex Mono", "Cascadia Mono", monospace;
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
}

.login-view__note code {
  background: var(--canvas);
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 0.85em;
}
</style>