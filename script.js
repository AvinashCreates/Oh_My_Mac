// =========================================================================
    // BOOT SEQUENCE & MULTILINGUAL "HELLO" SYSTEM
    // =========================================================================
    const HELLO_GREETINGS = [
      "hello",
      "hola",
      "bonjour",
      "ciao",
      "hallo",
      "namaste",
      "konnichiwa"
    ];

    let greetingIdx = 0;
    let bootProgress = 0;
    let bootInterval = null;
    let greetingCycleInterval = null;
    let bootFinished = false;

    function startBootSequence() {
      const elGreeting = document.getElementById('cursiveGreeting');
      const elBar = document.getElementById('bootProgressBar');
      const elStatus = document.getElementById('bootStatusText');

      // Cycle languages gracefully
      greetingCycleInterval = setInterval(() => {
        greetingIdx = (greetingIdx + 1) % HELLO_GREETINGS.length;
        if (elGreeting) {
          elGreeting.classList.remove('hello-fade-cycle');
          void elGreeting.offsetWidth; // trigger reflow
          elGreeting.textContent = HELLO_GREETINGS[greetingIdx];
          elGreeting.classList.add('hello-fade-cycle');
        }
      }, 1400);

      // Progress bar fill
      bootInterval = setInterval(() => {
        bootProgress += Math.random() * 9 + 4;
        if (bootProgress >= 100) {
          bootProgress = 100;
          clearInterval(bootInterval);
          if (elBar) elBar.style.width = '100%';
          if (elStatus) elStatus.innerHTML = `<span class="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Ready`;
          setTimeout(completeBootSequence, 180);
        } else {
          if (elBar) elBar.style.width = bootProgress + '%';
        }
      }, 160);
    }

    function progressBootImmediately() {
      if (bootFinished) return;
      bootProgress = 99;
    }

    function skipBootSequence(e) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      completeBootSequence(true);
    }

    function completeBootSequence(skipAnimation = false) {
      if (bootFinished) return;
      bootFinished = true;
      clearInterval(bootInterval);
      clearInterval(greetingCycleInterval);

      const bootEl = document.getElementById('bootScreen');
      if (bootEl) {
        if (skipAnimation) bootEl.style.transitionDuration = '0.2s';
        bootEl.classList.add('fade-out');
        setTimeout(() => {
          bootEl.style.display = 'none';
          bootEl.style.transitionDuration = '';
          focusLockInput();
        }, skipAnimation ? 100 : 320);
      }
    }

    // Key listener to advance boot immediately
    window.addEventListener('keydown', (e) => {
      if (!bootFinished) {
        completeBootSequence();
      }
    });

    // =========================================================================
    // macOS SONOMA LOCK SCREEN SYSTEM
    // =========================================================================
    let isScreenLocked = true;

    function updateLockScreenTime() {
      const now = new Date();
      // 9:41 format
      let hours = now.getHours();
      let minutes = now.getMinutes();
      minutes = minutes < 10 ? '0' + minutes : minutes;
      const timeStr = `${hours % 12 || 12}:${minutes}`;

      const options = { weekday: 'long', month: 'long', day: 'numeric' };
      const dateStr = now.toLocaleDateString('en-US', options);

      const clockEl = document.getElementById('lockClock');
      const dateEl = document.getElementById('lockDate');
      if (clockEl) clockEl.textContent = timeStr;
      if (dateEl) dateEl.textContent = dateStr;
    }
    setInterval(updateLockScreenTime, 1000);
    updateLockScreenTime();

    function focusLockInput() {
      return;
    }

    function handleLockInputKey(e) {
      if (e.key === 'Enter') {
        attemptUnlock();
      }
    }

    function shakeLockScreen() {
      const container = document.getElementById('lockInputContainer');
      if (container) {
        container.classList.add('shake-animation');
        setTimeout(() => container.classList.remove('shake-animation'), 460);
      }
    }

    function attemptUnlock() {
      const lockOverlay = document.getElementById('lockScreen');

      // Authentic unlock animation: smooth zoom & dissolve into desktop
      if (lockOverlay) {
        lockOverlay.classList.add('unlocked');
        isScreenLocked = false;
        setTimeout(() => {
          lockOverlay.style.display = 'none';
          // trigger entrance animation for default active terminal
          const term = document.getElementById('terminalWindow');
          if (term && !term.classList.contains('hidden')) {
            term.classList.add('win-opening');
            setTimeout(() => term.classList.remove('win-opening'), 160);
          }
        }, 300);
      }
    }

    function lockDesktop() {
      closeAllDropdowns();
      const lockOverlay = document.getElementById('lockScreen');
      if (!lockOverlay) return;
      isScreenLocked = true;
      lockOverlay.style.display = 'flex';
      void lockOverlay.offsetWidth;
      lockOverlay.classList.remove('unlocked');
    }

    function sleepMac() {
      lockDesktop();
    }

    function rebootSequence() {
      const lockOverlay = document.getElementById('lockScreen');
      const bootEl = document.getElementById('bootScreen');
      if (lockOverlay) {
        lockOverlay.style.display = 'flex';
        lockOverlay.classList.remove('unlocked');
      }
      if (bootEl) {
        bootEl.style.display = 'flex';
        bootEl.classList.remove('fade-out');
        bootProgress = 0;
        bootFinished = false;
        startBootSequence();
      }
    }

    function shutdownMac() {
      if (confirm("Are you sure you want to shut down macOS Sonoma?")) {
        const bootEl = document.getElementById('bootScreen');
        const lockOverlay = document.getElementById('lockScreen');
        if (lockOverlay) lockOverlay.style.display = 'none';
        if (bootEl) {
          bootEl.style.display = 'flex';
          bootEl.classList.remove('fade-out');
          bootEl.innerHTML = '<div class="relative z-10 text-white/80 text-sm font-mono">System shut down. Reload this page to start macOS.</div>';
        }
      }
    }

    // Kick off boot on load
    window.addEventListener('DOMContentLoaded', () => {
      startBootSequence();
    });

    // =========================================================================
    // WINDOW LIFECYCLE MANAGEMENT (Open, Genie Minimize, Maximize, Close)
    // =========================================================================
    let topZIndex = 50;

    function bringToFront(id) {
      const win = document.getElementById(id);
      if (!win) return;
      topZIndex += 2;
      win.style.zIndex = topZIndex;

      // Update active app name on menu bar
      const appNameEl = document.getElementById('activeAppName');
      if (id === 'finderExplorerWindow' || id === 'finderWindow') {
        if (appNameEl) appNameEl.textContent = 'Finder';
      } else if (id === 'terminalWindow') {
        if (appNameEl) appNameEl.textContent = 'Terminal';
      }

      document.querySelectorAll('.mac-window').forEach(w => w.classList.remove('active-window'));
      win.classList.add('active-window');
    }

    function closeWindow(id) {
      const win = document.getElementById(id);
      if (!win) return;
      // Satisfying macOS close animation
      win.classList.add('win-closing');
      setTimeout(() => {
        win.classList.add('hidden');
        win.classList.remove('win-closing');
        // If Finder was closed, hide dock dot
        if (id === 'finderExplorerWindow') {
          const dot = document.getElementById('finderDockDot');
          if (dot) dot.style.opacity = '0.3';
        }
      }, 120);
    }

    function minimizeWindow(id) {
      const win = document.getElementById(id);
      if (!win) return;

      // Smooth macOS scale/genie down toward Dock
      win.classList.add('win-minimizing');
      setTimeout(() => {
        win.classList.add('hidden');
        win.classList.remove('win-minimizing');
        win.dataset.minimized = "true";
      }, 180);
    }

    function unminimizeWindow(id) {
      const win = document.getElementById(id);
      if (!win) return;

      win.classList.remove('hidden');
      win.classList.add('win-unminimizing');
      delete win.dataset.minimized;
      bringToFront(id);

      setTimeout(() => {
        win.classList.remove('win-unminimizing');
      }, 180);
    }

    function handleDockClick(appType, windowId, event) {
      const dockItem = event ? event.currentTarget : null;
      if (dockItem) bounceDockItem(dockItem);

      const win = document.getElementById(windowId);
      if (!win) return;

      if (win.dataset.minimized === "true") {
        unminimizeWindow(windowId);
      } else if (win.classList.contains('hidden')) {
        openAppWithLifecycle(windowId);
      } else {
        // Toggle minimize if active and clicked again
        if (win.classList.contains('active-window')) {
          minimizeWindow(windowId);
        } else {
          bringToFront(windowId);
        }
      }
    }

    function openAppWithLifecycle(id) {
      const win = document.getElementById(id);
      if (!win) return;

      win.classList.remove('hidden');
      win.classList.add('win-opening');
      bringToFront(id);

      setTimeout(() => {
        win.classList.remove('win-opening');
      }, 160);

      if (id === 'finderExplorerWindow') {
        const dot = document.getElementById('finderDockDot');
        if (dot) dot.style.opacity = '1';
        renderFinderFiles();
      }
    }

    const windowMaxStates = {};
    function maximizeWindow(id) {
      const win = document.getElementById(id);
      if (!win) return;
      bringToFront(id);

      if (id === 'systemAppWindow' && !document.fullscreenElement && win.requestFullscreen) {
        win.requestFullscreen().catch(() => {});
      }

      if (!windowMaxStates[id]) {
        // Save initial geometry
        windowMaxStates[id] = {
          top: win.style.top || '12%',
          left: win.style.left || '15%',
          width: win.style.width || (id === 'terminalWindow' ? '680px' : '760px'),
          height: win.style.height || (id === 'terminalWindow' ? '440px' : '480px'),
          borderRadius: win.style.borderRadius || '12px'
        };
        win.style.top = '28px';
        win.style.left = '0';
        win.style.width = '100vw';
        win.style.height = 'calc(100vh - 86px)';
        win.style.borderRadius = '0px';
      } else {
        const st = windowMaxStates[id];
        win.style.top = st.top;
        win.style.left = st.left;
        win.style.width = st.width;
        win.style.height = st.height;
        win.style.borderRadius = st.borderRadius;
        delete windowMaxStates[id];
      }
    }

    document.addEventListener('fullscreenchange', () => {
      const win = document.getElementById('systemAppWindow');
      renderSystemAppTabs();
      if (!document.fullscreenElement && win && windowMaxStates.systemAppWindow) {
        const state = windowMaxStates.systemAppWindow;
        win.style.top = state.top;
        win.style.left = state.left;
        win.style.width = state.width;
        win.style.height = state.height;
        win.style.borderRadius = state.borderRadius;
        delete windowMaxStates.systemAppWindow;
      }
    });

    function minimizeActiveWindow() {
      const active = document.querySelector('.mac-window.active-window:not(.hidden)');
      if (active) minimizeWindow(active.id);
    }

    function maximizeActiveWindow() {
      const active = document.querySelector('.mac-window.active-window:not(.hidden)');
      if (active) maximizeWindow(active.id);
    }

    function openFinderWindow(e) {
      if (e) e.stopPropagation();
      closeAllDropdowns();
      openAppWithLifecycle('finderExplorerWindow');
    }

    function openAboutModal(e) {
      if (e) e.stopPropagation();
      closeAllDropdowns();
      openAppWithLifecycle('finderWindow');
    }

    function toggleApp(id) {
      const win = document.getElementById(id);
      if (!win) return;
      if (win.classList.contains('hidden') || win.dataset.minimized === "true") {
        if (win.dataset.minimized === "true") {
          unminimizeWindow(id);
        } else {
          openAppWithLifecycle(id);
        }
      } else {
        bringToFront(id);
      }
    }

    // =========================================================================
    // PHYSICS-SMOOTH PARABOLIC DOCK MAGNIFICATION
    // =========================================================================
    const dock = document.getElementById('macosDock');
    const dockItems = document.querySelectorAll('.dock-item');
    const MAX_SCALE = 1.38;
    const NEIGHBOR_SCALE = 1.18;
    const EFFECT_RADIUS = 120; // px distance influence

    if (dock) {
      dock.addEventListener('mousemove', (e) => {
        const mouseX = e.clientX;
        dockItems.forEach(item => {
          const rect = item.getBoundingClientRect();
          const itemCenterX = rect.left + rect.width / 2;
          const distance = Math.abs(mouseX - itemCenterX);

          if (distance < EFFECT_RADIUS) {
            // Parabolic smooth curve
            const ratio = 1 - (distance / EFFECT_RADIUS);
            const scale = 1 + (MAX_SCALE - 1) * Math.sin(ratio * (Math.PI / 2));
            const translateY = -12 * ratio;
            item.style.transform = `scale(${scale}) translateY(${translateY}px)`;
          } else {
            item.style.transform = 'scale(1) translateY(0)';
          }
        });
      });

      dock.addEventListener('mouseleave', () => {
        dockItems.forEach(item => {
          item.style.transform = 'scale(1) translateY(0)';
        });
      });
    }

    function bounceDockItem(el) {
      el.classList.add('bouncing');
      setTimeout(() => {
        el.classList.remove('bouncing');
      }, 500);
    }

    function openSafariDemo(el) {
      bounceDockItem(el);
      const hist = document.getElementById('commandHistory');
      if (hist) {
        const item = document.createElement('div');
        item.className = 'text-cyan-300 text-[12px] my-1';
        item.innerHTML = `🌐 Safari opened: <a href="https://apple.com" target="_blank" class="underline text-blue-400">apple.com</a> (Liquid Web preview)`;
        hist.appendChild(item);
      }
    }

    const appWindowTemplates = {
      launchpad: ['Launchpad', '<div class="grid grid-cols-4 gap-4 text-center text-xs"><button class="p-4 rounded-xl bg-white/10 hover:bg-white/20" onclick="openFinderWindow()"><i class="fa-solid fa-folder-open text-2xl mb-2"></i><br>Finder</button><button class="p-4 rounded-xl bg-white/10 hover:bg-white/20" onclick="toggleApp(\'terminalWindow\')"><i class="fa-solid fa-terminal text-2xl mb-2"></i><br>Terminal</button><button class="p-4 rounded-xl bg-white/10 hover:bg-white/20" onclick="openRealApp(\'portfolio\')"><i class="fa-solid fa-id-card text-2xl mb-2"></i><br>Portfolio</button><button class="p-4 rounded-xl bg-white/10 hover:bg-white/20" onclick="openRealApp(\'contact\')"><i class="fa-solid fa-address-book text-2xl mb-2"></i><br>Contact</button><button class="p-4 rounded-xl bg-white/10 hover:bg-white/20" onclick="openRealApp(\'settings\')"><i class="fa-solid fa-gear text-2xl mb-2"></i><br>Settings</button><button class="p-4 rounded-xl bg-white/10 hover:bg-white/20" onclick="openRealApp(\'calendar\')"><i class="fa-solid fa-calendar text-2xl mb-2"></i><br>Calendar</button></div>'],
      portfolio: ['Portfolio', '<div class="space-y-5"><div><p class="text-cyan-300 text-xs uppercase tracking-[0.25em]">Pamarthi Avinash</p><h1 class="text-3xl font-semibold mt-2">Fullstack Engineer · AI Enthusiast</h1><p class="text-white/65 mt-2 max-w-xl">I build responsive, thoughtful interfaces and practical products with modern web technologies.</p></div><div class="grid grid-cols-2 gap-3"><div class="p-4 rounded-xl bg-white/10"><h2 class="font-semibold">Projects</h2><p class="text-white/60 text-sm mt-1">Interactive Apple Web OS, portfolio systems, and AI-powered products.</p></div><div class="p-4 rounded-xl bg-white/10"><h2 class="font-semibold">Stack</h2><p class="text-white/60 text-sm mt-1">React, Next.js, TypeScript, TailwindCSS, Node.js, Python, GraphQL.</p></div></div><button class="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-400" onclick="openRealApp(\'contact\')">View Contact & Socials</button></div>'],
      contact: ['Contact & Socials', '<div class="space-y-4"><h1 class="text-2xl font-semibold">Let’s build something useful.</h1><a class="flex items-center gap-3 p-3 rounded-lg bg-white/10 hover:bg-white/20" href="mailto:avinashcreates@gmail.com"><i class="fa-solid fa-envelope text-red-300 w-5"></i><span>Email: avinashcreates@gmail.com</span></a><div class="grid grid-cols-2 gap-3"><a class="p-4 rounded-xl bg-white/10 hover:bg-white/20" href="https://github.com/avinashcreates" target="_blank" rel="noreferrer"><i class="fa-brands fa-github text-2xl"></i><span class="block mt-2 text-sm">GitHub</span></a><a class="p-4 rounded-xl bg-white/10 hover:bg-white/20" href="https://www.linkedin.com/in/avinashpamarthi" target="_blank" rel="noreferrer"><i class="fa-brands fa-linkedin text-2xl text-sky-300"></i><span class="block mt-2 text-sm">LinkedIn</span></a><a class="p-4 rounded-xl bg-white/10 hover:bg-white/20" href="https://www.instagram.com/avinashcreates" target="_blank" rel="noreferrer"><i class="fa-brands fa-instagram text-2xl text-pink-300"></i><span class="block mt-2 text-sm">Instagram</span></a><a class="p-4 rounded-xl bg-white/10 hover:bg-white/20" href="https://leetcode.com/avinashcreates" target="_blank" rel="noreferrer"><i class="fa-solid fa-code text-2xl text-amber-300"></i><span class="block mt-2 text-sm">LeetCode</span></a></div></div>'],
      calendar: ['Calendar', '<div class="flex flex-col h-full"><div class="flex items-center justify-between mb-4"><button class="px-3 py-1 rounded bg-white/10 hover:bg-white/20" onclick="changeCalendarMonth(-1)"><i class="fa-solid fa-chevron-left"></i></button><h2 class="text-lg" id="calendarMonthTitle"></h2><button class="px-3 py-1 rounded bg-white/10 hover:bg-white/20" onclick="changeCalendarMonth(1)"><i class="fa-solid fa-chevron-right"></i></button></div><div class="grid grid-cols-7 gap-1 text-center text-xs text-white/50 mb-1"><span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span></div><div class="grid grid-cols-7 gap-1 flex-1" id="calendarGrid"></div><button class="mt-4 self-end px-3 py-1.5 rounded bg-blue-500 hover:bg-blue-400 text-sm" onclick="addCalendarEvent()"><i class="fa-solid fa-plus mr-1"></i>Add Event</button></div>'],
      music: ['Music', '<div class="text-center"><i class="fa-solid fa-music text-6xl text-pink-400"></i><h2 class="text-xl mt-4">Browser Music Player</h2><p class="text-white/60 text-sm mt-2">Choose a local audio file to play it here.</p><input class="mt-5 text-xs" type="file" accept="audio/*" onchange="playLocalAudio(this)"><audio class="w-full mt-5" id="localAudio" controls></audio></div>'],
      settings: ['System Settings', '<div class="space-y-4"><section class="p-4 rounded-xl bg-white/10 border border-white/10"><div class="flex items-center gap-4"><img class="w-16 h-16 rounded-full object-cover border-2 border-white/30 shadow-lg" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCcwQS5EYygENpT9C3PAh1jSR4JBY5JMwpun6c7qmz2v2rXVo-iqSioh2qpqtP8B3qWre7UN8t-YD33-tbYL09SqetPcEwwV25ENn7xZHYDu0Z3R538Krca4WCHUH_kmcqXl7As535KkdsxUz53Hi7oOvq24nL8bleCqCsWOwbWEYNICzYgldbDIblt14WRlAWd0Fgg7aT8CbsGPNFCbNhqRJvsPjdFG2sn3Eztv6hxyTFiNhrtOV3K" alt="Pamarthi Avinash profile photo"><div><h2 class="text-xl font-semibold">Pamarthi Avinash</h2><p class="text-cyan-300 text-sm">Fullstack Engineer · AI Enthusiast</p><p class="text-white/55 text-xs mt-1">Vijayawada, India</p></div></div><div class="grid grid-cols-2 gap-2 mt-4 text-xs"><div class="p-2 rounded-lg bg-black/15"><span class="text-white/45 block">Email</span><span>avinashcreates@gmail.com</span></div><div class="p-2 rounded-lg bg-black/15"><span class="text-white/45 block">Focus</span><span>Web & AI products</span></div></div></section><div class="grid grid-cols-2 gap-3"><button class="p-3 rounded-lg bg-white/10 hover:bg-white/20 text-left" onclick="openRealApp(\'portfolio\')"><i class="fa-solid fa-id-card mr-2 text-cyan-300"></i>Portfolio</button><button class="p-3 rounded-lg bg-white/10 hover:bg-white/20 text-left" onclick="openRealApp(\'contact\')"><i class="fa-solid fa-address-book mr-2 text-pink-300"></i>Contact</button></div><div class="grid grid-cols-2 gap-3"><button class="p-3 rounded-lg bg-white/10 hover:bg-white/20 text-left" onclick="toggleWallpaperHue()"><i class="fa-solid fa-palette mr-2"></i>Change wallpaper</button><button class="p-3 rounded-lg bg-white/10 hover:bg-white/20 text-left" onclick="requestNotifications()"><i class="fa-solid fa-bell mr-2"></i>Notifications</button></div><div class="p-3 rounded-lg bg-white/10 text-sm text-white/70"><i class="fa-solid fa-circle-check text-emerald-300 mr-2"></i>Profile and desktop settings are saved in this browser.</div></div>'],
      trash: ['Trash', '<div class="text-center text-white/70"><i class="fa-solid fa-trash-can text-5xl mb-4"></i><p id="trashStatus">Trash is empty.</p><button class="mt-5 px-4 py-2 rounded-lg bg-red-500/70 hover:bg-red-500" onclick="clearBrowserTrash()">Empty Trash</button></div>']
    };
    const systemAppTabOrder = [];
    let activeSystemAppTab = '';

    function renderSystemAppTabs() {
      const tabs = document.getElementById('systemAppTabs');
      if (!tabs) return;
      tabs.style.display = document.fullscreenElement ? 'flex' : 'none';
      tabs.innerHTML = systemAppTabOrder.map(app => `<button class="px-2 py-1 rounded text-[10px] ${app === activeSystemAppTab ? 'bg-white/20 text-white' : 'text-white/50 hover:text-white'}" onclick="openRealApp('${app}')">${app[0].toUpperCase() + app.slice(1)}</button>`).join('');
    }

    function openRealApp(app, dockItem) {
      if (dockItem) bounceDockItem(dockItem);
      if (app === 'safari') {
        openSafariInWindow();
        return;
      }
      if (app === 'maps') {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;
            window.open(`https://www.google.com/maps/@${latitude},${longitude},15z`, '_blank', 'noopener,noreferrer');
          }, () => window.open('https://www.google.com/maps', '_blank', 'noopener,noreferrer'));
        } else window.open('https://www.google.com/maps', '_blank', 'noopener,noreferrer');
        return;
      }
      const template = appWindowTemplates[app];
      if (!template) return;
      if (!systemAppTabOrder.includes(app)) systemAppTabOrder.push(app);
      activeSystemAppTab = app;
      renderSystemAppTabs();
      const title = document.getElementById('systemAppTitle');
      const content = document.getElementById('systemAppContent');
      if (title) title.textContent = template[0];
      if (content) content.innerHTML = template[1];
      if (app === 'settings') ensureProfilePhotoControl(content);
      openAppWithLifecycle('systemAppWindow');
      renderSystemAppTabs();
      if (app === 'calendar') renderCalendar();
      if (app === 'trash') updateTrashStatus();
    }

    function ensureProfilePhotoControl(content) {
      const profilePhoto = content.querySelector('img[alt="Pamarthi Avinash profile photo"]');
      if (!profilePhoto || content.querySelector('#profilePhotoPicker')) return;
      profilePhoto.dataset.profilePhoto = 'true';
      const control = document.createElement('label');
      control.id = 'profilePhotoPicker';
      control.className = 'mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/80 hover:bg-blue-400 cursor-pointer text-xs';
      control.innerHTML = '<i class="fa-solid fa-camera"></i> Change profile photo<input class="hidden" type="file" accept="image/*">';
      control.querySelector('input').addEventListener('change', event => changeProfilePhoto(event.target));
      profilePhoto.closest('section').appendChild(control);
      applySavedProfilePhoto();
    }

    function changeProfilePhoto(input) {
      const file = input.files && input.files[0];
      if (!file || !file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = () => {
        localStorage.setItem('appleWebProfilePhoto', reader.result);
        applySavedProfilePhoto();
      };
      reader.readAsDataURL(file);
    }

    function applySavedProfilePhoto() {
      const savedPhoto = localStorage.getItem('appleWebProfilePhoto');
      if (!savedPhoto) return;
      document.querySelectorAll('[data-profile-photo="true"]').forEach(image => { image.src = savedPhoto; });
    }

    function updateRealCalendar() {
      const now = new Date();
      const day = document.getElementById('realCalendarDay');
      const date = document.getElementById('realCalendarDate');
      if (day) day.textContent = now.getDate();
      if (date) date.textContent = now.toLocaleDateString(undefined, { weekday: 'long', month: 'long', year: 'numeric' });
    }

    let calendarMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

    function renderCalendar() {
      const title = document.getElementById('calendarMonthTitle');
      const grid = document.getElementById('calendarGrid');
      if (!title || !grid) return;
      const year = calendarMonth.getFullYear();
      const month = calendarMonth.getMonth();
      title.textContent = calendarMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
      const firstDay = new Date(year, month, 1).getDay();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const today = new Date();
      const events = JSON.parse(localStorage.getItem('appleWebCalendarEvents') || '{}');
      grid.innerHTML = '';
      for (let i = 0; i < firstDay; i++) grid.insertAdjacentHTML('beforeend', '<span></span>');
      for (let day = 1; day <= daysInMonth; day++) {
        const key = `${year}-${month + 1}-${day}`;
        const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
        const event = events[key];
        grid.insertAdjacentHTML('beforeend', `<button class="min-h-10 rounded-lg ${isToday ? 'bg-blue-500 text-white' : 'bg-white/5 hover:bg-white/15'} text-sm relative" onclick="addCalendarEvent(${day})">${day}${event ? '<span class="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-amber-300"></span>' : ''}</button>`);
      }
    }

    function changeCalendarMonth(offset) {
      calendarMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + offset, 1);
      renderCalendar();
    }

    function addCalendarEvent(day = new Date().getDate()) {
      const eventName = prompt('Event name:');
      if (!eventName) return;
      const key = `${calendarMonth.getFullYear()}-${calendarMonth.getMonth() + 1}-${day}`;
      const events = JSON.parse(localStorage.getItem('appleWebCalendarEvents') || '{}');
      events[key] = eventName;
      localStorage.setItem('appleWebCalendarEvents', JSON.stringify(events));
      renderCalendar();
    }

    function playLocalAudio(input) {
      const audio = document.getElementById('localAudio');
      if (audio && input.files[0]) {
        audio.src = URL.createObjectURL(input.files[0]);
        audio.volume = Number(localStorage.getItem('appleWebVolume') || 0.75);
      }
    }

    function setDisplayBrightness(value) {
      const brightness = Math.max(0.3, Number(value) / 100);
      document.body.style.filter = `brightness(${brightness})`;
      localStorage.setItem('appleWebBrightness', value);
    }

    function setPageVolume(value) {
      const volume = Math.max(0, Math.min(1, Number(value) / 100));
      document.querySelectorAll('audio, video').forEach(media => { media.volume = volume; });
      localStorage.setItem('appleWebVolume', volume.toString());
    }

    function openSafariInWindow() {
      const title = document.getElementById('systemAppTitle');
      const content = document.getElementById('systemAppContent');
      if (title) title.textContent = 'Safari';
      if (!systemAppTabOrder.includes('safari')) systemAppTabOrder.push('safari');
      activeSystemAppTab = 'safari';
      renderSystemAppTabs();
      if (content) content.innerHTML = `<div class="flex flex-col h-full gap-3">
        <div class="flex items-center gap-2">
          <button class="px-2 py-1 rounded bg-white/10 hover:bg-white/20" onclick="navigateSafari(-1)"><i class="fa-solid fa-chevron-left"></i></button>
          <button class="px-2 py-1 rounded bg-white/10 hover:bg-white/20" onclick="navigateSafari(1)"><i class="fa-solid fa-chevron-right"></i></button>
          <form class="flex-1 flex gap-2" onsubmit="navigateSafariTo(event)">
            <input id="safariAddress" class="flex-1 bg-black/30 border border-white/15 rounded px-3 py-1 text-sm text-white" value="https://www.apple.com" aria-label="Safari address">
            <button class="px-3 rounded bg-blue-500 hover:bg-blue-400 text-white" type="submit"><i class="fa-solid fa-arrow-right"></i></button>
          </form>
          <button class="px-2 py-1 rounded bg-white/10 hover:bg-white/20" onclick="window.open(document.getElementById('safariAddress').value, '_blank', 'noopener,noreferrer')" title="Open externally"><i class="fa-solid fa-arrow-up-right-from-square"></i></button>
        </div>
        <div class="flex-1 rounded-lg overflow-hidden bg-white"><iframe id="safariFrame" class="w-full h-full border-0" title="Safari browser content" srcdoc="<main style='font:16px system-ui;padding:48px;color:#1f2937;text-align:center'><h1>Safari</h1><p>Enter a web address above.</p></main>"></iframe></div>
      </div>`;
      openAppWithLifecycle('systemAppWindow');
    }

    function navigateSafariTo(event) {
      event.preventDefault();
      const address = document.getElementById('safariAddress');
      const frame = document.getElementById('safariFrame');
      if (!address || !frame) return;
      let url = address.value.trim();
      if (!url.startsWith('http://') && !url.startsWith('https://')) url = `https://${url}`;
      address.value = url;
      frame.srcdoc = `<main style="font:16px system-ui;padding:48px;color:#1f2937;text-align:center"><h1>Safari</h1><p>This page cannot be embedded by the destination website.</p><p><a href="${url}" target="_blank" rel="noreferrer">Open ${url} in a browser tab</a></p></main>`;
    }

    function navigateSafari(direction) {
      const frame = document.getElementById('safariFrame');
      if (!frame || !frame.contentWindow) return;
      direction < 0 ? frame.contentWindow.history.back() : frame.contentWindow.history.forward();
    }

    function requestNotifications() {
      if ('Notification' in window) Notification.requestPermission();
    }

    function updateTrashStatus() {
      const status = document.getElementById('trashStatus');
      if (status) status.textContent = JSON.parse(localStorage.getItem('appleWebTrash') || '[]').length + ' item(s) in browser trash.';
    }

    function clearBrowserTrash() {
      localStorage.removeItem('appleWebTrash');
      updateTrashStatus();
    }

    async function createBrowserFile(kind = 'file') {
      const name = prompt(`Name the new ${kind}:`, kind === 'folder' ? 'New Folder' : 'New File.txt');
      if (!name) return;
      if (kind === 'folder' && window.showDirectoryPicker) {
        try {
          const directory = await window.showDirectoryPicker({ mode: 'readwrite' });
          await directory.getDirectoryHandle(name, { create: true });
          alert(`Created folder ${name}`);
          return;
        } catch (error) {
          if (error.name === 'AbortError') return;
        }
      }
      if (window.showSaveFilePicker && kind !== 'folder') {
        const handle = await window.showSaveFilePicker({ suggestedName: name });
        const writable = await handle.createWritable();
        await writable.write('Created from Apple Web OS.');
        await writable.close();
        alert(`Created ${name}`);
        return;
      }
      const blob = new Blob([kind === 'folder' ? `Browser folder placeholder: ${name}` : 'Created from Apple Web OS.'], { type: 'text/plain' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = kind === 'folder' ? `${name}.folder.txt` : name;
      link.click();
      URL.revokeObjectURL(link.href);
    }

    async function chooseLocalDirectory() {
      try {
        if (window.showDirectoryPicker) {
          const directory = await window.showDirectoryPicker({ mode: 'readwrite' });
          const files = [];
          for await (const [name, handle] of directory.entries()) {
            if (handle.kind === 'file') {
              const file = await handle.getFile();
              files.push({ id: `local-${name}`, name, icon: 'fa-file', color: 'text-slate-300', size: formatFileSize(file.size), modified: new Date(file.lastModified).toLocaleString() });
            } else {
              files.push({ id: `local-${name}`, name, icon: 'fa-folder', color: 'text-sky-400', size: 'Folder', modified: 'Local directory' });
            }
          }
          FINDER_CATEGORIES.desktop = files;
          currentCategory = 'desktop';
          openFinderWindow();
          renderFinderFiles();
          return;
        }
      } catch (error) {
        if (error.name === 'AbortError') return;
      }
      const input = document.createElement('input');
      input.type = 'file';
      input.webkitdirectory = true;
      input.multiple = true;
      input.onchange = () => {
        FINDER_CATEGORIES.desktop = Array.from(input.files).map(file => ({ id: `local-${file.name}`, name: file.name, icon: 'fa-file', color: 'text-slate-300', size: formatFileSize(file.size), modified: new Date(file.lastModified).toLocaleString() }));
        openFinderWindow();
        renderFinderFiles();
      };
      input.click();
    }

    function formatFileSize(bytes) {
      if (bytes < 1024) return `${bytes} B`;
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }

    function updateBrowserNetworkStatus() {
      const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      const online = navigator.onLine;
      const detail = connection ? `${connection.effectiveType || 'unknown'}${connection.downlink ? ` · ${connection.downlink} Mbps` : ''}` : 'Browser network API';
      const network = document.querySelector('#wifiNetworkContent .text-\\[10px\\]');
      if (network) network.textContent = `${online ? 'Online' : 'Offline'} · ${detail}`;
    }

    window.addEventListener('online', updateBrowserNetworkStatus);
    window.addEventListener('offline', updateBrowserNetworkStatus);
    if (navigator.connection) navigator.connection.addEventListener('change', updateBrowserNetworkStatus);
    updateBrowserNetworkStatus();

    // =========================================================================
    // TOP MENU BAR & DROPDOWN MANAGEMENT
    // =========================================================================
    let openMenuId = null;

    function toggleMenu(e, menuId) {
      e.stopPropagation();
      const menu = document.getElementById(menuId);
      const isVisible = menu.style.display === 'block';
      closeAllDropdowns();
      if (!isVisible) {
        menu.style.display = 'block';
        openMenuId = menuId;
        const parentItem = menu.closest('.menu-item');
        if (parentItem) parentItem.classList.add('active');
      }
    }

    function closeAllDropdowns(e) {
      document.querySelectorAll('.mac-menu-dropdown').forEach(m => m.style.display = 'none');
      document.querySelectorAll('.menu-item').forEach(m => m.classList.remove('active'));
      openMenuId = null;

      if (!e || (!e.target.closest('#wifiPopover') && !e.target.closest('#wifiMenuBtn'))) {
        const wp = document.getElementById('wifiPopover');
        if (wp) wp.style.display = 'none';
      }
      if (!e || (!e.target.closest('#controlCenterPopover') && !e.target.closest('#controlCenterBtn'))) {
        const cp = document.getElementById('controlCenterPopover');
        if (cp) cp.style.display = 'none';
      }
    }

    function toggleWifiPopover(e) {
      if (e) e.stopPropagation();
      closeAllDropdowns();
      const pop = document.getElementById('wifiPopover');
      pop.style.display = pop.style.display === 'block' ? 'none' : 'block';
    }

    function toggleControlCenter(e) {
      if (e) e.stopPropagation();
      closeAllDropdowns();
      const pop = document.getElementById('controlCenterPopover');
      pop.style.display = pop.style.display === 'block' ? 'none' : 'block';
    }

    function toggleWifiPower(checkbox) {
      const content = document.getElementById('wifiNetworkContent');
      const wifiIcon = document.querySelector('#wifiMenuBtn i');
      if (!checkbox.checked) {
        content.style.opacity = '0.3';
        content.style.pointerEvents = 'none';
        wifiIcon.className = 'fa-solid fa-wifi text-[12px] text-white/30';
      } else {
        content.style.opacity = '1';
        content.style.pointerEvents = 'auto';
        wifiIcon.className = 'fa-solid fa-wifi text-[12px] wifi-anim-pulse text-emerald-300';
      }
    }

    function scanWifiNetworks() {
      const icon = document.getElementById('wifiRefreshIcon');
      if (icon) icon.classList.add('fa-spin');
      setTimeout(() => {
        if (icon) icon.classList.remove('fa-spin');
      }, 1000);
    }

    function switchNetwork(name) {
      const current = document.getElementById('currentWifiSsid');
      if (current) current.textContent = name;
      alert(`Connected to ${name}`);
    }

    function toggleBluetoothState(el) {
      const stateEl = document.getElementById('btState');
      const icon = document.getElementById('btIcon');
      if (stateEl.textContent === 'AirPods Pro') {
        stateEl.textContent = 'Disconnected';
        icon.className = 'w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white';
      } else {
        stateEl.textContent = 'AirPods Pro';
        icon.className = 'w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white';
      }
    }

    // =========================================================================
    // SPOTLIGHT SEARCH OVERLAY
    // =========================================================================
    function toggleSpotlight(e) {
      if (e) e.stopPropagation();
      closeAllDropdowns();
      const overlay = document.getElementById('spotlightOverlay');
      const input = document.getElementById('spotlightInput');
      if (overlay.style.display === 'flex') {
        overlay.style.display = 'none';
      } else {
        overlay.style.display = 'flex';
        input.value = '';
        input.focus();
        handleSpotlightSearch('');
      }
    }

    function closeSpotlight(e) {
      const overlay = document.getElementById('spotlightOverlay');
      overlay.style.display = 'none';
    }

    window.addEventListener('keydown', (e) => {
      if (isScreenLocked) return;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        toggleSpotlight();
      }
      if (e.key === 'Escape') {
        const overlay = document.getElementById('spotlightOverlay');
        if (overlay && overlay.style.display === 'flex') {
          overlay.style.display = 'none';
        }
        closeAllDropdowns();
      }
    });

    const SPOTLIGHT_DATABASE = [
      { name: 'Terminal', type: 'Application', desc: 'macOS Command Line Shell', action: 'terminal', icon: 'fa-terminal', color: 'bg-zinc-800' },
      { name: 'Finder', type: 'Application', desc: 'Desktop File Explorer & Drives', action: 'finder', icon: 'fa-folder-open', color: 'bg-blue-600' },
      { name: 'Safari', type: 'Application', desc: 'Fast, secure web browsing', action: 'safari', icon: 'fa-compass', color: 'bg-sky-500' },
      { name: 'Change Wallpaper Hue', type: 'Action', desc: 'Shift dynamic Sonoma ambient colors', action: 'theme', icon: 'fa-palette', color: 'bg-amber-500' },
      { name: 'Lock Screen', type: 'System', desc: 'Lock macOS and protect desktop', action: 'lock', icon: 'fa-lock', color: 'bg-indigo-600' },
      { name: 'About This Mac', type: 'System Info', desc: 'View Apple Silicon M3 specs', action: 'about', icon: 'fa-apple', color: 'bg-slate-700' }
    ];

    function handleSpotlightSearch(query) {
      const q = query.trim().toLowerCase();
      const container = document.getElementById('spotlightResults');
      if (!container) return;

      if (!q) {
        container.innerHTML = `
          <div class="text-[11px] font-semibold text-white/40 uppercase tracking-wider px-3 py-1.5">Top Hits & Applications</div>
          ${renderSpotItems(SPOTLIGHT_DATABASE)}
        `;
        return;
      }

      const filtered = SPOTLIGHT_DATABASE.filter(item => 
        item.name.toLowerCase().includes(q) || item.desc.toLowerCase().includes(q) || item.type.toLowerCase().includes(q)
      );

      if (filtered.length === 0) {
        container.innerHTML = `
          <div class="p-6 text-center text-white/50 text-sm">
            No results for "${query}". Try searching "Terminal", "Finder", or "Lock".
          </div>
        `;
      } else {
        container.innerHTML = `
          <div class="text-[11px] font-semibold text-white/40 uppercase tracking-wider px-3 py-1.5">Search Results (${filtered.length})</div>
          ${renderSpotItems(filtered)}
        `;
      }
    }

    function renderSpotItems(items) {
      return items.map(item => `
        <div class="spot-item flex items-center justify-between p-2 rounded-lg hover:bg-blue-600/80 cursor-pointer group transition" onclick="spotlightLaunch('${item.action}')">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg ${item.color} flex items-center justify-center text-white text-sm">
              <i class="fa-solid ${item.icon}"></i>
            </div>
            <div>
              <div class="text-sm font-medium text-white group-hover:text-white">${item.name}</div>
              <div class="text-[11px] text-white/50 group-hover:text-white/80">${item.desc}</div>
            </div>
          </div>
          <span class="text-xs text-white/40 group-hover:text-white/90">${item.type}</span>
        </div>
      `).join('');
    }

    function spotlightLaunch(action) {
      closeSpotlight();
      if (action === 'terminal') {
        toggleApp('terminalWindow');
      } else if (action === 'finder') {
        openFinderWindow();
      } else if (action === 'safari') {
        openRealApp('safari', document.querySelector('[data-app="safari"]'));
      } else if (action === 'theme') {
        toggleWallpaperHue();
      } else if (action === 'lock') {
        lockDesktop();
      } else if (action === 'about') {
        openAboutModal();
      }
    }

    // Dynamic Wallpaper Hue Switcher
    function toggleWallpaperHue() {
      const wp = document.querySelector('.wallpaper');
      const mesh = document.querySelector('.wallpaper-mesh');
      if (!wp) return;
      const current = wp.style.filter;
      if (!current || current === 'none') {
        wp.style.filter = 'hue-rotate(120deg) saturate(130%)';
        if (mesh) mesh.style.filter = 'blur(40px) hue-rotate(120deg)';
      } else if (current.includes('120deg')) {
        wp.style.filter = 'hue-rotate(240deg) saturate(120%)';
        if (mesh) mesh.style.filter = 'blur(40px) hue-rotate(240deg)';
      } else {
        wp.style.filter = 'none';
        if (mesh) mesh.style.filter = 'blur(40px)';
      }
    }

    // =========================================================================
    // FINDER FILE EXPLORER
    // =========================================================================
    const FINDER_CATEGORIES = {
      desktop: [
        { id: 1, name: 'Project_Sonoma.zip', icon: 'fa-file-zipper', color: 'text-amber-400', size: '24.8 MB', modified: 'Today at 9:15 AM' },
        { id: 2, name: 'Design_System.fig', icon: 'fa-file-code', color: 'text-pink-400', size: '12.4 MB', modified: 'Yesterday' },
        { id: 3, name: 'Screenshots', icon: 'fa-folder', color: 'text-sky-400', size: '8 items', modified: 'Sep 10, 2024' },
        { id: 4, name: 'Resume_2025.pdf', icon: 'fa-file-pdf', color: 'text-rose-400', size: '1.2 MB', modified: 'Sep 8, 2024' },
        { id: 5, name: 'Wallpapers_4K', icon: 'fa-folder', color: 'text-sky-400', size: '14 items', modified: 'Aug 28, 2024' },
        { id: 6, name: 'Notes.txt', icon: 'fa-file-lines', color: 'text-slate-300', size: '4 KB', modified: 'Today at 8:30 AM' }
      ],
      documents: [
        { id: 10, name: 'Architecture_Plan.docx', icon: 'fa-file-word', color: 'text-blue-400', size: '3.4 MB', modified: 'Sep 01, 2024' },
        { id: 11, name: 'Financial_Q3.xlsx', icon: 'fa-file-excel', color: 'text-emerald-400', size: '820 KB', modified: 'Aug 29, 2024' },
        { id: 12, name: 'Client_Agreements', icon: 'fa-folder', color: 'text-sky-400', size: '5 items', modified: 'Aug 14, 2024' },
        { id: 13, name: 'API_Specs.json', icon: 'fa-file-lines', color: 'text-amber-300', size: '45 KB', modified: 'Yesterday' }
      ],
      downloads: [
        { id: 20, name: 'Node-v20.11-arm64.pkg', icon: 'fa-box-archive', color: 'text-green-400', size: '42.1 MB', modified: 'Today at 9:02 AM' },
        { id: 21, name: 'Xcode_15_Beta.dmg', icon: 'fa-compact-disc', color: 'text-slate-400', size: '3.1 GB', modified: 'Sep 05, 2024' },
        { id: 22, name: 'Sonoma_Dynamic_Mesh.png', icon: 'fa-file-image', color: 'text-purple-400', size: '8.7 MB', modified: 'Sep 03, 2024' }
      ],
      applications: [
        { id: 30, name: 'Visual Studio Code.app', icon: 'fa-code', color: 'text-sky-400', size: '340 MB', modified: 'Sep 02, 2024' },
        { id: 31, name: 'Figma.app', icon: 'fa-pen-nib', color: 'text-orange-400', size: '180 MB', modified: 'Aug 22, 2024' },
        { id: 32, name: 'Slack.app', icon: 'fa-hashtag', color: 'text-pink-400', size: '210 MB', modified: 'Yesterday' },
        { id: 33, name: 'Docker.app', icon: 'fa-cube', color: 'text-blue-500', size: '1.4 GB', modified: 'Sep 04, 2024' }
      ],
      airdrop: [
        { id: 40, name: 'Searching nearby devices...', icon: 'fa-satellite-dish', color: 'text-blue-400 animate-pulse', size: 'AirDrop Ready', modified: 'Everyone' }
      ],
      recents: [
        { id: 50, name: 'Resume_2025.pdf', icon: 'fa-file-pdf', color: 'text-rose-400', size: '1.2 MB', modified: 'Today at 9:38 AM' },
        { id: 51, name: 'Project_Sonoma.zip', icon: 'fa-file-zipper', color: 'text-amber-400', size: '24.8 MB', modified: 'Today at 9:15 AM' },
        { id: 52, name: 'Notes.txt', icon: 'fa-file-lines', color: 'text-slate-300', size: '4 KB', modified: 'Today at 8:30 AM' }
      ],
      icloud: [
        { id: 60, name: 'Keynote_Keynotes_2024', icon: 'fa-folder', color: 'text-sky-400', size: '3 items', modified: 'Sep 09, 2024' },
        { id: 61, name: 'Personal_Vault.enc', icon: 'fa-lock', color: 'text-emerald-400', size: '12 MB', modified: 'Aug 20, 2024' }
      ]
    };

    let currentCategory = 'desktop';
    let finderHistory = ['desktop'];
    let historyIdx = 0;
    let finderCurrentView = 'icons';

    function renderFinderFiles(filesToRender) {
      const container = document.getElementById('filesContainer');
      const files = filesToRender || FINDER_CATEGORIES[currentCategory] || [];
      
      const countEl = document.getElementById('itemCountLabel');
      if (countEl) countEl.textContent = `${files.length} item${files.length === 1 ? '' : 's'}`;

      if (finderCurrentView === 'icons') {
        container.innerHTML = `
          <div class="grid grid-cols-4 sm:grid-cols-5 gap-3" id="fileGrid">
            ${files.map(file => `
              <div class="finder-file-item" onclick="selectFinderFile(this, '${escapeHtml(file.name)}', '${file.size}', '${file.modified}')" ondblclick="openFinderItem('${escapeHtml(file.name)}')">
                <div class="w-12 h-12 rounded-xl flex items-center justify-center text-3xl mb-1.5 ${file.color}">
                  <i class="fa-solid ${file.icon}"></i>
                </div>
                <span class="text-xs text-white/90 break-all leading-tight max-w-[90px]">${file.name}</span>
              </div>
            `).join('')}
          </div>
        `;
      } else {
        container.innerHTML = `
          <div class="w-full text-xs">
            <div class="grid grid-cols-12 text-white/40 pb-2 border-b border-white/10 px-2 font-medium">
              <div class="col-span-6">Name</div>
              <div class="col-span-3">Date Modified</div>
              <div class="col-span-3 text-right">Size</div>
            </div>
            <div class="space-y-1 mt-1">
              ${files.map(file => `
                <div class="grid grid-cols-12 items-center px-2 py-1.5 rounded hover:bg-white/10 cursor-pointer" onclick="selectFinderFile(this, '${escapeHtml(file.name)}', '${file.size}', '${file.modified}')" ondblclick="openFinderItem('${escapeHtml(file.name)}')">
                  <div class="col-span-6 flex items-center gap-2">
                    <i class="fa-solid ${file.icon} ${file.color} text-sm w-4 text-center"></i>
                    <span class="text-white/90 truncate">${file.name}</span>
                  </div>
                  <div class="col-span-3 text-white/50">${file.modified}</div>
                  <div class="col-span-3 text-right text-white/50 font-mono">${file.size}</div>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      }
    }

    function selectFinderFile(el, name, size, modified) {
      document.querySelectorAll('.finder-file-item, .grid.cursor-pointer').forEach(item => item.classList.remove('selected', 'bg-blue-600/40'));
      el.classList.add('selected');
      const detailEl = document.getElementById('selectedFileDetail');
      if (detailEl) {
        detailEl.innerHTML = `Selected: <span class="text-white font-medium">${name}</span> (${size}) — Modified ${modified}`;
      }
    }

    function openFinderItem(name) {
      const hist = document.getElementById('commandHistory');
      if (hist) {
        const item = document.createElement('div');
        item.className = 'text-yellow-300 text-[12px] my-1';
        item.innerHTML = `📂 Opened file via Finder: <span class="underline">${name}</span>`;
        hist.appendChild(item);
      }
      alert(`Opening ${name}...`);
    }

    function navigateFinderCategory(cat) {
      if (!FINDER_CATEGORIES[cat]) return;
      currentCategory = cat;
      finderHistory.push(cat);
      historyIdx = finderHistory.length - 1;

      document.querySelectorAll('.finder-sidebar-item').forEach(item => item.classList.remove('active'));
      const activeSidebarItem = Array.from(document.querySelectorAll('.finder-sidebar-item')).find(item => 
        item.textContent.trim().toLowerCase().includes(cat.toLowerCase())
      );
      if (activeSidebarItem) activeSidebarItem.classList.add('active');

      const pathTitle = document.getElementById('finderPathTitle');
      const bcCurrent = document.getElementById('bcCurrent');
      const formatted = cat.charAt(0).toUpperCase() + cat.slice(1);
      if (pathTitle) pathTitle.textContent = formatted;
      if (bcCurrent) bcCurrent.textContent = formatted;

      renderFinderFiles();
    }

    function finderHistoryBack() {
      if (historyIdx > 0) {
        historyIdx--;
        currentCategory = finderHistory[historyIdx];
        renderFinderFiles();
      }
    }

    function finderHistoryForward() {
      if (historyIdx < finderHistory.length - 1) {
        historyIdx++;
        currentCategory = finderHistory[historyIdx];
        renderFinderFiles();
      }
    }

    function setFinderView(mode) {
      finderCurrentView = mode;
      const btnIcons = document.getElementById('viewBtnIcons');
      const btnList = document.getElementById('viewBtnList');
      if (mode === 'icons') {
        btnIcons.className = 'px-2 py-0.5 rounded text-white text-[11px] bg-white/20';
        btnList.className = 'px-2 py-0.5 rounded text-white/60 hover:text-white text-[11px]';
      } else {
        btnList.className = 'px-2 py-0.5 rounded text-white text-[11px] bg-white/20';
        btnIcons.className = 'px-2 py-0.5 rounded text-white/60 hover:text-white text-[11px]';
      }
      renderFinderFiles();
    }

    function filterFinderFiles(text) {
      const currentList = FINDER_CATEGORIES[currentCategory] || [];
      const q = text.toLowerCase().trim();
      if (!q) {
        renderFinderFiles(currentList);
        return;
      }
      const filtered = currentList.filter(f => f.name.toLowerCase().includes(q));
      renderFinderFiles(filtered);
    }

    function showHelpInTerminal() {
      toggleApp('terminalWindow');
      const hist = document.getElementById('commandHistory');
      if (hist) {
        const item = document.createElement('div');
        item.className = 'text-cyan-300 text-[12px] my-1';
        item.innerHTML = `ℹ️ macOS Sonoma Help Center: Click anywhere on desktop, try Spotlight (⌘+K), customize Wi-Fi from the top-right bar, test lock screen ( -> Lock Screen), or explore Finder folders!`;
        hist.appendChild(item);
      }
    }

    // Draggable Window Logic (Supports Terminal & Finder)
    dragElement(document.getElementById("terminalWindow"), document.getElementById("terminalHeader"));
    dragElement(document.getElementById("finderExplorerWindow"), document.getElementById("finderHeader"));
    dragElement(document.getElementById("finderWindow"), document.getElementById("finderAboutHeader"));
    dragElement(document.getElementById("systemAppWindow"), document.getElementById("systemAppHeader"));

    function dragElement(elmnt, headerEl) {
      if (!elmnt) return;
      let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
      const dragTrigger = headerEl || elmnt;
      dragTrigger.onmousedown = dragMouseDown;

      function dragMouseDown(e) {
        e = e || window.event;
        if (e.target.closest('.win-btn') || e.target.closest('input') || e.target.closest('button')) return;
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
        bringToFront(elmnt.id);
      }

      function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        elmnt.style.top = Math.max(28, (elmnt.offsetTop - pos2)) + "px";
        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
      }

      function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
      }
    }

    let altTabIndex = 0;
    function cycleWindows() {
      const windows = Array.from(document.querySelectorAll('.mac-window:not(.hidden)'));
      if (!windows.length) return;
      altTabIndex = (altTabIndex + 1) % windows.length;
      bringToFront(windows[altTabIndex].id);
    }

    window.addEventListener('keydown', event => {
      if (isScreenLocked) return;
      if (event.altKey && event.key === 'Tab') {
        event.preventDefault();
        cycleWindows();
      }
      if (event.ctrlKey && event.key === 'Tab' && document.fullscreenElement && systemAppTabOrder.length) {
        event.preventDefault();
        const index = systemAppTabOrder.indexOf(activeSystemAppTab);
        const next = systemAppTabOrder[(index + 1) % systemAppTabOrder.length];
        openRealApp(next);
      }
    });

    // Terminal Commands
    const termInput = document.getElementById('terminalInput');
    const commandHistory = document.getElementById('commandHistory');
    const termOutput = document.getElementById('termOutput');

    const COMMANDS = {
      help: `Available commands:
      • <span class="text-yellow-400">help</span>        Show this command list
      • <span class="text-cyan-400">description</span> Show portfolio summary
      • <span class="text-red-400">clear</span>       Clear terminal output
      • <span class="text-pink-400">aboutme</span>     About Pamarthi Avinash
      • <span class="text-amber-300">fontcolor</span>   Change terminal text color
      • <span class="text-emerald-400">background</span> Change desktop wallpaper mood
      • <span class="text-blue-400">echo</span>        Print a message
      • <span class="text-red-300">gmail</span>       Open contact email
      • <span class="text-sky-400">projects</span>    Show selected projects
      • <span class="text-purple-400">socials</span>     Show social links
      • <span class="text-green-400">portfolio</span>   Open portfolio window
      • <span class="text-white">exit</span>        Minimize Terminal`,
      description: `Pamarthi Avinash is a Fullstack Engineer and AI Enthusiast building responsive, thoughtful interfaces and practical products.`,
      aboutme: `Pamarthi Avinash
    Fullstack Engineer · AI Enthusiast · Innovator
    Building next-generation interfaces with React, TypeScript, Node.js and Python.`,
      whoami: `Pamarthi Avinash (@avinashcreates)
    Fullstack Engineer · AI Enthusiast · Innovator
    Location: Vijayawada, IN · Building responsive next-gen interfaces`,
      skills: `Frontend : React, Next.js, TypeScript, TailwindCSS, Three.js
Backend  : Node.js, Python, GraphQL, Express, Django
DevOps   : Docker, AWS, GitHub Actions, Vercel`,
      fontcolor: () => {
        const colors = ['#38bdf8', '#f9a8d4', '#86efac', '#fde68a', '#c4b5fd'];
        const next = colors[Math.floor(Math.random() * colors.length)];
        document.getElementById('termOutput').style.color = next;
        return `Terminal font color changed to ${next}`;
      },
      background: () => {
        toggleWallpaperHue();
        return 'Desktop background mood changed.';
      },
      echo: (message = '') => escapeHtml(message || 'Usage: echo your message'),
      gmail: () => {
        window.location.href = 'mailto:avinashcreates@gmail.com';
        return 'Opening avinashcreates@gmail.com';
      },
      projects: `Selected projects:
• Apple Web OS portfolio desktop
• Responsive fullstack interfaces
• AI-powered product experiments`,
      socials: `GitHub: https://github.com/avinashcreates
LinkedIn: https://www.linkedin.com/in/avinashpamarthi
Instagram: https://www.instagram.com/avinashcreates
LeetCode: https://leetcode.com/avinashcreates`,
      portfolio: () => {
        openRealApp('portfolio');
        return 'Opening portfolio...';
      },
      exit: () => {
        minimizeWindow('terminalWindow');
        return 'Terminal minimized.';
      },
      wifi: `Current Wi-Fi SSID: Apple_Park_5G_Campus
Signal Strength: -48 dBm (Excellent)
Channel: 36 (5 GHz, 80 MHz)
Security: WPA3-Personal
IP Address: 192.168.1.104
Router Gateway: 192.168.1.1`,
      lock: () => {
        lockDesktop();
        return `<span class="text-indigo-300">✓ System Locked</span>`;
      },
      finder: () => {
        openFinderWindow();
        return `<span class="text-emerald-300">✓ Launched Finder window successfully</span>`;
      },
      neofetch: `
   <span class="text-emerald-400">        .:'</span>       <span class="text-white font-bold">avi@sonoma-macbook-pro</span>
   <span class="text-emerald-400">    __ :'__</span>       ----------------------
<span class="text-green-500"> .\`  \` \`  \`'.</span>     <span class="text-yellow-400">OS:</span> macOS Sonoma 14.5
<span class="text-yellow-400">:          .</span>     <span class="text-yellow-400">Host:</span> MacBookPro18,1
<span class="text-orange-400">:          :</span>     <span class="text-yellow-400">Kernel:</span> Darwin 23.5.0
<span class="text-red-500"> :         :</span>     <span class="text-yellow-400">Uptime:</span> 365 days, 4 hours
<span class="text-purple-500">  \`.__.-.__.'</span>    <span class="text-yellow-400">Shell:</span> zsh 5.9
                 <span class="text-yellow-400">Terminal:</span> Apple_Terminal
                 <span class="text-yellow-400">CPU:</span> Apple M3 Max (16 core)`
    };

    termInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const val = termInput.value.trim();
        termInput.value = '';
        if (!val) return;

        const cmdLine = document.createElement('div');
        cmdLine.className = 'flex items-center gap-2 mt-2';
        cmdLine.innerHTML = `<span class="text-emerald-400 font-bold">➜</span> <span class="text-cyan-400 font-medium">~</span> <span class="text-white">${escapeHtml(val)}</span>`;
        commandHistory.appendChild(cmdLine);

        const parts = val.split(/\s+/);
        const lower = parts[0].toLowerCase();
        const commandArgs = parts.slice(1).join(' ');

        if (lower === 'clear') {
          commandHistory.innerHTML = '';
          return;
        }

        const outLine = document.createElement('div');
        outLine.className = 'text-gray-300 text-[12.5px] whitespace-pre-wrap mt-1';

        if (COMMANDS[lower]) {
          const res = typeof COMMANDS[lower] === 'function' ? COMMANDS[lower](commandArgs) : COMMANDS[lower];
          outLine.innerHTML = res;
        } else if (lower === 'theme') {
          toggleWallpaperHue();
          outLine.innerHTML = `<span class="text-emerald-300">✓ Swapped Sonoma dynamic wallpaper chromatic mood</span>`;
        } else {
          outLine.innerHTML = `<span class="text-red-400">zsh: command not found: ${escapeHtml(val)}</span>. Type '<span class="text-yellow-300">help</span>' for commands.`;
        }

        commandHistory.appendChild(outLine);
        termOutput.scrollTop = termOutput.scrollHeight;
      }
    });

    function escapeHtml(str) {
      return str.replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m]);
    }

    // Initialize default Finder file view
    renderFinderFiles();
    applySavedProfilePhoto();
    const savedBrightness = localStorage.getItem('appleWebBrightness');
    const savedVolume = localStorage.getItem('appleWebVolume');
    if (savedBrightness) {
      const brightnessControl = document.getElementById('brightnessControl');
      if (brightnessControl) brightnessControl.value = savedBrightness;
      setDisplayBrightness(savedBrightness);
    }
    if (savedVolume) {
      const volumeControl = document.getElementById('volumeControl');
      if (volumeControl) volumeControl.value = Number(savedVolume) * 100;
      setPageVolume(Number(savedVolume) * 100);
    }
