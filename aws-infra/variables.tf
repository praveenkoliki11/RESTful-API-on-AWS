variable "profile" {
  type        = string
  description = "aws profile"
}

variable "region" {
  type        = string
  description = "aws region"
}

variable "ec2_key_pair" {
  type    = string
}

variable "vpc_cidr_block" {
  default = "10.0.0.0/16"
}

variable "subnet_mask_bits" {
  default = 8
}

variable "cnt" {
  default = 3
  # default  = length(data.aws_availability_zones.available_az.names)
}

variable "ami_id" {
  default = "xxx"
}

variable "domain_name" {
  type        = string
  description = "domain name"
}

variable "Hosted_zone_ID" {
  type        = string
  description = "Hosted zone ID"
}

variable "rds_password" {
  type = string
}

variable "ssl_certificate" {
  type    = string
}
