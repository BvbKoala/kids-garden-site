(() => {
  const form = document.querySelector('#access-form');
  const input = document.querySelector('#access-code');
  const message = document.querySelector('#access-message');
  const button = form.querySelector('[type="submit"]');
  document.querySelector('#toggle-code').addEventListener('click', event => {
    const show = input.type === 'password';
    input.type = show ? 'text' : 'password';
    event.currentTarget.textContent = show ? '隐藏' : '显示';
    event.currentTarget.setAttribute('aria-label', show ? '隐藏口令' : '显示口令');
    event.currentTarget.setAttribute('aria-pressed', String(show));
  });
  form.addEventListener('submit', async event => {
    event.preventDefault();
    button.disabled = true;
    message.textContent = '正在打开花园…';
    try {
      if (!await GardenAccess.signIn(input.value, document.querySelector('#remember').checked)) {
        message.textContent = '钥匙好像不对，请检查口令后再试一次。';
        input.focus();
        input.select();
      }
    } catch (error) { message.textContent = error.message; }
    finally { button.disabled = false; }
  });
})();
