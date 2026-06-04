import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.core.db import db
from app.core.exceptions import (
    ScanVistaException,
    scanvista_exception_handler,
    global_exception_handler
)
from app.api.v1.router import api_router

# Configure clean structured logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("scanvista.main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    """FastAPI lifecycle events: initializes connection pools on startup and releases on shutdown."""
    logger.info("Starting up ScanVista Product Intelligence Engine...")
    # Initialize connection pools
    await db.connect()
    yield
    logger.info("Shutting down ScanVista Product Intelligence Engine...")
    # Release connection pools
    await db.disconnect()

app = FastAPI(
    title="ScanVista Product Intelligence Engine",
    description="Layered Python FastAPI AI Service powering ScanVista's 3D, AR, and Voice capabilities.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middlewares
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Versioned API Routes
app.include_router(api_router, prefix="/api/ai")

# Register Exception Handlers
app.add_exception_handler(ScanVistaException, scanvista_exception_handler)
app.add_exception_handler(Exception, global_exception_handler)

@app.get("/health")
def health_check():
    """Simple service health probe endpoint."""
    return {
        "status": "OK", 
        "service": "ScanVista Product Intelligence Engine (FastAPI)",
        "database_connected": db.pool is not None
    }