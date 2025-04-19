# Лабораторна робота №4: To-Do Reminder (React Native + Expo + OneSignal)

## Необхідне програмне забезпечення

Перед запуском переконайтеся, що у вас встановлено та налаштовано:

1.  Node.js: Рекомендовано версію LTS. ([Завантажити](https://nodejs.org/))
2.  npm або yarn: Встановлюються разом з Node.js.
3.  Java Development Kit (JDK): Версія 17 (LTS). ([Adoptium Temurin JDK 17](https://adoptium.net/))
    - Переконайтеся, що системна змінна середовища `JAVA_HOME` вказує на кореневу папку встановленого JDK 17 (наприклад, `C:\Program Files\Java\jdk-17...`).
    - Переконайтеся, що шлях до папки `bin` вашого JDK 17 додано до системної змінної `PATH`.
4.  Android Studio: ([Завантажити](https://developer.android.com/studio))
    - Встановіть необхідні Android SDK Platforms (наприклад, Android 14/API 34 або 35) та Android SDK Build-Tools через SDK Manager в Android Studio.
    - Переконайтеся, що системна змінна середовища `ANDROID_HOME` вказує на папку Android SDK (наприклад, `C:\Users\<Username>\AppData\Local\Android\Sdk`).
    - Переконайтеся, що шляхи `%ANDROID_HOME%\platform-tools`, `%ANDROID_HOME%\tools`, `%ANDROID_HOME%\emulator` додано до системної змінної `PATH`.
5.  Expo CLI: Встановіть глобально: `npm install -g expo-cli`
6.  EAS CLI: Встановіть глобально: `npm install -g eas-cli`
7.  Фізичний пристрій Android або налаштований емулятор Android.
8.  Git (для клонування репозиторію, якщо потрібно).

## Налаштування проєкту

1.  **Клонуйте репозиторій або скопіюйте папку проєкту:**
    ```bash
    # Наприклад:
    # git clone <your-repo-url>
    cd MobileLabsRN2025
    ```
2.  **Встановіть залежності:**
    ```bash
    npm install
    # або
    # yarn install
    ```
3.  Налаштуйте Firebase:
    Створіть проєкт у [Firebase Console](https://console.firebase.google.com/).
    Додайте Android-додаток до вашого проєкту Firebase. Важливо: Переконайтеся, що Package name, який ви вказуєте в Firebase, точно відповідає значенню `package` у секції `android` файлу `app.json` (наприклад, `com.example.todo`).
    Завантажте файл `google-services.json` з налаштувань вашого Android-додатку в Firebase.
    Помістіть завантажений файл `google-services.json` у кореневу папку проєкту (`MobileLabsRN2025/google-services.json`).
4.  Налаштуйте OneSignal App ID:
    Зареєструйте додаток у [OneSignal Dashboard](https://dashboard.onesignal.com/).
    Налаштуйте платформу Android, використовуючи дані з Firebase (Server Key та Sender ID).
    Знайдіть ваш **OneSignal App ID** у налаштуваннях OneSignal (Settings -> Keys & IDs).
    Відкрийте файл `app.json`.
    Знайдіть секцію `extra` та встановіть значення для `oneSignalAppId`:
    `json
    "extra": {
      "oneSignalAppId": "YOUR_ONESIGNAL_APP_ID", // <-- Вставте ваш ID сюди
      // ... інша конфігурація extra ...
    },
    `
5.  Налаштуйте OneSignal REST API Key:
    Знайдіть ваш **REST API Key** у налаштуваннях OneSignal (Settings -> Keys & IDs).
    Відкрийте файл `App.js`.
    Знайдіть константу `ONE_SIGNAL_REST_API_KEY`.
    Вставте ваш ключ замість поточного значення:
    `javascript
    const ONE_SIGNAL_REST_API_KEY = 'YOUR_ONESIGNAL_REST_API_KEY'; // <-- Вставте ваш ключ сюди
    ` \* **Увага:** У реальних проєктах не зберігайте цей ключ безпосередньо в коді! Для лабораторної роботи це припустимо.

## Збірка Development Build (через EAS)

Оскільки проєкт використовує нативний код OneSignal, його не можна запустити через стандартний додаток Expo Go. Необхідно створити Development Build.

1.  **Увійдіть в акаунт Expo:**
    ```bash
    eas login
    ```
2.  **Очистіть попередні нативні папки (рекомендовано):** Це гарантує чисту збірку на основі `app.json`.

    - У PowerShell:
      ```powershell
      Remove-Item -Recurse -Force android
      Remove-Item -Recurse -Force ios # (якщо існує)
      ```

3.  **Запустіть процес збірки:**
    ```bash
    eas build --profile development --platform android
    ```
4.  **Зачекайте завершення збірки** на серверах EAS.
5.  **Встановіть збірку:**
    - Після завершення EAS надасть QR-код та посилання для завантаження `.apk` файлу.
    - Відскануйте QR-код з вашого Android-пристрою або перейдіть за посиланням у браузері, щоб завантажити `.apk` файл.
    - Встановіть завантажений `.apk` файл на ваш фізичний пристрій або емулятор.

## Запуск додатка для розробки

1.  **Запустіть Metro Bundler (сервер JS):** На комп'ютері у терміналі виконайте:
    ```bash
    npx expo start --dev-client
    ```
2.  **Відкрийте додаток:** На вашому Android-пристрої або емуляторі знайдіть та запустіть **встановлений вами додаток** "MobileLabsRN2025" (НЕ Expo Go).
3.  **Підключення:** Додаток автоматично підключиться до запущеного сервера Metro, і ви зможете бачити зміни в коді та логи в терміналі.
