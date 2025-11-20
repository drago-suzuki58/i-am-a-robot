/**
 * A bot to automatically solve the "I am a Robot" CAPTCHA.
 */

console.log('Bot script loaded.');

// Helper function to wait for an element to appear in the DOM.
function waitForElement(selector: string): Promise<HTMLElement> {
  return new Promise((resolve) => {
    const element = document.querySelector<HTMLElement>(selector);
    if (element) {
      return resolve(element);
    }

    const observer = new MutationObserver(() => {
      const element = document.querySelector<HTMLElement>(selector);
      if (element) {
        observer.disconnect();
        resolve(element);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });
}

// SHA-256 calculation function, copied from the challenge itself.
async function calculateSha256(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return hashHex;
}

// Main solver function
async function solveCaptcha() {
  console.log('🤖 Bot starting...');

  try {
    // 1. Click the initial CAPTCHA trigger
    const trigger = await waitForElement('.captcha-container');
    console.log('1. Found CAPTCHA trigger. Clicking it.');
    trigger.click();

    // 2. Wait for the challenge string to appear
    const stringDisplay = await waitForElement('.sha256-string');
    const randomString = stringDisplay.textContent;
    if (!randomString) {
      throw new Error('Could not find the random string to hash.');
    }
    console.log(`2. Found string to hash: "${randomString.substring(0, 10)}..."`);

    // 3. Calculate the hash
    console.log('3. Calculating SHA-256 hash...');
    const hash = await calculateSha256(randomString);
    console.log(`   - Hash: ${hash.substring(0, 10)}...`);

    // 4. Find the input and submit button
    const input = await waitForElement('.sha256-input');
    const submitButton = await waitForElement('.captcha-verify-button');

    // 5. Input the hash and submit
    console.log('4. Typing hash into input field.');
    (input as HTMLInputElement).value = hash;

    console.log('5. Clicking submit button.');
    submitButton.click();

    // 6. Check for the result
    await waitForElement('.captcha-container.verified');
    console.log('✅ CAPTCHA solved successfully!');
  } catch (error) {
    console.error('❌ Bot failed:', error);
  }
}

// --- Create a button on the main page to run the bot ---
function createBotTriggerButton() {
    const button = document.createElement('button');
    button.textContent = '🤖 Botを実行';
    button.style.position = 'fixed';
    button.style.bottom = '20px';
    button.style.right = '20px';
    button.style.zIndex = '9999';
    button.style.padding = '10px 15px';
    button.style.backgroundColor = '#6a0dad';
    button.style.color = 'white';
    button.style.border = 'none';
    button.style.borderRadius = '5px';
    button.style.cursor = 'pointer';

    button.addEventListener('click', () => {
        solveCaptcha();
    });

    document.body.appendChild(button);
}

// Run after the main page has had a moment to load
window.addEventListener('load', () => {
    createBotTriggerButton();
});
