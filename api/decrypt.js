import crypto from "crypto";
import fetch from "node-fetch";

const FIREBASE_URL = "https://device-id-fa609-default-rtdb.asia-southeast1.firebasedatabase.app/devices";

const AES_KEY = Buffer.from(process.env.AES_KEY, "utf8"); // ✅ Must match encrypt key
const AES_IV = Buffer.from(process.env.AES_IV, "utf8");   // ✅ Must match encrypt IV

export default async function handler(req, res) {
  try {
    const { deviceId } = req.query;
    if (!deviceId) {
      return res.status(400).json({ error: "Missing deviceId" });
    }

    // 1️⃣ Verify device in Firebase
    const deviceRes = await fetch(`${FIREBASE_URL}/${deviceId}.json`);
    const deviceData = await deviceRes.json();

    if (!deviceData || !deviceData.approved) {
      return res.status(403).json({ error: "Device not approved" });
    }

    // 2️⃣ Fetch encrypted file (raw GitHub URL)
    const encRes = await fetch(
      "https://raw.githubusercontent.com/FREEAYPEETIBE/Test-encrypt/main/channels.enc"
    );
    if (!encRes.ok) throw new Error("Failed to fetch encrypted file");

    const encBuffer = Buffer.from(await encRes.arrayBuffer());

    // 3️⃣ Decrypt AES (must match your Python encrypt_channels.py)
    const decipher = crypto.createDecipheriv("aes-128-cbc", AES_KEY, AES_IV);
    let decrypted = decipher.update(encBuffer);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    // 4️⃣ Return decrypted channels.js text
    res.setHeader("Content-Type", "application/javascript");
    return res.status(200).send(decrypted.toString("utf8"));
  } catch (err) {
    console.error("Decryption failed:", err);
    return res.status(500).json({ error: "Server error", details: err.message });
  }
}
