FROM python:3.13-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /services/worker

RUN pip install --upgrade pip uv

COPY services/worker/pyproject.toml services/worker/uv.lock ./
RUN uv export --frozen --no-dev --format requirements-txt > requirements.txt \
    && pip install -r requirements.txt

COPY services/worker/ ./

CMD ["python", "main.py"]
