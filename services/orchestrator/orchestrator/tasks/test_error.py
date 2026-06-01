def _format_error(exc: Exception) -> str:
    msg = str(exc)
    msg_lower = msg.lower()
    
    # 429 Rate limits / Quota
    if "429" in msg_lower or "rate limit" in msg_lower or "quota" in msg_lower or "too many requests" in msg_lower:
        if "quota" in msg_lower or "insufficient_quota" in msg_lower:
            return "Your AI provider account has run out of quota or credits. Please check your billing dashboard and add funds if necessary."
        return "The AI provider is currently rate limiting our requests. Please wait a few moments and try again."
        
    # 401 / 403 API Key issues
    if "401" in msg_lower or "403" in msg_lower or "api key" in msg_lower or "unauthorized" in msg_lower:
        return "The provided API key is invalid or lacks the necessary permissions. Please update your AI settings with a valid key."
        
    # 500 / 503 Provider issues
    if "500" in msg_lower or "503" in msg_lower or "internal server error" in msg_lower or "service unavailable" in msg_lower:
        return "The AI provider's servers are currently experiencing issues or are overloaded. Please try again later."
        
    return f"An unexpected error occurred: {msg}"

print(_format_error(Exception("groq.GroqError: Error code: 429 - {'error': {'message': 'Rate limit reached for model `llama-3.3-70b-versatile`...'}}")))
print(_format_error(Exception("google.api_core.exceptions.ResourceExhausted: 429 Quota exceeded for quota metric...")))
