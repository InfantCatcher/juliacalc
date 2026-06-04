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

## Free Hosting on GitHub Pages (Deployment)

To share this tool with the world for free:
1. Initialize a Git repository in this folder:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of JuliaCalc Work Hour Calculator"
   ```
2. Create a new repository on your GitHub account called `work-hour-calculator` (or similar).
3. Connect your local repository to GitHub:
   ```bash
   git remote add origin https://github.com/your-username/work-hour-calculator.git
   git branch -M main
   git push -u origin main
   ```
4. Navigate to your repository settings on GitHub:
   - Go to **Settings** > **Pages** (under the "Code and automation" section).
   - Under **Build and deployment**, select **Deploy from a branch**.
   - Under **Branch**, select `main` (or the branch you pushed to) and folder `/ (root)`.
   - Click **Save**.
5. After a few seconds, GitHub will provide a live URL (e.g., `https://your-username.github.io/work-hour-calculator/`) where you and others can use the app for free!
