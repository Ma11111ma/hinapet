from __future__ import annotations
import uuid
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp
from starlette.responses import Response

class RequestIDMiddleware(BaseHTTPMiddleware):
    """
    各リクエストに trace_id を付与し、レスポンスヘッダ x-trace-id にも出す。
    """
    def __init__(self, app: ASGIApp) -> None:
        super().__init__(app)

    async def dispatch(self, request, call_next):
        trace_id = uuid.uuid4().hex
        request.state.trace_id = trace_id
        response: Response = await call_next(request)
        response.headers["x-trace-id"] = trace_id
        return response
