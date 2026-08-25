import "./App.css";
import axios from "axios";
import { useEffect, useState } from "react";

function App() {
  const [data, setData] = useState(null);

  useEffect(() => {
    axios.get(import.meta.env.VITE_BACKEND_URL).then((data) => {
      //this console.log will be in our frontend console
      setData(data.data);
    });
  }, []);

  return <>{data}</>;
}

export default App;
