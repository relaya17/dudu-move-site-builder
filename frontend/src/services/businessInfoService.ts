const API_ROOT = import.meta.env.VITE_API_URL ||
    (typeof window !== 'undefined' && window.location.hostname === 'localhost'
        ? 'http://localhost:3001'
        : 'https://dudu-move-backend.onrender.com');

export const FALLBACK_BUSINESS_NAME = 'דוד הובלות';

export interface PublicBusinessContact {
    businessName: string;
    phone?: string;
    email?: string;
    address?: string;
}

export async function fetchBusinessName(tenantSlug?: string): Promise<string> {
    const info = await fetchBusinessContact(tenantSlug);
    return info.businessName || FALLBACK_BUSINESS_NAME;
}

export async function fetchBusinessContact(tenantSlug?: string): Promise<PublicBusinessContact> {
    try {
        const qs = tenantSlug ? `?tenantSlug=${encodeURIComponent(tenantSlug)}` : '';
        const res = await fetch(`${API_ROOT}/api/public/business-info${qs}`);
        const json = await res.json();
        if (json?.success && json.data) {
            return {
                businessName: json.data.businessName || FALLBACK_BUSINESS_NAME,
                phone: json.data.phone,
                email: json.data.email,
                address: json.data.address,
            };
        }
    } catch (err) {
        console.error('Failed to fetch business info:', err);
    }
    return { businessName: FALLBACK_BUSINESS_NAME };
}
