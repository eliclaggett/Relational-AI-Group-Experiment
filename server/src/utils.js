/*
 * Filename: utils.js
 * Author: Elijah Claggett
 *
 * Description:
 * This file contains helper functions for backend operation
 */

// Function to randomize an array in place
function shuffle(array) {
  let currentIndex = array.length;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {
    // Pick a remaining element...
    let randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }
}

// Calculate the entropy of a list of probabilities
function entropy(probabilities, base = 2) {
  return -probabilities.reduce((sum, p) => p > 0 ? sum + p * Math.log(p) / Math.log(base) : sum, 0);
}

// Calculate the entropy of a list of data points
function calculateEntropyFromData(data, base = 2) {
  const total = data.length;
  const counts = data.reduce((acc, num) => {
    acc[num] = (acc[num] || 0) + 1;
    return acc;
  }, {});

  const probabilities = Object.values(counts).map((count) => count / total);
  return entropy(probabilities, base);
}

export { shuffle, entropy, calculateEntropyFromData };