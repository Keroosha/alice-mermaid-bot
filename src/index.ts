import { readFileSync, existsSync } from "fs";
import { Telegraf } from "telegraf";
import nodeHtmlToImage from "node-html-to-image";
import { createMermaidPage } from "./mermaid-page";
import sanitize from "sanitize-html";

type Config = Partial<{
  botKey: string;
  adminId: number;
}>;

const configPath = process.argv[2] ?? "config.json";
console.log(`Reading config from ${configPath}`);

if (!existsSync(configPath)) {
  console.error("Missing config.json");
  process.exit(1);
}

const config = JSON.parse(readFileSync(configPath).toString()) as Config | undefined;

if (!config || !config.adminId || !config.botKey) {
  console.error("Invalid config.json");
  process.exit(2);
}

const bot = new Telegraf(config.botKey);

bot.command("id", (ctx) => ctx.reply(`${ctx.message.from.id}`));

bot.on("my_chat_member", async (ctx) => {
  if (ctx.update.my_chat_member.from.id !== config.adminId) {
    ctx.leaveChat();
    return;
  }
});

bot.command("render", async (ctx, next) => {
  if (!ctx.chat && ctx.message.from.id !== config.adminId) {
    await next();
    return;
  }
  const text = ctx.message.text.replace("/render", "");
  const image = (await nodeHtmlToImage({
    html: createMermaidPage(sanitize(text)),
    encoding: "binary",
    quality: 100,
    type: "png",
  })) as Buffer;

  await ctx.replyWithPhoto({ source: image });
});

bot.catch((err, ctx) => {
  console.log(`У меня тут косяк ${err}`);
});

bot.launch().then(() => {
  console.log("Я родился!");
});

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
