const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");

const app = express();

/* CORS */
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  }),
);

app.use(express.json());
app.use(express.static("public"));

/* TEST API */
app.get("/api/test", (req, res) => {
  res.json({ message: "Hello from backend 👋" });
});

/* DATABASE */
const db_password = process.env.DB_PASSWORD;

const uri =
  "mongodb+srv://ikuizukidong_db_user:" +
  db_password +
  "@cluster0.5djfxz7.mongodb.net/fanta_world?retryWrites=true&w=majority";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let playersCollection;

/* CONNECT DATABASE */
async function connectDB() {
  try {
    await client.connect();
    console.log("✅ Connected to MongoDB");

    const db = client.db();
    playersCollection = db.collection("players");
  } catch (error) {
    console.error("❌ DB Connection Error:", error);
    process.exit(1);
  }
}
// đăng ký
app.post("/api/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Missing username or password" });
    }

    const existingUser = await usersCollection.findOne({ username });

    if (existingUser) {
      return res.status(400).json({ error: "Username already exists" });
    }

    await usersCollection.insertOne({
      username,
      password,
    });

    res.json({ status: "registered" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});
// đăng nhập
app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await usersCollection.findOne({ username });

    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    if (user.password !== password) {
      return res.status(400).json({ error: "Wrong password" });
    }

    res.json({ status: "login success" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

/* xác nhận player */
app.get("/api/player/:playerId", async (req, res) => {
  try {
    const { playerId } = req.params;

    if (!playersCollection) {
      return res.status(500).json({ error: "Database not connected" });
    }

    let player = await playersCollection.findOne({ playerId });

    if (!player) {
      player = { playerId, x: 100, y: 100 };
      await playersCollection.insertOne(player);
    }

    res.json({ x: player.x, y: player.y });
  } catch (error) {
    console.error("❌ Error getting player:", error);
    res.status(500).json({ error: "Server error" });
  }
});

/* lưu thông tin player */
app.post("/api/player/:playerId", async (req, res) => {
  try {
    const { playerId } = req.params;
    const { x, y } = req.body;
    // thử mở database
    if (!playersCollection) {
      return res.status(500).json({ error: "Database not connected" });
    }
    // phần kiểm tra tính đúng đắn của dữ liệu cần lưu
    if (typeof x !== "number" || typeof y !== "number") {
      return res.status(400).json({ error: "Invalid position" });
    }
    //lưu thông tin
    await playersCollection.updateOne(
      //phương tiện tìm dữ liệu json
      { playerId },
      //set phần dữ liệu chính
      { $set: { x, y } },
      { upsert: true },
    );

    res.json({ status: "saved" });
  } catch (error) {
    console.error("❌ Error saving player:", error);
    res.status(500).json({ error: "Server error" });
  }
});

/* START SERVER AFTER DB CONNECT */
const PORT = process.env.PORT || 3000;

async function startServer() {
  await connectDB();

  app.listen(PORT, () => {
    console.log("🚀 Server running on port", PORT);
  });
}

startServer();
