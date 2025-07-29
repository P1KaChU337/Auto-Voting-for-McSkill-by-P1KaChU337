const VOTE_URL = "https://minecraft-servers.ru/server/mcskill";
const DAY_MS = 24 * 60 * 60 * 1000;

chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create("dailyVote", { periodInMinutes: 1 });
});

chrome.runtime.onStartup.addListener(() => {
  chrome.storage.local.get(["lastVoteTime"], (data) => {
    const now = Date.now();
    const last = data.lastVoteTime || 0;
    if (now - last >= DAY_MS) {
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
    chrome.storage.local.get(["lastVoteTime"], (data) => {
      const now = Date.now();
      const last = data.lastVoteTime || 0;

      if (now - last >= DAY_MS) {
        chrome.storage.local.set({
          lastVoteTime: now,
          canVote: true // ⬅️ Дать разрешение на голосование
        });
        chrome.tabs.create({ url: VOTE_URL });
      } else {
        console.log("Голосование уже было сегодня.");
      }
    });
  }
});
