import logging
import re
from app.core.exceptions import InvalidInputException

logger = logging.getLogger("scanvista.middleware.sanitizer")

class InputSanitizer:
    def __init__(self):
        # Basic patterns to detect XSS/HTML injections
        self.html_cleaner = re.compile(r"<[^>]*>")
        
        # High confidence prompt injection audit signals
        self.injection_signals = [
            r"ignore\s+previous\s+instructions",
            r"system\s+override",
            r"you\s+are\s+now\s+a",
            r"bypass\s+restrictions",
            r"acting\s+as\s+a",
            r"dan\s+mode",
            r"jailbreak",
            r"forget\s+everything",
            r"output\s+the\s+system\s+prompt"
        ]
        self.injection_regex = [re.compile(pattern, re.IGNORECASE) for pattern in self.injection_signals]

    def sanitize_text(self, text: str) -> str:
        """
        Cleans text, strips HTML tags, and throws InvalidInputException 
        if prompt injection indicators are triggered.
        """
        if not text:
            return ""

        # Check for active prompt injection attacks
        for regex in self.injection_regex:
            if regex.search(text):
                logger.warning(f"Potential prompt injection attack blocked in query: '{text[:100]}'")
                raise InvalidInputException(
                    "Security validation failed: The query contains elements associated with prompt manipulation."
                )

        # Strip standard HTML/XML tags
        clean_text = self.html_cleaner.sub("", text)
        
        # Clean extra spacing
        clean_text = " ".join(clean_text.split())
        return clean_text

input_sanitizer = InputSanitizer()
