const ref_backend = "https://fanta-world-backend.onrender.com/";
window.addEventListener("load", async () => {
  try {
    const res = await fetch(ref_backend + "api/test");
    console.log("Status:", res.status);
    console.log("Headers:", res.headers.get("content-type"));

    const text = await res.text(); // 👈 RẤT QUAN TRỌNG
    console.log("RAW RESPONSE:", text);

    const data = JSON.parse(text);
    console.log("JSON:", data);

    await loadPlayerPosition();

    gameLoop();
  } catch (err) {
    console.error("FETCH ERROR:", err);
  }
});
// Lấy playerId đã lưu
let playerId = localStorage.getItem("playerId");

// Nếu chưa có → tạo mới
if (!playerId) {
  playerId = crypto.randomUUID();
  localStorage.setItem("playerId", playerId);
}
console.log("Player ID:", playerId);
async function loadPlayerPosition() {
  try {
    const res = await fetch(ref_backend + `api/player/${playerId}`);

    if (!res.ok) return;

    const data = await res.json(); // json = {x:0 ; y:0}
    x = data.x ?? 100;
    y = data.y ?? 100;

    box.style.left = x + "px";
    box.style.top = y + "px";
    console.log("Loaded position:", { x, y });
  } catch (err) {
    console.error("Load position error:", err);
  }
}
function sendPosition(x, y) {
  fetch(ref_backend + `api/player/${playerId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ x, y }),
  }).catch((err) => console.error("Send position error:", err));
}

const box = document.getElementById("box");

let x = 100;
let y = 100;
const speed = 10;
let speed_player = speed;
let keys = {};

document.addEventListener("keydown", function (e) {
  keys[e.key.toLowerCase()] = true;
});
document.addEventListener("keyup", function (e) {
  keys[e.key.toLowerCase()] = false;
});
let lastSent = 0;
function gameLoop() {
  if (keys.w != keys.s && keys.a != keys.d) speed_player = speed / Math.sqrt(2);
  else speed_player = speed;
  if (keys.w) y -= speed_player;
  if (keys.s) y += speed_player;
  if (keys.a) x -= speed_player;
  if (keys.d) x += speed_player;

  box.style.left = x + "px";
  box.style.top = y + "px";

  const now = Date.now();
  if (now - lastSent > 300) {
    sendPosition(x, y);
    lastSent = now;
  }
  requestAnimationFrame(gameLoop);
}
