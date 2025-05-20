resource "aws_lb" "lb" {

  name               = "csye6225-lb"
  internal           = false
  security_groups    = [aws_security_group.load_balancer_sg.id]
  load_balancer_type = "application"
  subnets            = [for subnet in aws_subnet.public_subnets : subnet.id]
  ip_address_type    = "ipv4"

  tags = {
    Application = "WebApp-loadbalancer"
  }

}

resource "aws_lb_target_group" "alb_tg" {

  name        = "csye6225-lb-alb-tg"
  target_type = "instance"
  port        = "8000"
  protocol    = "HTTP"
  vpc_id      = aws_vpc.main.id

  health_check {
    healthy_threshold   = 2
    unhealthy_threshold = 2
    timeout             = 3
    interval            = 30
    matcher             = "200"
    protocol            = "HTTP"
    port                = "8000"
  }

}

resource "aws_lb_listener" "front_end" {
  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.alb_tg.arn
  }
  load_balancer_arn = aws_lb.lb.arn
  port              = "443"
  protocol          = "HTTPS"
  # ssl_policy        = "ELBSecurityPolicy-2016-08"
  certificate_arn = var.ssl_certificate
}

