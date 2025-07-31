import os
import logging
from typing import Optional, Dict, Any
import json
from datetime import datetime

import mysql.connector
from mysql.connector import Error
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
import asyncio

from models import AnalysisResult

logger = logging.getLogger(__name__)

class DatabaseManager:
    def __init__(self):
        self.connection = None
        self.engine = None
        self.SessionLocal = None
        
    async def connect(self):
        """Establish database connection"""
        try:
            database_url = os.getenv('DATABASE_URL', 'mysql://laravel:password@mysql:3306/laravel')
            
            # Parse the database URL
            if database_url.startswith('mysql://'):
                # Format: mysql://user:password@host:port/database
                url_parts = database_url.replace('mysql://', '').split('/')
                connection_part = url_parts[0]
                database_name = url_parts[1] if len(url_parts) > 1 else 'laravel'
                
                auth_host = connection_part.split('@')
                user_pass = auth_host[0].split(':')
                host_port = auth_host[1].split(':')
                
                config = {
                    'user': user_pass[0],
                    'password': user_pass[1] if len(user_pass) > 1 else '',
                    'host': host_port[0],
                    'port': int(host_port[1]) if len(host_port) > 1 else 3306,
                    'database': database_name,
                    'autocommit': True
                }
            else:
                # Fallback configuration
                config = {
                    'user': os.getenv('DB_USERNAME', 'laravel'),
                    'password': os.getenv('DB_PASSWORD', 'password'),
                    'host': os.getenv('DB_HOST', 'mysql'),
                    'port': int(os.getenv('DB_PORT', 3306)),
                    'database': os.getenv('DB_DATABASE', 'laravel'),
                    'autocommit': True
                }
            
            self.connection = mysql.connector.connect(**config)
            
            # Also create SQLAlchemy engine for advanced operations
            sqlalchemy_url = f"mysql+mysqlconnector://{config['user']}:{config['password']}@{config['host']}:{config['port']}/{config['database']}"
            self.engine = create_engine(sqlalchemy_url)
            self.SessionLocal = sessionmaker(bind=self.engine)
            
            logger.info("Database connection established successfully")
            
        except Error as e:
            logger.error(f"Database connection failed: {e}")
            raise
            
    async def disconnect(self):
        """Close database connection"""
        if self.connection and self.connection.is_connected():
            self.connection.close()
            logger.info("Database connection closed")
            
    async def store_analysis_result(self, review_id: int, analysis_result: AnalysisResult) -> int:
        """Store AI analysis result in the database"""
        try:
            cursor = self.connection.cursor()
            
            # Convert data to appropriate formats
            keywords_json = json.dumps(analysis_result.keywords)
            topics_json = json.dumps(analysis_result.topics)
            emotions_json = json.dumps(analysis_result.emotions)
            
            query = """
            INSERT INTO ai_analysis_results (
                review_id, sentiment_score, sentiment_label, confidence_score,
                keywords, topics, emotions, language_code, analysis_model, processed_at
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            
            values = (
                review_id,
                analysis_result.sentiment_score,
                analysis_result.sentiment_label.value,
                analysis_result.confidence_score,
                keywords_json,
                topics_json,
                emotions_json,
                analysis_result.language_code,
                analysis_result.analysis_model,
                datetime.utcnow()
            )
            
            cursor.execute(query, values)
            analysis_id = cursor.lastrowid
            
            cursor.close()
            logger.info(f"Analysis result stored with ID: {analysis_id}")
            return analysis_id
            
        except Error as e:
            logger.error(f"Failed to store analysis result: {e}")
            raise
            
    async def get_analysis_result(self, review_id: int) -> Optional[Dict[str, Any]]:
        """Retrieve analysis result for a review"""
        try:
            cursor = self.connection.cursor(dictionary=True)
            
            query = """
            SELECT * FROM ai_analysis_results 
            WHERE review_id = %s 
            ORDER BY processed_at DESC 
            LIMIT 1
            """
            
            cursor.execute(query, (review_id,))
            result = cursor.fetchone()
            
            cursor.close()
            
            if result:
                # Parse JSON fields
                result['keywords'] = json.loads(result['keywords']) if result['keywords'] else []
                result['topics'] = json.loads(result['topics']) if result['topics'] else []
                result['emotions'] = json.loads(result['emotions']) if result['emotions'] else {}
                
            return result
            
        except Error as e:
            logger.error(f"Failed to retrieve analysis result: {e}")
            raise
            
    async def delete_analysis_result(self, review_id: int) -> bool:
        """Delete analysis result for a review"""
        try:
            cursor = self.connection.cursor()
            
            query = "DELETE FROM ai_analysis_results WHERE review_id = %s"
            cursor.execute(query, (review_id,))
            
            deleted = cursor.rowcount > 0
            cursor.close()
            
            return deleted
            
        except Error as e:
            logger.error(f"Failed to delete analysis result: {e}")
            raise
            
    async def get_review_content(self, review_id: int) -> Optional[Dict[str, Any]]:
        """Get review content from customer_reviews table"""
        try:
            cursor = self.connection.cursor(dictionary=True)
            
            query = """
            SELECT id, sme_id, content, title, rating, review_date, review_type
            FROM customer_reviews 
            WHERE id = %s
            """
            
            cursor.execute(query, (review_id,))
            result = cursor.fetchone()
            
            cursor.close()
            return result
            
        except Error as e:
            logger.error(f"Failed to retrieve review content: {e}")
            raise
            
    async def update_review_status(self, review_id: int, status: str) -> bool:
        """Update review status after analysis"""
        try:
            cursor = self.connection.cursor()
            
            query = "UPDATE customer_reviews SET status = %s WHERE id = %s"
            cursor.execute(query, (status, review_id))
            
            updated = cursor.rowcount > 0
            cursor.close()
            
            return updated
            
        except Error as e:
            logger.error(f"Failed to update review status: {e}")
            raise

# Database dependency for FastAPI
async def get_database() -> DatabaseManager:
    """Dependency to get database manager instance"""
    db = DatabaseManager()
    await db.connect()
    try:
        yield db
    finally:
        await db.disconnect() 