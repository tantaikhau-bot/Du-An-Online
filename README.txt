WISH WORLD V0.7 — KẾT NỐI THẾ GIỚI

Windows: cài Python 3.10+ nếu chưa có; giải nén ZIP; mở thư mục và chạy START-WINDOWS.bat. Mở Chrome/Edge tại http://127.0.0.1:8080. Giữ cửa sổ máy chủ mở. Nếu lệnh py không có, chạy python server.py trong Terminal.
Linux/macOS: python3 server.py, mở http://127.0.0.1:8080.
Không cần pip hay npm. SQLite world.sqlite3 được tạo tự động; sao lưu file khi máy chủ đã dừng. Chỉ mở index.html thì vẫn có gameplay offline, nhưng không có tài khoản online.

Cuộn xuống Kết nối thế giới: Tài khoản -> đăng ký tên ASCII 3–24 ký tự, mật khẩu 10–128 ký tự. Lưu lên máy chủ và Tải bản lưu là thao tác chủ động. Không chia sẻ thiết bị giữa các tài khoản nếu chưa xuất hoặc xóa dữ liệu cục bộ; đăng xuất không xóa localStorage. Dùng cửa sổ riêng tư/hồ sơ trình duyệt riêng để thử hai người chơi. Điều ước cộng đồng là bài đăng riêng, tự nguyện công khai cho các tài khoản khác; có thể xóa bài của mình.

Kiểm thử API: python test_api.py (dùng database tạm, không ảnh hưởng dữ liệu thật).

Giới hạn: prototype chỉ chạy localhost mặc định, chưa triển khai public. Tiến trình do client gửi nên số Sao và XP chưa chống gian lận, không được dùng cho tiền thật. Chưa có bạn bè, chat, đồng bộ tự động, multiplayer thời gian thực, xác thực email, khôi phục mật khẩu, kiểm duyệt, giới hạn đăng nhập hay TLS tích hợp. Không mở máy chủ ra Internet công cộng trước khi hoàn thiện các lớp bảo mật và kiểm duyệt. Chưa kiểm thử đầy đủ UI trình duyệt. Dữ liệu từ phiên bản trước có thể chuyển bằng Xuất/Nhập bản lưu JSON.

V0.7 MULTIPLAYER (thử nghiệm nhóm nhỏ)
Chạy START-WINDOWS.bat. Mở hai trình duyệt hoặc một cửa sổ ẩn danh và đăng ký hai tài khoản khác nhau. Sau khi đăng nhập, nhân vật khác cùng khu vực xuất hiện trên bản đồ. Mục Bạn bè & cộng đồng cho phép tìm người, gửi/nhận lời mời, gửi lời chào có sẵn và báo cáo. Mở lại mục này để cập nhật danh sách. Đồng bộ vị trí mỗi giây bằng HTTP polling; mất kết nối sau khoảng 12 giây. Báo cáo lưu trong SQLite, chưa có màn hình admin. Không có chat tự do, tặng đồ hoặc ghé vườn bạn bè. Không mở máy chủ ra Internet công cộng; chưa chống gian lận tiền ảo hoặc giới hạn tải đầy đủ. Sao lưu world.sqlite3 trước khi chuyển phiên bản; không sao chép DB đang hoạt động. Kiểm thử: python test_api.py.

V0.8 - ADMIN CONTROL CENTER
Stop any running server first. Run START-ADMIN.bat (Windows) or python start_admin.py.
Enter a private admin password of at least 14 characters (not displayed). Keep this password secret.
Game: http://127.0.0.1:8080/ ; Admin: http://127.0.0.1:8080/admin
Normal START-WINDOWS.bat runs without admin unless WISH_ADMIN_PASSWORD is set in environment.
Admin uses separate cookie and session (1 hour). Admin lists show latest 100 reports/wishes, 200 accounts, 50 audit entries and 20 notices. Player search filters loaded accounts only.
To migrate: stop old server, back up world.sqlite3 and copy it into this folder (or set WISH_DB); schema additions are automatic. Do not share database file.
Test: python test_api.py (temporary database, no real player data). Do not deploy publicly yet: no login rate limiting, TLS configuration, production session revocation on admin password changes, server-authoritative economy or real payments. Browser UI not end-to-end tested.

