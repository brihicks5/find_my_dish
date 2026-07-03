import os
import uuid

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

from app.db import Base, get_db
from app.main import app

_db_name = f"find_my_dish_test_{uuid.uuid4().hex[:8]}"
_pg_host = os.environ.get("POSTGRES_HOST", "localhost")
_pg_port = os.environ.get("POSTGRES_PORT", "5432")
_pg_user = os.environ.get("POSTGRES_USER", "")
_pg_password = os.environ.get("POSTGRES_PASSWORD", "")
_pg_userinfo = f"{_pg_user}:{_pg_password}@" if _pg_user else ""
_pg_base = f"postgresql://{_pg_userinfo}{_pg_host}:{_pg_port}"
_admin_url = f"{_pg_base}/postgres"

engine = None
TestSession = None


@pytest.fixture(scope="session", autouse=True)
def setup_database():
    global engine, TestSession

    admin_engine = create_engine(_admin_url, isolation_level="AUTOCOMMIT")
    with admin_engine.connect() as conn:
        conn.execute(text(f"CREATE DATABASE {_db_name}"))
    admin_engine.dispose()

    engine = create_engine(f"{_pg_base}/{_db_name}")
    TestSession = sessionmaker(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)
    engine.dispose()

    admin_engine = create_engine(_admin_url, isolation_level="AUTOCOMMIT")
    with admin_engine.connect() as conn:
        conn.execute(text(f"DROP DATABASE {_db_name}"))
    admin_engine.dispose()


@pytest.fixture()
def db():
    connection = engine.connect()
    transaction = connection.begin()
    session = TestSession(bind=connection)
    yield session
    session.close()
    if transaction.is_active:
        transaction.rollback()
    connection.close()


@pytest.fixture()
def client(db):
    def override_get_db():
        yield db

    app.dependency_overrides[get_db] = override_get_db
    yield TestClient(app)
    app.dependency_overrides.clear()
