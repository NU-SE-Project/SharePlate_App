import dotenv from "dotenv";

dotenv.config();

const NOTIFY_USER_ID = process.env.NOTIFYLK_USER_ID;
const NOTIFY_API_KEY = process.env.NOTIFYLK_API_KEY;
const NOTIFY_SENDER_ID = process.env.NOTIFYLK_SENDER_ID;
const NOTIFY_BASE_URL = process.env.NOTIFYLK_BASE_URL;

const buildFormBody = (params) => {
  return Object.keys(params)
    .map(
      (key) =>
        encodeURIComponent(key) + "=" + encodeURIComponent(params[key]),
    )
    .join("&");
};

export const sendSms = async (msisdn, message) => {
  if (!NOTIFY_BASE_URL || !NOTIFY_USER_ID || !NOTIFY_API_KEY) {
    throw new Error("Notify.lk credentials are not configured in .env");
  }

  const payload = {
    user_id: NOTIFY_USER_ID,
    api_key: NOTIFY_API_KEY,
    sender_id: NOTIFY_SENDER_ID || "Notify",
    // Notify.lk expects `to` as the destination field. Normalize local SL numbers.
    to: (() => {
      if (typeof msisdn !== "string") return msisdn;
      // remove spaces and plus
      const cleaned = msisdn.replace(/\s|\+/g, "");
      if (cleaned.startsWith("0")) return `94${cleaned.slice(1)}`;
      return cleaned;
    })(),
    message,
  };

  const body = buildFormBody(payload);

  try {
    const res = await fetch(NOTIFY_BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });

    const text = await res.text();
    return { status: res.status, body: text };
  } catch (err) {
    console.error("Notify: fetch error", err);
    throw err;
  }
};

export default { sendSms };
