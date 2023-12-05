# SSH helpers
## SSH Port Forwarding

1. ssh into machine
2. sudo nano /etc/ssh/sshd_config
3. set => GatewayPorts yes 
4. save and sudo service ssh restart
5. ssh -L outport:insideid:insideport user@machine

now you'll see ssh terminal open this means port forwarding active