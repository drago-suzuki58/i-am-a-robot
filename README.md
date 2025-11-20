# I am a Robot CAPTCHA

> [!NOTE]
> This code was largely written by Gemini 3.0 Pro. While it has been reviewed, please treat this project as a novelty or for amusement purposes.

[日本語](./README.ja.md)

## Overview

This is a CAPTCHA library with a unique twist: instead of proving you are human, the challenges are designed to be easy for a bot or program to solve, but difficult or tedious for a human. It serves as a reverse-CAPTCHA, following the theme "I am a robot".

## Features

- Multiple challenge types to choose from.
- Ability to select a specific challenge or have one chosen at random.
- Simple integration into any webpage.
- Verification expires automatically after a set time (currently 15 seconds).
- Includes a solver bot for demonstration and testing purposes.

## Challenge Types

The library currently supports the following challenges:

- **SHA-256:** The user must calculate the SHA-256 hash of a given random string within a short time limit.
  ![](./images/challenge-sha256.png)
- **QR Code:** The user must replicate a Version 1 QR code on a 21x21 grid based on a given source string.
  ![](./images/challenge-qrcode.png)
- **Prime Factorization:** The user must find the two prime factors of a large composite number.
  ![](./images/challenge-prime.png)

## Usage

1.  Add a root container to your HTML file. This element will house the CAPTCHA widget.
    ```html
    <div id="root"></div>
    ```

2.  Include the main script in your HTML file.
    ```html
    <script type="module" src="/src/index.ts"></script>
    ```

3.  To configure the challenge type, add a `data-challenge` attribute to your root container. The main script will automatically read this attribute.

    Valid options for `data-challenge` are:
    - `sha256`
    - `qrcode`
    - `prime`
    - `random` (will pick one of the above at random on every attempt)

    **Example:**
    ```html
    <!-- This will randomly select a challenge each time the CAPTCHA is clicked -->
    <div id="root" data-challenge="random"></div>
    ```
