import React from 'react';
import { Link } from 'react-router-dom';

import Slider from 'react-slick';
import studentImage from '../images/student-cta.png';
import teacherImage from '../images/teacher-cta.png';
import parentImage from '../images/parent-cta.png';
import 'animate.css';
import './HomePage.css';
import AboutUsPage from './AboutUsPage';

const videos = [
  { title: 'Math Tutorial', url: 'https://www.youtube.com/embed/example1' },
  { title: 'Science Tutorial', url: 'https://www.youtube.com/embed/example2' },
  { title: 'English Tutorial', url: 'https://www.youtube.com/embed/example3' },
  { title: 'History Tutorial', url: 'https://www.youtube.com/embed/example4' },
  { title: 'Geography Tutorial', url: 'https://www.youtube.com/embed/example5' },
];

const teachers = [
  { name: 'John Doe', subject: 'Math Tutor', school: 'High School', grade: '10th Grade', imgSrc: '/images/teacher1.jpg' },
  { name: 'Jane Smith', subject: 'Science Tutor', school: 'Middle School', grade: '8th Grade', imgSrc: '/images/teacher2.jpg' },
  { name: 'Mary Johnson', subject: 'English Tutor', school: 'Elementary School', grade: '5th Grade', imgSrc: '/images/teacher3.jpg' },
];

const testimonials = [
  { name: 'Alex', role: 'Student', message: 'Studybuddy helped me improve my grades!', imgSrc: '/images/alex.jpg' },
  { name: 'Maria', role: 'Parent', message: 'The tutors are amazing!', imgSrc: '/images/maria.jpg' },
  { name: 'Michael', role: 'Parent', message: 'My child is engaged in learning!', imgSrc: '/images/michael.jpg' },
];

const videoSettings = {
  dots: true,
  infinite: true,
  speed: 500,
  slidesToShow: 3,
  slidesToScroll: 1,
  nextArrow: <div className="slick-arrow next-arrow">→</div>,
  prevArrow: <div className="slick-arrow prev-arrow">←</div>,
  responsive: [
    {
      breakpoint: 768,
      settings: {
        slidesToShow: 1,
        slidesToScroll: 1,
      },
    },
  ],
};

