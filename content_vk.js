chrome.storage.local.get("canVote", ({ canVote }) => {
  if (!canVote) {
    console.log("⏸ Автоматизация отключена — ждем следующего таймера.");
    return;
  }

  startAutomation();
});
function startAutomation() {

  function waitFor(selector, timeout = 10000) {
    return new Promise((resolve, reject) => {
      const interval = setInterval(() => {
        const el = document.querySelector(selector);
        if (el) {
          clearInterval(interval);
          resolve(el);
        }
      }, 300);
      setTimeout(() => {
        clearInterval(interval);
        reject("VK Allow Timeout: " + selector);
      }, timeout);
    });
  }
  
  (async () => {
    try {
      const allowSpan = await waitFor('span.vkuiButton__content');
      if (allowSpan.textContent.trim() === 'Разрешить') {
        const btn = allowSpan.closest('button, a');
        if (btn) {
          btn.click();
          console.log("[VK] Кнопка 'Разрешить' нажата");
        } else {
          console.warn("[VK] Родительская кнопка не найдена");
        }
      } else {
        console.warn("[VK] Текст в кнопке не 'Разрешить'");
      }
    } catch (err) {
      console.warn("[VK] Ошибка при поиске кнопки 'Разрешить':", err);
    }
  })();
}
