import { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [status, setStatus] = useState('checking...');

  useEffect(() => {
    axios.get('http://localhost:5000/')
      .then((res) => {
        console.log(res.data);
        setStatus(JSON.stringify(res.data));
      })
      .catch((err) => {
        console.error('Backend connection failed:', err);
        setStatus('failed to connect');
      });
  }, []);

  return (
    <div>
      <h1>ELI5 Simplifier</h1>
      <p>Backend status: {status}</p>
    </div>
  );
}

export default App;