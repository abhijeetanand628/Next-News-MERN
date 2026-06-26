import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Category from "./pages/category/[slug]/Category";
import Search from "./pages/search/Search";
import Saved from "./pages/saved/Saved";
import Article from "./pages/article/[id]/Article";

export default function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/category/:slug" element={<Category />} />
            <Route path="/search" element={<Search />} />
            <Route path="/saved" element={<Saved />} />
            <Route path="/article/:id" element={<Article />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}
