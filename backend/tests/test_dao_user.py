import bcrypt
import pytest
from sqlalchemy.exc import IntegrityError

from app.dao.user import create_user, get_user_by_email


def _hash(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def test_create_user(db):
    user = create_user(db, name="Alice", email="alice@example.com", password_hash=_hash("password1"))
    assert user.id is not None
    assert user.name == "Alice"
    assert user.email == "alice@example.com"
    assert user.created_at is not None


def test_get_user_by_email_found(db):
    create_user(db, name="Bob", email="bob@example.com", password_hash=_hash("password1"))
    found = get_user_by_email(db, "bob@example.com")
    assert found is not None
    assert found.name == "Bob"


def test_get_user_by_email_not_found(db):
    result = get_user_by_email(db, "nobody@example.com")
    assert result is None


def test_duplicate_email_raises(db):
    create_user(db, name="Carol", email="carol@example.com", password_hash=_hash("password1"))
    with pytest.raises(IntegrityError):
        create_user(db, name="Carol2", email="carol@example.com", password_hash=_hash("password2"))
