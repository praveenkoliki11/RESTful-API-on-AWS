# Install cloudwatch-agent 
sudo yum install -y amazon-cloudwatch-agent

# Config cloudwatch-agent 
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a fetch-config -m ec2 -c file:/home/ec2-user/webapp/autorun_service/cloudwatch_config.json -s
# # setup autorun using Systemd
# sudo cp /home/ec2-user/webapp/autorun_service/cloudwatch_agent.service /etc/systemd/system/cloudwatch_agent.service

# sudo systemctl daemon-reload

# sudo systemctl enable cloudwatch_agent.service
