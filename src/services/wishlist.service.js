const WISHLIST_KEY = "wishlist_properties";

function getWishlist() {
  const wishlist = localStorage.getItem(WISHLIST_KEY);
  return wishlist ? JSON.parse(wishlist) : [];
}

function addToWishlist(propertyId) {
  const wishlist = getWishlist();
  if (!wishlist.includes(propertyId)) {
    wishlist.push(propertyId);
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
  }
}

function removeFromWishlist(propertyId) {
  const wishlist = getWishlist();
  const updatedWishlist = wishlist.filter((id) => id !== propertyId);
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(updatedWishlist));
}

function isInWishlist(propertyId) {
  const wishlist = getWishlist();
  return wishlist.includes(propertyId);
}

function toggleWishlist(propertyId) {
  if (isInWishlist(propertyId)) {
    removeFromWishlist(propertyId);
    return false;
  } else {
    addToWishlist(propertyId);
    return true;
  }
}

export const wishlistService = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  isInWishlist,
  toggleWishlist,
};
