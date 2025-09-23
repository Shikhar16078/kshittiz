import {
  Briefcase,
  FolderGit2,
  GraduationCap,
  Home,
  Mail,
  Wrench,
  Github,
  Linkedin,
  Youtube,
  BrainCircuit,
} from 'lucide-react';
import type {
  PersonalData,
  WorkExperience,
  Education,
  Project,
  NavLink,
} from '@/lib/types';

export const personalData: PersonalData = {
  name: 'Kshittiz Kumar',
  title: 'Senior Software Engineer at Microsoft | FactSet | PayPal',
  bio: 'A seasoned software engineer with a passion for building scalable and efficient solutions. Experienced in cloud technologies, distributed systems, and backend development, with a proven track record of delivering high-quality software at top tech companies.',
  image: 'profile-photo',
  contact: {
    email: 'kshittiz.k@gmail.com',
    social: [
      {
        name: 'LinkedIn',
        url: 'https://www.linkedin.com/in/kshittiz-kumar',
        icon: Linkedin,
      },
      {
        name: 'GitHub',
        url: 'https://github.com/kshittiz',
        icon: Github,
      },
      {
        name: 'YouTube',
        url: 'https://www.youtube.com/@LeetCodeLearning',
        icon: Youtube,
      },
    ],
  },
};

export const workExperience: WorkExperience[] = [
  {
    company: 'Microsoft',
    role: 'Senior Software Engineer',
    startDate: 'Jan 2022',
    endDate: 'Present',
    accomplishments: [
      'Azure Cosmos Database Back-up & Restore.',
      'I design and implement backup and restore solutions for partitioned collections and databases in Azure Cosmos DB, focusing on complex restore scenarios, resiliency, and high availability. My work involves architecting solutions that ensure data consistency and quick recovery, leveraging both periodic and continuous backup modes to meet business continuity requirements.',
      'I specialize in optimizing restore workflows for large-scale, multi-partitioned environments, ensuring minimal downtime and maximum data integrity.',
      'My expertise includes managing restore permissions at scale, automating recovery processes, and collaborating with cross-functional teams to drive operational excellence in cloud-native data services.',
    ],
  },
  {
    company: 'FactSet',
    role: 'Software Engineer I - III',
    startDate: 'July 2019',
    endDate: 'Jan 2022',
    accomplishments: [
      'Formulated complex SQL queries and procedures to upload ~300TB of data on Snowflake’s cloud data warehouse. Wrote queries to support multiple corporate actions like 1-Minute-Bins, split adjustments.',
      'Setup AWS lambda in Python coupled with Snowflake’s Snowpipe to trigger daily uploads (~0.5TB).',
      'Designed automated tasks on snowflake powered by SQL procedure for stamping different regions of new incoming data on nightly basis.',
      'Implemented a MapReduce job to convert CSVs to Parquet files for building a clean and compressed data lake agnostic to data warehouse.',
      'Built a distributed web service powered by Redis with a custom SQL generation library to run SQL queries on Snowflake and ship result to any Amazon S3 bucket. Leveraged Go routines to handle multiple async requests, status polling and email notifications.',
      'Wrote a service in Go to validate JSON response of other services using a pre-defined schema stored in zookeeper.',
      'Redesigned and implemented an existing C++ service in Java and increased performance by 8 times.',
      'Created a tool in Go to compare JSON response and response-time of another service running in different environments, for testing purposes.',
      'Instrumented existing web services in Go with OpenTracing to leverage LightStep monitoring.',
      'Refactored some existing Java and Go services for efficiency and readability.',
    ],
  },
  {
    company: 'PayPal',
    role: 'Software Engineer Intern',
    startDate: 'May 2018',
    endDate: 'Aug 2018',
    accomplishments: [
      'Created a tracer (for distributed tracing) using OpenTracing APIs (Java) for real time performance monitoring of services, that acts as bridge between proprietary centralized applications logging system and OpenTracing.',
      'Achieved code coverage of 85% using Junit test cases.',
      'Tools & Technologies: Java, Junit, Spring boot, OpenTracing, Jenkins',
    ],
  },
  {
    company: 'Aricent',
    role: 'Software Engineer',
    startDate: 'Oct 2015',
    endDate: 'May 2017',
    accomplishments: [
      'Full stack developer, specialization back-end using Java JEE',
      'Part of Team Excellence Award (October 2016) winner group. Worked on - Network Management System for Padtec.',
      'Constructed RESTful web services, entity classes, EJBs, DB schema and CRUD operations using JPA.',
      'Performed unit testing by writing test cases using TestNG, Mockito and PowerMock framework with a code coverage of ~95%',
      'Peer code reviews and quality testing.',
      'Provide KT(Knowledge Transfer) sessions to new recruits on project.',
    ],
  },
];

