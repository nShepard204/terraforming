import "./App.css";
import axios from "axios";
import { useState } from "react";

function App() {
  const [data, setData] = useState("bleh");

  function handleFetchVenues() {
    const addr = "2299 Waters Edge Blvd, Columbus, OH 43209";
    const requestUrl = `${import.meta.env.VITE_BACKEND_URL}/venues`;

    axios
      .get(requestUrl, {
        params: {
          address: addr,
          distance: 175,
        },
      })
      .then((data) => {
        //this console.log will be in our frontend console
        setData(JSON.stringify(data.data));
      });
  }

  return (
    <>
      <button onClick={() => handleFetchVenues()}>Click Me!</button>
      <br />
      {data}
    </>
  );
}

export default App;
