# Lab 3 — Створення адаптивного модального вікна з використанням слотів, ref, Teleport і Transition

## Технології та версії

Vue ^3.5.42
Vite ^8.3.0
@vitejs/plugin-vue ^6.0.8
Tailwind CSS 3.4.17
PostCSS 8.5.6
Autoprefixer 10.4.21
Node.js 22 LTS

## Запуск та збірка, та комманди використанні для виконання роботи

```bash
npm install
npm run dev -- --port 5173 --strictPort
```

```bash
npm run build
npm run preview -- --port 4173 --strictPort
```

```bash
npm install -D --save-exact tailwindcss@3.4.17 postcss@8.5.6 autoprefixer@10.4.21
npx tailwindcss init -p
```

## Структура компонентів

```
src/
├── main.js                      # Точка входу: createApp → mount
├── App.vue                      # Корневий компонент (header, hero, catalog, footer)
├── style.css                    # Глобальні стилі + @tailwind директиви
├── data/
│   └── materials.js             # Початковий масив матеріалів
└── components/
    ├── ModalDialog.vue          # Модальне вікно (Teleport, Transition, слоти, фокус)
    ├── MaterialCatalog.vue      # Каталог: фільтри, список, редагування, видалення
    ├── MaterialCard.vue         # Карточка матеріалу (включно з новими кнопками Редагувати/Видалити)
    ├── MaterialFilterForm.vue   # Форма фільтрації (пошук за назвою, тема)
    └── HelloWorld.vue           # Заготовка
```

## Контракт ModalDialog

`modelValue` Boolean `false` Відкриття/закриття вікна (v-model)
`title` String required Заголовок діалогу (відображається у шапці)
`initialFocus` HTMLElement null `null` DOM-елемент для фокусу при відкритті (наприклад, поле вводу або кнопка Скасувати)
`fallbackFocus` HTMLElement null `null` Запасний елемент для фокусу при закритті (наприклад, заголовок каталогу)

### Події

`update:modelValue` Світится при закритті вікна (кнопка Х, Escape, Скасувати)

### Структура на сторінці

```
<Teleport to="body">
  <Transition enter/leave="opacity">
    <div v-if="modelValue" class="fixed inset-0 ...">  <!-- підкладка -->
      <div role="dialog" aria-modal="true">             <!-- панель -->
        <header> заголовок + кнопка Х                  <!-- закриття -->
        <div> <slot/> </div>                            <!-- основний вміст -->
        <footer> <slot name="footer"/> </div>           <!-- кнопки -->
      </div>
    </div>
  </Transition>
</Teleport>
```

