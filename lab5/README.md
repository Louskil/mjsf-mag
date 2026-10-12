# Лабораторна робота № 5 — каталог із composables

Застосунок — адаптивний каталог товарів на Vue 3 (Composition API,
`<script setup>`, JavaScript). Перші 12 товарів отримує з DummyJSON зі штучною
затримкою 1500 мс, підтримує асинхронний пошук із debounce 400 мс і
негайним скасуванням активного запиту, а під час прокручування автоматично
дозавантажує наступні сторінки через `IntersectionObserver`.

Автор: Бікулов Тимур Дамірович, група 7.F2.25-2. Середовище: Node.js 22 LTS,
npm 11, Vite 7, Vue 3, браузер Chrome (DevTools, панель Network).

![Початковий вигляд каталогу](screenshot.png)

## Запуск

```bash
npm ci
npm run dev
```

Vite покаже локальну адресу застосунку. Для перевірки виробничої збірки
використовуйте `npm run build`.

## Розподіл відповідальності

| Модуль | Входи | Виходи | Власний стан | Відповідальність |
| --- | --- | --- | --- | --- |
| `App.vue` | події `load-more`, `retry`, `update:modelValue` від компонентів | пропси компонентам, обробники подій | `query`, `skip`, `products`, `total` | Композиція сторінки: стан пошуку, номер сторінки, об’єднання результатів, умови `loadMore` |
| `ProductSearchForm.vue` | `modelValue`, `isLoading`, `error`, `shownCount`, `total`, `delay` | подія `update:modelValue` | немає | Поле пошуку, підпис і стан запиту. URL, fetch і таймери не створює |
| `ProductCatalog.vue` | `products`, `isLoading`, `error` | подія `retry` | немає | Сітка `ProductCard` (key — `product.id`) та вибір між завантаженням, помилкою й порожнім станом |
| `ProductCard.vue` | `product` | немає | формат ціни | Представлення одного товару; товар не змінює |
| `CatalogLoadMore.vue` | `loaded`, `total`, `isLoading`, `error`, `hasMore` | події `load-more`, `retry` | шаблонний ref маркера, IntersectionObserver через composable | Нижній маркер, стан наступної сторінки; список товарів не змінює |
| `useFetch.js` | URL (значення, ref або гетер) | `data`, `error`, `isLoading`, `abort`, `refetch` | controller активного запиту, лічильник `refetch` | HTTP-запит, асинхронний стан, скасування через `AbortController` |
| `useDebouncedValue.js` | джерело (значення, ref або гетер), затримка | readonly-ref відкладеного значення | таймер затримки | Відкладене реактивне значення; попередній таймер очищає сам |
| `useIntersectionObserver.js` | ціль (ref), callback, параметри observer | немає | екземпляр `IntersectionObserver`, внутрішній watch | Підписка на перетин маркера з viewport; `disconnect` при розмонтуванні |

Модуль, який створив ресурс, відповідає за його очищення: таймер живе в
`useDebouncedValue`, `AbortController` — в `useFetch`, а observer — в
`useIntersectionObserver`. Компоненти лише передають ціль і отримують події.

## Потік стану

```
query → abort активного запиту (flush: 'sync')
  └── debounce 400 мс → requestUrl → useFetch → page
        └── watch(data): skip = 0 → замінити, інакше merge → products

нижній маркер → load-more → skip + 12 ────────────────┘
```

- сирий `query` спостерігається із `{ flush: 'sync' }` і негайно викликає
  `abort()`: активний запит у Network отримує стан canceled, а скасування
  ніколи не відображається як помилка;
- `debouncedQuery` змінює `requestUrl` лише після 400 мс без введення;
  синхронно скидає `skip`, `products` та `total`;
- URL формується в `createProductsUrl(query, skip)` через `URLSearchParams`:
  завжди `limit=12`, поточний `skip` і `delay=1500`; для непорожнього рядка —
  шлях `/products/search` і параметр `q`, для порожнього — `/products` без `q`;
- нову сторінку `useFetch` повертає у `data`; сторінка з `skip=0` замінює
  список, наступні додаються лише товари з новими `id` (без мутації
  відповіді API);
- `loadMore()` збільшує `skip` на 12, лише якщо ще є результати, запит не
  виконується, debounce не очікує нового рядка та немає помилки;
- після отримання всіх результатів (`products.length === total`) нові запити
  не виконуються.

## Чому межі саме такі

- **`ProductSearchForm` не формує URL.** Поле передає введений рядок назовні
  через `update:modelValue`; похідний URL — задача власника стану пошуку
  (`App.vue`), бо URL залежить і від `skip`, якого форма не знає.
- **`ProductCatalog` не завантажує дані.** Він отримує готовий масив
  `products` і лише вибирає один із чотирьох станів розмітки. Повторний запит
  експортовано подією `retry`, щоб список не вирішував, як отримати дані.
- **Очищення в composables, а не в компонентах.** Таймер, `AbortController`
  і observer — ресурси, створені відповідними composable; саме вони знають,
  що очищувати (таймер → `clearTimeout`, запит → `abort()`, observer →
  `disconnect()`). Компонент передає маркер і каже callback подією, а не
  розриває чужий ресурс.

## Перевірки

| Перевірка | Очікуваний результат |
| --- | --- |
| Відкриття сторінки | Після ~1500 мс показано 12 товарів і «Показано 12 із N товарів» (N — `total` з відповіді API) |
| Введення `phone` порціями в Network | Активний запит отримує стан canceled без блоку помилки |
| Пауза 400 мс після останнього символа | Новий запит на `/products/search?limit=12&skip=0&delay=1500&q=phone`; список замінено на результати пошуку |
| Порожнення поля пошуку | Повернення до початкового каталогу `/products` |
| Прокручування до нижнього маркера | Запит зі збільшеним `skip`; картки додаються без повторення `id` |
| Прокручування до кінця результатів | Нижній блок показує «Усі товари показано», нових запитів немає |
| Помилка запиту (вимкнення мережі) | Блок помилки з кнопкою «Повторити запит»; повтор успішний |
| Дозавантаження сторінки | Уже показані картки не зникають, індикатор лише в нижньому блоці |
| Ширини 390 та 1440 px | Вертикальна прокрутка без горизонтальної |

## Структура

```
src/
├── api/
│   └── products.js
├── components/
│   ├── CatalogLoadMore.vue
│   ├── ProductCard.vue
│   ├── ProductCatalog.vue
│   └── ProductSearchForm.vue
├── composables/
│   ├── useDebouncedValue.js
│   ├── useFetch.js
│   └── useIntersectionObserver.js
├── styles/
│   └── main.css
├── App.vue
└── main.js
```
