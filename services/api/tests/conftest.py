import os
import pytest
from fastapi.testclient import TestClient
from unittest.mock import MagicMock, patch
from uuid import uuid4
from datetime import datetime, timezone

from app.main import app
from app.core.security import TokenPayload
from app.core.database import get_supabase
from app.core.security import get_current_user


class MockResponse:
    """Mock Supabase response object."""

    def __init__(self, data):
        self.data = data if isinstance(data, list) else [data] if data else []


class MockQuery:
    """Mock query builder for chaining."""

    def __init__(self, table_name, db_store):
        self.table_name = table_name
        self.db_store = db_store
        self.filters = {}
        self._insert_data = None
        self._update_data = None
        self._is_delete = False

    def select(self, fields="*"):
        return self

    def eq(self, field, value):
        self.filters[field] = value
        return self

    def insert(self, data):
        """Mark data for insertion (returns self for chaining)."""
        self._insert_data = data
        return self

    def update(self, data):
        """Mark data for update (returns self for chaining)."""
        self._update_data = data
        return self

    def delete(self):
        """Mark for deletion (returns self for chaining)."""
        self._is_delete = True
        return self

    def execute(self):
        """Execute the query and return matching rows."""
        if self._insert_data is not None:
            # Insert operation
            if not self.db_store.get(self.table_name):
                self.db_store[self.table_name] = []

            data = self._insert_data.copy()
            # Auto-generate fields if missing
            if "id" not in data:
                data["id"] = str(uuid4())
            if "created_at" not in data:
                data["created_at"] = datetime.now(timezone.utc).isoformat()
            if "updated_at" not in data:
                data["updated_at"] = datetime.now(timezone.utc).isoformat()
            # Provide sensible defaults for required fields
            if "status" not in data or data["status"] is None:
                data["status"] = "draft"
            if "priority" not in data or data["priority"] is None:
                data["priority"] = 0
            if "tags" not in data or data["tags"] is None:
                data["tags"] = []
            if "archived_at" not in data:
                data["archived_at"] = None

            self.db_store[self.table_name].append(data)
            return MockResponse(data)

        elif self._update_data is not None:
            # Update operation
            table_data = self.db_store.get(self.table_name, [])
            results = []

            for row in table_data:
                match = all(row.get(k) == v for k, v in self.filters.items())
                if match:
                    row.update(self._update_data)
                    row["updated_at"] = datetime.now(timezone.utc).isoformat()
                    results.append(row)

            return MockResponse(results)

        elif self._is_delete:
            # Delete operation
            table_data = self.db_store.get(self.table_name, [])
            deleted = []
            remaining = []

            for row in table_data:
                match = all(row.get(k) == v for k, v in self.filters.items())
                if match:
                    deleted.append(row)
                else:
                    remaining.append(row)

            self.db_store[self.table_name] = remaining
            return MockResponse(deleted)

        else:
            # Select operation
            table_data = self.db_store.get(self.table_name, [])

            # Filter by all eq conditions
            if self.filters:
                results = []
                for row in table_data:
                    match = all(row.get(k) == v for k, v in self.filters.items())
                    if match:
                        results.append(row)
                return MockResponse(results)
            else:
                return MockResponse(table_data)


class MockTable:
    """Mock table object."""

    def __init__(self, table_name, db_store):
        self.table_name = table_name
        self.db_store = db_store

    def select(self, fields="*"):
        return MockQuery(self.table_name, self.db_store)

    def insert(self, data):
        """Create query for insert (returns MockQuery for chaining)."""
        return MockQuery(self.table_name, self.db_store).insert(data)

    def update(self, data):
        """Create query for update (returns MockQuery for chaining)."""
        return MockQuery(self.table_name, self.db_store).update(data)

    def delete(self):
        """Create query for delete (returns MockQuery for chaining)."""
        return MockQuery(self.table_name, self.db_store).delete()


class MockStorage:
    """Mock Supabase storage."""

    def from_(self, bucket):
        return self

    def upload(self, path, content, file_options=None):
        return MockResponse({"path": path})


class MockSupabase:
    """Mock Supabase client."""

    def __init__(self):
        self.db_store = {}
        self.storage = MockStorage()

    def table(self, name):
        return MockTable(name, self.db_store)


@pytest.fixture()
def mock_supabase():
    """Mock Supabase client for testing."""
    return MockSupabase()


@pytest.fixture()
def client(mock_supabase, monkeypatch):
    """Test client with mocked dependencies."""

    def _mock_get_supabase():
        return mock_supabase

    def _mock_get_current_user():
        return TokenPayload(sub="user-123", role="authenticated")

    def _noop_enqueue(*args, **kwargs):
        return None

    def _noop_upload(*args, **kwargs):
        return None

    def _noop_send_task(*args, **kwargs):
        return None

    # Override dependencies
    app.dependency_overrides[get_supabase] = _mock_get_supabase
    app.dependency_overrides[get_current_user] = _mock_get_current_user

    # Mock queue functions to avoid Redis errors in tests
    monkeypatch.setattr("app.services.queue.enqueue_ingestion", _noop_enqueue)
    monkeypatch.setattr("app.services.queue.enqueue_run", _noop_enqueue)
    monkeypatch.setattr("app.services.queue.enqueue_resume", _noop_enqueue)

    # Mock storage to avoid Supabase storage errors
    monkeypatch.setattr("app.services.storage.upload_source_file", _noop_upload)

    # Mock Celery app's send_task to avoid Redis connection attempts
    from app.services.queue import celery_app

    monkeypatch.setattr(celery_app, "send_task", _noop_send_task)

    with TestClient(app) as test_client:
        yield test_client

    # Clean up overrides
    app.dependency_overrides.clear()
