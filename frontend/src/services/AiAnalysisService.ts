import { adminHeaders } from '@/lib/adminApi';

const API_BASE_URL = import.meta.env.VITE_API_URL ||
    (typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:3001' : 'https://dudu-move-backend.onrender.com');

export class AiAnalysisService {
    static async generateBusinessInsights() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/ai/business-insights`, {
                method: 'GET',
                headers: adminHeaders({ 'Content-Type': 'application/json' }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching business insights:', error);
            throw error;
        }
    }

    static async generatePricingRecommendations() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/ai/pricing-recommendations`, {
                method: 'GET',
                headers: adminHeaders({ 'Content-Type': 'application/json' }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching pricing recommendations:', error);
            throw error;
        }
    }

    static async generateCustomAnalysis(
        query: string,
        history: { role: 'user' | 'assistant'; content: string }[] = []
    ) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/ai/custom-analysis`, {
                method: 'POST',
                headers: adminHeaders({ 'Content-Type': 'application/json' }),
                body: JSON.stringify({ query, history }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error generating custom analysis:', error);
            throw error;
        }
    }
} 