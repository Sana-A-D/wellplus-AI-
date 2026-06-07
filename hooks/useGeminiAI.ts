import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface GeminiResponse {
  text: string;
  suggestions?: string[];
}

export const useGeminiAI = () => {
  const [isLoading, setIsLoading] = useState(false);

  const getApiKey = async (): Promise<string> => {
    // 1. Try env variable first
    if (process.env.EXPO_PUBLIC_GEMINI_API_KEY) {
      return process.env.EXPO_PUBLIC_GEMINI_API_KEY;
    }
    
    // 2. Try AsyncStorage settings
    try {
      const storedSettings = await AsyncStorage.getItem('@wellplus_user_settings');
      if (storedSettings) {
        const parsed = JSON.parse(storedSettings);
        if (parsed.geminiApiKey) {
          return parsed.geminiApiKey;
        }
      }
    } catch (e) {
      console.error('Error reading API key from storage:', e);
    }
    
    return '';
  };

  const generateResponse = async (prompt: string, context?: any): Promise<GeminiResponse> => {
    setIsLoading(true);
    const apiKey = await getApiKey();
    
    if (!apiKey) {
      setIsLoading(false);
      return {
        text: "Please set your Gemini API key in the Profile settings to start using actual AI features. In the meantime, I can only provide this simulated message.",
        suggestions: ["How to set API key?", "Try again"]
      };
    }
    
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `${prompt}\n\nPlease reply in JSON format with two keys: "text" (the reply message, DO NOT use markdown formatting, use plain text only) and "suggestions" (a list of 3-4 short follow-up prompts the user might want to ask).`
                  }
                ]
              }
            ],
            generationConfig: {
              responseMimeType: 'application/json',
              responseSchema: {
                type: 'OBJECT',
                properties: {
                  text: { type: 'STRING' },
                  suggestions: {
                    type: 'ARRAY',
                    items: { type: 'STRING' }
                  }
                },
                required: ['text', 'suggestions']
              }
            }
          })
        }
      );
      
      const data = await response.json();
      if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
        let jsonText = data.candidates[0].content.parts[0].text;
        jsonText = jsonText.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(jsonText);
        return {
          text: parsed.text || "Here is what I found...",
          suggestions: parsed.suggestions || []
        };
      } else {
        throw new Error(data.error?.message || 'Invalid response from Gemini');
      }
    } catch (error: any) {
      console.error('Gemini AI Error:', error);
      return {
        text: `Error connecting to Gemini API: ${error.message || error}. Please verify your API Key and internet connection.`,
        suggestions: ["Retry", "Go to Settings"]
      };
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeImage = async (imageUri: string, mealName?: string): Promise<{ calories: number; analysis: string; isFood: boolean }> => {
    setIsLoading(true);
    const apiKey = await getApiKey();
    
    if (!apiKey) {
      setIsLoading(false);
      return {
        isFood: true,
        calories: 350,
        analysis: "Please set your Gemini API key in Profile settings to enable real AI image analysis. Showing estimated mock calories."
      };
    }
    
    try {
      // 1. Read the image as base64
      const responseFile = await fetch(imageUri);
      const blob = await responseFile.blob();
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          const base64 = result.split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      // 2. Call Gemini Vision API
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
      const promptText = `Analyze this image of a meal. If it is NOT an image of food (for example, if it is a person, a selfie, a car, or any random non-food object), set 'isFood' to false, and set 'analysis' to a polite message saying that the image does not seem to contain food and therefore cannot be analyzed. If it IS food, set 'isFood' to true, estimate the calories, and provide a short nutrition analysis. If the user provided a meal name: '${mealName || ""}', take that into consideration.`;

      const response = await fetch(geminiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: promptText
                },
                {
                  inlineData: {
                    mimeType: 'image/jpeg',
                    data: base64Data
                  }
                }
              ]
            }
          ],
          generationConfig: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: 'OBJECT',
              properties: {
                isFood: { type: 'BOOLEAN' },
                calories: { type: 'INTEGER' },
                analysis: { type: 'STRING' }
              },
              required: ['isFood', 'calories', 'analysis']
            }
          }
        })
      });

      const data = await response.json();
      if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
        const jsonText = data.candidates[0].content.parts[0].text;
        const parsed = JSON.parse(jsonText);
        return {
          isFood: parsed.isFood !== false,
          calories: parsed.calories || 0,
          analysis: parsed.analysis || "No analysis provided."
        };
      } else {
        throw new Error(data.error?.message || 'Invalid response from Gemini');
      }
    } catch (error: any) {
      console.error('Image analysis error:', error);
      return {
        isFood: true,
        calories: 300,
        analysis: `Error analyzing image with Gemini: ${error.message || error}. Please check your API Key.`
      };
    } finally {
      setIsLoading(false);
    }
  };

  const generateMealPlan = async (period: string): Promise<{ planName: string; meals: Array<{ name: string; time: string; calories: number }> }> => {
    setIsLoading(true);
    const apiKey = await getApiKey();
    
    if (!apiKey) {
      setIsLoading(false);
      return {
        planName: 'Healthy Daily Plan (Mock)',
        meals: [
          { name: 'Greek Yogurt with Berries (Mock)', time: '08:00', calories: 280 },
          { name: 'Quinoa Mediterranean Bowl (Mock)', time: '12:30', calories: 450 },
          { name: 'Grilled Salmon with Vegetables (Mock)', time: '18:00', calories: 520 },
          { name: 'Mixed Nuts Snack (Mock)', time: '20:30', calories: 150 },
        ]
      };
    }
    
    try {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
      const promptText = `Create a healthy meal plan for a ${period} period. Return a beautiful plan name and a list of planned meals. Each meal must have a name, time in HH:MM format, and estimated calories. Return the response in JSON format.`;

      const response = await fetch(geminiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: promptText
                }
              ]
            }
          ],
          generationConfig: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: 'OBJECT',
              properties: {
                planName: { type: 'STRING' },
                meals: {
                  type: 'ARRAY',
                  items: {
                    type: 'OBJECT',
                    properties: {
                      name: { type: 'STRING' },
                      time: { type: 'STRING' },
                      calories: { type: 'INTEGER' }
                    },
                    required: ['name', 'time', 'calories']
                  }
                }
              },
              required: ['planName', 'meals']
            }
          }
        })
      });

      const data = await response.json();
      if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
        const jsonText = data.candidates[0].content.parts[0].text;
        const parsed = JSON.parse(jsonText);
        return {
          planName: parsed.planName || 'Healthy Meal Plan',
          meals: parsed.meals || []
        };
      } else {
        throw new Error(data.error?.message || 'Invalid response from Gemini');
      }
    } catch (error: any) {
      console.error('Error generating meal plan:', error);
      return {
        planName: 'Error Generating Meal Plan',
        meals: [
          { name: `Failed to connect: ${error.message || error}`, time: '08:00', calories: 0 }
        ]
      };
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeMealLog = async (mealName: string, notes?: string): Promise<{ isHealthy: boolean; rating: 'good' | 'neutral' | 'bad'; estimatedCalories: number }> => {
    setIsLoading(true);
    const apiKey = await getApiKey();
    
    if (!apiKey) {
      setIsLoading(false);
      const nameLower = mealName.toLowerCase();
      const notesLower = (notes || '').toLowerCase();
      const isJunk = nameLower.includes('cookie') || nameLower.includes('cake') || nameLower.includes('burger') || nameLower.includes('pizza') || nameLower.includes('fries') || nameLower.includes('candy') || nameLower.includes('ice cream');
      const isBadEmotion = notesLower.includes('bad') || notesLower.includes('sad') || notesLower.includes('guilt') || notesLower.includes('sick');
      
      return {
        isHealthy: !isJunk,
        rating: isBadEmotion ? 'bad' : (isJunk ? 'neutral' : 'good'),
        estimatedCalories: isJunk ? 400 : 250
      };
    }

    try {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
      const promptText = `Analyze this meal log. Meal name: "${mealName}". Notes: "${notes || 'none'}".\nPlease determine:\n1. 'isHealthy': true if the meal is generally considered healthy, false if it is junk food or unhealthy.\n2. 'rating': Evaluate the user's sentiment from the notes (e.g., 'felt bad' -> 'bad', 'felt great' -> 'good'). If no sentiment is expressed, base the rating on the meal's healthiness ('good' for healthy, 'neutral' or 'bad' for unhealthy). Must be exactly one of: "good", "neutral", "bad".\n3. 'estimatedCalories': Provide a rough integer estimate of the calories.\nReturn only valid JSON.`;

      const response = await fetch(geminiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptText }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: 'OBJECT',
              properties: {
                isHealthy: { type: 'BOOLEAN' },
                rating: { type: 'STRING', enum: ['good', 'neutral', 'bad'] },
                estimatedCalories: { type: 'INTEGER' }
              },
              required: ['isHealthy', 'rating', 'estimatedCalories']
            }
          }
        })
      });

      const data = await response.json();
      if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
        const jsonText = data.candidates[0].content.parts[0].text;
        const parsed = JSON.parse(jsonText);
        return {
          isHealthy: parsed.isHealthy,
          rating: parsed.rating || 'good',
          estimatedCalories: parsed.estimatedCalories || 300
        };
      } else {
        throw new Error('Invalid response');
      }
    } catch (error: any) {
      console.error('Error analyzing meal log:', error);
      return { isHealthy: true, rating: 'good', estimatedCalories: 300 };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    generateResponse,
    analyzeImage,
    generateMealPlan,
    analyzeMealLog,
    isLoading
  };
};