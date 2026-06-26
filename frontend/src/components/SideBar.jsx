import { X, Bookmark, LogOut } from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const SideBar = ({
  open,
  onClose,
  categories,
  selectedCategory,
  onSelectCategory,
  goHome,
  user,
  onLogout,
}) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [open]);
  return (
    <>
      {open && <div onClick={onClose} className="fixed inset-0 z-40" />}

      <div
        onClick={(e) => e.stopPropagation()}
        className={`
          fixed top-0 right-0 h-full w-72 bg-white/90 backdrop-blur-md shadow-lg
          transform transition-all duration-300 z-50
          ${open ? "translate-x-0" : "translate-x-full"}
        `}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b">
          <h2 className="text-lg font-semibold">Categories</h2>
          <button
            onClick={onClose}
            aria-label="Close Menu"
            className="p-1 rounded hover:bg-gray-100 cursor-pointer hover:text-black"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="px-4 py-6">
          <ul className="flex flex-col gap-3">
            {categories.map((cat) => (
              <li
                key={cat.value}
                onClick={() => {
                  if (cat.value === "__home") {
                    goHome();
                  } else {
                    onSelectCategory(cat.value);
                  }
                }}
                className={`cursor-pointer px-3 py-2 rounded hover:bg-gray-100 ${
                  cat.value === selectedCategory
                    ? "font-bold text-black underline"
                    : "text-gray-700"
                }`}
              >
                {cat.label}
              </li>
            ))}

            <div className="h-px bg-gray-200 my-2" />

            <li
              onClick={() => {
                navigate("/saved");
                onClose();
              }}
              className={`cursor-pointer px-3 py-2 rounded hover:bg-gray-100 flex items-center gap-2 ${
                selectedCategory === "saved"
                  ? "font-bold text-black underline"
                  : "text-gray-700"
              }`}
            >
              <Bookmark size={18} />
              Saved Articles
            </li>

            {user && (
              <>
                <div className="h-px bg-gray-200 my-2" />
                <li
                  onClick={() => {
                    onLogout();
                    onClose();
                  }}
                  className="cursor-pointer px-3 py-2 rounded hover:bg-red-50 hover:text-red-600 flex items-center gap-2 text-gray-700 transition-colors"
                >
                  <LogOut size={18} />
                  Logout
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </>
  );
};

export default SideBar;
