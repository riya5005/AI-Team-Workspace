import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
});



// Turn any backend error into a readable string
export function getErrorMessage(err) {
  const data = err.response?.data;
  if (data?.details?.length) {
    return data.details.map((d) => `${d.field}: ${d.message}`).join(", ");
  }
  return data?.message || "Something went wrong";
}

export default api;