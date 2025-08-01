# DavidMove Backend API

A Node.js/Express backend for the apartment moving price estimation system.

## 🏗️ Project Structure

```
src/
├── config/           # Configuration files
│   └── database.ts   # Database configuration
├── controllers/      # Request handlers (business logic)
│   └── movingEstimateController.ts
├── database/         # Database layer
│   ├── connection.ts # Modular database adapter
│   └── schema.ts     # Database schema and migrations
├── middleware/       # Express middleware
│   ├── errorHandler.ts    # Error handling
│   ├── rateLimiter.ts     # Rate limiting
│   └── validation.ts      # Request validation
├── routes/           # API route definitions
│   └── movingEstimates.ts
├── scripts/          # Database administration scripts
│   ├── dbSetup.ts    # Database setup script
│   └── dbMigrate.ts  # Migration management
├── services/         # Business logic layer
│   └── movingEstimateService.ts
├── types/            # TypeScript type definitions
│   └── movingEstimateTypes.ts
└── server.ts         # Main application entry point
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MySQL 8.0+
- npm or yarn

### Installation

1. Install dependencies:

```bash
npm install
```

2. Set up environment variables:

```bash
# Copy the example environment file
cp .env.example .env
# Edit .env with your database credentials
```

3. Set up the database:

```bash
# Create tables and seed with sample data
npm run db:setup

# Or run individual commands:
npm run db:create    # Create tables only
npm run db:seed      # Insert sample data
npm run db:reset     # Drop and recreate tables
```

### Development

Start the development server:

```bash
npm run dev
```

The server will be running at `http://localhost:3001`

## 📝 API Endpoints

### Moves Management

| Method   | Endpoint                  | Description                | Rate Limit |
| -------- | ------------------------- | -------------------------- | ---------- |
| `POST`   | `/api/moves`              | Create new move request    | 5/hour     |
| `GET`    | `/api/moves`              | Get all moves (admin)      | 200/15min  |
| `GET`    | `/api/moves/:id`          | Get move by ID             | 200/15min  |
| `GET`    | `/api/moves/:id/details`  | Get move with full details | 200/15min  |
| `GET`    | `/api/moves/:id/price`    | Calculate move price       | 200/15min  |
| `GET`    | `/api/moves/customer/:id` | Get moves by customer      | 200/15min  |
| `PUT`    | `/api/moves/:id`          | Update move                | 200/15min  |
| `DELETE` | `/api/moves/:id`          | Delete move                | 200/15min  |
| `POST`   | `/api/moves/:id/items`    | Add item to move           | 200/15min  |
| `DELETE` | `/api/moves/items/:id`    | Remove item from move      | 200/15min  |

### Move Types

| Method   | Endpoint              | Description                 | Rate Limit |
| -------- | --------------------- | --------------------------- | ---------- |
| `GET`    | `/api/move-types`     | Get all move types (public) | 100/15min  |
| `GET`    | `/api/move-types/:id` | Get move type by ID         | 100/15min  |
| `POST`   | `/api/move-types`     | Create move type (admin)    | 200/15min  |
| `PUT`    | `/api/move-types/:id` | Update move type (admin)    | 200/15min  |
| `DELETE` | `/api/move-types/:id` | Delete move type (admin)    | 200/15min  |

### Move Items

| Method   | Endpoint              | Description                | Rate Limit |
| -------- | --------------------- | -------------------------- | ---------- |
| `GET`    | `/api/move-items`     | Get all move items (admin) | 200/15min  |
| `GET`    | `/api/move-items/:id` | Get move item by ID        | 200/15min  |
| `POST`   | `/api/move-items`     | Create move item (admin)   | 200/15min  |
| `PUT`    | `/api/move-items/:id` | Update move item (admin)   | 200/15min  |
| `DELETE` | `/api/move-items/:id` | Delete move item (admin)   | 200/15min  |

### Health Check

| Method | Endpoint  | Description          |
| ------ | --------- | -------------------- |
| `GET`  | `/health` | Server health status |

