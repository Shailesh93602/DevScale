# Editorial -- Infrastructure as Code with Terraform

## Problem Summary

Generate a complete Terraform configuration for a production AWS infrastructure including VPC networking, compute (ASG), database (RDS), and security groups.

---

## Approach -- Modular Terraform Configuration

### Step 1: Provider and Variables

```hcl
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.region
}

variable "region" { default = "us-east-1" }
variable "vpc_cidr" { default = "10.0.0.0/16" }
variable "az_count" { default = 3 }
variable "instance_type" { default = "t3.medium" }
variable "db_engine" { default = "postgres" }
variable "environment" { default = "production" }
```

### Step 2: Networking

```hcl
data "aws_availability_zones" "available" {
  state = "available"
}

resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true
  tags = { Name = "${var.environment}-vpc" }
}

resource "aws_subnet" "public" {
  count                   = var.az_count
  vpc_id                  = aws_vpc.main.id
  cidr_block              = cidrsubnet(var.vpc_cidr, 8, count.index + 1)
  availability_zone       = data.aws_availability_zones.available.names[count.index]
  map_public_ip_on_launch = true
  tags = { Name = "${var.environment}-public-${count.index + 1}" }
}

resource "aws_subnet" "private" {
  count             = var.az_count
  vpc_id            = aws_vpc.main.id
  cidr_block        = cidrsubnet(var.vpc_cidr, 8, count.index + 11)
  availability_zone = data.aws_availability_zones.available.names[count.index]
  tags = { Name = "${var.environment}-private-${count.index + 1}" }
}
```

### Step 3: Security Groups

```hcl
resource "aws_security_group" "app" {
  name_prefix = "${var.environment}-app-"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group" "db" {
  name_prefix = "${var.environment}-db-"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.app.id]
  }
}
```

---

## Key Concepts

- **cidrsubnet()**: Dynamically compute subnet CIDRs from VPC CIDR
- **count vs for_each**: Use count for indexed resources, for_each for map-based
- **Data sources**: Look up AZs dynamically instead of hardcoding
- **Security group chaining**: DB SG references App SG (not CIDR)
- **Least privilege**: Each SG allows only necessary traffic

---

## Common Mistakes

- Hardcoding AZ names (breaks in different regions)
- Making RDS publicly accessible
- Using wide CIDR blocks in security groups
- Not enabling DNS support in VPC
- Missing NAT Gateway for private subnet internet access
