# kill running process if it exists
ps aux | grep "node index.js" | grep -vE grep |  awk '{print $2}' | xargs -r kill

# wait for some time
sleep 2

# start new process
RUNNER_TRACKING_ID="" && nohup node index.js > arl_d.log 2>&1 & echo $! > pid

if [ $? -ne 0 ]
then
  echo 'Deployment failed!!!'
  exit 1
fi

# create a hard symb link under /var/log so collector can collect it (if it doesnt exists)
sudo ls -li /var/log/arl_d.log
if [ $? -ne 0 ]
then
  sudo ln -v arl_d.log /var/log/arl_d.log && \
  echo 'Created /var/log/arl_d.log hard link'
fi

# show a completed message
echo "The deployment is complete"