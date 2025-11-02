/**
 * Standalone script to sync football events from external API
 * Run with: npx tsx scripts/sync-events.ts
 */

import { PrismaClient } from '@prisma/client';
import { fetchUpcomingFootballMatches } from '../lib/footballApi';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('🚀 Starting event synchronization...\n');
        
        // Fetch upcoming matches
        const matches = await fetchUpcomingFootballMatches();
        
        if (matches.length === 0) {
            console.log('⚠️  No matches found from external API');
            return;
        }
        
        console.log(`📊 Found ${matches.length} upcoming matches\n`);
        
        let syncedCount = 0;
        let skippedCount = 0;
        let errorCount = 0;
        
        // Process each match
        for (const match of matches) {
            try {
                // Check if event already exists
                const existingEvent = await prisma.event.findFirst({
                    where: {
                        name: match.name,
                        date: match.date,
                        time: match.time
                    }
                });
                
                if (existingEvent) {
                    console.log(`⏭️  Skipping existing: ${match.name}`);
                    skippedCount++;
                    continue;
                }
                
                // Create new event
                await prisma.event.create({
                    data: match
                });
                
                console.log(`✅ Added: ${match.name} - ${match.date} ${match.time}`);
                syncedCount++;
                
            } catch (error) {
                console.error(`❌ Error adding ${match.name}:`, error);
                errorCount++;
            }
        }
        
        console.log('\n📈 Synchronization Summary:');
        console.log(`   ✅ Synced: ${syncedCount}`);
        console.log(`   ⏭️  Skipped: ${skippedCount}`);
        console.log(`   ❌ Errors: ${errorCount}`);
        console.log(`   📊 Total: ${matches.length}`);
        
    } catch (error) {
        console.error('💥 Fatal error during synchronization:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();

