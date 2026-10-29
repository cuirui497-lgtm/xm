#!/bin/zsh
cd "${0:A:h}"
/Users/cuirui/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3 -m http.server 4173 --bind 127.0.0.1
