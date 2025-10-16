from __future__ import annotations

from typing import Any, Dict, Optional
from pydantic import BaseModel, Field
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette import status
from sqlalchemy.exc import IntegrityError

# === ここが追加（同居でOK）=========================
class ErrorResponse(BaseModel):
    error: str = Field(..., description="Stable error code, e.g. 'validation_error'")
    detail: Any = Field(..., description="Human-readable detail or validation errors")
    status: int = Field(..., description="HTTP status code")
    trace_id: Optional[str] = Field(None, description="Trace ID per request")
# ===================================================

def _get_trace_id(req: Request) -> Optional[str]:
    return getattr(req.state, "trace_id", None)

def _error_response(code: str, detail: Any, status_code: int, trace_id: Optional[str]) -> JSONResponse:
    payload: Dict[str, Any] = {"error": code, "detail": detail, "status": status_code}
    if trace_id:
        payload["trace_id"] = trace_id
    return JSONResponse(status_code=status_code, content=payload)

async def _handle_http_exception(req: Request, exc: HTTPException) -> JSONResponse:
    detail = exc.detail if exc.detail else "HTTP error"
    return _error_response("http_error", detail, exc.status_code, _get_trace_id(req))

async def _handle_validation_error(req: Request, exc: RequestValidationError) -> JSONResponse:
    errors = exc.errors()
    return _error_response("validation_error", errors, status.HTTP_422_UNPROCESSABLE_ENTITY, _get_trace_id(req))

async def _handle_integrity_error(req: Request, exc: IntegrityError) -> JSONResponse:
    msg = str(exc.orig) if getattr(exc, "orig", None) else "Integrity constraint violation"
    return _error_response("integrity_error", msg, status.HTTP_400_BAD_REQUEST, _get_trace_id(req))

async def _handle_unexpected_error(req: Request, exc: Exception) -> JSONResponse:
    return _error_response("internal_error", "Unexpected server error", status.HTTP_500_INTERNAL_SERVER_ERROR, _get_trace_id(req))

def register_exception_handlers(app: FastAPI) -> None:
    app.add_exception_handler(HTTPException, _handle_http_exception)
    app.add_exception_handler(RequestValidationError, _handle_validation_error)
    app.add_exception_handler(IntegrityError, _handle_integrity_error)
    app.add_exception_handler(Exception, _handle_unexpected_error)
