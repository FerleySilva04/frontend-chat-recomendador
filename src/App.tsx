import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "@/layout/MainLayout";
import Chatbot from "@/pages/Chatbot";
import Models from "@/pages/Models";
import Conversations from "@/pages/Conversations";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Chatbot />} />
          <Route path="/models" element={<Models />} />
          <Route path="/conversations" element={<Conversations />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
