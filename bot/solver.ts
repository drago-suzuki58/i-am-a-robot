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
  selector1: string,
  selector2: string,
): Promise<{ element: HTMLElement; type: "sha256" | "qrcode" }> {
  return new Promise((resolve) => {
    const observer = new MutationObserver(() => {
      const el1 = document.querySelector<HTMLElement>(selector1);
      if (el1) {
        observer.disconnect();
        resolve({ element: el1, type: "sha256" });
        return;
      }
      const el2 = document.querySelector<HTMLElement>(selector2);
      if (el2) {
        observer.disconnect();
        resolve({ element: el2, type: "qrcode" });
        return;
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  });
}

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

    const { type } = await waitForEitherElement(
      ".sha256-challenge",
      ".qr-challenge",
    );

    if (type === "sha256") {
      await solveSha256Challenge();
    } else {
      await solveQrCodeChallenge();
    }

    await waitForElement(".captcha-container.verified");
    console.log("CAPTCHA solved successfully!");
  } catch (error) {
    console.error("❌ Bot failed:", error);
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
