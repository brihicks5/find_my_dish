import bcrypt
import jwt
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import config
from app.dao.user import create_user, get_user_by_email
from app.db import get_db
from app.schemas import LoginRequest, LoginResponse, SignupRequest, SignupResponse

router = APIRouter()


@router.post("/signup", response_model=SignupResponse)
def signup(body: SignupRequest, db: Session = Depends(get_db)):
    existing = get_user_by_email(db, body.email)
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")

    password_hash = bcrypt.hashpw(body.password.encode(), bcrypt.gensalt()).decode()
    user = create_user(db, name=body.name, email=body.email, password_hash=password_hash)

    token = jwt.encode({"sub": user.id, "name": user.name}, config.SECRET_KEY, algorithm="HS256")

    return SignupResponse(token=token, name=user.name)


@router.post("/login", response_model=LoginResponse)
def login(body: LoginRequest, db: Session = Depends(get_db)):
    user = get_user_by_email(db, body.email)
    if not user or not bcrypt.checkpw(body.password.encode(), user.password_hash.encode()):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = jwt.encode({"sub": user.id, "name": user.name}, config.SECRET_KEY, algorithm="HS256")

    return LoginResponse(token=token, name=user.name)
