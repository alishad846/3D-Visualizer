import { useState, useEffect } from 'react';

export default function useVoiceAssistant() {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    setData(true);
  }, []);

  return data;
}