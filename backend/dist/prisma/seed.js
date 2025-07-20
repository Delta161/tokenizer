import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    // 1. Create a user
    const user = await prisma.user.create({
        data: {
            email: 'testuser@example.com',
            fullName: 'Test User',
            authProvider: 'GOOGLE',
            providerId: 'google-oauth2|1234567890',
            avatarUrl: 'https://i.pravatar.cc/150?img=5',
        },
    });
    // 2. Create investor profile
    const investor = await prisma.investor.create({
        data: {
            userId: user.id,
            nationality: 'Netherlands',
            isVerified: true,
            verifiedAt: new Date(),
            dateOfBirth: new Date('1985-06-01'),
            phoneNumber: '+31600000000',
            address: 'Investorstraat 1',
            city: 'Amsterdam',
            country: 'Netherlands',
            postalCode: '1011AB',
        },
    });
    // 3. Create wallet
    const wallet = await prisma.wallet.create({
        data: {
            investorId: investor.id,
            address: '0x1234567890abcdef1234567890abcdef12345678',
            isVerified: true,
            verifiedAt: new Date(),
        },
    });
    // 4. Create client profile
    const client = await prisma.client.create({
        data: {
            userId: user.id,
            companyName: 'Real Estate B.V.',
            contactEmail: 'developer@example.com',
            contactPhone: '+31699999999',
            country: 'Netherlands',
            legalEntityNumber: '12345678',
            walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
            status: 'APPROVED',
            logoUrl: 'https://example.com/logo.png',
        },
    });
    // 5. Create property
    const property = await prisma.property.create({
        data: {
            clientId: client.id,
            title: 'Waterfront Apartments',
            description: 'A luxury apartment project in Belgrade Waterfront.',
            location: 'Belgrade, Serbia',
            country: 'Serbia',
            city: 'Belgrade',
            valuation: 5_000_000,
            currency: 'EUR',
            totalTokens: 100_000,
            tokenPrice: 50,
        },
    });
    // 6. Create token
    const token = await prisma.token.create({
        data: {
            propertyId: property.id,
            name: 'Waterfront Token',
            symbol: 'WFT',
            decimals: 18,
            totalSupply: 100_000,
            isMinted: true,
            isActive: true,
        },
    });
    // 7. Create investment
    const investment = await prisma.investment.create({
        data: {
            investorId: investor.id,
            tokenId: token.id,
            walletId: wallet.id,
            amount: 1000,
            pricePerToken: 50,
            totalValue: 50_000,
            currency: 'EUR',
            paymentMethod: 'CRYPTO',
            status: 'CONFIRMED',
            paymentRef: '0xabc123abc123abc123abc123abc123abc123abc1',
            isOnChain: true,
            ipAddress: '192.168.1.10',
            userAgent: 'PostmanRuntime/7.29.2',
            kycVerifiedAt: new Date(),
        },
    });
    console.log('✅ Seed complete');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(() => {
    prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map