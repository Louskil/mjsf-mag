# Лабораторна робота № 7 — авторизація, приватні маршрути, керування товарами

Застосунок — розширення lab6: публічний каталог із пошуком, сторінками товарів, відгуками та крихтами збережено; додано авторизацію через DummyJSON Auth API, приватний розділ керування товарами (список, пагінація, редагування з валідацією), Pinia 3 Setup Stores, захист маршрутів, відновлення сеансу, обробку 401, чернетки форм, попередження про незбережені зміни.

Автор: Бікулов Тимур Дамірович, група 7.F2.25-2. Середовище: Node.js 24 LTS, npm, Vite 7, Vue 3.5.43, Vue Router 4.6.4, Pinia 3.0.4, браузер Chrome (DevTools, Network, емуляція розмірів).

## Запуск

```bash
npm ci
npm run dev -- --port 5177 --strictPort
```

Для перевірки виробничої збірки:

```bash
npm run build
npm exec vite preview -- --port 5177 --strictPort
```

У виробничому режимі (`createWebHistory`) сервер має повертати `index.html` для будь-якого шляху, що не відповідає статичному файлу — налаштуйте fallback на веб-сервері.

## Дерево маршрутів

```
/                          → redirect → /products
/products                  → ProductsLayout
  ├─ (порожній)            → ProductCatalogView (name: products)
  └─ :id                   → ProductLayout
       ├─ (порожній)       → ProductOverviewView (name: product-overview)
       └─ reviews          → ProductReviewsView (name: product-reviews)
/about                     → AboutView (name: about)
/login                     → LoginView (name: login)
/manage/products           → ManageLayout (meta.requiresAuth)
  ├─ (порожній)            → ManageProductsView (name: manage-products)
  └─ :id/edit              → ProductEditView (name: manage-edit)
/:pathMatch(.*)*           → NotFoundView (name: not-found)
```

Приватні маршрути (`/manage/products*`) доступні лише після підтвердження сеансу (`auth.isAuthenticated`). Глобальний `beforeEach` чекає `auth.restore()` перед перевіркою. Ціль повернення (`redirect`) приймається лише для внутрішніх маршрутів `manage-products` або `manage-edit`; зовнішні URL і сам `/login` ігноруються.

## Розподіл відповідальності модулів

