import type { CaptchaChallenge } from "./types";

export class PrimeFactorizationChallenge implements CaptchaChallenge {
  create(
    popupBody: HTMLElement,
    success: () => void,
    failure: () => void,
  ): () => void {
    // --- Config ---
    const timeLimit = 5;
    const numberToFactor =
      PrimeFactorizationChallenge.generateCompositeNumber();

    // --- Styles ---
    const styles = `
      .prime-challenge { display: flex; flex-direction: column; align-items: center; gap: 15px; width: 100%; }
      .prime-challenge p { margin: 0; color: #ccc; }
      .prime-number {
        font-family: 'Courier New', Courier, monospace;
        font-size: 24px;
        font-weight: bold;
        color: #eee;
        background-color: #222;
        padding: 10px 20px;
        border-radius: 4px;
        border: 1px solid #555;
      }
      .prime-input {
        width: 95%;
        padding: 8px;
        background-color: #222;
        border: 1px solid #555;
        color: #eee;
        border-radius: 4px;
        font-family: 'Courier New', Courier, monospace;
      }
      .prime-timer { font-size: 18px; color: #ff5555; }
    `;
    const styleSheet = document.createElement("style");
    styleSheet.innerText = styles;
    popupBody.appendChild(styleSheet);

    // --- UI Elements ---
    const container = document.createElement("div");
    container.className = "prime-challenge";

    const title = document.createElement("p");
    title.textContent = "Factor the following number:";

    const numberDisplay = document.createElement("div");
    numberDisplay.className = "prime-number";
    numberDisplay.textContent = numberToFactor.toLocaleString();

    const input = document.createElement("input");
    input.type = "text";
    input.className = "prime-input";
    input.placeholder = "Enter factors, comma-separated";

    const timerDisplay = document.createElement("div");
    timerDisplay.className = "prime-timer";

    const submitButton = document.createElement("button");
    submitButton.textContent = "Submit";
    submitButton.className = "captcha-verify-button";

    container.appendChild(title);
    container.appendChild(numberDisplay);
    container.appendChild(input);
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
      const userFactors = input.value
        .split(",")
        .map((s) => parseInt(s.trim(), 10))
        .filter((n) => !isNaN(n) && n > 1)
        .sort((a, b) => a - b);

      const correctFactors =
        PrimeFactorizationChallenge.factorize(numberToFactor);

      // Compare arrays
      const isCorrect =
        userFactors.length === correctFactors.length &&
        userFactors.every((val, index) => val === correctFactors[index]);

      if (isCorrect) {
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

  private static isPrime(num: number): boolean {
    if (num <= 1) return false;
    if (num <= 3) return true;
    if (num % 2 === 0 || num % 3 === 0) return false;
    for (let i = 5; i * i <= num; i = i + 6) {
      if (num % i === 0 || num % (i + 2) === 0) return false;
    }
    return true;
  }

  private static generateRandomPrime(min: number, max: number): number {
    let prime = 0;
    while (prime === 0) {
      const randomNum = Math.floor(Math.random() * (max - min + 1)) + min;
      if (PrimeFactorizationChallenge.isPrime(randomNum)) {
        prime = randomNum;
      }
    }
    return prime;
  }

  private static generateCompositeNumber(): number {
    const prime1 = this.generateRandomPrime(10000, 99999);
    const prime2 = this.generateRandomPrime(10000, 99999);
    return prime1 * prime2;
  }

  private static factorize(num: number): number[] {
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
  }
}
