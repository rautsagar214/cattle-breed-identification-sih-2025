// Google Gemini AI API Integration
// Used for: Chatbot functionality, answering cattle-related questions

interface ChatMessage {
  isBot: boolean;
  text: string;
}

/**
 * Gemini API Configuration
 * Get API key from: https://makersuite.google.com/app/apikey
 * For free API key: https://aistudio.google.com/app/apikey
 * 
 * API key is loaded from .env file for security
 */
const GEMINI_API_KEY: string = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
// Using Gemini 2.5 Flash - Latest, fastest, and free model
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

/**
 * Language name mapping for Gemini
 * Maps language codes to full language names
 */
const LANGUAGE_NAMES: { [key: string]: string } = {
  'en': 'English',
  'hi': 'Hindi (हिन्दी)',
  'gu': 'Gujarati (ગુજરાતી)',
  'bn': 'Bengali (বাংলা)',
  'te': 'Telugu (తెలుగు)',
  'mr': 'Marathi (मराठी)',
  'ta': 'Tamil (தமிழ்)',
  'ur': 'Urdu (اردو)',
  'kn': 'Kannada (ಕನ್ನಡ)',
  'ml': 'Malayalam (മലയാളം)',
  'or': 'Odia (ଓଡ଼ିଆ)',
  'pa': 'Punjabi (ਪੰਜਾਬੀ)',
  'as': 'Assamese (অসমীয়া)',
  'mai': 'Maithili (मैथिली)',
  'sa': 'Sanskrit (संस्कृतम्)',
  'ks': 'Kashmiri (कॉशुर)',
  'ne': 'Nepali (नेपाली)',
  'sd': 'Sindhi (सिन्धी)',
  'kok': 'Konkani (कोंकणी)',
  'doi': 'Dogri (डोगरी)',
  'mni': 'Manipuri (মৈতৈলোন্)',
  'sat': 'Santali (ᱥᱟᱱᱛᱟᱲᱤ)',
  'bo': 'Bodo (बड़ो)',
};

/**
 * Get system prompt with language instruction
 * @param {string} languageCode - User's selected language code
 * @returns {string} - Customized system prompt
 */
const getSystemPrompt = (languageCode: string = 'en'): string => {
  const languageName = LANGUAGE_NAMES[languageCode] || 'English';
  
  if (languageCode === 'en') {
    return 'You are an expert cattle farming assistant for Indian farmers. You help with: Cattle breed identification and characteristics, Animal health and disease prevention, Feeding and nutrition advice, Dairy farming best practices, Indian cattle breeds (Gir, Sahiwal, Red Sindhi, etc.). Always provide practical, actionable advice suitable for Indian farming conditions. Answer in simple, clear English.';
  }
  
  return `You are an expert cattle farming assistant for Indian farmers. You help with: Cattle breed identification and characteristics, Animal health and disease prevention, Feeding and nutrition advice, Dairy farming best practices, Indian cattle breeds (Gir, Sahiwal, Red Sindhi, etc.). 

IMPORTANT: The user speaks ${languageName}. You MUST respond in ${languageName} language. Write your entire response in ${languageName}. Keep the language simple and practical for farmers.`;
};

/**
 * Send message to Gemini AI
 * @param {string} userMessage - User's question
 * @param {Array} chatHistory - Previous conversation (optional)
 * @param {string} languageCode - User's selected language code (optional)
 * @returns {Promise<string>} - AI response
 */
