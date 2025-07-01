import { Request, Response, NextFunction } from 'express';
import { createError } from './errorHandler';

export const validateMovingEstimate = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const { customerInfo, apartmentDetails, inventory } = req.body;

    // Validate customer info
    if (!customerInfo) {
        return next(createError('Customer information is required', 400));
    }

    if (!customerInfo.name || customerInfo.name.trim().length < 2) {
        return next(createError('Customer name must be at least 2 characters long', 400));
    }

    if (!customerInfo.email || !isValidEmail(customerInfo.email)) {
        return next(createError('Valid email address is required', 400));
    }

    if (!customerInfo.phone || !isValidPhone(customerInfo.phone)) {
        return next(createError('Valid phone number is required', 400));
    }

    // Validate apartment details
    if (!apartmentDetails) {
        return next(createError('Apartment details are required', 400));
    }

    if (!apartmentDetails.apartmentType) {
        return next(createError('Apartment type is required', 400));
    }

    if (!apartmentDetails.currentAddress || apartmentDetails.currentAddress.trim().length < 5) {
        return next(createError('Current address must be at least 5 characters long', 400));
    }

    if (!apartmentDetails.destinationAddress || apartmentDetails.destinationAddress.trim().length < 5) {
        return next(createError('Destination address must be at least 5 characters long', 400));
    }

    // Validate inventory (optional but if provided should be an array)
    if (inventory && !Array.isArray(inventory)) {
        return next(createError('Inventory must be an array', 400));
    }

    next();
};

export const validateEstimateUpdate = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const { status, estimatedPrice } = req.body;

    if (!status) {
        return next(createError('Status is required', 400));
    }

    const validStatuses = ['pending', 'estimated', 'accepted', 'rejected'];
    if (!validStatuses.includes(status)) {
        return next(createError(`Status must be one of: ${validStatuses.join(', ')}`, 400));
    }

    if (estimatedPrice !== undefined) {
        const price = parseFloat(estimatedPrice);
        if (isNaN(price) || price < 0) {
            return next(createError('Estimated price must be a valid positive number', 400));
        }
    }

    next();
};

export const validateEstimateId = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const { id } = req.params;

    if (!id) {
        return next(createError('Estimate ID is required', 400));
    }

    // Check if ID follows the expected format (estimate_123)
    if (!id.match(/^estimate_\d+$/)) {
        return next(createError('Invalid estimate ID format', 400));
    }

    next();
};

// Helper functions
const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const isValidPhone = (phone: string): boolean => {
    // Israeli phone number validation (basic)
    const phoneRegex = /^(\+972|0)([23489]|5[0248]|77)[0-9]{7}$/;
    const cleanPhone = phone.replace(/[-\s]/g, '');
    return phoneRegex.test(cleanPhone);
}; 