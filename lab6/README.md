# Лабораторна робота № 6 — робота з Vue Router

Застосунок — адаптивний каталог товарів на Vue 3 (Composition API,
`<script setup>`, JavaScript) з повною підтримкою маршрутизації через **Vue Router 4**.
Каталог зберігає пошук, негайне скасування запиту та дозавантаження з роботи 5;
картка товару відкриває окрему сторінку з вкладеними представленнями
(огляд та відгуки) без перезавантаження документа.

Автор: Бікулов Тимур Дамірович, група 7.F2.25-2. Середовище: Node.js 22 LTS,
npm 11, Vite 7, Vue 3, Vue Router 4, браузер Chrome (DevTools, панель Network).

![Початковий вигляд каталогу](screenshot.png)

## Запуск

```bash
npm ci
npm run dev
```

Vite покаже локальну адресу застосунку. Для перевірки виробничої збірки
використовуйте:

```bash
npm run build
npm exec vite preview -- --port 5176 --strictPort
```

У виробничому режимі (`createWebHistory`) сервер має повертати `index.html`
для будь-якого шляху, що не відповідає статичному файлу — налаштуйте
fallback на веб-сервері (nginx, Apache, Vercel, Netlify тощо).

## Дерево маршрутів

```
/                          → redirect → /products
/products                  → ProductsLayout
  ├─ (порожній)            → ProductCatalogView (name: products)
  └─ :id                   → ProductLayout
       ├─ (порожній)       → ProductOverviewView (name: product-overview)
       └─ reviews          → ProductReviewsView (name: product-reviews)
/about                     → AboutView (name: about)
/:pathMatch(.*)*           → NotFoundView (name: not-found)
```

## Розподіл відповідальності

| Модуль | Входи | Виходи | Власний стан | Відповідальність |
| --- | --- | --- | --- | --- |
| `App.vue` | навігація через RouterLink | зовнішній `RouterView`, шапка, підвал | немає | Загальна оболонка: бренд, основна навігація, підвал, монтування дочірніх представлень |
| `router/index.js` | — | `router` (createRouter) | конфігурація `routes` | Створення маршрутизатора, визначення іменованих маршрутів, redirect, catch-all, метадані `breadcrumb` |
| `layouts/ProductsLayout.vue` | — | вкладений `RouterView` | немає | Оболонка каталогу: проксиціює дочірній `RouterView` без додаткової розмітки |
| `layouts/ProductLayout.vue` | `route.params.id` | `product` (через слот `RouterView`), навігація вкладок | `product`, `productLoading`, `productError` | Завантаження товару за `id` через `useFetch`, спільний заголовок товару, вкладки огляду/відгуків, передача `product` дочірнім представленням |
| `views/ProductCatalogView.vue` | `route.query.q` | події `load-more`, `retry`, `update:modelValue` | `query`, `debouncedQuery`, `skip`, `products`, `total` | Координація пошуку (debounce, abort, sync з URL), пагінація, дозавантаження, передача даних у `ProductCatalog` |
| `views/ProductOverviewView.vue` | `product` (props) | — | `breadcrumbs` (через `useBreadcrumbs`) | Відображення опису, характеристик, зображень, тегів товару |
| `views/ProductReviewsView.vue` | `product` (props) | — | `breadcrumbs` (через `useBreadcrumbs`) | Відображення списку відгуків або повідомлення про порожній список |
| `views/AboutView.vue` | — | — | `breadcrumbs` | Статична інформація про застосунок, автор, технології |
| `views/NotFoundView.vue` | `route.fullPath` | навігація на каталог / about | `breadcrumbs` | Відображення 404 з поточним шляхом та посиланнями |
| `components/ProductSearchForm.vue` | `modelValue`, `isLoading`, `error`, `shownCount`, `total` | `update:modelValue` | немає | Поле пошуку, статус запиту, підказка debounce |
| `components/ProductCatalog.vue` | `products`, `isLoading`, `error` | `retry` | немає | Сітка `ProductCard`, скелетони, стан помилки, порожній стан |
| `components/ProductCard.vue` | `product` | — | формат ціни | Картка товару: зображення, категорія, рейтинг, заголовок, опис, ціна, наявність — **тепер `RouterLink` на `product-overview`** |
| `components/CatalogLoadMore.vue` | `loaded`, `total`, `isLoading`, `error`, `hasMore` | `load-more`, `retry` | ref маркера, IntersectionObserver | Нижній маркер, автоматичне дозавантаження, стани прогресу/помилки/кінець |
| `components/Breadcrumbs.vue` | `items` (масив `{label, to?}`) | — | навігація по `RouterLink` | Відображення хлібних крихт: `nav` + `ol`, `aria-current="page"` для поточної сторінки, приховані роздільники |
| `composables/useFetch.js` | URL (значення/ref/гетер, може бути `null`) | `data`, `error`, `isLoading`, `abort`, `refetch` | активний `AbortController`, `refetchCount` | HTTP GET, перевірка `response.ok`, збереження `status` помилки, захист від застарілих відповідей, підтримка `null` URL (немає запиту) |
| `composables/useDebouncedValue.js` | джерело (значення/ref/гетер), затримка | readonly-ref відкладеного значення | таймер | Відкладене реактивне значення; очищення таймера при зміні джерела |
| `composables/useIntersectionObserver.js` | ціль (ref), callback, опції | — | `IntersectionObserver`, watch | Спостереження за перетином маркера з viewport; `disconnect` при розмонтуванні |
| `composables/useBreadcrumbs.js` | `productTitle` (ref/computed/гетер, опціонально) | computed масив `{label, to?}` | — | Будова ланцюжка крихт з `route.matched` + `meta.breadcrumb`; динамічна назва товару до завантаження (`Товар №{id}`) та після; збереження `q` у посиланнях |

