document.addEventListener('DOMContentLoaded', () => {
    console.log('macOS Mockup initialized');

    // Login Logic
    const loginBtn = document.getElementById('login-btn');
    const loginPassword = document.getElementById('login-password');
    const loginScreen = document.getElementById('login-screen');
    const desktop = document.getElementById('desktop');

    function handleLogin() {
        loginScreen.style.opacity = '0';
        setTimeout(() => {
            loginScreen.style.display = 'none';
            desktop.style.display = 'flex';
        }, 500);
    }

    loginBtn.addEventListener('click', handleLogin);
    loginPassword.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleLogin();
    });

    // Update Clock
    function updateClock() {
        const now = new Date();
        const options = { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        document.getElementById('clock').textContent = now.toLocaleString('en-US', options);
    }
    updateClock();
    setInterval(updateClock, 60000);

    const windowContainer = document.getElementById('window-container');
    const windowTemplate = document.getElementById('window-template');
    let highestZIndex = 10;

    function createWindow(appName, content) {
        const clone = windowTemplate.content.cloneNode(true);
        const windowEl = clone.querySelector('.window');
        windowEl.querySelector('.window-title').textContent = appName;
        windowEl.querySelector('.window-content').innerHTML = content;

        // Randomish initial position
        const offset = (windowContainer.children.length * 30) % 200;
        windowEl.style.top = (100 + offset) + 'px';
        windowEl.style.left = (100 + offset) + 'px';

        // Bring to front on click
        windowEl.addEventListener('mousedown', () => {
            highestZIndex++;
            windowEl.style.zIndex = highestZIndex;
            document.querySelector('.app-name').textContent = appName;
        });

        // Close functionality
        windowEl.querySelector('.close').addEventListener('click', (e) => {
            e.stopPropagation();
            windowEl.remove();
        });

        // Drag functionality
        const header = windowEl.querySelector('.window-header');
        let isDragging = false;
        let startX, startY, startLeft, startTop;

        const onMouseMove = (e) => {
            if (!isDragging) return;
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            windowEl.style.left = (startLeft + dx) + 'px';
            windowEl.style.top = (startTop + dy) + 'px';
        };

        const onMouseUp = () => {
            if (isDragging) {
                isDragging = false;
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
            }
        };

        header.addEventListener('mousedown', (e) => {
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            startLeft = parseInt(windowEl.style.left, 10) || 100;
            startTop = parseInt(windowEl.style.top, 10) || 100;
            highestZIndex++;
            windowEl.style.zIndex = highestZIndex;

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });

        windowContainer.appendChild(windowEl);

        // App-specific logic initialization
        if (appName === 'Calculator') {
            initCalculator(windowEl);
        } else if (appName === 'Finder') {
            initFinder(windowEl);
        } else if (appName === 'Safari') {
            initSafari(windowEl);
        }
    }

    function initSafari(windowEl) {
        const addressBar = windowEl.querySelector('.address-bar input');
        const content = windowEl.querySelector('.safari-content h1');
        const winTitle = windowEl.querySelector('.window-title');

        addressBar.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const url = addressBar.value;
                content.textContent = `Loading ${url}...`;
                setTimeout(() => {
                    content.textContent = `Welcome to ${url}`;
                    winTitle.textContent = url;
                }, 1000);
            }
        });
    }

    function initFinder(windowEl) {
        const sidebarItems = windowEl.querySelectorAll('.folder-item');
        const fileGrid = windowEl.querySelector('.file-grid');

        const files = {
            'Favorites': [
                { name: 'Project 1', icon: '📁' },
                { name: 'Resume.pdf', icon: '📄' }
            ],
            'Applications': [
                { name: 'Safari', icon: '🌐' },
                { name: 'Notes', icon: '📝' },
                { name: 'Calculator', icon: '🔢' }
            ],
            'Desktop': [
                { name: 'Macintosh HD', icon: '📁' }
            ],
            'Documents': [
                { name: 'Budget.xlsx', icon: '📊' },
                { name: 'Meeting Notes', icon: '📝' }
            ],
            'Downloads': [
                { name: 'Installer.pkg', icon: '📦' }
            ]
        };

        sidebarItems.forEach(item => {
            item.addEventListener('click', () => {
                sidebarItems.forEach(i => i.classList.remove('active'));
                item.classList.add('active');
                const folder = item.textContent;
                renderFiles(folder);
            });
        });

        function renderFiles(folder) {
            fileGrid.innerHTML = '';
            const folderFiles = files[folder] || [];
            folderFiles.forEach(file => {
                const fileItem = document.createElement('div');
                fileItem.className = 'file-item';
                fileItem.innerHTML = `
                    <div class="file-icon" style="display:flex; justify-content:center; align-items:center; font-size:30px;">${file.icon}</div>
                    <span>${file.name}</span>
                `;
                fileGrid.appendChild(fileItem);
            });
        }
    }

    function initCalculator(windowEl) {
        const display = windowEl.querySelector('#calc-display');
        const buttons = windowEl.querySelectorAll('.calc-btn');
        let currentInput = '';
        let operator = null;
        let previousInput = '';

        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                const value = btn.textContent;

                if (!isNaN(value) || value === '.') {
                    currentInput += value;
                    display.textContent = currentInput;
                } else if (value === 'AC') {
                    currentInput = '';
                    previousInput = '';
                    operator = null;
                    display.textContent = '0';
                } else if (['+', '-', '×', '÷'].includes(value)) {
                    operator = value;
                    previousInput = currentInput;
                    currentInput = '';
                } else if (value === '=') {
                    if (operator && previousInput && currentInput) {
                        const prev = parseFloat(previousInput);
                        const current = parseFloat(currentInput);
                        let result;
                        switch(operator) {
                            case '+': result = prev + current; break;
                            case '-': result = prev - current; break;
                            case '×': result = prev * current; break;
                            case '÷': result = prev / current; break;
                        }
                        display.textContent = result;
                        currentInput = result.toString();
                        operator = null;
                    }
                }
            });
        });
    }

    function getAppContent(app) {
        switch(app) {
            case 'finder':
                return `
                    <div class="finder-layout">
                        <div class="sidebar">
                            <ul class="folder-list">
                                <li class="folder-item active">Favorites</li>
                                <li class="folder-item">Applications</li>
                                <li class="folder-item">Desktop</li>
                                <li class="folder-item">Documents</li>
                                <li class="folder-item">Downloads</li>
                            </ul>
                        </div>
                        <div class="file-grid">
                            <div class="file-item">
                                <div class="file-icon"></div>
                                <span>Project 1</span>
                            </div>
                            <div class="file-item">
                                <div class="file-icon"></div>
                                <span>Resume.pdf</span>
                            </div>
                        </div>
                    </div>
                `;
            case 'safari':
                return `
                    <div class="safari-layout">
                        <div class="address-bar">
                            <input type="text" value="https://www.apple.com" />
                        </div>
                        <div class="safari-content">
                            <h1>Welcome to Safari</h1>
                        </div>
                    </div>
                `;
            case 'notes':
                return `
                    <div class="notes-layout">
                        <textarea placeholder="Start typing..."></textarea>
                    </div>
                `;
            case 'calculator':
                return `
                    <div class="calc-layout">
                        <div class="calc-display" id="calc-display">0</div>
                        <button class="calc-btn gray">AC</button>
                        <button class="calc-btn gray">+/-</button>
                        <button class="calc-btn gray">%</button>
                        <button class="calc-btn orange">÷</button>
                        <button class="calc-btn">7</button>
                        <button class="calc-btn">8</button>
                        <button class="calc-btn">9</button>
                        <button class="calc-btn orange">×</button>
                        <button class="calc-btn">4</button>
                        <button class="calc-btn">5</button>
                        <button class="calc-btn">6</button>
                        <button class="calc-btn orange">-</button>
                        <button class="calc-btn">1</button>
                        <button class="calc-btn">2</button>
                        <button class="calc-btn">3</button>
                        <button class="calc-btn orange">+</button>
                        <button class="calc-btn" style="grid-column: span 2; width: 110px; border-radius: 25px;">0</button>
                        <button class="calc-btn">.</button>
                        <button class="calc-btn orange">=</button>
                    </div>
                `;
            case 'settings':
                return `
                    <div class="settings-layout">
                        <div class="settings-row">
                            <span>Wi-Fi</span>
                            <input type="checkbox" checked />
                        </div>
                        <div class="settings-row">
                            <span>Bluetooth</span>
                            <input type="checkbox" checked />
                        </div>
                        <div class="settings-row">
                            <span>Dark Mode</span>
                            <input type="checkbox" />
                        </div>
                        <div class="settings-row">
                            <span>Volume</span>
                            <input type="range" min="0" max="100" value="80" />
                        </div>
                    </div>
                `;
            default:
                return `<p>App content coming soon...</p>`;
        }
    }

    // Launchpad Logic
    const launchpad = document.getElementById('launchpad');
    const launchpadTrigger = document.getElementById('launchpad-trigger');

    function toggleLaunchpad() {
        if (launchpad.style.display === 'none') {
            launchpad.style.display = 'flex';
            launchpad.style.opacity = '0';
            setTimeout(() => launchpad.style.opacity = '1', 10);
        } else {
            launchpad.style.opacity = '0';
            setTimeout(() => launchpad.style.display = 'none', 300);
        }
    }

    launchpadTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleLaunchpad();
    });

    launchpad.addEventListener('click', () => {
        toggleLaunchpad();
    });

    // Desktop and Dock interaction
    document.querySelectorAll('.dock-item:not(#launchpad-trigger), .desktop-icon, .launchpad-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            const app = item.getAttribute('data-app');
            const appTitle = item.getAttribute('title') || app.charAt(0).toUpperCase() + app.slice(1);

            // Check if window already exists
            const existing = Array.from(windowContainer.children).find(win => win.querySelector('.window-title').textContent === appTitle || win.querySelector('.window-title').textContent === app);
            if (existing) {
                highestZIndex++;
                existing.style.zIndex = highestZIndex;
                document.querySelector('.app-name').textContent = appTitle;
                return;
            }

            // Get App Content
            const content = getAppContent(app);
            createWindow(appTitle, content);
        });
    });
});
