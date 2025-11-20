import type { CaptchaChallenge } from "./types";
import { Sha256Challenge } from "./sha256-challenge";
import { QrCodeChallenge } from "./qrcode-challenge";

export type ChallengeType = "sha256" | "qrcode" | "random";

const availableChallenges: ReadonlyArray<"sha256" | "qrcode"> = [
  "sha256",
  "qrcode",
];

/**
 * Factory function to create a CAPTCHA challenge instance based on type.
 * @param type The type of challenge to create.
 * @returns An instance of a class that implements CaptchaChallenge.
 */
export function createChallenge(type: ChallengeType): CaptchaChallenge {
  let challengeType = type;

  if (challengeType === "random") {
    const randomIndex = Math.floor(Math.random() * availableChallenges.length);
    challengeType = availableChallenges[randomIndex];
  }

  switch (challengeType) {
    case "qrcode":
      return new QrCodeChallenge();
    case "sha256":
    default:
      return new Sha256Challenge();
  }
}
