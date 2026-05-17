import { useState, useEffect } from 'react';

export default function useDeviceType() {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    setData(true);
  }, []);

  return data;
}