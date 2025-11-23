// popup.js:
const DAY_MS = 86_400_000; 
const MSK_OFFSET_HOURS = 3;
const VOTE_MINUTE_OFFSET = 5;
const DAY_MILLIS = 24 * 60 * 60 * 1000;
const MSK_OFFSET_MILLIS = 3 * 60 * 60 * 1000; 
const VOTE_MINUTE_OFFSET_MILLIS = 5 * 60 * 1000; 

function formatDate(ts) {
  const date = new Date(ts);
  const pad = n => n.toString().padStart(2, '0');
  return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function getMskMidnightUtc(nowMillis) {
    const nowMsk = nowMillis + MSK_OFFSET_MILLIS;
    const mskMidnightMillis = nowMsk - (nowMsk % DAY_MILLIS);
    return mskMidnightMillis - MSK_OFFSET_MILLIS;
}

function getNextMskVoteTime(lastVote) {
    const now = Date.now();

    let resetTimeUtc = getMskMidnightUtc(now) + VOTE_MINUTE_OFFSET_MILLIS;

    if (lastVote >= resetTimeUtc) {
        resetTimeUtc += DAY_MILLIS;
    } 
    else if (now >= resetTimeUtc) {
        resetTimeUtc += DAY_MILLIS;
    }

    return resetTimeUtc;
}

function updateStatus(isPaused) {
  const div = document.getElementById("statusVote");
  const stopButton = document.getElementById('stopVoting');

  if (isPaused) {
    div.innerHTML = "Авто-голосование: Остановлено";
    stopButton.textContent = "Включить авто-голосование";
    stopButton.classList.add('is-paused-btn'); 
  } else {
    div.innerHTML = "Авто-голосование: Активно";
    stopButton.textContent = "Остановить голосование";
    stopButton.classList.remove('is-paused-btn');
  }
}

function updateLastVoteInfo() {
  chrome.storage.local.get("lastVoteTime", data => {
    const lastVote = data.lastVoteTime;
    const div = document.getElementById("lastVote");
    const nextDiv = document.getElementById("nextVote");

    if (lastVote) {
      div.textContent = "Последнее голосование: " + formatDate(lastVote);
      
      const nextVote = getNextMskVoteTime(lastVote); 
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

  chrome.storage.local.get("isPaused", (data) => {
    const isPaused = data.isPaused !== undefined ? data.isPaused : false;
    updateStatus(isPaused);
  });


  document.getElementById('save').addEventListener('click', () => {
    const nickname = document.getElementById('nickname').value.trim();
    const authType = document.getElementById('authType').value;
    chrome.storage.local.set({ nickname, authType }, () => {
      alert('Сохранено!');
    });
  });

  document.getElementById('stopVoting').addEventListener('click', () => {
      chrome.storage.local.get(["isPaused", "lastVoteTime"], (data) => { 
        const isCurrentlyPaused = data.isPaused !== undefined ? data.isPaused : false;
        const newPausedState = !isCurrentlyPaused;

        chrome.storage.local.set({ isPaused: newPausedState }, () => {
          updateStatus(newPausedState);

          if (!newPausedState) {
            const now = Date.now();
            const last = data.lastVoteTime || 0;
            const todayResetTime = getMskMidnightUtc(now) + VOTE_MINUTE_OFFSET_MILLIS;

            if (now >= todayResetTime && last < todayResetTime) {
              chrome.storage.local.set({ canVote: true }, () => {
                chrome.tabs.create({ url: "https://minecraft-servers.ru/server/mcskill" });
              });
              alert('Авто-голосование включено. Запускаю голосование сейчас.');
            } else {
              alert('Авто-голосование включено. Следующее голосование по расписанию.');
            }
          } else {
            alert('Авто-голосование остановлено.');
          }
        });
      });
  });

  document.getElementById('voteNow').addEventListener('click', () => {
    chrome.storage.local.set({ canVote: true, isPaused: false }, () => {
        updateStatus(false);
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