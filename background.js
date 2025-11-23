const VOTE_URL = "https://minecraft-servers.ru/server/mcskill";
const DAY_MS = 12 * 60 * 60 * 1000;

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
    
    if (!isPaused && now - last >= DAY_MS) { 
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
        console.log("Авто-голосование остановлено пользователем.");
        return; 
      }

      if (now - last >= DAY_MS) {
        chrome.storage.local.set({
          canVote: true
        });
        chrome.tabs.create({ url: VOTE_URL });
      } else {
        console.log("Голосование уже было сегодня.");
      }
    });
  }
});
