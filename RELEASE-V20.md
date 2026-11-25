# WISH WORLD V2.0 RC — bản ứng viên phát hành nội bộ

## Cài đặt trên Windows
1. Giải nén vào thư mục riêng. Cài Python 3 nếu chưa có, đảm bảo lệnh `py -3` hoạt động.
2. Nếu nâng cấp, dừng máy chủ cũ, dùng bản sao lưu SQLite đã kiểm tra; không ghi đè dữ liệu khi server đang chạy. Xem DEPLOY-V18.md.
3. Chạy START-GAME.bat hoặc START-ADMIN.bat (đặt mật khẩu riêng từ 14 ký tự). Không chạy hai file cùng lúc. Trình duyệt sẽ tự mở. Nếu không mở, truy cập http://127.0.0.1:8080.
4. Giữ cửa sổ terminal mở khi chơi; Ctrl+C để dừng. Mở /admin khi chạy chế độ Admin.

## Thay đổi
- Launcher Python chạy local, tự mở trình duyệt; không yêu cầu thư viện ngoài.
- Điều hướng nhanh tới tài khoản, lưu và cộng đồng; nút giữ để di chuyển trên thiết bị cảm ứng.
- Đồng bộ nhãn phiên bản, mở rộng landing page với hướng dẫn trải nghiệm.
- Giữ nguyên backend V1.9, thanh toán mô phỏng; không bật cổng thanh toán thật.

## Cổng phát hành (chưa đạt)
- [ ] Kiểm thử gameplay đầy đủ trên Chrome/Edge, Android/iOS và GPU thật.
- [ ] Kiểm thử tải đăng nhập, multiplayer, giao dịch đồng thời trên VPS staging.
- [ ] Kiểm thử Docker, HTTPS, sao lưu ngoài máy chủ, phục hồi và giám sát.
- [ ] Rà soát bảo mật độc lập, chống gian lận Sao, kiểm duyệt và quyền riêng tư.
- [ ] Vật phẩm cao cấp phải có khả năng sử dụng thực tế trước khi bán.
- [ ] Rà soát pháp lý trò chơi online tại thị trường dự kiến, điều khoản, chính sách dữ liệu, cơ chế bảo vệ trẻ em.
- [ ] Chọn cổng thanh toán, ký hợp đồng, kiểm thử sandbox chính thức, đối soát và hoàn tiền.

## Thông tin chủ dự án cần cung cấp khi triển khai
Tên thương hiệu chính thức; đơn vị vận hành; tên miền (nếu đã mua); VPS (nếu có); email hỗ trợ công khai; thị trường và nhóm tuổi mục tiêu. Không gửi mật khẩu, SSH private key hoặc khóa API qua chat. Chưa cần tài khoản ngân hàng ở giai đoạn này.
