// --- APP STATE INITIALIZATION ---
let appState = {
  balance: 0.00,
  earnings: 0.00,
  watchedAds: [], // indexes of completed ads
  activeAdRedirects: {}, // indices of ads opened but not yet claimed
  userName: "Guest User",
  userEmail: "",
  lastDailyClaim: null,
  screenshotName: null,
  isDailyClaimed: false,
  nextMissionReset: null
};

// Load saved state from localStorage if available
function loadStateFromStorage() {
  const saved = localStorage.getItem("ads_cash_state");
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      appState = { ...appState, ...parsed };
    } catch (e) {
      console.error("Error loading localStorage state:", e);
    }
  }
}

// Save state to localStorage
function saveStateToStorage() {
  localStorage.setItem("ads_cash_state", JSON.stringify(appState));
}

// --- DYNAMIC INLINE SVG GENERATION FOR CARD THUMBNAILS ---
const cyberpunkThemes = [
  { name: "CORE_LINK", color1: "#06B6D4", color2: "#3B82F6", pattern: "grid" },
  { name: "QUANTUM_GRID", color1: "#8B5CF6", color2: "#EC4899", pattern: "waves" },
  { name: "NEON_STREAM", color1: "#10B981", color2: "#06B6D4", pattern: "bars" },
  { name: "CYBER_SEC", color1: "#EC4899", color2: "#F59E0B", pattern: "circle" },
  { name: "META_SHARDS", color1: "#3B82F6", color2: "#8B5CF6", pattern: "dots" },
  { name: "APEX_FEED", color1: "#EF4444", color2: "#EC4899", pattern: "grid" },
  { name: "ORBIT_MUX", color1: "#F59E0B", color2: "#10B981", pattern: "waves" },
  { name: "SYS_SYNC", color1: "#06B6D4", color2: "#8B5CF6", pattern: "bars" },
  { name: "HOLO_DATA", color1: "#8B5CF6", color2: "#3B82F6", pattern: "circle" },
  { name: "BLOCK_NET", color1: "#10B981", color2: "#EC4899", pattern: "dots" },
  { name: "AI_AGENT", color1: "#EF4444", color2: "#3B82F6", pattern: "grid" },
  { name: "VOID_SHELL", color1: "#EC4899", color2: "#8B5CF6", pattern: "waves" },
  { name: "BIT_CRUSH", color1: "#3B82F6", color2: "#10B981", pattern: "bars" },
  { name: "VORTEX_RX", color1: "#06B6D4", color2: "#EC4899", pattern: "circle" },
  { name: "SPARK_FLOW", color1: "#F59E0B", color2: "#EF4444", pattern: "dots" }
];

