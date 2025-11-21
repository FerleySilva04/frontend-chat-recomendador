// src/lib/axios.ts
import axios from "axios";

const api = axios.create({
  //baseURL: "http://127.0.0.1:8000",
  baseURL: "https://aaa-herself-lol-dsl.trycloudflare.com" 
});

export default api;
