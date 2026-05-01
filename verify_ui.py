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

            # 1. Verify Login Screen
            await page.goto('http://localhost:8001')
            await page.wait_for_selector('#login-screen')

            # Check for avatar image
            avatar_img = await page.query_selector('.user-avatar img')
            assert avatar_img is not None
            src = await avatar_img.get_attribute('src')
            assert 'unsplash' in src

            os.makedirs('verification/screenshots', exist_ok=True)
            await page.screenshot(path='verification/screenshots/login_screen_new.png')
            print("Captured login screen screenshot.")

            # 2. Login and Verify Desktop
            await page.fill('#login-password', 'password')
            await page.click('#login-btn')

            await page.wait_for_selector('#desktop', state='visible')
            await page.wait_for_selector('#menu-bar', state='visible')
            await page.wait_for_selector('#dock', state='visible')

            await page.screenshot(path='verification/screenshots/desktop_new.png')
            print("Captured desktop screenshot.")

            # 3. Test App Opening (Settings)
            await page.click('#dock [data-app="settings"]')
            await page.wait_for_selector('.window')

            window_title = await page.inner_text('.window-title')
            assert 'Settings' in window_title

            # 4. Test Dark Mode Sync
            iframe_element = await page.query_selector('iframe')
            iframe = await iframe_element.content_frame()

            await iframe.wait_for_selector('#dark-mode-toggle')

            # Toggle dark mode in iframe
            await iframe.click('#dark-mode-toggle')

            # Wait for parent body to have dark-mode class
            await page.wait_for_function("() => document.body.classList.contains('dark-mode')")

            is_dark = await page.evaluate("() => document.body.classList.contains('dark-mode')")
            assert is_dark is True

            await page.screenshot(path='verification/screenshots/dark_mode_sync_new.png')
            print("Verified Dark Mode synchronization.")

            await browser.close()
    finally:
        server_process.terminate()

if __name__ == "__main__":
    asyncio.run(verify_macos_ui())
