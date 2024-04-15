import "./App.css";
import Rect from "./components/Rect";
import Circle from "./components/Circle";

function App() {
  const width = 1000;
  const height = 1000;

  return (
    <div className="app-wrapper">
      <svg
        className="svg-wrapper"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        width={width}
        height={height}
        style={{
          width,
          height,
          outline: "1px solid #ddd",
        }}
      >
        <Rect x={10} y={10} width={100} height={100}></Rect>
        <Circle x={300} y={300} width={200} height={200} r={100}></Circle>
      </svg>
    </div>
  );
}

export default App;
