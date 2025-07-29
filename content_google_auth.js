chrome.storage.local.get("canVote", ({ canVote }) => {
  if (!canVote) {
    console.log("⏸ Автоматизация отключена — ждем следующего таймера.");
    return;
  }

  startAutomation();
});
function startAutomation() {
  
  function waitForAccount(timeout = 10000) {
    return new Promise((resolve, reject) => {
      const interval = setInterval(() => {
        const accounts = document.querySelectorAll('div[role="link"][tabindex="0"]');
        if (accounts.length > 0) {
          clearInterval(interval);
          resolve(accounts[0]); // выбираем первый найденный
        }
      }, 300);
  
      setTimeout(() => {
        clearInterval(interval);
        reject("Timeout: аккаунты не найдены");
      }, timeout);
    });
  }
  
  (async () => {
    try {
      console.log("Ожидание любого аккаунта Google...");
      const account = await waitForAccount();
      if (account) {
        console.log("Аккаунт найден, кликаем...");
        account.click();
      }
    } catch (e) {
      console.error("Ошибка при выборе аккаунта Google:", e);
    }
  })();
}
