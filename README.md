# JuliaCalc ⚡
> A premium, dark-glassmorphic, mobile-responsive Work Hour Calculator designed to calculate, log, and share your work schedules seamlessly.

## Features

- **Dynamic Range Scheduler**: Centered around your current date, input any start and end dates to dynamically load calendar day cards.
- **Glassmorphic UI**: High contrast, vibrant HSL gradients, and soft micro-animations designed to fit look premium in both Light and Dark modes.
- **Flexible Exclusions**: Toggle inclusion checkboxes to darken/dim took-off days, automatically removing them from calculations.
- **Time Wheel Pickers**: Mobile-friendly dropdown selectors mirroring physical time wheel inputs (1-12 Hour, 00/15/30/45 Minute, AM/PM).
- **Auto-Break Deductions**:
  - Shifts > 4 hours automatically deduct 15 minutes (0.25h).
  - Shifts > 5 hours automatically deduct 30 minutes (0.50h).
- **Quick Fill & Clear**: Instantly apply hours to all selected/active dates or wipe them with one-click buttons.
- **Persistent Data**: Powered by local storage caching, your hours, checkboxes, and preferences remain safe even after reload.
- **Share to Clipboard**: High-fidelity text-copy format designed for easy copy-pasting to Slack, WhatsApp, email, or invoices.

---

## How to Run Locally

Since the application is built using standard Vanilla Web components (HTML, CSS, and JS), it has zero external package build steps.
To view the site:
1. Open the project folder on your computer.
2. Double-click on `index.html` to open it in your browser.
3. Or serve it locally using any static web server:
   ```bash
   # If you have python installed
   python -m http.server 8000
   
   # Or using Node.js
   npx serve .
   ```

---

## Live Deployment on GitHub Pages

This project is configured for GitHub Pages:
- **Repository URL**: [https://github.com/InfantCatcher/juliacalc](https://github.com/InfantCatcher/juliacalc)
- **Live Web Application URL**: [https://infantcatcher.github.io/juliacalc/](https://infantcatcher.github.io/juliacalc/)

To activate the live link:
1. Go to your repository settings at [https://github.com/InfantCatcher/juliacalc/settings/pages](https://github.com/InfantCatcher/juliacalc/settings/pages).
2. Under **Build and deployment**, ensure **Deploy from a branch** is selected as the Source.
3. Under **Branch**, select `main` and folder `/ (root)`.
4. Click **Save**.
5. Within 1-2 minutes, the live URL `https://infantcatcher.github.io/juliacalc/` will be active and ready to use!
