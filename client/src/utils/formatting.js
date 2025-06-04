/*
 * Filename: formatting.js
 * Author: Elijah Claggett
 *
 * Description:
 * This JavaScript file contains helper functions for formatting different values
 */

// Helper function to format monetary values
function formatMoney(val) {
  return Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(val);
}

// Helper function to format time values
function msToTime(duration, allowNegative = false) {
  if (duration == null) return "";

  const isNegative = allowNegative && duration < 0;
  duration = Math.abs(duration);

  let seconds = parseInt((duration / 1000) % 60);
  let minutes = parseInt(duration / 1000 / 60);

  const prefix = isNegative ? "-" : "";

  minutes = minutes < 10 ? "0" + minutes : minutes;
  seconds = seconds < 10 ? "0" + seconds : seconds;

  return `${prefix}${minutes}:${seconds}`;
}


export { formatMoney, msToTime };