export const sendMessageToGemini = async (
  userMessage: string, 
  chatHistory: ChatMessage[] = [], 
  languageCode: string = 'en'
): Promise<string> => {
  try {
    console.log('📤 Sending message to Gemini:', userMessage);
    console.log('🌍 Language:', languageCode);

    // Check if API key is set
    if (!GEMINI_API_KEY || GEMINI_API_KEY.trim() === '' || GEMINI_API_KEY.includes('XXX')) {
      console.log('⚠️ Gemini API key not configured - using mock responses');
      return "INFO: AI is currently using offline mode with pre-configured responses.\n\nTo enable real AI:\n1. Get free API key from: https://aistudio.google.com/app/apikey\n2. Add it to src/services/gemini.tsx\n3. Restart the app";
    }

    // Build conversation context with language-specific system prompt
    let contextMessage = getSystemPrompt(languageCode) + '\n\n';
    
    // Add chat history for context
    if (chatHistory.length > 0) {
      chatHistory.forEach(msg => {
        contextMessage += msg.isBot ? 'Assistant: ' + msg.text + '\n' : 'User: ' + msg.text + '\n';
      });
    }
    
    contextMessage += 'User: ' + userMessage + '\nAssistant:';

    // Call Gemini API using fetch (React Native compatible)
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
                text: contextMessage
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

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Gemini API error response:', errorData);
      console.error('❌ Status:', response.status);
      console.error('❌ Status Text:', response.statusText);
      
      // Provide more specific error messages
      if (response.status === 400) {
        throw new Error('Invalid API request. Please check your message.');
      } else if (response.status === 403) {
        throw new Error('API key is invalid or expired. Please check GEMINI_API_KEY in .env file.');
      } else if (response.status === 429) {
        throw new Error('Too many requests. Please wait a moment and try again.');
      } else if (response.status >= 500) {
        throw new Error('Gemini service is temporarily unavailable. Please try again later.');
      } else {
        throw new Error('API request failed with status: ' + response.status);
      }
    }

    const data = await response.json();
    console.log('✅ Gemini API response received');
    console.log('📋 Response structure:', JSON.stringify(data, null, 2));
    
    if (!data.candidates || data.candidates.length === 0) {
      console.error('❌ No candidates in response:', data);
      throw new Error('No response generated. The content might have been blocked by safety filters.');
    }

    // Safely parse response
    const candidate = data.candidates[0];
    if (!candidate || !candidate.content) {
      console.error('❌ Invalid response structure:', candidate);
      throw new Error('Invalid response format from Gemini API');
    }

    // Handle different response structures
    let aiResponse = '';
    if (candidate.content.parts && Array.isArray(candidate.content.parts)) {
      aiResponse = candidate.content.parts.map((part: any) => part.text || '').join('');
    } else if (candidate.content.text) {
      aiResponse = candidate.content.text;
    } else {
      console.error('❌ Unknown content structure:', candidate.content);
      throw new Error('Cannot extract text from Gemini response');
    }

    if (!aiResponse || aiResponse.trim() === '') {
      throw new Error('Empty response from Gemini API');
    }
    
    return aiResponse.trim();
  } catch (error: any) {
    console.error('❌ Error calling Gemini API:', error);
    console.error('❌ Error message:', error.message);
    
    // If it's already a formatted error, throw it as is
    if (error.message.includes('API key') || error.message.includes('request') || error.message.includes('service')) {
      throw error;
    }
    
    // Network or other errors
    if (error.message.includes('Network') || error.message.includes('fetch')) {
      throw new Error('Network error. Please check your internet connection.');
    }
    
    throw new Error('Failed to get response from AI: ' + error.message);
  }
};

/**
 * Get breed information from Gemini
 * @param {string} breedName - Name of the cattle breed
 * @param {string} languageCode - User's selected language code
 * @returns {Promise<string>} - Detailed breed information
 */
export const getBreedInfo = async (breedName: string, languageCode: string = 'en'): Promise<string> => {
  try {
    const languageName = LANGUAGE_NAMES[languageCode] || 'English';
    let prompt = `Give concise information about ${breedName} cattle breed:

**Physical Characteristics:**
- List 4 key physical features

**Care Requirements:**
- List 4 essential care tips

Be brief and practical for farmers. Use bullet points with -.`;
    
    if (languageCode !== 'en') {
      prompt += `\n\nIMPORTANT: Write your entire response in ${languageName} language. Use the same format with bullet points starting with -.`;
    }

    const response = await sendMessageToGemini(prompt, [], languageCode);
    return response;
  } catch (error) {
    console.error('Error getting breed info:', error);
    throw error;
  }
};

/**
 * Get cattle care advice
 * @param {string} question - Specific care question
 * @param {string} languageCode - User's selected language code
 * @returns {Promise<string>} - Care advice
 */
