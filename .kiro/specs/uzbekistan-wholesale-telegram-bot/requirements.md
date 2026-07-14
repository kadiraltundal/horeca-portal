# Requirements Document

## Introduction

Bu belge, Özbekistan pazarı için Telegram tabanlı B2B toptan satış botunun gereksinimlerini tanımlar. Bot, perakende mağazalar ve küçük işletmelerin toptan ürün siparişi vermesini, stok durumunu kontrol etmesini, basamaklı fiyatlandırmadan faydalanmasını ve sipariş takibi yapmasını sağlar. Sistem, Özbekçe, Rusça ve İngilizce dillerini destekler ve UZS ile USD para birimlerinde işlem yapar. Payme, Click, Uzcard, Humo gibi yerel ödeme yöntemleri ile havale/EFT seçenekleri sunar.

## Glossary

- **Bot**: Telegram platformunda çalışan toptan satış uygulaması
- **B2B_Customer**: İşletme müşterisi (perakende mağaza, küçük işletme)
- **Admin_Panel**: Yönetici web arayüzü
- **Product_Catalog**: Ürün kataloğu sistemi
- **Order_System**: Sipariş yönetim sistemi
- **Payment_Gateway**: Ödeme entegrasyon sistemi
- **KYC_System**: Müşteri kimlik doğrulama ve işletme bilgileri yönetim sistemi
- **Credit_Manager**: Müşteri kredi/limit takip sistemi
- **Notification_Service**: Bildirim gönderme servisi
- **Cart**: Alışveriş sepeti
- **MOQ**: Minimum sipariş miktarı (Minimum Order Quantity)
- **Tier_Pricing**: Basamaklı fiyatlandırma sistemi
- **Invoice_Generator**: Fatura oluşturma modülü
- **Delivery_Manager**: Teslimat yönetim sistemi
- **Job_Queue**: Asenkron görev kuyruğu sistemi
- **Session_Manager**: Oturum yönetim sistemi
- **Database**: PostgreSQL veritabanı
- **Cache**: Redis önbellek sistemi

## Requirements

### Requirement 1: Çok Dilli Destek

**User Story:** As a B2B_Customer, I want to use the bot in my preferred language (Uzbek, Russian, or English), so that I can interact with the system comfortably.

#### Acceptance Criteria

1. WHEN a B2B_Customer first starts THE Bot, THE Bot SHALL display a language selection menu with Uzbek, Russian, and English options
2. WHEN a B2B_Customer selects a language, THE Bot SHALL store the language preference in THE Session_Manager
3. WHILE a session is active, THE Bot SHALL display all messages and menus in the selected language
4. WHEN a B2B_Customer changes language preference, THE Bot SHALL update all subsequent interactions to the new language
5. THE Bot SHALL support Uzbek (uz), Russian (ru), and English (en) language codes

### Requirement 2: Müşteri Kaydı ve KYC

**User Story:** As a B2B_Customer, I want to register my business information, so that I can access wholesale pricing and place orders.

#### Acceptance Criteria

1. WHEN an unregistered user interacts with THE Bot, THE Bot SHALL prompt for business registration
2. THE KYC_System SHALL collect business name, tax ID number, business type, contact person, phone number, and address
3. WHEN registration data is submitted, THE KYC_System SHALL validate the tax ID format according to Uzbekistan standards
4. WHEN registration is complete, THE KYC_System SHALL set the customer status to "pending approval"
5. THE Admin_Panel SHALL display pending registrations for manual review
6. WHEN an admin approves a registration, THE KYC_System SHALL update customer status to "active" and THE Notification_Service SHALL send approval notification via THE Bot
7. WHEN an admin rejects a registration, THE KYC_System SHALL update customer status to "rejected" and THE Notification_Service SHALL send rejection reason via THE Bot
8. WHILE a customer status is "pending" or "rejected", THE Bot SHALL restrict access to catalog and ordering features

### Requirement 3: Ürün Kataloğu ve Kategori Yönetimi

**User Story:** As a B2B_Customer, I want to browse products by category and view stock availability, so that I can find products to order.

