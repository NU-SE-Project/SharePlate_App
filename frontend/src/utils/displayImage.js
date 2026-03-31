// utils/displayImage.js
export const displayImage = (donation) => {
  if (!donation?.imageUrl) return ''; // fallback if no image

  // Check if the URL starts with '/' → prepend API base URL
  if (donation.imageUrl.startsWith('/')) {
    const baseUrl =
      import.meta.env.VITE_API_URL
        ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '')
        : 'http://localhost:5000';
    return baseUrl + donation.imageUrl;
  }

  // Otherwise, it's a full URL already
  return donation.imageUrl;
};