# MongoDB Setup for David Move Backend

## Overview

This project now includes MongoDB as an additional database option alongside the existing MySQL setup. MongoDB is used for storing move estimates, customer data, and analytics.

## Setup Instructions

### 1. Install MongoDB

- **Windows**: Download and install from [MongoDB Download Center](https://www.mongodb.com/try/download/community)
- **macOS**: `brew install mongodb-community`
- **Linux**: Follow [MongoDB Installation Guide](https://docs.mongodb.com/manual/installation/)

### 2. Install Dependencies

```bash
cd backend
pnpm install
```

### 3. Environment Configuration

Create a `.env` file in the backend directory with the following variables:

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/david-move

# Other configurations...
PORT=3001
NODE_ENV=development
```

### 4. Start MongoDB

```bash
# Start MongoDB service
mongod
```

### 5. Start the Backend

```bash
cd backend
pnpm dev
```

## Database Models

### MoveEstimate

Stores move estimate requests with the following fields:

- `name`, `email`, `phone` - Customer information
- `apartmentType` - Type of apartment (1.5, 2, 2.5, etc.)
- `currentAddress`, `destinationAddress` - Move addresses
- `originFloor`, `destinationFloor` - Floor information
- `originHasElevator`, `destinationHasElevator` - Elevator availability
- `originHasCrane`, `destinationHasCrane` - Crane requirements
- `inventory` - Array of items to move
- `totalPrice` - Calculated total price
- `status` - Estimate status (pending, approved, rejected, completed)

### Customer

Stores customer information and statistics:

- `name`, `email`, `phone` - Customer details
- `address`, `notes` - Additional information
- `totalMoves` - Number of moves completed
- `totalSpent` - Total amount spent
- `lastMoveDate` - Date of last move

## API Endpoints

### Move Estimates

- `POST /api/mongo/estimates` - Create new estimate
- `GET /api/mongo/estimates` - Get all estimates
- `GET /api/mongo/estimates/:id` - Get estimate by ID
- `PATCH /api/mongo/estimates/:id/status` - Update estimate status
- `DELETE /api/mongo/estimates/:id` - Delete estimate

### Customers

- `GET /api/mongo/customers` - Get all customers
- `GET /api/mongo/customers/email/:email` - Get customer by email

### Analytics

- `GET /api/mongo/analytics` - Get analytics data

### Search

- `GET /api/mongo/search/estimates?q=query` - Search estimates
- `GET /api/mongo/search/customers?q=query` - Search customers

## Features

### 1. Automatic Customer Management

- When a move estimate is created, customer statistics are automatically updated
- Tracks total moves and spending per customer

### 2. Analytics

- Total estimates and customers
- Revenue tracking
- Estimates by status
- Top customers by spending

### 3. Search Functionality

- Full-text search across estimates and customers
- Search by name, email, phone, or address

### 4. Status Management

- Track estimate status: pending, approved, rejected, completed
- Update status via API

## Database Indexes

The following indexes are created for optimal performance:

- Email and phone indexes for quick customer lookup
- Status and creation date indexes for filtering
- Text indexes for search functionality

## Error Handling

- Comprehensive error handling with meaningful messages
- Graceful connection management
- Automatic reconnection on connection loss

## Development vs Production

- **Development**: Uses local MongoDB instance
- **Production**: Use MongoDB Atlas or cloud MongoDB service
- Update `MONGODB_URI` in production environment

## Migration from MySQL

The MongoDB setup runs alongside the existing MySQL setup, allowing for:

- Gradual migration of data
- Comparison of performance
- Fallback options if needed

## Monitoring

- Connection status logging
- Query performance monitoring
- Error tracking and reporting
