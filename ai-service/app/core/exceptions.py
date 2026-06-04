from fastapi import Request
from fastapi.responses import JSONResponse
import logging

logger = logging.getLogger("scanvista.exceptions")

class ScanVistaException(Exception):
    """Base exception for ScanVista Product Intelligence Engine."""
    def __init__(self, message: str, status_code: int = 400):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)

class ProductNotFoundException(ScanVistaException):
    def __init__(self, product_id: str):
        super().__init__(f"Product with ID '{product_id}' was not found in the catalog.", 404)

class InvalidInputException(ScanVistaException):
    def __init__(self, message: str):
        super().__init__(message, 422)

class ServiceUnavailableException(ScanVistaException):
    def __init__(self, service_name: str):
        super().__init__(f"Service '{service_name}' is currently unavailable. Operating in degraded mode.", 503)

async def scanvista_exception_handler(request: Request, exc: ScanVistaException):
    logger.warning(f"ScanVistaException handled: {exc.message} (status: {exc.status_code})")
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": exc.__class__.__name__,
            "message": exc.message
        }
    )

async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled system exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": "InternalServerError",
            "message": "An unexpected error occurred in the Product Intelligence Engine."
        }
    )