export const education: Education[] = [
  {
    institution: 'North Carolina State University',
    degree: 'Master of Computer Science',
    startDate: '2017',
    endDate: '2019',
    gpa: 'GPA: 3.7/4.0',
    description:
      'Completed a Master of Science with a focus on core computer science principles and practices.',
    courses: [
      'Design and Analysis of Algorithms',
      'Database Management Systems',
      'Software Engineering',
      'Operating Systems',
      'Internet of Things Analytics',
      'Human Computer Interaction',
    ],
  },
  {
    institution: 'Guru Gobind Singh Indraprastha University',
    degree: 'Bachelor of Technology in Computer Science & Engineering',
    startDate: '2011',
    endDate: '2015',
    gpa: 'GPA: 8/10',
    description:
      'Gained a strong foundation in computer science and engineering principles.',
    courses: [
      'Data Structures',
      'Object-Oriented Programming using C++',
      'Computer Networks',
      'Java Programming and Website Design',
      'Data Warehouse and Data Mining',
      'Artificial Intelligence',
    ],
  },
];

export const projects: Project[] = [
  {
    id: 'project-1',
    title: 'Clustering - data set',
    description:
      'Used various clustering algorithms (Hierarchical, k-means, DBSCAN & Gaussian Decomposition) on dummy data set to find optimal number of clusters. Used python libraries for analysis.',
    startDate: '2019',
    endDate: '2019',
    type: 'Academic',
    techStack: ['Python', 'scikit-learn', 'Hierarchical Clustering', 'K-Means'],
    liveDemoUrl: '#',
    githubUrl: '#',
    image: 'project-1',
  },
  {
    id: 'project-2',
    title: 'Forecasting time-series & analysis',
    description:
      'Analyzed various forecasting algorithms like Exponential Smoothing, Simple Moving Average, AR(p) etc. to determine the best model for a time series. Used python libraries for analysis.',
    startDate: '2019',
    endDate: '2019',
    type: 'Academic',
    techStack: ['Python', 'Pandas', 'StatsModels', 'Time Series Analysis'],
    liveDemoUrl: '#',
    githubUrl: '#',
    image: 'project-2',
  },
  {
    id: 'project-3',
    title: 'Multivariable Regression using Python',
    description:
      'Developed a multivariable regression to establish a relation between dependent variable Y and 5-tuples of Independent variables using python statistical packages. Performed residual analysis using Q-Q plot and scatter plot.',
    startDate: '2018',
    endDate: '2018',
    type: 'Academic',
    techStack: ['Python', 'StatsModels', 'Regression Analysis', 'Matplotlib'],
    liveDemoUrl: '#',
    githubUrl: '#',
    image: 'project-3',
  },
  {
    id: 'project-4',
    title: 'Android apk analysis using Flowdroid',
    description:
      'Successfully analyzed 50 android apk files for privacy leaks using Flowdroid taint analysis tool. Created scripts using Java for automating analysis and to deduce relations between various privacy violations.',
    startDate: '2018',
    endDate: '2018',
    type: 'Academic',
    techStack: ['Java', 'Flowdroid', 'Static Analysis', 'Android Security'],
    liveDemoUrl: '#',
    githubUrl: '#',
    image: 'project-4',
  },
  {
    id: 'project-5',
    title: 'Writing Integration test cases using RSpec',
    description:
      "Contributed to the Expertiza project by writing integration test cases for the 'Response controller' using RSpec, helping to ensure the software's quality and reliability.",
    startDate: '2018',
    endDate: '2018',
    type: 'Academic',
    techStack: ['Ruby', 'RSpec', 'Testing', 'Rails'],
    liveDemoUrl: '#',
    githubUrl: '#',
    image: 'project-5',
  },
  {
    id: 'project-6',
    title: 'Resource conainers - Memory',
    description:
      'Introduced a new abstraction called Resource containers for memory sharing in the Linux kernel using C. Tasks within the same container can share a pool of memory locations, while tasks in different containers cannot.',
    startDate: '2018',
    endDate: '2018',
    type: 'Academic',
    techStack: ['C', 'Linux Kernel', 'Operating Systems', 'Memory Management'],
    liveDemoUrl: '#',
    githubUrl: '#',
    image: 'project-6',
  },
  {
    id: 'project-7',
    title: 'Resource containers - processor',
    description:
      'Introduced a new abstraction for resource allocation in the Linux kernel by creating resource containers. Each thread can be assigned to a container with its own scheduling policy and lock, allowing for better resource utilization.',
    startDate: '2018',
    endDate: '2018',
    type: 'Academic',
    techStack: ['C', 'Linux Kernel', 'Operating Systems', 'CPU Scheduling'],
    liveDemoUrl: '#',
    githubUrl: '#',
    image: 'project-7',
  },
  {
    id: 'project-8',
    title: 'Hotel Chain Management System',
    description:
      'A fully functional Swing-based application for managing a hotel chain. Developed a 3-layered MVC architecture using Java and was responsible for the full-stack development of the manager view.',
    startDate: '2014',
    endDate: '2014',
    type: 'Academic',
    techStack: ['Java', 'Swing', 'MVC', 'SQL', 'JDBC'],
    liveDemoUrl: '#',
    githubUrl: '#',
    image: 'project-8',
  },
  {
    id: 'project-9',
    title: 'PCAP File Analysis',
    description:
      'Analyzed PCAP files for attacks and network characteristics using tools like Wireshark and Bro. Wrote Python scripts to analyze packet frequency and plotted statistics using Gnuplot.',
    startDate: '2014',
    endDate: '2014',
    type: 'Academic',
    techStack: [
      'Python',
      'Wireshark',
      'Bro (Zeek)',
      'Gnuplot',
      'Network Security',
    ],
    liveDemoUrl: '#',
    githubUrl: '#',
    image: 'project-9',
  },
  {
    id: 'project-10',
    title: 'Secure Netcat using AES-GCM Encryption',
    description:
      'Simulated the Netcat utility in Python and embedded encryption/decryption through AES-GCM using the pycryptodome library to create a secure communication channel.',
    startDate: '2014',
    endDate: '2014',
    type: 'Personal',
    techStack: ['Python', 'AES-GCM', 'Cryptography', 'pycryptodome'],
    liveDemoUrl: '#',
    githubUrl: '#',
    image: 'project-10',
  },
  {
    id: 'project-11',
    title: 'Slack based bot application - UtiloBot',
    description:
      "A bot designed using Node.js and Agile methodologies to ease the process of fetching pull-requests, emails, issues and meeting invites. Designed algorithm for analysis of Travis build status for each 'pull request' email.",
    startDate: '2016',
    endDate: '2016',
    type: 'Personal',
    techStack: ['Node.js', 'Slack API', 'Trello', 'Agile'],
    liveDemoUrl: '#',
    githubUrl: '#',
    image: 'project-11',
  },
  {
    id: 'project-12',
    title: 'Car Rental Web Application - GoMILES',
    description:
      'A car rental web application designed and developed using Ruby on Rails along with Bootstrap. Designed the front-end (view) and controllers for user permissions and car reservations.',
    startDate: '2018',
    endDate: '2018',
    type: 'Personal',
    techStack: ['Ruby on Rails', 'Bootstrap', 'MVC', 'SQL'],
    liveDemoUrl: '#',
    githubUrl: '#',
    image: 'project-12',
  },
];

export const navLinks: NavLink[] = [
  { href: '#about', label: 'Home', icon: Home },
  { href: '#experience', label: 'Experience', icon: Briefcase },
  { href: '#skills', label: 'Skills', icon: BrainCircuit },
  { href: '#projects', label: 'Projects', icon: FolderGit2 },
  { href: '#education', label: 'Education', icon: GraduationCap },
  { href: '#contact', label: 'Contact', icon: Mail },
];
