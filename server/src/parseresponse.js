/*
 * Filename: parseresponse.js
 * Author: Faria Huq
 *
 * Description:
 * This file contains helper functions to parse JSON response from GPT.
 */

// Function to randomize an array in place

export function parseAIResponse(response) {
  try {
    // Remove potential formatting like triple backticks and "json" prefix
    response = response.trim().replace(/^```json\n?|```$/g, "").replace(/^json\s*/, "");
    const parsedData = JSON.parse(response);
    const normalizedData = {};
    for (const key in parsedData) {
        normalizedData[key.toLowerCase()] = parsedData[key];
    }
    
    return {
        Rate: normalizedData.rate || {},
        SuggestionReasoning: normalizedData.suggestionreasoning || "No reasoning provided.",
        Suggestion: normalizedData.suggestion || response,
    };
  } catch (error) {
    console.error("Failed to parse AI response:", error);
    return {
      Rate: {},
      SuggestionReasoning: "No reasoning provided.",
      Suggestion: response,
    };
  }
}
