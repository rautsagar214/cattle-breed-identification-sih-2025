// List available Gemini models
const GEMINI_API_KEY = 'AIzaSyBIRZkOd7ZEMHe5C6AD2s6GVyyIDqBm6gI';

async function listModels() {
  console.log('🔍 Listing available Gemini models...\n');
  
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`
    );
    
    if (!response.ok) {
      console.error('Error:', response.status, response.statusText);
      return;
    }
    
    const data = await response.json();
    
    console.log('✅ Available models:\n');
    data.models.forEach(model => {
      console.log(`📌 ${model.name}`);
      console.log(`   Display Name: ${model.displayName}`);
      console.log(`   Supported: ${model.supportedGenerationMethods.join(', ')}`);
      console.log('');
    });
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

listModels();
