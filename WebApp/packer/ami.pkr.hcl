variable "aws_region" {
  type    = string
  default = "us-east-1"
}

variable "source_ami" {
  type    = string
  default = "ami-0dfcb1ef8550277af" #in us-east-1
  # default = "ami-099effcf516c942b7" #in ca-central-1 
  # ami will be in your AWS CONSOLE-EC2-Images-AMI Catalog, use demo default vpc 
}

variable "ssh_username" {
  type    = string
  default = "ec2-user"
}

variable "subnet_id" {
  type    = string
  default = "subnet-0ec8c78cbf34815f9"
  #subnet in default vpc
}

variable "ami_users" {
  type    = list(string)
  default = []
}

source "amazon-ebs" "my-ami" {

  region          = "${var.aws_region}"
  ami_name        = "csye6225_${formatdate("YYYY_MM_DD_hh_mm_ss", timestamp())}"
  ami_description = "AMI for CSYE 6225"

  # access_key = var.access_key
  # secret_key = var.secret_key

  ami_users = var.ami_users

  ami_regions = [
    "us-east-1",
    // "us-east-2",
  ]

  aws_polling {
    delay_seconds = 120
    max_attempts  = 50
  }

  instance_type = "t2.micro"
  source_ami    = "${var.source_ami}"
  ssh_username  = "${var.ssh_username}"
  subnet_id     = "${var.subnet_id}"

  launch_block_device_mappings {
    delete_on_termination = true
    device_name           = "/dev/xvda"
    volume_size           = 8
    volume_type           = "gp2"
  }
}

build {
  sources = ["source.amazon-ebs.my-ami"]

  provisioner "file" {
    source      = "../webapp.zip"
    destination = "/home/ec2-user/webapp.zip"
  }

  provisioner "shell" {
    inline = [
      # Read the contents of the config.sh file here
      "${file("webapp_config.sh")}",
      "${file("cloudwatch_agent_config.sh")}",
      "echo 'Done.'"
    ]
  }
}
