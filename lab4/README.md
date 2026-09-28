# Lab 4 — Складні компоненти: вкладки через Slots, Provide/Inject, динамічні компоненти та KeepAlive

## Технології та версії

| Технологія     | Версія       |
|---------------|-------------|
| Vue           | ^3.5.42     |
| Vite          | ^8.3.0      |
| @vitejs/plugin-vue | ^6.0.8  |
| Tailwind CSS  | 3.4.17      |
| PostCSS       | 8.5.6       |
| Autoprefixer  | 10.4.21     |
| Sass          | ^1.105.0    |
| Node.js       | 22 LTS      |

## Команди для запуску та збірки

```bash
npm create vite@latest lab4 -- --template vue
cd lab4
npm install
npm install -D --save-exact tailwindcss@3.4.17 postcss@8.5.6 autoprefixer@10.4.21 sass
npx tailwindcss init -p
npm run dev -- --port 5173 --strictPort
npm run build
npm run preview -- --port 4173 --strictPort
```

## Структура проєкту

```
src/
├── main.js                           # Точка входу: createApp → mount
├── App.vue                           # Корневий компонент: 3 набори вкладок
├── style.css                         # Глобальні стилі: CSS-змінні, базові класи
├── data/
│   └── tabsConfig.js                 # Конфігураційний масив для варіанту pills
└── components/
    ├── ModalDialog.vue               # Модальне вікно (з lab3, адаптовано під dark theme)
    ├── tabs/
    │   ├── tabsKey.js                # Symbol-ключ для provide/inject
    │   ├── Tabs.vue                  # Контейнер (стан, навігація, ARIA)
    │   └── Tab.vue                   # Декларація вкладки (слот, компонент, KeepAlive)
    └── demo-panels/
        ├── OverviewPanel.vue         # Панель: поле нотатки (v-model)
        ├── RequirementsPanel.vue     # Панель: чекбокси + лічильник
        └── EnvironmentPanel.vue      # Панель: інфо про СЕО + ModalDialog
```

## Архітектура складного компонента

Система вкладок — це **складний компонент** (compound component): кілька дочірніх
компонентів `Tab`, які разом із батьківським `Tabs` керують одним спільним станом —
активною вкладкою.

```
App.vue
├── Tabs (underline)        ← володіє станом, надає контекст
│   ├── Tab (overview)      ← реєструється, читає isActive з контексту
│   │   └── OverviewPanel   ← вміст у слоті (кешується KeepAlive)
│   ├── Tab (requirements)  ← реєструється, читає isActive з контексту
│   │   └── RequirementsPanel
│   └── Tab (environment)   ← реєструється
│       └── EnvironmentPanel
│           └── ModalDialog (Teleport → body)
│
├── Tabs (pills)            ← незалежний екземпляр, власний контекст
│   ├── Tab*3 (через v-for) ← панелі передаються значенням через panel + panelProps
│
└── Tabs (boxed)            ← незалежний екземпляр, власний контекст
    ├── Tab (overview, slot)
    ├── Tab (requirements, disabled!) ← вимкнена, пропускається клавіатурою
    └── Tab (environment, slot)
        └── EnvironmentPanel (другий екземпляр — власний стан)
```

## Механізми Vue 3 у цій роботі

### 1. Slots (слоти)

Слоти дозволяють передавати розмітку з батьківського шаблону у дочірній компонент.
У системі вкладок `Tab` отримує вміст панелі через **слот за замовчуванням**:

```html
<Tab slug="overview" title="Огляд">
  <OverviewPanel />
</Tab>
```

Розмітка `<OverviewPanel />` компілюється в **межах батьківського шаблону** (App.vue),
тому всі локальні змінні та дані доступні без додаткового прокидання через props.
Слот має **безумовний пріоритет**: якщо `$slots.default` наявний, пропс `panel`
не розглядається.

### 2. Provide / Inject

Контейнер `Tabs` надає реактивний контекст через `provide(tabsKey, context)`,
де `tabsKey` — це `Symbol('tabs')` з `tabsKey.js`. Компонент `Tab` отримує
контекст через `inject(tabsKey)`, не створюючи ланок prop drilling:

```js
// tabsKey.js
export const tabsKey = Symbol('tabs')

// Tabs.vue — надає контекст
provide(tabsKey, {
  activeSlug: readonly(activeSlug),
  idPrefix,
  setActiveTab,
  registerTab,
  unregisterTab,
})

// Tab.vue — отримує контекст
const context = inject(tabsKey)
```

Кожен екземпляр `Tabs` створює власний контекст, тому два набори вкладок на
одній сторінці мають **незалежні стани**.

### 3. Динамічні компоненти `<component :is>`

Коли склад вкладок формується динамічно (масив конфігурації), панель передається
значенням через пропс `panel`. У шаблоні `Tab.vue` використовується:

```html
<component v-else-if="isActive" :is="panel" v-bind="panelProps" />
```

`:is="panel"` відображає компонент із масиву, а `v-bind="panelProps"` розгортає
об'єкт параметрів і передає їх як звичайні props.

### 4. KeepAlive

`KeepAlive` кешує екземпляри компонентів, які вилучаються з DOM через `v-if`,
замість повного знищення. Це дозволяє **зберігати локальний стан** панелів
(текст у полях, стан чекбоксів, лічильники, відкриті діалоги) під час перемикання
вкладок.

