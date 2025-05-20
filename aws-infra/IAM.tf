#IAM policy: WebAppS3 the policy will allow EC2 instances to perform S3 buckets. 
#This is required for applications on your EC2 instance to talk to the S3 bucket.
resource "aws_iam_policy" "WebAppS3" {
  name        = "WebAppS3"
  path        = "/"
  description = "WebAppS3 policy"

  # Terraform's "jsonencode" function converts a
  # Terraform expression result to valid JSON syntax.
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "s3:PutObject",
          # "s3:PutObjectAcl",
          "s3:GetObject",
          # "s3:GetObjectAcl",
          "s3:DeleteObject"
        ]
        Effect = "Allow"
        Resource : [
          "arn:aws:s3:::${aws_s3_bucket.private_bucket.bucket}",
          "arn:aws:s3:::${aws_s3_bucket.private_bucket.bucket}/*"
        ]
      },
    ]
  })
}

# resource "aws_iam_policy" "kms_use" {
#   name        = "kms_use"
#   description = "Policy to allow use of KMS Key"
#   policy      = data.aws_iam_policy_document.kms_use_for_ebs.json
# }

# IAM Role
#Create an IAM role EC2-CSYE6225 for the EC2 service and attach the WebAppS3 policy to it. 
#You will attach this role to your EC2 instance.

resource "aws_iam_role" "EC2-CSYE6225" {
  name = "EC2-CSYE6225"

  assume_role_policy = jsonencode({
    "Version" : "2012-10-17",
    "Statement" : [
      {
        "Effect" : "Allow",
        "Action" : [
          "sts:AssumeRole"
        ],
        "Principal" : {
          "Service" : [
            "ec2.amazonaws.com"
          ]
        }
      }
    ]
  })
}

resource "aws_iam_instance_profile" "iam_profile" {
  name = "iam-profile"
  role = aws_iam_role.EC2-CSYE6225.name
}


resource "aws_iam_role_policy_attachment" "IAMrole_S3buckets_attach" {
  role       = aws_iam_role.EC2-CSYE6225.name
  policy_arn = aws_iam_policy.WebAppS3.arn
}

resource "aws_iam_role_policy_attachment" "IAMrole_CloudWatch_attach" {
  role       = aws_iam_role.EC2-CSYE6225.name
  policy_arn = "arn:aws:iam::aws:policy/CloudWatchAgentServerPolicy"
}

# resource "aws_iam_role_policy_attachment" "IAMrole_KMS_attach" {
#   role       = aws_iam_role.EC2-CSYE6225.name
#   policy_arn = aws_iam_policy.kms_use.arn
# }
