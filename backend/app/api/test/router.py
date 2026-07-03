from fastapi import APIRouter
from app.api.test.service import test

router = APIRouter()

@router.get("/")
def test_router():
    return test()
