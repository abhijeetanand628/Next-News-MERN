import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Category from "./pages/category/[slug]/Category";
import Search from "./pages/search/Search";
import Saved from "./pages/saved/Saved";
import Article from "./pages/article/[id]/Article";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import EditProfile from "./pages/auth/EditProfile";
import Community from "./pages/community/Community";
import CommunityPost from "./pages/community/CommunityPost";
import WritePost from "./pages/community/WritePost";

export default function App() {
  const ProtectedRoute = ({ children }) => {
    const user = localStorage.getItem("user");
    if (!user) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/category/:slug" element={<Category />} />
            <Route path="/community" element={
              <ProtectedRoute>
                <Community />
              </ProtectedRoute>
            } />
            <Route path="/post/:id" element={
              <ProtectedRoute>
                <CommunityPost />
              </ProtectedRoute>
            } />
            <Route path="/write" element={
              <ProtectedRoute>
                <WritePost />
              </ProtectedRoute>
            } />
            <Route path="/search" element={<Search />} />
            <Route path="/saved" element={<Saved />} />
            <Route path="/article/:id" element={<Article />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/profile" element={
              <ProtectedRoute>
                <EditProfile />
              </ProtectedRoute>
            } />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}
