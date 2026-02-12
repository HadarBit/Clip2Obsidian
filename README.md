# Clip2Obsidian

A minimal Chrome extension that clips web pages and YouTube videos directly into your local Obsidian vault as markdown notes.

## How It Works

1. Browse to any article or YouTube video
2. Click the extension icon
3. Optionally add a custom tag
4. Hit **Save** — a markdown file appears in your vault instantly

Articles are saved to `מאמרים/`, YouTube videos to `סרטונים/`. Each note includes YAML frontmatter with title, URL, date, and tags — ready for Obsidian's Dataview, search, and graph.

### Example Output

```markdown
---
title: "How Neural Networks Learn"
title_he: ""
url: https://example.com/article
date: 2026-02-12
tags:
  - article
  - toRead
  - AI
---

# How Neural Networks Learn

https://example.com/article
```

## Setup

1. Clone or download this repo
2. Open `chrome://extensions` in Chrome
3. Enable **Developer mode** (top right)
4. Click **Load unpacked** → select the `Clip2Obsidian` directory
5. Click the extension icon → **Setup** → select your Obsidian vault folder

That's it. The vault directory permission persists across browser restarts.

## Tech

- **Manifest V3** — modern Chrome extension format
- **File System Access API** — writes directly to your local filesystem, no server or sync needed
- **IndexedDB** — stores the directory handle so you only pick the vault once
- Separate setup page for initial directory selection (popups can't open OS dialogs)

## File Structure

```
├── manifest.json     Manifest V3 config
├── popup.html/css/js Extension popup — detect page type, save note
├── setup.html/css/js Full-tab setup — vault directory picker
├── db.js             Shared IndexedDB wrapper
├── content.js        Content script placeholder (future use)
└── icons/            Extension icons
```

## License

MIT
