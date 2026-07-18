# MySQL to MongoDB Migration Guide

## Overview

This project has been successfully migrated from MySQL to MongoDB. All MySQL-related code has been removed and replaced with MongoDB functionality.

## What Was Removed

### Files Deleted:

- `backend/src/database/connection.ts` - MySQL connection
- `backend/src/database/schema.ts` - MySQL schema
- `backend/src/scripts/dbSetup.ts` - MySQL setup scripts
- `backend/src/scripts/dbMigrate.ts` - MySQL migration scripts
- `backend/src/services/moveTypeService.ts` - MySQL move type service
- `backend/src/services/customerService.ts` - MySQL customer service
- `backend/src/services/moveItemService.ts` - MySQL move item service
- `backend/src/services/moveService.ts` - MySQL move service
- `backend/src/routes/moveItems.ts` - MySQL move items routes
- `backend/src/routes/moves.ts` - MySQL moves routes
- `backend/src/routes/moveTypes.ts` - MySQL move types routes
- `backend/src/routes/MovingEstimateService.ts` - MySQL estimate service

### Dependencies Removed:

- `mysql2` - MySQL driver

## What Was Added

### New Files:

- `backend/src/database/mongoConnection.ts` - MongoDB connection
- `backend/src/database/models/MoveEstimate.ts` - MongoDB move estimate model
- `backend/src/database/models/Customer.ts` - MongoDB customer model
- `backend/src/services/MongoService.ts` - MongoDB service layer
- `backend/src/controllers/mongoController.ts` - MongoDB controller
- `backend/src/routes/mongoRoutes.ts` - MongoDB API routes

### New Dependencies:

- `mongodb` - MongoDB driver
- `mongoose` - MongoDB ODM

## Updated Configuration

### Database Config (`backend/src/config/database.ts`):

```typescript
export const databaseConfig = {
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/david-move',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },
};
```

## API Endpoints

### Old MySQL Endpoints (Removed):

- `/api/moves` - Move management
- `/api/move-items` - Move items management
- `/api/move-types` - Move types management

### New MongoDB Endpoints:

- `/api/mongo/estimates` - Move estimates (CRUD)
- `/api/mongo/customers` - Customer management
- `/api/mongo/analytics` - Analytics data
- `/api/mongo/search/estimates` - Search estimates
- `/api/mongo/search/customers` - Search customers

## Environment Variables

### Removed (MySQL):

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=david_move
DB_PORT=3306
DB_CONNECTION_LIMIT=10
```

### Added (MongoDB):

```env
MONGODB_URI=mongodb://localhost:27017/david-move
```

## Benefits of Migration

### 1. **Flexibility**

- MongoDB's document-based structure allows for more flexible data modeling
- Easy to add new fields without schema migrations
- Better support for nested data structures

### 2. **Performance**

- Faster read/write operations for complex queries
- Better handling of large datasets
- Built-in indexing for search functionality

### 3. **Scalability**

- Horizontal scaling with sharding
- Better support for distributed systems
- Cloud-native with MongoDB Atlas

### 4. **Developer Experience**

- Simpler data modeling with Mongoose
- Better TypeScript integration
- Rich query capabilities

## Data Migration

If you have existing MySQL data that needs to be migrated:

1. **Export MySQL Data**:

   ```bash
   mysqldump -u root -p david_move > backup.sql
   ```

2. **Transform Data** (if needed):
   - Convert MySQL tables to MongoDB collections
   - Adjust data types and relationships
   - Update field names if necessary

3. **Import to MongoDB**:
   ```bash
   mongoimport --db david-move --collection estimates --file estimates.json
   mongoimport --db david-move --collection customers --file customers.json
   ```

## Testing the Migration

### 1. Start MongoDB:

```bash
mongod
```

### 2. Start the Backend:

```bash
cd backend
pnpm dev
```

### 3. Test API Endpoints:

```bash
# Test health check
curl http://localhost:3001/health

# Test MongoDB endpoints
curl http://localhost:3001/api/mongo/analytics
```

## Troubleshooting

### Common Issues:

1. **MongoDB Connection Error**:
   - Ensure MongoDB is running: `mongod`
   - Check connection string in `.env`
   - Verify MongoDB installation

2. **Missing Dependencies**:

   ```bash
   cd backend
   pnpm install
   ```

3. **Port Conflicts**:
   - MongoDB default port: 27017
   - Backend default port: 3001
   - Ensure ports are available

## Next Steps

1. **Update Frontend**: Modify frontend to use new MongoDB endpoints
2. **Add Authentication**: Implement user authentication with MongoDB
3. **Add Real-time Features**: Use MongoDB change streams for real-time updates
4. **Add Caching**: Implement Redis caching for better performance
5. **Add Monitoring**: Set up MongoDB monitoring and alerting

## Support

For issues or questions about the MongoDB migration:

- Check the MongoDB documentation
- Review the `MONGODB_README.md` file
- Test with the provided API endpoints
