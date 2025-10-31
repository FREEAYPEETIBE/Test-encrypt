import crypto from "crypto";
import fetch from "node-fetch";

const FIREBASE_URL = "https://device-id-fa609-default-rtdb.asia-southeast1.firebasedatabase.app/devices";

const AES_KEY = process.env.AES_KEY; // stored securely in Vercel
const AES_IV = process.env.AES_IV;

export default async function handler(req, res) {
  try {
    const { deviceId } = req.query;
    if (!deviceId) return res.status(400).json({ error: "Missing deviceId" });

    // 1️⃣ Check device in Firebase Realtime Database
    const deviceRes = await fetch(`${FIREBASE_URL}/${deviceId}.json`);
    const deviceData = await deviceRes.json();

    if (!deviceData || !deviceData.approved) {
      return res.status(403).json({ error: "Device not approved" });
    }

    // 2️⃣ Fetch encrypted file from your GitHub repo (RAW link)
    const encRes = await fetch("https://raw.githubusercontent.com/FREEAYPEETIBE/Test-encrypt/main/channels.enc");
    const encData = await encRes.text();

    // 3️⃣ Decrypt AES
    const decrypted = decryptAES(encData);

    // 4️⃣ Return plain text
    res.setHeader("Content-Type", "text/plain");
    return res.status(200).send(decrypted);
  } catch (err) {
    console.error("Decryption failed:", err);
    return res.status(500).json({ error: "Server error", details: err.message });
  }
}

function decryptAES(base64Cipher) {
  const decipher = crypto.createDecipheriv("aes-256-cbc", AES_KEY, AES_IV);
  let decrypted = decipher.update(base64Cipher, "base64", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}
