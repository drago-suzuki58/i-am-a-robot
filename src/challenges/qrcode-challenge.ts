import type { CaptchaChallenge } from "./types";
import QRCode from "qrcode";

export class QrCodeChallenge implements CaptchaChallenge {
  create(
    popupBody: HTMLElement,
    success: () => void,
    failure: () => void,
  ): () => void {
    // --- Config ---
    const gridSize = 21; // Version 1 QR code is 21x21
    const timeLimit = 10;

    // Generate a short random string for QR code (V1 capacity is limited)
    const randomString = Math.random().toString(36).substring(2, 12);
    const qrCodeData = QRCode.create(randomString, { version: 1 });
    const qrModules = qrCodeData.modules.data;
    const moduleCount = qrCodeData.modules.size;

    // --- Styles ---
    const styles = `
      .qr-challenge { display: flex; flex-direction: column; align-items: center; gap: 10px; width: 100%; }
      .qr-challenge p { margin: 0; color: #ccc; text-align: center; }
      .qr-grid {
        display: grid;
        grid-template-columns: repeat(${moduleCount}, 1fr);
        grid-template-rows: repeat(${moduleCount}, 1fr);
        width: ${gridSize * 12}px;
        height: ${gridSize * 12}px;
        border: 1px solid #555;
      }
      .qr-cell {
        width: 12px;
        height: 12px;
        background-color: #fff;
        cursor: pointer;
      }
      .qr-cell.active {
        background-color: #000;
      }
      .qr-timer { font-size: 18px; color: #ff5555; }
      .qr-source-string {
        font-family: 'Courier New', Courier, monospace;
        font-size: 12px;
        color: #aaa;
        background-color: #222;
        padding: 5px;
        border-radius: 4px;
      }
    `;
    const styleSheet = document.createElement("style");
    styleSheet.innerText = styles;
    popupBody.appendChild(styleSheet);

    // --- UI Elements ---
    const container = document.createElement("div");
    container.className = "qr-challenge";

    const title = document.createElement("p");
    title.textContent = "Replicate the QR code:";

    const sourceStringContainer = document.createElement("p");
    sourceStringContainer.textContent = "Source string: ";
    const sourceStringElement = document.createElement("code");
    sourceStringElement.className = "qr-source-string";
    sourceStringElement.textContent = randomString;
    sourceStringContainer.appendChild(sourceStringElement);

    const grid = document.createElement("div");
    grid.className = "qr-grid";

    const gridCells: HTMLElement[] = [];
    for (let i = 0; i < moduleCount * moduleCount; i++) {
      const cell = document.createElement("div");
      cell.className = "qr-cell";
      cell.addEventListener("click", () => cell.classList.toggle("active"));
      grid.appendChild(cell);
      gridCells.push(cell);
    }

    const timerDisplay = document.createElement("div");
    timerDisplay.className = "qr-timer";

    const submitButton = document.createElement("button");
    submitButton.textContent = "Submit";
    submitButton.className = "captcha-verify-button";

    container.appendChild(title);
    container.appendChild(sourceStringContainer);
    container.appendChild(grid);
    container.appendChild(submitButton);
    container.appendChild(timerDisplay);
    popupBody.appendChild(container);

    // --- Logic ---
    let timeLeft = timeLimit;
    timerDisplay.textContent = `Time left: ${timeLeft.toFixed(1)}s`;

    const timerId = setInterval(() => {
      timeLeft -= 0.1;
      timerDisplay.textContent = `Time left: ${timeLeft.toFixed(1)}s`;

      if (timeLeft <= 0) {
        clearInterval(timerId);
        failure();
      }
    }, 100);

    const handleSubmit = () => {
      clearInterval(timerId);

      let isCorrect = true;
      for (let i = 0; i < qrModules.length; i++) {
        const originalModule = qrModules[i] === 1; // 1 is black
        const userModule = gridCells[i].classList.contains("active");
        if (originalModule !== userModule) {
          isCorrect = false;
          break;
        }
      }

      if (isCorrect) {
        success();
      } else {
        failure();
      }
    };

    submitButton.addEventListener("click", handleSubmit);

    // --- Cleanup ---
    return () => {
      clearInterval(timerId);
    };
  }
}
