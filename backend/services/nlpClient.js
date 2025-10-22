// backend/services/nlpClient.js
const axios = require("axios");

const NLP_API_URL = process.env.NLP_API_URL || "http://127.0.0.1:5001";

function isNetworkErr(err) {
  return (
    err?.code === "ECONNREFUSED" ||
    err?.code === "ENOTFOUND" ||
    err?.message?.includes("ECONNREFUSED") ||
    err?.message?.includes("ENOTFOUND")
  );
}

async function health() {
  try {
    const { data } = await axios.get(`${NLP_API_URL}/health`, { timeout: 1500 });
    return !!data?.ok;
  } catch {
    return false;
  }
}

async function searchAI(q) {
  try {
    const { data } = await axios.get(`${NLP_API_URL}/ai-search`, {
      params: { q },
      timeout: 4000,
    });
    // server may return { results: [...] } or [] directly; normalize to array
    return Array.isArray(data?.results) ? data.results : Array.isArray(data) ? data : [];
  } catch (err) {
    if (isNetworkErr(err)) {
      const e = new Error("NLP_UNAVAILABLE");
      e.code = "NLP_UNAVAILABLE";
      throw e;
    }
    throw err;
  }
}

async function recommend(user_id, product_id) {
  try {
    const { data } = await axios.get(`${NLP_API_URL}/recommend`, {
      params: { user_id, product_id },
      timeout: 4000,
    });
    return Array.isArray(data?.recommendations) ? data.recommendations : [];
  } catch (err) {
    if (isNetworkErr(err)) {
      const e = new Error("NLP_UNAVAILABLE");
      e.code = "NLP_UNAVAILABLE";
      throw e;
    }
    throw err;
  }
}

async function analyzeReview(product_id, review) {
  try {
    const { data } = await axios.post(
      `${NLP_API_URL}/analyze_review`,
      { product_id, review },
      { timeout: 4000 }
    );
    return data ?? { ok: false };
  } catch (err) {
    if (isNetworkErr(err)) {
      const e = new Error("NLP_UNAVAILABLE");
      e.code = "NLP_UNAVAILABLE";
      throw e;
    }
    throw err;
  }
}

module.exports = { NLP_API_URL, health, searchAI, recommend, analyzeReview };
