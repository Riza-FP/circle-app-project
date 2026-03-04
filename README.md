<div align="center">
  <h1 align="center">Circle</h1>
  <p align="center">
    A Full-Stack Social Media Platform built with modern web technologies.
  </p>
</div>

<br />

## Visual Showcase

### Desktop Experience
| Home Feed | User Profile |
|:---:|:---:|
| <img src="./Screenshots/Home%20Page.png" width="400" /> | <img src="./Screenshots/Profile%20Page.png" width="400" /> |

| Thread Search | Who to Follow |
|:---:|:---:|
| <img src="./Screenshots/Search%20Page.png" width="400" /> | <img src="./Screenshots/Follows%20Page.png" width="400" /> |

| Thread Details |
|:---:|
| <img src="./Screenshots/Thread%20Detail%20Page.png" width="800" /> |

### Mobile Experience (Fully Responsive)
<p align="center">
  <img src="./Screenshots/Mobile%20Home%20Page.jpg" width="300" />
  &nbsp;&nbsp;&nbsp;&nbsp;
  <img src="./Screenshots/Mobile%20Profile%20Page.jpg" width="300" />
</p>

---

## Features

- **Rich Threads**: Create posts with text and image attachments. Support for inline replies.
- **Real-Time Synergy**: Uses WebSockets to instantly broadcast new threads, likes, and deletions across all connected clients.
- **Responsive Design**: Flawless scaling from Desktop (Sidebar) down to Mobile devices (custom Bottom Navigation bar).
- **User Engagement**: Follow/unfollow users, like threads, and discover new content via real-time search.
- **Profile Customization**: Users can edit their bio, name, avatar, and background cover photos.

## Tech Stack

**Frontend**
- **React.js & Vite**: Lightning fast modern UI rendering.
- **TypeScript**: Strict type definitions catching errors at compile time.
- **Redux Toolkit**: Centralized state management for Authentication and Posts.
- **Tailwind CSS**: Utility-first CSS framework for powerful responsive styling.
- **Lucide Icons**: Beautiful, scalable SVG icons.

**Backend**
- **Node.js & Express**: Robust and scalable routing infrastructure.
- **Prisma ORM**: Strongly typed database querying abstraction.
- **PostgreSQL**: Relational database serving as the main system of record.
- **Redis & WebSockets**: Used concurrently for caching intense feed queries and dispatching real-time updates.
- **JWT Authentication**: Secure stateless session validation.
- **Multer**: Handling multi-part data for image uploads.

---

## Getting Started Locally

### Prerequisites
- Node.js (v18+)
- PostgreSQL Database
- Redis Server (Optional, but recommended)

### 1. Clone the repository
```bash
git clone https://github.com/your-username/circle-app-project.git
cd circle-app-project
```

### 2. Backend Setup
Navigate into the backend and install dependencies:
```bash
cd Backend
npm install
```

Create a `.env` file based on the example and fill in your DB credentials:
```bash
cp .env.example .env
```

Sync the Prisma schema to your local database and run the seeds (creates dummy users/threads):
```bash
npx prisma db push
npx prisma generate
npx prisma db seed
```

Start the backend server:
```bash
npm run dev
```

### 3. Frontend Setup
In a new terminal, navigate to the frontend:
```bash
cd Frontend
npm install
```

Create a `.env` file pointing to your backend:
```bash
cp .env.example .env
```
*(Ensure `VITE_API_URL` is set to `http://localhost:5000`)*

Start the Vite development server:
```bash
npm run dev
```

Visit `http://localhost:5173` to interact with Circle locally!

---

## Built for Production

This application is structurally engineered to be seamlessly deployed onto modern PaaS environments:
- The **Frontend** can be reliably served statically via **Vercel** (`npm run build`).
- The **Backend** is compiled to JavaScript (`npx tsc`) and uses absolute path serving to run in Node environments like **Railway**.
- Environment variables cleanly govern cross-origin data flow (CORS, Client URLs).
