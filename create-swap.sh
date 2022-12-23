fallocate -l 4G /swapfile
chmod 600 /swapfile
mkswap  /swapfile
swapon /swapfile
swapon  --show
free -h