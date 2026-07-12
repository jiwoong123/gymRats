from pwdlib import PasswordHash

password_hasher = PasswordHash.recommended()


def hash_password(password: str):

    return password_hasher.hash(password)


def verify_password(
    password: str,
    password_hashed: str,
):

    return password_hasher.verify(
        password,
        password_hashed,
    )
