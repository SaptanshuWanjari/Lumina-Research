def _create_case(client):
    response = client.post(
        "/api/v1/cases",
        json={"title": "Case R", "question": "Q", "priority": 0, "tags": []},
    )
    return response.json()["id"]


def test_runs_flow(client, monkeypatch):
    case_id = _create_case(client)

    def _noop_enqueue(*args, **kwargs):
        return None

    monkeypatch.setattr("app.services.queue.enqueue_run", _noop_enqueue)
    monkeypatch.setattr("app.services.queue.enqueue_resume", _noop_enqueue)
    monkeypatch.setattr("app.services.queue.enqueue_retry", _noop_enqueue)

    create = client.post(
        f"/api/v1/cases/{case_id}/runs",
        json={
            "depth": "deep",
            "citation_strictness": "strict",
            "human_review_enabled": True,
        },
    )
    assert create.status_code == 201
    run_id = create.json()["id"]
    assert create.json()["run_config"]["depth"] == "deep"

    list_resp = client.get(f"/api/v1/cases/{case_id}/runs")
    assert list_resp.status_code == 200
    assert len(list_resp.json()) == 1

    read_resp = client.get(f"/api/v1/cases/{case_id}/runs/{run_id}")
    assert read_resp.status_code == 200
    assert read_resp.json()["id"] == run_id

    approve = client.post(f"/api/v1/runs/{run_id}/approve")
    assert approve.status_code == 200
    assert approve.json()["status"] == "resuming"

    retry_conflict = client.post(f"/api/v1/runs/{run_id}/retry")
    assert retry_conflict.status_code == 409


def test_create_run_uses_default_run_config(client, monkeypatch):
    case_id = _create_case(client)

    def _noop_enqueue(*args, **kwargs):
        return None

    monkeypatch.setattr("app.services.queue.enqueue_run", _noop_enqueue)

    create = client.post(f"/api/v1/cases/{case_id}/runs")
    assert create.status_code == 201
    assert create.json()["run_config"] == {
        "depth": "standard",
        "citation_strictness": "strict",
        "human_review_enabled": True,
    }


def test_create_run_rejects_invalid_depth(client):
    case_id = _create_case(client)

    response = client.post(
        f"/api/v1/cases/{case_id}/runs",
        json={"depth": "extreme"},
    )

    assert response.status_code == 422


def test_failed_run_can_be_retried(client, mock_supabase, monkeypatch):
    case_id = _create_case(client)

    def _noop_enqueue(*args, **kwargs):
        return None

    monkeypatch.setattr("app.services.queue.enqueue_run", _noop_enqueue)
    monkeypatch.setattr("app.services.queue.enqueue_retry", _noop_enqueue)

    create = client.post(f"/api/v1/cases/{case_id}/runs")
    assert create.status_code == 201
    run_id = create.json()["id"]

    for row in mock_supabase.db_store["runs"]:
        if row["id"] == run_id:
            row.update(
                {
                    "status": "failed",
                    "current_step": "publish",
                    "error_message": "boom",
                }
            )

    retry = client.post(f"/api/v1/runs/{run_id}/retry")
    assert retry.status_code == 200
    assert retry.json()["status"] == "queued"
    assert retry.json()["error_message"] is None