#### Acceptance Criteria

1. WHEN a B2B_Customer requests the catalog, THE Product_Catalog SHALL display a list of product categories
2. WHEN a B2B_Customer selects a category, THE Product_Catalog SHALL display all products in that category with name, code, unit, and stock status
3. WHEN a B2B_Customer selects a product, THE Product_Catalog SHALL display product details including description, available stock quantity, unit price, and MOQ
4. THE Product_Catalog SHALL indicate out-of-stock products with a visual indicator
5. WHEN a product stock is zero, THE Product_Catalog SHALL prevent adding the product to THE Cart
6. THE Product_Catalog SHALL support search by product name or product code
7. THE Product_Catalog SHALL paginate results when a category contains more than 20 products

### Requirement 4: Basamaklı Fiyatlandırma (Tier Pricing)

**User Story:** As a B2B_Customer, I want to see volume-based pricing tiers, so that I can benefit from bulk discounts.

#### Acceptance Criteria

1. WHEN a B2B_Customer views a product, THE Tier_Pricing SHALL display all pricing tiers with quantity ranges and unit prices
2. THE Tier_Pricing SHALL support at least three tiers: tier 1 (10-49 units), tier 2 (50-99 units), tier 3 (100+ units)
3. WHEN a B2B_Customer adds a quantity to THE Cart, THE Tier_Pricing SHALL calculate the applicable tier price based on total quantity
4. WHEN cart quantity changes, THE Tier_Pricing SHALL recalculate prices according to the new tier
5. THE Tier_Pricing SHALL display both UZS and USD prices with current exchange rate information
6. THE Tier_Pricing SHALL apply the same tier calculation logic across all products in THE Cart independently per product

### Requirement 5: Minimum Sipariş Miktarı (MOQ)

**User Story:** As a B2B_Customer, I want to know the minimum order quantity for each product, so that I can place valid orders.

#### Acceptance Criteria

1. WHEN a B2B_Customer views a product, THE Product_Catalog SHALL display the MOQ for that product
2. WHEN a B2B_Customer attempts to add a quantity less than MOQ to THE Cart, THE Bot SHALL reject the action and display an error message with the required MOQ
3. WHEN a B2B_Customer adds a valid quantity, THE Cart SHALL accept the item
4. THE MOQ SHALL be configurable per product in THE Admin_Panel
5. THE Product_Catalog SHALL validate MOQ before checkout

### Requirement 6: Sepet Yönetimi

**User Story:** As a B2B_Customer, I want to add, update, and remove items in my cart, so that I can prepare my order.

#### Acceptance Criteria

1. WHEN a B2B_Customer adds a product, THE Cart SHALL store the product ID, quantity, and applicable tier price
2. WHEN a B2B_Customer views THE Cart, THE Bot SHALL display all items with product name, quantity, unit price, and subtotal
3. WHEN a B2B_Customer updates item quantity, THE Cart SHALL recalculate tier pricing and update the subtotal
4. WHEN a B2B_Customer removes an item, THE Cart SHALL delete the item and recalculate the total
5. THE Cart SHALL display the order total in both UZS and USD
6. WHEN a B2B_Customer proceeds to checkout, THE Cart SHALL validate stock availability for all items
7. IF any item exceeds available stock, THEN THE Cart SHALL display an error message and prevent checkout

### Requirement 7: Müşteri Kredi/Limit Takibi

**User Story:** As a B2B_Customer, I want to use my credit limit for purchases, so that I can order without immediate payment.

#### Acceptance Criteria

1. WHEN an admin assigns a credit limit to a customer, THE Credit_Manager SHALL store the total credit limit and available credit
2. WHEN a B2B_Customer views account information, THE Bot SHALL display total credit limit, used credit, and available credit
3. WHEN a B2B_Customer places an order on credit, THE Credit_Manager SHALL check if order total exceeds available credit
4. IF order total exceeds available credit, THEN THE Order_System SHALL reject the order and THE Bot SHALL display insufficient credit message
5. WHEN an order is placed on credit, THE Credit_Manager SHALL reduce available credit by the order total
6. WHEN a payment is received, THE Credit_Manager SHALL increase available credit by the payment amount
7. THE Credit_Manager SHALL prevent orders when available credit is zero or negative

