import logging
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo
from telegram.ext import ContextTypes
from api_client import api
from config import ADMIN_CHAT_IDS, TELEGRAM_WEBAPP_URL

logger = logging.getLogger(__name__)


# ─── Komutlar ──────────────────────────────────────────────

async def test_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    try:
        await update.message.reply_text("Bot calisiyor!")
    except Exception as e:
        logger.error("test xatosi: %s", e)


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    try:
        keyboard = [
            [InlineKeyboardButton("Xarid qilish", web_app=WebAppInfo(url=TELEGRAM_WEBAPP_URL))],
            [
                InlineKeyboardButton("Kategoriyalar", callback_data="categories"),
            ],
            [
                InlineKeyboardButton("Tekliflarim", callback_data="my_quotes"),
                InlineKeyboardButton("Yordam", callback_data="help"),
            ],
        ]
        reply_markup = InlineKeyboardMarkup(keyboard)

        text = (
            f"Xush kelibsiz, {update.effective_user.first_name}!\n\n"
            "HORECA Portal botiga xush kelibsiz.\n"
            "Mahsulotlarni korishingiz va teklif yuborishingiz mumkin."
        )
        await update.message.reply_text(text, reply_markup=reply_markup)
    except Exception as e:
        logger.error("start handler xatosi: %s", e)
        await update.message.reply_text("Xatolik yuz berdi. Qaytadan urinib koring.")


async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    try:
        text = (
            "<b>Yordam</b>\n\n"
            "Buyruqlar:\n"
            "/start - Botni boshlash\n"
            "/categories - Kategoriyalar\n"
            "/search soz - Mahsulot qidirish\n"
            "/product id - Mahsulot malumotlari\n"
            "/myquotes - Tekliflarim\n"
            "/help - Yordam\n\n"
            "Mini App orqali ham foydalanishingiz mumkin."
        )
        await update.message.reply_text(text, parse_mode="HTML")
    except Exception as e:
        logger.error("help handler xatosi: %s", e)


# ─── Kategoriyalar ─────────────────────────────────────────

async def categories_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    try:
        cats = api.get_root_categories()
    except Exception as e:
        logger.error("Kategoriyalar cekilemedi: %s", e)
        await update.message.reply_text("Kategoriyalar yuklanmadi. Backend ishlamayapti.")
        return

    if not cats:
        await update.message.reply_text("Hozircha kategoriyalar yoq.")
        return

    keyboard = []
    for cat in cats[:10]:
        keyboard.append([
            InlineKeyboardButton(
                cat["name"],
                callback_data=f"cat_{cat['slug']}",
            )
        ])
    keyboard.append([
        InlineKeyboardButton("Barcha mahsulotlar", callback_data="all_products")
    ])

    await update.message.reply_text(
        "<b>Kategoriyalar</b>\n\nKategoriyani tanlang:",
        reply_markup=InlineKeyboardMarkup(keyboard),
        parse_mode="HTML",
    )


