const axios = require('axios');

const mintPromoOnShop = async ({ discountType = 'percent', value = 10, maxUses = 1, expiresInDays = 14, source = 'arcade_runner', ownerPseudo = null, note = '' }) => {
    const shopApiUrl = process.env.SHOP_API_URL || 'http://localhost:5000';
    const secret = process.env.ARCADE_SECRET || 'yazex-arcade-dev-secret';

    const response = await axios.post(
        `${shopApiUrl}/api/promos/mint`,
        { discountType, value, maxUses, expiresInDays, source, ownerPseudo, note },
        {
            headers: {
                'x-arcade-secret': secret,
                'Content-Type': 'application/json'
            },
            timeout: 6000
        }
    );

    if (!response.data?.success) {
        throw new Error('Failed to mint promo code on Yazix Ship');
    }
    return response.data.data;
};

module.exports = { mintPromoOnShop };
