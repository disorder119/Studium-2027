#!/bin/sh
# Lokaler Start: http://localhost:8077
cd "$(dirname "$0")" && python3 -m http.server 8077
