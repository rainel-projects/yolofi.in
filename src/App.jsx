import { useState } from "react";
import Splash from "./components/Splash";
import GetStarted from "./components/GetStarted";

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <>
      {showSplash ? (
        <Splash onFinish={() => setShowSplash(false)} />
      ) : (
        <MainScreen />
      )}
    </>
  );
}

function MainScreen() {
  return (
    <div style={{
      height: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      fontFamily: "Inter, sans-serif"
    }}>
      <GetStarted />
    </div>
  );
}
