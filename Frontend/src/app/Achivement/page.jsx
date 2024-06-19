
'use client';
import AchievementCard from '../../components/ui/Achivementcard';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"


const AchievementPage = () => {
    return (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className='flex justify-between'>
                <h1 className="text-3xl font-bold text-blue-700 mb-4">Achievements</h1>
                <Avatar>
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>CN</AvatarFallback>
                </Avatar>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6">
                <AchievementCard title="Hackathon Champion" description="Winner of XYZ Hackathon." value={30} />
                <AchievementCard title="Career Milestone" description="Completed career roadmap milestones." value={50} />
                <AchievementCard title="Career Milestone" description="Completed career roadmap milestones." value={60} />
                <AchievementCard title="Career Milestone" description="Completed career roadmap milestones." value={100} />
                <AchievementCard title="Career Milestone" description="Completed career roadmap milestones." value={45} />
            </div>
        </main>
    );
};

export default AchievementPage;





