const stateSetup = document.getElementById('state-setup');
const statePermission = document.getElementById('state-permission');
const stateReady = document.getElementById('state-ready');
const feedback = document.getElementById('feedback');
const pageType = document.getElementById('page-type');
const pageTitle = document.getElementById('page-title');
const btnSave = document.getElementById('btn-save');

let currentTab = null;
let dirHandle = null;

function isYouTube(url) {
  return /youtube\.com\/watch/.test(url) || /youtu\.be\//.test(url);
}

function sanitizeFilename(title) {
  return title
    .replace(/[\/\\:*?"<>|]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 200);
}

function todayStr() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function buildMarkdown(title, url, date, isVideo, customTag) {
  const tag = isVideo ? 'youtube' : 'article';
  const actionTag = isVideo ? 'toWatch' : 'toRead';
  let tagsBlock = `  - ${tag}\n  - ${actionTag}`;
  if (customTag) {
    tagsBlock += `\n  - ${customTag}`;
  }
  return `---
title: "${title.replace(/"/g, '\\"')}"
title_he: ""
url: ${url}
date: ${date}
tags:
${tagsBlock}
---

# ${title}

${url}
`;
}

function showFeedback(message, type) {
  feedback.textContent = message;
  feedback.className = `feedback ${type}`;
}

function showState(state) {
  stateSetup.classList.add('hidden');
  statePermission.classList.add('hidden');
  stateReady.classList.add('hidden');
  state.classList.remove('hidden');
}

async function init() {
  // Get active tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  currentTab = tab;

  // Get stored handle
  dirHandle = await getDirectoryHandle();

  if (!dirHandle) {
    showState(stateSetup);
    return;
  }

  // Check permission
  const perm = await dirHandle.queryPermission({ mode: 'readwrite' });
  if (perm === 'denied') {
    showState(stateSetup);
    return;
  }

  if (perm === 'prompt') {
    showState(statePermission);
    return;
  }

  // Ready
  const isVideo = isYouTube(tab.url);
  pageType.textContent = isVideo ? 'YouTube' : 'Article';
  if (isVideo) pageType.classList.add('youtube');
  pageTitle.textContent = tab.title;
  showState(stateReady);
}

// Open setup page
document.getElementById('btn-open-setup').addEventListener('click', () => {
  chrome.tabs.create({ url: chrome.runtime.getURL('setup.html') });
  window.close();
});

// Grant permission
document.getElementById('btn-grant').addEventListener('click', async () => {
  try {
    const perm = await dirHandle.requestPermission({ mode: 'readwrite' });
    if (perm === 'granted') {
      init();
    }
  } catch (err) {
    showFeedback(`Permission error: ${err.message}`, 'error');
  }
});

// Save
btnSave.addEventListener('click', async () => {
  btnSave.disabled = true;
  try {
    // Re-check permission, request if needed
    let perm = await dirHandle.queryPermission({ mode: 'readwrite' });
    if (perm === 'prompt') {
      perm = await dirHandle.requestPermission({ mode: 'readwrite' });
    }
    if (perm !== 'granted') {
      showFeedback('Permission not granted', 'error');
      btnSave.disabled = false;
      return;
    }

    const isVideo = isYouTube(currentTab.url);
    const subDir = isVideo ? 'סרטונים' : 'מאמרים';
    const date = todayStr();
    const sanitized = sanitizeFilename(currentTab.title);
    const filename = `${sanitized}.md`;
    const customTag = document.getElementById('custom-tag').value.trim();

    const sub = await dirHandle.getDirectoryHandle(subDir, { create: true });
    const fileHandle = await sub.getFileHandle(filename, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(buildMarkdown(currentTab.title, currentTab.url, date, isVideo, customTag));
    await writable.close();

    showFeedback(`Saved to ${subDir}/${filename}`, 'success');
  } catch (err) {
    showFeedback(`Error: ${err.message}`, 'error');
  }
  btnSave.disabled = false;
});

init();
