# GhostTweak — Инструменты лицензирования (Tools)

Этот каталог содержит инструменты для криптографической генерации лицензионных ключей, привязки к оборудованию (HWID) и API-сервер валидации.

---

## 1. Генератор лицензионных ключей (`license_generator.py`)

Консольная утилита для мгновенной генерации одиночных или пакетных лицензий.

```bash
# Генерация бессрочного VIP/PRO ключа (Lifetime)
python license_generator.py --type lifetime

# Генерация ключа с ограничением на 30 дней (Monthly)
python license_generator.py --type monthly

# Пакетная генерация 100 ключей и сохранение в файл для магазина
python license_generator.py --type lifetime --count 100 --output keys_batch.txt
```

### Формат ключей:
- `GT-LIFE-XXXX-XXXX-XXXX` — бессрочный доступ (Lifetime PRO)
- `GT-MONT-XXXX-XXXX-XXXX` — месячная подписка (30 дней)

---

## 2. Локальный сервер валидации (`license_server.py`)

Легковесный сервер на базе FastAPI / SQLite для централизованного учета лицензий:
- Привязка ключа к уникальному HWID компьютера при первой активации.
- Проверка статуса лицензии.
- Удаленный отзыв или заморозка ключа при возврате средств.

### Запуск сервера:
```bash
# Установка зависимостей (однократно)
pip install fastapi uvicorn cryptography

# Запуск на порту 8080
python license_server.py --port 8080
```

---

## Дополнительная информация
Подробное руководство по алгоритму подписи и монетизации доступно в файле [`docs/03_LICENSING_AND_MONETIZATION.md`](../docs/03_LICENSING_AND_MONETIZATION.md).
