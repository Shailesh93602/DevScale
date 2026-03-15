import { DetailedRoadmapData } from './roadmapTypes';

export const cloudDevopsRoadmap: DetailedRoadmapData = {
    title: 'Cloud & DevOps Engineering',
    description: 'Master Cloud computing, Infrastructure as Code, CI/CD, and Containerization.',
    tags: 'Cloud,DevOps,AWS,Docker,Kubernetes',
    mainConcepts: [
        {
            name: 'Containerization & Virtualization',
            description: 'Isolating applications for cross-environment consistency.',
            order: 1,
            subjects: [
                {
                    name: 'Docker Fundamentals',
                    description: 'Building, shipping, and running containers.',
                    order: 1,
                    topics: [
                        {
                            name: 'Images and Containers',
                            description: 'Understanding the core architecture of Docker.',
                            order: 1,
                            articles: [
                                {
                                    title: 'Docker Images vs Containers',
                                    content: `
                    <h1>Docker Images and Containers</h1>
                    <p>Docker revolutionized application deployment by introducing lightweight, portable containers.</p>
                    <h2>Images</h2>
                    <p>A Docker image is a read-only template containing instructions for creating a Docker container. It includes the application code, runtime, libraries, environment variables, and configuration files.</p>
                    <h2>Containers</h2>
                    <p>A container is a runnable instance of an image. You can create, start, stop, move, or delete a container using the Docker API or CLI. You can connect a container to one or more networks, attach storage to it, or even create a new image based on its current state.</p>
                    <pre><code>
# Pull an image
docker pull ubuntu

# Run a container from the image
docker run -it ubuntu bash
                    </code></pre>
                  `
                                }
                            ],
                            quizzes: [
                                {
                                    title: 'Docker Concepts Quiz',
                                    description: 'Validate your understanding of Images vs Containers.',
                                    passingScore: 80,
                                    timeLimit: 10,
                                    questions: [
                                        {
                                            question: 'What is the relationship between an Image and a Container in Docker?',
                                            points: 10,
                                            options: [
                                                { text: 'They are two completely different virtual machines.', isCorrect: false },
                                                { text: 'An Image is a running instance of a Container.', isCorrect: false },
                                                { text: 'A Container is a runnable instance of an Image.', isCorrect: true },
                                                { text: 'Docker uses Images for Linux and Containers for Windows.', isCorrect: false }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
        },
        {
            name: 'Infrastructure as Code (IaC)',
            description: 'Managing and provisioning infrastructure via code.',
            order: 2,
            subjects: [
                {
                    name: 'Terraform',
                    description: 'Using HashiCorp Terraform to build infrastructure.',
                    order: 1,
                    topics: [
                        {
                            name: 'Getting Started with Terraform',
                            description: 'Providers, Resources, and State management.',
                            order: 1,
                            articles: [
                                {
                                    title: 'Terraform Basics',
                                    content: `
                    <h1>Terraform Fundamentals</h1>
                    <p>Terraform is an infrastructure as code tool that lets you define both cloud and on-prem resources in human-readable configuration files.</p>
                    <h2>Providers</h2>
                    <p>A provider is a plugin that lets Terraform interact with cloud platforms, SaaS providers, and other APIs.</p>
                    <pre><code>
provider "aws" {
  region = "us-west-2"
}
                    </code></pre>
                    <h2>Resources</h2>
                    <p>Resources are the most important element in the Terraform language. Each resource block describes one or more infrastructure objects.</p>
                    <pre><code>
resource "aws_instance" "web" {
  ami           = "ami-a1b2c3d4"
  instance_type = "t2.micro"
}
                    </code></pre>
                    <h2>State File (.tfstate)</h2>
                    <p>Terraform must store state about your managed infrastructure and configuration. This state is used by Terraform to map real world resources to your configuration.</p>
                  `
                                }
                            ],
                            quizzes: [
                                {
                                    title: 'Terraform Basics Quiz',
                                    description: 'Check your knowledge on Terraform configuration elements.',
                                    passingScore: 100,
                                    timeLimit: 5,
                                    questions: [
                                        {
                                            question: 'What is the primary purpose of the Terraform state file?',
                                            points: 10,
                                            options: [
                                                { text: 'To encrypt sensitive database passwords.', isCorrect: false },
                                                { text: 'To map real-world resources to your configuration files.', isCorrect: true },
                                                { text: 'To define which cloud provider (AWS/GCP/Azure) to use.', isCorrect: false },
                                                { text: 'To store the application source code.', isCorrect: false }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ]
};
