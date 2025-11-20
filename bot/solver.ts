/**
 * A bot to automatically solve the "I am a Robot" CAPTCHA.
 */
import QRCode from "qrcode";

console.log("Bot script loaded.");

// --- Helper Functions ---

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

function waitForEitherElement(
  selectors: { name: "sha256" | "qrcode" | "prime"; selector: string }[],
): Promise<{ element: HTMLElement; type: "sha256" | "qrcode" | "prime" }> {
  return new Promise((resolve) => {
    const observer = new MutationObserver(() => {
      for (const s of selectors) {
        const el = document.querySelector<HTMLElement>(s.selector);
        if (el) {
          observer.disconnect();
          resolve({ element: el, type: s.name });
          return;
        }
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  });
}

// --- Utilities ---

async function calculateSha256(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hashHex;
}

// --- Challenge Solvers ---

async function solvePrimeChallenge() {
  console.log("--- Solving Prime Factorization Challenge ---");

  const numberDisplay = await waitForElement(".prime-number");
  const numberToFactorStr = numberDisplay.textContent?.replace(/,/g, "");
  if (!numberToFactorStr) throw new Error("Could not find number to factor.");
  const numberToFactor = parseInt(numberToFactorStr, 10);

  console.log(`2c. Found number to factor: ${numberToFactor}`);

  const factorize = (num: number): number[] => {
    const factors: number[] = [];
    let d = 2;
    let n = num;
    while (n > 1) {
      while (n % d === 0) {
        factors.push(d);
        n /= d;
      }
      d = d + 1;
      if (d * d > n) {
        if (n > 1) factors.push(n);
        break;
      }
    }
    return factors.sort((a, b) => a - b);
  };

  const factors = factorize(numberToFactor);
  console.log(`3c. Calculated factors: ${factors.join(", ")}`);

  const input = await waitForElement(".prime-input");
  const submitButton = await waitForElement(".captcha-verify-button");

  (input as HTMLInputElement).value = factors.join(", ");
  console.log("4c. Input factors and submitting.");
  submitButton.click();
}

async function solveSha256Challenge() {
  console.log("--- Solving SHA-256 Challenge ---");
  const stringDisplay = await waitForElement(".sha256-string");
  const randomString = stringDisplay.textContent;
  if (!randomString) throw new Error("Could not find SHA-256 string.");

  console.log(`2a. Found string: "${randomString.substring(0, 10)}..."`);

  const hash = await calculateSha256(randomString);
  console.log(`3a. Calculated hash: ${hash.substring(0, 10)}...`);

  const input = await waitForElement(".sha256-input");
  const submitButton = await waitForElement(".captcha-verify-button");

  (input as HTMLInputElement).value = hash;
  console.log("4a. Input hash and submitting.");
  submitButton.click();
}

async function solveQrCodeChallenge() {
  console.log("--- Solving QR Code Challenge ---");
  const sourceStringElement = await waitForElement(".qr-source-string");
  const sourceString = sourceStringElement.textContent;
  if (!sourceString) throw new Error("Could not find QR source string.");

  console.log(`2b. Found source string: "${sourceString}"`);

  console.log("3b. Generating reference QR code data...");
  const qrCodeData = QRCode.create(sourceString, { version: 1 });
  const qrModules = qrCodeData.modules.data;

  const gridCells = document.querySelectorAll<HTMLElement>(".qr-cell");
  if (gridCells.length !== qrModules.length) {
    throw new Error("Grid size does not match QR module count.");
  }

  console.log("4b. Filling grid...");
  for (let i = 0; i < qrModules.length; i++) {
    const shouldBeActive = qrModules[i] === 1;
    const cellIsActive = gridCells[i].classList.contains("active");
    if (shouldBeActive !== cellIsActive) {
      gridCells[i].click();
    }
  }

  const submitButton = await waitForElement(".captcha-verify-button");
  console.log("5b. Submitting grid.");
  submitButton.click();
}

// --- Main Execution ---

async function solveCaptcha() {
  console.log("Bot starting...");

  try {
    const trigger = await waitForElement(".captcha-container");
    if (trigger.classList.contains("verified")) {
      console.log("CAPTCHA already solved.");
      return;
    }
    console.log("1. Found CAPTCHA trigger. Clicking it.");
    trigger.click();

    const { type } = await waitForEitherElement([
      { name: "sha256", selector: ".sha256-challenge" },
      { name: "qrcode", selector: ".qr-challenge" },
      { name: "prime", selector: ".prime-challenge" },
    ]);

    if (type === "sha256") {
      await solveSha256Challenge();
    } else if (type === "qrcode") {
      await solveQrCodeChallenge();
    } else if (type === "prime") {
      await solvePrimeChallenge();
    }

    await waitForElement(".captcha-container.verified");
    console.log("CAPTCHA solved successfully!");
  } catch (error) {
    console.error("Bot failed:", error);
  }
}

function createBotTriggerButton() {
  const button = document.createElement("button");
  button.textContent = "Run Bot";
  button.style.position = "fixed";
  button.style.bottom = "20px";
  button.style.right = "20px";
  button.style.zIndex = "9999";
  button.style.padding = "10px 15px";
  button.style.backgroundColor = "#6a0dad";
  button.style.color = "white";
  button.style.border = "none";
  button.style.borderRadius = "5px";
  button.style.cursor = "pointer";

  button.addEventListener("click", () => {
    solveCaptcha();
  });

  document.body.appendChild(button);
}

window.addEventListener("load", () => {
  createBotTriggerButton();
});
