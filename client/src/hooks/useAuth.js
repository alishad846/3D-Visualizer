import { useState, useEffect } from 'react';

export default function useAuth() {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    setData(true);
  }, []);

  return data;
}