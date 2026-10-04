import { createApp } from './app.js';
import { BusinessService } from './services/businessService.js';

const app = createApp();
const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`🚀 AI Receptionist Backend listening on http://localhost:${PORT}`);
  try {
    // Ensure default business configuration exists
    await BusinessService.getBusinessProfile();
    console.log('✅ Default business profile initialized.');
  } catch (err) {
    console.warn('⚠️ Note: Database connection will initialize upon first query or migration.');
  }
});
