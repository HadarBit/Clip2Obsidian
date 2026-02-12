const selectBtn = document.getElementById('select-btn');
const clearBtn = document.getElementById('clear-btn');
const status = document.getElementById('status');

function showStatus(message, type) {
  status.textContent = message;
  status.className = `status ${type}`;
}

async function checkExisting() {
  const handle = await getDirectoryHandle();
  if (handle) {
    showStatus(`Vault directory: ${handle.name}`, 'success');
    clearBtn.classList.remove('hidden');
  }
}

selectBtn.addEventListener('click', async () => {
  try {
    const handle = await window.showDirectoryPicker({
      mode: 'readwrite',
      startIn: 'documents',
    });
    await storeDirectoryHandle(handle);
    showStatus(`Vault directory set: ${handle.name}`, 'success');
    clearBtn.classList.remove('hidden');
  } catch (err) {
    if (err.name === 'AbortError') return;
    showStatus(`Error: ${err.message}`, 'error');
  }
});

clearBtn.addEventListener('click', async () => {
  await clearDirectoryHandle();
  status.className = 'status hidden';
  clearBtn.classList.add('hidden');
});

checkExisting();
