import { useRef } from "react";
import logo from "./logo.svg";
import "./App.css";
import axios from "axios";

function App() {
  const nameRef = useRef<HTMLInputElement>(null);
  const newTenant = (name: string) => {
    axios
      .post(`${process.env.REACT_APP_BASE_URL}/api/onboard`, { name })
      .then((data) => alert(JSON.stringify(data)))
      .catch((e) => console.log(e));
  };

  const getTenant = () => {
    axios
      .get(`${process.env.REACT_APP_BASE_URL}/api/tenant/all`)
      .then((data) => alert(JSON.stringify(data)))
      .catch((e) => console.log(e));
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>Hello Vite + React!</p>
        <p>
          <button type="button" onClick={getTenant}>
            get tenant
          </button>
        </p>
        <br />
        <input
          type="text"
          name="name"
          id="name"
          placeholder="company name"
          ref={nameRef}
        />
        <button
          type="button"
          onClick={async () => newTenant(nameRef.current!.value)}
        >
          Add tenant
        </button>
      </header>
    </div>
  );
}

export default App;
