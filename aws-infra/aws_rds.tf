# create RDS instance
resource "aws_db_instance" "csye6225_rds" {
  engine               = "mysql" // or "postgresql" depending on your preference
  engine_version       = "8.0.32"
  instance_class       = "db.t3.micro"
  allocated_storage    = 20
  storage_type         = "gp2"
  multi_az             = false
  publicly_accessible  = false
  identifier           = "csye6225"
  db_name              = "csye6225"
  username             = "csye6225"
  password             = var.rds_password
  parameter_group_name = aws_db_parameter_group.db_pg.name
  db_subnet_group_name = aws_db_subnet_group.rds_private_subnet_group.name
  skip_final_snapshot  = true

  #Database security group should be attached to this RDS instance
  vpc_security_group_ids = ["${aws_security_group.database_sg.id}"]

  storage_encrypted = true
  kms_key_id        = aws_kms_key.kms_rds.arn #encrypt the rds
}

resource "aws_db_parameter_group" "db_pg" {
  name   = "rds-pg"
  family = "mysql8.0" # or "postgres13" depending on your database version

  parameter {
    name  = "character_set_server"
    value = "utf8"
  }

  parameter {
    name  = "character_set_client"
    value = "utf8"
  }

  parameter {
    name  = "max_connections"
    value = "500"
  }

}




