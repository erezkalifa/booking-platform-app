import { Routes, Route } from "react-router-dom";
import { Navbar } from "./cmps/Navbar";
import { PropertyIndex } from "./pages/PropertyIndex";
import { PropertyDetails } from "./pages/PropertyDetails";
import { PropertyEdit } from "./pages/PropertyEdit";
import { WishlistPage } from "./pages/WishlistPage";
import { NotFound } from "./pages/NotFound";
import { UserMsg } from "./cmps/UserMsg";

export function App() {
  return (
    <div className="app">
      <Navbar />
      <main className="main-layout">
        <Routes>
          <Route path="/" element={<PropertyIndex />} />
          <Route path="/property" element={<PropertyIndex />} />
          <Route path="/property/:id" element={<PropertyDetails />} />
          <Route path="/property/edit/:id?" element={<PropertyEdit />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <UserMsg />
    </div>
  );
}
