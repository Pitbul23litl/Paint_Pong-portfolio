# Paint_Pong Portfolio

Готовый статический сайт для GitHub Pages.

## Публикация

1. Загрузите всё содержимое этой папки в корень публичного GitHub-репозитория.
2. В **Settings → Pages** выберите **Deploy from a branch → main → / (root)**.
3. Сохраните.

## Автообновление YouTube

В репозитории уже есть `.github/workflows/youtube-feed.yml`.

Он каждые 6 часов получает самый свежий ролик с `https://www.youtube.com/@paint_pong/videos` через `yt-dlp` и обновляет `latest.json`. Блок **YouTube / Последняя работа** на сайте читает этот JSON и показывает превью, название и ссылку на ролик.

Можно также запустить workflow вручную через **Actions → Update latest YouTube upload → Run workflow**.

## Аудиотрек

Плеер и визуализатор уже готовы. Положите исходный аудиофайл в:

`assets/audio/paint-pong-track.mp3`

Файл должен иметь именно это имя или нужно изменить путь в `index.html`. Визуализатор использует Web Audio API и начинает реагировать на спектр после нажатия Play.

## Обновление работ

Изображения находятся в `assets/characters/` и `assets/biomes/`. Ссылки на анимации и музыку находятся непосредственно в `index.html`.

### Included audio
The portfolio now includes the supplied track at `assets/audio/paint-pong-track.mp3`.


### Polish update
Interactive logo tilt + ripple click effect, character selector carousel, animation rig ambience, YouTube motion visualizer, and software/tool stack in About.
