# BOS AI Analysis Service

AI-powered sentiment analysis and topic extraction service for the Business Operating System (BOS).

## Features

- **Sentiment Analysis**: Determines positive, negative, or neutral sentiment with confidence scores
- **Keyword Extraction**: Identifies important keywords from review text
- **Topic Detection**: Categorizes reviews into business-relevant topics
- **Emotion Analysis**: Maps sentiment to specific emotions
- **Multi-language Support**: Supports multiple languages through Google Cloud Language API
- **Fallback Analysis**: Uses TextBlob when Google Cloud is unavailable

## API Endpoints

### Health Check
- `GET /` - Basic health check
- `GET /health` - Detailed health status

### Analysis Endpoints
- `POST /analyze/review` - Analyze a single review
- `POST /analyze/batch` - Analyze multiple reviews in batch
- `GET /analysis/{review_id}` - Get existing analysis result
- `DELETE /analysis/{review_id}` - Delete analysis result

## Quick Start

1. **Set up Google Cloud credentials** (optional):
   ```bash
   # Place your service account key file:
   cp your-gcp-key.json ai-service/gcp-service-account.json
   ```

2. **Start the service**:
   ```bash
   docker-compose up ai-service
   ```

3. **Test the API**:
   ```bash
   curl -X POST "http://localhost:8001/analyze/review" \
     -H "Content-Type: application/json" \
     -d '{
       "review_id": 123,
       "content": "Great product! Really satisfied with quality.",
       "language_code": "en"
     }'
   ```

## Configuration

Environment variables can be set in `env.example` or through Docker environment:

- `DATABASE_URL` - MySQL connection string
- `GOOGLE_APPLICATION_CREDENTIALS` - Path to GCP service account key
- `LOG_LEVEL` - Logging level (DEBUG, INFO, WARNING, ERROR)

## Analysis Features

### Sentiment Analysis
- Score range: -1.0 (very negative) to +1.0 (very positive)
- Labels: positive, negative, neutral
- Confidence scores for reliability assessment

### Topic Detection
Automatically identifies common business topics:
- `product_quality` - Quality-related feedback
- `shipping` - Delivery and shipping issues
- `customer_service` - Service experience
- `price` - Pricing and value concerns
- `packaging` - Packaging quality
- `website` - Online experience

### Emotion Mapping
Maps sentiment to specific emotions:
- **Positive**: joy, satisfaction
- **Negative**: anger, disappointment
- **Neutral**: neutral state

## Google Cloud Integration

When properly configured with Google Cloud credentials, the service uses:
- Google Cloud Language API for advanced sentiment analysis
- Entity extraction for improved keyword identification
- Multi-language detection and analysis

## Fallback Mode

Without Google Cloud, the service uses:
- TextBlob for basic sentiment analysis
- Regular expressions for keyword extraction
- Rule-based topic detection

## Database Integration

Results are automatically stored in the `ai_analysis_results` table with:
- Sentiment scores and labels
- Extracted keywords and topics
- Emotion analysis results
- Processing metadata

## API Documentation

Once running, visit `http://localhost:8001/docs` for interactive API documentation. 