async def category_callback(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()

    slug = query.data.replace("cat_", "")
    try:
        products = api.list_products(category=slug, limit=5)
    except Exception as e:
        logger.error("Mahsulotlar cekilemedi: %s", e)
        await query.edit_message_text("Mahsulotlar yuklanmadi.")
        return

    if not products:
        await query.edit_message_text("Bu kategoriyada mahsulotlar topilmadi.")
        return

    text = f"<b>Kategoriya: {slug}</b>\n\n"
    for p in products:
        price = p.get("pricing", {}).get("price", "N/A")
        text += f"- <b>{p['name']}</b> - ${price}\n"

    keyboard = [
        [InlineKeyboardButton("Orqaga", callback_data="back_categories")]
    ]
    await query.edit_message_text(text, reply_markup=InlineKeyboardMarkup(keyboard), parse_mode="HTML")


# ─── Qidirish ──────────────────────────────────────────────

async def search_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    try:
        if not context.args:
            await update.message.reply_text("Qidirish sozini kiriting.\nNamuna: /search non")
            return

        query = " ".join(context.args)
        await update.message.reply_text(f"'{query}' qidirilmoqda...")

        results = api.search_products(query, limit=5)
    except Exception as e:
        logger.error("Qidiruv xatosi: %s", e)
        await update.message.reply_text("Qidiruvda xatolik yuz berdi.")
        return

    if not results:
        await update.message.reply_text(f"'{query}' boyicha hech narsa topilmadi.")
        return

    text = f"<b>'{query}' natijalari:</b>\n\n"
    for p in results:
        price = p.get("pricing", {}).get("price", "N/A")
        text += f"- <b>{p['name']}</b> - ${price}\nID: <code>{p['id']}</code>\n"

    await update.message.reply_text(text, parse_mode="HTML")


# ─── Mahsulot ──────────────────────────────────────────────

async def product_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    try:
        if not context.args:
            await update.message.reply_text("Mahsulot ID kiriting.\nNamuna: /product abc123")
            return

        product_id = context.args[0]
        product = api.get_product(product_id)
    except Exception as e:
        logger.error("Mahsulot cekilemedi: %s", e)
        await update.message.reply_text("Mahsulot topilmadi.")
        return

    price = product.get("pricing", {}).get("price", "N/A")
    desc = product.get("description", "")[:200]

    keyboard = [
        [InlineKeyboardButton("Mini App'da korish", web_app=WebAppInfo(url=f"{TELEGRAM_WEBAPP_URL}/product/{product_id}"))],
    ]

    text = (
        f"<b>{product['name']}</b>\n\n"
        f"Narxi: <b>${price}</b>\n"
        f"Kategoriya: {product.get('category', {}).get('name', 'N/A')}\n"
    )
    if desc:
        text += f"\n{desc}"

    await update.message.reply_text(text, reply_markup=InlineKeyboardMarkup(keyboard), parse_mode="HTML")


# ─── Teklifler ─────────────────────────────────────────────

async def my_quotes_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    try:
        keyboard = [
            [InlineKeyboardButton("Tekliflarimni korish", web_app=WebAppInfo(url=f"{TELEGRAM_WEBAPP_URL}/quotes"))],
        ]
        await update.message.reply_text(
            "Tekliflaringizni Mini App orqali korishingiz mumkin.",
            reply_markup=InlineKeyboardMarkup(keyboard),
        )
    except Exception as e:
        logger.error("myquotes xatosi: %s", e)


# ─── Callback query handler ────────────────────────────────

async def button_callback(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()

    try:
        if query.data == "categories":
            try:
                cats = api.get_root_categories()
            except Exception:
                await query.edit_message_text("Kategoriyalar yuklanmadi.")
                return

            keyboard = []
            for cat in cats[:10]:
                keyboard.append([
                    InlineKeyboardButton(cat["name"], callback_data=f"cat_{cat['slug']}")
                ])
            keyboard.append([
                InlineKeyboardButton("Barcha mahsulotlar", callback_data="all_products")
            ])
            keyboard.append([
                InlineKeyboardButton("Orqaga", callback_data="back_main")
            ])

            await query.edit_message_text(
                "<b>Kategoriyalar</b>",
                reply_markup=InlineKeyboardMarkup(keyboard),
                parse_mode="HTML",
            )

        elif query.data == "help":
            await query.edit_message_text(
                "<b>Yordam</b>\n\n"
                "/categories - Kategoriyalar\n"
                "/search soz - Qidirish\n"
                "/product id - Mahsulot\n"
                "/myquotes - Tekliflarim",
                parse_mode="HTML",
            )

        elif query.data == "back_main":
            keyboard = [
                [InlineKeyboardButton("Xarid qilish", web_app=WebAppInfo(url=TELEGRAM_WEBAPP_URL))],
                [
                    InlineKeyboardButton("Kategoriyalar", callback_data="categories"),
                ],
                [
                    InlineKeyboardButton("Tekliflarim", callback_data="my_quotes"),
                    InlineKeyboardButton("Yordam", callback_data="help"),
                ],
            ]
            await query.edit_message_text(
                "Asosiy menyu:",
                reply_markup=InlineKeyboardMarkup(keyboard),
            )

        elif query.data == "back_categories":
            try:
                cats = api.get_root_categories()
            except Exception:
                await query.edit_message_text("Kategoriyalar yuklanmadi.")
                return

            keyboard = []
            for cat in cats[:10]:
                keyboard.append([
                    InlineKeyboardButton(cat["name"], callback_data=f"cat_{cat['slug']}")
                ])
            keyboard.append([
                InlineKeyboardButton("Orqaga", callback_data="back_main")
            ])
            await query.edit_message_text(
                "<b>Kategoriyalar</b>",
                reply_markup=InlineKeyboardMarkup(keyboard),
                parse_mode="HTML",
            )

        elif query.data.startswith("cat_"):
            await category_callback(update, context)

        elif query.data == "all_products":
            try:
                products = api.list_products(limit=10)
            except Exception:
                await query.edit_message_text("Mahsulotlar yuklanmadi.")
                return

            text = "<b>Barcha mahsulotlar:</b>\n\n"
            for p in products:
                price = p.get("pricing", {}).get("price", "N/A")
                text += f"- <b>{p['name']}</b> - ${price}\n"

            keyboard = [[InlineKeyboardButton("Orqaga", callback_data="back_categories")]]
            await query.edit_message_text(text, reply_markup=InlineKeyboardMarkup(keyboard), parse_mode="HTML")

    except Exception as e:
        logger.error("Callback xatosi: %s", e)
        try:
            await query.edit_message_text("Xatolik yuz berdi.")
        except Exception:
            pass


# ─── Echo ──────────────────────────────────────────────────

async def echo(update: Update, context: ContextTypes.DEFAULT_TYPE):
    try:
        await update.message.reply_text(
            "Meni tushunmadim. /help buyrug'ini sinab koring."
        )
    except Exception as e:
        logger.error("Echo xatosi: %s", e)