function generateCardThumbnail(index) {
  const theme = cyberpunkThemes[index % cyberpunkThemes.length];
  
  let patternSvg = "";
  if (theme.pattern === "grid") {
    patternSvg = `<path d="M 0,10 L 100,10 M 0,20 L 100,20 M 0,30 L 100,30 M 0,40 L 100,40 M 10,0 L 10,50 M 20,0 L 20,50 M 30,0 L 30,50 M 40,0 L 40,50" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="0.5"/>`;
  } else if (theme.pattern === "waves") {
    patternSvg = `<path d="M 0,25 Q 25,10 50,25 T 100,25 M 0,35 Q 25,20 50,35 T 100,35" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>`;
  } else if (theme.pattern === "bars") {
    patternSvg = `
      <rect x="10" y="15" width="6" height="20" rx="1" fill="${theme.color1}" opacity="0.2"/>
      <rect x="22" y="10" width="6" height="30" rx="1" fill="${theme.color1}" opacity="0.4"/>
      <rect x="34" y="20" width="6" height="15" rx="1" fill="${theme.color2}" opacity="0.6"/>
      <rect x="46" y="8" width="6" height="34" rx="1" fill="${theme.color2}" opacity="0.4"/>
      <rect x="58" y="25" width="6" height="10" rx="1" fill="${theme.color1}" opacity="0.3"/>
    `;
  } else if (theme.pattern === "circle") {
    patternSvg = `
      <circle cx="50" cy="25" r="18" fill="none" stroke="url(#grad-${index})" stroke-width="1.5" stroke-dasharray="5 3"/>
      <circle cx="50" cy="25" r="10" fill="none" stroke="${theme.color1}" stroke-width="0.75"/>
    `;
  } else {
    // dots pattern
    patternSvg = `
      <circle cx="15" cy="15" r="1.5" fill="${theme.color1}" opacity="0.7"/>
      <circle cx="35" cy="15" r="1.5" fill="${theme.color1}" opacity="0.4"/>
      <circle cx="55" cy="15" r="1.5" fill="${theme.color2}" opacity="0.4"/>
      <circle cx="75" cy="15" r="1.5" fill="${theme.color2}" opacity="0.7"/>
      <circle cx="15" cy="35" r="1.5" fill="${theme.color2}" opacity="0.5"/>
      <circle cx="35" cy="35" r="1.5" fill="${theme.color2}" opacity="0.8"/>
      <circle cx="55" cy="35" r="1.5" fill="${theme.color1}" opacity="0.8"/>
      <circle cx="75" cy="35" r="1.5" fill="${theme.color1}" opacity="0.5"/>
    `;
  }

  return `
    <svg viewBox="0 0 100 50" class="ad-thumb-svg" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad-${index}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${theme.color1}"/>
          <stop offset="100%" stop-color="${theme.color2}"/>
        </linearGradient>
        <filter id="glow-${index}">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      
      <!-- Background -->
      <rect width="100" height="50" fill="#111827"/>
      
      <!-- Tech circuit line backgrounds -->
      <path d="M 5,5 L 20,5 L 25,10 L 95,10 M 5,45 L 75,45 L 80,40 L 95,40" fill="none" stroke="rgba(255,255,255,0.03)" stroke-width="1"/>
      
      <!-- Patterns -->
      ${patternSvg}
      
      <!-- Foreground Design -->
      <g transform="translate(10, 15)">
        <text x="0" y="20" fill="#FFFFFF" font-family="'Poppins', sans-serif" font-size="6" font-weight="800" letter-spacing="1">${theme.name}</text>
        <text x="0" y="27" fill="${theme.color1}" font-family="'Poppins', sans-serif" font-size="4" font-weight="600" letter-spacing="0.5">EST_RPM: 18.25 USD</text>
      </g>
      
      <!-- Tech corners -->
      <rect x="4" y="4" width="4" height="4" fill="none" stroke="${theme.color1}" stroke-width="0.5"/>
      <rect x="92" y="42" width="4" height="4" fill="none" stroke="${theme.color2}" stroke-width="0.5"/>
      
      <!-- Main glowing indicator -->
      <circle cx="90" cy="12" r="2" fill="${theme.color1}" filter="url(#glow-${index})"/>
    </svg>
  `;
}

