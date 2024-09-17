const express = require("express");
const router = express.Router();
const payOS = require("../utils/payos");

// Middleware để xử lý JSON body
router.use(express.json());

// Tạo link thanh toán
router.post("/create", async function (req, res) {
  const { description, returnUrl, cancelUrl, amount } = req.body;

  // Kiểm tra và log các giá trị đầu vào
  if (!description || !returnUrl || !cancelUrl || !amount) {
    console.error('Missing required fields:', { description, returnUrl, cancelUrl, amount });
    return res.status(400).json({
      error: -1,
      message: "Invalid input data. All fields are required.",
      data: null,
    });
  }

  // Chuẩn bị dữ liệu body
  const body = {
    orderCode: Number(String(new Date().getTime()).slice(-6)),
    amount,
    description,
    cancelUrl,
    returnUrl,
  };

  try {
    // Log dữ liệu trước khi gửi đến PayOS
    console.log('Sending body to createPaymentLink:', body);

    // Gọi API tạo link thanh toán
    const paymentLinkRes = await payOS.createPaymentLink(body);

    // Kiểm tra kết quả trả về từ PayOS
    if (!paymentLinkRes || !paymentLinkRes.checkoutUrl) {
      console.error('Invalid response from PayOS:', paymentLinkRes);
      return res.status(500).json({
        error: -1,
        message: "Failed to create payment link",
        data: null,
      });
    }

    // Trả về kết quả thành công
    return res.json({
      error: 0,
      message: "Success",
      data: {
        bin: paymentLinkRes.bin,
        checkoutUrl: paymentLinkRes.checkoutUrl,
        accountNumber: paymentLinkRes.accountNumber,
        accountName: paymentLinkRes.accountName,
        amount: paymentLinkRes.amount,
        description: paymentLinkRes.description,
        orderCode: paymentLinkRes.orderCode,
        qrCode: paymentLinkRes.qrCode,
      },
    });
  } catch (error) {
    // Log chi tiết lỗi từ PayOS hoặc lỗi không mong muốn
    console.error("Error in createPaymentLink:", error);

    // Kiểm tra nếu lỗi liên quan đến phản hồi từ PayOS
    if (error.response && error.response.data) {
      console.error('Detailed PayOS error:', error.response.data);
      return res.status(400).json({
        error: -1,
        message: `PayOS error: ${error.response.data.message}`,
        data: null,
      });
    }

    // Xử lý các lỗi khác
    return res.status(500).json({
      error: -1,
      message: "An unexpected error occurred",
      data: null,
    });
  }
});

module.exports = router;
