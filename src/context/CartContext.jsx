import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
 const [items, setItems] = useState(() => {
  const savedItems = localStorage.getItem("cartItems");
  return savedItems ? JSON.parse(savedItems) : [];
});
useEffect(() => {
  localStorage.setItem("cartItems", JSON.stringify(items));
}, [items]);

  function addItem(item) {
    setItems((prev) => {
      if (prev.find((i) => i.id === item.id)) return prev;
      return [...prev, item];
    });
  }

  function removeItem(id) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  function isInCart(id) {
    return items.some((i) => i.id === id);
  }

  function clearCart() {
    setItems([]);
  }

  const subtotal = items.reduce((sum, i) => sum + Number(i.price || 0), 0);

  const mrpTotal = items.reduce((sum, i) => sum + Number(i.mrp || 0), 0);
  const savings = mrpTotal - subtotal;

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        isInCart,
        clearCart,
        subtotal,
        mrpTotal,
        savings,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