// --- FLOATING CANVAS PARTICLES ---
function initCanvasParticles() {
  const canvas = document.getElementById("particle-canvas");
  const ctx = canvas.getContext("2d");
  
  let particlesArray = [];
  const numberOfParticles = 40;
  
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  
  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();
  
  class Particle {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 2 + 1;
      this.speedX = Math.random() * 0.4 - 0.2;
      this.speedY = Math.random() * 0.4 - 0.2;
      this.color = Math.random() > 0.5 ? "rgba(6, 182, 212, 0.15)" : "rgba(139, 92, 246, 0.15)";
    }
    
    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      
      if (this.x > canvas.width || this.x < 0) this.speedX = -this.speedX;
      if (this.y > canvas.height || this.y < 0) this.speedY = -this.speedY;
    }
    
    draw() {
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  function init() {
    particlesArray = [];
    for (let i = 0; i < numberOfParticles; i++) {
      particlesArray.push(new Particle());
    }
  }
  
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    for (let i = 0; i < particlesArray.length; i++) {
      particlesArray[i].update();
      particlesArray[i].draw();
      
      // Draw lines between particles that are close
      for (let j = i; j < particlesArray.length; j++) {
        const dx = particlesArray[i].x - particlesArray[j].x;
        const dy = particlesArray[i].y - particlesArray[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 120) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(6, 182, 212, ${0.05 * (1 - distance / 120)})`;
          ctx.lineWidth = 0.5;
          ctx.moveTo(particlesArray[i].x, particlesArray[i].y);
          ctx.lineTo(particlesArray[j].x, particlesArray[j].y);
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(animate);
  }
  
  init();
  animate();
}

// --- DYNAMIC TICK-UP / TICK-DOWN COUNTER ANIMATOR ---
function animateValue(elementId, start, end, duration, isCurrency = true) {
  const obj = document.getElementById(elementId);
  if (!obj) return;
  
  if (start === end) {
    obj.innerHTML = isCurrency ? `$${end.toFixed(2)}` : end;
    return;
  }
  
  const range = end - start;
  let current = start;
  const increment = range / (duration / 16); // ~60fps
  
  const timer = setInterval(() => {
    current += increment;
    
    if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
      current = end;
      clearInterval(timer);
    }
    
    obj.innerHTML = isCurrency ? `$${current.toFixed(2)}` : Math.floor(current);
  }, 16);
}

// --- TOAST NOTIFICATIONS ---
function showToast(title, message, iconClass = "fa-solid fa-circle-info") {
  const container = document.body;
  
  // Remove existing toast if present to avoid screen clutter
  const existing = document.querySelector(".notification-toast");
  if (existing) {
    existing.remove();
  }
  
  const toast = document.createElement("div");
  toast.className = "notification-toast";
  toast.innerHTML = `
    <i class="${iconClass} toast-icon"></i>
    <div class="toast-content">
      <span class="toast-title">${title}</span>
      <span class="toast-msg">${message}</span>
    </div>
  `;
  
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = "slide-up 0.3s reverse forwards";
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// --- DYNAMIC UI UPDATERS ---
function updateStatsUI(prevBalance = 0, prevEarnings = 0) {
  // Update Balances
  animateValue("header-balance", prevBalance, appState.balance, 400, true);
  animateValue("stats-balance", prevBalance, appState.balance, 400, true);
  animateValue("card-balance-display", prevBalance, appState.balance, 400, true);
  
  // Update Earnings
  animateValue("stats-earnings", prevEarnings, appState.earnings, 400, true);
  
  // Update Completed Ads count
  const watchedCount = appState.watchedAds.length;
  document.getElementById("stats-watched").innerText = `${watchedCount} / 15`;
  
  // Update Credit Card name display
  document.getElementById("card-holder-display").innerText = appState.userName || "Guest User";
  document.getElementById("profile-name-display").innerText = appState.userName || "Guest User";
  document.getElementById("profile-avatar").innerText = (appState.userName || "Guest User").charAt(0).toUpperCase();
  
  // Update Withdrawal Goal progress bar
  const progressPercent = Math.min((appState.balance / 10.00) * 100, 100);
  document.getElementById("withdraw-progress-bar").style.width = `${progressPercent}%`;
  document.getElementById("progress-val-current").innerText = `$${appState.balance.toFixed(2)}`;
  
  // Check Withdrawal Button Eligibility
  const withdrawBtn = document.getElementById("submit-withdraw-btn");
  const isInputsValid = appState.userName.trim().length > 2 && validateEmail(appState.userEmail);
  const isScreenshotUploaded = !!appState.screenshotName;
  const isBalanceEligible = appState.balance >= 10.00;
  
  if (isBalanceEligible && isInputsValid && isScreenshotUploaded) {
    withdrawBtn.removeAttribute("disabled");
  } else {
    withdrawBtn.setAttribute("disabled", "true");
  }
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// --- RENDER CAMPAIGN AD CARDS ---
function renderAdCards() {
  const gridContainer = document.getElementById("campaign-ads-grid");
  gridContainer.innerHTML = ""; // Clear loader skeletons
  
  const adTargetUrl = "https://www.effectivecpmnetwork.com/vii91afu?key=4a6df75c7231e3004cf87ec8c459da5d";
  
  for (let i = 0; i < 15; i++) {
    const card = document.createElement("div");
    card.className = "glass-panel ad-card";
    
    const isCompleted = appState.watchedAds.includes(i);
    const isReadyToClaim = appState.activeAdRedirects[i] === true;
    
    let statusClass = "pending";
    let statusText = "Mission Available";
    let statusIcon = '<i class="fa-solid fa-circle-play"></i>';
    let actionBtn = `<button class="ad-action-btn watch" data-ad-idx="${i}"><i class="fa-solid fa-play"></i> Watch Ad</button>`;
    
    if (isCompleted) {
      statusClass = "completed";
      statusText = "Mission Completed";
      statusIcon = '<i class="fa-solid fa-circle-check"></i>';
      actionBtn = `<button class="ad-action-btn completed-btn" disabled><i class="fa-solid fa-check"></i> Reward Claimed</button>`;
    } else if (isReadyToClaim) {
      statusClass = "ready";
      statusText = "Mission Available";
      statusIcon = '<i class="fa-solid fa-circle-exclamation"></i>';
      actionBtn = `<button class="ad-action-btn claim" data-ad-idx="${i}"><i class="fa-solid fa-gift"></i> Claim Reward</button>`;
    }
    
    card.innerHTML = `
      <div class="ad-thumb-container">
        ${generateCardThumbnail(i)}
        <span class="ad-badge">AD ${i + 1}</span>
        <span class="ad-reward-badge">$0.20</span>
      </div>
      <div class="ad-card-details">
        <h4 class="ad-card-title">Campaign Task #${String(i + 1).padStart(2, '0')}</h4>
        <p class="ad-card-desc">Visit target portal, browse sponsored info and return.</p>
        <div class="ad-card-status ${statusClass}">
          ${statusIcon}
          <span>${statusText}</span>
        </div>
      </div>
      ${actionBtn}
    `;
    
    gridContainer.appendChild(card);
  }
  
  // Bind Ad Card Action Buttons
  gridContainer.querySelectorAll(".ad-action-btn.watch").forEach(btn => {
    btn.addEventListener("click", function() {
      const idx = parseInt(this.getAttribute("data-ad-idx"));
      
      // Update state: open in redirect mode
      appState.activeAdRedirects[idx] = true;
      saveStateToStorage();
      
      // Open link in a new tab
      window.open(adTargetUrl, '_blank');
      
      // Dynamic rendering refresh for this specific button
      renderAdCards();
      
      // Inform user
      showToast(
        "Redirect Launched", 
        "Browse the sponsor page, then return to claim your reward!", 
        "fa-solid fa-arrow-up-right-from-square"
      );
    });
  });
  
  gridContainer.querySelectorAll(".ad-action-btn.claim").forEach(btn => {
    btn.addEventListener("click", function(e) {
      const idx = parseInt(this.getAttribute("data-ad-idx"));
      
      // Floating indicator effect coordinates
      const rect = this.getBoundingClientRect();
      spawnPlusFloat(e.clientX || (rect.left + rect.width / 2), e.clientY || (rect.top + rect.height / 2));
      
      // Trigger confetti celebration
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.8 }
      });
      
      const prevBal = appState.balance;
      const prevEarn = appState.earnings;
      
      // Update state
      appState.balance += 0.20;
      appState.earnings += 0.20;
      appState.watchedAds.push(idx);
      delete appState.activeAdRedirects[idx];
      saveStateToStorage();
      
      // Visual elements update
      updateStatsUI(prevBal, prevEarn);
      renderAdCards();
      
      // Log event
      addActivityLog(appState.userName, `Completed Campaign #${idx + 1}`, "+$0.20", "positive");
      showToast("Reward Claimed!", "+$0.20 has been added to your vault balance.", "fa-solid fa-circle-check");
    });
  });
}

