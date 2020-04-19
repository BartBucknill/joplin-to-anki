#!/bin/bash
# For use on Mac: start Joplin, Anki and run jta sync
open -j -a Anki \
&& open -j -a Joplin \
&& sleep 5 \
&& jta run
