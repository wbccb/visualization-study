import "./App.css";
import Rect from "./view/Rect";
import Circle from "./view/Circle";

function App() {
  const width = 1000;
  const height = 1000;

  return (
    <div className="app-wrapper">
      {/*  LogicFlow写法*/}
      <div className="logic-flow-container">
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
          <Rect x={100} y={50} width={50} height={50}></Rect>
          <Circle x={300} y={300} width={100} height={100} r={50}></Circle>
        </svg>
      </div>

      {/*  正常的写法，非LogicFlow写法*/}
      <div className="app-content-container">
        <svg></svg>
      </div>
    </div>
  );
}

export default App;
