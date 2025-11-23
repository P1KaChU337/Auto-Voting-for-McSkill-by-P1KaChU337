if (window.location.href === "https://minecraft-servers.ru/") {
    chrome.storage.local.get(["canVote", "isPaused"], ({ canVote, isPaused }) => {
        if (!canVote || isPaused) { 
            console.log("⏸ Автоматизация отключена или остановлена — не закрываем вкладку.");
            return;
        }

        startAutomation();
    });

    function startAutomation() {
        const now = Date.now();
        chrome.storage.local.set({ canVote: false, lastVoteTime: now }, () => {
            console.log("✅ Голосование завершено. Устанавливаем время.");
            chrome.runtime.sendMessage({ action: "close_tab" });
        });
    }
}