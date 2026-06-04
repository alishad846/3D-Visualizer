import { BASE_URL } from './config';

/**
 * Sends a conversational query to the AI assistant via the Node.js API gateway.
 * Node.js fetches and filters product data, then forwards a clean payload to Python.
 */
export const askProductAssistant = async ({
  productId,
  query,
  sessionId,
  language = 'en',
}) => {
  const res = await fetch(`${BASE_URL}/ai/assistant`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      productId,
      query,
      sessionId,
      language,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Assistant request failed');
  }

  return res.json();
};
