import { Routes, Route } from "react-router-dom";
import { GameRoot } from "./ui/GameRoot";

export default function App() {
  return (
    <Routes>
      <Route path="*" element={<GameRoot />} />
    </Routes>
  );
}
