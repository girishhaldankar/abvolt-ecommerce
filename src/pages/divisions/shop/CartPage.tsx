import React from "react";
import {Header} from "../../../components/Header";
import {Footer} from "../../../components/Footer";

export default function CartPage() {
  // Placeholder cart items for now
  const cartItems = [
    { id: "1", name: "Product One", price: 299, quantity: 1 },
    { id: "2", name: "Product Two", price: 499, quantity: 2 },
  ];

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div className="min-h-screen flex flex-col text-[var(--page-text)] transition-colors duration-500">
      <Header />

      <main className="pt-32 max-w-5xl mx-auto px-4 sm:px-8 lg:px-16 mb-16">
        <h1 className="text-3xl font-bold mb-6">Your Cart</h1>

        {cartItems.length === 0 ? (
          <p>Your cart is empty.</p>
        ) : (
          <div className="space-y-4">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center border p-4 rounded"
              >
                <div>
                  <h2 className="font-semibold">{item.name}</h2>
                  <p>Quantity: {item.quantity}</p>
                </div>
                <p className="font-semibold">₹{item.price * item.quantity}</p>
              </div>
            ))}

            <div className="flex justify-between font-bold text-xl mt-4">
              <span>Total:</span>
              <span>₹{totalPrice}</span>
            </div>

            <button className="mt-6 w-full py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
              Proceed to Checkout
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
