from fastapi import FastAPI, Request, Form, UploadFile, File, HTTPException, Depends
from fastapi.responses import HTMLResponse, RedirectResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.security import HTTPBasic, HTTPBasicCredentials
import uvicorn
import json
import os
import hashlib
import secrets
from datetime import datetime
from typing import Optional, List
import threading
import shutil
from pathlib import Path

# Initialize FastAPI app
app = FastAPI(
    title="TeamConnect - LAN Resource Sharing",
    description="Share files, code snippets, and messages across your local network",
    version="1.0.0"
)

# Configure static files and templates
app.mount("/static", StaticFiles(directory="static"), name="static")
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
templates = Jinja2Templates(directory="templates")

# Security
security = HTTPBasic()

# Global lock for JSON file operations
json_lock = threading.Lock()

# Data file paths
DATA_DIR = Path("data")
DATA_DIR.mkdir(exist_ok=True)

USERS_FILE = DATA_DIR / "users.json"
FILES_FILE = DATA_DIR / "files.json" 
SNIPPETS_FILE = DATA_DIR / "snippets.json"
MESSAGES_FILE = DATA_DIR / "messages.json"
ACTIVITY_LOG_FILE = DATA_DIR / "activity_log.json"

# Initialize data files if they don't exist
def init_data_files():
    """Initialize JSON data files with default structure"""
    
    # Users file - create admin user by default
    if not USERS_FILE.exists():
        admin_password = hashlib.sha256("admin".encode()).hexdigest()
        users_data = {
            "admin": {
                "password_hash": admin_password,
                "is_admin": True,
                "created_at": datetime.now().isoformat(),
                "last_login": None
            }
        }
        save_json(USERS_FILE, users_data)
    
    # Other data files
    for file_path in [FILES_FILE, SNIPPETS_FILE, MESSAGES_FILE, ACTIVITY_LOG_FILE]:
        if not file_path.exists():
            if file_path == ACTIVITY_LOG_FILE:
                save_json(file_path, [])  # Activity log is a list
            else:
                save_json(file_path, {})  # Others are dictionaries

def load_json(file_path: Path):
    """Safely load JSON data with file locking"""
    with json_lock:
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            return {} if file_path != ACTIVITY_LOG_FILE else []

def save_json(file_path: Path, data):
    """Safely save JSON data with file locking"""
    with json_lock:
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)

def log_activity(username: str, operation: str, resource_name: str, resource_type: str):
    """Log user activity to the activity log"""
    activity_log = load_json(ACTIVITY_LOG_FILE)
    
    log_entry = {
        "username": username,
        "operation": operation,
        "resource_name": resource_name,
        "resource_type": resource_type,
        "timestamp": datetime.now().isoformat()
    }
    
    activity_log.append(log_entry)
    save_json(ACTIVITY_LOG_FILE, activity_log)

# Initialize data on startup
init_data_files()

# Session management (simple in-memory for demo)
active_sessions = {}

def create_session(username: str) -> str:
    """Create a new session for user"""
    session_id = secrets.token_urlsafe(32)
    active_sessions[session_id] = {
        "username": username,
        "created_at": datetime.now().isoformat()
    }
    return session_id

def get_current_user(request: Request) -> Optional[str]:
    """Get current logged in user from session"""
    session_id = request.cookies.get("session_id")
    if session_id and session_id in active_sessions:
        return active_sessions[session_id]["username"]
    return None

def verify_user(username: str, password: str) -> bool:
    """Verify user credentials"""
    users = load_json(USERS_FILE)
    if username in users:
        password_hash = hashlib.sha256(password.encode()).hexdigest()
        return users[username]["password_hash"] == password_hash
    return False

def is_admin(username: str) -> bool:
    """Check if user is admin"""
    users = load_json(USERS_FILE)
    return users.get(username, {}).get("is_admin", False)

@app.get("/", response_class=HTMLResponse)
async def root(request: Request):
    """Home page - redirect to dashboard if logged in, otherwise to login"""
    current_user = get_current_user(request)
    if current_user:
        return RedirectResponse(url="/dashboard", status_code=302)
    return RedirectResponse(url="/login", status_code=302)

@app.get("/login", response_class=HTMLResponse)
async def login_page(request: Request):
    """Login page"""
    return templates.TemplateResponse("login.html", {"request": request})

