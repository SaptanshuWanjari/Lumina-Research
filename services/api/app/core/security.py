from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from pydantic import BaseModel, ValidationError

from app.core.config import settings

security = HTTPBearer()


class TokenPayload(BaseModel):
    sub: str
    role: str = ""


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> TokenPayload:
    token = credentials.credentials
    try:
        # Supabase uses HS256 by default for its JWTs
        payload = jwt.decode(
            token,
            settings.SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            options={
                "verify_aud": False
            },  # Supabase tokens usually have aud="authenticated" but we can skip checking aud if we just care about signature
        )

        token_data = TokenPayload(**payload)

        # Optionally ensure it's an authenticated user from Supabase
        if token_data.role != "authenticated":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not an authenticated user",
            )

        return token_data
    except (JWTError, ValidationError) as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
