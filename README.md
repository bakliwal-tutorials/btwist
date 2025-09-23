
# 🎯 BTwist - Email Management System

**BTwist** is a secure, web-based email management system designed for Bakliwal Tutorials to streamline the process of sending test result emails to students. Built with modern web technologies and featuring robust authentication, it ensures efficient and professional communication.

![BTwist Logo](./attached_assets/Screenshot%202025-09-23%20213415_1758644247005.png)

## ✨ Features

### 🔐 **Secure Authentication System**
- Password-protected access with 50 unique authentication codes
- One-time password usage with device-specific tracking
- Firebase-based authentication state management
- Session persistence across browser sessions

### 📧 **Smart Email Composition**
- **Multi-recipient support** (up to 2 email addresses)
- **Dynamic email templates** with auto-generated content
- **Real-time email preview** with formatted HTML output
- **Input validation** for marks, rankings, and email addresses

### 📊 **Comprehensive Test Result Management**
- Subject-wise marks tracking (Physics, Chemistry, Maths)
- Dual ranking system (All students vs. Batch-specific)
- Configurable maximum marks for each subject
- Auto-calculation of total marks and percentages

### 🎨 **Modern UI/UX**
- **Google Material Design** inspired interface
- **Fully responsive** design for all devices
- **PWA capabilities** for mobile app-like experience
- **Dynamic taglines** for engaging user experience

### ⚙️ **Advanced Configuration**
- **EmailJS integration** for reliable email delivery
- **Firebase cloud database** for configuration storage
- **Real-time form validation** and error handling
- **Admin panel** access via keyboard shortcuts

## 🚀 Live Demo

Experience BTwist in action: [**Live Demo**](https://replit.com/@your-username/btwist)

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Styling**: Google Material Design principles
- **Database**: Firebase Realtime Database
- **Email Service**: EmailJS
- **Authentication**: Custom password-based system
- **PWA**: Web App Manifest, Service Worker ready

## 📦 Installation & Setup

### 1️⃣ **Clone the Repository**
```bash
git clone https://github.com/your-username/btwist.git
cd btwist
```

### 2️⃣ **Install Dependencies**
```bash
npm install
```

### 3️⃣ **Firebase Configuration**
1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Realtime Database
3. Update Firebase config in `script.js`:
```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  databaseURL: "https://your-project-default-rtdb.region.firebasedatabase.app",
  projectId: "your-project-id",
  // ... other config
};
```

### 4️⃣ **EmailJS Setup**
1. Create account at [EmailJS](https://www.emailjs.com/)
2. Create email service and template
3. **Critical Template Setup**:
   - Set "To Email" field to `{{to_email}}`
   - Use `{{{message_html}}}` with **triple braces** for HTML content
   - Set Content Type to **"HTML"** in EmailJS dashboard

### 5️⃣ **Run the Application**

#### For Development:
```bash
npm run dev
# or
npx http-server . -p 5000 -c-1 --cors
```

#### For Production (Replit):
```bash
npm run build
npm run preview
```

## 🔑 Authentication

BTwist uses a secure password system with 50 unique authentication codes. Each password can only be used once per device to ensure security.

### **Getting Access**:
1. Contact the administrator via Telegram: [@itz_atharva07](https://t.me/itz_atharva07)
2. Receive a valid password from the authorized list
3. Enter the password in the authentication modal
4. Access granted for the browser session

### **Password Management**:
- All passwords are 16-character secure strings
- Device fingerprinting prevents password sharing
- Used passwords are tracked in Firebase database
- Session persistence until browser data is cleared

## 📧 Email Template Features

BTwist generates professional email templates with:

- **Auto-generated subject lines** based on test date
- **Formatted result tables** with subject-wise breakdowns
- **Multiple ranking displays** (overall and batch-specific)
- **Download links** for OMR sheets, response reports, and analysis
- **Professional styling** with proper HTML formatting

### **Sample Email Output**:
```
Subject: Bakliwal Tutorials: result for Btest on 15 October 2024

Dear John Doe,

Please find below the detailed result of Btest-12 that was conducted 
in the offline mode on 15 October 2024.

[Formatted table with Physics, Chemistry, Maths scores and rankings]

You may download your reports using the provided links...

Regards,
BT Team.
```

## 🎨 UI/UX Features

- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Material Design**: Google-inspired clean interface
- **Real-time Preview**: See email formatting before sending
- **Smart Validation**: Automatic input validation and error handling
- **Progressive Web App**: Install as native app on mobile devices

## 🔧 Configuration Management

### **EmailJS Template Requirements**:
```html
<!-- Template Body (use triple braces for HTML) -->
{{{message_html}}}
```

### **Firebase Database Structure**:
```json
{
  "auth": {
    "valid-passwords": { "hash1": {...}, "hash2": {...} },
    "used-passwords": { "hash1": {...} }
  },
  "emailjs-config": {
    "serviceId": "your_service_id",
    "templateId": "your_template_id", 
    "publicKey": "your_public_key"
  }
}
```

## 🚀 Deployment

### **Deploy on Replit** (Recommended):
1. Import repository to Replit
2. Configure Firebase credentials
3. Set up EmailJS integration
4. Deploy as static site

### **Manual Deployment**:
```bash
# Build the project
npm run build

# Deploy the dist folder to your hosting service
# (Netlify, Vercel, GitHub Pages, etc.)
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Atharva** - [@itz_atharva07](https://t.me/itz_atharva07)

- Telegram: [@itz_atharva07](https://t.me/itz_atharva07)
- GitHub: [@your-github-username](https://github.com/your-github-username)

## 🙏 Acknowledgments

- **Bakliwal Tutorials** for the project requirements
- **Firebase** for backend services
- **EmailJS** for email delivery
- **Google Material Design** for UI inspiration

## 📞 Support

For support, authentication requests, or questions:
- **Primary Contact**: [@itz_atharva07](https://t.me/itz_atharva07) on Telegram
- **Issues**: Open an issue in this repository
- **Email**: Available upon request

---

**BTwist** - *Making email management simple, secure, and efficient for educational institutions.*

⭐ **Star this repository if you find it helpful!**
