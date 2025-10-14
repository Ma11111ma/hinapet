from __future__ import annotations

from typing import Any, Dict
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette import status
from sqlalchemy.exc import IntegrityError

def _error_response(code: str, detail: Any, status_code: int) -> JSONResponse:
    """
    統一エラー形式:
    {
      "error": "<機械可読コード>",
      "detail": <人間可読メッセージ or 配列>,
      "status": <HTTP status code>
    }
    """
    payload: Dict[str, Any] = {"error": code, "detail": detail, "status": status_code}
    return JSONResponse(status_code=status_code, content=payload)

async def _handle_http_exception(_: Request, exc: HTTPException) -> JSONResponse:
    detail = exc.detail if exc.detail else "HTTP error"
    return _error_response("http_error", detail, exc.status_code)

async def _handle_validation_error(_: Request, exc: RequestValidationError) -> JSONResponse:
    errors = exc.errors()
    return _error_response("validation_error", errors, status.HTTP_422_UNPROCESSABLE_ENTITY)

async def _handle_integrity_error(_: Request, exc: IntegrityError) -> JSONResponse:
    msg = str(exc.orig) if getattr(exc, "orig", None) else "Integrity constraint violation"
    return _error_response("integrity_error", msg, status.HTTP_400_BAD_REQUEST)

async def _handle_unexpected_error(_: Request, exc: Exception) -> JSONResponse:
    return _error_response("internal_error", "Unexpected server error", status.HTTP_500_INTERNAL_SERVER_ERROR)

def register_exception_handlers(app: FastAPI) -> None:
    app.add_exception_handler(HTTPException, _handle_http_exception)
    app.add_exception_handler(RequestValidationError, _handle_validation_error)
    app.add_exception_handler(IntegrityError, _handle_integrity_error)
    app.add_exception_handler(Exception, _handle_unexpected_error)
