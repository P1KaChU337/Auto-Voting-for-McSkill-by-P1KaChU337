const DAY_MS = 86_400_000;
function formatDate(ts) {
  const date = new Date(ts);
  const pad = n => n.toString().padStart(2, '0');
  return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function updateLastVoteInfo() {
  chrome.storage.local.get("lastVoteTime", data => {
    const lastVote = data.lastVoteTime;
    const div = document.getElementById("lastVote");
    const nextDiv = document.getElementById("nextVote");

    if (lastVote) {
      div.textContent = "Последнее голосование: " + formatDate(lastVote);
      const nextVote = lastVote + DAY_MS;
      nextDiv.textContent = "Следующее голосование: " + formatDate(nextVote);
    } else {
      div.textContent = "Последнее голосование: не найдено";
      nextDiv.textContent = "Следующее голосование: не найдено";
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {

  chrome.storage.local.get(['nickname', 'authType'], (data) => {
    document.getElementById('nickname').value = data.nickname || '';
    document.getElementById('authType').value = data.authType || 'manual';
  });

  updateLastVoteInfo();


  document.getElementById('save').addEventListener('click', () => {
    const nickname = document.getElementById('nickname').value.trim();
    const authType = document.getElementById('authType').value;
    chrome.storage.local.set({ nickname, authType }, () => {
      alert('Сохранено!');
    });
  });


  document.getElementById('voteNow').addEventListener('click', () => {
    const now = Date.now();
    chrome.storage.local.set({ lastVoteTime: now }, () => {
      updateLastVoteInfo();
      chrome.storage.local.set({ canVote: true });
      chrome.tabs.create({ url: "https://minecraft-servers.ru/server/mcskill" });
    });
  });
});

document.getElementById('resetAll').addEventListener('click', () => {
  if (confirm('Вы уверены, что хотите сбросить все данные расширения?')) {
    chrome.storage.local.clear(() => {
      alert('Данные успешно сброшены.');
      location.reload();
    });
  }
});

