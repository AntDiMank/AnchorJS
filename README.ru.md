# Anchor JS

[English version](README.md)

Полноэкранная навигация по секциям. Заменяет обычный скролл страницы дискретным переключением секций, блокировкой скролла и вертикальным индикатором прогресса.

Часть экосистемы [Stancore](https://stancore.net). Живые API-доки: [api.stancore.net/docs/anchor-js](https://api.stancore.net/docs/anchor-js).

<p align="center">
  <img src="examples/assets/sections.jpg" alt="Свайп между секциями" width="100%">
</p>

Визуальное демо: [`examples/basic.html`](examples/basic.html) (скролл, свайп или drag по рейлу).

## Быстрый старт — CDN

Объявите глобальный массив `sectionIds` **до** подключения скрипта. Каждый ID должен совпадать с элементом секции на странице.

```html
<script>
  var sectionIds = ['hero', 'about', 'contact'];
</script>
<script src="https://api.stancore.net/api/anchor-js"></script>
```

Добавьте разметку прогресс-бара и CSS (из этого репозитория или свои стили):

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/AntDiMank/AnchorJS@main/dist/anchor.css">

<div class="anchor-bar anchor-progress" aria-label="Индикатор секций">
  <span class="anchor-progress-track">
    <span class="anchor-progress-thumb" id="anchor-thumb">
      <span class="anchor-tooltip" id="anchor-tooltip">Hero</span>
    </span>
  </span>
</div>

<main class="content">
  <section id="hero">...</section>
  <section id="about">...</section>
  <section id="contact">...</section>
</main>
```

CDN скрипта: `https://api.stancore.net/api/anchor-js`  
jsDelivr (этот репозиторий):

```html
<script src="https://cdn.jsdelivr.net/gh/AntDiMank/AnchorJS@main/dist/anchor.js"></script>
```

## Быстрый старт — локальные файлы

1. Скопируйте [`dist/anchor.js`](dist/anchor.js) и [`dist/anchor.css`](dist/anchor.css) в проект.
2. Откройте [`examples/basic.html`](examples/basic.html) — визуальное демо на весь экран (скролл / свайп / drag по рейлу) — или подключите сами:

```html
<link rel="stylesheet" href="dist/anchor.css">
<!-- разметка: секции + #anchor-thumb -->
<script>
  var sectionIds = ['hero', 'about', 'contact'];
</script>
<script src="dist/anchor.js"></script>
```

## Обязательная настройка

| Параметр | Тип | Обязательно | Описание |
|----------|-----|-------------|----------|
| `sectionIds` | `string[]` | Да | Глобальный массив ID секций в порядке навигации. Объявить **до** тега script. |
| `#anchor-thumb` | DOM-элемент | Рекомендуется | Ползунок прогресса внутри `.anchor-progress-track`. |
| `.left-nav .nav-item` | DOM-элементы | Опционально | Ссылки с `href="#section-id"` для перехода по клику. |

## Поведение

При загрузке библиотека:

- добавляет `anchor-lock-mode` на `body` и делает `scrollTo(0, 0)`;
- показывает активную секцию (`display` + `is-anchor-active` + `anchor-anim-in`);
- скрывает остальные (`display: none`, `aria-hidden="true"`);
- двигает ползунок через `translate(-50%, {offset}px)`.

**Управление:** колесо мыши, стрелки вверх/вниз, Page Up/Down, Space, свайп (≥ 35 px), перетаскивание/клик по треку прогресса.

**Дебаунс:** переключение блокируется на **500 мс**. Порог колеса: **8 px**.

**Hash:** если hash в URL совпадает с ID из `sectionIds` при загрузке (или при `hashchange`), открывается эта секция. При навигации библиотека **не** меняет hash в адресной строке.

**Игнорируется, если:** открыта модалка (`.modal-open` / `.modal-overlay.is-active`) или фокус в `input` / `textarea` / `select` / `contenteditable` / форме.

Длинный контент: скроллите внутри активной секции; скролл страницы остаётся заблокированным.

## Ошибки и крайние случаи

| Условие | Поведение | Примечание |
|---------|-----------|------------|
| `sectionIds` не определён | Fatal `ReferenceError` | Объявите глобальный массив до скрипта. |
| Нет совпадающих DOM-элементов | Тихий выход | Без побочных эффектов, если все ID отсутствуют. |
| Неверный ID в массиве | Фильтруется | Несуществующие ID пропускаются. |
| Нет `#anchor-thumb` | Degraded | Секции переключаются, индикатор не обновляется. |
| Одна секция | Limited | Ползунок не перемещается. |

## Ограничения

- Конфигурация только через глобальный `sectionIds` (в публичном билде нет options / data-атрибутов).
- Нативный скролл страницы заблокирован (`body { overflow: hidden }`).
- Рассчитано на секции на весь viewport.
- На продакшен-доменах Stancore загружайте по **HTTPS**.

## Структура репозитория

```
dist/anchor.js           # Публичный билд (тот же, что /api/anchor-js)
dist/anchor.css          # Минимальные стили прогресс-бара
examples/basic.html      # Визуальное демо на весь экран
examples/assets/*.jpg    # Фото для демо
```

## Лицензия

MIT — см. [LICENSE](LICENSE).
