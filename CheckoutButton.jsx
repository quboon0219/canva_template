import React from "react";
import axios from "axios";

export default function CheckoutButton({ items }) {
  async function startCheckout() {
    try {
      const token = localStorage.getItem('token');
      const line_items = items.map(it => ({ price_data: { currency: 'usd', product_data: { name: it.title }, unit_amount: Math.round(it.price*100) }, quantity: 1 }));
      const resp = await axios.post('http://localhost:4242/api/stripe/create-checkout', {
        line_items,
        success_url: window.location.origin + '/success',
        cancel_url: window.location.origin + '/cancel'
      }, { headers: { Authorization: `Bearer ${token}` } });
      window.location.href = resp.data.url;
    } catch (e) {
      console.error(e);
      alert('Checkout failed: ' + (e.response?.data?.error || e.message));
    }
  }

  return <button onClick={startCheckout} className="w-full bg-green-600 text-white py-2 rounded">Checkout</button>;
}
