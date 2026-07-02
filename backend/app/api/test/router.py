from fastapi import APIRouter
from .service import test

router = APIRouter()

@router.get("/")
def test_router():
    return test()