## Метадані хлібних крихт (`meta.breadcrumb`)

| Запис маршруту | `meta.breadcrumb` |
| --- | --- |
| `/products` (ProductsLayout) | `{ label: 'Каталог', name: 'products' }` |
| Дочірній `:id` (ProductLayout) | `{ dynamic: 'product', name: 'product-overview' }` |
| Дочірній `reviews` | `{ label: 'Відгуки', name: 'product-reviews' }` |
| `/about` | `{ label: 'Про застосунок', name: 'about' }` |
| `/:pathMatch(.*)*` | `{ label: 'Сторінку не знайдено', name: 'not-found' }` |

- `label` — готовий підпис для статичних рівнів.
- `dynamic: 'product'` — підпис береться з даних товару (реактивно через `productTitle`).
- `name` — ім'я маршруту для побудови `to` у `RouterLink`.
- Порожні дочірні маршрути (каталог у ProductsLayout, огляд у ProductLayout) **не мають** `breadcrumb`, щоб уникнути дублювання рівнів.

## Потік стану (оновлено для Lab 6)

```
URL (route.query.q) → query (чернетка) → abort активного запиту (flush: 'sync')
  └── debounce 400 мс → debouncedQuery → requestUrl → useFetch → page
        └── watch(data): skip = 0 → замінити, інакше merge → products

зміна query → router.replace({ name: 'products', query }) → history.replaceState
  └── watch(route.query.q) → оновлення query (без зворотного запису) → refetch/load first page

перехід на товар → ProductLayout завантажує product за id
  ├─ огляд / відгуки — спільний product через слот RouterView
  └─ перемикання вкладок — без нового запиту

хлібні крихти → useBreadcrumbs(productTitle) → route.matched → meta.breadcrumb
  ├─ до завантаження: "Товар №{id}"
  ├─ після успіху: product.title
  └─ помилка/404: "Товар не знайдено"
```

## Ключові рішення

