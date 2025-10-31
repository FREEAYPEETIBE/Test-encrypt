import crypto from "crypto";
import fetch from "node-fetch";

export default async function handler(req, res) {
  try {
    const { deviceId } = req.query;
    if (!deviceId) {
      return res.status(400).json({ error: "Missing deviceId" });
    }

    // Load secrets from environment variables
    const FIREBASE_URL = process.env.FIREBASE_URL;
    const GITHUB_ENC_URL = process.env.GITHUB_ENC_URL;
    const AES_KEY = Buffer.from(process.env.AES_KEY, "utf8");
    const AES_IV = Buffer.from(process.env.AES_IV, "utf8");

    // ✅ 1. Verify device approval in Firebase
    const deviceRes = await fetch(`${FIREBASE_URL}/devices/${deviceId}.json`);
    const deviceData = await deviceRes.json();

    if (!deviceData || !deviceData.approved) {
      return res.status(403).json({ error: "Device not approved" });
    }

    // ✅ 2. Fetch encrypted file from GitHub
    const encRes = await fetch(GITHUB_ENC_URL);
    if (!encRes.ok) throw new Error("Failed to fetch encrypted file");
    const encBuffer = Buffer.from(await encRes.arrayBuffer());

    // ✅ 3. Decrypt AES (must match your Python script)
    const decipher = crypto.createDecipheriv("aes-128-cbc", AES_KEY, AES_IV);
    let decrypted = decipher.update(encBuffer);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    // ✅ 4. Return decrypted JS file
    res.setHeader("Content-Type", "application/javascript");
    return res.status(200).send(decrypted.toString("utf8"));

  } catch (err) {
    console.error("❌ Decryption failed:", err);
    return res.status(500).json({ error: "Server error", details: err.message });
  }
}
