sudo yum upgrade -y
sudo yum update -y
curl -sL https://rpm.nodesource.com/setup_16.x | sudo bash -
sudo yum install -y nodejs
sudo yum install mysql -y

# install mysql
# sudo yum -y install https://dev.mysql.com/get/mysql80-community-release-el7-5.noarch.rpm
# sudo yum -y install mysql-community-server
# sudo systemctl enable --now mysqld
# temp_password=$(sudo grep 'temporary password' /var/log/mysqld.log | awk '{print $NF}')
# new_password=iam_c0te_Beggy
# sudo mysql --connect-expired-password -u root -p"$temp_password" << EOF
# ALTER USER 'root'@'localhost' IDENTIFIED BY '$new_password';
# FLUSH PRIVILEGES;
# EOF

# mysql -u root -p"$new_password" -e "CREATE DATABASE CSYE6225webpp_db;"

# update permission and file ownership

unzip /home/ec2-user/webapp.zip -d /home/ec2-user/webapp
rm -rf /home/ec2-user/webapp.zip
chmod -R 755 /home/ec2-user/webapp

#install dependencies
cd /home/ec2-user/webapp
npm install

# setup autorun using Systemd
sudo cp /home/ec2-user/webapp/autorun_service/webapp.service /etc/systemd/system/webapp.service

sudo systemctl daemon-reload

sudo systemctl enable webapp.service



