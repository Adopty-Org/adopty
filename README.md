# Adopty

**Version MK1** - A comprehensive full-stack application for animal adoption, connecting animal shelters, potential adopters, and animal lovers.

## 🌟 Overview

Adopty is a multi-platform application designed to facilitate animal adoption processes. It provides a seamless experience across web and mobile platforms, allowing users to browse available animals, connect with shelters, and manage adoption workflows.

## ✨ Features

- **User Management**: Secure authentication and user profiles
- **Animal Database**: Comprehensive animal profiles with photos, breeds, species, and vaccination records
- **Shelter Management**: Shelter registration and management system
- **Photo Upload**: Cloud-based image storage for animal photos
- **Web Platform**: Responsive web application for desktop and mobile browsers
- **Mobile App**: Native mobile experience using React Native and Expo
- **API Backend**: RESTful API with authentication and data management
- **Workflow Automation**: Background job processing with Inngest

## 🛠 Tech Stack

### Backend
- **Node.js** (v20+)
- **Express.js** - Web framework
- **MySQL** - Database
- **Clerk** - Authentication
- **Cloudinary** - Image storage
- **Inngest** - Workflow engine
- **Multer** - File uploads

### Web Frontend
- **React 19** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **TanStack Query** - Data fetching
- **Axios** - HTTP client
- **Lucide React** - Icons

### Mobile App
- **React Native** - Mobile framework
- **Expo** - Development platform
- **TypeScript** - Type safety
- **Expo Router** - Navigation

## 🚀 Installation & Setup

### Prerequisites
- **Node.js**: Version 20.0.0 or higher
- **npm**: Comes with Node.js
- **MySQL**: Database server
- External services accounts:
  - [Clerk](https://clerk.com) for authentication
  - [Cloudinary](https://cloudinary.com) for image storage
  - [Inngest](https://inngest.com) for workflow automation

### Quick Setup

1. **Clone the repository**
```bash
   git clone https://github.com/Adopty-Org/adopty.git
   cd adopty
   ```

2. **Set up environment variables**

   Copy example files and fill in your credentials:

```bash
   # Backend
   cp backend/.env.example backend/.env

   # Web
   cp web/.env.example web/.env.local

   # Mobile
   cp mobile/.env.example mobile/.env
   ```

   Required environment variables:
   - **Backend**: Database credentials, Clerk API keys, Cloudinary credentials, Inngest signing key
   - **Web**: Clerk publishable key, API base URL
   - **Mobile**: Similar to web, plus Expo-specific configs

3. **Install dependencies**
```bash
   # Install all dependencies
   npm install --prefix backend
   npm install --prefix web
   npm install --prefix mobile
   ```

4. **Set up database**
   - Create a MySQL database named `adopty`
   - Update database credentials in `backend/.env`
   - Run any database migrations if available

## 🏃‍♂️ Running the Application

### Development Mode

**Start Backend Server** (Port 3000)
```bash
npm run dev --prefix backend
```

**Start Web Application** (Port 5173)
```bash
npm run dev --prefix web
```

**Start Mobile App**
```bash
npm start --prefix mobile
# Then choose platform: Android, iOS, or Web
```

### Production Build

**Build Web Application**
```bash
npm run build --prefix web
```

**Start Production Backend**
```bash
npm run start --prefix backend
```

## 📁 Project Structure

```text
adopty/
├── backend/           # Node.js/Express API server
│   ├── src/
│   │   ├── config/    # Configuration files
│   │   ├── controlleurs/ # Route handlers
│   │   ├── database/  # Database models/queries
│   │   ├── middleware/ # Custom middleware
│   │   ├── modeles/    # Data models
│   │   ├── routes/    # API routes
│   │   └── server.js  # Main server file
│   └── package.json
├── web/              # React web application
│   ├── src/
│   │   ├── components/ # Reusable components
│   │   ├── layouts/   # Page layouts
│   │   ├── lib/       # Utilities
│   │   ├── pages/     # Page components
│   │   └── App.jsx    # Main app component
│   └── package.json
├── mobile/           # React Native mobile app
│   ├── app/          # Expo Router pages
│   ├── components/   # UI components
│   ├── constants/    # App constants
│   ├── hooks/        # Custom hooks
│   └── package.json
└── package.json      # Root package.json
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

If you have any questions or need help, please open an issue on [GitHub](https://github.com/Adopty-Org/adopty/issues).

## 🙏 Acknowledgments

- Built with ❤️ for animal welfare
- Thanks to all contributors and the open-source community



backend/
├── sockets/
│   ├── chat.socket.js      ← Nouveau (propre)
│   └── typing.socket.js    ← Optionnel
├── dto/
│   ├── message.dto.js      ← Transforme Message → MessageDTO
│   └── conversation.dto.js
└── middleware/
    └── socket.auth.js      ← Auth Clerk pour Socket


frontend/src/
├── components/
│   ├── chat/
│   │   ├── ChatRoom.jsx        ← Nouveau
│   │   ├── MessageList.jsx
│   │   ├── MessageInput.jsx
│   │   └── ConversationList.jsx ← Nouveau (propre)
├── hooks/
│   ├── useSocket.js            ← Hook personnalisé
│   └── useChat.js              ← Logique chat
└── contexts/
    └── SocketContext.jsx       ← Provider Socket



    🚀 Plan d'attaque (par ordre)
Je te propose qu'on construise pas à pas, en validant chaque étape :

Étape 1 : DTO et transformation
Créer message.dto.js avec une fonction toMessageDTO(message, options).

Étape 2 : Socket Auth
Créer un middleware Socket propre avec Clerk.

Étape 3 : Socket Chat (back)
Implémenter join_conversation, send_message, mark_read avec callbacks.

Étape 4: Hook useSocket (front)
Hook React pour gérer la connexion, reconnexion, et les listeners.

Étape 5: Composant ChatRoom
Interface minimaliste mais fonctionnelle.

Étape 6: ConversationList
Liste des conversations avec messages non lus.

Étape 7: Typing indicator
Ajout du "en train d'écrire".


Fichier	Rôle	Pourquoi avant l'autre
SocketContext	Crée UNE SEULE instance de socket pour toute l'app	Sans lui, chaque composant créerait sa propre connexion
useSocket	Facilite l'accès au contexte	Évite de faire useContext(SocketContext) partout
useChat	Contient la logique (messages, envoi, historique)	Sépare la logique de l'affichage
ChatRoom	Affiche les messages	A besoin de useChat
ConversationList	Liste les conversations	Indépendant, peut venir après