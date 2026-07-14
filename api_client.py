import requests
from config import API_BASE_URL


class HorecaAPI:
    def __init__(self, base_url: str = None):
        self.base_url = base_url or API_BASE_URL
        self.session = requests.Session()

    def _get(self, path: str, params: dict = None, token: str = None) -> dict:
        headers = {}
        if token:
            headers["Authorization"] = f"Bearer {token}"
        resp = self.session.get(f"{self.base_url}{path}", params=params, headers=headers)
        resp.raise_for_status()
        return resp.json()

    def _post(self, path: str, json: dict = None, token: str = None) -> dict:
        headers = {}
        if token:
            headers["Authorization"] = f"Bearer {token}"
        resp = self.session.post(f"{self.base_url}{path}", json=json, headers=headers)
        resp.raise_for_status()
        return resp.json()

    # --- Products ---
    def search_products(self, query: str, limit: int = 5) -> list:
        return self._get("/products/search", params={"q": query, "limit": limit})

    def get_product(self, product_id: str) -> dict:
        return self._get(f"/products/{product_id}")

    def list_products(self, category: str = None, limit: int = 10) -> list:
        params = {"limit": limit}
        if category:
            params["category"] = category
        return self._get("/products", params=params)

    # --- Categories ---
    def list_categories(self) -> list:
        return self._get("/categories")

    def get_root_categories(self) -> list:
        return self._get("/categories/root")

    def get_category(self, slug: str) -> dict:
        return self._get(f"/categories/{slug}")

    # --- Quotes ---
    def get_my_quotes(self, token: str) -> list:
        return self._get("/quotes", token=token)

    def get_quote(self, quote_id: str, token: str) -> dict:
        return self._get(f"/quotes/{quote_id}", token=token)

    def create_quote(self, token: str, items: list, note: str = None) -> dict:
        payload = {"items": items}
        if note:
            payload["customerNote"] = note
        return self._post("/quotes", json=payload, token=token)

    def repeat_quote(self, quote_id: str, token: str) -> dict:
        return self._post(f"/quotes/{quote_id}/repeat", token=token)

    # --- Auth (for admin) ---
    def telegram_login(self, telegram_data: dict) -> dict:
        return self._post("/auth/telegram-login", json=telegram_data)


api = HorecaAPI()
