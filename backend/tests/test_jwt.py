import os
import unittest


os.environ.setdefault("DB_USER", "test")
os.environ.setdefault("DB_PASSWORD", "test")
os.environ.setdefault("WALLET_LOCATION", "/tmp")
os.environ.setdefault("WALLET_PASSWORD", "test")
os.environ.setdefault("CONNECT_STRING", "test")
os.environ.setdefault("JWT_SECRET_KEY", "unit-test-secret")

from fastapi import HTTPException

from app.auth.jwt import (
    create_access_token,
    create_refresh_token,
    decode_token,
    get_current_user_id,
)


class JwtTests(unittest.TestCase):
    def test_refresh_token_cannot_authenticate_api_request(self):
        refresh_token, _ = create_refresh_token(11)

        with self.assertRaises(HTTPException) as raised:
            get_current_user_id(refresh_token)

        self.assertEqual(raised.exception.status_code, 401)

    def test_access_token_cannot_be_refreshed(self):
        with self.assertRaises(ValueError):
            decode_token(create_access_token(11), expected_type="refresh")

    def test_refresh_tokens_are_unique(self):
        first, _ = create_refresh_token(11)
        second, _ = create_refresh_token(11)

        self.assertNotEqual(first, second)

    def test_subject_must_be_a_positive_integer_string(self):
        from jose import jwt

        token = jwt.encode(
            {"sub": "invalid", "type": "access"},
            "unit-test-secret",
            algorithm="HS256",
        )

        with self.assertRaises(ValueError):
            decode_token(token, expected_type="access")


if __name__ == "__main__":
    unittest.main()
