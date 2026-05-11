def test_create_and_read_case(client):
    create = client.post(
        "/api/v1/cases",
        json={
            "title": "Case A",
            "question": "What happened?",
            "priority": 1,
            "tags": ["x"],
        },
    )
    assert create.status_code == 201
    created = create.json()
    assert created["title"] == "Case A"

    read = client.get(f"/api/v1/cases/{created['id']}")
    assert read.status_code == 200
    assert read.json()["id"] == created["id"]


def test_update_case(client):
    create = client.post(
        "/api/v1/cases",
        json={"title": "Case B", "question": "Q", "priority": 0, "tags": []},
    )
    case_id = create.json()["id"]

    update = client.patch(
        f"/api/v1/cases/{case_id}",
        json={"title": "Case B Updated", "priority": 2},
    )
    assert update.status_code == 200
    assert update.json()["title"] == "Case B Updated"


def test_delete_case(client):
    create = client.post(
        "/api/v1/cases",
        json={"title": "Case C", "question": "Q", "priority": 0, "tags": []},
    )
    case_id = create.json()["id"]

    delete = client.delete(f"/api/v1/cases/{case_id}")
    assert delete.status_code == 204

    read = client.get(f"/api/v1/cases/{case_id}")
    assert read.status_code == 404
