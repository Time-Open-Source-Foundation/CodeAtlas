/**
 * Test script to compare different free Gemini models
 * Tests: gemini-1.5-flash, gemini-1.5-pro, gemini-2.0-flash
 * Run with: node packages/core/test-gemini-models.js
 */

const { GeminiClient } = require('./dist/geminiClient');
const { ConsoleLogger } = require('./dist/logger');

// Your API key
const GEMINI_API_KEY = 'AIzaSyBbO5y0HN8a1mYZuJUqdkTJ1jmxXbCSSig';

// Free Gemini models to test (newest first)
const MODELS_TO_TEST = [
    'gemini-2.5-flash',      // Latest with 65k output tokens (RECOMMENDED)
    'gemini-2.5-pro',        // Most capable, 65k output tokens
    'gemini-2.0-flash-exp',  // Experimental 2.0
    'gemini-1.5-flash',      // Reliable 1.5 version
    'gemini-1.5-pro',        // More capable 1.5
];

// Sample codebase to analyze
const SAMPLE_FILES = [
    {
        path: 'src/server.ts',
        content: `
import express from 'express';
import { UserController } from './controllers/UserController';
import { AuthMiddleware } from './middleware/auth';
import { Database } from './database';

const app = express();
const db = new Database();
const userController = new UserController(db);

app.use(express.json());
app.use(AuthMiddleware.verify);

app.get('/api/users', userController.getUsers);
app.post('/api/users', userController.createUser);

app.listen(3000, () => console.log('Server running'));
`
    },
    {
        path: 'src/controllers/UserController.ts',
        content: `
import { Request, Response } from 'express';
import { UserService } from '../services/UserService';
import { Database } from '../database';

export class UserController {
    private userService: UserService;

    constructor(database: Database) {
        this.userService = new UserService(database);
    }

    async getUsers(req: Request, res: Response) {
        const users = await this.userService.getAllUsers();
        res.json(users);
    }

    async createUser(req: Request, res: Response) {
        const user = await this.userService.createUser(req.body);
        res.status(201).json(user);
    }
}
`
    },
    {
        path: 'src/services/UserService.ts',
        content: `
import { Database } from '../database';
import { User } from '../models/User';

export class UserService {
    constructor(private db: Database) {}

    async getAllUsers(): Promise<User[]> {
        return this.db.query('SELECT * FROM users');
    }

    async createUser(data: Partial<User>): Promise<User> {
        return this.db.insert('users', data);
    }

    async updateUser(id: string, data: Partial<User>): Promise<User> {
        return this.db.update('users', id, data);
    }
}
`
    },
    {
        path: 'src/database.ts',
        content: `
export class Database {
    private connection: any;

    async connect() {
        // Database connection logic
    }

    async query(sql: string): Promise<any[]> {
        // Execute SQL query
        return [];
    }

    async insert(table: string, data: any): Promise<any> {
        // Insert data
        return data;
    }

    async update(table: string, id: string, data: any): Promise<any> {
        // Update data
        return data;
    }
}
`
    },
    {
        path: 'src/middleware/auth.ts',
        content: `
import { Request, Response, NextFunction } from 'express';

export class AuthMiddleware {
    static verify(req: Request, res: Response, next: NextFunction) {
        const token = req.headers.authorization;
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }
        // Verify token logic
        next();
    }
}
`
    },
    {
        path: 'src/models/User.ts',
        content: `
export interface User {
    id: string;
    email: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
}
`
    }
];

class TestLogger {
    info(msg) { console.log(`[INFO] ${msg}`); }
    error(msg) { console.error(`[ERROR] ${msg}`); }
    warn(msg) { console.warn(`[WARN] ${msg}`); }
}

