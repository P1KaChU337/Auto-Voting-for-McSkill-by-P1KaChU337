if (window.location.href === "https://minecraft-servers.ru/") {
    chrome.storage.local.get("canVote", ({ canVote }) => {
  if (!canVote) {
    console.log("⏸ Автоматизация отключена — ждем следующего таймера.");
    return;
  }

  startAutomation();
});
function startAutomation() {
    chrome.runtime.sendMessage({ action: "close_tab" });
    chrome.storage.local.set({ canVote: false });
}
}