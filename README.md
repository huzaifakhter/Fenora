# Files Exchange Network & Office Resources App (FENORA)

**Files Exchange Network & Office Resources App (FENORA)** is a lightweight, LAN-based collaboration tool designed for teams in an office or local network. It allows users to **share files, text/code snippets, and messages** in real-time, fully accessible to all connected team members. The app stores user activity, enables CRUD operations on shared resources, and maintains a simple login system using JSON storage.

---

## 🌟 Features

- **LAN-Based Access**: Host the server on one PC and access via LAN IP from other devices.
- **User Management**: Create users with username and password stored in a JSON file.
- **File Sharing**: Upload, download, and manage files across all connected users.
- **Messaging & Text Snippets**: Share messages, notes, and code snippets with syntax highlighting.
- **CRUD Operations**: Create, read, update, and delete shared resources.
- **Activity Logging**: Track which user performed which operation, visible to everyone.
- **Modern UI**: Sleek, responsive UI built with HTML/CSS, accessible in any browser.
- **Lightweight & Minimal**: No heavy frameworks required for the frontend.
- **JSON Data Storage**: All data stored in local JSON files for simplicity.
- **Optional AI Integration**: Easily extendable with AI-powered helpers for quick content suggestions.

---

## 🛠 Tech Stack

- **Backend**: FastAPI  
- **Server Runner**: Uvicorn / Astral UI  
- **Frontend**: HTML, CSS, Vanilla JS (no frontend frameworks)  
- **Data Storage**: JSON files  
- **Optional**: Python packages for file handling, syntax highlighting, etc.  

---

## ⚡ Installation

### Prerequisites
- Python 3.10 or higher
- pip installed
- LAN-connected devices for access

### Steps
1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/fenora.git
   cd fenora
