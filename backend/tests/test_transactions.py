import os
import unittest
from types import SimpleNamespace
from unittest.mock import Mock, patch


os.environ.setdefault("DB_USER", "test")
os.environ.setdefault("DB_PASSWORD", "test")
os.environ.setdefault("WALLET_LOCATION", "/tmp")
os.environ.setdefault("WALLET_PASSWORD", "test")
os.environ.setdefault("CONNECT_STRING", "test")
os.environ.setdefault("JWT_SECRET_KEY", "unit-test-secret")

from app.api.auth.services.refresh import refresh
from app.db import dependencies


class TransactionTests(unittest.TestCase):
    def test_request_dependency_commits_successful_work(self):
        session = Mock()
        with patch.object(dependencies, "SessionLocal", return_value=session):
            dependency = dependencies.get_db()
            self.assertIs(next(dependency), session)
            with self.assertRaises(StopIteration):
                next(dependency)

        session.commit.assert_called_once_with()
        session.rollback.assert_not_called()
        session.close.assert_called_once_with()

    def test_request_dependency_rolls_back_failed_work(self):
        session = Mock()
        with patch.object(dependencies, "SessionLocal", return_value=session):
            dependency = dependencies.get_db()
            next(dependency)
            with self.assertRaisesRegex(RuntimeError, "failed"):
                dependency.throw(RuntimeError("failed"))

        session.commit.assert_not_called()
        session.rollback.assert_called_once_with()
        session.close.assert_called_once_with()

    @patch("app.api.auth.services.refresh.create_access_token", return_value="access")
    @patch(
        "app.api.auth.services.refresh.create_refresh_token",
        return_value=("replacement", SimpleNamespace()),
    )
    @patch("app.api.auth.services.refresh.decode_token", return_value={"sub": "11"})
    @patch("app.api.auth.services.refresh.UserRepository.get_user_by_id")
    @patch("app.api.auth.services.refresh.RefreshTokenRepository.get_refresh_token_for_update")
    def test_refresh_rotation_uses_one_commit(
        self,
        get_locked_token,
        get_user,
        _decode,
        _create_refresh,
        _create_access,
    ):
        session = Mock()
        get_user.return_value = SimpleNamespace(id=11)
        saved = SimpleNamespace(user_id=11)
        get_locked_token.return_value = saved

        response = refresh(session, SimpleNamespace(refresh_token="original"))

        session.delete.assert_called_once_with(saved)
        session.add.assert_called_once()
        session.commit.assert_called_once_with()
        session.rollback.assert_not_called()
        self.assertEqual(response.access_token, "access")
        self.assertEqual(response.refresh_token, "replacement")


if __name__ == "__main__":
    unittest.main()
