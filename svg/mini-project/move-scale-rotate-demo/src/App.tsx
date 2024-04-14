import "./App.css";
import { Rect } from "./components/Rect.tsx";
import { RectProps } from "./types";

function App() {
  const initRectProps: RectProps = {
    width: 100,
    height: 100,
    x: 10,
    y: 10,
    stroke: "black",
    strokeWidth: 1,
    fill: "white",
  };

  return (
    <div className="app-wrapper">
      <svg xmlns="http://www.w3.org/2000/svg">
        <Rect {...initRectProps}></Rect>
      </svg>
    </div>
  );
}

export default App;
