import type { CaptchaChallenge } from "./types";

export class Sha256Challenge implements CaptchaChallenge {
  create(
    popupBody: HTMLElement,
    success: () => void,
    failure: () => void,
  ): () => void {
    // --- Styles ---
    const styles = `
      .sha256-challenge { display: flex; flex-direction: column; align-items: center; gap: 15px; width: 100%; }
      .sha256-challenge p { margin: 0; color: #ccc; }
      .sha256-string {
        font-family: 'Courier New', Courier, monospace;
        font-size: 14px;
        word-break: break-all;
        background-color: #222;
        padding: 10px;
        border-radius: 4px;
        border: 1px solid #555;
        max-height: 70px;
        overflow-y: auto;
      }
      .sha256-input {
        width: 95%;
        padding: 8px;
        background-color: #222;
        border: 1px solid #555;
        color: #eee;
        border-radius: 4px;
        font-family: 'Courier New', Courier, monospace;
      }
      .sha256-timer { font-size: 18px; color: #ff5555; }
    `;
    const styleSheet = document.createElement("style");
    styleSheet.innerText = styles;
    popupBody.appendChild(styleSheet);

    // --- UI Elements ---
    const container = document.createElement("div");
    container.className = "sha256-challenge";

    const title = document.createElement("p");
    title.textContent = "以下の文字列のSHA-256ハッシュを入力してください:";

    const randomString = Sha256Challenge.generateRandomString(64);
    const stringDisplay = document.createElement("div");
    stringDisplay.className = "sha256-string";
    stringDisplay.textContent = randomString;

    const input = document.createElement("input");
    input.type = "text";
    input.className = "sha256-input";
    input.placeholder = "ハッシュ値をここに入力";

    const timerDisplay = document.createElement("div");
    timerDisplay.className = "sha256-timer";

    const submitButton = document.createElement("button");
    submitButton.textContent = "提出";
    submitButton.className = "captcha-verify-button"; // Use existing style

    container.appendChild(title);
    container.appendChild(stringDisplay);
    container.appendChild(input);
    container.appendChild(submitButton);
    container.appendChild(timerDisplay);
    popupBody.appendChild(container);

    // --- Logic ---
    let timeLeft = 3;
    timerDisplay.textContent = `残り時間: ${timeLeft.toFixed(1)}秒`;

    const timerId = setInterval(() => {
      timeLeft -= 0.1;
      timerDisplay.textContent = `残り時間: ${timeLeft.toFixed(1)}秒`;

      if (timeLeft <= 0) {
        clearInterval(timerId);
        failure();
      }
    }, 100);

    const handleSubmit = async () => {
      clearInterval(timerId);
      const userInput = input.value.trim().toLowerCase();
      const correctHash = await Sha256Challenge.calculateSha256(randomString);

      if (userInput === correctHash) {
        success();
      } else {
        failure();
      }
    };

    submitButton.addEventListener("click", handleSubmit);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        handleSubmit();
      }
    });

    // --- Cleanup ---
    return () => {
      clearInterval(timerId);
    };
  }

  /**
   * Generates a random alphanumeric string of a given length.
   * @param length The desired length of the string.
   * @returns A random string.
   */
  private static generateRandomString(length: number): string {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Calculates the SHA-256 hash of a string.
   * @param text The string to hash.
   * @returns A promise that resolves to the hex-encoded hash string.
   */
  private static async calculateSha256(text: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    return hashHex;
  }
}
