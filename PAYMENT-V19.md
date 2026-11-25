# WISH WORLD V1.9 — Payment Center (sandbox)

Không chuyển tiền thật. Không có kết nối ngân hàng, VietQR hay cổng thanh toán bên ngoài.

1. Đặt biến môi trường WISH_SANDBOX_SECRET bằng chuỗi ngẫu nhiên tối thiểu 32 ký tự (ví dụ tạo bằng `python -c "import secrets; print(secrets.token_hex(32))"`). Không đưa bí mật vào HTML hay chia sẻ công khai.
2. Chạy START-ADMIN.bat từ môi trường có biến trên. Đăng nhập game, tạo đơn mô phỏng trong Ví Pha lê.
3. Từ terminal tin cậy có cùng biến môi trường, chạy `python simulate_payment.py ORDER_ID AMOUNT_VND`, thay bằng mã đơn và số tiền mô phỏng chính xác.
4. Kiểm tra ví và Admin → Payment Center. Doanh thu thật luôn bằng 0. Có thể dùng quy trình Admin cấp thử cũ, nhưng không thể cấp hai lần.

Webhook nội bộ POST /api/payment/sandbox-webhook dùng HMAC-SHA256, timestamp ±300 giây, event ID duy nhất, VND và paid_test. Không phải định dạng webhook của nhà cung cấp nào. Không bật secret nếu không cần thử. Docker chưa được kiểm thử; mặc định không bật webhook.

## Trước khi kinh doanh
- Rà soát phân loại game và giấy phép/phê duyệt/thông báo phù hợp tại Việt Nam với chuyên gia pháp lý.
- Chọn nhà cung cấp thanh toán có hợp đồng phù hợp, xác minh chữ ký theo tài liệu chính thức, đối soát và hoàn tiền; tách hoàn toàn môi trường sandbox và production.
- Hoàn thiện bảo mật, kiểm duyệt, bảo vệ trẻ em, quyền riêng tư, hỗ trợ khách hàng và điều khoản mua hàng.
- Không quy đổi vật phẩm/tiền ảo thành tiền mặt. Không dùng giao dịch mô phỏng làm bằng chứng thanh toán thật.
- Sao lưu DB trước khi nâng cấp; kiểm thử trình duyệt và tải multiplayer trước khi mở công khai.

## Kiểm thử
`python test_payment.py` chạy trên DB tạm, không dùng dữ liệu thật.