async function testModel(modelName) {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`🧪 TESTING MODEL: ${modelName}`);
    console.log(`${'='.repeat(80)}\n`);

    const logger = new TestLogger();
    
    try {
        const client = new GeminiClient(logger, GEMINI_API_KEY, modelName);
        
        // Test 1: Health Check
        console.log('📊 Step 1: Health Check...');
        const startHealth = Date.now();
        const isHealthy = await client.checkHealth();
        const healthDuration = Date.now() - startHealth;
        
        if (!isHealthy) {
            console.error(`❌ Health check failed for ${modelName}`);
            return null;
        }
        console.log(`✅ Health check passed (${healthDuration}ms)\n`);

        // Test 2: Architecture Analysis
        console.log('📊 Step 2: Analyzing sample codebase...');
        const startAnalysis = Date.now();
        const analysis = await client.analyze(SAMPLE_FILES);
        const analysisDuration = Date.now() - startAnalysis;
        
        console.log(`\n✅ Analysis completed in ${(analysisDuration / 1000).toFixed(2)}s`);
        
        // Display Results
        console.log(`\n📋 ANALYSIS RESULTS:`);
        console.log(`   Modules found: ${analysis.modules?.length || 0}`);
        console.log(`   Relationships: ${analysis.relationships?.length || 0}`);
        console.log(`   Pattern: ${analysis.pattern?.name || 'Unknown'} (confidence: ${(analysis.pattern?.confidence || 0) * 100}%)`);
        console.log(`   Layers: ${analysis.layers?.length || 0}`);
        
        if (analysis.summary) {
            console.log(`\n   Summary: ${analysis.summary.substring(0, 200)}${analysis.summary.length > 200 ? '...' : ''}`);
        }

        // Show modules
        if (analysis.modules && analysis.modules.length > 0) {
            console.log(`\n   📦 Modules:`);
            analysis.modules.slice(0, 5).forEach(m => {
                console.log(`      - ${m.name} (${m.type}) [${m.layer}]`);
            });
            if (analysis.modules.length > 5) {
                console.log(`      ... and ${analysis.modules.length - 5} more`);
            }
        }

        // Show relationships
        if (analysis.relationships && analysis.relationships.length > 0) {
            console.log(`\n   🔗 Relationships (showing first 5):`);
            analysis.relationships.slice(0, 5).forEach(r => {
                console.log(`      ${r.from} → ${r.to} (${r.type})`);
            });
            if (analysis.relationships.length > 5) {
                console.log(`      ... and ${analysis.relationships.length - 5} more`);
            }
        }

        // Calculate quality score
        const qualityScore = calculateQualityScore(analysis);
        console.log(`\n   📊 Quality Score: ${qualityScore.total}/100`);
        console.log(`      - Modules: ${qualityScore.modules}/30`);
        console.log(`      - Relationships: ${qualityScore.relationships}/30`);
        console.log(`      - Pattern Detection: ${qualityScore.pattern}/20`);
        console.log(`      - Completeness: ${qualityScore.completeness}/20`);

        return {
            model: modelName,
            success: true,
            healthDuration,
            analysisDuration,
            analysis,
            qualityScore: qualityScore.total
        };

    } catch (error) {
        console.error(`\n❌ Test failed for ${modelName}:`);
        console.error(`   Error: ${error.message}`);
        if (error.message.includes('404') || error.message.includes('not found')) {
            console.log(`   💡 This model may not be available in the free tier or may be experimental`);
        }
        return {
            model: modelName,
            success: false,
            error: error.message
        };
    }
}

