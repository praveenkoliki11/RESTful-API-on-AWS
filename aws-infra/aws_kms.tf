locals {
  admin_username = "peggy"
  account_id     = data.aws_caller_identity.current.account_id
}

data "aws_caller_identity" "current" {}


resource "aws_kms_key" "kms_ebs" {
  description             = "EBS Customer-managed KMS key"
  deletion_window_in_days = 30
  multi_region            = false
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "Allow Auto Scaling Group to use the key"
        Effect = "Allow"
        Principal = {
          Service = "autoscaling.amazonaws.com"
        }
        Action = [
          "kms:*",
          #   "kms:Encrypt*",
          #   "kms:Decrypt*",
          #   "kms:ReEncrypt*",
          #   "kms:GenerateDataKey*",
          #   "kms:Describe*"
        ]
        Resource = "*"
      },
      {
        Sid    = "Allow EBS to use the key"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
        Action = [
          "kms:*"
          #   "kms:Encrypt*",
          #   "kms:Decrypt*",
          #   "kms:ReEncrypt*",
          #   "kms:GenerateDataKey*",
          #   "kms:Describe*"
        ]
        Resource = "*"
      },
      {
        Sid    = "Enable IAM User Permissions"
        Effect = "Allow"
        Principal = {
          AWS = "*"
        }
        Action = [
          "kms:*"
        ]
        Resource = "*"
      }
    ]
  })
  ## policy = data.aws_iam_policy_document.kms_use_for_ebs.json
}

resource "aws_kms_alias" "a" {
  name          = "alias/ec2_kms"
  target_key_id = aws_kms_key.kms_ebs.key_id
}

data "aws_iam_policy_document" "kms_use_for_ebs" {
  statement {
    sid       = "Enable IAM User Permissions"
    effect    = "Allow"
    actions   = ["kms:*"]
    resources = ["*"]

    principals {
      type        = "AWS"
      identifiers = ["arn:aws:iam::${local.account_id}:root"]
    }
  }

  statement {
    sid    = "Allow Symmetric Key Usage"
    effect = "Allow"
    actions = [
      "kms:GenerateDataKey*",
      "kms:Decrypt"
    ]
    resources = ["*"]
    condition {
      test     = "ForAnyValue:StringEquals"
      variable = "kms:EncryptionAlgorithm"
      values   = ["SYMMETRIC_DEFAULT"]
    }
  }

  statement {
    sid       = "Allow access for Key Administrators"
    effect    = "Allow"
    actions   = ["kms:*"]
    resources = ["*"]

    principals {
      type = "AWS"
      identifiers = [
        "arn:aws:iam::${local.account_id}:user/${local.admin_username}",
        "arn:aws:iam::${local.account_id}:role/aws-service-role/support.amazonaws.com/AWSServiceRoleForSupport",
        "arn:aws:iam::${local.account_id}:role/aws-service-role/trustedadvisor.amazonaws.com/AWSServiceRoleForTrustedAdvisor"
      ]
    }
  }

  statement {
    sid    = "Allow use of the key"
    effect = "Allow"
    actions = [
      "kms:Encrypt",
      "kms:Decrypt",
      "kms:ReEncrypt*",
      "kms:GenerateDataKey*",
      "kms:DescribeKey"
    ]
    resources = ["*"]

    principals {
      type = "AWS"
      identifiers = [
        "arn:aws:iam::${local.account_id}:user/${local.admin_username}",
        "arn:aws:iam::${local.account_id}:role/aws-service-role/support.amazonaws.com/AWSServiceRoleForSupport",
        "arn:aws:iam::${local.account_id}:role/aws-service-role/trustedadvisor.amazonaws.com/AWSServiceRoleForTrustedAdvisor"
      ]
    }
  }

  statement {
    sid    = "Allow attachment of persistent resources"
    effect = "Allow"
    actions = [
      "kms:CreateGrant",
      "kms:ListGrants",
      "kms:RevokeGrant"
    ]
    resources = ["*"]

    principals {
      type = "AWS"
      identifiers = [
        "arn:aws:iam::${local.account_id}:user/${local.admin_username}",
        "arn:aws:iam::${local.account_id}:role/aws-service-role/support.amazonaws.com/AWSServiceRoleForSupport",
        "arn:aws:iam::${local.account_id}:role/aws-service-role/trustedadvisor.amazonaws.com/AWSServiceRoleForTrustedAdvisor"
      ]
    }

    condition {
      test     = "Bool"
      variable = "kms:GrantIsForAWSResource"
      values   = ["true"]
    }
  }

}

resource "aws_kms_key" "kms_rds" {
  description             = "RDS customer-managed KMS key"
  deletion_window_in_days = 30
  multi_region            = false
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "Enable IAM User Permissions"
        Effect = "Allow"
        Principal = {
          AWS = "*"
        }
        Action = [
          "kms:*"
        ]
        Resource = "*"
      },
      {
        Sid    = "Allow use of the key for RDS encryption"
        Effect = "Allow"
        Principal = {
          Service = "rds.amazonaws.com"
        }
        Action = [
          "kms:Encrypt",
          "kms:Decrypt",
          "kms:ReEncrypt*",
          "kms:GenerateDataKey*",
          "kms:Describe*"
        ]
        Resource = "*"
      }

    ]
  })
  // policy = data.aws_iam_policy_document.kms_use_for_rds.json
}

data "aws_iam_policy_document" "kms_use_for_rds" {
  statement {
    actions = [
      "kms:Decrypt",
      "kms:GenerateDataKey"
    ]

    resources = ["*"]

    condition {
      test     = "ForAnyValue:StringEquals"
      variable = "kms:EncryptionContext:service"
      values   = ["pi"]
    }

    condition {
      test     = "ForAnyValue:StringEquals"
      variable = "kms:EncryptionContext:aws:pi:service"
      values   = ["rds"]
    }

  }
}