export const getCareAdvice = async (question: string, languageCode: string = 'en'): Promise<string> => {
  try {
    const languageName = LANGUAGE_NAMES[languageCode] || 'English';
    let prompt = `As a cattle farming expert, answer this question: ${question}. Provide practical advice suitable for Indian farming conditions.`;
    
    if (languageCode !== 'en') {
      prompt += `\n\nIMPORTANT: Write your entire response in ${languageName} language.`;
    }

    const response = await sendMessageToGemini(prompt, [], languageCode);
    return response;
  } catch (error) {
    console.error('Error getting care advice:', error);
    throw error;
  }
};

/**
 * Translate text using Gemini (for dynamic content translation)
 * @param {string} text - Text to translate
 * @param {string} targetLanguageCode - Target language code
 * @returns {Promise<string>} - Translated text
 */
export const translateText = async (text: string, targetLanguageCode: string): Promise<string> => {
  try {
    const targetLanguageName = LANGUAGE_NAMES[targetLanguageCode] || 'English';
    const prompt = `Translate the following text to ${targetLanguageName}: "${text}"\n\nProvide only the translation, nothing else. Keep the meaning accurate and natural for cattle farming context.`;

    const response = await sendMessageToGemini(prompt, [], 'en');
    return response.trim();
  } catch (error) {
    console.error('Error translating text:', error);
    throw error;
  }
};

/**
 * Detect cattle breed from image using Gemini Vision API
 * @param {string} imageBase64 - Base64 encoded image data
 * @returns {Promise<{breedName: string, confidence: number, description: string}>} - Detection result
 */
