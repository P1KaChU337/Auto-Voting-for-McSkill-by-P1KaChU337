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
        reject("Timeout: " + selector);
      }, timeout);
    });
  }

  async function clickVkAllow() {
    try {
      const allowBtn = await waitFor('span.vkuiButton__content');
      if (allowBtn.innerText.trim() === "Разрешить") {
        allowBtn.click();
        console.log("Кнопка VK 'Разрешить' нажата");
      }
    } catch (e) {
      console.warn("Кнопка VK 'Разрешить' не найдена или не на этой странице.");
    }
  }

  chrome.storage.local.get(['nickname', 'authType'], async ({ nickname, authType }) => {
    try {
      const voteBtn = await waitFor('button.app_btn.px-10.h-12');
      voteBtn.click();

      await new Promise(r => setTimeout(r, 1000));
      const nickInput = document.querySelector('input[type="text"]');
      if (nickInput && nickname) {
        nickInput.value = nickname;
        nickInput.dispatchEvent(new Event('input', { bubbles: true }));
      }

      if (authType === 'google') {
        const googleImg = document.querySelector('img[alt="google"]');
        const googleBtn = googleImg?.closest('button');
        if (googleBtn && !googleBtn.disabled) {
          googleBtn.click();
          console.log("Кнопка Google нажата");
        }
      } else if (authType === 'vk') {
        function tryClickVkBtn() {
          const vkImg = document.querySelector('img[alt="vk"]');
          const vkBtn = vkImg?.closest('button');
          if (vkBtn && !vkBtn.disabled) {
            vkBtn.click();
            console.log("Кнопка VK ID нажата");
            return true;
          }
          return false;
        }

        if (!tryClickVkBtn()) {
          const observer = new MutationObserver(() => {
            if (tryClickVkBtn()) observer.disconnect();
          });
          observer.observe(document.body, { childList: true, subtree: true });
          const interval = setInterval(() => {
            if (tryClickVkBtn()) clearInterval(interval);
          }, 500);
          setTimeout(() => clearInterval(interval), 10000);
        }
      }
    } catch (e) {
      console.error("Ошибка голосования:", e);
    }

    if (location.href === "https://minecraft-servers.ru/") {
      chrome.runtime.sendMessage({ action: "close_tab" });
    }

  });
}
