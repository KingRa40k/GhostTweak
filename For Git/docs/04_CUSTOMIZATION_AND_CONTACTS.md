# Настройка контактов, брендинга и тарифов

В этой инструкции описано, в каких файлах заменить ссылки на контакты, настроить цены и кастомизировать фирменный стиль.

---

## 1. Смена контактов поддержки (Email, Discord, сообщество)

### В маркетинговом сайте (`website/`):
* **Конфигурация контактов и оплаты**: [`website/src/lib/paymentConfig.ts`](../website/src/lib/paymentConfig.ts) — единый конфигурационный файл:
  * `adminEmail`: Email администратора / владельца проекта (по умолчанию `admin@ghosttweak.com`). На этот адрес приходят заявки и формируются ссылки прямой связи.
  * `supportEmail`: Email службы поддержки.
  * `discordUrl`: Ссылка на Discord-сервер сообщества (опционально).
  * `isLivePaymentEnabled`: Флаг включения автоматической оплаты (`true` / `false`).
  * `paymentGatewayUrl`: Ссылка на ваш платёжный шлюз (Stripe, Lava, ЮKassa, Robokassa).
  * *Примечание:* Параметры также можно задать через `.env.local`: `NEXT_PUBLIC_ADMIN_EMAIL`, `NEXT_PUBLIC_PAYMENT_ENABLED`, `NEXT_PUBLIC_PAYMENT_URL`.
* **Кнопка поддержки в FAQ**: [`website/src/components/FAQ.tsx`](../website/src/components/FAQ.tsx) — блок связи с администратором, автоматически использующий `paymentConfig.ts`.
* **Оформление заказа и оплата**: [`website/src/components/CheckoutModal.tsx`](../website/src/components/CheckoutModal.tsx) — проверяет наличие платёжного шлюза. Если шлюз не подключён, отображает безопасный режим настройки с прямой формой связи с администратором.
* **Подвал сайта (Footer)**: [`website/src/components/Footer.tsx`](../website/src/components/Footer.tsx) — кликабельная ссылка на email администратора и репозиторий.

### В десктопном приложении (`src/`):
* **Экран настроек**: [`src/pages/Settings.tsx`](../src/pages/Settings.tsx) — блок «О программе и поддержка». Укажите ваши каналы обратной связи.

---

## 2. Настройка цен и тарифов на сайте

Все тарифы (Community, Pro Operator, Ultimate VIP), их стоимость и список преимуществ задаются в файле локализации сайта:
* Файл: [`website/src/lib/i18n.tsx`](../website/src/lib/i18n.tsx)
* Блок `pricing:` в разделах `ru:` и `en:`:
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

Для проведения ребрендинга:
1. В [`src-tauri/tauri.conf.json`](../src-tauri/tauri.conf.json):
   * `"productName"`: Отображаемое имя приложения в заголовке и панели задач Windows.
   * `"identifier"`: Уникальный ID пакета (например, `com.yourcompany.app`).
2. В [`index.html`](../index.html):
   * Тег `<title>GhostTweak</title>`.
3. В заголовке окна [`src/components/TitleBar.tsx`](../src/components/TitleBar.tsx):
   * Текст названия рядом с логотипом.

---

## 4. Кастомизация цветовых тем

Приложение поддерживает цветовую палитру с динамическими CSS-переменными. 
Все темы зарегистрированы в файле [`src/lib/theme.ts`](../src/lib/theme.ts):
* `Cyberpunk Neon` (пурпурно-неоновый)
* `Matrix Cyber` (изумрудно-зеленый)
* `Stealth Obsidian` (монохромный титановый)
* `Solar Flare` (оранжево-янтарный)

Для добавления новой темы укажите HEX-цвета акцента и границы в объекте тем.

---

[03. Лицензии и монетизация](03_LICENSING_AND_MONETIZATION.md) | [Документация](../README.md) | [05. Деплой на Vercel](05_DEPLOYMENT_VERCEL.md)
