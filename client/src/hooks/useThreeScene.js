import { useState, useEffect } from 'react';

export default function useThreeScene() {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    setData(true);
  }, []);

  return data;
}