### Requirement 8: Sipariş Oluşturma

**User Story:** As a B2B_Customer, I want to place orders with my preferred payment and delivery options, so that I can complete my purchase.

#### Acceptance Criteria

1. WHEN a B2B_Customer proceeds to checkout, THE Order_System SHALL display order summary with all items, quantities, prices, and total amount
2. THE Order_System SHALL prompt for payment method selection: Payme, Click, Uzcard, Humo, bank transfer, or credit
3. THE Order_System SHALL prompt for delivery address selection or entry of new address
4. THE Order_System SHALL prompt for delivery city selection: Tashkent or other cities
5. WHEN a B2B_Customer confirms the order, THE Order_System SHALL create an order record with unique order number, customer ID, items, total, payment method, delivery address, and status "pending_payment"
6. WHEN payment method is bank transfer or credit, THE Order_System SHALL set order status to "pending_confirmation"
7. WHERE payment method is Payme, Click, Uzcard, or Humo, THE Payment_Gateway SHALL generate a payment link
8. WHEN an order is created, THE Notification_Service SHALL send order confirmation with order number via THE Bot
9. THE Order_System SHALL reserve stock for ordered items when order status is "pending_payment" or "pending_confirmation"

### Requirement 9: Ödeme Entegrasyonu

**User Story:** As a B2B_Customer, I want to pay through local payment gateways, so that I can complete my order securely.

#### Acceptance Criteria

1. WHERE payment method is Payme, THE Payment_Gateway SHALL integrate with Payme API and generate a payment link
2. WHERE payment method is Click, THE Payment_Gateway SHALL integrate with Click API and generate a payment link
3. WHERE payment method is Uzcard, THE Payment_Gateway SHALL integrate with Uzcard payment gateway and generate a payment link
4. WHERE payment method is Humo, THE Payment_Gateway SHALL integrate with Humo payment gateway and generate a payment link
5. WHEN a payment is successful, THE Payment_Gateway SHALL send a webhook notification to THE Order_System
6. WHEN THE Order_System receives payment confirmation, THE Order_System SHALL update order status to "paid"
7. IF payment fails, THEN THE Payment_Gateway SHALL notify THE Order_System and THE Bot SHALL send payment failure message
8. WHEN payment fails, THE Order_System SHALL release the stock reservation after 24 hours

### Requirement 10: Sipariş Takibi ve Durum Yönetimi

**User Story:** As a B2B_Customer, I want to track my order status, so that I know when to expect delivery.

#### Acceptance Criteria

1. WHEN a B2B_Customer requests order history, THE Order_System SHALL display all orders with order number, date, total, and current status
2. THE Order_System SHALL support order statuses: "pending_payment", "pending_confirmation", "paid", "confirmed", "preparing", "shipped", "delivered", "cancelled"
3. WHEN an order status changes, THE Notification_Service SHALL send a status update notification via THE Bot
4. WHEN a B2B_Customer selects an order, THE Order_System SHALL display order details including items, quantities, prices, payment method, delivery address, and status history
5. WHEN an admin updates order status in THE Admin_Panel, THE Order_System SHALL record the status change with timestamp
6. THE Bot SHALL allow B2B_Customer to track current orders with real-time status information

### Requirement 11: Fatura ve Teslimat Belgeleri

**User Story:** As a B2B_Customer, I want to receive invoice and delivery documents, so that I have proper business records.

#### Acceptance Criteria

1. WHEN an order is confirmed, THE Invoice_Generator SHALL create a PDF invoice with order number, date, customer details, items, quantities, prices, tax breakdown, and total
2. THE Invoice_Generator SHALL include business tax ID, customer tax ID, and comply with Uzbekistan tax regulations
3. WHEN invoice is generated, THE Bot SHALL send the PDF file to the B2B_Customer via Telegram
4. WHEN an order is shipped, THE Delivery_Manager SHALL generate a delivery note with order number, customer details, items, quantities, and delivery address
5. THE Delivery_Manager SHALL send the delivery note PDF via THE Bot
6. THE Invoice_Generator SHALL store all invoices in THE Database with unique invoice numbers
7. WHEN a B2B_Customer requests past invoices, THE Bot SHALL retrieve and send the requested invoice PDF

