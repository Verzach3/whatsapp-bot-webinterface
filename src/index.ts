import express from "express";
import makeWASocket, { DisconnectReason, useSingleFileAuthState } from "@adiwajshing/baileys";
import { Boom } from "@hapi/boom";

const app = express();
const { state, saveState } = useSingleFileAuthState("./auth.json");
async function startBot() {
   const socket = makeWASocket({
    auth: state,
    printQRInTerminal: true,
  });

  // Make connection
  socket.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect, qr } = update;
    if (connection === "close") {
      const shouldReconnect =
        (lastDisconnect!.error as Boom)?.output?.statusCode !==
        DisconnectReason.loggedOut;
      console.log(
        "connection closed due to error ",
        // lastDisconnect!.error,
        ", reconnecting ",
        shouldReconnect
      );
      if (shouldReconnect) {
        startBot();
      }
    } else if (connection === "open") {
      console.log("Connection opened");
    }
  });

  socket.ev.on("creds.update", saveState);

  socket.ev.on("messages.upsert", ({ messages }) => {
    const remitente = messages[0].key.remoteJid;
    const texto = messages[0].message?.conversation;
  });
  app.get("/", async (req, res) => {
    res.send("Hello World!");
    await socket.sendMessage("573162573863@s.whatsapp.net", {
      text: "Hello there!",
    });
  });
}

// run in main file
try {
  startBot(); 
} catch (error) {
  console.log("BOT CRASHED")
  startBot();
}
app.listen(1708, () => {
  console.log("Server is running on port 3000");
});
