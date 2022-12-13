# kill running process if it exists
ps aux | grep "node index.js" | grep -vE grep |  awk '{print $2}' | xargs -r kill

sleep 2

# start new process
RUNNER_TRACKING_ID="" && nohup node index.js > arl_d.log 2>&1 & echo $! > pid
echo "The deployment is complete"