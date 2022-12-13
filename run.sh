# kill running process if it exists
ps aux | grep "node index.js" | grep -vE grep |  awk '{print $2}' | xargs -r kill

sleep 3

# start new process
nohup node index.js > arl_d.log 2>&1 & echo $! > pid

echo "The deployment is complete"