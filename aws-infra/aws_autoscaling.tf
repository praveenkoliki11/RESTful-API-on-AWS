resource "aws_launch_template" "lt" {
  name_prefix   = "aws_launch_template_"
  image_id      = var.ami_id
  instance_type = "t2.micro"
  key_name      = aws_key_pair.ec2_key_pair.key_name

  network_interfaces {
    associate_public_ip_address = true
    security_groups             = [aws_security_group.webapp_sg.id]
    //subnet_id                   = [for subnet in aws_subnet.public_subnets : subnet.id]
  }
  user_data = base64encode(
    <<EOF
                  #!/bin/bash

                  echo "export DB_HOSTNAME=${aws_db_instance.csye6225_rds.address}" >> /home/ec2-user/webapp/.env
                  echo "export DB_USERNAME=${aws_db_instance.csye6225_rds.username}" >> /home/ec2-user/webapp/.env
                  echo "export DB_PASSWORD=${aws_db_instance.csye6225_rds.password}" >> /home/ec2-user/webapp/.env
                  echo "export DB_NAME=${aws_db_instance.csye6225_rds.db_name}" >> /home/ec2-user/webapp/.env
                  echo "export BUCKET_NAME=${aws_s3_bucket.private_bucket.bucket}" >> /home/ec2-user/webapp/.env
                  echo "BUCKET_REGION=${var.region}" >> /home/ec2-user/webapp/.env
                  
                  sudo chown ec2-user:ec2-user .env
                  sudo systemctl start webapp.service
                  
                  EOF
  )
  block_device_mappings {
    device_name = "/dev/xvda"

    ebs {
      delete_on_termination = true
      volume_type           = "gp2"
      volume_size           = 50 #EC2 instance must have a root volume larger than 8GB
      encrypted             = true
      kms_key_id            = aws_kms_key.kms_ebs.arn #encrypt the ebs
    }
  }

  iam_instance_profile {
    name = aws_iam_instance_profile.iam_profile.name
  }
  //vpc_security_group_ids = ["${aws_security_group.webapp_sg.id}"]
}

resource "aws_autoscaling_group" "asg" {
  name                = "csye6225-asg-spring2023"
  default_cooldown    = 60
  min_size            = 1
  max_size            = 3
  desired_capacity    = 1
  target_group_arns   = [aws_lb_target_group.alb_tg.arn]
  vpc_zone_identifier = [for subnet in aws_subnet.public_subnets : subnet.id]

  //load_balancers = [aws_lb.lb.id]

  enabled_metrics = [
    "GroupMinSize",
    "GroupMaxSize",
    "GroupDesiredCapacity",
    "GroupInServiceInstances",
    "GroupTotalInstances"
  ]

  launch_template {
    id      = aws_launch_template.lt.id
    version = "$Latest"
  }

  tag {
    key                 = "aws-autoscaling-group"
    value               = "CSYE6225-webapp"
    propagate_at_launch = true
  }
}

# Scale up policy when average CPU usage is above 5%. Increment by 1.
# Scale down policy when average CPU usage is below 3%. Decrement by 1.

resource "aws_autoscaling_policy" "scale_up" {
  name                   = "scale_up"
  scaling_adjustment     = 1
  adjustment_type        = "ChangeInCapacity"
  cooldown               = 60
  autoscaling_group_name = aws_autoscaling_group.asg.name
}

resource "aws_autoscaling_policy" "scale_down" {
  name                   = "scale_down"
  scaling_adjustment     = -1
  adjustment_type        = "ChangeInCapacity"
  cooldown               = 60
  autoscaling_group_name = aws_autoscaling_group.asg.name
}

resource "aws_cloudwatch_metric_alarm" "CPUAlarmHigh" {
  alarm_name          = "CPUAlarmHigh"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  period              = 60
  statistic           = "Average"
  threshold           = 5

  dimensions = {
    AutoScalingGroupName = aws_autoscaling_group.asg.name
  }

  alarm_description = "Scale-up if CPU > 5% for 60 seconds"
  alarm_actions = [
  aws_autoscaling_policy.scale_up.arn]
}

resource "aws_cloudwatch_metric_alarm" "CPUAlarmLow" {
  alarm_name          = "CPUAlarmLow"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = 2
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  period              = 60
  statistic           = "Average"
  threshold           = 3

  dimensions = {
    AutoScalingGroupName = aws_autoscaling_group.asg.name
  }

  alarm_description = "Scale-down if CPU < 3% for 60 seconds"
  alarm_actions = [
  aws_autoscaling_policy.scale_down.arn]
}
