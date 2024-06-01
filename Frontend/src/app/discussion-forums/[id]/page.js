"use client";

const forumTopics = [
    { id: 1, title: "Introduction to Mechanical Engineering", replies: 25 },
    { id: 2, title: "Software Development Best Practices", replies: 32 },
    { id: 3, title: "Electrical Circuit Design Techniques", replies: 18 },
];
export default function ViewChallengePage({ params }) {
    let { id } = params;
    const topic = forumTopics.find(topic => topic.id == id);

    if (!topic) {
        return <div className="container mx-auto p-4">Topic not found.</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <div className="bg-light shadow-md rounded-lg p-6">
                <div
                    key={topic.id}
                    className="p-6 bg-light shadow-md rounded-md cursor-pointer hover:bg-gray-100 transition duration-300 text-dark"
                >
                    <h2 className="text-xl font-semibold mb-2">{topic.title}</h2>
                    <p className="text-gray-600">Replies: {topic.replies}</p>
                </div>
            </div>
        </div>
    );
}
