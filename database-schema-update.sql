-- Business Operating System (BOS) Database Schema Update
-- Handles existing Laravel tables and adds new BOS functionality

-- ================================
-- UPDATE EXISTING TABLES
-- ================================

-- Update users table to include BOS-specific fields (if not already present)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS sme_id BIGINT UNSIGNED NULL AFTER id,
ADD COLUMN IF NOT EXISTS role ENUM('admin', 'manager', 'employee', 'viewer') DEFAULT 'employee' AFTER password,
ADD COLUMN IF NOT EXISTS status ENUM('active', 'inactive') DEFAULT 'active' AFTER role,
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP NULL AFTER status;

-- Update smes table if it exists, or create it
CREATE TABLE IF NOT EXISTS smes (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    business_type VARCHAR(100),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(100),
    timezone VARCHAR(50) DEFAULT 'UTC',
    subscription_plan ENUM('basic', 'premium', 'enterprise') DEFAULT 'basic',
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_sme_status (status),
    INDEX idx_sme_subscription (subscription_plan)
);

-- Add foreign key constraint to users table if not exists
SET @constraint_exists = (
    SELECT COUNT(*) 
    FROM information_schema.table_constraints 
    WHERE table_name = 'users' 
    AND constraint_name = 'users_sme_id_foreign'
    AND table_schema = DATABASE()
);