V0.9 — Kinh tế thử nghiệm
Chạy START-ADMIN.bat; đăng nhập tài khoản game, kéo xuống Kho báu Pha lê.
Nhận 100 Pha lê một lần, mua huy hiệu, tạo đơn mô phỏng. Admin /admin tải cửa hàng và đơn hàng, thay giá hoặc cấp Pha lê thử nghiệm. Không chuyển tiền thật. Huy hiệu chỉ là quyền sở hữu trong kho, chưa gắn lên nhân vật. Sao vàng vẫn là dữ liệu cục bộ không đáng tin cậy. Không sử dụng máy chủ này công khai; chưa có cổng thanh toán, HTTPS triển khai, giới hạn đăng nhập hoặc kiểm thử tải. Sao lưu database trước khi nâng cấp; có thể dùng database cũ bằng WISH_DB. Chạy python test_api.py để kiểm thử API.

=== V1.0 BETA NỘI BỘ ===
Trang chủ: http://127.0.0.1:8080/ ; Game: /play ; Admin: /admin.
Tất cả thanh toán là mô phỏng. Không phát hành công khai hoặc thu tiền thật.
Giới hạn yêu cầu đăng nhập/đăng ký theo IP trong 60 giây (12 login, 5 register, 5 admin login). Bộ đếm trong RAM, đặt lại khi khởi động lại; không thay thế chống tấn công phân tán. Khi dùng reverse proxy, nhiều người có thể chung IP.
Sao lưu: đăng nhập admin, bấm Tạo bản sao lưu. File SQLite nằm trong backups cạnh DB, không tải qua web. File chứa dữ liệu cá nhân và phiên xác thực: bảo vệ quyền truy cập, mã hóa bản sao lưu bên ngoài, không chia sẻ.
Khôi phục thủ công: tắt toàn bộ máy chủ, sao chép DB hiện tại sang nơi an toàn, kiểm tra bản sao bằng PRAGMA integrity_check, thay DB bằng bản sao đã chọn (đúng đường dẫn WISH_DB hoặc world.sqlite3), xử lý các file WAL/SHM cũ khi máy chủ đã dừng, khởi động lại và kiểm tra tài khoản. Thu hồi phiên người chơi và admin sau khi phục hồi (DELETE FROM sessions; DELETE FROM staff_sessions;). Không thử trên dữ liệu thật nếu chưa có bản sao riêng.
Nâng cấp: giữ nguyên DB cũ, sao lưu trước, giải nén bản mới vào thư mục mới và cấu hình WISH_DB trỏ đến DB đã sao chép. Không ghi đè DB đang chạy.
Kiểm thử: python test_api.py và python test_beta.py.
Triển khai thử trên máy cá nhân: START-ADMIN.bat, đặt mật khẩu mạnh. Máy chủ mặc định chỉ lắng nghe localhost. Trước khi mở Internet cần HTTPS, reverse proxy, WISH_SECURE=1, giới hạn tải, giám sát, kiểm thử bảo mật và rà soát pháp lý. Các trang điều khoản và quyền riêng tư chỉ là dự thảo nội bộ, không thay thế tư vấn pháp lý. Chưa có giới thiệu bạn bè, bảng thành tích mới, sự kiện mới, thanh toán thật hoặc kiểm thử tải lớn.

V1.1 — MYSTIC HORIZON
- WebGL rasterizer with depth buffer, GPU triangle drawing and distance fog. Existing CPU projection and Canvas HUD retained; Canvas fallback if WebGL unavailable or context lost. No external dependency. Not RTX or a full 3D engine.
- Added paths, trees, lanterns, moon and water details. Existing API and database schema unchanged.
- Run START-ADMIN.bat then open http://127.0.0.1:8080/play. Renderer status below map indicates WebGL or Canvas.
- Before migration, stop old server and back up world.sqlite3; copy database to new folder only while stopped. Never replace existing database with a blank one.
- Tests: node --check inline JavaScript, test_api.py and test_beta.py passed. Browser navigation blocked by environment policy; GPU rendering and visual gameplay not verified. Sandbox payments only; not for public deployment.

V1.2 — COMPANION STUDIO
- Five distinct companion models: fox, cat, rabbit, dragon, deer. Added arm/leg motion, facial details, three skin tones and three free accessories.
- Open profile > Xưởng tạo hình & linh thú; or open Linh thú > Xưởng tạo hình. Name the active companion and customize appearance.
- Existing companion XP is migrated to a per-companion profile on first use; switching companions retains XP and care date. Care rewards are now per companion per day, using local game data only.
- Two new outfits and two new companions cost local Stars, not server Crystals.
- Tests: python test_api.py; python test_beta.py; node test_companions.js (Node optional for tests only). JS syntax checked. No visual browser or performance validation performed.
- Keep a backup of your old world.sqlite3 and local JSON save before upgrading. Cosmetics and pet profiles are local/save data, not live multiplayer appearance. No real payment.

