// Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js').then(registration => {
            console.log('SW registered: ', registration);
        }).catch(registrationError => {
            console.log('SW registration failed: ', registrationError);
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('macOS Mockup initialized');

    // Login & Account Logic
    const loginBtn = document.getElementById('login-btn');
    const loginPassword = document.getElementById('login-password');
    const loginScreen = document.getElementById('login-screen');
    const desktop = document.getElementById('desktop');
    const userList = document.getElementById('user-list');
    const userSelection = document.getElementById('user-selection');
    const passwordScreen = document.getElementById('password-screen');
    const activeUserAvatar = document.getElementById('active-user-avatar');
    const activeUserName = document.getElementById('active-user-name');
    const backToUsers = document.getElementById('back-to-users');
    const createAccountBtn = document.getElementById('create-account-btn');
    const setupWizard = document.getElementById('setup-wizard');
    const finishSetup = document.getElementById('finish-setup');

    let users = JSON.parse(localStorage.getItem('mac_users')) || [];

    function checkFirstRun() {
        if (users.length === 0) {
            userSelection.style.display = 'none';
            setupWizard.style.display = 'flex';
        } else {
            renderUsers();
        }
    }

    function renderUsers() {
        if (!userList) return;
        userList.innerHTML = '';
        users.forEach((user, index) => {
            const userDiv = document.createElement('div');
            userDiv.className = 'user-item';
            userDiv.innerHTML = `
                <img src="${user.avatar}" alt="${user.name}">
                <span>${user.name}</span>
            `;
            userDiv.onclick = () => showPasswordScreen(user);
            userList.appendChild(userDiv);
        });
    }

    function showPasswordScreen(user) {
        userSelection.style.display = 'none';
        passwordScreen.style.display = 'flex';
        activeUserAvatar.src = user.avatar;
        activeUserName.textContent = user.name;
        loginPassword.value = '';
        loginPassword.focus();

        // Store current user session (mock)
        sessionStorage.setItem('current_user', JSON.stringify(user));
    }

    if (backToUsers) {
        backToUsers.onclick = () => {
            passwordScreen.style.display = 'none';
            userSelection.style.display = 'flex';
        };
    }

    if (createAccountBtn) {
        createAccountBtn.onclick = () => {
            userSelection.style.display = 'none';
            setupWizard.style.display = 'flex';
        };
    }

    // Setup Wizard Navigation
    document.querySelectorAll('.next-step').forEach(btn => {
        btn.onclick = () => {
            const currentStep = btn.closest('.setup-step');
            const nextStepId = `setup-step-${btn.getAttribute('data-next')}`;
            currentStep.style.display = 'none';
            document.getElementById(nextStepId).style.display = 'block';
        };
    });

    document.querySelectorAll('.prev-step').forEach(btn => {
        btn.onclick = () => {
            const currentStep = btn.closest('.setup-step');
            const prevStepId = `setup-step-${btn.getAttribute('data-prev')}`;
            currentStep.style.display = 'none';
            document.getElementById(prevStepId).style.display = 'block';
        };
    });

    // Language selection
    document.querySelectorAll('.lang-item').forEach(item => {
        item.onclick = () => {
            document.querySelectorAll('.lang-item').forEach(i => i.classList.remove('selected'));
            item.classList.add('selected');
        };
    });

    // Theme selection
    document.querySelectorAll('.theme-opt').forEach(opt => {
        opt.onclick = () => {
            document.querySelectorAll('.theme-opt').forEach(o => o.classList.remove('selected'));
            opt.classList.add('selected');
            const theme = opt.getAttribute('data-theme');
            if (theme === 'dark') document.body.classList.add('dark-mode');
            else document.body.classList.remove('dark-mode');
        };
    });

    // Avatar Selection Logic
    document.querySelectorAll('.avatar-opt').forEach(opt => {
        opt.onclick = () => {
            document.querySelectorAll('.avatar-opt').forEach(o => o.classList.remove('selected'));
            opt.classList.add('selected');
        };
    });

    if (finishSetup) {
        finishSetup.onclick = () => {
            const name = document.getElementById('setup-name').value;
            const password = document.getElementById('setup-password').value;
            const avatar = document.querySelector('.avatar-opt.selected').getAttribute('data-url');

            if (!name) return alert('Please enter a name');

            users.push({ name, avatar, password });
            localStorage.setItem('mac_users', JSON.stringify(users));

            document.getElementById('setup-step-3').style.display = 'none';
            document.getElementById('setup-step-final').style.display = 'block';

            setTimeout(() => {
                renderUsers();
                setupWizard.style.display = 'none';
                userSelection.style.display = 'flex';
                // Reset steps for next time
                document.querySelectorAll('.setup-step').forEach(s => s.style.display = 'none');
                document.getElementById('setup-step-1').style.display = 'block';
            }, 2000);
        };
    }

    // Mock System Sounds
    const sounds = {
        boot: new Audio('https://www.soundjay.com/buttons/sounds/beep-01a.mp3'), // Placeholder for boot chime
        click: new Audio('https://www.soundjay.com/buttons/sounds/button-16.mp3')
    };

    function handleLogin() {
        const currentUser = JSON.parse(sessionStorage.getItem('current_user'));
        if (currentUser && loginPassword.value !== currentUser.password) {
            alert('Incorrect password');
            return;
        }

        sounds.boot.play().catch(() => {});
        loginScreen.style.opacity = '0';
        setTimeout(() => {
            loginScreen.style.display = 'none';
            desktop.style.display = 'flex';
        }, 500);
    }

    if (loginBtn) loginBtn.addEventListener('click', handleLogin);
    if (loginPassword) {
        loginPassword.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleLogin();
        });
    }

    checkFirstRun();

    // Update Clock
    function updateClock() {
        const now = new Date();
        const options = { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        const clockEl = document.getElementById('clock');
        if (clockEl) clockEl.textContent = now.toLocaleString('en-US', options);
    }
    updateClock();
    setInterval(updateClock, 60000);

    const windowContainer = document.getElementById('window-container');
    const windowTemplate = document.getElementById('window-template');
    let highestZIndex = 10;

    function createWindow(appId, appName) {
        const clone = windowTemplate.content.cloneNode(true);
        const windowEl = clone.querySelector('.window');
        windowEl.setAttribute('data-app-id', appId);
        windowEl.querySelector('.window-title').textContent = appName;

        // Use iframe to load app content from standalone files
        const iframe = document.createElement('iframe');
        iframe.src = `${appId}.html`;
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.border = 'none';
        iframe.style.borderRadius = '0 0 12px 12px';
        windowEl.querySelector('.window-content').appendChild(iframe);
        windowEl.querySelector('.window-content').style.padding = '0';

        // Initial size
        windowEl.style.width = '600px';
        windowEl.style.height = '450px';

        // Randomish initial position
        const offset = (windowContainer.children.length * 30) % 200;
        windowEl.style.top = (80 + offset) + 'px';
        windowEl.style.left = (80 + offset) + 'px';

        // Bring to front on click
        windowEl.addEventListener('mousedown', () => {
            highestZIndex++;
            windowEl.style.zIndex = highestZIndex;
            const appNameEl = document.querySelector('.app-name');
            if (appNameEl) appNameEl.textContent = appName;
        });

        // Traffic lights
        windowEl.querySelector('.close').addEventListener('click', (e) => {
            e.stopPropagation();
            windowEl.remove();
            const dockItem = document.querySelector(`.dock-item[data-app="${appId}"]`);
            if (dockItem) {
                const others = Array.from(windowContainer.children).filter(win => win.getAttribute('data-app-id') === appId);
                if (others.length === 0) {
                    dockItem.classList.remove('running');
                }
            }
        });

        windowEl.querySelector('.minimize').addEventListener('click', (e) => {
            e.stopPropagation();
            windowEl.style.display = 'none';
            const dockItem = document.querySelector(`.dock-item[data-app="${appId}"]`);
            if (dockItem) dockItem.classList.add('running');
        });

        windowEl.querySelector('.maximize').addEventListener('click', (e) => {
            e.stopPropagation();
            if (windowEl.style.width === '100%') {
                windowEl.style.width = '600px';
                windowEl.style.height = '450px';
                windowEl.style.top = '100px';
                windowEl.style.left = '100px';
            } else {
                windowEl.style.width = '100%';
                windowEl.style.height = 'calc(100% - 25px)';
                windowEl.style.top = '25px';
                windowEl.style.left = '0';
            }
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
            sounds.click.play().catch(() => {});
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

        const dockItem = document.querySelector(`.dock-item[data-app="${appId}"]`);
        if (dockItem) dockItem.classList.add('running');

        // Sync theme on load
        iframe.onload = () => {
            const isDark = document.body.classList.contains('dark-mode');
            iframe.contentWindow.postMessage({ type: 'sync-dark-mode', isDark }, '*');
        };
    }

    // Theme Management via postMessage
    window.addEventListener('message', (event) => {
        if (event.data.type === 'close-app') {
            const win = document.querySelector(`.window[data-app-id="${event.data.appId}"]`);
            if (win) win.querySelector('.close').click();
        }

        if (event.data.type === 'toggle-dark-mode') {
            if (event.data.isDark) {
                document.body.classList.add('dark-mode');
            } else {
                document.body.classList.remove('dark-mode');
            }
            // Propagate to all other iframes
            document.querySelectorAll('iframe').forEach(iframe => {
                iframe.contentWindow.postMessage({ type: 'sync-dark-mode', isDark: event.data.isDark }, '*');
            });
        }
    });

    // Spotlight Logic
    const spotlightOverlay = document.getElementById('spotlight-overlay');
    const spotlightBtn = document.getElementById('spotlight-btn');
    const spotlightInput = document.getElementById('spotlight-input');
    const spotlightResults = document.getElementById('spotlight-results');

    function toggleSpotlight() {
        if (!spotlightOverlay) return;
        if (spotlightOverlay.style.display === 'none' || !spotlightOverlay.style.display) {
            spotlightOverlay.style.display = 'block';
            spotlightInput.focus();
        } else {
            spotlightOverlay.style.display = 'none';
            spotlightInput.value = '';
            spotlightResults.innerHTML = '';
        }
    }

    if (spotlightBtn) {
        spotlightBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleSpotlight();
        });
    }

    if (spotlightInput) {
        spotlightInput.addEventListener('input', () => {
            const query = spotlightInput.value.toLowerCase();
            spotlightResults.innerHTML = '';
            if (!query) return;

            const apps = [
                { name: 'Finder', icon: '📁', id: 'finder' },
                { name: 'Safari', icon: '🌐', id: 'safari' },
                { name: 'Notes', icon: '📝', id: 'notes' },
                { name: 'Calculator', icon: '🔢', id: 'calculator' },
                { name: 'Settings', icon: '⚙️', id: 'settings' },
                { name: 'Terminal', icon: '📟', id: 'terminal' },
                { name: 'App Store', icon: '🏬', id: 'appstore' }
            ];

            const filtered = apps.filter(app => app.name.toLowerCase().includes(query));
            filtered.forEach(app => {
                const item = document.createElement('div');
                item.className = 'spotlight-result-item';
                item.innerHTML = `<span>${app.icon}</span> <span>${app.name}</span>`;
                item.onclick = () => {
                    const appItem = document.querySelector(`.dock-item[data-app="${app.id}"]`);
                    if (appItem) appItem.click();
                    toggleSpotlight();
                };
                spotlightResults.appendChild(item);
            });
        });
    }

    // Control Center Logic
    const controlCenter = document.getElementById('control-center');
    const ccBtn = document.getElementById('control-center-btn');

    function toggleControlCenter() {
        if (!controlCenter) return;
        if (controlCenter.style.display === 'none' || !controlCenter.style.display) {
            controlCenter.style.display = 'block';
        } else {
            controlCenter.style.display = 'none';
        }
    }

    if (ccBtn) {
        ccBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleControlCenter();
        });
    }

    // Global click to close overlays
    document.addEventListener('click', (e) => {
        if (spotlightOverlay && spotlightOverlay.style.display === 'block' && !spotlightOverlay.contains(e.target)) {
            toggleSpotlight();
        }
        if (controlCenter && controlCenter.style.display === 'block' && !controlCenter.contains(e.target) && e.target !== ccBtn) {
            toggleControlCenter();
        }
    });

    // Launchpad Logic
    const launchpad = document.getElementById('launchpad');
    const launchpadTrigger = document.getElementById('launchpad-trigger');

    function toggleLaunchpad() {
        if (!launchpad) return;
        if (launchpad.style.display === 'none' || !launchpad.style.display) {
            launchpad.style.display = 'flex';
            launchpad.style.opacity = '0';
            setTimeout(() => launchpad.style.opacity = '1', 10);
        } else {
            launchpad.style.opacity = '0';
            setTimeout(() => launchpad.style.display = 'none', 300);
        }
    }

    if (launchpadTrigger) {
        launchpadTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleLaunchpad();
        });
    }

    if (launchpad) {
        launchpad.addEventListener('click', () => {
            toggleLaunchpad();
        });
    }

    // Desktop and Dock interaction
    document.querySelectorAll('.dock-item:not(#launchpad-trigger), .desktop-icon, .launchpad-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            const app = item.getAttribute('data-app');
            const appTitle = item.getAttribute('title') || app.charAt(0).toUpperCase() + app.slice(1);

            const existing = Array.from(windowContainer.children).find(win => win.getAttribute('data-app-id') === app);
            if (existing) {
                highestZIndex++;
                existing.style.zIndex = highestZIndex;
                existing.style.display = 'flex';
                const appNameEl = document.querySelector('.app-name');
                if (appNameEl) appNameEl.textContent = appTitle;
                return;
            }

            createWindow(app, appTitle);
        });
    });
});
