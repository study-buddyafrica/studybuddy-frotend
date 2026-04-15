import React from "react";

const teamMembers = [
  {
    name: "Faith Ondieki",
    role: "Founder & CEO",
    description:
      "Faith is the visionary behind the company, passionate about transforming the education sector.",
    photo: "/images/faith.jpg",
  },
  {
    name: "James Kano",
    role: "Fullstack Developer",
    description:
      "James is the frontend developer and brings innovative solutions to the table.",
    photo: "/images/james.jpg",
  },
  {
    name: "Godfrey",
    role: "Backend Developer",
    description:
      "Godfrey crafts strategies to reach and engage the right audience for our products.",
    photo: "/images/godfrey.jpg",
  },
  {
    name: "Davies",
    role: "Backend Developer",
    description:
      "Davies ensures that our platform runs smoothly, focusing on back-end development.",
    photo: "/images/davies.jpeg",
  },
];

const MeetTheTeamPage = () => {
  return (
    <div className="pt-20 px-8 pb-20">
      <section className="text-center">
        <h1 className="font-lilita text-[#076c93] font-semibold text-4xl pt-4">
          Meet Our Team
        </h1>
        <p className="font-josefin text-xl pt-4 text-gray-700 max-w-2xl mx-auto">
          Get to know the talented individuals driving our success.
        </p>
      </section>

      <section className=" flex flex-col md:flex-row justify-center gap-8 mt-12">
        {teamMembers.map((member, index) => (
          <div
            key={index}
            className="px-6 py-8 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all text-center border border-white/20 ">
            <img
              src={member.photo}
              alt={member.name}
              className="w-32 h-32 rounded-full object-cover mx-auto pb-2"
            />
            <h3 className="font-lilita text-2xl text-[#076c93]">
              {member.name}
            </h3>
            <p className="font-rowdies  pt-2">{member.role}</p>
            <p className="font-josefin text-gray-700 max-w-md mx-auto pt-2">
              {member.description}
            </p>
          </div>
        ))}
      </section>
    </div>
  );
};

export default MeetTheTeamPage;