```html
<KeepAlive>
  <slot v-if="isActive && $slots.default" :is-active="isActive" />
  <component v-else-if="isActive" :is="panel" v-bind="panelProps" />
</KeepAlive>
```

`v-if="isActive"` демонтує компонент, а `KeepAlive` зберігає його у кеші.
При повторному виборі вкладки компонент **активується з кешу** — стан не
скидається. Хуки `onActivated` / `onDeactivated` дозволяють керувати ресурсами.

## Контракти компонентів

### Tabs.vue (IDEF0: A1 «Керувати вкладками»)

| Стрілка   | Параметр / подія          | Тип         | Опис                                              |
|-----------|--------------------------|-------------|---------------------------------------------------|
| **Input** | `modelValue`             | String      | Slug активної вкладки (обов'язковий)             |
| **Input** | `variant`                | String      | Оформлення: `underline` (default), `pills`, `boxed`|
| **Control**| `v-model` контракт      | —           | `update:modelValue` при виборі вкладки            |
| **Control**| WAI-ARIA                | —           | `role="tablist"`, `aria-selected`, `aria-controls`|
| **Control**| Roving Tabindex         | —           | `tabindex="0"` / `tabindex="-1"` на кнопках       |
| **Output**| `update:modelValue`     | String      | Slug нової активної вкладки                        |
| **Output**| `tabsKey` контекст      | Symbol-key | `activeSlug`, `idPrefix`, `setActiveTab`,         |
|           |                          |             | `registerTab`, `unregisterTab`                    |
| **Mechanism**| Vue 3 provide/inject   | —           | `readonly`, `useId`, `nextTick`                  |

### Tab.vue (IDEF0: A2 «Показати панель»)

| Стрілка   | Параметр / подія    | Тип    | Опис                                      |
|-----------|--------------------|--------|-------------------------------------------|
| **Input** | `slug`             | String | Унікальний ідентифікатор (обов'язковий)    |
| **Input** | `title`            | String | Напис на кнопці вкладки (обов'язковий)     |
| **Input** | `disabled`         | Boolean| Вимикає вкладку (default: false)           |
| **Input** | `panel`            | Object | Компонент-панель (для dynamic component)    |
| **Input** | `panelProps`       | Object | Параметри панелі (default: {})              |
| **Control**| `tabsKey` context  | Symbol | Отримує `isActive`, `idPrefix` через inject |
| **Control**| WAI-ARIA          | —      | `role="tab"`, `role="tabpanel"`,           |
|           |                    |        | `aria-controls`, `aria-labelledby`         |
| **Output**| `<section>` панель | —      | `v-show="isActive"`, `role="tabpanel"`,    |
|           |                    |        | `KeepAlive` для кешування стану            |
| **Mechanism**| Lifecycle hooks  | —      | `onMounted` → `registerTab`,               |
|           |                   |        | `onBeforeUnmount` → `unregisterTab`        |

## Доступність (WAI-ARIA)

| Елемент          | Атрибут                  | Призначення                          |
|-----------------|----------------------|--------------------------------------|
| `nav` (tablist)  | `role="tablist"`   | Група кнопок перемикання             |
|                  | `aria-label`         | Доступна назва набору                |
| Button (tab)     | `role="tab"`         | Кнопка вкладки                       |
|                  | `aria-selected`      | Активна/неактивна                    |
|                  | `aria-controls`      | Посилання на панель                  |
|                  | `tabindex`           | 0 (активна) / -1 (інші) — Roving    |
| `section` (panel)| `role="tabpanel"`    | Контейнер вмісту                     |
|                  | `aria-labelledby`    | Посилання на кнопку                  |
|                  | `tabindex="0"`       | Доступність клавіатурою Tab          |

### Клавіатурна навігація (автоматична активація)

| Клавіша       | Дія                                              |
|--------------|--------------------------------------------------|
| `Tab`        | Фокус на активній вкладці → наступний Tab → панель|
| `ArrowRight`  | Перехід до наступної вкладки + активація         |
| `ArrowLeft`   | Перехід до попередньої вкладки + активація       |
| `Home`        | Перехід на першу вкладку + активація            |
| `End`         | Перехід на останню вкладку + активація           |

Вимкнені вкладки (`disabled`) пропускаються під чіллювання клавіатури та в Tab-порядку.

## Темній інтерфейс

Кольори задані **ролями** (CSS-змінними) у `style.css`:

| Роль              | CSS-змінна            | Значення      |
|------------------|-----------------------|--------------|
| Фоновий колір сторінки | `--color-page`    | `#0a0e14`    |
| Фоновий колір поверхні | `--color-surface`  | `#151b24`    |
| Основний текст      | `--color-ink`        | `#e6edf3`    |
| Розгорілий текст     | `--color-muted`      | `#8b9397`    |
| Розділювачі/бордюри   | `--color-line`      | `#30363d`    |
| Акцент               | `--color-accent`     | `#58a14f`    |
| Vue                  | `--color-vue`        | `#42b883`    |
| HTML                 | `--color-html`       | `#e44d26`    |
| CSS                   | `--color-css`        | `#5ac8fa`    |
| JavaScript            | `--color-javascript` | `#d29922`    |

Власних значень кольору в компонентах немає — усі кольори використовують
CSS-змінні через `@apply` або прямі CSS-властивості.
