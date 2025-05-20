resource "aws_security_group" "load_balancer_sg" {
  name_prefix = "load_balancer_sg_"
  description = "Security group for EC2 instances"
  vpc_id      = aws_vpc.main.id

  # ingress {
  #   from_port   = 80
  #   to_port     = 80
  #   protocol    = "tcp"
  #   cidr_blocks = ["0.0.0.0/0"]
  # }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "load_balancer_sg"
  }
}

resource "aws_security_group" "webapp_sg" {
  name_prefix = "webapp_sg_"
  description = "Security group for EC2 instances"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port       = 22
    to_port         = 22
    protocol        = "tcp"
    security_groups = [aws_security_group.load_balancer_sg.id]
    //cidr_blocks     = cidrsubnet(var.vpc_cidr_block, var.subnet_mask_bits, count.index + 10)
    //cidr_blocks = ["0.0.0.0/0"]
    cidr_blocks = [var.vpc_cidr_block]
  }

  ingress {
    from_port       = 8000
    to_port         = 8000
    protocol        = "tcp"
    security_groups = [aws_security_group.load_balancer_sg.id]
    //cidr_blocks     = ["0.0.0.0/0"]
    cidr_blocks = [var.vpc_cidr_block]
  }

  egress {
    description = ""
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    self        = false
  }

  tags = {
    Name = "webapp_sg"
  }
}

# database server security group
resource "aws_security_group" "database_sg" {
  name_prefix = "database_sg_"
  description = "Security group for RDS instances"
  vpc_id      = aws_vpc.main.id

  # Verify that it only opens required ports and that the ingress source is set to the application security group.
  ingress {
    from_port       = 3306 # for MySQL/MariaDB, use 5432 for PostgreSQL
    to_port         = 3306 # for MySQL/MariaDB, use 5432 for PostgreSQL
    protocol        = "tcp"
    security_groups = [aws_security_group.webapp_sg.id]
    self            = false
  }

  tags = {
    Name = "database_sg"
  }
}