V1.3 My Dream Home: vào Vườn hạnh phúc, chọn ô trong lưới 8x6 để xây, xoay, di chuyển, cất và đặt lại công trình. Tối đa một nhà; dùng Sao cục bộ, không dùng Pha lê. Bố cục nằm trong bản lưu hiện tại, lưu cloud thủ công. Chưa có nội thất hoặc thăm nhà bạn bè. Các vật phẩm cũ được nhập vào bố cục lần đầu. Không sử dụng tiền thật.

V1.4 FRIENDSHIP WORLD
Sau khi đăng nhập, mở mục Friendship World dưới phần kết nối. Chọn quyền riêng tư và bấm Lưu & chia sẻ vườn để công bố bản chụp bố cục. Mặc định riêng tư. Tải bạn bè & hộp quà, chọn Ghé thăm hoặc gửi quà lưu niệm. Tìm theo tên để xem vườn công khai. Quà miễn phí, không chuyển tiền hay vật phẩm có giá trị; tối đa 10 quà/24h và 1 quà/người nhận/24h. Lời nhắn có sẵn, một lời nhắn và một lượt thích mỗi khách/vườn. Bố cục ghé thăm là lưới 2D, không phải không gian 3D trực tiếp. Bản chia sẻ độc lập với bản lưu game, phải công bố lại sau chỉnh sửa. Chạy python test_friendship.py để kiểm thử API. Chưa mở Internet công cộng hoặc thanh toán thật.

V1.5 – FESTIVAL WORLD
- Admin: mục Quản lý lễ hội, đặt tên, chủ đề, thời gian mở/đóng, thưởng 1–100 Pha lê thử nghiệm. Không có lễ hội mặc định: tạo từ Admin. Thời gian nhập theo múi giờ thiết bị.
- Người chơi: đăng nhập, mở Festival World, điểm danh, đăng điều ước cộng đồng và gửi quà cho bạn bè trong thời gian sự kiện, tải lại danh sách rồi nhận thưởng.
- Máy chủ kiểm tra dữ liệu hành động và cấp thưởng đúng một lần trong giao dịch SQLite. Thống kê số tham gia và hoàn thành, đóng sự kiện từ Admin. Các hành động có thể tính cho nhiều sự kiện trùng lịch; chủ đề chỉ thay đổi nhãn giao diện, chưa thay cảnh 3D. Điều ước bị xóa trước khi nhận thưởng không được tính. Không có thanh toán thật.
- Chạy python test_festival.py để kiểm thử API mới. Sao lưu world.sqlite3 trước khi nâng cấp, dùng lại bản sao dữ liệu cũ khi server đã tắt. Chưa kiểm thử trực quan hoặc tải lớn.

V1.6 – Viral World
- Mở /play, đăng nhập, cuộn tới Viral World, bấm Xem mã mời. Link /play?ref=... tự điền mã vào form đăng ký. Link localhost chỉ hoạt động trên máy chạy server.
- Người mời nhận 10 Pha lê thử nghiệm khi người mới đăng điều ước công khai và đã qua 24 giờ kể từ đăng ký, tối đa 5 lượt thưởng mỗi tài khoản. Không thưởng tiền thật; không chống được mọi tài khoản ảo.
- Tạo thiệp PNG cục bộ, tải ảnh rồi chia sẻ thủ công. Admin có mục Marketing thống kê giới thiệu.
- Sao lưu DB cũ trước khi nâng cấp; schema bổ sung tự động. Chạy test_referral.py để kiểm tra API mới. Chưa kiểm thử giao diện trình duyệt.

V1.7 ROYAL COLLECTION
- VIP 30 ngày, mặc định 300 Pha lê thử nghiệm, không tự gia hạn; trạng thái xác minh bằng máy chủ.
- Admin > Royal Collection: tải thống kê, đổi giá và bật/tắt gói VIP.
- 4 vật phẩm mới trong ví Pha lê: trang phục hoàng gia, rồng thiên giới, hào quang, nhà hoàng gia. Chỉ ghi nhận quyền sở hữu, chưa trang bị mô hình 3D.
- Sao lưu world.sqlite3 trước khi chuyển phiên bản. Chạy START-ADMIN.bat; /play và /admin.
- python test_royal.py để kiểm thử API VIP. Chưa thu tiền thật, chưa kiểm thử giao diện WebGL trực quan.

V1.8: xem DEPLOY-V18.md để triển khai staging, kiểm thử tải và khôi phục.

V1.9: xem PAYMENT-V19.md để thử webhook nội bộ và đối soát. Không có thanh toán thật.
