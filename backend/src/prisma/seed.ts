import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing careers
  await prisma.career.deleteMany();
  console.log('✨ Cleared existing careers');

  // Seed tech careers
  const careers = [
    {
      name: 'Software Engineer',
      vietnameseName: 'Kỹ sư Phần mềm',
      description: 'Design, develop, and maintain software applications and systems. Work with various programming languages and frameworks to solve technical problems.',
      requirements: {
        skills: ['programming', 'problem-solving', 'debugging'],
        workStyle: ['focused', 'analytical', 'detail-oriented'],
        values: ['continuous learning', 'technical excellence', 'innovation'],
      },
    },
    {
      name: 'Product Manager',
      vietnameseName: 'Quản lý Sản phẩm',
      description: 'Define product vision, strategy, and roadmap. Work cross-functionally with engineering, design, and business teams to deliver successful products.',
      requirements: {
        skills: ['strategic thinking', 'communication', 'prioritization'],
        workStyle: ['collaborative', 'multitasking', 'organized'],
        values: ['user-centric', 'business impact', 'teamwork'],
      },
    },
    {
      name: 'UX/UI Designer',
      vietnameseName: 'Nhà thiết kế UX/UI',
      description: 'Create intuitive and beautiful user interfaces. Conduct user research, design wireframes and prototypes, and collaborate with developers.',
      requirements: {
        skills: ['visual design', 'user research', 'prototyping'],
        workStyle: ['creative', 'empathetic', 'iterative'],
        values: ['user experience', 'aesthetics', 'accessibility'],
      },
    },
    {
      name: 'Data Scientist',
      vietnameseName: 'Nhà khoa học Dữ liệu',
      description: 'Analyze complex data sets to derive insights and build predictive models. Use statistical methods and machine learning to solve business problems.',
      requirements: {
        skills: ['statistics', 'programming', 'data visualization'],
        workStyle: ['analytical', 'methodical', 'curious'],
        values: ['data-driven decisions', 'accuracy', 'discovery'],
      },
    },
    {
      name: 'DevOps Engineer',
      vietnameseName: 'Kỹ sư DevOps',
      description: 'Build and maintain infrastructure, CI/CD pipelines, and deployment systems. Ensure reliability, scalability, and security of applications.',
      requirements: {
        skills: ['automation', 'system administration', 'scripting'],
        workStyle: ['proactive', 'systematic', 'responsive'],
        values: ['reliability', 'efficiency', 'automation'],
      },
    },
    {
      name: 'Marketing Manager',
      vietnameseName: 'Quản lý Marketing',
      description: 'Develop and execute marketing strategies to promote products and grow customer base. Manage campaigns, analyze metrics, and optimize performance.',
      requirements: {
        skills: ['strategy', 'communication', 'analytics'],
        workStyle: ['creative', 'results-oriented', 'adaptable'],
        values: ['customer growth', 'brand building', 'ROI'],
      },
    },
    {
      name: 'Content Writer',
      vietnameseName: 'Biên tập Nội dung',
      description: 'Create compelling written content for various channels including blogs, websites, social media, and marketing materials.',
      requirements: {
        skills: ['writing', 'storytelling', 'research'],
        workStyle: ['creative', 'independent', 'deadline-driven'],
        values: ['clarity', 'engagement', 'authenticity'],
      },
    },
    {
      name: 'Technical Writer',
      vietnameseName: 'Biên tập Kỹ thuật',
      description: 'Create clear documentation, user guides, API references, and technical tutorials. Bridge the gap between technical teams and end users.',
      requirements: {
        skills: ['technical writing', 'documentation', 'simplification'],
        workStyle: ['detail-oriented', 'organized', 'collaborative'],
        values: ['clarity', 'user education', 'accuracy'],
      },
    },
    {
      name: 'Business Analyst',
      vietnameseName: 'Phân tích Kinh doanh',
      description: 'Analyze business processes, identify improvement opportunities, and translate business needs into technical requirements.',
      requirements: {
        skills: ['analysis', 'requirements gathering', 'problem-solving'],
        workStyle: ['systematic', 'communicative', 'detail-oriented'],
        values: ['efficiency', 'business value', 'process improvement'],
      },
    },
    {
      name: 'Sales Manager',
      vietnameseName: 'Quản lý Bán hàng',
      description: 'Lead sales team, develop sales strategies, and drive revenue growth. Build client relationships and close deals.',
      requirements: {
        skills: ['persuasion', 'negotiation', 'relationship building'],
        workStyle: ['goal-oriented', 'competitive', 'outgoing'],
        values: ['results', 'growth', 'client relationships'],
      },
    },
  ];

  for (const career of careers) {
    await prisma.career.create({ data: career });
  }

  console.log(`✅ Seeded ${careers.length} careers`);
  console.log('🎉 Database seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