const HomePage = () => {
  return (
    <div className="homepage bg-gradient-to-r from-blue-400 to-indigo-600 overflow-x-hidden">

     {/* Hero Section */}
<section className="relative hero animate__animated animate__fadeIn h-screen w-full flex items-center justify-center text-white">
  {/* Background Image */}
  <div className="absolute inset-0 w-full h-full">
    <img
      src="/images/std4.jpeg"
      alt="Studybuddy Learning Animation"
      className="w-full h-full object-cover"
    />
    {/* Overlay for better text visibility */}
    <div className="absolute inset-0 bg-black bg-opacity-50"></div>
  </div>

  {/* Hero Content */}
  <div className="relative z-10 text-center px-6 md:px-12 lg:px-20">
    <h1 className="text-4xl md:text-5xl font-bold mb-6">Welcome to StudyBuddy Africa</h1>
    <p className="text-xl mb-8">Your platform for personalized learning and top-notch tutoring.</p>
    <Link
      to="/about-us"
      className="cta-button bg-yellow-500 text-white py-3 px-6 rounded-lg shadow-lg hover:bg-yellow-400 transform transition duration-300 hover:scale-105"
    >
      Learn More
    </Link>
  </div>
</section>

      {/* Join as Section */}
      <section className="user-circles text-center py-20 bg-gray-100">
        <h2 className="text-4xl font-bold text-gray-800 mb-8 animate__animated animate__fadeIn animate__delay-1s">Join Studybuddy as a...</h2>
        <div className="circle-container flex flex-wrap justify-center gap-10">
          <Link to="/student-signup" className="circle bg-white shadow-lg p-10 rounded-full hover:scale-105 transform transition duration-300 hover:shadow-xl animate__animated animate__fadeIn animate__delay-2s">
            <img src={studentImage} alt="Student" className="circle-image w-40 h-40 rounded-full mb-4" />
            <span className="circle-label text-xl text-gray-800">Student</span>
          </Link>
          <Link to="/teacher-signup" className="circle bg-white shadow-lg p-10 rounded-full hover:scale-105 transform transition duration-300 hover:shadow-xl animate__animated animate__fadeIn animate__delay-3s">
            <img src={teacherImage} alt="Teacher" className="circle-image w-40 h-40 rounded-full mb-4" />
            <span className="circle-label text-xl text-gray-800">Teacher</span>
          </Link>
          <Link to="/parent-signup" className="circle bg-white shadow-lg p-10 rounded-full hover:scale-105 transform transition duration-300 hover:shadow-xl animate__animated animate__fadeIn animate__delay-4s">
            <img src={parentImage} alt="Parent" className="circle-image w-40 h-40 rounded-full mb-4" />
            <span className="circle-label text-xl text-gray-800">Parent</span>
          </Link>
        </div>
      </section>

      {/* Teachers Section */}
      <section className="teachers-profiles py-20 bg-white">
        <h2 className="text-4xl font-bold text-gray-800 text-center mb-10 animate__animated animate__fadeIn animate__delay-1s">Meet Our Teachers</h2>
        <Slider {...videoSettings}>
          {teachers.map((teacher, index) => (
            <div key={index} className="teacher-card bg-white shadow-lg rounded-lg p-6 text-center transition transform hover:scale-105 hover:shadow-xl">
              <img
                src={teacher.imgSrc}
                alt={`${teacher.name} - ${teacher.subject}`}
                className="teacher-img w-40 h-40 rounded-full mx-auto mb-4 object-cover"
              />
              <h3 className="text-xl font-semibold text-gray-800">{teacher.name}</h3>
              <p className="text-gray-600">{teacher.subject}</p>
              <p className="text-gray-600">{teacher.school}</p>
              <p className="text-gray-600">{teacher.grade}</p>
              <Link
                to={`/teacher/${teacher.name.toLowerCase().replace(' ', '-')}`}
                className="text-blue-500 mt-4 block hover:underline"
              >
                View Profile
              </Link>
            </div>
          ))}
        </Slider>
      </section>

      {/* Tutorial Videos Section */}
      <section className="tutorial-videos py-20 bg-gray-100">
        <h2 className="text-4xl font-bold text-gray-800 text-center mb-10 animate__animated animate__fadeIn animate__delay-1s">Learning Tutorials</h2>
        <Slider {...videoSettings}>
          {videos.map((video, index) => (
            <div key={index} className="video-card bg-white shadow-lg rounded-lg p-6">
              <iframe
                width="100%"
                height="200"
                src={video.url}
                title={video.title}
                frameBorder="0"
                allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="rounded-lg"
              />
              <p className="text-center mt-4 text-gray-600">{video.title}</p>
            </div>
          ))}
        </Slider>
      </section>

     {/* About Us Section */}
<section className="about-us py-20 text-center">
  <h2 className="text-4xl font-bold text-gray-800 mb-10 animate__animated animate__fadeIn animate__delay-1s">
    About Us
  </h2>
  <div className="flex flex-col md:flex-row-reverse justify-between items-center max-w-7xl mx-auto px-4">
    {/* Image on the right */}
    <div className="about-us-photo w-full md:w-1/2 animate__animated animate__fadeIn mt-8 md:mt-0">
      <img
        src="/images/std3.jpeg"
        alt="About Us"
        className="w-full rounded-lg shadow-lg"
      />
    </div>
    {/* Content on the left */}
    <div className="about-us-content w-full md:w-1/2 pr-8 animate__animated animate__fadeIn animate__delay-1s">
      <p className="text-lg text-gray-600 mb-6">
        At StudyBuddy Africa, we are driven by a singular vision: to ensure that every student, regardless of their location, background, or resources, has access to quality education. By harnessing the power of technology, we bridge the gap between students and teachers, enabling learners to connect with the best educators in the country and empowering them to achieve their full potential.
      </p>
      <Link
        to="/about-us"
        className="bg-blue-500 text-white mt-4 block py-2 px-4 rounded-lg hover:bg-blue-400 transform transition duration-300"
      >
        Learn More
      </Link>
    </div>
  </div>
</section>


      {/* Testimonials Section */}
      <section className="testimonials py-20 bg-gray-100">
        <h2 className="text-4xl font-bold text-gray-800 text-center mb-10 animate__animated animate__fadeIn animate__delay-1s">What Our Students Say</h2>
        <Slider {...videoSettings}>
          {testimonials.map((testimonial, index) => (
            <div key={index} className="testimonial-card bg-white shadow-lg rounded-lg p-6 text-center">
              <img
                src={testimonial.imgSrc}
                alt={`${testimonial.name} - ${testimonial.role}`}
                className="testimonial-img w-40 h-40 rounded-full mx-auto mb-4 object-cover"
              />
              <p className="text-gray-600">"{testimonial.message}"</p>
              <h3 className="text-xl font-semibold text-gray-800">{testimonial.name}, {testimonial.role}</h3>
            </div>
          ))}
        </Slider>
      </section>

    </div>
  );
};

export default HomePage;