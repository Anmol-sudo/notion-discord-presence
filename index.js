import dotenv from "dotenv";
import clipboard from "clipboardy";
import RPC from "discord-rpc";
import { Client as NotionClient } from "@notionhq/client";

dotenv.config();

// Initialize Notion + Discord clients
const notion = new NotionClient({ auth: process.env.NOTION_TOKEN });
const discord = new RPC.Client({ transport: "ipc" });


// Fetch title + description from a Notion page
async function getPageInfo(pageId) {
  try {
    console.log(pageId);
    const page = await notion.pages.retrieve({ page_id: pageId });
    console.log(page.properties.Name.title?.[0]?.plain_text);
    
    const title =
      page.properties?.Name?.title?.[0]?.plain_text || "Untitled Page";
    const description =
      page.properties?.Description?.rich_text?.[0]?.plain_text ||
      "No description";

    return { title, description };
  } catch (error) {
    console.error("Error fetching page info:", error.message);
    return {
      title: "Unknown Page",
      description: "Access denied or invalid ID",
    };
  }
}

// Extract Notion page ID from any copied link
function extractPageIdFromUrl(url) {
  const match = url.match(/([a-f0-9]{32})/);
  if (!match) return null;
  // Convert to UUID format
  const id = match[1];
  return (
    id.substring(0, 8) +
    "-" +
    id.substring(8, 12) +
    "-" +
    id.substring(12, 16) +
    "-" +
    id.substring(16, 20) +
    "-" +
    id.substring(20)
  );
}

// Main loop to monitor clipboard + update Discord
async function watchClipboard() {
  let lastPageId = null;

  setInterval(async () => {
    const text = await clipboard.read();
    const pageId = extractPageIdFromUrl(text);
    console.log(pageId);
    
    if (!pageId || pageId === lastPageId) return;
    lastPageId = pageId;

    console.log(`🪄 New Notion page detected: ${pageId}`);

    const { title, description } = await getPageInfo(pageId);

    discord.setActivity({
      details: title || "Editing a Notion Page",
      state: description || "No description provided",
      largeImageKey: "notion", // optional; set in your Discord app assets
      largeImageText: "Working in Notion",
    });

    console.log(`✅ Discord status updated → ${title}`);
  }, 5000); // every 5 seconds
}

// Start Discord RPC
discord.on("ready", async () => {
  console.log(`🎮 Connected to Discord as ${discord.user.username}`);
  console.log("📋 Copy a Notion page link to update your status!");
  watchClipboard();
});

discord.login({ clientId: process.env.DISCORD_CLIENT_ID });
