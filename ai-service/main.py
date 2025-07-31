from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import os
from datetime import datetime
import logging

from database import get_database, DatabaseManager
from ai_analyzer import AIAnalyzer
from models import ReviewAnalysisRequest, ReviewAnalysisResponse, HealthResponse

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="BOS AI Analysis Service",
    description="AI-powered sentiment analysis and topic extraction for Business Operating System",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize AI Analyzer
ai_analyzer = AIAnalyzer()

@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    logger.info("Starting AI Analysis Service...")
    await ai_analyzer.initialize()
    logger.info("AI Analysis Service started successfully")

@app.get("/", response_model=HealthResponse)
async def root():
    """Health check endpoint"""
    return HealthResponse(
        status="healthy",
        service="ai-analysis-service",
        version="1.0.0",
        timestamp=datetime.utcnow()
    )

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Detailed health check"""
    return HealthResponse(
        status="healthy",
        service="ai-analysis-service",
        version="1.0.0",
        timestamp=datetime.utcnow()
    )

@app.post("/analyze/review", response_model=ReviewAnalysisResponse)
async def analyze_review(
    request: ReviewAnalysisRequest,
    db: DatabaseManager = Depends(get_database)
):
    """
    Analyze a customer review for sentiment, keywords, and topics
    """
    try:
        logger.info(f"Analyzing review ID: {request.review_id}")
        
        # Perform AI analysis
        analysis_result = await ai_analyzer.analyze_text(
            text=request.content,
            language=request.language_code
        )
        
        # Store results in database
        analysis_id = await db.store_analysis_result(
            review_id=request.review_id,
            analysis_result=analysis_result
        )
        
        # Return response
        response = ReviewAnalysisResponse(
            review_id=request.review_id,
            analysis_id=analysis_id,
            sentiment_score=analysis_result.sentiment_score,
            sentiment_label=analysis_result.sentiment_label,
            confidence_score=analysis_result.confidence_score,
            keywords=analysis_result.keywords,
            topics=analysis_result.topics,
            emotions=analysis_result.emotions,
            language_code=analysis_result.language_code,
            processed_at=datetime.utcnow()
        )
        
        logger.info(f"Analysis completed for review ID: {request.review_id}")
        return response
        
    except Exception as e:
        logger.error(f"Error analyzing review {request.review_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.post("/analyze/batch")
async def analyze_batch_reviews(
    requests: List[ReviewAnalysisRequest],
    db: DatabaseManager = Depends(get_database)
):
    """
    Analyze multiple reviews in batch
    """
    try:
        logger.info(f"Batch analyzing {len(requests)} reviews")
        
        results = []
        for request in requests:
            try:
                analysis_result = await ai_analyzer.analyze_text(
                    text=request.content,
                    language=request.language_code
                )
                
                analysis_id = await db.store_analysis_result(
                    review_id=request.review_id,
                    analysis_result=analysis_result
                )
                
                results.append({
                    "review_id": request.review_id,
                    "analysis_id": analysis_id,
                    "status": "success",
                    "sentiment": analysis_result.sentiment_label
                })
                
            except Exception as e:
                logger.error(f"Error in batch analysis for review {request.review_id}: {str(e)}")
                results.append({
                    "review_id": request.review_id,
                    "status": "error",
                    "error": str(e)
                })
        
        return {"results": results, "total_processed": len(results)}
        
    except Exception as e:
        logger.error(f"Batch analysis failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Batch analysis failed: {str(e)}")

@app.get("/analysis/{review_id}")
async def get_analysis_result(
    review_id: int,
    db: DatabaseManager = Depends(get_database)
):
    """
    Get existing analysis result for a review
    """
    try:
        result = await db.get_analysis_result(review_id)
        if not result:
            raise HTTPException(status_code=404, detail="Analysis result not found")
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving analysis for review {review_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve analysis")

@app.delete("/analysis/{review_id}")
async def delete_analysis_result(
    review_id: int,
    db: DatabaseManager = Depends(get_database)
):
    """
    Delete analysis result for a review
    """
    try:
        deleted = await db.delete_analysis_result(review_id)
        if not deleted:
            raise HTTPException(status_code=404, detail="Analysis result not found")
        return {"message": "Analysis result deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting analysis for review {review_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to delete analysis")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 