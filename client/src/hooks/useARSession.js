import { useState, useEffect } from 'react';

export default function useARSession() {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    setData(true);
  }, []);

  return data;
}