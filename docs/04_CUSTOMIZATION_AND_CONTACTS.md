# 🎨 Настройка контактов, брендинга и тарифов

В этой инструкции описано, в каких именно файлах заменить ссылки на ваши контакты, настроить цены и кастомизировать фирменный стиль.

---

## 1. Смена контактов поддержки (Telegram, Discord, Email)

### В маркетинговом сайте (`website/`):
* **Кнопка поддержки в FAQ**: [`website/src/components/FAQ.tsx`](../website/src/components/FAQ.tsx) — строка с `href="https://t.me/ghosttweak_support"`. Замените на ссылку на вашего бота или аккаунт.
* **Кнопка покупки в тарифах**: [`website/src/components/Pricing.tsx`](../website/src/components/Pricing.tsx) — параметр `ctaAction: 'https://t.me/ghosttweak_support'`. Сюда можно поставить ссылку на платёжную страницу, бота или форму оплаты.
* **Подвал сайта (Footer)**: [`website/src/components/Footer.tsx`](../website/src/components/Footer.tsx) — ссылки на GitHub, Telegram и соглашения.

### В десктопном приложении (`src/`):
* **Экран настроек**: [`src/pages/Settings.tsx`](../src/pages/Settings.tsx) — блок «О программе и поддержка». Укажите ваши каналы обратной связи.

---

## 2. Настройка цен и тарифов на сайте

Все тарифы (Community, Pro Operator, Ultimate VIP), их стоимость и список преимуществ централизованно задаются в файле локализации сайта:
* Файл: [`website/src/lib/i18n.tsx`](../website/src/lib/i18n.tsx)
* Найдите блок `pricing:` в разделе `ru:` (для русского языка) и `en:` (для английского языка):
```typescript
pricing: {
  tag: "Тарифы",
  title: "Варианты Использования",
  tiers: [
    {
      name: "Community",
      price: "0 ₽",
      ...
    },
    {
      name: "Pro Operator",
      price: "1 490 ₽",   // <-- Укажите вашу цену
      ...
    }
  ]
}
```

---

## 3. Смена названия и идентификатора приложения

Если вы хотите провести полный ребрендинг:
1. В [`src-tauri/tauri.conf.json`](../src-tauri/tauri.conf.json):
   * `"productName"`: Отображаемое имя приложения в заголовке и панели задач Windows.
   * `"identifier"`: Уникальный ID пакета (например, `com.yourcompany.app`).
2. В [`index.html`](../index.html):
   * Тег `<title>GhostTweak</title>`.
3. В заголовке окна [`src/components/TitleBar.tsx`](../src/components/TitleBar.tsx):
   * Текст названия рядом с логотипом.

---

## 4. Кастомизация цветовых тем

Приложение поддерживает палитру с динамическими CSS-переменными. 
Все темы зарегистрированы в файле [`src/lib/theme.ts`](../src/lib/theme.ts):
* `Cyberpunk Neon` (пурпурно-неоновый)
* `Matrix Cyber` (изумрудно-зеленый)
* `Stealth Obsidian` (монохромный титановый)
* `Solar Flare` (оранжево-янтарный)

Вы можете легко добавить свою тему, просто указав новые HEX-цвета акцента и границы.

---

⬅️ [03. Лицензии](03_LICENSING_AND_MONETIZATION.md) | 🏠 [Оглавление](../ИНСТРУКЦИЯ_ПОКУПАТЕЛЯ.md) | ➡️ [05. Деплой на Vercel](05_DEPLOYMENT_VERCEL.md)
