import React from 'react';
import './MeetTheTeamPage.css';

const teamMembers = [
  {
    name: 'Faith Ondiek',
    role: 'Founder & CEO',
    description: 'Faith is the visionary behind the company, passionate about transforming the education sector.',
    photo: '/images/faith.jpg', 
  },
  {
    name: 'James Kano',
    role: 'Fullstack Developer',
    description: 'James is the frontend developer and brings innovative solutions to the table.',
    photo: '/images/james.jpg',
  },
  {
    name: 'Godfrey',
    role: 'Backend Developer',
    description: 'Godfrey crafts strategies to reach and engage the right audience for our products.',
    photo: '/images/godfrey.jpg',
  },
  {
    name: 'Davies',
    role: 'Backend Developer',
    description: 'Davies ensures that our platform runs smoothly, focusing on back-end development.',
    photo: '/images/davies.jpeg',
  },
];

const MeetTheTeamPage = () => {
  return (
    <div className="meet-the-team-page">
      <section className="header">
        <h1>Meet Our Team</h1>
        <p>Get to know the talented individuals driving our success.</p>
      </section>

      <section className="team-members">
        {teamMembers.map((member, index) => (
          <div key={index} className="team-member">
            <img src={member.photo} alt={member.name} className="team-photo" />
            <h3 className="team-name">{member.name}</h3>
            <p className="team-role">{member.role}</p>
            <p className="team-description">{member.description}</p>
          </div>
        ))}
      </section>
    </div>
  );
};

export default MeetTheTeamPage;
