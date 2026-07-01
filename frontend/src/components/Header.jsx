
import { useState, useEffect } from "react";
import { Search, Menu, User } from "lucide-react";
import SideBar from "./SideBar";
import { useNavigate, useLocation } from "react-router-dom";

const categories = [
  { label: "Technology", value: "technology" },
  { label: "General", value: "general" },
  { label: "Gaming", value: "gaming" },
  { label: "Health", value: "health" },
  { label: "Business", value: "business" },
  { label: "Sports", value: "sports" },
  { label: "Entertainment", value: "entertainment" },
];

const Header = () => {
  const [open, setOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [notify, setNotify] = useState("");
  const [user, setUser] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;

  const urlCategory = pathname.startsWith("/category/")
    ? pathname.split("/")[2]
    : null;

  const showMsg = (msg) => {
    setNotify(msg);
    setTimeout(() => setNotify(""), 3000);
  };

  const payForSearch = async () => {
    try {
      // NOTE: Calling Razorpay orders API from frontend might cause CORS issues in production. 
      // This is a known limitation of having no backend.
      const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID;
      const keySecret = import.meta.env.VITE_RAZORPAY_KEY_SECRET;
      
      const response = await fetch("https://api.razorpay.com/v1/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Basic " + btoa(keyId + ":" + keySecret)
        },
        body: JSON.stringify({ amount: 9900, currency: "INR", receipt: "receipt_" + Date.now() }),
      });

      const order = await response.json();

      const options = {
        key: keyId,
        amount: order.amount,
        currency: "INR",
        name: "NextNews Premium Search",
        description: "Unlock search functionality",
        order_id: order.id,

        handler: async function (response) {
          // Verify payment directly (dummy since no backend)
          if (response.razorpay_payment_id) {
            localStorage.setItem("searchPaid", "true");
            showMsg("Payment successful! Search unlocked.");
            setShowSearch(true);
          } else {
            showMsg("Payment verification failed!");
          }
        },

        theme: { color: "#4f46e5" },
      };

      const razorPay = new window.Razorpay(options);
      razorPay.open();
    } catch (error) {
      console.error("Payment Error", error);
      showMsg("Something went wrong!");
    }
  };

  const goHomeSmooth = () => {
    if (pathname === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      navigate("/");
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 250);
    }
  };

  const goHome = () => {
    setSelectedCategory(null);
    navigate("/");
    setOpen(false);
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 250);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    showMsg("Logged out successfully");
    navigate("/login");
  };

  const search = () => {
    const paid = localStorage.getItem("searchPaid");

    // if user hasn’t paid, open payment popup
    if (!paid) {
      payForSearch();
      return;
    }

    if (showSearch) {
      runSearch();
    } else {
      setShowSearch(true);
    }
  };

  const runSearch = () => {
    const paid = localStorage.getItem("searchPaid");

    if (!paid) {
      payForSearch();
      return;
    }

    if (!searchValue.trim()) return;

    navigate(`/search?query=${encodeURIComponent(searchValue.trim())}`);

    setShowSearch(false);
    setSearchValue("");
  };

  const categorySelect = (value) => {
    setSelectedCategory(value);
    navigate(`/category/${value}`);
    setOpen(false);
  };

  const activeCategory = categories.find((c) => c.value === selectedCategory);

  const reorderedCategories = activeCategory
    ? [
        activeCategory,
        { label: "Home", value: "__home" },
        ...categories.filter((c) => c.value !== selectedCategory),
      ]
    : categories;

  useEffect(() => {
    if (urlCategory) {
      setSelectedCategory(urlCategory);
    } else if (pathname === "/saved") {
      setSelectedCategory("saved");
    } else {
      setSelectedCategory(null);
    }
  }, [urlCategory, pathname]);

  useEffect(() => {
    localStorage.removeItem("searchPaid");
    
    const checkAuth = () => {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };

    checkAuth();
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, []);

  return (
    <>
      {notify && (
        <div
          className="
          fixed inset-0 flex items-center justify-center
          z-[999]
        +  backdrop-blur-sm bg-black/30
        "
        >
          <div
            className="
              w-64 h-24 bg-green-500 text-white 
              flex items-center justify-center text-center
              rounded-xl shadow-2xl animate-fade-in
            "
          >
            {notify}
          </div>
        </div>
      )}

      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-md">
        <div className="flex items-center justify-between px-4 sm:px-6 md:px-12 lg:px-20 py-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <h1
              onClick={goHomeSmooth}
              className={`cursor-pointer transition-colors ${
                pathname.startsWith("/community") || pathname.startsWith("/post") || pathname === "/write"
                  ? "text-gray-400 hover:text-gray-600 text-sm sm:text-base font-medium" 
                  : "text-gray-800 hover:text-black text-lg sm:text-xl md:text-xl font-bold"
              }`}
            >
              NextNews
            </h1>
            {/* <span className="text-gray-300 text-lg sm:text-xl font-light">/</span> */}
            <span 
              onClick={() => navigate("/community")}
              className={`cursor-pointer transition-colors ${
                pathname.startsWith("/community") || pathname.startsWith("/post") || pathname === "/write"
                  ? "text-gray-800 hover:text-black text-lg sm:text-xl md:text-xl font-bold" 
                  : "text-gray-400 hover:text-gray-600 text-sm sm:text-base font-medium hidden sm:block"
              }`}
            >
              Community
            </span>
          </div>

          <div className="flex items-center gap-6 relative">
            {showSearch && (
              <input
                type="text"
                placeholder="Search..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && runSearch()}
                className={`absolute right-12 px-2 py-1 border rounded-lg outline-none bg-gray-200/30 focus:bg-gray-200/70 hover:bg-gray-200/70 placeholder:text-gray-400/70 transition-all duration-300 ease-in-out
                  ${
                    showSearch
                      ? "opacity-100 scale-100 w-40 sm:w-52 md:w-60 lg:w-72"
                      : "opacity-0 scale-90 w-0 pointer-events-none"
                  }
                `}
              />
            )}

            {user?.profileImage ? (
              <img
                src={user.profileImage}
                alt={user.name}
                onClick={() => navigate("/profile")}
                className="w-6 h-6 rounded-full object-cover cursor-pointer border border-gray-200"
                title={`Logged in as ${user.name}`}
              />
            ) : (
              <User
                onClick={() => user ? navigate("/profile") : navigate("/login")}
                className="text-gray-700 hover:text-black cursor-pointer"
                size={18}
                title={user ? `Logged in as ${user.name}` : "Login"}
              />
            )}

            <Search
              onClick={search}
              className="text-gray-700 hover:text-black cursor-pointer"
              size={18}
            />

            <button
              onClick={() => setOpen(true)}
              aria-label="Open Menu"
              className="p-2 rounded hover:bg-gray-100 cursor-pointer"
            >
              <Menu size={20} className="text-gray-700 hover:text-black" />
            </button>
          </div>
        </div>
      </header>

      <SideBar
        open={open}
        onClose={() => setOpen(false)}
        categories={reorderedCategories}
        selectedCategory={selectedCategory}
        onSelectCategory={categorySelect}
        goHome={goHome}
        user={user}
        onLogout={handleLogout}
      />
    </>
  );
};

export default Header;
