"""End-to-end backend API tests for On The Tools."""
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://website-builder-1725.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "admin@onthetools.com"
ADMIN_PASSWORD = "Tahmid12!"


@pytest.fixture(scope="session")
def api_client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def admin_token(api_client):
    r = api_client.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, f"Login failed: {r.status_code} {r.text}"
    data = r.json()
    assert "access_token" in data
    return data["access_token"]


@pytest.fixture
def admin_client(api_client, admin_token):
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json", "Authorization": f"Bearer {admin_token}"})
    return s


# ----- Health -----
def test_root(api_client):
    r = api_client.get(f"{API}/")
    assert r.status_code == 200
    assert r.json().get("status") == "ok"


# ----- Auth -----
class TestAuth:
    def test_login_success(self, api_client):
        r = api_client.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
        assert r.status_code == 200
        data = r.json()
        assert "access_token" in data and len(data["access_token"]) > 0
        assert data["user"]["email"] == ADMIN_EMAIL
        assert data["user"]["role"] == "admin"
        assert "password_hash" not in data["user"]

    def test_login_invalid_password(self, api_client):
        r = api_client.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": "wrong"})
        assert r.status_code == 401

    def test_login_invalid_email(self, api_client):
        r = api_client.post(f"{API}/auth/login", json={"email": "nobody@x.com", "password": "x"})
        assert r.status_code == 401

    def test_me_with_token(self, admin_client):
        r = admin_client.get(f"{API}/auth/me")
        assert r.status_code == 200
        assert r.json()["email"] == ADMIN_EMAIL

    def test_me_without_token(self, api_client):
        r = api_client.get(f"{API}/auth/me")
        assert r.status_code == 401

    def test_me_invalid_token(self, api_client):
        r = requests.get(f"{API}/auth/me", headers={"Authorization": "Bearer not-a-token"})
        assert r.status_code == 401


# ----- Products -----
class TestProducts:
    def test_list_products_seeded(self, api_client):
        r = api_client.get(f"{API}/products")
        assert r.status_code == 200
        items = r.json()
        assert isinstance(items, list)
        assert len(items) >= 3
        names = [p["name"] for p in items]
        for expected in [
            "115mm 1mm Metal Cutting Disc",
            "115mm 3mm Metal Cutting Disc",
            "115mm 6mm Metal Grinding Disc",
        ]:
            assert expected in names, f"Missing seeded product: {expected}"
        for p in items:
            assert "slug" in p and p["slug"]
            assert "id" in p
            assert "amazon_url" in p

    def test_get_product_by_slug(self, api_client):
        r = api_client.get(f"{API}/products")
        slug = r.json()[0]["slug"]
        r2 = api_client.get(f"{API}/products/{slug}")
        assert r2.status_code == 200
        assert r2.json()["slug"] == slug

    def test_get_product_404(self, api_client):
        r = api_client.get(f"{API}/products/no-such-slug-xyz")
        assert r.status_code == 404

    def test_product_crud_lifecycle(self, admin_client, api_client):
        # CREATE
        payload = {
            "name": f"TEST_Disc {uuid.uuid4().hex[:8]}",
            "short_description": "Test short",
            "description": "Test long description",
            "image_url": "https://example.com/img.jpg",
            "amazon_url": "https://amazon.co.uk/dp/TEST",
            "specs": {"Diameter": "115mm"},
            "gallery": [],
        }
        r = admin_client.post(f"{API}/products", json=payload)
        assert r.status_code == 200, r.text
        created = r.json()
        pid = created["id"]
        slug = created["slug"]
        assert created["name"] == payload["name"]
        assert slug.startswith("test-disc-")

        # GET via slug
        r = api_client.get(f"{API}/products/{slug}")
        assert r.status_code == 200
        assert r.json()["id"] == pid

        # UPDATE
        r = admin_client.put(f"{API}/products/{pid}", json={"short_description": "Updated short"})
        assert r.status_code == 200
        assert r.json()["short_description"] == "Updated short"

        # Verify persisted via GET
        r = api_client.get(f"{API}/products/{slug}")
        assert r.json()["short_description"] == "Updated short"

        # DELETE
        r = admin_client.delete(f"{API}/products/{pid}")
        assert r.status_code == 200

        # Verify gone
        r = api_client.get(f"{API}/products/{slug}")
        assert r.status_code == 404

    def test_product_create_without_auth(self, api_client):
        r = api_client.post(f"{API}/products", json={
            "name": "X", "short_description": "x", "description": "x",
            "image_url": "x", "amazon_url": "x",
        })
        assert r.status_code == 401


