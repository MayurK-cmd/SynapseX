import { BrowserRouter, Router, Route, Routes } from "react-router-dom";
import Landing from "./Landing";


const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;