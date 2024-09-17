const express = require("express");
const router = express.Router();
const payOS = require("../utils/payos");

// Middleware để xử lý JSON body
router.use(express.json());

router.post("/payos", async function (req, res) {
  console.log("Payment handler invoked");

  try {
    // Xác thực dữ liệu webhook từ PayOS
    const webhookData = payOS.verifyPaymentWebhookData(req.body);

    // Kiểm tra dữ liệu webhook, nếu không đúng, trả về lỗi
    if (!webhookData) {
      console.error("Invalid webhook data");
      return res.status(400).json({
        error: 1,
        message: "Invalid webhook data",
      });
    }

    // Log dữ liệu đã xác thực để kiểm tra
    console.log("Verified webhook data:", webhookData);

    // Kiểm tra điều kiện cụ thể của dữ liệu webhook
    if (
      ["Ma giao dich thu nghiem", "VQRIO123"].includes(webhookData.description)
    ) {
      return res.json({
        error: 0,
        message: "Ok",
        data: webhookData,
      });
    }

    // Xử lý thêm dữ liệu webhook nếu cần thiết
    // Ví dụ: cập nhật thông tin thanh toán trong hệ thống của bạn

    return res.json({
      error: 0,
      message: "Ok",
      data: webhookData,
    });
  } catch (error) {
    console.error("Error handling webhook:", error);
    return res.status(500).json({
      error: 1,
      message: "Internal Server Error",
    });
  }
});

module.exports = router;
