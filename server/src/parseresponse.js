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
        const parsedData = JSON.parse(response);
        return {
            Rate: parsedData.Rate || {}, // Default to empty object if missing
            SuggestionReasoning: parsedData.SuggestionReasoning || "No reasoning provided.",
            Suggestion: parsedData.Suggestion || "No suggestion available."
        };
    } catch (error) {
        console.error("Failed to parse AI response:", error);
        return { Rate: {}, SuggestionReasoning: "No reasoning provided.", Suggestion: "No suggestion available." };
    }
}