provider "aws" {
  profile = var.profile
  region  = var.region
}

# Create the VPC
resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"

  tags = {
    Name = "Project VPC"
  }
}

# Create a Public Subnets

data "aws_availability_zones" "available_az" {
  state = "available"

  filter {
    name   = "region-name"
    values = [var.region]
  }
}

#  Create Internet Gateway and attach it to VPC
resource "aws_internet_gateway" "gw" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "Project VPC InternetGateway"
  }
}

# Route table for Public Subnet's
resource "aws_route_table" "PublicRT" { # Creating RT for Public Subnet
  vpc_id = aws_vpc.main.id
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.gw.id
  }

  tags = {
    Name = "Public Route Table"
  }
}

# Route table for Private Subnet's
resource "aws_route_table" "PrivateRT" { # Creating RT for Private Subnet
  vpc_id = aws_vpc.main.id
  tags = {
    Name = "Private Route Table"
  }
}

# Route table Association with Public Subnet's
resource "aws_route_table_association" "public_subnet_asso" {
  count          = var.cnt
  subnet_id      = element(aws_subnet.public_subnets[*].id, count.index)
  route_table_id = aws_route_table.PublicRT.id
}

# Route table Association with Private Subnet's
resource "aws_route_table_association" "private_subnet_asso" {
  count          = var.cnt
  subnet_id      = element(aws_subnet.private_subnets[*].id, count.index)
  route_table_id = aws_route_table.PrivateRT.id
}

resource "aws_db_subnet_group" "rds_private_subnet_group" {
  name       = "private-subnet-group"
  subnet_ids = aws_subnet.private_subnets.*.id

  tags = {
    Name = "RDS private subnet group"
  }

}
resource "aws_key_pair" "ec2_key_pair" {
  key_name   = "ec2"
  public_key = var.ec2_key_pair
}

# create aws_instance
# resource "aws_instance" "webapp" {
#   ami                         = var.ami_id
#   instance_type               = "t2.micro"
#   subnet_id                   = aws_subnet.public_subnets[1].id
#   vpc_security_group_ids      = ["${aws_security_group.webapp_sg.id}"]
#   associate_public_ip_address = true
#   iam_instance_profile        = aws_iam_instance_profile.iam_profile.name
#   key_name                    = aws_key_pair.ec2_key_pair.key_name

#   root_block_device {
#     delete_on_termination = true
#     volume_type           = "gp2"
#     volume_size           = 50 #EC2 instance must have a root volume larger than 8GB
#   }
#   # Database username, password, hostname, and S3 bucket name should be passed to the web application using user dataLinks to an external site..
#   user_data = <<EOF
#                   #!/bin/bash

#                   echo "export DB_HOSTNAME=${aws_db_instance.csye6225_rds.address}" >> /home/ec2-user/webapp/.env
#                   echo "export DB_USERNAME=${aws_db_instance.csye6225_rds.username}" >> /home/ec2-user/webapp/.env
#                   echo "export DB_PASSWORD=${aws_db_instance.csye6225_rds.password}" >> /home/ec2-user/webapp/.env
#                   echo "export DB_NAME=${aws_db_instance.csye6225_rds.db_name}" >> /home/ec2-user/webapp/.env
#                   echo "export BUCKET_NAME=${aws_s3_bucket.private_bucket.bucket}" >> /home/ec2-user/webapp/.env
#                   echo "BUCKET_REGION=${var.region}" >> /home/ec2-user/webapp/.env

#                   sudo systemctl start webapp.service
#                   sudo systemctl start cloudwatch_agent.service
#                   EOF
#   tags = {
#     Name = "webapp-instance"
#   }
# }

resource "aws_route53_record" "www" {
  zone_id = var.Hosted_zone_ID
  name    = var.domain_name
  type    = "A"
  # ttl     = 60
  alias {
    name                   = aws_lb.lb.dns_name
    zone_id                = aws_lb.lb.zone_id
    evaluate_target_health = true
  }

  depends_on = [
    aws_lb.lb
  ]
}
