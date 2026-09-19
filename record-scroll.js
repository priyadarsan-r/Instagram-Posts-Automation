const { chromium } = require('playwright');

(async () => {
  // Grab the URL from the command line argument passed by the Action
  const targetUrl = process.argv[2] || 'https://github.com';

  // Launch a browser and set up video recording for mobile dimensions (9:16 aspect ratio for Reels)
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1080, height: 1920 }, // 1080p vertical
    recordVideo: { dir: './recorded_videos/', size: { width: 1080, height: 1920 } }
  });

  const page = await context.newPage();
  
  // Go to the repository URL
  await page.goto(targetUrl, { waitUntil: 'networkidle' });

  // Simulate smooth scrolling for 60 seconds (matching your voiceover max length)
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 5; // Scroll 5 pixels at a time
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        // Stop scrolling after about 60 seconds (60000ms / 20ms interval = 3000 ticks)
        // or if we hit the bottom of the page
        if (totalHeight >= scrollHeight || totalHeight >= (distance * 3000)) {
          clearInterval(timer);
          resolve();
        }
      }, 20); // 20ms interval = ~50 frames per second smooth scroll
    });
  });

  await context.close();
  await browser.close();
  
  console.log('Video recorded successfully in ./recorded_videos/');
})();
