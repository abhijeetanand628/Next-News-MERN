import { useNavigate, useLocation, Link } from "react-router-dom";
import { useCallback } from "react";

export default function Article() {
  const navigate = useNavigate();
  const location = useLocation();

  const articleState = location.state || {};
  const { title, description, content, image, source, published, url } = articleState;

  if (!title) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Article Not Found</h2>
        <Link to="/" className="text-blue-500 hover:underline">Return to Home</Link>
      </div>
    );
  }

  const originalSource = useCallback(async (articleUrl) => {
    const paid = sessionStorage.getItem("articlePaid");

    if (paid) {
      window.open(articleUrl, "_blank");
      return;
    }

    try {
      const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID;
      const keySecret = import.meta.env.VITE_RAZORPAY_KEY_SECRET;
      
      const response = await fetch("https://api.razorpay.com/v1/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Basic " + btoa(keyId + ":" + keySecret)
        },
        body: JSON.stringify({ amount: 29900, currency: "INR", receipt: "receipt_article_" + Date.now() }),
      });

      const order = await response.json();

      const options = {
        key: keyId,
        amount: order.amount,
        currency: "INR",
        name: "NextNews Premium Access",
        description: "Unlock full article source",
        order_id: order.id,

        handler: async function (response) {
          // Verify payment directly (dummy since no backend)
          if (response.razorpay_payment_id) {
            sessionStorage.setItem("articlePaid", "true");
            window.open(articleUrl, "_blank");
          } else {
            alert("Payment verification failed!");
          }
        },

        theme: { color: "#4f46e5" },
      };

      const razorPay = new window.Razorpay(options);
      razorPay.open();
    } catch (error) {
      console.error("Payment Error", error);
      alert("Something went wrong!");
    }
  }, []);

  return (
    <main className="px-4 sm:px-6 md:px-12 lg:px-20 py-8 max-w-3xl mx-auto">
      {image && (
        <img
          src={image}
          alt={title || ""}
          className="w-full h-72 object-cover rounded-xl shadow-md mb-6"
        />
      )}

      <h1 className="text-3xl font-bold mb-4">{title}</h1>

      <div className="text-sm text-gray-500 mb-6">
        {source && <span>{source} • </span>}
        {published && <span>{new Date(published).toLocaleString()}</span>}
      </div>

      <p className="text-lg text-gray-700 mb-4">{description}</p>

      <p className="text-base text-gray-600 whitespace-pre-line">{content}</p>

      <div className="flex justify-center gap-3 mt-10 w-full">
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg shadow-sm hover:bg-gray-200 hover:shadow transition-all font-medium cursor-pointer"
        >
          ← Back
        </button>

        <Link
          to="/"
          className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg shadow-sm hover:bg-blue-700 hover:shadow transition-all font-medium"
        >
          Home
        </Link>
      </div>

      {url && (
        <div className="mt-10 flex justify-center">
          <button
            onClick={() => originalSource(url)}
            className="px-6 py-3 bg-purple-600 cursor-pointer text-white rounded-xl shadow-md hover:bg-purple-700 hover:shadow-lg transition-all font-medium text-l"
          >
            Read Original Source →
          </button>
        </div>
      )}
    </main>
  );
}
