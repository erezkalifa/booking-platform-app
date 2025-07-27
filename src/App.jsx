import { Routes, Route } from "react-router-dom";
import { PropertyIndex } from "./pages/PropertyIndex";
import { PropertyDetails } from "./pages/PropertyDetails";
import { PropertyEdit } from "./pages/PropertyEdit";
import { NotFound } from "./pages/NotFound";
import { Navbar } from "./cmps/Navbar";
import { UserMsg } from "./cmps/UserMsg";

export function App() {
  return (
    <div className="app">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<PropertyIndex />} />
          <Route path="/property" element={<PropertyIndex />} />
          <Route path="/property/:id" element={<PropertyDetails />} />
          <Route path="/property/edit/:id?" element={<PropertyEdit />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <UserMsg />
    </div>
  );
}
