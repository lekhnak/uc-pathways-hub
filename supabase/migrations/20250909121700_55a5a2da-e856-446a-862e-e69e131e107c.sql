-- Update website_content with structured content for all sections

-- Update hero section with proper metadata
UPDATE website_content 
SET 
  title = 'UC Investments Academy',
  subtitle = 'Building the next generation of finance leaders',
  content = 'Connect UC undergraduate and graduate students with opportunities in the financial industry through free training, tools, and coaching.',
  metadata = jsonb_build_object(
    'cta_primary', 'Access Portal',
    'cta_secondary', 'Explore the Program'
  )
WHERE section_id = 'hero';

-- Update about section
UPDATE website_content 
SET 
  title = 'What is the UC Investments Academy?',
  content = 'Launched by UC Investments and UC Office of the President in 2022, this program prepares UC students for careers in finance and asset management. Initially starting with just 100 students at UC Merced, the program has expanded to multiple UC campuses and provides the one-stop UC destination for preparing for careers in finance.\n\nThe UC Investments Academy, which we created to connect UC undergrads with opportunities in the financial industry, has engaged 3000+ students across 9 UC campuses. The Academy provides free training, tools and coaching to all interested UC students.',
  image_url = '/lovable-uploads/afe88b15-8d39-4a7f-a2a8-0c78244c5ba0.png'
WHERE section_id = 'about';

