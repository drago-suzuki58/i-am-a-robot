export interface CaptchaChallenge {
  /**
   * Creates the challenge UI within the provided popup body element.
   * @param popupBody The HTMLElement of the popup body to which the challenge UI should be appended.
   * @param success A callback function to be invoked when the challenge is successfully completed.
   * @param failure A callback function to be invoked when the challenge is failed.
   * @returns A cleanup function that will be called when the popup is closed (e.g., to clear timers).
   */
  create(
    popupBody: HTMLElement,
    success: () => void,
    failure: () => void
  ): () => void;
}
