FROM python:3.12-slim
WORKDIR /app
RUN useradd --system --uid 10001 --create-home wish && mkdir /data && chown wish /data
COPY --chown=wish:wish *.py *.html ./
USER wish
ENV HOST=0.0.0.0 PORT=8080 WISH_DB=/data/world.sqlite3 PYTHONUNBUFFERED=1
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8080/healthz',timeout=3).close()"
CMD ["python","server.py"]
