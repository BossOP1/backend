# Videotube  

A full-stack video-sharing platform designed for users to upload, share, and engage with video content. Videotube includes features like subscriptions, user dashboards, secure authentication, and playlist management.

---

## 🚀 Features  

- **User Authentication & Security:** Secure user sign-up and login using JWT and bcrypt.  
- **Video Upload & Playback:** Upload videos with file management powered by Cloudinary and Multer.  
- **Subscription Management:** Users can subscribe to channels and view subscribed content.  
- **Playlists:** Create, view, and manage custom playlists.  
- **User Dashboard:** Analytics including total views, total videos, and total subscribers.  

---

## 🛠 Tech Stack  

- **Backend:** Node.js, Express.js  
- **Database:** MongoDB, Mongoose  
- **Authentication:** JWT, bcrypt  
- **File Uploads:** Cloudinary, Multer  
- **API Testing:** Postman  

---

## 📚 Installation & Setup  

1. Clone the repository:  
    ```bash
    git clone https://github.com/your-username/videotube.git
    cd videotube
    ```  

2. Install dependencies:  
    ```bash
    npm install
    ```  

3. Set up environment variables in a `.env` file:  
    ```
    MONGO_URI=your-mongodb-uri
    JWT_SECRET=your-jwt-secret
    CLOUDINARY_URL=your-cloudinary-url
    ```  

4. Start the server:  
    ```bash
    npm run dev
    ```  

---

## 📬 API Endpoints  

### **User Routes**  
- `POST /api/register` - Register a new user  
- `POST /api/login` - User login  

### **Video Routes**  
- `POST /api/videos` - Upload a new video  
- `GET /api/videos/:id` - Get video details  

### **Subscription Routes**  
- `POST /api/subscribe/:channelId` - Subscribe/Unsubscribe to a channel  
- `GET /api/subscriptions` - Get subscribed channels  

---

## 🔧 Development Progress  

- [x] User authentication  
- [x] Video upload and playback  
- [x] Subscription management  
- [x] Playlist creation  
- [x] Dashboard analytics  

---

## 🤝 Contributions  

Contributions are welcome! Fork the repository, make your changes, and submit a pull request.  

---

## 📄 License  

This project is licensed under the MIT License.  

---  

## 📧 Contact  

For any inquiries, please reach out:  
- **Email:** chitransh.5055@gmail.com 
- **GitHub:** https://github.com/BossOP1
  
