import express from "express";
import bodyParser from "body-parser";
import { Client, GatewayIntentBits } from "discord.js";

const app = express();
app.use(bodyParser.json());

// Discord bot setup
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const TOKEN = process.env.DISCORD_TOKEN;

let lastStatus = null; // 🆕 store the most recent status

client.once("ready", () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);
});

app.post("/update-status", (req, res) => {
  const { title, words, lines, folder } = req.body;

  const statusText = `📘 ${folder ? folder + " → " : ""}${title} | ${words}w | ${lines}l`;

  client.user.setActivity(statusText, { type: 0 });
  console.log("✅ Updated Discord Bot Status:", statusText);

  // 🆕 Save this so your local presence app can fetch it
  lastStatus = { title, words, lines, folder, updatedAt: Date.now() };

  res.send("Status updated!");
});

// 🆕 Add endpoint for your local Rich Presence app
app.get("/current-status", (req, res) => {
  if (!lastStatus) {
    return res.json({ title: "Idle", folder: "Notion", words: 0, lines: 0 });
  }
  res.json(lastStatus);
});

client.login(TOKEN);

app.listen(3000, () => console.log("🌐 Server running on port 3000"));
