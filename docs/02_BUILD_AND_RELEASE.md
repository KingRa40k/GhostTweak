# Сборка дистрибутивов и релизы (.exe, .msi, Portable)

В этом руководстве описан процесс компиляции десктопного приложения под Windows в различных форматах (инсталлятор, MSI и переносимая версия).

---

## 1. Системные требования для сборки

Для компиляции нативного кода на компьютере разработчика необходимы:
1. **Node.js**: v18.0.0 или новее.
2. **Rust**: Установленный через официальный установщик [rustup.rs](https://rustup.rs/) (канал `stable-x86_64-pc-windows-msvc`).
3. **Visual Studio C++ Build Tools**: В установщике Visual Studio Installer должен быть отмечен компонент «Разработка классических приложений на C++» (Desktop development with C++).

---

## 2. Сборка через `build.bat`

В корне проекта находится скрипт [`build.bat`](../build.bat).
Запустите его двойным кликом из проводника Windows или через терминал:
```cmd
build.bat
```
Скрипт компилирует фронтенд на React 19, выполняет оптимизированную сборку нативного ядра на Rust и автоматически копирует исполняемые файлы в каталоги `releases/` и `website/public/downloads/`.

---

## 3. Сборка пакетов установщиков (NSIS, MSI, Portable)

Для генерации дистрибутивов с инсталлятором выполните:

```bash
# 1. Установка зависимостей интерфейса
npm install

# 2. Запуск сборщика Tauri
npm run tauri build
```

По завершении сборки сгенерированные файлы размещаются в `src-tauri/target/release/`:

| Тип дистрибутива | Расположение файла | Описание |
| :--- | :--- | :--- |
| **NSIS Setup (.exe)** | `src-tauri/target/release/bundle/nsis/GhostTweak_1.0.0_x64-setup.exe` | Мастер установки с выбором каталога и созданием ярлыков. |
| **Windows Installer (.msi)** | `src-tauri/target/release/bundle/msi/GhostTweak_1.0.0_x64_en-US.msi` | Корпоративный пакет Windows Installer. |
| **Portable (.exe)** | `src-tauri/target/release/ghosttweak.exe` | Автономный исполняемый файл без установки. |

---

## 4. Смена номера версии приложения

При выпуске новой версии (например, v1.1.0):
1. В корневом [`package.json`](../package.json): обновите `"version": "1.1.0"`.
2. В конфигурации Tauri [`src-tauri/tauri.conf.json`](../src-tauri/tauri.conf.json): обновите `"version": "1.1.0"`.
3. В файле манифеста Rust [`src-tauri/Cargo.toml`](../src-tauri/Cargo.toml): обновите `version = "1.1.0"`.
4. В файле сайта [`website/package.json`](../website/package.json): обновите `"version": "1.1.0"`.

---

## 5. Замена иконок приложения

Все иконки хранятся в каталоге `src-tauri/icons/`:
* `icon.ico` — иконка для Windows (файл `.exe` и ярлыки).
* `icon.png` / `128x128.png` / `32x32.png` — растровые иконки для окна и системного трея.

Для генерации набора иконок из исходного PNG-изображения (1024x1024):
```bash
npm run tauri icon path/to/your/new_icon.png
```

---

[01. Архитектура](01_ARCHITECTURE.md) | [Оглавление](01_BUYER_GUIDE_RU.md) | [03. Лицензии и монетизация](03_LICENSING_AND_MONETIZATION.md)
