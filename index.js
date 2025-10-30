import express from "express";
import bodyParser from "body-parser";
import { Client, GatewayIntentBits } from "discord.js";

const app = express();
app.use(bodyParser.json());

// Discord bot setup
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Replace this with your bot token
const TOKEN = process.env.DISCORD_TOKEN;

client.once("ready", () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);
});

// Webhook endpoint to receive data from Zapier
app.post("/update-status", (req, res) => {
  const { title, words, lines, folder } = req.body;

  const statusText = `📘 ${folder ? folder + " → " : ""}${title} | ${words}w | ${lines}l`;

  client.user.setActivity(statusText, { type: 0 }); // 0 = Playing, 3 = Watching
  console.log("✅ Updated Discord Status:", statusText);

  res.send("Status updated!");
});

client.login(TOKEN);

// Express server
app.listen(3000, () => console.log("🌐 Server running on port 3000"));
