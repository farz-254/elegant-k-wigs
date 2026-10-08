const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5001;
// Temporary payment tracker
const pendingPayments = new Map();

// ==========================================
// GET M-PESA ACCESS TOKEN
// ==========================================

async function getMpesaToken() {
  const auth = Buffer.from(
    `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
  ).toString("base64");

  const response = await axios.get(
    "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
    {
      headers: {
        Authorization: `Basic ${auth}`,
      },
    }
  );

  return response.data.access_token;
}

// ==========================================
// HOME ROUTE
// ==========================================

app.get("/", (req, res) => {
  res.json({
    message: "Elegant K Wigs backend is running",
  });
});

// ==========================================
// TEST M-PESA CONNECTION
// ==========================================

app.get("/api/mpesa/token", async (req, res) => {
  try {
    const token = await getMpesaToken();

    res.json({
      success: true,
      access_token: token,
    });
  } catch (error) {
    console.error(
      "M-Pesa token error:",
      error.response?.data || error.message
    );

    res.status(500).json({
      success: false,
      message: "Failed to get M-Pesa access token",
      error: error.response?.data || error.message,
    });
  }
});

// ==========================================
// M-PESA CALLBACK
// ==========================================

app.post("/api/mpesa/callback", (req, res) => {
  console.log("=================================");
  console.log("M-PESA CALLBACK RECEIVED");
  console.log("=================================");

  console.log(JSON.stringify(req.body, null, 2));

  const stkCallback = req.body?.Body?.stkCallback;

  if (!stkCallback) {
    console.log("No stkCallback data found.");
    return res.json({
      ResultCode: 0,
      ResultDesc: "Accepted"
    });
  }

  const resultCode = stkCallback.ResultCode;
  const resultDesc = stkCallback.ResultDesc;
  const checkoutRequestID = stkCallback.CheckoutRequestID;

  console.log("---------------------------------");
  console.log("CheckoutRequestID:", checkoutRequestID);
  console.log("ResultCode:", resultCode);
  console.log("ResultDesc:", resultDesc);
  console.log("---------------------------------");

  if (resultCode === 0) {
    console.log("✅ PAYMENT SUCCESSFUL");
    
    // Later we'll mark the Elegant K Wigs order as PAID here.

  } else {
    console.log("❌ PAYMENT FAILED");
    console.log("Reason:", resultDesc);

    // Later we'll keep the Elegant K Wigs order as UNPAID here.
  }

  console.log("=================================");

  res.json({
    ResultCode: 0,
    ResultDesc: "Accepted"
  });
});
// ==========================================
// M-PESA STK PUSH
// ==========================================

app.post("/api/mpesa/stkpush", async (req, res) => {
  try {
    const { phone, amount, orderId } = req.body;

    // Check that phone and amount were provided
    if (!phone || !amount || !orderId) {
      return res.status(400).json({
        success: false,
       message: "Phone number, amount and order ID are required",
      });
    }

    // Get access token
    const token = await getMpesaToken();

    // Generate timestamp
    const timestamp = new Date()
      .toISOString()
      .replace(/[-T:.Z]/g, "")
      .slice(0, 14);

    // Generate password
    const password = Buffer.from(
      `${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`
    ).toString("base64");
console.log("=================================");
console.log("M-PESA CALLBACK URL");
console.log("=================================");
console.log(process.env.MPESA_CALLBACK_URL);
console.log("=================================");
    // Send STK Push request
    const response = await axios.post(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      {
        BusinessShortCode: process.env.MPESA_SHORTCODE,
        Password: password,
        Timestamp: timestamp,

        TransactionType: "CustomerPayBillOnline",

        Amount: Number(amount),

        PartyA: phone,

        PartyB: process.env.MPESA_SHORTCODE,

        PhoneNumber: phone,

        // Callback URL
        CallBackURL: process.env.MPESA_CALLBACK_URL,

        AccountReference: "ElegantKWigs",

        TransactionDesc: "Elegant K Wigs purchase",
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("=================================");
    console.log("STK PUSH RESPONSE");
    console.log("=================================");
    console.log(response.data);
    console.log("=================================");
    // Link the M-Pesa payment to the order
pendingPayments.set(response.data.CheckoutRequestID, {
  orderId: orderId,
  phone: phone,
  amount: Number(amount),
});

console.log("PAYMENT LINKED TO ORDER");
console.log("Order ID:", orderId);
console.log("CheckoutRequestID:", response.data.CheckoutRequestID);

    res.json({
      success: true,
      message: "STK Push sent successfully",
      data: response.data,
    });
  } catch (error) {
    console.error("=================================");
    console.error("STK PUSH ERROR");
    console.error("=================================");

    console.error(
      error.response?.data || error.message
    );

    console.error("=================================");

    res.status(500).json({
      success: false,
      message: "STK Push failed",
      error: error.response?.data || error.message,
    });
  }
});

// ==========================================
// RECEIVE CUSTOMER ORDERS
// ==========================================

app.post("/api/orders", (req, res) => {
  try {
    const { customer, items, total } = req.body;
    const orderId = `EKW-${Date.now()}`;

    // Check required information
    if (!customer || !items || !total) {
      return res.status(400).json({
        success: false,
        message: "Customer details, items and total are required",
      });
    }

    console.log("=================================");
    console.log("NEW ELEGANT K WIGS ORDER");
    console.log("=================================");

    console.log("CUSTOMER:");
    console.log("Name:", customer.name);
    console.log("Phone:", customer.phone);
    console.log("Location:", customer.location);
    console.log("Notes:", customer.notes || "None");

    console.log("---------------------------------");

    console.log("ORDER:");

    items.forEach((item) => {
      console.log(
        `${item.name} x${item.quantity} - KSh ${
          item.price * item.quantity
        }`
      );
    });

    console.log("---------------------------------");

    console.log("TOTAL: KSh", total);

    console.log("=================================");

    res.json({
  success: true,
  message: "Order received successfully",
  orderId: orderId,
});
  } catch (error) {
    console.error("ORDER ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to receive order",
    });
  }
});

// ==========================================
// START SERVER
// ==========================================

app.listen(PORT, () => {
  console.log(
    `Elegant K Wigs backend running on port ${PORT}`
  );
});