function calculateQualityScore(analysis) {
    let modules = 0;
    let relationships = 0;
    let pattern = 0;
    let completeness = 0;

    // Modules score (0-30)
    if (analysis.modules) {
        const moduleCount = analysis.modules.length;
        modules = Math.min(30, moduleCount * 5); // 5 points per module, max 30
        
        // Bonus for detailed modules
        const hasTypes = analysis.modules.some(m => m.type && m.type !== 'other');
        const hasLayers = analysis.modules.some(m => m.layer && m.layer !== 'other');
        if (hasTypes) modules += 5;
        if (hasLayers) modules += 5;
        modules = Math.min(30, modules);
    }

    // Relationships score (0-30)
    if (analysis.relationships) {
        const relCount = analysis.relationships.length;
        relationships = Math.min(30, relCount * 3); // 3 points per relationship, max 30
        
        // Bonus for detailed relationships
        const hasStrength = analysis.relationships.some(r => r.strength);
        const hasDescription = analysis.relationships.some(r => r.description);
        if (hasStrength) relationships += 5;
        if (hasDescription) relationships += 5;
        relationships = Math.min(30, relationships);
    }

    // Pattern detection score (0-20)
    if (analysis.pattern) {
        if (analysis.pattern.name && analysis.pattern.name !== 'Unknown') {
            pattern = 10;
            if (analysis.pattern.confidence > 0.5) pattern += 5;
            if (analysis.pattern.confidence > 0.7) pattern += 3;
            if (analysis.pattern.description) pattern += 2;
        }
    }

    // Completeness score (0-20)
    if (analysis.summary) completeness += 5;
    if (analysis.layers && analysis.layers.length > 0) completeness += 5;
    if (analysis.entryPoints && analysis.entryPoints.length > 0) completeness += 5;
    if (analysis.coreComponents && analysis.coreComponents.length > 0) completeness += 5;

    return {
        modules,
        relationships,
        pattern,
        completeness,
        total: modules + relationships + pattern + completeness
    };
}

async function main() {
    console.log('🚀 Gemini Models Comparison Test');
    console.log('   Testing multiple free Gemini models for code analysis\n');
    console.log(`   API Key: ${GEMINI_API_KEY.substring(0, 20)}...`);
    console.log(`   Sample Files: ${SAMPLE_FILES.length}`);
    console.log(`   Models to Test: ${MODELS_TO_TEST.length}\n`);

    const results = [];

    for (const model of MODELS_TO_TEST) {
        const result = await testModel(model);
        results.push(result);
        
        // Wait a bit between tests to avoid rate limits
        if (MODELS_TO_TEST.indexOf(model) < MODELS_TO_TEST.length - 1) {
            console.log('\n⏳ Waiting 2 seconds before next test...\n');
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }

    // Final Summary
    console.log(`\n\n${'='.repeat(80)}`);
    console.log('📊 FINAL COMPARISON');
    console.log(`${'='.repeat(80)}\n`);

    const successfulResults = results.filter(r => r.success);
    
    if (successfulResults.length === 0) {
        console.log('❌ No models were successful. Check your API key and internet connection.');
        return;
    }

    successfulResults.sort((a, b) => b.qualityScore - a.qualityScore);

    console.log('Model Performance Ranking:\n');
    successfulResults.forEach((result, idx) => {
        const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '  ';
        console.log(`${medal} ${idx + 1}. ${result.model}`);
        console.log(`   Quality Score: ${result.qualityScore}/100`);
        console.log(`   Analysis Time: ${(result.analysisDuration / 1000).toFixed(2)}s`);
        console.log(`   Modules: ${result.analysis.modules?.length || 0}`);
        console.log(`   Relationships: ${result.analysis.relationships?.length || 0}`);
        console.log(`   Pattern: ${result.analysis.pattern?.name || 'Unknown'}\n`);
    });

    // Recommendation
    const best = successfulResults[0];
    console.log(`\n💡 RECOMMENDATION: Use ${best.model}`);
    console.log(`   - Best quality score: ${best.qualityScore}/100`);
    console.log(`   - Analysis time: ${(best.analysisDuration / 1000).toFixed(2)}s`);
    console.log(`   - Good balance of speed and accuracy\n`);

    // Failed models
    const failedResults = results.filter(r => !r.success);
    if (failedResults.length > 0) {
        console.log(`\n⚠️  Failed Models (${failedResults.length}):`);
        failedResults.forEach(result => {
            console.log(`   - ${result.model}: ${result.error}`);
        });
    }
}

main().catch(console.error);