@app.post("/login")
async def login(request: Request, username: str = Form(...), password: str = Form(...)):
    """Handle login form submission"""
    if verify_user(username, password):
        # Update last login
        users = load_json(USERS_FILE)
        users[username]["last_login"] = datetime.now().isoformat()
        save_json(USERS_FILE, users)
        
        # Create session
        session_id = create_session(username)
        
        # Log activity
        log_activity(username, "login", "system", "authentication")
        
        response = RedirectResponse(url="/dashboard", status_code=302)
        response.set_cookie(key="session_id", value=session_id, httponly=True)
        return response
    else:
        return templates.TemplateResponse("login.html", {
            "request": request, 
            "error": "Invalid username or password"
        })

@app.get("/logout")
async def logout(request: Request):
    """Logout user"""
    session_id = request.cookies.get("session_id")
    if session_id and session_id in active_sessions:
        username = active_sessions[session_id]["username"]
        del active_sessions[session_id]
        log_activity(username, "logout", "system", "authentication")
    
    response = RedirectResponse(url="/login", status_code=302)
    response.delete_cookie(key="session_id")
    return response

@app.get("/dashboard", response_class=HTMLResponse)
async def dashboard(request: Request):
    """Main dashboard page"""
    current_user = get_current_user(request)
    if not current_user:
        return RedirectResponse(url="/login", status_code=302)
    
    # Load all data for dashboard
    files_data = load_json(FILES_FILE)
    snippets_data = load_json(SNIPPETS_FILE)
    messages_data = load_json(MESSAGES_FILE)
    activity_log = load_json(ACTIVITY_LOG_FILE)
    
    # Get recent activity (last 10 entries)
    recent_activity = sorted(activity_log, key=lambda x: x['timestamp'], reverse=True)[:10]
    
    return templates.TemplateResponse("dashboard.html", {
        "request": request,
        "current_user": current_user,
        "is_admin": is_admin(current_user),
        "files": files_data,
        "snippets": snippets_data,
        "messages": messages_data,
        "recent_activity": recent_activity
    })

@app.get("/upload", response_class=HTMLResponse)
async def upload_page(request: Request):
    """File upload page"""
    current_user = get_current_user(request)
    if not current_user:
        return RedirectResponse(url="/login", status_code=302)
    
    return templates.TemplateResponse("upload.html", {
        "request": request,
        "current_user": current_user
    })

@app.post("/upload")
async def upload_file(request: Request, file: UploadFile = File(...)):
    """Handle file upload"""
    current_user = get_current_user(request)
    if not current_user:
        return RedirectResponse(url="/login", status_code=302)
    
    # Create unique filename
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    file_extension = Path(file.filename).suffix
    unique_filename = f"{timestamp}_{secrets.token_hex(8)}{file_extension}"
    file_path = Path("uploads") / unique_filename
    
    # Save file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Save file metadata
    files_data = load_json(FILES_FILE)
    file_id = secrets.token_hex(16)
    
    files_data[file_id] = {
        "original_name": file.filename,
        "stored_name": unique_filename,
        "uploaded_by": current_user,
        "upload_date": datetime.now().isoformat(),
        "file_size": file_path.stat().st_size,
        "content_type": file.content_type or "application/octet-stream"
    }
    
    save_json(FILES_FILE, files_data)
    
    # Log activity
    log_activity(current_user, "upload", file.filename, "file")
    
    return RedirectResponse(url="/dashboard", status_code=302)

@app.get("/code", response_class=HTMLResponse)
async def code_page(request: Request):
    """Code snippet posting page"""
    current_user = get_current_user(request)
    if not current_user:
        return RedirectResponse(url="/login", status_code=302)
    
    return templates.TemplateResponse("code.html", {
        "request": request,
        "current_user": current_user
    })

@app.post("/code")
async def post_code(
    request: Request,
    title: str = Form(...),
    code: str = Form(...),
    language: str = Form(default="text")
):
    """Handle code snippet posting"""
    current_user = get_current_user(request)
    if not current_user:
        return RedirectResponse(url="/login", status_code=302)
    
    snippets_data = load_json(SNIPPETS_FILE)
    snippet_id = secrets.token_hex(16)
    
    snippets_data[snippet_id] = {
        "title": title,
        "code": code,
        "language": language,
        "posted_by": current_user,
        "created_at": datetime.now().isoformat(),
        "modified_at": datetime.now().isoformat()
    }
    
    save_json(SNIPPETS_FILE, snippets_data)
    
    # Log activity
    log_activity(current_user, "create", title, "code_snippet")
    
    return RedirectResponse(url="/dashboard", status_code=302)

