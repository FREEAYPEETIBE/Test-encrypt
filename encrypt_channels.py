# encrypt_channels.py
# Encrypts channels.js → channels.enc (AES/CBC/PKCS5Padding)
# Works with your Android/Web IPTV app

from Crypto.Cipher import AES
from Crypto.Util.Padding import pad
import os

# === CONFIGURATION ===
KEY = b"1234567890123456"       # 16 bytes = 128-bit AES key (MUST match your app)
IV  = b"abcdefghijklmnop"       # 16 bytes IV (MUST match your app)
INPUT_FILE  = "channels.js"     # 🔹 Your plain file
OUTPUT_FILE = "channels.enc"    # 🔒 Encrypted output
# ======================

def encrypt_file():
    if not os.path.exists(INPUT_FILE):
        print(f"❌ Input file not found: {INPUT_FILE}")
        return

    with open(INPUT_FILE, "rb") as f:
        data = f.read()

    cipher = AES.new(KEY, AES.MODE_CBC, IV)
    encrypted = cipher.encrypt(pad(data, AES.block_size))

    with open(OUTPUT_FILE, "wb") as f:
        f.write(encrypted)

    print(f"✅ Encrypted successfully! Saved as: {OUTPUT_FILE}")

if __name__ == "__main__":
    encrypt_file()