-- Update program section with process stages and features
UPDATE website_content 
SET 
  title = 'Our Complete Program',
  subtitle = 'A comprehensive pathway designed to take you from awareness to career success in finance and asset management.',
  content = 'A comprehensive pathway designed to take you from awareness to career success in finance and asset management.',
  metadata = jsonb_build_object(
    'process_stages', jsonb_build_array(
      jsonb_build_object(
        'title', 'AWARENESS',
        'items', jsonb_build_array(
          'Provide exposure to different areas of asset management',
          'Clarify options for investment careers'
        ),
        'color', 'border-blue-500 bg-blue-50'
      ),
      jsonb_build_object(
        'title', 'ACCESS',
        'items', jsonb_build_array(
          'Intentional approach to create a diverse and inclusive participant base'
        ),
        'color', 'border-cyan-500 bg-cyan-50'
      ),
      jsonb_build_object(
        'title', 'EDUCATION',
        'items', jsonb_build_array(
          'Foundational personal finance concepts',
          'Investment analysis and portfolio management education'
        ),
        'color', 'border-green-500 bg-green-50'
      ),
      jsonb_build_object(
        'title', 'TRAINING',
        'items', jsonb_build_array(
          'Practical investment analysis and experience',
          '''Soft skills'' for professional success'
        ),
        'color', 'border-gray-500 bg-gray-50'
      ),
      jsonb_build_object(
        'title', 'NETWORK',
        'items', jsonb_build_array(
          'Provide exposure to investment professionals within and outside UC network',
          'Create an investment and entrepreneurship community'
        ),
        'color', 'border-orange-500 bg-orange-50'
      ),
      jsonb_build_object(
        'title', 'MENTORSHIP',
        'items', jsonb_build_array(
          'Mentors students can see as role models',
          'Guidance on investing and career management'
        ),
        'color', 'border-blue-600 bg-blue-100'
      ),
      jsonb_build_object(
        'title', 'CAREER',
        'items', jsonb_build_array(
          'Internships',
          'Full-time job opportunities'
        ),
        'color', 'border-sky-500 bg-sky-50'
      )
    ),
    'features', jsonb_build_array(
      jsonb_build_object(
        'icon', 'TrendingUp',
        'title', 'Real-World Experience',
        'description', 'Build financial literacy through comprehensive training and real-world investment experience.'
      ),
      jsonb_build_object(
        'icon', 'BookOpen',
        'title', 'Free Training',
        'description', 'Free asset management training and professional development at no cost to students.'
      ),
      jsonb_build_object(
        'icon', 'Network',
        'title', 'Professional Network',
        'description', 'Connect with professionals across investments and wealth management industries.'
      ),
      jsonb_build_object(
        'icon', 'Users',
        'title', 'Mentorship Access',
        'description', 'Access mentorship and internship opportunities with industry leaders.'
      )
    ),
    'closing_text', 'By the end of the program, participants are motivated and equipped with foundational knowledge to pursue a career in investments.'
  )
WHERE section_id = 'program';

-- Update benefits section
UPDATE website_content 
SET 
  title = 'Why Choose UC Investments Academy?',
  subtitle = 'Everything you need to launch your finance career.',
  metadata = jsonb_build_object(
    'benefits', jsonb_build_array(
      jsonb_build_object(
        'icon', 'Target',
        'title', 'Hands-on Portfolio Projects',
        'description', 'Work on real investment analysis projects and virtual work experiences with leading firms.'
      ),
      jsonb_build_object(
        'icon', 'Users',
        'title', 'Mentorship & Career Coaching',
        'description', 'Get paired with industry professionals for personalized guidance and career development.'
      ),
      jsonb_build_object(
        'icon', 'Award',
        'title', 'Resume-Ready Certifications',
        'description', 'Earn industry-recognized certifications and badges that strengthen your resume.'
      ),
      jsonb_build_object(
        'icon', 'Building',
        'title', 'Industry Professional Workshops',
        'description', 'Learn directly from leading professionals in asset management and finance.'
      ),
      jsonb_build_object(
        'icon', 'GraduationCap',
        'title', 'Interview Prep & Recruiting',
        'description', 'Get comprehensive interview preparation and recruiting insights for finance roles.'
      ),
      jsonb_build_object(
        'icon', 'Network',
        'title', 'Alumni & Community Network',
        'description', 'Join a thriving community of 3000+ students and growing alumni network.'
      )
    )
  )
WHERE section_id = 'benefits';

-- Update how-it-works section
UPDATE website_content 
SET 
  title = 'How the Program Works',
  subtitle = 'The program consists of online classes and guest speakers from diverse backgrounds in the investment field.',
  metadata = jsonb_build_object(
    'components', jsonb_build_array(
      jsonb_build_object(
        'icon', 'BookOpen',
        'title', 'Investment Analysis Curriculum',
        'items', jsonb_build_array(
          'Online self-study materials (20-30 hours per quarter)',
          '2 live instructor-led Zoom training sessions (6 hours total)',
          'Provided by Training The Street'
        )
      ),
      jsonb_build_object(
        'icon', 'Users',
        'title', 'Live Guest Speaker Sessions',
        'items', jsonb_build_array(
          '2-3 Wednesday evening Zoom sessions per semester',
          'Optional access to ~20 previously recorded sessions',
          'Insider views into the investment arena'
        )
      ),
      jsonb_build_object(
        'icon', 'Building',
        'title', 'Virtual Work Experience',
        'items', jsonb_build_array(
          '2+ virtual work assignments with investment firms',
          '10-25 hours per semester',
          'Provided by The Forage'
        )
      ),
      jsonb_build_object(
        'icon', 'Network',
        'title', 'Investment Community & Network',
        'items', jsonb_build_array(
          'Interact with investors and like-minded UC students',
          'Connect with firms recruiting Academy students',
          'Access career opportunities'
        )
      ),
      jsonb_build_object(
        'icon', 'TrendingUp',
        'title', 'Financial Literacy Programming',
        'items', jsonb_build_array(
          'Learn how to create wealth for your future',
          'Personal financial literacy programming',
          '1-2 hours of focused content'
        )
      ),
      jsonb_build_object(
        'icon', 'Target',
        'title', 'Career Strategy Sessions',
        'items', jsonb_build_array(
          'Access to UC investments team members',
          'Network of professionals for advice',
          'Investment strategy guidance'
        )
      )
    )
  )
WHERE section_id = 'how-it-works';

-- Update FAQ section
UPDATE website_content 
SET 
  title = 'Frequently Asked Questions',
  subtitle = 'Everything you need to know about the UC Investments Academy.',
  metadata = jsonb_build_object(
    'faqs', jsonb_build_array(
      jsonb_build_object(
        'question', 'Who is eligible to join the UC Investments Academy?',
        'answer', 'The program is open to all UC undergraduate students across all 9 UC campuses. No prior finance experience is required - we welcome students from all majors and backgrounds.'
      ),
      jsonb_build_object(
        'question', 'How much does the program cost?',
        'answer', 'The UC Investments Academy is completely free for all UC students. This includes training materials, mentorship, certifications, and access to portfolio projects.'
      ),
      jsonb_build_object(
        'question', 'What is the time commitment?',
        'answer', 'The program is designed to be flexible around your academic schedule. Most students spend 5-10 hours per week on training modules and projects, with additional time for mentorship meetings and workshops.'
      ),
      jsonb_build_object(
        'question', 'Which UC campuses participate?',
        'answer', 'All 9 UC campuses participate: UC Berkeley, UCLA, UC San Diego, UC Davis, UC Irvine, UC Santa Barbara, UC Santa Cruz, UC Riverside, and UC Merced.'
      ),
      jsonb_build_object(
        'question', 'How do I apply?',
        'answer', 'Simply click the "Apply Now" or "Sign up" button to create your account. You''ll complete a brief application form and can start accessing training materials immediately upon approval.'
      ),
      jsonb_build_object(
        'question', 'How can I get more information?',
        'answer', 'For additional questions, please reach out to our team using the contact information below or email us directly. We''re here to help you succeed!'
      )
    )
  )
WHERE section_id = 'faq';