SET @sql = IF(@constraint_exists = 0, 
    'ALTER TABLE users ADD CONSTRAINT users_sme_id_foreign FOREIGN KEY (sme_id) REFERENCES smes(id) ON DELETE CASCADE',
    'SELECT "Foreign key already exists" as message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ================================
-- SHARED DATA TABLES (Global)
-- ================================

-- Global Product Categories (Shared across all SMEs)
CREATE TABLE IF NOT EXISTS global_product_categories (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    parent_id BIGINT UNSIGNED NULL,
    level INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES global_product_categories(id) ON DELETE SET NULL,
    INDEX idx_category_parent (parent_id),
    INDEX idx_category_level (level)
);

-- Industry Benchmarks (Anonymized data for comparison)
CREATE TABLE IF NOT EXISTS industry_benchmarks (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    industry_type VARCHAR(100) NOT NULL,
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(15,4),
    metric_unit VARCHAR(50),
    period_type ENUM('monthly', 'quarterly', 'yearly') NOT NULL,
    period_value VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_benchmark_industry (industry_type),
    INDEX idx_benchmark_metric (metric_name),
    INDEX idx_benchmark_period (period_type, period_value)
);

-- ================================
-- INVENTORY MANAGEMENT TABLES
-- ================================

-- Products (Tenant-specific)
CREATE TABLE IF NOT EXISTS products (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    sme_id BIGINT UNSIGNED NOT NULL,
    sku VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    global_category_id BIGINT UNSIGNED,
    local_category VARCHAR(100),
    brand VARCHAR(100),
    unit_of_measure VARCHAR(50) DEFAULT 'pcs',
    cost_price DECIMAL(15,4) DEFAULT 0,
    selling_price DECIMAL(15,4) DEFAULT 0,
    weight DECIMAL(10,3),
    dimensions VARCHAR(100),
    barcode VARCHAR(100),
    status ENUM('active', 'inactive', 'discontinued') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (sme_id) REFERENCES smes(id) ON DELETE CASCADE,
    FOREIGN KEY (global_category_id) REFERENCES global_product_categories(id) ON DELETE SET NULL,
    UNIQUE KEY unique_sku_per_sme (sme_id, sku),
    INDEX idx_product_sme (sme_id),
    INDEX idx_product_status (status),
    INDEX idx_product_category (global_category_id)
);

-- Warehouses/Locations (Tenant-specific)
CREATE TABLE IF NOT EXISTS warehouses (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    sme_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(100),
    manager_name VARCHAR(255),
    phone VARCHAR(20),
    email VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (sme_id) REFERENCES smes(id) ON DELETE CASCADE,
    INDEX idx_warehouse_sme (sme_id)
);

-- Inventory Stock (Current stock levels)
CREATE TABLE IF NOT EXISTS inventory_stock (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    sme_id BIGINT UNSIGNED NOT NULL,
    product_id BIGINT UNSIGNED NOT NULL,
    warehouse_id BIGINT UNSIGNED NOT NULL,
    quantity_on_hand DECIMAL(15,4) DEFAULT 0,
    quantity_reserved DECIMAL(15,4) DEFAULT 0,
    quantity_available DECIMAL(15,4) GENERATED ALWAYS AS (quantity_on_hand - quantity_reserved) STORED,
    reorder_level DECIMAL(15,4) DEFAULT 0,
    max_stock_level DECIMAL(15,4),
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (sme_id) REFERENCES smes(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (warehouse_id) REFERENCES warehouses(id) ON DELETE CASCADE,
    UNIQUE KEY unique_product_warehouse (product_id, warehouse_id),
    INDEX idx_stock_sme (sme_id),
    INDEX idx_stock_low_level (reorder_level, quantity_available)
);

-- Stock Movements (Inventory transactions)
CREATE TABLE IF NOT EXISTS stock_movements (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    sme_id BIGINT UNSIGNED NOT NULL,
    product_id BIGINT UNSIGNED NOT NULL,
    warehouse_id BIGINT UNSIGNED NOT NULL,
    movement_type ENUM('in', 'out', 'transfer', 'adjustment') NOT NULL,
    quantity DECIMAL(15,4) NOT NULL,
    unit_cost DECIMAL(15,4),
    reference_type ENUM('purchase_order', 'sales_order', 'transfer', 'adjustment', 'return') NOT NULL,
    reference_id BIGINT UNSIGNED,
    reason VARCHAR(255),
    performed_by BIGINT UNSIGNED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sme_id) REFERENCES smes(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (warehouse_id) REFERENCES warehouses(id) ON DELETE CASCADE,
    FOREIGN KEY (performed_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_movement_sme (sme_id),
    INDEX idx_movement_product (product_id),
    INDEX idx_movement_type (movement_type),
    INDEX idx_movement_date (created_at)
);

-- Purchase Orders
CREATE TABLE IF NOT EXISTS purchase_orders (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    sme_id BIGINT UNSIGNED NOT NULL,
    po_number VARCHAR(100) NOT NULL,
    supplier_name VARCHAR(255) NOT NULL,
    supplier_email VARCHAR(255),
    supplier_phone VARCHAR(20),
    order_date DATE NOT NULL,
    expected_delivery_date DATE,
    status ENUM('draft', 'sent', 'confirmed', 'partial_received', 'received', 'cancelled') DEFAULT 'draft',
    total_amount DECIMAL(15,4) DEFAULT 0,
    notes TEXT,
    created_by BIGINT UNSIGNED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (sme_id) REFERENCES smes(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE KEY unique_po_number_per_sme (sme_id, po_number),
    INDEX idx_po_sme (sme_id),
    INDEX idx_po_status (status),
    INDEX idx_po_date (order_date)
);

-- Purchase Order Items
CREATE TABLE IF NOT EXISTS purchase_order_items (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    purchase_order_id BIGINT UNSIGNED NOT NULL,
    product_id BIGINT UNSIGNED NOT NULL,
    quantity_ordered DECIMAL(15,4) NOT NULL,
    quantity_received DECIMAL(15,4) DEFAULT 0,
    unit_cost DECIMAL(15,4) NOT NULL,
    line_total DECIMAL(15,4) GENERATED ALWAYS AS (quantity_ordered * unit_cost) STORED,
    FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_po_item_order (purchase_order_id),
    INDEX idx_po_item_product (product_id)
);

-- Sales Orders
CREATE TABLE IF NOT EXISTS sales_orders (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    sme_id BIGINT UNSIGNED NOT NULL,
    order_number VARCHAR(100) NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255),
    customer_phone VARCHAR(20),
    customer_address TEXT,
    order_date DATE NOT NULL,
    required_date DATE,
    status ENUM('draft', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'draft',
    total_amount DECIMAL(15,4) DEFAULT 0,
    notes TEXT,
    created_by BIGINT UNSIGNED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (sme_id) REFERENCES smes(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE KEY unique_order_number_per_sme (sme_id, order_number),
    INDEX idx_so_sme (sme_id),
    INDEX idx_so_status (status),
    INDEX idx_so_date (order_date)
);

-- Sales Order Items
CREATE TABLE IF NOT EXISTS sales_order_items (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    sales_order_id BIGINT UNSIGNED NOT NULL,
    product_id BIGINT UNSIGNED NOT NULL,
    quantity_ordered DECIMAL(15,4) NOT NULL,
    quantity_shipped DECIMAL(15,4) DEFAULT 0,
    unit_price DECIMAL(15,4) NOT NULL,
    line_total DECIMAL(15,4) GENERATED ALWAYS AS (quantity_ordered * unit_price) STORED,
    FOREIGN KEY (sales_order_id) REFERENCES sales_orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_so_item_order (sales_order_id),
    INDEX idx_so_item_product (product_id)
);

-- ================================
-- COMPLAINT & REVIEW MANAGEMENT
-- ================================

-- Review Sources (Platforms where reviews are collected)
CREATE TABLE IF NOT EXISTS review_sources (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    api_endpoint VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_source_active (is_active)
);

-- Customer Reviews & Complaints (Tenant-specific)
CREATE TABLE IF NOT EXISTS customer_reviews (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    sme_id BIGINT UNSIGNED NOT NULL,
    source_id BIGINT UNSIGNED,
    external_review_id VARCHAR(255),
    customer_name VARCHAR(255),
    customer_email VARCHAR(255),
    customer_phone VARCHAR(20),
    review_type ENUM('review', 'complaint', 'suggestion') DEFAULT 'review',
    title VARCHAR(500),
    content TEXT NOT NULL,
    rating DECIMAL(3,2),
    max_rating DECIMAL(3,2) DEFAULT 5.0,
    review_date TIMESTAMP NOT NULL,
    status ENUM('new', 'in_progress', 'resolved', 'closed') DEFAULT 'new',
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    assigned_to BIGINT UNSIGNED,
    resolution_notes TEXT,
    resolved_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (sme_id) REFERENCES smes(id) ON DELETE CASCADE,
    FOREIGN KEY (source_id) REFERENCES review_sources(id) ON DELETE SET NULL,
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_review_sme (sme_id),
    INDEX idx_review_type (review_type),
    INDEX idx_review_status (status),
    INDEX idx_review_date (review_date),
    INDEX idx_review_rating (rating)
);

-- AI Analysis Results (AI-powered insights)
CREATE TABLE IF NOT EXISTS ai_analysis_results (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    review_id BIGINT UNSIGNED NOT NULL,
    sentiment_score DECIMAL(5,4),
    sentiment_label ENUM('positive', 'negative', 'neutral') NOT NULL,
    confidence_score DECIMAL(5,4),
    keywords JSON,
    topics JSON,
    emotions JSON,
    language_code VARCHAR(10),
    analysis_model VARCHAR(100),
    processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (review_id) REFERENCES customer_reviews(id) ON DELETE CASCADE,
    INDEX idx_analysis_review (review_id),
    INDEX idx_analysis_sentiment (sentiment_label),
    INDEX idx_analysis_score (sentiment_score)
);

-- Review Response Actions (SME responses to reviews)
CREATE TABLE IF NOT EXISTS review_responses (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    review_id BIGINT UNSIGNED NOT NULL,
    response_text TEXT NOT NULL,
    response_type ENUM('public', 'private', 'internal_note') DEFAULT 'public',
    posted_to_platform BOOLEAN DEFAULT FALSE,
    posted_at TIMESTAMP NULL,
    created_by BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (review_id) REFERENCES customer_reviews(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_response_review (review_id),
    INDEX idx_response_type (response_type)
);

-- ================================
-- ANALYTICS & REPORTING TABLES
-- ================================

-- Business Metrics (KPIs for each SME)
CREATE TABLE IF NOT EXISTS business_metrics (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    sme_id BIGINT UNSIGNED NOT NULL,
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(15,4) NOT NULL,
    metric_unit VARCHAR(50),
    period_type ENUM('daily', 'weekly', 'monthly', 'quarterly', 'yearly') NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sme_id) REFERENCES smes(id) ON DELETE CASCADE,
    INDEX idx_metrics_sme (sme_id),
    INDEX idx_metrics_name (metric_name),
    INDEX idx_metrics_period (period_type, period_start)
);

-- System Activity Logs (Audit trail)
CREATE TABLE IF NOT EXISTS activity_logs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    sme_id BIGINT UNSIGNED,
    user_id BIGINT UNSIGNED,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100),
    entity_id BIGINT UNSIGNED,
    details JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sme_id) REFERENCES smes(id) ON DELETE SET NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_log_sme (sme_id),
    INDEX idx_log_user (user_id),
    INDEX idx_log_action (action),
    INDEX idx_log_date (created_at)
);

-- ================================
-- INSERT INITIAL DATA
-- ================================

-- Insert review sources if they don't exist
INSERT IGNORE INTO review_sources (name, is_active) VALUES
('Google Reviews', TRUE),
('Facebook Reviews', TRUE),
('Yelp', TRUE),
('Amazon Reviews', TRUE),
('Trustpilot', TRUE),
('Manual Entry', TRUE),
('Email Feedback', TRUE),
('In-App Feedback', TRUE);

-- Insert sample global categories if they don't exist
INSERT IGNORE INTO global_product_categories (name, description, level) VALUES
('Electronics', 'Electronic devices and accessories', 0),
('Clothing & Fashion', 'Apparel and fashion items', 0),
('Food & Beverages', 'Consumable food and drink products', 0),
('Health & Beauty', 'Health and personal care products', 0),
('Home & Garden', 'Household and outdoor items', 0),
('Sports & Recreation', 'Sports equipment and recreational items', 0),
('Automotive', 'Vehicle parts and accessories', 0),
('Books & Media', 'Publications and media content', 0); 