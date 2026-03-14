const ref_backend = "https://fanta-world-backend.onrender.com/";
async function login() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  const res = await fetch(ref_backend + "api/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username,
      password,
    }),
  });

  const data = await res.json();

  if (data.success) {
    // lưu username
    localStorage.setItem("username", username);

    // vào game
    window.location.href = "../html/game.html";
  } else {
    alert("Sai tài khoản hoặc mật khẩu");
  }
}
async function register() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  const res = await fetch(ref_backend + "api/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username,
      password,
    }),
  });

  const data = await res.json();

  if (data.success) {
    // lưu username
    localStorage.setItem("username", username);

    // vào game
    window.location.href = "../html/game.html";
  } else {
    alert("Sai tài khoản hoặc mật khẩu");
  }
}
