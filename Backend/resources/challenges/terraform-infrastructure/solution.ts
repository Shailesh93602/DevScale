// Terraform infrastructure generator
// Produces complete HCL for VPC, subnets, compute, database, and security groups

function generateTerraformConfig(config: {
  region: string;
  vpcCidr: string;
  azCount: number;
  instanceType: string;
  dbEngine: string;
}): string {
  const { region, vpcCidr, azCount, instanceType, dbEngine } = config;
  const dbPort = dbEngine === "postgres" ? 5432 : 3306;

  return `terraform {
  required_providers {
    aws = { source = "hashicorp/aws", version = "~> 5.0" }
  }
}

provider "aws" { region = "${region}" }

variable "environment" { default = "production" }

data "aws_availability_zones" "available" { state = "available" }

locals {
  common_tags = {
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}

# --- Networking ---
resource "aws_vpc" "main" {
  cidr_block           = "${vpcCidr}"
  enable_dns_hostnames = true
  enable_dns_support   = true
  tags = merge(local.common_tags, { Name = "\${var.environment}-vpc" })
}

resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id
  tags   = merge(local.common_tags, { Name = "\${var.environment}-igw" })
}

resource "aws_subnet" "public" {
  count                   = ${azCount}
  vpc_id                  = aws_vpc.main.id
  cidr_block              = cidrsubnet("${vpcCidr}", 8, count.index + 1)
  availability_zone       = data.aws_availability_zones.available.names[count.index]
  map_public_ip_on_launch = true
  tags = merge(local.common_tags, { Name = "\${var.environment}-public-\${count.index + 1}" })
}

resource "aws_subnet" "private" {
  count             = ${azCount}
  vpc_id            = aws_vpc.main.id
  cidr_block        = cidrsubnet("${vpcCidr}", 8, count.index + 11)
  availability_zone = data.aws_availability_zones.available.names[count.index]
  tags = merge(local.common_tags, { Name = "\${var.environment}-private-\${count.index + 1}" })
}

resource "aws_eip" "nat" { domain = "vpc" }

resource "aws_nat_gateway" "main" {
  allocation_id = aws_eip.nat.id
  subnet_id     = aws_subnet.public[0].id
  tags = merge(local.common_tags, { Name = "\${var.environment}-nat" })
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }
}

resource "aws_route_table" "private" {
  vpc_id = aws_vpc.main.id
  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.main.id
  }
}

# --- Security Groups ---
resource "aws_security_group" "app" {
  name_prefix = "\${var.environment}-app-"
  vpc_id      = aws_vpc.main.id
  ingress { from_port = 80; to_port = 80; protocol = "tcp"; cidr_blocks = ["0.0.0.0/0"] }
  ingress { from_port = 443; to_port = 443; protocol = "tcp"; cidr_blocks = ["0.0.0.0/0"] }
  egress  { from_port = 0; to_port = 0; protocol = "-1"; cidr_blocks = ["0.0.0.0/0"] }
}

resource "aws_security_group" "db" {
  name_prefix = "\${var.environment}-db-"
  vpc_id      = aws_vpc.main.id
  ingress { from_port = ${dbPort}; to_port = ${dbPort}; protocol = "tcp"; security_groups = [aws_security_group.app.id] }
}

# --- Compute ---
resource "aws_launch_template" "app" {
  name_prefix   = "\${var.environment}-app-"
  image_id      = data.aws_ami.amazon_linux.id
  instance_type = "${instanceType}"
  vpc_security_group_ids = [aws_security_group.app.id]
}

resource "aws_autoscaling_group" "app" {
  desired_capacity    = ${azCount}
  max_size            = ${azCount * 3}
  min_size            = ${azCount}
  vpc_zone_identifier = aws_subnet.private[*].id
  launch_template { id = aws_launch_template.app.id; version = "$Latest" }
}

# --- Database ---
resource "aws_db_subnet_group" "main" {
  name       = "\${var.environment}-db"
  subnet_ids = aws_subnet.private[*].id
}

resource "aws_db_instance" "main" {
  engine               = "${dbEngine}"
  instance_class       = "db.t3.medium"
  allocated_storage    = 20
  db_subnet_group_name = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.db.id]
  multi_az             = true
  publicly_accessible  = false
  skip_final_snapshot  = true
  tags = merge(local.common_tags, { Name = "\${var.environment}-db" })
}

# --- Outputs ---
output "vpc_id" { value = aws_vpc.main.id }
output "public_subnet_ids" { value = aws_subnet.public[*].id }
output "private_subnet_ids" { value = aws_subnet.private[*].id }
output "db_endpoint" { value = aws_db_instance.main.endpoint }`;
}
