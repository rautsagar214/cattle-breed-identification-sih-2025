/**
 * Test script for multilingual Gemini responses
 * Tests chatbot responses in English, Hindi, and Gujarati
 */

const GEMINI_API_KEY = 'AIzaSyBIRZkOd7ZEMHe5C6AD2s6GVyyIDqBm6gI';
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

const LANGUAGE_NAMES = {
  'en': 'English',
  'hi': 'Hindi (हिन्दी)',
  'gu': 'Gujarati (ગુજરાતી)',
  'mr': 'Marathi (मराठी)',
  'ta': 'Tamil (தமிழ்)',
};

function getSystemPrompt(languageCode = 'en') {
  const languageName = LANGUAGE_NAMES[languageCode] || 'English';
  
  if (languageCode === 'en') {
    return `You are an expert cattle farming assistant specialized in Indian cattle breeds and dairy farming practices.`;
  }
  
  return `You are an expert cattle farming assistant specialized in Indian cattle breeds and dairy farming practices.

IMPORTANT: The user speaks ${languageName}. You MUST respond in ${languageName} language.
Write your ENTIRE response in ${languageName}, not English. Use ${languageName} script and vocabulary.

Be concise, practical, and culturally appropriate for Indian farmers.`;
}

async function testLanguage(languageCode, question) {
  console.log('\n' + '='.repeat(60));
  console.log(`Testing ${LANGUAGE_NAMES[languageCode]} (${languageCode})`);
  console.log('='.repeat(60));
  console.log(`Question: ${question}`);
  console.log('\nSystem Prompt:', getSystemPrompt(languageCode).substring(0, 150) + '...');
  
  const systemPrompt = getSystemPrompt(languageCode);
  const fullPrompt = systemPrompt + '\n\nUser question: ' + question;
  
  const requestBody = {
    contents: [{
      parts: [{
        text: fullPrompt
      }]
    }],
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 2048,
    },
  };

  try {
    console.log('\n📤 Sending request to Gemini...');
    
    const response = await fetch(`${API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error:', response.status, errorText);
      return;
    }

    const data = await response.json();
    
    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
      const aiResponse = data.candidates[0].content.parts[0].text;
      console.log('\n✅ Response received:');
      console.log('-'.repeat(60));
      console.log(aiResponse);
      console.log('-'.repeat(60));
      
      // Check if response is in expected language (basic check)
      const isEnglish = /^[a-zA-Z0-9\s.,!?'"()-]+$/.test(aiResponse.substring(0, 100));
      if (languageCode !== 'en' && isEnglish) {
        console.log('\n⚠️  WARNING: Response appears to be in English, not', LANGUAGE_NAMES[languageCode]);
      } else if (languageCode !== 'en') {
        console.log('\n✅ Response appears to be in', LANGUAGE_NAMES[languageCode]);
      }
    } else {
      console.log('❌ Unexpected response structure:', JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

async function runTests() {
  console.log('🧪 Testing Multilingual Gemini Responses');
  console.log('==========================================\n');
  
  // Test 1: English
  await testLanguage('en', 'What are the key characteristics of Gir cattle?');
  
  await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s between requests
  
  // Test 2: Hindi
  await testLanguage('hi', 'गिर गाय की मुख्य विशेषताएं क्या हैं?');
  
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Test 3: Gujarati
  await testLanguage('gu', 'ગાયને શું ખોરાક આપવો જોઈએ?');
  
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Test 4: Marathi
  await testLanguage('mr', 'गुरांची काळजी कशी घ्यावी?');
  
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Test 5: Tamil
  await testLanguage('ta', 'பசுக்களின் பராமரிப்பு எப்படி செய்வது?');
  
  console.log('\n\n' + '='.repeat(60));
  console.log('🎉 All tests completed!');
  console.log('='.repeat(60));
  console.log('\nKey Observations:');
  console.log('- Check if responses are in the requested language');
  console.log('- Verify technical accuracy of cattle information');
  console.log('- Assess if language is natural and culturally appropriate');
}

runTests().catch(console.error);
