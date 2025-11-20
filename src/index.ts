/**
 * I am a Robot CAPTCHA Library
 */
class RobotCaptcha {
  private hostElement: HTMLElement;
  private triggerElement: HTMLElement;
  private checkboxElement: HTMLElement;
  private popupElement: HTMLElement;
  private closeButton: HTMLElement;
  private verifyButton: HTMLElement;

  private isLoading = false;
  private isVerified = false;

  /**
   * @param hostElementId The ID of the element to which the CAPTCHA will be appended.
   */
  constructor(hostElementId: string) {
    const host = document.getElementById(hostElementId);
    if (!host) {
      throw new Error(`Host element with id #${hostElementId} not found.`);
    }
    this.hostElement = host;

    this.triggerElement = this.createTrigger();
    this.popupElement = this.createPopup();

    this.triggerElement.appendChild(this.popupElement);
    this.hostElement.appendChild(this.triggerElement);

    this.checkboxElement =
      this.triggerElement.querySelector(".captcha-checkbox")!;
    this.closeButton = this.popupElement.querySelector(".captcha-popup-close")!;
    this.verifyButton = this.popupElement.querySelector(
      ".captcha-verify-button",
    )!;

    this.attachEventListeners();
  }

  /**
   * Public method to check if the CAPTCHA has been verified.
   * @returns {boolean} True if verified, false otherwise.
   */
  public getIsVerified(): boolean {
    return this.isVerified;
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
    label.textContent = "私はロボットです";

    container.appendChild(checkbox);
    container.appendChild(label);

    return container;
  }

  private createPopup(): HTMLElement {
    const popup = document.createElement("div");
    popup.className = "captcha-popup";

    const header = document.createElement("div");
    header.className = "captcha-popup-header";

    const title = document.createElement("h3");
    title.className = "captcha-popup-title";
    title.textContent = "ロボットであることを証明してください";

    const closeButton = document.createElement("button");
    closeButton.className = "captcha-popup-close";
    closeButton.innerHTML = "&times;";

    header.appendChild(title);
    header.appendChild(closeButton);

    const body = document.createElement("div");
    body.className = "captcha-popup-body";
    body.textContent = "ここにCAPTCHAチャレンジが表示されます。";

    const verifyButton = document.createElement("button");
    verifyButton.className = "captcha-verify-button";
    verifyButton.textContent = "認証";
    body.appendChild(verifyButton);

    popup.appendChild(header);
    popup.appendChild(body);

    return popup;
  }

  private attachEventListeners() {
    this.triggerElement.addEventListener("click", () =>
      this.handleTriggerClick(),
    );

    this.closeButton.addEventListener("click", (e) => {
      e.stopPropagation();
      this.hidePopup();
    });

    this.verifyButton.addEventListener("click", (e) => {
      e.stopPropagation();
      this.verify();
    });
  }

  private handleTriggerClick() {
    if (
      this.isLoading ||
      this.isVerified ||
      this.popupElement.classList.contains("visible")
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
      this.showPopup();
    }, 1500);
  }

  private verify() {
    this.isVerified = true;
    this.triggerElement.classList.add("verified");
    this.checkboxElement.classList.add("verified");
    this.hidePopup();
  }

  private showPopup() {
    this.popupElement.classList.add("visible");
  }

  private hidePopup() {
    this.popupElement.classList.remove("visible");
  }
}

// Initialize the CAPTCHA on the #root element
new RobotCaptcha("root");
