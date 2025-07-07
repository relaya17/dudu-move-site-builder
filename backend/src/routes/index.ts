// Routes index - exports all route modules
export { default as movesRouter } from './moves';
export { default as moveItemsRouter } from './moveItems';
export { default as moveTypesRouter } from './moveTypes';
export { default as moveRequestRouter } from './moveRequestRoutes';

// Route paths for easy reference
export const ROUTES = {
    MOVES: '/api/moves',
    MOVE_ITEMS: '/api/move-items',
    MOVE_TYPES: '/api/move-types',
    MOVE_REQUESTS: '/api/move-requests'
} as const;
