# scenarios: one plan per mode; args: label name scenarios langs views modes
walkset() { local label=$1 name=$2 scn=$3 langs=$4 views=$5 modes=$6 m; for m in ${(s:,:)modes}; do node vh217-driver.mjs walk --walker "$WALKER" --label "$label" --name "$name-$m" --scenarios "$scn" --langs "$langs" --views "$views" --modes "$m" || echo "driver exit $? $m"; done; }
