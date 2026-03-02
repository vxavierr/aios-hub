import { createClientFromRequest } from 'npm:@base44/sdk@0.8.12';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        // Fetch public pricing config
        const configs = await base44.asServiceRole.entities.AppConfig.filter({}); // Fetch all to filter in memory or specific keys if possible
        
        const getConfig = (key) => configs.find(c => c.config_key === key)?.config_value;
        
        const publicPricingEnabled = getConfig('public_pricing_enabled') === 'true';
        const startDateStr = getConfig('public_pricing_start_date');
        const endDateStr = getConfig('public_pricing_end_date');
        
        let canViewPricesWithoutLogin = false;
        
        if (publicPricingEnabled) {
            const now = new Date();
            let isValidDateRange = true;
            
            if (startDateStr) {
                const startDate = new Date(startDateStr);
                if (now < startDate) isValidDateRange = false;
            }
            
            if (endDateStr && isValidDateRange) {
                // Set end date to end of day
                const endDate = new Date(endDateStr);
                endDate.setHours(23, 59, 59, 999);
                if (now > endDate) isValidDateRange = false;
            }
            
            canViewPricesWithoutLogin = isValidDateRange;
        }

        // Return public configuration that is safe to expose to the frontend
        return Response.json({
            googleMapsApiKey: Deno.env.get("GOOGLE_MAPS_API_KEY") || "",
            stripePublishableKey: Deno.env.get("STRIPE_PUBLISHABLE_KEY") || "",
            publicPricing: {
                enabled: canViewPricesWithoutLogin
            }
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});