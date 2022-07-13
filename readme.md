Sau khi giải nén, vào thẳng thư mục và gõ câu lệnh như sau
```
cd MediCare
```

Sau đó cài đặt các gói package bằng câu lệnh
```
npm install
```

Sau đó tạo file `.env` file ở thư mục gốc và điền đầy đủ các dữ kiện theo `.env.example`

Chạy ứng dụng với câu lệnh sau
```
npm run dev
```

Ứng dụng sẽ chạy trên cổng 3001. <br>

Mở trình duyệt và tới địa chỉ localhost:3001 để mở app. <br>

Ứng dụng sẽ có 5 sự lựa chọn. <br>

```
1. Trang người dùng
2. Trang bác sĩ
3. Trang admin
4. Trang dược sĩ
5. Trang lễ tân
```

Để truy cập trang bác sĩ, dược sĩ, lễ tân và admin bạn sẽ cần chỉnh lại cấu hình mạng cục bộ của bạn

Ở Linux và OSX, thêm tên miền sau tại
```
/etc/hosts
````
```
127.0.0.1       myapp.dev
127.0.0.1       doctor.care.myapp.local
127.0.0.1       admin.care.myapp.local
127.0.0.1       pharmacist.care.myapp.local
127.0.0.1       receptionist.care.myapp.local

```
Bạn có thể gặp trường hợp không có quyền truy cập, tron trường hợp này sử dụng câu lệnh sau để truy cập:
```
sudo chmod a+rw /etc/hosts
```
### Windows

Ở window 7,8 và 10 vào thư mục tại địa chỉ sau
```
%systemroot%\system32\drivers\etc.
```
Và chỉnh sửa/thêm tên miền như sau để vào
```
doctor.care.myapp.local:3001
pharmacist.care.myapp.local:3001
receptionist.care.myapp.local:3001

```
để vào trang bác sĩ, dược sĩ và lễ tân theo thứ tự và thêm

```
admin.care.myapp.local:3001
```
để vào trang admin.

Khi làm xong các bước trên tải mongodb tại 
```
https://www.mongodb.com/try/download/compass
```
Và thêm database theo các collection của các file .json
Để truy cập trang admin
```
username: admin
password: password
```
Các user khác mật khẩu mặc định là password
```
### Cảm ơn đã đọc :heart:
### Chúc một ngày tốt lành :heart: