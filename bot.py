import logging
from telegram.ext import (
    ApplicationBuilder,
    CommandHandler,
    CallbackQueryHandler,
    MessageHandler,
    filters,
)
from config import TOKEN
from handlers import (
    start,
    help_command,
    test_command,
    categories_command,
    search_command,
    product_command,
    my_quotes_command,
    button_callback,
    echo,
)

logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    level=logging.INFO,
)
logger = logging.getLogger(__name__)


async def error_handler(update, context):
    logger.error("Update hatasi: %s", context.error)
    if update and update.message:
        try:
            await update.message.reply_text("Xatolik yuz berdi. Qaytadan urinib koring.")
        except Exception:
            pass


def main():
    logger.info("HORECA Bot baslatiliyor...")

    app = (
        ApplicationBuilder()
        .token(TOKEN)
        .read_timeout(30)
        .write_timeout(30)
        .connect_timeout(30)
        .pool_timeout(30)
        .build()
    )

    app.add_error_handler(error_handler)

    app.add_handler(CommandHandler("start", start))
    app.add_handler(CommandHandler("test", test_command))
    app.add_handler(CommandHandler("help", help_command))
    app.add_handler(CommandHandler("categories", categories_command))
    app.add_handler(CommandHandler("search", search_command))
    app.add_handler(CommandHandler("product", product_command))
    app.add_handler(CommandHandler("myquotes", my_quotes_command))
    app.add_handler(CallbackQueryHandler(button_callback))
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, echo))

    logger.info("Polling baslatiliyor...")

    app.run_polling(
        drop_pending_updates=True,
        poll_interval=2.0,
        allowed_updates=["message", "callback_query"],
    )


if __name__ == "__main__":
    main()
