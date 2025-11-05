# Travel Journal (PWA)

Невеличкий щоденник подорожей: локація, дата, короткий опис і фото. Працює офлайн і встановлюється як PWA.

## Запуск

1. Встановіть залежності:
   ```bash
   npm install
   ```
2. Режим розробки:
   ```bash
   npm run dev
   ```
3. Збірка продакшн:
   ```bash
   npm run build
   npm run preview
   ```

## PWA

- Manifest: `public/manifest.json`
- Service Worker: `public/service-worker.js` (реєструється лише у продакшні)
- Іконки додайте в `public/icons/` як `icon-192.png` і `icon-512.png`

## Деплой на GitHub Pages

- Збірка створить `dist/`. Залийте її на GitHub Pages (HTTPS забезпечено).
- Перевірте у Chrome → Lighthouse → Progressive Web App → Installable.
- Після цього з’явиться “Add to Home Screen”.

## Технології

React + Vite, Service Worker, Web App Manifest, LocalStorage.
