# Infrastructure as Code with Terraform

Design a complete AWS infrastructure using Terraform that follows production best practices. The configuration should create a VPC with public/private subnets, compute resources, and a managed database.

## Problem

Given infrastructure requirements, generate Terraform HCL configuration that provisions:

1. **Networking**: VPC with public and private subnets across multiple AZs, NAT Gateway, Internet Gateway
2. **Compute**: Auto Scaling Group with Launch Template in private subnets
3. **Database**: RDS instance in private subnets with Multi-AZ
4. **Security**: Security groups with least-privilege access rules

---

## Requirements

### Networking
- VPC with configurable CIDR block
- Public subnets (one per AZ) with Internet Gateway
- Private subnets (one per AZ) with NAT Gateway
- Proper route tables for each subnet type

### Compute
- Launch Template with specified instance type
- Auto Scaling Group spanning private subnets
- Security group allowing only necessary traffic

### Database
- RDS instance in a DB subnet group (private subnets)
- Multi-AZ for high availability
- Security group allowing access only from compute SG

### Best Practices
- Use `variable` blocks for all configurable values
- Use `locals` for computed values
- Tag all resources with Name, Environment, ManagedBy
- Define `output` blocks for VPC ID, subnet IDs, RDS endpoint
- Use `data` sources for AZ lookup

---

## Examples

**Example 1:**
```text
Input: {
  region: "us-east-1",
  vpcCidr: "10.0.0.0/16",
  azCount: 3,
  instanceType: "t3.medium",
  dbEngine: "postgres"
}

Output: Terraform config with:
- VPC (10.0.0.0/16)
- 3 public subnets (10.0.1.0/24, 10.0.2.0/24, 10.0.3.0/24)
- 3 private subnets (10.0.11.0/24, 10.0.12.0/24, 10.0.13.0/24)
- NAT Gateway in first public subnet
- ASG with t3.medium instances in private subnets
- PostgreSQL RDS in private subnets
```

---

## Constraints

- Must use Terraform AWS provider
- All resources must be in the specified region
- Security groups must follow least-privilege principle
- Database must not be publicly accessible
- Must use `for_each` or `count` for subnet creation (DRY)
- Must include terraform block with required_providers
