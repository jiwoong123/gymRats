from faker import Faker

from app.models.user import User
from app.auth.password import hash_password

fake = Faker("ko_KR")


def seed_users(db):

    users = []

    for i in range(10):

        user = User(
            email=f"user{i}@gymrats.com",
            password_hashed=hash_password("seeduser"),
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