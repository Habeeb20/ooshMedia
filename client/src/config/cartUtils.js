

// const CART_KEY = "cart";

// const readCart = () => {
//   try {
//     return JSON.parse(localStorage.getItem(CART_KEY)) || [];
//   } catch {
//     return [];
//   }
// };

// const writeCart = (cart) => {
//   localStorage.setItem(CART_KEY, JSON.stringify(cart));
//   window.dispatchEvent(new Event("cartUpdated"));
// };

// export const getCart = () => readCart();

// export const getCartCount = () =>
//   readCart().reduce((sum, item) => sum + item.qty, 0);

// export const isInCart = (productId) =>
//   readCart().some((item) => item._id === productId);

// export const getCartQty = (productId) => {
//   const item = readCart().find((i) => i._id === productId);
//   return item ? item.qty : 0;
// };

// export const addToCart = (product, qty = 1) => {
//   const cart = readCart();
//   const existing = cart.find((item) => item._id === product._id);

//   if (existing) {
//     existing.qty += qty;
//   } else {
//     cart.push({
//       _id: product._id,
//       name: product.name,
//       price: product.salePrice || product.price,
//       image:
//         product.images?.find((img) => img.isPrimary)?.url ||
//         product.images?.[0]?.url ||
//         null,
//       sellerId: product.seller?._id || product.seller,
//       qty,
//     });
//   }

//   writeCart(cart);
//   return cart;
// };

// // Bump qty by 1, adding the item if it isn't in the cart yet
// export const incrementCartItem = (product) => addToCart(product, 1);

// // Drop qty by 1; removes the line entirely once it hits 0
// export const decrementCartItem = (productId) => {
//   const cart = readCart();
//   const existing = cart.find((item) => item._id === productId);
//   if (!existing) return cart;

//   existing.qty -= 1;
//   const next = existing.qty > 0 ? cart : cart.filter((i) => i._id !== productId);

//   writeCart(next);
//   return next;
// };

// export const removeFromCart = (productId) => {
//   const cart = readCart().filter((item) => item._id !== productId);
//   writeCart(cart);
//   return cart;
// };

// export const clearCart = () => writeCart([]);














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

// composite key so a base product and each of its varieties are separate cart lines
export const makeCartKey = (productId, varietyName) =>
  varietyName ? `${productId}::${varietyName}` : `${productId}`;

export const getCart = () => readCart();

export const getCartCount = () =>
  readCart().reduce((sum, item) => sum + item.qty, 0);

export const getCartTotal = () =>
  readCart().reduce((sum, item) => sum + item.price * item.qty, 0);

export const getCartQty = (productId, varietyName = null) => {
  const key = makeCartKey(productId, varietyName);
  const item = readCart().find((i) => i.key === key);
  return item ? item.qty : 0;
};

export const isInCart = (productId, varietyName = null) =>
  getCartQty(productId, varietyName) > 0;

export const addToCart = (product, qty = 1, variety = null) => {
  const cart = readCart();
  const key = makeCartKey(product._id, variety?.name);
  const existing = cart.find((i) => i.key === key);

  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({
      key,
      productId: product._id,
      varietyName: variety?.name || null,
      name: variety ? `${product.name} - ${variety.name}` : product.name,
      price: variety
        ? variety.price
        : product.salePrice || product.price,
      image:
        variety?.image ||
        product.images?.find((img) => img.isPrimary)?.url ||
        product.images?.[0]?.url ||
        null,
      sellerId: product.seller?._id || product.seller,
      qty,
    });
  }

  writeCart(cart);
  return cart;
};

export const incrementCartItem = (product, variety = null) =>
  addToCart(product, 1, variety);

export const decrementCartItem = (productId, varietyName = null) => {
  const cart = readCart();
  const key = makeCartKey(productId, varietyName);
  const existing = cart.find((i) => i.key === key);
  if (!existing) return cart;

  existing.qty -= 1;
  const next = existing.qty > 0 ? cart : cart.filter((i) => i.key !== key);
  writeCart(next);
  return next;
};

export const removeFromCart = (key) => {
  const next = readCart().filter((i) => i.key !== key);
  writeCart(next);
  return next;
};

export const clearCart = () => writeCart([]);