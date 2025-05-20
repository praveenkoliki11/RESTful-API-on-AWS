resource "aws_subnet" "public_subnets" {
  count             = var.cnt
  vpc_id            = aws_vpc.main.id
  cidr_block        = cidrsubnet(var.vpc_cidr_block, var.subnet_mask_bits, count.index)
  availability_zone = element(data.aws_availability_zones.available_az.names, count.index)

  tags = {
    Name = "Public Subnet ${count.index + 1}"
  }
}
resource "aws_subnet" "private_subnets" {
  count             = var.cnt
  vpc_id            = aws_vpc.main.id
  cidr_block        = cidrsubnet(var.vpc_cidr_block, var.subnet_mask_bits, count.index + 10)
  availability_zone = element(data.aws_availability_zones.available_az.names, count.index)

  tags = {
    Name = "Private Subnet ${count.index + 1}"
  }
}