| Модуль | Входи | Виходи | Власний стан | Відповідальність |
| --- | --- | --- | --- | --- |
| `src/stores/index.js` | — | `pinia` (createPinia) | — | Єдиний екземпляр Pinia, підключається до застосунку **перед** router |
| `src/stores/auth.js` | — | `useAuthStore` | `accessToken`, `user`, `status` (`guest`/`checking`/`authenticated`/`unavailable`), `error`, `loginPending`, `restorePending` | Сеанс: вхід (POST /auth/login), відновлення через /auth/me (sessionStorage → accessToken), вихід, спільний `request(token)` для приватних API; `isAuthenticated` computed |
| `src/stores/products.js` | — | `useProductsStore` | `confirmedChanges` (id → {title,price,stock,description}), `savePending`, `saveAbortControllers` | Тільки **підтверджені** зміни поточного сеансу; `getDisplayProduct(server, id)` — поєднання серверних даних і локальних змін; `save(id, draft)` — PATCH /auth/products/:id з перевіркою актуальності токена; `reset()` — очистка при завершенні сеансу |
| `src/api/http.js` | path, options(token, signal, body) | JSON / HttpError | `authTokenProvider` (setter) | Низькорівневий HTTP: `response.ok`, розрізнення 401, `credentials: omit`, `Authorization: Bearer <token>`, підтримка `AbortSignal`, JSON body |
| `src/api/productDraft.js` | draft object | `{valid, errors, normalized}` | — | Нормалізація (trim, Number) та валідація: title 1–120, price > 0 finite, stock ≥ 0 integer, description 1–2000; порожні числові — помилка |
| `src/auth/session.js` | — | ключ, get/set/clear | — | Робота з `sessionStorage` лише для `accessToken`; пароль і refresh token не зберігаються |
| `src/composables/usePrivateResource.js` | pathFactory (ref/computed/fn) | `data`, `error`, `isLoading` | `AbortController` | Реактивне читання приватних ресурсів через `auth.request()`; скасування при зміні шляху або демонтуванні; застарілі відповіді не застосовуються |
| `src/router/guards.js` | router | — | — | `createRouteGuards`: global `beforeEach` з очікуванням `restore`, redirect до `/login?redirect=…` для приватних; `setupSessionLostHandler`: реакція на 401/вихід на вже відкритій приватній сторінці |
| `src/layouts/ManageLayout.vue` | — | `RouterView`, хлібні крихти, шапка з користувачем/виходом | — | Приватна оболонка: показує вміст лише для `isAuthenticated`; крихти «Керування» → назва товару (реактивно через `products.getBreadcrumbTitle`) → «Редагування» |
| `src/views/LoginView.vue` | — | подія сабміту | `username`, `password`, `localError` | Форма входу; блокування повторного сабміту; помилка у формі; пароль не потрапляє в store; після успіху — `replace` на `redirect` або `manage-products` |
| `src/views/ManageProductsView.vue` | — | навігація на редагування | `skip`, `isLoadingMore` | Приватний список (GET /auth/products?limit=12&skip): таблиця назва/ціна/залишок/посилання; пагінація Prev/Next; блокування паралельних запитів; loading/error/retry |
| `src/views/ProductEditView.vue` | `route.params.id` | — | `draft`, `fieldErrors`, `touched`, `initialDraft`, `submitError` | Завантаження приватного товару; локальна чернетка (не мутує завантажений об'єкт); валідація на blur/спробі сабміту через `productDraft`; фокус на першу помилку; PATCH блокує поля/повтор; «Скасувати» відновлює без запиту; `onBeforeRouteLeave`/`Update` + `beforeunload` — підтвердження незбережених змін |
| `src/views/ProductCatalogView.vue` | `route.query.q` | — | `query`, `debouncedQuery`, `skip`, `products`, `total` | Публічний каталог (lab6): пошук, debounce 400ms, abort, пагінація, крихти |
| `src/views/ProductOverviewView.vue` / `ProductReviewsView.vue` | `product` (props) | — | `breadcrumbs` | Сторінки товару (lab6): огляд, відгуки, спільні дані через слот ProductLayout |
| `src/layouts/ProductLayout.vue` | `route.params.id` | `product` (slot) | `product`, `productLoading`, `productError` | Завантаження товару, спільний заголовок, вкладки; некоректний id — без запиту |
| `src/components/*` | props | events | — | UI-компоненти (lab6 + BEM для нових елементів): `ProductCard`, `ProductSearchForm`, `ProductCatalog`, `CatalogLoadMore`, `Breadcrumbs` |
| `src/composables/useFetch.js` | URL | `data`, `error`, `isLoading`, `abort`, `refetch` | `AbortController` | Публічний GET з перевіркою `ok`, збереження статусу, захист від застарілих відповідей |
| `src/composables/useBreadcrumbs.js` | `productTitle` | computed items | — | Збирання крихт з `route.matched` + `meta.breadcrumb`; динамічна назва товару |

## Pinia Stores (Setup Store API)

### `auth` (`src/stores/auth.js`)
- **State (ref):** `accessToken`, `user`, `status`, `error`, `loginPending`, `restorePending`
- **Getters (computed):** `isAuthenticated` (token + user + status==='authenticated'), `isChecking`, `isGuest`, `isUnavailable`
- **Actions:**
  - `login(username, password)` — POST /auth/login, зберігає токен у sessionStorage, оновлює стан; блокує паралельний запуск
  - `restore()` — читає токен зі sessionStorage, GET /auth/me; одночасні виклики чекають один запущений проміс; 401 → очистка сеансу; мережева помилка → `status='unavailable'`, кнопка повтору
  - `logout()` — очищає токен, профіль, sessionStorage; пізні відповіді login/restore не відновлюють сеанс
  - `request(path, options)` — проксі до `http` з поточним токеном; перевіряє, чи токен не змінився під час запиту

### `products` (`src/stores/products.js`)
- **State (ref):** `confirmedChanges` (Record<id, {title,price,stock,description}>), `savePending` (Record<id, boolean>), `saveAbortControllers` (Record<id, AbortController>)
- **Getters (computed/functions):** `getConfirmed(id)`, `hasConfirmed(id)`, `getDisplayProduct(serverProduct, id)` — мерж серверних даних і підтверджених змін сеансу, `getBreadcrumbTitle(serverProduct, id)`
- **Actions:**
  - `save(id, draft)` — валідація через `productDraft`, PATCH /auth/products/:id з токеном; блокує повторне збереження; перед записом у store перевіряє актуальність операції і сеансу; 401 → помилка «Сеанс закінчився»
  - `cancelSave(id)` — abort поточного запиту
  - `reset()` — очищає `confirmedChanges`, скасовує всі збереження; викликається при завершенні сеансу

## Життєвий цикл сеансу

1. **Завантаження застосунку** — `App.vue` `onMounted` викликає `auth.restore()`
2. **Перехід на приватний маршрут** — `beforeEach` чекає `restore`; якщо не автентифіковано → `/login?redirect=…`
3. **Вхід** — `LoginView` → `auth.login` → токен у sessionStorage + store → `router.replace(redirect)` (тільки внутрішні цілі)
4. **Приватні запити** — `usePrivateResource` → `auth.request(path)` → `http` з `Authorization: Bearer <token>`
5. **401 у приватному API** — `auth.request` очищує сеанс; `setupSessionLostHandler` перенаправляє: `/manage/products/*` → `/login`, інші приватні → каталог
6. **Вихід** — `auth.logout()` → очистка store + sessionStorage; `products.reset()`; пізні відповіді не відновлюють старий стан
7. **Reload** — повторне `auth.restore()` через /auth/me; підроблений токен → 401 → очистка; мережева помилка → `unavailable`, токен залишається для повтору

## Валідація форми редагування (`productDraft.js`)

| Поле | Нормалізація | Правила |
| --- | --- | --- |
| title | `String(...).trim()` | 1–120 символів |
| price | `Number(...)` | finite, > 0; порожнє — помилка |
| stock | `Number(...)` | integer, ≥ 0; порожнє — помилка |
| description | `String(...).trim()` | 1–2000 символів |

Помилки показуються біля полів через `aria-describedby`/`aria-invalid`; при сабміті фокус переходить на першу помилку; PATCH не відправляється при невалідності.

## Спільний результат (оптимістичне оновлення UI)

Після успішного PATCH `products.save` записує поля у `confirmedChanges[id]`. Функція `getDisplayProduct(serverProduct, id)` повертає об'єкт з накладеними локальними змінами. Вона використовується:
- у `ManageProductsView` (таблиця)
- у публічному `ProductLayout` / `ProductCard` / `ProductOverviewView` (через props/product)
- у крихтах `ManageLayout` (`products.getBreadcrumbTitle`)

> **Важливо:** Зміни існують лише в пам'яті поточного сеансу. `/auth/products` (GET) не зберігає їх на сервері — новий GET поверне оригінальні дані. Тому `getDisplayProduct` читає `confirmedChanges` поверх серверного об'єкта. У приватному розділі показується підказка: *«Зміни діють до reload або виходу»*. Словник **не записується** у Web Storage.

## Адаптивність та доступність

Перевірено на: **360×800**, **768×1024**, **1440×900**, **844×390** — без горизонтального переповнення, обрізаних полів. Форми доступні з клавіатури (Tab/Shift+Tab/Enter). Нові дії (кнопки редагування, збереження, вихід, пагінація) мають область натискання ≥ 44×44 px. Використано пов'язані `label`/`id`, `aria-describedby` для помилок, `aria-invalid`, `aria-live` для статусів, `aria-current="page"` у крихтах.

## Технології

- Vue 3.5.43 (Composition API, `<script setup>`)
- Vue Router 4.6.4 (createWebHistory, вкладений RouterView, meta.requiresAuth, global beforeEach)
- Pinia 3.0.4 (Setup Stores: `defineStore`, `ref`/`computed`/`actions`, `storeToRefs`)
- Vite 7 (dev, build, preview)
- DummyJSON Auth API (`/auth/login`, `/auth/me`) + Products API (`/auth/products`, `/auth/products/:id` PATCH)
- JavaScript (ESM), BEM-методологія CSS

## Структура проєкту (оновлена)

```
src/
├── api/
│   ├── http.js            # Низькорівневий HTTP (fetch, Bearer, AbortSignal, credentials: omit)
│   └── productDraft.js    # Нормалізація та валідація чернетки товару
├── auth/
│   └── session.js         # Ключ та функції sessionStorage для accessToken
├── components/
│   ├── Breadcrumbs.vue
│   ├── CatalogLoadMore.vue
│   ├── ProductCard.vue
│   ├── ProductCatalog.vue
│   └── ProductSearchForm.vue
├── composables/
│   ├── useBreadcrumbs.js
│   ├── useDebouncedValue.js
│   ├── useFetch.js
│   ├── useIntersectionObserver.js
│   └── usePrivateResource.js   # Реактивне читання приватних ресурсів через auth.request
├── layouts/
│   ├── ManageLayout.vue     # Приватна оболонка: шапка з user/logout, крихти, RouterView
│   ├── ProductLayout.vue
│   └── ProductsLayout.vue
├── router/
│   ├── guards.js            # beforeEach + session lost handler
│   └── index.js             # Маршрути + підключення guard'ів
├── stores/
│   ├── index.js             # createPinia (єдиний, до router)
│   ├── auth.js              # Setup Store: сеанс, токен, профіль, request
│   └── products.js          # Setup Store: підтверджені зміни, save, getDisplayProduct
├── styles/
│   └── main.css
├── views/
│   ├── AboutView.vue
│   ├── LoginView.vue                    # Форма входу, redirect, блокування повторного сабміту
│   ├── ManageProductsView.vue           # Приватний список з пагінацією, посилання на редагування
│   ├── NotFoundView.vue
│   ├── ProductCatalogView.vue           # Публічний каталог (lab6)
│   ├── ProductEditView.vue              # Редагування: чернетка, валідація, PATCH, підтвердження виходу
│   ├── ProductOverviewView.vue
│   └── ProductReviewsView.vue
├── App.vue                # Шапка з user/logout, монтування RouterView
└── main.js                # createApp → pinia → router → mount
```

## Git

`node_modules` і `dist` виключені через `.gitignore`. `package-lock.json` збережено. Коміт лише вихідного коду.

## Перевірки (таблиця з лабораторної)

| # | Сценарій | Очікуваний результат |
|---|---|---|
| 1 | Пряма приватна адреса гостя | Відкриває `/login` без показу редактора; після успіху — відновлює ціль |
| 2 | Неправильний пароль | Показує помилку; швидке повторне натискання не створює другого POST |
| 3 | Reload із чинним токеном | Виконує `/auth/me`; підроблений токен вилучається, доступ не надається |
| 4 | Offline під час restore | Токен збережений, приватний вміст закритий; Online → повтор перевірки успішний |
| 5 | Приватний список / редагування | Пагінація працює; редагування відкриває правильний id; некоректний id — без запиту; 404 — окремий стан |
| 6 | Валідація полів | Порожня назва, нульова ціна, дробовий/порожній залишок, порожній опис — помилки без PATCH; фокус на першу |
| 7 | Чернетка / скасування | Зміна поля не оновлює список; «Скасувати» відновлює без запиту; відмова у підтвердженні виходу лишає чернетку |
| 8 | Успішний PATCH | Оновлює приватний список, публічну сторінку, крихту; reload → серверні значення, сеанс перевіряється знову |
| 9 | Помилка PATCH | Не змінює підтверджені дані, не стирає чернетку; після відновлення мережі — повтор збереження |
| 10 | Збереження + вихід до відповіді | Пізня відповідь не повертає сеанс/зміни; повторний вхід — без попередніх локальних змін |
| 11 | 401 приватного API (Bearer invalid) | Клієнт завершує сеанс; токен у store не змінювався вручну |
| 12 | Адаптивність / клавіатура | 4 розміри екрану без горизонтального скролу; Tab/Shift+Tab/Enter працюють; хіт-зони ≥ 44×44 |

## Межі навчальної моделі

- DummyJSON `/auth/products` PATCH **імітує** оновлення — дані не зберігаються на сервері; GET повертає оригінал.
- Серверний пошук (`/products/search?q=...`) працює з оригінальними даними; локальні зміни не впливають на набір/рейтинг.
- `expiresInMins: 30` — токен живе 30 хв; перевірка сеансу робиться через `/auth/me` при завантаженні/переходу.
- `sessionStorage` — лише `accessToken`; пароль і refresh token ніколи не зберігаються.
- Жодних бібліотек готової авторизації або автоматичного збереження Pinia не застосовується.