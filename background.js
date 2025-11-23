const VOTE_URL = "https://minecraft-servers.ru/server/mcskill";

const MSK_OFFSET_MILLIS = 3 * 60 * 60 * 1000; // 3 часа (UTC+3)
const VOTE_MINUTE_OFFSET = 5 * 60 * 1000; // 5 минут (00:05:00)
const DAY_MILLIS = 24 * 60 * 60 * 1000; // 24 часа

function getMskMidnightUtc(nowMillis) {
    const nowMsk = nowMillis + MSK_OFFSET_MILLIS;
    const mskMidnightMillis = nowMsk - (nowMsk % DAY_MILLIS);
    return mskMidnightMillis - MSK_OFFSET_MILLIS;
}

function getTodayMskResetTime() {
    const now = Date.now();
    const mskMidnightUtc = getMskMidnightUtc(now);
    return mskMidnightUtc + VOTE_MINUTE_OFFSET_MILLIS; 
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ 
    isPaused: false,
    authType: 'manual'
  }); 
  chrome.alarms.create("dailyVote", { periodInMinutes: 60 });
});

chrome.runtime.onStartup.addListener(() => {
  chrome.storage.local.get(["lastVoteTime", "isPaused"], (data) => {
    const now = Date.now();
    const last = data.lastVoteTime || 0;
    const isPaused = data.isPaused || false;
    
    const todayResetTime = getTodayMskResetTime();

    if (!isPaused && last < todayResetTime) { 
      chrome.storage.local.set({ canVote: true });
    }
  });

  chrome.alarms.create("dailyVote", { periodInMinutes: 60 });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "close_tab" && sender.tab?.id) {
    chrome.tabs.remove(sender.tab.id);
  }
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "dailyVote") {
    chrome.storage.local.get(["lastVoteTime", "isPaused"], (data) => {
      const now = Date.now();
      const last = data.lastVoteTime || 0;
      const isPaused = data.isPaused || false;
      
      if (isPaused) { 
        console.log("⏸ Автоматизация остановлена.");
        return; 
      }

      const todayResetTime = getTodayMskResetTime();
      
      if (now >= todayResetTime && last < todayResetTime) { 
        chrome.storage.local.set({ canVote: true });
        chrome.tabs.create({ url: VOTE_URL });
      } else {
        console.log("Голосование уже было сегодня или еще не время (до 00:05:00 МСК).");
      }
    });
  }
});
