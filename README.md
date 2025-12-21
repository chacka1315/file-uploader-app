# File Uploader (a mini Google Drive)
A file upload and management web application built with Node.js, Express, and Prisma ORM, developed as part of The Odin Project Node.js curriculum. This project simulates a simple personal storage service where authenticated users can organize and upload files within folders. 

## 🚀 Project Summary
The File Uploader app allows users to:
- Authenticate and maintain user sessions
- Create and manage folders
- Upload files into specific folders
- View file details (name, size, upload time)
- Download uploaded files
- Share folders via generated links
The application uses **Prisma ORM** for interacting with the database and **Multer** for parsing file uploads. 

## 🎨 Live preview  ( Non-reponsive)
The server will take a few second to start as it'is deployed on free plan (Le serveur prendra un peu de temps pour demarer car l'app est deploye sur un plan gratuit de Render).
[See the apllication (Voir l'application)](https://file-uploader-9dnb.onrender.com/)

## ✨ Key Features & Concepts
1. 🗃️ User Authentication
- Auth based on Passport loaclStrategy
- Users must be authenticated to upload/manage files

2. 📁 Folder Management
- CRUD operations for folders
- Organize files within user folders

3. 📦 File Upload & Storage
- File uploads handled with Multer middleware
- Files are stored on Cloudinary

4. 📊 File Metadata & Views
- View details such as file name, size, and upload time
- Download files directly from the UI

5. 🧠 Prisma ORM & Database
- Database modeling and persistence with Prisma
- Use of migrations to define folder/file schema
- Queries and relations via ORM (instead of raw SQL) 

## 🧠 What I Learned
- This project pushed my backend skills forward by teaching me:
- How to integrate Prisma ORM in an Express app
- How to model related entities (folders and files) in a database
- How to handle multipart file uploads securely with Multer
- How to maintain user sessions and protect sensitive routes
- How to store and retrieve files and metadata in a backend service
- How to generate shareable links for folder access
Prisma’s ORM made database interactions clearer and safer compared to raw SQL — improving maintainability and reducing query boilerplate. 


## 📁 Project structure
```
.
├── README.md
├── app.js
├── config
│   ├── cloudinary.js
│   └── passport.js
├── controllers
│   ├── authController.js
│   ├── fileController.js
│   ├── folderController.js
│   ├── indexController.js
│   ├── shareController.js
│   └── uploadController.js
├── errors
│   ├── CustomErrors.js
│   └── CustomMulterError.js
├── eslint.config.js
├── middlewares
│   ├── auth.js
│   └── validations.js
├── package-lock.json
├── package.json
├── prisma
│   ├── client.js
│   ├── migrations
│   └── schema.prisma
├── prisma.config.ts
├── public
│   ├── empty_folder.png
│   ├── files_icons
│   ├── logo.svg
│   └── styles
├── routes
│   ├── authRouter.js
│   ├── fileRouter.js
│   ├── folderRouter.js
│   ├── indexRouter.js
│   ├── shareRouter.js
│   └── uploadRouter.js
├── uploads/   #Managing the uploads before they go to the cloud
└── views
    ├── pages/
    └── partials/
```
