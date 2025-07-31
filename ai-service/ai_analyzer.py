import os
import logging
from typing import List, Dict, Any
import asyncio
from datetime import datetime

# Google Cloud imports
try:
    from google.cloud import language_v1
    from google.oauth2 import service_account
    GOOGLE_CLOUD_AVAILABLE = True
except ImportError:
    GOOGLE_CLOUD_AVAILABLE = False
    logging.warning("Google Cloud Language library not available")

# Fallback imports
from textblob import TextBlob
import re
from collections import Counter

from models import AnalysisResult, SentimentLabel

logger = logging.getLogger(__name__)

class AIAnalyzer:
    def __init__(self):
        self.google_client = None
        self.use_google_cloud = False
        
    async def initialize(self):
        """Initialize the AI analyzer with available services"""
        await self._setup_google_cloud()
        logger.info(f"AI Analyzer initialized. Google Cloud: {self.use_google_cloud}")
        
    async def _setup_google_cloud(self):
        """Setup Google Cloud Language client if credentials are available"""
        if not GOOGLE_CLOUD_AVAILABLE:
            logger.warning("Google Cloud Language library not installed")
            return
            
        credentials_path = os.getenv('GOOGLE_APPLICATION_CREDENTIALS')
        if not credentials_path or not os.path.exists(credentials_path):
            logger.warning("Google Cloud credentials not found, using fallback analysis")
            return
            
        try:
            credentials = service_account.Credentials.from_service_account_file(credentials_path)
            self.google_client = language_v1.LanguageServiceClient(credentials=credentials)
            self.use_google_cloud = True
            logger.info("Google Cloud Language client initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize Google Cloud client: {e}")
            
    async def analyze_text(self, text: str, language: str = "en") -> AnalysisResult:
        """
        Analyze text for sentiment, keywords, and topics
        """
        if self.use_google_cloud and self.google_client:
            return await self._analyze_with_google_cloud(text, language)
        else:
            return await self._analyze_with_fallback(text, language)
            
    async def _analyze_with_google_cloud(self, text: str, language: str) -> AnalysisResult:
        """Analyze using Google Cloud Language API"""
        try:
            document = language_v1.Document(
                content=text,
                type_=language_v1.Document.Type.PLAIN_TEXT,
                language=language
            )
            
            # Sentiment analysis
            sentiment_response = self.google_client.analyze_sentiment(
                request={"document": document}
            )
            
            # Entity analysis for keywords/topics
            entities_response = self.google_client.analyze_entities(
                request={"document": document}
            )
            
            # Extract sentiment
            sentiment = sentiment_response.document_sentiment
            sentiment_score = sentiment.score
            confidence_score = sentiment.magnitude
            
            # Determine sentiment label
            if sentiment_score > 0.1:
                sentiment_label = SentimentLabel.POSITIVE
            elif sentiment_score < -0.1:
                sentiment_label = SentimentLabel.NEGATIVE
            else:
                sentiment_label = SentimentLabel.NEUTRAL
                
            # Extract entities as keywords/topics
            keywords = []
            topics = []
            
            for entity in entities_response.entities:
                if entity.salience > 0.1:  # Only significant entities
                    if entity.type_.name in ['PERSON', 'ORGANIZATION', 'LOCATION']:
                        topics.append(entity.name.lower())
                    else:
                        keywords.append(entity.name.lower())
            
            # Basic emotion mapping based on sentiment
            emotions = self._map_emotions_from_sentiment(sentiment_score, confidence_score)
            
            return AnalysisResult(
                sentiment_score=sentiment_score,
                sentiment_label=sentiment_label,
                confidence_score=min(confidence_score, 1.0),
                keywords=keywords[:10],  # Limit to top 10
                topics=topics[:5],       # Limit to top 5
                emotions=emotions,
                language_code=language,
                analysis_model="google-cloud-language-v1"
            )
            
        except Exception as e:
            logger.error(f"Google Cloud analysis failed: {e}")
            return await self._analyze_with_fallback(text, language)
            
    async def _analyze_with_fallback(self, text: str, language: str) -> AnalysisResult:
        """Fallback analysis using TextBlob and basic NLP"""
        try:
            # Use TextBlob for sentiment
            blob = TextBlob(text)
            sentiment_score = blob.sentiment.polarity
            confidence_score = blob.sentiment.subjectivity
            
            # Determine sentiment label
            if sentiment_score > 0.1:
                sentiment_label = SentimentLabel.POSITIVE
            elif sentiment_score < -0.1:
                sentiment_label = SentimentLabel.NEGATIVE
            else:
                sentiment_label = SentimentLabel.NEUTRAL
                
            # Extract keywords using basic NLP
            keywords = self._extract_keywords_basic(text)
            topics = self._extract_topics_basic(text)
            emotions = self._map_emotions_from_sentiment(sentiment_score, confidence_score)
            
            return AnalysisResult(
                sentiment_score=sentiment_score,
                sentiment_label=sentiment_label,
                confidence_score=confidence_score,
                keywords=keywords,
                topics=topics,
                emotions=emotions,
                language_code=language,
                analysis_model="textblob-fallback"
            )
            
        except Exception as e:
            logger.error(f"Fallback analysis failed: {e}")
            raise
            
    def _extract_keywords_basic(self, text: str) -> List[str]:
        """Extract keywords using basic text processing"""
        # Remove common stop words
        stop_words = {
            'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 
            'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'be', 
            'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 
            'could', 'should', 'can', 'may', 'might', 'must', 'this', 'that', 
            'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they'
        }
        
        # Clean and tokenize
        words = re.findall(r'\b[a-zA-Z]{3,}\b', text.lower())
        words = [word for word in words if word not in stop_words]
        
        # Get most common words
        word_counts = Counter(words)
        keywords = [word for word, count in word_counts.most_common(10)]
        
        return keywords
        
    def _extract_topics_basic(self, text: str) -> List[str]:
        """Extract basic topics based on keywords"""
        text_lower = text.lower()
        
        topic_keywords = {
            'product_quality': ['quality', 'good', 'bad', 'excellent', 'poor', 'defective'],
            'shipping': ['delivery', 'shipping', 'fast', 'slow', 'arrived', 'delayed'],
            'customer_service': ['service', 'support', 'staff', 'helpful', 'rude', 'friendly'],
            'price': ['price', 'cost', 'expensive', 'cheap', 'value', 'money'],
            'packaging': ['packaging', 'box', 'wrapped', 'damaged', 'package'],
            'website': ['website', 'online', 'app', 'interface', 'easy', 'difficult']
        }
        
        topics = []
        for topic, keywords in topic_keywords.items():
            if any(keyword in text_lower for keyword in keywords):
                topics.append(topic)
                
        return topics[:5]
        
    def _map_emotions_from_sentiment(self, sentiment_score: float, confidence: float) -> Dict[str, float]:
        """Map sentiment to basic emotions"""
        emotions = {}
        
        if sentiment_score > 0.5:
            emotions.update({
                'joy': min(sentiment_score * confidence, 1.0),
                'satisfaction': min((sentiment_score + 0.2) * confidence, 1.0)
            })
        elif sentiment_score > 0.1:
            emotions.update({
                'satisfaction': min(sentiment_score * confidence, 1.0)
            })
        elif sentiment_score < -0.5:
            emotions.update({
                'anger': min(abs(sentiment_score) * confidence, 1.0),
                'disappointment': min((abs(sentiment_score) + 0.2) * confidence, 1.0)
            })
        elif sentiment_score < -0.1:
            emotions.update({
                'disappointment': min(abs(sentiment_score) * confidence, 1.0)
            })
        else:
            emotions.update({
                'neutral': min(confidence, 1.0)
            })
            
        return emotions 