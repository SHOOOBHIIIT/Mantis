import httpx
import os

url = "https://arxiv.org/pdf/1706.03762.pdf"
output = "../Transformer_Architecture_Manual.pdf"

print("Downloading Attention Is All You Need...")
try:
    with httpx.stream("GET", url, follow_redirects=True) as r:
        r.raise_for_status()
        with open(output, "wb") as f:
            for chunk in r.iter_bytes():
                f.write(chunk)
    print("Success! Manual downloaded.")
except Exception as e:
    print("Download failed:", e)
