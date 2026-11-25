# WISH WORLD V1.8 — Global Server (staging)

## Chạy Windows
Giải nén, chạy START-ADMIN.bat, đặt mật khẩu >=14 ký tự. Mở http://127.0.0.1:8080. Các chức năng cũ giữ nguyên.

## VPS Linux có Docker Engine và Compose v2
1. Dùng VPS thử nghiệm riêng; trỏ DNS A (và AAAA nếu dùng IPv6) của tên miền về VPS. Mở TCP 80/443, hạn chế SSH theo IP. Không mở 8080.
2. `cp .env.example .env`; chỉnh WISH_DOMAIN thành tên miền thật, WISH_ADMIN_PASSWORD thành mật khẩu ngẫu nhiên dài ít nhất 20 ký tự. `chmod 600 .env`.
3. `docker compose config --quiet` rồi `docker compose up -d --build`.
4. `docker compose ps` và `docker compose logs --tail=100 game proxy`. Caddy sẽ yêu cầu chứng chỉ nếu DNS và kết nối phù hợp. Kiểm tra https://TEN-MIEN/healthz, /play, /admin. Không dùng HTTP cho đăng nhập.
5. WISH_TRUST_PROXY=1 chỉ dùng khi backend không truy cập trực tiếp từ Internet; Caddy ghi đè X-Real-IP. Không công khai cổng game.

## Sao lưu / khôi phục
Tạo bản sao bằng Admin. Bản sao nằm tại /data/backups trong volume game_data. Sao chép ra ngoài VPS bằng `docker compose cp game:/data/backups ./backups` và bảo vệ thư mục vì chứa dữ liệu tài khoản. Không sao chép riêng file SQLite đang chạy ở chế độ WAL.
Khôi phục thử: `python restore.py backups/TEN-FILE.sqlite3 restored.sqlite3` trên máy riêng. Công cụ không ghi đè dữ liệu hiện có. Trước khi phục hồi production cần dừng máy chủ, sao lưu toàn bộ volume, thay thế DB offline (không giữ WAL/SHM cũ), kiểm tra quyền sở hữu uid 10001, khởi động và xác minh. Không dùng `docker compose down -v` vì xóa volume.

## Kiểm thử
Chạy `python test_api.py`, `python test_beta.py`, `python test_friendship.py`, `python test_festival.py`, `python test_referral.py`, `python test_royal.py`, `node test_home.js`, `node test_companions.js` trong thư mục dự án. Khi server cục bộ chạy: `python load_test.py --requests 300 --workers 20`. Chỉ thử tải localhost.
Kết quả phiên này: 300/300 HTTP thành công, 140.2 req/s, p50 3.8 ms, p95 38.3 ms. Đây là tải đọc /play và /healthz, không đại diện cho Multiplayer hoặc VPS thật. Khôi phục sang DB mới đã chạy thành công với DB thử nghiệm. Docker không có trong môi trường kiểm thử, nên chưa chạy container hoặc cấp HTTPS thật.

## Giới hạn
Máy chủ Python thử nghiệm giới hạn 64 yêu cầu đồng thời, trả 503 khi đầy, socket timeout 15 giây; WAL và các index mới giảm tranh chấp/truy vấn nhưng chưa đo cải thiện. Không có WebSocket hoặc cluster nhiều máy; SQLite vẫn một writer. Chưa kiểm thử UI WebGL, chưa có monitoring cảnh báo tự động. Chỉ dùng staging giới hạn người thử; thanh toán mô phỏng, Sao vàng cục bộ, chưa rà soát pháp lý và bảo mật độc lập. Không mở thu tiền thật.
