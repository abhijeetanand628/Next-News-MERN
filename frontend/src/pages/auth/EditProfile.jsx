import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Camera, Save, Lock, User } from "lucide-react";

export default function EditProfile() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // States
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("account");

  // Form States
  const [accountData, setAccountData] = useState({ name: "", email: "" });
  const [passwordData, setPasswordData] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  // Status States
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/login");
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
    setAccountData({ name: parsedUser.name || "", email: parsedUser.email || "" });
    setPreviewImage(parsedUser.profileImage || null);
  }, [navigate]);

  const showMsg = (msg, isError = false) => {
    if (isError) {
      setError(msg);
      setMessage("");
    } else {
      setMessage(msg);
      setError("");
    }
    setTimeout(() => {
      setMessage("");
      setError("");
    }, 4000);
  };

  const getAuthHeaders = () => {
    return {
      Authorization: `Bearer ${localStorage.getItem("token")}`
    };
  };

  const updateUserStorage = (updatedUser) => {
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setUser(updatedUser);
    window.dispatchEvent(new Event("storage"));
  };

  // --- Handlers ---

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleImageUpload = async () => {
    if (!selectedImage) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("profileImage", selectedImage);

      const response = await axios.patch("http://localhost:8000/api/v1/users/profile-image", formData, {
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "multipart/form-data"
        }
      });
      
      updateUserStorage(response.data.user);
      showMsg("Profile image updated successfully!");
      setSelectedImage(null);
    } catch (err) {
      showMsg(err.response?.data?.message || "Failed to upload image", true);
    } finally {
      setLoading(false);
    }
  };

  const handleAccountUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.patch("http://localhost:8000/api/v1/users/update-account", accountData, {
        headers: getAuthHeaders()
      });
      
      updateUserStorage(response.data.user);
      showMsg("Account details updated successfully!");
    } catch (err) {
      showMsg(err.response?.data?.message || "Failed to update account", true);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.patch("http://localhost:8000/api/v1/users/update-password", passwordData, {
        headers: getAuthHeaders()
      });
      
      showMsg("Password updated successfully!");
      setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      showMsg(err.response?.data?.message || "Failed to update password", true);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-[80vh] flex justify-center py-12 px-4 sm:px-6">
      <div className="w-full max-w-3xl flex flex-col md:flex-row gap-8">
        
        {/* Sidebar / Tabs */}
        <div className="w-full md:w-64 flex flex-col gap-2">
          <h2 className="text-2xl font-semibold mb-4 px-4 text-gray-900">Settings</h2>
          
          <button
            onClick={() => setActiveTab("account")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
              activeTab === "account" ? "bg-black text-white" : "hover:bg-gray-100 text-gray-600 hover:text-black"
            }`}
          >
            <User size={18} />
            <span className="font-medium">Account Details</span>
          </button>
          
          <button
            onClick={() => setActiveTab("password")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
              activeTab === "password" ? "bg-black text-white" : "hover:bg-gray-100 text-gray-600 hover:text-black"
            }`}
          >
            <Lock size={18} />
            <span className="font-medium">Security</span>
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 bg-white/70 backdrop-blur-md rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 p-6 md:p-10 animate-fade-in relative overflow-hidden">
          
          {/* Notifications */}
          {message && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-green-50 text-green-600 px-4 py-2 rounded-lg text-sm text-center shadow-sm w-[90%] transition-all animate-fade-in z-10">
              {message}
            </div>
          )}
          {error && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-50 text-red-500 px-4 py-2 rounded-lg text-sm text-center shadow-sm w-[90%] transition-all animate-fade-in z-10">
              {error}
            </div>
          )}

          {activeTab === "account" && (
            <div className="mt-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6 border-b pb-4">Public Profile</h3>
              
              {/* Profile Image Section */}
              <div className="flex flex-col sm:flex-row items-center gap-6 mb-10">
                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-100 shadow-sm bg-gray-50 flex items-center justify-center">
                    {previewImage ? (
                      <img src={previewImage} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User size={40} className="text-gray-300" />
                    )}
                  </div>
                  <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Camera size={24} className="text-white" />
                  </div>
                </div>
                
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  className="hidden"
                />
                
                <div>
                  <p className="text-sm text-gray-500 mb-3">Upload a new avatar. Larger images will be resized automatically.</p>
                  <button
                    onClick={handleImageUpload}
                    disabled={!selectedImage || loading}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading && selectedImage ? "Uploading..." : "Save Image"}
                  </button>
                </div>
              </div>

              {/* Account Details Form */}
              <form onSubmit={handleAccountUpdate} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="name">
                    Display Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={accountData.name}
                    onChange={(e) => setAccountData({...accountData, name: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200/50 outline-none bg-gray-50/50 focus:bg-white focus:border-gray-300 focus:ring-2 focus:ring-gray-100 transition-all duration-300"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={accountData.email}
                    onChange={(e) => setAccountData({...accountData, email: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200/50 outline-none bg-gray-50/50 focus:bg-white focus:border-gray-300 focus:ring-2 focus:ring-gray-100 transition-all duration-300"
                    required
                  />
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-all font-medium disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    <Save size={18} />
                    {loading && !selectedImage ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === "password" && (
            <div className="mt-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6 border-b pb-4">Change Password</h3>
              
              <form onSubmit={handlePasswordUpdate} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="oldPassword">
                    Current Password
                  </label>
                  <input
                    type="password"
                    id="oldPassword"
                    value={passwordData.oldPassword}
                    onChange={(e) => setPasswordData({...passwordData, oldPassword: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200/50 outline-none bg-gray-50/50 focus:bg-white focus:border-gray-300 focus:ring-2 focus:ring-gray-100 transition-all duration-300"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="newPassword">
                    New Password
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200/50 outline-none bg-gray-50/50 focus:bg-white focus:border-gray-300 focus:ring-2 focus:ring-gray-100 transition-all duration-300"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="confirmPassword">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200/50 outline-none bg-gray-50/50 focus:bg-white focus:border-gray-300 focus:ring-2 focus:ring-gray-100 transition-all duration-300"
                    required
                  />
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-all font-medium disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    <Save size={18} />
                    {loading ? "Updating..." : "Update Password"}
                  </button>
                </div>
              </form>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
}
