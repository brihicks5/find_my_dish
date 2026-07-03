def test_signup_success(client):
    resp = client.post("/signup", json={
        "name": "Test User",
        "email": "test@example.com",
        "password": "securepass",
    })
    assert resp.status_code == 200
    data = resp.json()
    assert "token" in data
    assert data["name"] == "Test User"


def test_signup_duplicate_email(client):
    payload = {"name": "Dup User", "email": "dup@example.com", "password": "securepass"}
    client.post("/signup", json=payload)
    resp = client.post("/signup", json=payload)
    assert resp.status_code == 409


def test_signup_missing_fields(client):
    resp = client.post("/signup", json={"name": "No Email"})
    assert resp.status_code == 422


def test_signup_short_password(client):
    resp = client.post("/signup", json={
        "name": "Short Pass",
        "email": "short@example.com",
        "password": "abc",
    })
    assert resp.status_code == 422


def test_signup_invalid_email(client):
    resp = client.post("/signup", json={
        "name": "Bad Email",
        "email": "not-an-email",
        "password": "securepass",
    })
    assert resp.status_code == 422