### Requirement 12: Sipariş İptali ve İade

**User Story:** As a B2B_Customer, I want to cancel orders or request returns, so that I can manage incorrect or unwanted orders.

#### Acceptance Criteria

1. WHILE an order status is "pending_payment" or "pending_confirmation", THE Order_System SHALL allow the B2B_Customer to cancel the order
2. WHEN a B2B_Customer cancels an order, THE Order_System SHALL update status to "cancelled" and THE Credit_Manager SHALL restore any used credit
3. WHEN an order is cancelled, THE Order_System SHALL release the stock reservation
4. WHILE an order status is "delivered", THE Bot SHALL allow the B2B_Customer to request a return
5. WHEN a return is requested, THE Order_System SHALL create a return request record and notify admin via THE Admin_Panel
6. WHEN an admin approves a return, THE Order_System SHALL update the return status and THE Credit_Manager SHALL restore credit if payment was made on credit
7. THE Order_System SHALL prevent cancellation when order status is "shipped" or "delivered"

### Requirement 13: Admin Panel - Sipariş Yönetimi

**User Story:** As an admin, I want to manage orders through a web interface, so that I can process and fulfill customer orders.

#### Acceptance Criteria

1. WHEN an admin accesses THE Admin_Panel, THE Admin_Panel SHALL display all orders with filters for status, date range, and customer
2. WHEN an admin selects an order, THE Admin_Panel SHALL display full order details including customer information, items, payment status, and delivery information
3. THE Admin_Panel SHALL allow admin to update order status to "confirmed", "preparing", "shipped", or "delivered"
4. WHEN an admin updates order status, THE Order_System SHALL record the change and THE Notification_Service SHALL notify the B2B_Customer via THE Bot
5. THE Admin_Panel SHALL allow admin to add internal notes to orders
6. THE Admin_Panel SHALL display payment confirmation status for each order
7. THE Admin_Panel SHALL allow admin to manually confirm bank transfer payments

### Requirement 14: Admin Panel - Müşteri Yönetimi

**User Story:** As an admin, I want to manage customer accounts and credit limits, so that I can control business relationships.

#### Acceptance Criteria

1. WHEN an admin accesses customer management, THE Admin_Panel SHALL display all customers with registration status, credit limit, and order history
2. THE Admin_Panel SHALL allow admin to approve or reject pending customer registrations
3. WHEN admin approves or rejects a registration, THE KYC_System SHALL update customer status and THE Notification_Service SHALL notify the customer
4. THE Admin_Panel SHALL allow admin to set or update customer credit limits
5. WHEN credit limit is changed, THE Credit_Manager SHALL update the credit record
6. THE Admin_Panel SHALL display customer order history and total order value
7. THE Admin_Panel SHALL allow admin to deactivate or reactivate customer accounts
8. WHILE a customer account is deactivated, THE Bot SHALL prevent the customer from placing orders

### Requirement 15: Admin Panel - Ürün ve Stok Yönetimi

**User Story:** As an admin, I want to manage product catalog and inventory, so that I can keep the system up-to-date.

#### Acceptance Criteria

1. THE Admin_Panel SHALL allow admin to create new products with name, code, description, category, unit, MOQ, and tier pricing
2. THE Admin_Panel SHALL allow admin to update product information including prices, MOQ, and stock quantities
3. WHEN admin updates product information, THE Product_Catalog SHALL reflect changes immediately
4. THE Admin_Panel SHALL allow admin to create and manage product categories
5. THE Admin_Panel SHALL display current stock levels for all products
6. THE Admin_Panel SHALL allow admin to add or reduce stock quantities with reason notes
7. WHEN stock quantity changes, THE Database SHALL record the stock movement with timestamp, quantity change, reason, and admin user ID
8. THE Admin_Panel SHALL display stock movement history for each product
9. THE Admin_Panel SHALL allow admin to set products as active or inactive
10. WHILE a product is inactive, THE Product_Catalog SHALL hide the product from B2B_Customer view