# ----- Messages -----
class TestMessages:
    def test_submit_message_public(self, api_client):
        r = api_client.post(f"{API}/messages", json={
            "full_name": "TEST User",
            "company": "TEST Co",
            "phone": "+440000000000",
            "email": "test@example.com",
            "product_needed": "115mm 1mm",
            "quantity": "500",
            "message": "TEST bulk enquiry",
        })
        assert r.status_code == 200
        data = r.json()
        assert data["ok"] is True
        assert "id" in data
        return data["id"]

    def test_list_messages_requires_auth(self, api_client):
        r = api_client.get(f"{API}/messages")
        assert r.status_code == 401

    def test_messages_full_flow(self, api_client, admin_client):
        # Create a message
        r = api_client.post(f"{API}/messages", json={
            "full_name": "TEST FlowUser",
            "phone": "+44123",
            "email": "flow@example.com",
            "message": "TEST flow message",
        })
        assert r.status_code == 200
        msg_id = r.json()["id"]

        # List as admin
        r = admin_client.get(f"{API}/messages")
        assert r.status_code == 200
        msgs = r.json()
        assert any(m["id"] == msg_id for m in msgs)
        target = next(m for m in msgs if m["id"] == msg_id)
        assert target["status"] == "new"
        assert target["replies"] == []

        # Reply
        r = admin_client.post(f"{API}/messages/{msg_id}/reply", json={"body": "TEST reply body"})
        assert r.status_code == 200
        reply = r.json()
        assert reply["body"] == "TEST reply body"
        assert reply["author"] == ADMIN_EMAIL

        # Verify reply persisted & status updated via list endpoint
        r = admin_client.get(f"{API}/messages")
        assert r.status_code == 200
        msg = next(m for m in r.json() if m["id"] == msg_id)
        assert msg["status"] == "replied"
        assert len(msg["replies"]) == 1
        assert msg["replies"][0]["body"] == "TEST reply body"

        # Cleanup
        admin_client.delete(f"{API}/messages/{msg_id}")

    def test_reply_requires_auth(self, api_client):
        r = api_client.post(f"{API}/messages/anything/reply", json={"body": "x"})
        assert r.status_code == 401


# ----- Click tracking -----
class TestClicks:
    def test_log_click_for_real_product(self, api_client):
        # Use first seeded product id
        products = api_client.get(f"{API}/products").json()
        assert len(products) >= 1
        pid = products[0]["id"]
        r = api_client.post(f"{API}/clicks", json={"product_id": pid, "referrer": "TEST_pytest"})
        assert r.status_code == 200, r.text
        assert r.json().get("ok") is True

    def test_log_click_invalid_product(self, api_client):
        r = api_client.post(f"{API}/clicks", json={"product_id": "non-existent-id-xyz", "referrer": "TEST"})
        assert r.status_code == 404


# ----- Analytics -----
class TestAnalytics:
    def test_summary_requires_auth(self, api_client):
        r = api_client.get(f"{API}/analytics/summary")
        assert r.status_code == 401

    def test_summary_shape(self, admin_client, api_client):
        # Seed a click to make data more meaningful
        products = api_client.get(f"{API}/products").json()
        pid = products[0]["id"]
        api_client.post(f"{API}/clicks", json={"product_id": pid, "referrer": "TEST_analytics"})

        r = admin_client.get(f"{API}/analytics/summary")
        assert r.status_code == 200
        d = r.json()
        for k in ("total_clicks", "clicks_24h", "clicks_7d", "top_products", "daily_clicks", "recent_clicks"):
            assert k in d, f"Missing key: {k}"
        assert isinstance(d["total_clicks"], int) and d["total_clicks"] >= 1
        assert isinstance(d["daily_clicks"], list) and len(d["daily_clicks"]) == 7
        for entry in d["daily_clicks"]:
            assert "date" in entry and "clicks" in entry
        assert isinstance(d["top_products"], list)
        if d["top_products"]:
            tp = d["top_products"][0]
            for k in ("product_id", "name", "slug", "clicks"):
                assert k in tp


# ----- Image uploads -----
def _make_png_bytes() -> bytes:
    # 1x1 transparent PNG (smallest valid PNG)
    import base64
    return base64.b64decode(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
    )


class TestUploads:
    def test_upload_requires_auth(self, api_client):
        png = _make_png_bytes()
        r = api_client.post(
            f"{API}/uploads/image",
            files={"file": ("test.png", png, "image/png")},
            headers={"Content-Type": None},  # let requests build multipart
        )
        assert r.status_code == 401

    def test_upload_png_success(self, admin_token):
        png = _make_png_bytes()
        r = requests.post(
            f"{API}/uploads/image",
            files={"file": ("TEST_tiny.png", png, "image/png")},
            headers={"Authorization": f"Bearer {admin_token}"},
            timeout=60,
        )
        assert r.status_code == 200, r.text
        data = r.json()
        assert "url" in data and data["url"].startswith("/api/files/")
        assert "id" in data and "path" in data

        # Serve back via GET /api/files/{path}
        r2 = requests.get(f"{BASE_URL}{data['url']}", timeout=60)
        assert r2.status_code == 200
        assert r2.headers.get("content-type", "").startswith("image/")
        assert len(r2.content) == len(png)

    def test_upload_rejects_non_image(self, admin_token):
        r = requests.post(
            f"{API}/uploads/image",
            files={"file": ("bad.txt", b"hello world", "text/plain")},
            headers={"Authorization": f"Bearer {admin_token}"},
            timeout=60,
        )
        assert r.status_code == 400

    def test_serve_file_404_for_unknown_path(self, api_client):
        r = api_client.get(f"{API}/files/nonexistent/path/abc.png")
        assert r.status_code == 404

