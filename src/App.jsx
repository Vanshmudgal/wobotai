import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";
import Hello from "./components/Hello";

function App() {
  const [cameras, setCameras] = useState([]);
  const [loading, setLoading] = useState(true);

  return (
    <>
     
      <Hello/>
    </>
  );
}

export default App;