function spawnPlusFloat(x, y) {
  const floatText = document.createElement("div");
  floatText.className = "plus-float";
  floatText.innerText = "+$0.20";
  floatText.style.left = `${x}px`;
  floatText.style.top = `${y}px`;
  
  document.body.appendChild(floatText);
  
  setTimeout(() => {
    floatText.remove();
  }, 1000);
}

// --- DAILY LOGIN BONUS CONTROLLER ---
function checkDailyBonusTimer() {
  const claimBtn = document.getElementById("claim-daily-btn");
  const btnText = document.getElementById("daily-btn-text");
  const statusText = document.getElementById("daily-bonus-status-text");
  
  if (!appState.lastDailyClaim) {
    claimBtn.removeAttribute("disabled");
    btnText.innerText = "Claim Bonus";
    statusText.innerText = "Claim your daily allowance to boost your available balance. Refreshes every 24 hours.";
    return;
  }
  
  const now = Date.now();
  const timePassed = now - appState.lastDailyClaim;
  const cooldown = 24 * 60 * 60 * 1000; // 24 hours in ms
  
  if (timePassed >= cooldown) {
    claimBtn.removeAttribute("disabled");
    btnText.innerText = "Claim Bonus";
    statusText.innerText = "Your daily bonus is available! Claim +$0.50 instantly.";
  } else {
    claimBtn.setAttribute("disabled", "true");
    statusText.innerText = "You've successfully claimed your allowance today. Check back tomorrow for more rewards!";
    
    // Countdown updater loop
    const remainingTime = cooldown - timePassed;
    const hours = Math.floor(remainingTime / (1000 * 60 * 60));
    const minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);
    
    btnText.innerText = `${hours}h ${minutes}m ${seconds}s`;
    
    // Schedule check again in 1s
    setTimeout(checkDailyBonusTimer, 1000);
  }
}