- **`ProductCard` — це `RouterLink`**. Назва товару веде на `product-overview` з `params.id` і поточним `query.q`. Повернення через крихту «Каталог» відновлює пошук.
- **`ProductLayout` володіє даними товару**. `useFetch` запускається за `computed` URL, що залежить від `route.params.id`. При зміні `id` старий запит скасовується (`abort`), дані очищаються, новий запит стартує автоматично.
- **Слот `RouterView` у `ProductLayout`** передає `product` як пропс до `ProductOverviewView` та `ProductReviewsView`. Вони не роблять власні запити.
- **`useFetch` підтримує `null` URL** — для некоректного `id` запит не створюється, одразу показується «Товар не знайдено».
- **Пошук синхронізовано з URL через `q`**. Введення → debounce 400 мс → `router.replace` (не створює запису історії). Повернення кнопками «Назад/Вперед» або посиланням → `watch(route.query.q)` відновлює поле і запускає запит; старий debounce-таймер не пише назад у URL.
- **Хлібні крихти — чистий презентаційний компонент**. `Breadcrumbs.vue` отримує готовий масив `items` і не виконує HTTP-запитів. Логіка збирання в `useBreadcrumbs`.
- **Адаптивність**: перевірено на 360×800, 768×1024, 1440×900, 844×390 — без горизонтальної прокрутки, довгі назви переносяться, посилання доступні з клавіатури.

## Перевірки (таблиця з лабораторної)

| Сценарій | Очікуваний результат | URL | Кількість запитів товару |
| --- | --- | --- | --- |
| `/` | redirect на `/products`, каталог як у lab5 | `/products` | 0 |
| Картка товару | перехід без нового HTML, `q` зберігається | `/products/12?q=phone` | 1 |
| Пряме відкриття `/products/12` | один запит товару, огляд показується | `/products/12` | 1 |
| Пряме відкриття `/products/12/reviews` | один запит товару, відгуки показуються | `/products/12/reviews` | 1 |
| Перемикання огляд ↔ відгуки | дані товару не перезавантажуються | той самий `id` | 0 (додаткових) |
| Крихти (Tab/Enter) | навігація без миші, `aria-current="page"` | — | — |
| Завантаження товару | спочатку `Товар №12`, потім `product.title` | — | 1 |
| Зміна `id` (кнопка в оболонці) | дані оновлюються в тому самому екземплярі, старий запит не перезаписує новий | `/products/13` | 1 (новий), 0 (скасований) |
| Некоректний `id` (`/products/abc`) | без запиту, «Товар не знайдено» | `/products/abc` | 0 |
| Відсутній товар (`/products/999999`) | HTTP 404 → «Товар не знайдено», кнопка повтору | `/products/999999` | 1 |
| Невідомий шлях (`/unknown`) | NotFoundView, власна крихта | `/unknown` | 0 |
| Offline → Online | помилка мережі → повтор запиту показує товар | — | 1 (повтор) |
| Пошук `q=phone` → товар → крихта «Каталог» | поле = `phone`, результати `phone`, `q` збережено | `/products?q=phone` | 1 (каталог) + 1 (товар) |
| Повернення до `phone` під час очікування | debounce повідомляє про завершення, новий запит `phone` | `/products?q=phone` | 1 (новий, скасований не рахується) |

## Структура проєкту

```
src/
├── api/
│   └── products.js
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
│   └── useIntersectionObserver.js
├── layouts/
│   ├── ProductLayout.vue
│   └── ProductsLayout.vue
├── router/
│   └── index.js
├── styles/
│   └── main.css
├── views/
│   ├── AboutView.vue
│   ├── NotFoundView.vue
│   ├── ProductCatalogView.vue
│   ├── ProductOverviewView.vue
│   └── ProductReviewsView.vue
├── App.vue
└── main.js
```

## Git

`node_modules` і `dist` виключені через `.gitignore`. Коміт лише вихідного коду.