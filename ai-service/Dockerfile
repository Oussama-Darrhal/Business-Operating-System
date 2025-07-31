FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Upgrade pip and set timeout
RUN pip install --upgrade pip

# Install core dependencies first (most stable)
RUN pip install --no-cache-dir --timeout=300 \
    fastapi==0.104.1 \
    uvicorn[standard]==0.24.0 \
    pydantic==2.5.0 \
    python-multipart==0.0.6 \
    python-dotenv==1.0.0

# Install database dependencies
RUN pip install --no-cache-dir --timeout=300 \
    mysql-connector-python==8.2.0 \
    sqlalchemy==2.0.23

# Install text processing
RUN pip install --no-cache-dir --timeout=300 \
    textblob==0.17.1 \
    httpx==0.25.2

# Install scientific libraries
RUN pip install --no-cache-dir --timeout=300 \
    numpy==1.24.4

RUN pip install --no-cache-dir --timeout=300 \
    scikit-learn==1.3.2

# Install Google Cloud (optional - may fail gracefully)
RUN pip install --no-cache-dir --timeout=300 \
    google-cloud-language==2.11.1 \
    google-auth==2.23.4 || echo "Google Cloud packages failed to install - will use fallback"

COPY . .

# Download TextBlob corpora
RUN python -c "import nltk; nltk.download('punkt')" || echo "NLTK download failed - will continue"

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"] 