function initDailyBonus() {
  const claimBtn = document.getElementById("claim-daily-btn");
  claimBtn.addEventListener("click", function() {
    if (claimBtn.disabled) return;
    
    confetti({
      particleCount: 100,
      spread: 70,
      colors: ['#FBBF24', '#D97706', '#F59E0B']
    });
    
    const prevBal = appState.balance;
    const prevEarn = appState.earnings;
    
    appState.balance += 0.50;
    appState.earnings += 0.50;
    appState.lastDailyClaim = Date.now();
    saveStateToStorage();
    
    updateStatsUI(prevBal, prevEarn);
    checkDailyBonusTimer();
    
    addActivityLog(appState.userName, "Claimed Daily Login Bonus", "+$0.50", "positive");
    showToast("Daily Bonus Claimed!", "+$0.50 has been credited to your wallet.", "fa-solid fa-gift");
  });
  
  checkDailyBonusTimer();
}

// --- CAMPAIGN MISSION RE-AVAILABILITY & RESET TIMER ---
function checkMissionResetTimer() {
  const countdownEl = document.getElementById("mission-reset-countdown");
  if (!countdownEl) return;

  const now = Date.now();
  
  // Set initial reset time if none exists
  if (!appState.nextMissionReset) {
    appState.nextMissionReset = now + 2 * 60 * 60 * 1000;
    saveStateToStorage();
  }

  let remaining = appState.nextMissionReset - now;

  // Reset campaigns if cooldown timer has elapsed
  if (remaining <= 0) {
    const wasMissionsCompleted = appState.watchedAds.length > 0 || Object.keys(appState.activeAdRedirects).length > 0;
    
    // Clear completion arrays
    const prevWatchedCount = appState.watchedAds.length;
    appState.watchedAds = [];
    appState.activeAdRedirects = {};
    
    // Establish next reset target (2 hours out)
    appState.nextMissionReset = Date.now() + 2 * 60 * 60 * 1000;
    saveStateToStorage();
    
    // Refresh visual listings
    renderAdCards();
    updateStatsUI(appState.balance, appState.earnings);

    // Notify user with a pop-up toast and live activity log
    if (wasMissionsCompleted) {
      showToast(
        "Missions Refreshed!", 
        "All completed campaigns are available again. Go watch and earn!", 
        "fa-solid fa-rotate-left"
      );
      addActivityLog("SYSTEM", "Campaign Missions reset & refreshed", "15 New Available", "positive");
    }
    
    remaining = appState.nextMissionReset - Date.now();
  }

  // Convert milliseconds to hours, minutes, and seconds
  const hours = Math.floor(remaining / (1000 * 60 * 60));
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

  countdownEl.innerText = `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;

  // Update countdown every second
  setTimeout(checkMissionResetTimer, 1000);
}

// --- IDENTITY FORM SYNCING ---
function initFormHandling() {
  const nameInput = document.getElementById("username-input");
  const emailInput = document.getElementById("email-input");
  
  // Set default values if loaded from state
  nameInput.value = appState.userName === "Guest User" ? "" : appState.userName;
  emailInput.value = appState.userEmail;
  
  function handleInputUpdate() {
    const prevBal = appState.balance;
    appState.userName = nameInput.value.trim() || "Guest User";
    appState.userEmail = emailInput.value.trim();
    saveStateToStorage();
    updateStatsUI(prevBal, prevBal);
  }
  
  nameInput.addEventListener("input", handleInputUpdate);
  emailInput.addEventListener("input", handleInputUpdate);
}

// --- DRAG & DROP SCREENSHOT UPLOADER ---
function initUploader() {
  const dropzone = document.getElementById("screenshot-dropzone");
  const fileInput = document.getElementById("screenshot-file-input");
  const preview = document.getElementById("upload-preview-card");
  const fileNameDisplay = document.getElementById("uploaded-filename");
  const removeBtn = document.getElementById("remove-uploaded-file");
  const progressOverlay = document.getElementById("upload-progress-overlay");
  
  // Setup click triggers file browser
  dropzone.addEventListener("click", (e) => {
    if (e.target !== fileInput && !progressOverlay.classList.contains("active")) {
      fileInput.click();
    }
  });
  
  // Setup drag event colors
  ['dragenter', 'dragover'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.add("drag-over");
    }, false);
  });
  
  ['dragleave', 'drop'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.remove("drag-over");
    }, false);
  });
  
  // Handle dropped files
  dropzone.addEventListener("drop", (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;
    if (files.length) {
      processSelectedFile(files[0]);
    }
  });
  
  // Handle selected files
  fileInput.addEventListener("change", function() {
    if (this.files.length) {
      processSelectedFile(this.files[0]);
    }
  });
  
  // Remove files
  removeBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    appState.screenshotName = null;
    saveStateToStorage();
    
    fileInput.value = "";
    preview.style.display = "none";
    dropzone.style.display = "flex";
    
    const prevBal = appState.balance;
    updateStatsUI(prevBal, prevBal);
    
    showToast("File Removed", "Screenshot verification cleared.", "fa-solid fa-trash");
  });
  
  // Simulated file verification delay
  function processSelectedFile(file) {
    // Validate image format
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      showToast("Invalid File Type", "Please upload a valid PNG, JPG, or JPEG image.", "fa-solid fa-triangle-exclamation");
      return;
    }
    
    // Size check (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast("File Too Large", "Maximum image size is 5MB.", "fa-solid fa-triangle-exclamation");
      return;
    }
    
    // Simulate premium visual spinner scanning the document contents
    progressOverlay.classList.add("active");
    
    setTimeout(() => {
      progressOverlay.classList.remove("active");
      
      appState.screenshotName = file.name;
      saveStateToStorage();
      
      fileNameDisplay.innerText = file.name;
      dropzone.style.display = "none";
      preview.style.display = "flex";
      
      const prevBal = appState.balance;
      updateStatsUI(prevBal, prevBal);
      
      showToast("Verification Accepted", "Screenshot analyzed and verified successfully.", "fa-solid fa-circle-check");
    }, 1500);
  }
  
  // Handle page reload recovery of file widget
  if (appState.screenshotName) {
    fileNameDisplay.innerText = appState.screenshotName;
    dropzone.style.display = "none";
    preview.style.display = "flex";
  }
}

// --- WITHDRAW CASH ACTION ---
function initWithdrawal() {
  const withdrawBtn = document.getElementById("submit-withdraw-btn");
  withdrawBtn.addEventListener("click", () => {
    if (appState.balance < 10.00) {
      showToast("Insufficient Balance", "You need at least $10.00 to process payouts.", "fa-solid fa-circle-xmark");
      return;
    }
    
    if (!appState.userName || appState.userName === "Guest User" || !validateEmail(appState.userEmail)) {
      showToast("Missing Details", "Please verify your Full Name and Email under Identity Details.", "fa-solid fa-circle-xmark");
      return;
    }
    
    if (!appState.screenshotName) {
      showToast("Verify Screenshot", "Please drag and drop a wallet screenshot to verify destination.", "fa-solid fa-circle-xmark");
      return;
    }
    
    const payoutAmount = appState.balance;
    const prevBal = appState.balance;
    
    // Process withdrawal simulation
    appState.balance = 0.00;
    appState.screenshotName = null;
    
    // Clear screenshot file inputs
    const fileInput = document.getElementById("screenshot-file-input");
    if (fileInput) fileInput.value = "";
    document.getElementById("upload-preview-card").style.display = "none";
    document.getElementById("screenshot-dropzone").style.display = "flex";
    
    saveStateToStorage();
    updateStatsUI(prevBal, appState.earnings);
    
    // Log event in Network Feed
    addActivityLog(appState.userName, `Withdrew Payout via Wallet`, `-$${payoutAmount.toFixed(2)}`, "withdraw-type");
    
    // Show success dialog / toast
    confetti({
      particleCount: 150,
      spread: 90,
      origin: { y: 0.5 }
    });
    
    showToast(
      "Payout Requested!", 
      `$${payoutAmount.toFixed(2)} transfer has been submitted for processing to ${appState.userEmail}.`, 
      "fa-solid fa-circle-dollar-to-slot"
    );
  });
}

// --- RECENT NETWORK ACTIVITY TIMELINE FEED ---
const mockUsernames = [
  "alpha_hustler", "crypto_kid", "neon_pulse", "cyber_ninja", "dolar_hustle", 
  "cash_grabber", "sol_staker", "faucet_king", "earn_fast", "bit_boss", 
  "cyber_empress", "wallet_grower", "payday_flex", "apex_runner", "orbit_miner"
];

const mockActions = [
  { text: "Claimed Ad #03 Reward", amount: "+$0.20", type: "positive" },
  { text: "Claimed Ad #07 Reward", amount: "+$0.20", type: "positive" },
  { text: "Claimed Ad #12 Reward", amount: "+$0.20", type: "positive" },
  { text: "Claimed Ad #15 Reward", amount: "+$0.20", type: "positive" },
  { text: "Claimed Daily Bonus Reward", amount: "+$0.50", type: "positive" },
  { text: "Requested Payout to Wallet", amount: "-$12.60", type: "withdraw-type" },
  { text: "Requested Payout to Wallet", amount: "-$10.20", type: "withdraw-type" }
];

function addActivityLog(user, desc, amount, cssType) {
  const container = document.getElementById("activity-feed-container");
  if (!container) return;
  
  const item = document.createElement("div");
  item.className = "activity-item";
  
  const charAvatar = user.charAt(0).toUpperCase();
  
  item.innerHTML = `
    <div class="activity-user">
      <div class="activity-avatar">${charAvatar}</div>
      <div class="activity-details">
        <span>@${user}</span>
        <span>${desc}</span>
      </div>
    </div>
    <span class="activity-reward ${cssType}">${amount}</span>
  `;
  
  // Insert at top
  container.insertBefore(item, container.firstChild);
  
  // Maintain a clean log size limit (cap at 7 items max)
  while (container.childNodes.length > 7) {
    container.removeChild(container.lastChild);
  }
}

function initActivityFeed() {
  // Populate initial lists
  for (let i = 0; i < 5; i++) {
    const user = mockUsernames[Math.floor(Math.random() * mockUsernames.length)];
    const action = mockActions[Math.floor(Math.random() * mockActions.length)];
    addActivityLog(user, action.text, action.amount, action.type);
  }
  
  // Feed updater loop
  function loopUpdate() {
    const delay = Math.random() * 4000 + 3000; // between 3-7 seconds
    
    setTimeout(() => {
      const user = mockUsernames[Math.floor(Math.random() * mockUsernames.length)];
      const action = mockActions[Math.floor(Math.random() * mockActions.length)];
      addActivityLog(user, action.text, action.amount, action.type);
      loopUpdate();
    }, delay);
  }
  
  loopUpdate();
}

// --- ACTIVE USERS SIMULATOR ---
function initOnlineCounter() {
  const counterObj = document.getElementById("online-counter");
  let count = 1432;
  
  setInterval(() => {
    const drift = Math.floor(Math.random() * 9 - 4); // drift between -4 and +4
    count += drift;
    if (count < 1100) count = 1100;
    if (count > 1800) count = 1800;
    
    counterObj.innerText = `${count.toLocaleString()} Online`;
  }, 4000);
}

// --- AFFILIATE PROGRAM COPY EVENT ---
function initReferralSystem() {
  const copyBtn = document.getElementById("copy-ref-link-btn");
  const linkField = document.getElementById("ref-link-field");
  
  copyBtn.addEventListener("click", () => {
    linkField.select();
    linkField.setSelectionRange(0, 99999); // Mobile
    
    navigator.clipboard.writeText(linkField.value).then(() => {
      copyBtn.innerText = "Copied!";
      copyBtn.style.backgroundColor = "var(--cyan-neon)";
      showToast("Link Copied!", "Referral affiliate link copied to clipboard.", "fa-solid fa-copy");
      
      setTimeout(() => {
        copyBtn.innerText = "Copy";
        copyBtn.style.backgroundColor = "var(--purple-neon)";
      }, 2000);
    }).catch(err => {
      console.error("Failed to copy text: ", err);
    });
  });
}

// --- INERTIA 3D TILTING EFFECT FOR THE DEBIT CARD ---
function initHolographicCardHover() {
  const cardWrap = document.getElementById("card-wrap-hover");
  const card = document.getElementById("credit-card-view");
  
  if (!cardWrap || !card) return;
  
  cardWrap.addEventListener("mousemove", (e) => {
    const rect = cardWrap.getBoundingClientRect();
    const x = e.clientX - rect.left; // x coordinates inside elements
    const y = e.clientY - rect.top;  // y coordinates inside elements
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateY = ((x - centerX) / centerX) * 15; // rotate scale max 15deg
    const rotateX = -(((y - centerY) / centerY) * 15);
    
    card.style.transform = `rotateY(${rotateY}deg) rotateX(${rotateX}deg) translateY(-5px)`;
  });
  
  cardWrap.addEventListener("mouseleave", () => {
    card.style.transform = "rotateY(0deg) rotateX(0deg) translateY(0)";
  });
}

// --- PAGE LOAD INITIALIZER ---
document.addEventListener("DOMContentLoaded", () => {
  // Load local state
  loadStateFromStorage();
  
  // Set referral link for username
  const refLinkField = document.getElementById("ref-link-field");
  if (refLinkField && appState.userName !== "Guest User") {
    refLinkField.value = `https://adscash.io/ref/${appState.userName.toLowerCase().replace(/\s+/g, '_')}`;
  }
  
  // Sync Profile displays and progress indicators
  updateStatsUI(0, 0);
  
  // Initialize Modules
  initCanvasParticles();
  initHolographicCardHover();
  initFormHandling();
  initUploader();
  initWithdrawal();
  initDailyBonus();
  checkMissionResetTimer();
  initReferralSystem();
  initActivityFeed();
  initOnlineCounter();
  
  // Fake brief load skeleton latency
  setTimeout(() => {
    renderAdCards();
  }, 1000);
  
  // Welcome user toast
  setTimeout(() => {
    showToast(
      `Welcome Back!`, 
      `Logged in as ${appState.userName}. Start viewing ads to cash out!`, 
      "fa-solid fa-door-open"
    );
  }, 1800);
});
