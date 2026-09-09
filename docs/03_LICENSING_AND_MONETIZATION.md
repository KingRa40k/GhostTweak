# 🔑 Система лицензирования, генерация ключей и монетизация

GhostTweak спроектирован с гибкой моделью монетизации: приложение может работать как полностью автономно (без содержания дорогих серверов), так и подключаться к вашему интернет-эквайрингу или Telegram-боту по продаже ключей.

---

## 1. Как устроена защита и привязка к железу

1. **Аппаратный HWID:**
   Приложение считывает уникальный идентификатор материнской платы (`MachineGuid` из реестра Windows Cryptography и UUID через `csproduct`).
   Код расположен в [`src-tauri/src/commands/security.rs`](../src-tauri/src/commands/security.rs).
2. **SHA-256 Хеширование:**
   Считанный HWID переводится в защищенный формат вида `GT-XXXX-XXXX-XXXX-XXXX`.
3. **Защищенное локальное хранилище:**
   После успешной активации данные шифруются XOR-потоком на основе индивидуального HWID пользователя и сохраняются в `%APPDATA%\GhostTweak\license.dat`. Перенести активированный файл на другой компьютер невозможно — на чужом ПК он не пройдет криптографическую проверку.

---

## 2. Формат и валидация ключей

Ключи имеют вид:
```text
GHOST-XXXX-YYYY-ZZZZ
```
В функции `verify_native_license()` в [`src-tauri/src/commands/security.rs`](../src-tauri/src/commands/security.rs) реализовано два уровня валидации:

### А. Мастер-ключи (встроенные постоянные ключи)
Уже прописаны в коде и активны:
* `GHOST-VIP-PRO-2026` — VIP пожизненная лицензия (Lifetime)
* `GHOST-FPS-BOOST-9999` — Лицензия Pro Streamer
* `GHOST-MAX-PERF-ULTRA` — Редакция Overclock
* `GHOST-ESPORTS-CS2-PRO` — Редакция CS2 Esports
* `GHOST-CYBER-WAR-9999` — Максимальный тариф Cyber Warfare

### Б. Алгоритмические ключи
Любой ключ, начинающийся с префикса `GHOST-`, содержащий 4 блока символов и удовлетворяющий контрольной сумме в функции `verify_native_license`, будет автоматически признан валидным.

---

## 3. Как добавить свои ключи в офлайн-список

Если вы хотите сгенерировать партию своих фиксированных ключей для продажи:
1. Откройте файл [`src-tauri/src/commands/security.rs`](../src-tauri/src/commands/security.rs).
2. Найдите массив `let master_keys = [...]` в функции `verify_native_license`:
```rust
let master_keys = [
    ("GHOST-VIP-PRO-2026", "VIP Lifetime", "vip"),
    ("GHOST-MY-NEW-KEY-001", "Pro License", "pro"),
    // Добавляйте свои ключи сюда
];
```
3. Сохраните файл и пересоберите приложение через `build.bat`.

---

## 4. Подключение онлайн-валидации (эквайринг / Telegram-бот)

Если вы хотите продавать ключи на автомате через сайт или Telegram-бота:

### Вариант 1. Продажа через Telegram-бота (самый популярный способ)
1. Вы создаете бота в Telegram (например, через BotFather + Tribute / PayOK / Lava).
2. Бот принимает оплату от покупателя и выдает ему один из ваших ключей.
3. Покупатель вставляет ключ в программу и моментально получает Pro-статус. Сервер авторизации не нужен!

### Вариант 2. Проверка через API вашего сайта
В файле [`src/lib/license.ts`](../src/lib/license.ts) внутри функции `verifyLicenseKey` можно раскомментировать или добавить сетевой запрос:
```typescript
const response = await fetch('https://api.yourdomain.com/verify-key', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ key: cleanKey, hwid: getCachedHardwareId() })
});
const result = await response.json();
```
При такой схеме вы сможете блокировать ключи удаленно или продавать подписку на 1 / 3 / 12 месяцев.

---

⬅️ [02. Сборка](02_BUILD_AND_RELEASE.md) | 🏠 [Оглавление](../ИНСТРУКЦИЯ_ПОКУПАТЕЛЯ.md) | ➡️ [04. Настройка контактов](04_CUSTOMIZATION_AND_CONTACTS.md)
