from collections.abc import Generator

from fastapi import Depends
from sqlmodel import Session

from app.core.database import get_session


def get_db(session: Session = Depends(get_session)) -> Generator[Session, None, None]:
    yield session