### Requirement 16: Bildirim Sistemi

**User Story:** As a B2B_Customer, I want to receive notifications about my orders, so that I stay informed about order progress.

#### Acceptance Criteria

1. WHEN an order is created, THE Notification_Service SHALL send order confirmation message via THE Bot
2. WHEN an order status changes, THE Notification_Service SHALL send status update message via THE Bot
3. WHEN a payment is successful, THE Notification_Service SHALL send payment confirmation message via THE Bot
4. WHEN an admin approves customer registration, THE Notification_Service SHALL send approval message via THE Bot
5. WHEN credit limit is reached, THE Notification_Service SHALL send credit limit warning message via THE Bot
6. THE Notification_Service SHALL use THE Job_Queue for asynchronous notification delivery
7. THE Notification_Service SHALL support message templates in Uzbek, Russian, and English
8. WHEN a notification fails to deliver, THE Notification_Service SHALL retry up to 3 times with exponential backoff

### Requirement 17: Raporlama ve Sipariş Geçmişi

**User Story:** As a B2B_Customer, I want to view my order history and download reports, so that I can track my business expenses.

#### Acceptance Criteria

1. WHEN a B2B_Customer requests order history, THE Order_System SHALL display orders with date range filters (last 7 days, last 30 days, last 3 months, custom range)
2. THE Order_System SHALL display order summary including order count, total amount spent, and average order value for the selected period
3. WHEN a B2B_Customer selects an order from history, THE Order_System SHALL display full order details
4. THE Bot SHALL allow B2B_Customer to download order history as a CSV file
5. THE Bot SHALL allow B2B_Customer to download a specific order invoice PDF
6. THE Order_System SHALL generate monthly order summary reports via THE Job_Queue
7. WHEN a monthly report is ready, THE Notification_Service SHALL send the report file via THE Bot

### Requirement 18: Oturum ve Önbellek Yönetimi

**User Story:** As a system operator, I want efficient session and cache management, so that the system performs well under load.

#### Acceptance Criteria

1. WHEN a B2B_Customer starts a conversation, THE Session_Manager SHALL create a session in THE Cache with a 24-hour TTL
2. THE Session_Manager SHALL store user language preference, current cart, and navigation state in the session
3. WHEN a session expires, THE Bot SHALL prompt the B2B_Customer to restart the conversation
4. THE Cache SHALL store frequently accessed data including product catalog, categories, and tier pricing
5. WHEN product or pricing data is updated in THE Admin_Panel, THE Cache SHALL invalidate the relevant cached data
6. THE Cache SHALL use Redis for session storage and data caching
7. THE Session_Manager SHALL prevent concurrent order placement from the same customer session

### Requirement 19: Teslimat Bölgesi Yönetimi

**User Story:** As an admin, I want to manage delivery regions and costs, so that I can offer accurate delivery pricing.

#### Acceptance Criteria

1. THE Delivery_Manager SHALL support delivery to Tashkent and other cities in Uzbekistan
2. THE Admin_Panel SHALL allow admin to configure delivery costs per city or region
3. WHEN a B2B_Customer selects a delivery city during checkout, THE Order_System SHALL calculate and display the delivery cost
4. THE Order_System SHALL add delivery cost to the order total
5. THE Admin_Panel SHALL allow admin to set delivery time estimates per region
6. WHEN an order is placed, THE Bot SHALL display estimated delivery time based on the delivery region
7. THE Delivery_Manager SHALL store delivery cost and estimated time in the order record

### Requirement 20: Güvenlik ve Yetkilendirme

**User Story:** As a system operator, I want secure authentication and authorization, so that customer and business data is protected.

#### Acceptance Criteria

