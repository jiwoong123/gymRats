from fastapi import APIRouter
from app.api.test.service import test

router = APIRouter()


@router.get("")
def test_router():
    return test()


@router.post("/post")
def post_test():
    return {"message": "post test working"}
