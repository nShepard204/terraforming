import "./App.css";
import axios from "axios";
import { useState } from "react";

const distanceSelectors = [10, 50, 100, 150, 200, 250, 300];

function App() {
  const [data, setData] = useState("bleh");
  const [userAddress, setUserAddress] = useState("");
  const [userDistance, setUserDistance] = useState(0);

  function handleFetchVenues(addr: string, dist: number) {
    const requestUrl = `${import.meta.env.VITE_BACKEND_URL}/venues`;

    axios
      .get(requestUrl, {
        params: {
          address: addr,
          distance: dist,
        },
      })
      .then((data) => {
        //this console.log will be in our frontend console
        setData(JSON.stringify(data.data));
      });
  }

  return (
    <>
      <label id="user-address">Address: </label>
      <input
        id="user-address"
        type="text"
        value={userAddress}
        onChange={(e) => setUserAddress(e.target.value)}
      />
      <br />
      <label id="user-distance">Select Distance: </label>
      <select
        value={userDistance}
        onChange={(e) => setUserDistance(parseInt(e.target.value))}
      >
        {distanceSelectors.map((distance) => (
          <option value={distance}>{distance}</option>
        ))}
      </select>
      <button onClick={() => handleFetchVenues(userAddress, userDistance)}>
        Click Me!
      </button>
      <br />
      {data}
    </>
  );
}

export default App;