@app.post("/message")
async def post_message(
    request: Request,
    message: str = Form(...)
):
    """Handle message posting"""
    current_user = get_current_user(request)
    if not current_user:
        return RedirectResponse(url="/login", status_code=302)
    
    messages_data = load_json(MESSAGES_FILE)
    message_id = secrets.token_hex(16)
    
    messages_data[message_id] = {
        "content": message,
        "posted_by": current_user,
        "created_at": datetime.now().isoformat()
    }
    
    save_json(MESSAGES_FILE, messages_data)
    
    # Log activity
    log_activity(current_user, "create", f"Message: {message[:50]}...", "message")
    
    return RedirectResponse(url="/dashboard", status_code=302)

@app.get("/admin", response_class=HTMLResponse)
async def admin_page(request: Request):
    """Admin user management page"""
    current_user = get_current_user(request)
    if not current_user or not is_admin(current_user):
        raise HTTPException(status_code=403, detail="Admin access required")
    
    users_data = load_json(USERS_FILE)
    activity_log = load_json(ACTIVITY_LOG_FILE)
    
    return templates.TemplateResponse("admin.html", {
        "request": request,
        "current_user": current_user,
        "users": users_data,
        "activity_log": sorted(activity_log, key=lambda x: x['timestamp'], reverse=True)[:50]
    })

@app.post("/admin/create_user")
async def create_user(
    request: Request,
    username: str = Form(...),
    password: str = Form(...),
    admin_privileges: bool = Form(default=False)
):
    """Create new user (admin only)"""
    current_user = get_current_user(request)
    if not current_user or not is_admin(current_user):
        raise HTTPException(status_code=403, detail="Admin access required")
    
    users_data = load_json(USERS_FILE)
    
    if username in users_data:
        return templates.TemplateResponse("admin.html", {
            "request": request,
            "current_user": current_user,
            "users": users_data,
            "error": f"User '{username}' already exists"
        })
    
    password_hash = hashlib.sha256(password.encode()).hexdigest()
    users_data[username] = {
        "password_hash": password_hash,
        "is_admin": admin_privileges,
        "created_at": datetime.now().isoformat(),
        "last_login": None
    }
    
    save_json(USERS_FILE, users_data)
    
    # Log activity
    log_activity(current_user, "create", username, "user")
    
    return RedirectResponse(url="/admin", status_code=302)

@app.delete("/file/{file_id}")
async def delete_file(request: Request, file_id: str):
    """Delete file (AJAX endpoint)"""
    current_user = get_current_user(request)
    if not current_user:
        return JSONResponse({"error": "Not authenticated"}, status_code=401)
    
    files_data = load_json(FILES_FILE)
    
    if file_id not in files_data:
        return JSONResponse({"error": "File not found"}, status_code=404)
    
    file_info = files_data[file_id]
    
    # Check if user can delete (owner or admin)
    if file_info["uploaded_by"] != current_user and not is_admin(current_user):
        return JSONResponse({"error": "Permission denied"}, status_code=403)
    
    # Delete physical file
    file_path = Path("uploads") / file_info["stored_name"]
    if file_path.exists():
        file_path.unlink()
    
    # Remove from metadata
    del files_data[file_id]
    save_json(FILES_FILE, files_data)
    
    # Log activity
    log_activity(current_user, "delete", file_info["original_name"], "file")
    
    return JSONResponse({"success": True})

@app.delete("/snippet/{snippet_id}")
async def delete_snippet(request: Request, snippet_id: str):
    """Delete code snippet (AJAX endpoint)"""
    current_user = get_current_user(request)
    if not current_user:
        return JSONResponse({"error": "Not authenticated"}, status_code=401)
    
    snippets_data = load_json(SNIPPETS_FILE)
    
    if snippet_id not in snippets_data:
        return JSONResponse({"error": "Snippet not found"}, status_code=404)
    
    snippet_info = snippets_data[snippet_id]
    
    # Check if user can delete (owner or admin)
    if snippet_info["posted_by"] != current_user and not is_admin(current_user):
        return JSONResponse({"error": "Permission denied"}, status_code=403)
    
    # Remove snippet
    del snippets_data[snippet_id]
    save_json(SNIPPETS_FILE, snippets_data)
    
    # Log activity
    log_activity(current_user, "delete", snippet_info["title"], "code_snippet")
    
    return JSONResponse({"success": True})

if __name__ == "__main__":
    print("Starting TeamConnect LAN Resource Sharing Server...")
    print("Server will be accessible at http://0.0.0.0:8000")
    print("Default admin credentials: admin / admin")
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
