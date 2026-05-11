from io import BytesIO


def _create_case(client):
    response = client.post(
        "/api/v1/cases",
        json={"title": "Case S", "question": "Q", "priority": 0, "tags": []},
    )
    return response.json()["id"]


def test_sources_flow(client, monkeypatch):
    case_id = _create_case(client)

    def _noop_upload(*args, **kwargs):
        return None

    def _noop_enqueue(*args, **kwargs):
        return None

    monkeypatch.setattr("app.services.storage.upload_source_file", _noop_upload)
    monkeypatch.setattr("app.services.queue.enqueue_ingestion", _noop_enqueue)

    files = {"file": ("test.txt", BytesIO(b"hello"), "text/plain")}
    create = client.post(f"/api/v1/cases/{case_id}/sources", files=files)
    assert create.status_code == 201
    source_id = create.json()["id"]

    list_resp = client.get(f"/api/v1/cases/{case_id}/sources")
    assert list_resp.status_code == 200
    assert len(list_resp.json()) == 1

    read_resp = client.get(f"/api/v1/cases/{case_id}/sources/{source_id}")
    assert read_resp.status_code == 200
    assert read_resp.json()["id"] == source_id
