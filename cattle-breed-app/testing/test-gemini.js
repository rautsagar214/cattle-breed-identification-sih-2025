// Test Gemini API Connection
// Run with: node test-gemini.js

const GEMINI_API_KEY = 'AIzaSyBIRZkOd7ZEMHe5C6AD2s6GVyyIDqBm6gI';
// Using Gemini 2.5 Flash - Latest model
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

async function testGemini() {
  console.log('🧪 Testing Gemini API...');
  console.log('📍 API Key:', GEMINI_API_KEY.substring(0, 10) + '...');
  
  try {
    const testMessage = 'Hello, tell me about Gir cattle breed in one sentence.';
    console.log('📤 Sending test message:', testMessage);
    
    const response = await fetch(GEMINI_API_URL + '?key=' + GEMINI_API_KEY, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: testMessage
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
        },
      }),
    });

    console.log('📊 Response status:', response.status);
    console.log('📊 Response status text:', response.statusText);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Error response:', JSON.stringify(errorData, null, 2));
      return;
    }

    const data = await response.json();
    console.log('✅ Success! Response received');
    
    if (data.candidates && data.candidates.length > 0) {
      const aiResponse = data.candidates[0].content.parts[0].text;
      console.log('💬 AI Response:', aiResponse);
      console.log('\n✅ Gemini API is working correctly!');
    } else {
      console.error('❌ No candidates in response');
      console.log('Full response:', JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
  }
}

testGemini();
