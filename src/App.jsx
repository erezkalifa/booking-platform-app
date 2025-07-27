import { Routes, Route } from "react-router-dom";
import { PropertyIndex } from "./pages/PropertyIndex";
import { PropertyDetails } from "./pages/PropertyDetails";
import { PropertyEdit } from "./pages/PropertyEdit";
import { NotFound } from "./pages/NotFound";
import { ErrorDemo } from "./pages/ErrorDemo";
import { Navbar } from "./cmps/Navbar";
import { ErrorBoundary } from "./components/ErrorBoundary";

export function App() {
  return (
    <ErrorBoundary>
      <div className="app">
        <Navbar />
        <Routes>
          <Route path="/" element={<PropertyIndex />} />
          <Route path="/property/:id" element={<PropertyDetails />} />
          <Route path="/property/edit/:id?" element={<PropertyEdit />} />
          <Route path="/error-demo" element={<ErrorDemo />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </ErrorBoundary>
  );
}
