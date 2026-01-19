# Startup script to validate environment before launching
node - e "
const { validateEnvironment, getConfigSummary } = require('./src/config/index.ts');
const { logStartup, logError } = require('./src/lib/logger.ts');

try {
    validateEnvironment();
    const summary = getConfigSummary();
    logStartup(summary);
    console.log('✅ Environment validation passed');
    process.exit(0);
} catch (error) {
    logError('Environment validation failed', error);
    console.error('❌ Environment validation failed:', error.message);
    process.exit(1);
}
"