export const detectBreedFromImage = async (imageBase64: string): Promise<{
  breedName: string;
  confidence: number;
  description: string;
}> => {
  try {
    console.log('🔍 Detecting breed using Gemini Vision API...');

    if (!GEMINI_API_KEY || GEMINI_API_KEY.trim() === '' || GEMINI_API_KEY.includes('XXX')) {
      throw new Error('Gemini API key not configured');
    }

    // Remove data URL prefix if present
    const base64Data = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');

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
                text: `You are an expert in Indian cattle breed identification. Analyze this image VERY CAREFULLY and identify the cattle breed based on what you ACTUALLY SEE in THIS specific image.

CRITICAL: Look at THIS SPECIFIC ANIMAL in the image and note:
- Horn shape and size (curved, straight, lyre-shaped, polled, or absent)
- Hump size and position (prominent, medium, small, or absent)
- Coat color patterns (exact colors: white, black, brown, red, grey, spotted, patched)
- Ear shape and size (small, large, drooping, upright)
- Dewlap size and characteristics
- Body structure and size (large, medium, compact, muscular)
- Facial features (forehead shape, muzzle color and shape)
- Any distinctive markings or features

Indian Indigenous Breeds:
1. GIR: Prominent forehead bulge, long drooping ears, lyre-shaped horns, white with red/brown spots
2. SAHIWAL: Reddish-brown color, loose skin with prominent dewlap, small horns, medium hump
3. RED SINDHI: Dark red/brownish-red color, compact body, small horns or polled, small hump
4. THARPARKAR: White/light grey, medium-sized, well-proportioned, curved horns, medium hump
5. HARIANA: Grey-white color, powerful build, short thick horns, prominent hump
6. KANGAYAM: Dark red or grey color, compact muscular build, medium horns, small hump
7. ONGOLE: Large white/grey body, very prominent hump, long face, large body
8. KANKREJ: Silver-grey with black points, lyre-shaped horns, large hump
9. DEONI: White/grey with black markings on head/neck/legs
10. RATHI: Brownish-white, medium build, adapted to arid regions

Exotic/Crossbreeds:
11. HOLSTEIN FRIESIAN (HF): Distinct black and white patches, large size, no hump, high milk production
12. JERSEY: Light brown/fawn color, small compact body, dished face, no hump, small size

IMPORTANT: Base your identification ONLY on features you can CLEARLY SEE in this image. Don't make assumptions.

Provide response in EXACT format:
BREED: [exact breed name from list above that BEST matches what you see]
CONFIDENCE: [0.0 to 1.0 - be conservative, only 0.8+ if features clearly match]
DESCRIPTION: I can see this animal has [describe exact features visible: horn type, hump size, coat color/pattern, ear type, body build, any distinctive marks]. These features indicate this is a [breed name] because [explain why these specific features match this breed].

**Physical Characteristics:**
- [List 4 specific physical features you observe in THIS image]

**Care Requirements:**
- [List 4 essential care tips for this specific breed]

Be EXTREMELY CAREFUL - identify based on what you ACTUALLY SEE, not what you think should be there.`
              },
              {
                inline_data: {
                  mime_type: 'image/jpeg',
                  data: base64Data
                }
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.4, // Lower temperature for more consistent output
          maxOutputTokens: 1024, // Increased to prevent truncation
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Gemini Vision API error:', errorData);
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('🔍 Gemini Vision raw response:', JSON.stringify(data, null, 2));
    
    if (!data.candidates || data.candidates.length === 0) {
      console.error('❌ No candidates in Vision API response');
      throw new Error('No response from Gemini Vision API');
    }

    // Safely parse response
    const candidate = data.candidates[0];
    if (!candidate || !candidate.content) {
      console.error('❌ Invalid Vision response structure:', candidate);
      throw new Error('Invalid response format from Gemini Vision API');
    }

    // Handle different response structures
    let aiResponse = '';
    if (candidate.content.parts && Array.isArray(candidate.content.parts)) {
      aiResponse = candidate.content.parts.map((part: any) => part.text || '').join('');
    } else if (candidate.content.text) {
      aiResponse = candidate.content.text;
    } else {
      console.error('❌ Unknown Vision content structure:', candidate.content);
      throw new Error('Cannot extract text from Gemini Vision response');
    }

    if (!aiResponse || aiResponse.trim() === '') {
      throw new Error('Empty response from Gemini Vision API');
    }
    
    console.log('📋 Gemini Vision response:', aiResponse);

    // Parse the response
    const breedMatch = aiResponse.match(/BREED:\s*([^\n]+)/i);
    const confidenceMatch = aiResponse.match(/CONFIDENCE:\s*([\d.]+)/i);
    
    // Extract full description (everything after DESCRIPTION: up to Physical Characteristics)
    const descriptionMatch = aiResponse.match(/DESCRIPTION:\s*([\s\S]*?)(?=\*\*Physical Characteristics|$)/i);
    
    // Extract characteristics section
    const characteristicsMatch = aiResponse.match(/\*\*Physical Characteristics:\*\*\s*([\s\S]*?)(?=\*\*Care Requirements|$)/i);
    
    // Extract care requirements section
    const careMatch = aiResponse.match(/\*\*Care Requirements:\*\*\s*([\s\S]*?)$/i);

    const breedName = breedMatch ? breedMatch[1].trim() : 'Unknown';
    const confidence = confidenceMatch ? parseFloat(confidenceMatch[1]) : 0.85;
    const description = descriptionMatch ? descriptionMatch[1].trim() : aiResponse;
    
    // Parse bullet points from characteristics
    const characteristics: string[] = [];
    if (characteristicsMatch) {
      const charText = characteristicsMatch[1];
      const charLines = charText.split('\n').filter(line => line.trim());
      charLines.forEach(line => {
        const cleaned = line.trim().replace(/^[-*•]\s*/, '').replace(/^\d+\.\s*/, '');
        if (cleaned && cleaned.length > 5) {
          characteristics.push(cleaned);
        }
      });
    }
    
    // Parse bullet points from care requirements
    const careTips: string[] = [];
    if (careMatch) {
      const careText = careMatch[1];
      const careLines = careText.split('\n').filter(line => line.trim());
      careLines.forEach(line => {
        const cleaned = line.trim().replace(/^[-*•]\s*/, '').replace(/^\d+\.\s*/, '');
        if (cleaned && cleaned.length > 5) {
          careTips.push(cleaned);
        }
      });
    }

    console.log('✅ Detected breed:', breedName, `(${(confidence * 100).toFixed(1)}%)`);
    console.log('📊 Extracted characteristics:', characteristics.length);
    console.log('💡 Extracted care tips:', careTips.length);

    return {
      breedName,
      confidence: Math.min(Math.max(confidence, 0), 1),
      description,
      characteristics,
      careTips
    };
  } catch (error: any) {
    console.error('❌ Error detecting breed from image:', error);
    throw new Error('Failed to detect breed: ' + error.message);
  }
};

// Export all functions
export default {
  sendMessageToGemini,
  getBreedInfo,
  getCareAdvice,
  translateText,
  detectBreedFromImage,
};
