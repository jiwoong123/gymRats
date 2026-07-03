from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.auth.router import router as auth_router
from app.api.test.router import router as test_router
# from app.workouts.router import router as workout_router
# from app.users.router import router as user_router

app = FastAPI(
    title="GymRats",
    version="0.1.0",
)

# Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth_router, prefix="/api/test",tags=["Test"])
app.include_router(auth_router, prefix="/api/auth",tags=["Auth"])
# app.include_router(user_router, prefix="/api/users", tags=["Users"])
# app.include_router(workout_router, prefix="/api/workouts", tags=["Workouts"])

@app.get("/")
def root():
    return {"message": "GymRats backend responsing"}