1. THE Bot SHALL authenticate users using Telegram user ID as the primary identifier
2. WHEN a B2B_Customer interacts with THE Bot, THE Bot SHALL verify that the customer is registered and approved
3. THE Admin_Panel SHALL require username and password authentication
4. THE Admin_Panel SHALL implement role-based access control with roles: super_admin, admin, and order_manager
5. WHERE user role is order_manager, THE Admin_Panel SHALL restrict access to order management features only
6. WHERE user role is admin, THE Admin_Panel SHALL grant access to orders, products, and customers but not system settings
7. WHERE user role is super_admin, THE Admin_Panel SHALL grant full system access
8. THE Database SHALL store passwords using bcrypt hashing with a cost factor of 12
9. THE Admin_Panel SHALL implement session timeout of 60 minutes
10. THE Admin_Panel SHALL log all administrative actions with user ID, action type, and timestamp

### Requirement 21: Sistem Performansı ve Ölçeklenebilirlik

**User Story:** As a system operator, I want the system to handle concurrent users efficiently, so that all customers receive responsive service.

#### Acceptance Criteria

1. THE Bot SHALL respond to user messages within 2 seconds under normal load (up to 100 concurrent users)
2. THE Database SHALL use connection pooling with a minimum of 10 and maximum of 50 connections
3. THE Job_Queue SHALL process notification jobs within 5 seconds of job creation
4. THE Cache SHALL have a hit ratio of at least 80% for product catalog queries
5. WHEN THE Cache is unavailable, THE Bot SHALL fall back to THE Database with graceful degradation
6. THE Admin_Panel SHALL load dashboard data within 3 seconds
7. THE Order_System SHALL handle at least 20 concurrent order placements without data corruption

### Requirement 22: Hata Yönetimi ve Loglama

**User Story:** As a system operator, I want comprehensive error handling and logging, so that I can diagnose and resolve issues quickly.

#### Acceptance Criteria

1. WHEN an error occurs in THE Bot, THE Bot SHALL display a user-friendly error message in the customer's selected language
2. WHEN an error occurs, THE Bot SHALL log the error with timestamp, user ID, error message, and stack trace
3. WHEN a payment gateway error occurs, THE Payment_Gateway SHALL log the error details and return a descriptive error message
4. WHEN THE Database connection fails, THE Bot SHALL display a maintenance message and log the connection error
5. THE Admin_Panel SHALL display system error logs with filters for severity, date range, and component
6. THE Bot SHALL log all user interactions including commands, button clicks, and order placements
7. IF a critical error occurs in THE Order_System, THEN THE Notification_Service SHALL send an alert to admin users via Telegram

### Requirement 23: Veri Yedekleme ve Kurtarma

**User Story:** As a system operator, I want automated database backups, so that business data can be recovered in case of system failure.

#### Acceptance Criteria

1. THE Database SHALL perform automated daily backups at 02:00 AM Tashkent time
2. THE Database SHALL retain daily backups for 30 days
3. THE Database SHALL perform weekly full backups retained for 90 days
4. WHEN a backup completes successfully, THE Database SHALL log the backup completion time and file size
5. IF a backup fails, THEN THE Database SHALL retry once and log the failure
6. THE Admin_Panel SHALL display backup status and allow manual backup initiation
7. THE Database SHALL provide point-in-time recovery capability for the last 7 days

### Requirement 24: API ve Web Hook Desteği

**User Story:** As a system integrator, I want REST APIs and webhooks, so that I can integrate with external systems.

#### Acceptance Criteria

1. THE Bot SHALL provide REST API endpoints for order creation, order status query, and product catalog query
2. THE Bot SHALL require API key authentication for all API requests
3. THE Admin_Panel SHALL allow admin to generate and revoke API keys
4. WHEN an order status changes, THE Order_System SHALL send webhook notifications to configured endpoints
5. THE Bot SHALL support webhook retry logic with exponential backoff up to 5 attempts
6. THE Bot SHALL provide API documentation in OpenAPI 3.0 format
7. THE Bot SHALL validate all API requests against defined schemas and return appropriate error codes for invalid requests

