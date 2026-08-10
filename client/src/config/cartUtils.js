const CART_KEY = "cart";

const readCart = () => {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
};

const writeCart = (cart) => {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  window.dispatchEvent(new Event("cartUpdated"));
};

export const getCart = () => readCart();

export const getCartCount = () =>
  readCart().reduce((sum, item) => sum + item.qty, 0);

export const isInCart = (productId) =>
  readCart().some((item) => item._id === productId);

export const addToCart = (product, qty = 1) => {
  const cart = readCart();
  const existing = cart.find((item) => item._id === product._id);

  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({
      _id: product._id,
      name: product.name,
      price: product.salePrice || product.price,
      image:
        product.images?.find((img) => img.isPrimary)?.url ||
        product.images?.[0]?.url ||
        null,
      qty,
    });
  }

  writeCart(cart);
  return cart;
};

export const removeFromCart = (productId) => {
  const cart = readCart().filter((item) => item._id !== productId);
  writeCart(cart);
  return cart;
};

export const clearCart = () => writeCart([]);