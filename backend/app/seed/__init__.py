from faker import Faker

from app.models.user import User
from app.auth.jwt import get_password_hash

fake = Faker("ko_KR")


def seed_users(db):

    users = []

    for i in range(10):

        user = User(
            email=f"user{i}@gymrats.com",
            password_hashed=get_password_hash("tmxjsxmaos2"),
            nickname=fake.name(),
            gender=i % 2,
            birth=fake.date_of_birth(
                minimum_age=18,
                maximum_age=35,
            ),
            height=round(fake.random.uniform(160, 190), 1),
        )

        db.add(user)

        users.append(user)

    db.flush()

    return users