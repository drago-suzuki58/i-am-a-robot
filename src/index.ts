import { createChallenge, type ChallengeType } from "./challenges/factory";

/**
 * I am a Robot CAPTCHA Library
 */
class RobotCaptcha {
  private hostElement: HTMLElement;
  private triggerElement: HTMLElement;
  private checkboxElement: HTMLElement;
  private modalElement: HTMLElement;
  private closeButton: HTMLElement;
  private statusMessageElement: HTMLElement;

  private isLoading = false;
  private isVerified = false;

  private challengeCleanup: (() => void) | null = null;
  private verifyTimeoutId: number | null = null;
  private challengeType: ChallengeType;

  constructor(hostElementId: string, challengeType: ChallengeType) {
    const host = document.getElementById(hostElementId);
    if (!host) {
      throw new Error(`Host element with id #${hostElementId} not found.`);
    }
    this.hostElement = host;
    this.challengeType = challengeType;

    const wrapper = this.createWrapper();
    this.triggerElement = wrapper.querySelector(".captcha-container")!;
    this.statusMessageElement = wrapper.querySelector(
      ".captcha-status-message",
    )!;
    this.checkboxElement =
      this.triggerElement.querySelector(".captcha-checkbox")!;

    this.modalElement = this.createModal();
    this.closeButton = this.modalElement.querySelector(".captcha-modal-close")!;

    this.hostElement.appendChild(wrapper);

    this.attachEventListeners();
  }

  public getIsVerified(): boolean {
    return this.isVerified;
  }

  private createWrapper(): HTMLElement {
    const wrapper = document.createElement("div");
    wrapper.className = "captcha-wrapper";
    const trigger = this.createTrigger();
    const status = document.createElement("div");
    status.className = "captcha-status-message";
    wrapper.appendChild(trigger);
    wrapper.appendChild(status);
    return wrapper;
  }

  private createTrigger(): HTMLElement {
    const container = document.createElement("div");
    container.className = "captcha-container";
    const checkbox = document.createElement("div");
    checkbox.className = "captcha-checkbox";
    const icon = document.createElement("div");
    icon.className = "icon";
    icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
    const spinner = document.createElement("div");
    spinner.className = "spinner";
    checkbox.appendChild(icon);
    checkbox.appendChild(spinner);
    const label = document.createElement("span");
    label.className = "captcha-label";
    label.textContent = "I am a robot";
    container.appendChild(checkbox);
    container.appendChild(label);
    return container;
  }

  private createModal(): HTMLElement {
    const overlay = document.createElement("div");
    overlay.className = "captcha-modal-overlay";

    const content = document.createElement("div");
    content.className = "captcha-modal-content";

    const header = document.createElement("div");
    header.className = "captcha-modal-header";
    const title = document.createElement("h3");
    title.className = "captcha-modal-title";
    title.textContent = "Prove you are a robot";
    const closeButton = document.createElement("button");
    closeButton.className = "captcha-modal-close";
    closeButton.innerHTML = "&times;";
    header.appendChild(title);
    header.appendChild(closeButton);

    const body = document.createElement("div");
    body.className = "captcha-modal-body";

    content.appendChild(header);
    content.appendChild(body);
    overlay.appendChild(content);
    document.body.appendChild(overlay);

    return overlay;
  }

  private attachEventListeners() {
    this.triggerElement.addEventListener("click", () =>
      this.handleTriggerClick(),
    );
    this.closeButton.addEventListener("click", (e) => {
      e.stopPropagation();
      this.hideModal();
    });
    // Also close modal on overlay click
    this.modalElement.addEventListener("click", (e) => {
      if (e.target === this.modalElement) {
        this.hideModal();
      }
    });
  }

  private handleTriggerClick() {
    this.statusMessageElement.textContent = "";
    this.statusMessageElement.classList.remove("visible");

    if (
      this.isLoading ||
      this.isVerified ||
      this.modalElement.classList.contains("visible")
    ) {
      return;
    }
    this.isLoading = true;
    this.triggerElement.classList.add("loading");
    this.checkboxElement.classList.add("loading");
    setTimeout(() => {
      this.isLoading = false;
      this.triggerElement.classList.remove("loading");
      this.checkboxElement.classList.remove("loading");
      this.showModal();
    }, 1500);
  }

  private verify() {
    if (this.verifyTimeoutId) {
      clearTimeout(this.verifyTimeoutId);
    }
    this.isVerified = true;
    this.triggerElement.classList.add("verified");
    this.checkboxElement.classList.add("verified");
    this.hideModal();
    this.verifyTimeoutId = window.setTimeout(() => {
      this.expireVerification();
    }, 15000);
  }

  private expireVerification() {
    this.isVerified = false;
    this.verifyTimeoutId = null;
    this.triggerElement.classList.remove("verified");
    this.checkboxElement.classList.remove("verified");
    this.statusMessageElement.textContent = "Verification has expired.";
    this.statusMessageElement.classList.add("visible");
  }

  private fail() {
    this.hideModal();
  }

  private showModal() {
    const modalBody = this.modalElement.querySelector(
      ".captcha-modal-body",
    )! as HTMLElement;
    modalBody.innerHTML = "";

    setTimeout(() => {
      const challenge = createChallenge(this.challengeType);
      this.challengeCleanup = challenge.create(
        modalBody,
        () => this.verify(),
        () => this.fail(),
      );
    }, 0);

    this.modalElement.classList.add("visible");
  }

  private hideModal() {
    if (this.challengeCleanup) {
      this.challengeCleanup();
      this.challengeCleanup = null;
    }
    this.modalElement.classList.remove("visible");
    const modalBody = this.modalElement.querySelector(
      ".captcha-modal-body",
    )! as HTMLElement;
    modalBody.innerHTML = "";
  }
}

// --- Initialization Logic ---
function isChallengeType(type: string): type is ChallengeType {
  return ["sha256", "qrcode", "prime", "random"].includes(type);
}
const rootElement = document.getElementById("root");
if (rootElement) {
  const challengeTypeAttr = rootElement.dataset.challenge;
  const challengeType =
    challengeTypeAttr && isChallengeType(challengeTypeAttr)
      ? challengeTypeAttr
      : "sha256";
  new RobotCaptcha("root", challengeType);
} else {
  console.error("Could not find root element to initialize CAPTCHA.");
}
