import logging
import re

logger = logging.getLogger("scanvista.middleware.validator")

class ResponseValidator:
    def __init__(self):
        # Scan for private internal XML system context delimiters in user-facing text
        self.leakage_tags = [
            r"<product_context>", r"</product_context>",
            r"<competitor_context>", r"</competitor_context>",
            r"<user_query>", r"</user_query>",
            r"system instructions", r"prompt boundaries"
        ]
        self.leakage_regex = [re.compile(pattern, re.IGNORECASE) for pattern in self.leakage_tags]

    def validate_and_clean_response(self, text: str) -> str:
        """
        Scans LLM output text for sensitive prompt leakages or delimiters.
        Strips leakages dynamically to ensure absolute prompt boundary safety.
        """
        if not text:
            return ""

        clean_text = text
        leaks_detected = False

        for regex in self.leakage_regex:
            if regex.search(clean_text):
                logger.warning(f"Detected internal prompt boundary leakage: '{regex.pattern}' in response.")
                # Dynamically strip the leaked delimiter tag/reference
                clean_text = regex.sub("", clean_text)
                leaks_detected = True

        if leaks_detected:
            clean_text = " ".join(clean_text.split())
            logger.info("Successfully cleansed response text of system delimiters.")

        return clean_text

response_validator = ResponseValidator()
