def _signup(client, email="login@example.com"):
    client.post("/signup", json={
        "name": "Login User",
        "email": email,
        "password": "securepass",
    })


def test_login_success(client):
    _signup(client)
    resp = client.post("/login", json={"email": "login@example.com", "password": "securepass"})
    assert resp.status_code == 200
    data = resp.json()
    assert "token" in data
    assert data["name"] == "Login User"


def test_login_wrong_password(client):
    _signup(client, email="wrong@example.com")
    resp = client.post("/login", json={"email": "wrong@example.com", "password": "badpassword"})
    assert resp.status_code == 401


def test_login_nonexistent_email(client):
    resp = client.post("/login", json={"email": "nobody@example.com", "password": "securepass"})
    assert resp.status_code == 401


def test_login_invalid_email_format(client):
    resp = client.post("/login", json={"email": "not-an-email", "password": "securepass"})
    assert resp.status_code == 422


def test_login_missing_password(client):
    resp = client.post("/login", json={"email": "login@example.com"})
    assert resp.status_code == 422