## 🗄️ Database Management

### Available Scripts

```bash
# Database setup
npm run db:create    # Create database tables
npm run db:drop      # Drop all tables
npm run db:reset     # Drop and recreate tables
npm run db:seed      # Insert sample data
npm run db:setup     # Complete setup (drop, create, seed)

# Migrations
npm run migrate:up       # Run pending migrations
npm run migrate:down     # Rollback last migration
npm run migrate:status   # Show migration status
```

### Database Schema

#### customers

- Basic customer information (first_name, last_name, email, phone)
- Timestamps for tracking creation and updates

#### move_type

- Different types of moves (studio, 1 room, 2 rooms, etc.)
- Base pricing for each move type

#### move_item

- Available items for moves (furniture, appliances, etc.)
- Base pricing for each item

#### move

- Main move record with customer and move type references
- Origin and destination addresses
- Floor information and elevator availability
- Move date and comments
- Foreign key relationships to customers and move_type tables

#### item_in_move

- Junction table linking moves to items
- Special handling flags (fragile, needs disassembly/reassembly)
- Custom pricing adjustments per item
- Comments for specific item handling instructions

## 🛡️ Security Features

- **Helmet.js**: Security headers
- **CORS**: Configurable cross-origin requests
- **Rate Limiting**: IP-based request limiting
- **Input Validation**: Request validation middleware
- **Error Handling**: Structured error responses
- **SQL Injection Protection**: Parameterized queries

## 🔧 Configuration

The application can be configured via environment variables:

- `PORT`: Server port (default: 3001)
- `NODE_ENV`: Environment (development/production)
- `DB_HOST`: Database host
- `DB_PORT`: Database port
- `DB_USER`: Database username
- `DB_PASSWORD`: Database password
- `DB_NAME`: Database name
- `FRONTEND_URL`: Frontend URL for CORS

## 📊 Monitoring

- Health check endpoint: `GET /health`
- Request logging in development mode
- Structured error logging
- Database connection monitoring

## 🏭 Production Deployment

1. Build the application:

```bash
npm run build
```

2. Set production environment variables
3. Run migrations:

```bash
npm run migrate:up
```

4. Start the production server:

```bash
npm start
```

## 🧪 Testing

```bash
npm test
```

## 📄 API Documentation

### Request/Response Examples

#### Create Move Request

```http
POST /api/moves
Content-Type: application/json

{
  "customer": {
    "first_name": "יוסי",
    "last_name": "כהן",
    "email": "yossi@example.com",
    "phone": "050-123-4567"
  },
  "move_type_id": 4,
  "origin_address": "רחוב הרצל 123, תל אביב",
  "destination_address": "שדרות רוטשילד 456, תל אביב",
  "date": "2024-02-15",
  "origin_floor": 3,
  "destination_floor": 2,
  "origin_has_elevator": true,
  "destination_has_elevator": false,
  "comments": "מעבר דחוף, יש הרבה חפצים שבירים",
  "items": [
    {
      "move_item_id": 1,
      "isFragile": false,
      "needsDisassemble": false,
      "needsReassemble": false,
      "comments": "ספה במצב טוב",
      "addedPrice": 0
    },
    {
      "move_item_id": 5,
      "isFragile": false,
      "needsDisassemble": true,
      "needsReassemble": true,
      "comments": "מיטה צריכה פירוק והרכבה",
      "addedPrice": 50
    }
  ]
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "id": 123,
    "customer_id": 45,
    "move_type_id": 4,
    "origin_address": "רחוב הרצל 123, תל אביב",
    "destination_address": "שדרות רוטשילד 456, תל אביב",
    "date": "2024-02-15",
    "origin_floor": 3,
    "destination_floor": 2,
    "origin_has_elevator": true,
    "destination_has_elevator": false,
    "comments": "מעבר דחוף, יש הרבה חפצים שבירים"
  },
  "message": "Move created successfully"
}
```
