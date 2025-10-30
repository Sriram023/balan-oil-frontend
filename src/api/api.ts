// frontend/src/api/api.ts
import axios from "axios";

// Set your backend base URL
const API_BASE = "http://localhost:5000"; // Change if deployed

// Fetch a single manufacturer by ID
export const fetchManufacturerById = async (id: number) => {
  try {
    const res = await axios.get(`${API_BASE}/manufacturers/${id}`);
    return res.data; // your manufacturer object
  } catch (err) {
    console.error("Error fetching manufacturer:", err);
    throw err;
  }
};

// Add credit
export const addCredit = async (id: number, amount: number) => {
  try {
    const res = await axios.post(`${API_BASE}/manufacturers/${id}/add-credit`, { amount });
    return res.data;
  } catch (err) {
    console.error("Error adding credit:", err);
    throw err;
  }
};

// Add payment
export const addPayment = async (id: number, amount: number) => {
  try {
    const res = await axios.post(`${API_BASE}/manufacturers/${id}/add-payment`, { amount });
    return res.data;
  } catch (err) {
    console.error("Error adding payment:", err);
    throw err;
  }
};

// Optional: Fetch all manufacturers
export const fetchManufacturers = async () => {
  try {
    const res = await axios.get(`${API_BASE}/manufacturers`);
    return res.data; // array of manufacturers
  } catch (err) {
    console.error("Error fetching manufacturers:", err);
    throw err;
  }
};

