import os
from dotenv import load_dotenv

load_dotenv()

# Telegram Bot
TOKEN = os.getenv("TELEGRAM_TOKEN")
ADMIN_CHAT_IDS = [
    int(x.strip()) for x in os.getenv("ADMIN_CHAT_IDS", "").split(",") if x.strip()
]

# HORECA Portal Backend
API_BASE_URL = os.getenv("API_BASE_URL", "http://localhost:3001")
TELEGRAM_WEBAPP_URL = os.getenv("TELEGRAM_WEBAPP_URL", "http://localhost:3000")

if not TOKEN:
    raise ValueError("TELEGRAM_TOKEN .env dosyasinda tanimlanmamis!")
