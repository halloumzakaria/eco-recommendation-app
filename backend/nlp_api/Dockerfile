FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Expose both ports if you have two Flask apps
EXPOSE 5001 5003

# Adjust the CMD to run both apps if needed, or use a process manager like `gunicorn` or `supervisord`
# For simplicity, let's assume you want to run one app (change as needed):
CMD ["python", "app.py"]
