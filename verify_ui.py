import asyncio
from playwright.async_api import async_playwright
import os
import subprocess
import time

async def verify_macos_ui():
    # Start local server
    server_process = subprocess.Popen(['python3', '-m', 'http.server', '8001'])
    time.sleep(2)  # Wait for server to start

    try:
        async with async_playwright() as p:
            browser = await p.chromium.launch()
            page = await browser.new_page(viewport={'width': 1280, 'height': 800})

            # 1. Verify First Run (Setup Assistant)
            await page.goto('http://localhost:8001')

            # Since users list is empty in localStorage on first run (clean environment),
            # we expect #setup-wizard to be visible and #user-selection to be hidden.
            await page.wait_for_selector('#setup-wizard', state='visible')
            print("Verified First Run Setup Assistant.")

            # Navigate Step 1 -> Step 2
            await page.click('.next-step[data-next="2"]')
            await page.wait_for_selector('#setup-step-2', state='visible')

            # Fill Setup Form
            await page.fill('#setup-name', 'Test User')
            await page.fill('#setup-password', 'secret')

            # Navigate Step 2 -> Step 3
            await page.click('.next-step[data-next="3"]')
            await page.wait_for_selector('#setup-step-3', state='visible')

            # Finish Setup
            await page.click('#finish-setup')

            # Wait for login screen
            await page.wait_for_selector('#user-selection', state='visible')
            print("Completed Setup Assistant.")

            # 2. Verify Login Screen (User Selection)
            # Click on the newly created user
            await page.click('.user-item')

            # Wait for password screen
            await page.wait_for_selector('#password-screen', state='visible')

            os.makedirs('verification/screenshots', exist_ok=True)
            await page.screenshot(path='verification/screenshots/login_screen_new.png')
            print("Captured login screen screenshot.")

            # Login
            await page.fill('#login-password', 'secret')
            await page.click('#login-btn')

            await page.wait_for_selector('#desktop', state='visible')
            await page.wait_for_selector('#menu-bar', state='visible')
            await page.wait_for_selector('#dock', state='visible')

            await page.screenshot(path='verification/screenshots/desktop_new.png')
            print("Captured desktop screenshot.")

            # 3. Test Installer App
            await page.click('#launchpad-trigger')
            await page.wait_for_selector('#launchpad', state='visible')
            await page.click('.launchpad-item[data-app="installer"]')

            # Launchpad closes on app click
            await page.wait_for_selector('.window[data-app-id="installer"]')
            window_title = await page.inner_text('.window[data-app-id="installer"] .window-title')
            assert 'Installer' in window_title
            print("Verified Installer App launch.")

            await browser.close()
    finally:
        server_process.terminate()

if __name__ == "__main__":
    asyncio.run(verify_macos_ui())
