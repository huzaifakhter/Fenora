# Files Exchange Network & Office Resources App (Fenora)

**Files Exchange Network & Office Resources App (Fenora)** is a lightweight, LAN-based collaboration tool designed for teams in an office or local network. It allows users to **share files, text/code snippets, and messages** in real-time, fully accessible to all connected team members. The app stores user activity, enables CRUD operations on shared resources, and maintains a simple login system using JSON storage.

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
- **Server**: Uvicorn
- **Frontend**: HTML, CSS, Vanilla JS (no frontend frameworks)  
- **Data Storage**: JSON files  
- **Optional**: Python packages for file handling, syntax highlighting, etc.  

---

## ⚡ Installation

### Prerequisites
- Python 3.10 or higher
- Astral UV
- LAN-connected devices for access

### Steps
1. **Clone the repository**
   ```bash
   git clone https://github.com/huzaifakhter/fenora.git
   cd fenora
   ```
2. **Run the batch file**
   ```bash
   run.bat
   ```
   This will ***sync*** the environment and install all the stuff used for **Fenora** to work.

3. **Access The App**
   ```bash
   Access Link: http://xx.xxx.xx.xxx:8000 - Share This Link With Your Teammates On The Same Network
   ```
   Now, anyone connected to the same network as the host computer can access the app in browser.
   
If you are not using uv, simply run:

``pip install -r requirements.txt
``

Then start the server from the root directory with:

``uvicorn main:app --host 0.0.0.0 --port 8000
``

This ensures your app is accessible to others on the same network. The ``--host 0.0.0.0`` option allows connections from any device on the network, and ``--port 8000`` sets the port.