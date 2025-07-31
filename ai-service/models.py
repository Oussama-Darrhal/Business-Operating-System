from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

class SentimentLabel(str, Enum):
    POSITIVE = "positive"
    NEGATIVE = "negative"
    NEUTRAL = "neutral"

class ReviewAnalysisRequest(BaseModel):
    review_id: int = Field(..., description="ID of the review to analyze")
    content: str = Field(..., description="Review content text")
    language_code: Optional[str] = Field("en", description="Language code (e.g., 'en', 'es', 'fr')")
    
    class Config:
        json_schema_extra = {
            "example": {
                "review_id": 123,
                "content": "Great product! Really satisfied with the quality and delivery.",
                "language_code": "en"
            }
        }

class ReviewAnalysisResponse(BaseModel):
    review_id: int
    analysis_id: int
    sentiment_score: float = Field(..., description="Sentiment score between -1.0 and 1.0")
    sentiment_label: SentimentLabel
    confidence_score: float = Field(..., description="Confidence score between 0.0 and 1.0")
    keywords: List[str] = Field(default_factory=list, description="Extracted keywords")
    topics: List[str] = Field(default_factory=list, description="Identified topics")
    emotions: Dict[str, float] = Field(default_factory=dict, description="Detected emotions with scores")
    language_code: str
    processed_at: datetime
    
    class Config:
        json_schema_extra = {
            "example": {
                "review_id": 123,
                "analysis_id": 456,
                "sentiment_score": 0.8,
                "sentiment_label": "positive",
                "confidence_score": 0.95,
                "keywords": ["great", "product", "quality", "delivery"],
                "topics": ["product_quality", "shipping"],
                "emotions": {"joy": 0.8, "satisfaction": 0.9},
                "language_code": "en",
                "processed_at": "2024-01-15T10:30:00Z"
            }
        }

class AnalysisResult(BaseModel):
    """Internal model for analysis results"""
    sentiment_score: float
    sentiment_label: SentimentLabel
    confidence_score: float
    keywords: List[str]
    topics: List[str]
    emotions: Dict[str, float]
    language_code: str
    analysis_model: str

class HealthResponse(BaseModel):
    status: str
    service: str
    version: str
    timestamp: datetime
    
class ErrorResponse(BaseModel):
    error: str
    detail: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class BatchAnalysisRequest(BaseModel):
    reviews: List[ReviewAnalysisRequest]
    
class BatchAnalysisResponse(BaseModel):
    results: List[Dict[str, Any]]
    total_processed: int
    success_count: int
    error_count: int 