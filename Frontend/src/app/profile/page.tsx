'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { CalendarIcon, EnvelopeClosedIcon } from '@radix-ui/react-icons';
import EditProfileModal from './components/EditProfile';
import customAxios from '../services/customAxios';

export default function ProfilePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [profile, setProfile] = useState<{
    name: string;
    avatar: string;
    username: string;
    email: string;
    bio: string;
    note: string;
    memberSince: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const response = await customAxios.get('/profile');
      if (response.data?.success) {
        setProfile(response.data.profile);
      } else {
        throw new Error(response?.data?.message);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const updateProfile = async (newProfile: typeof profile) => {
    try {
      const response = await customAxios.put('/profile/update', newProfile);
      if (response?.data?.success) {
        setProfile(newProfile);
        closeModal();
      } else {
        throw new Error(response?.data?.message);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!profile) {
    return <div>Error loading profile</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="mx-auto w-full max-w-3xl">
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={profile.avatar} alt={profile.name} />
              <AvatarFallback>{profile.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl font-bold">
                {profile.name}
              </CardTitle>
              <CardDescription>@{profile?.username}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700">{profile?.bio}</p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex items-center">
              <EnvelopeClosedIcon className="mr-2" />
              <span>{profile?.email}</span>
            </div>
            <div className="flex items-center">
              <CalendarIcon className="mr-2" />
              <span>
                Member since{' '}
                {new Date(profile?.memberSince).toLocaleDateString()}
              </span>
            </div>
          </div>
          {profile?.note && (
            <div className="border-l-4 border-yellow-500 bg-yellow-100 p-4 text-yellow-700">
              <p className="font-bold">Note:</p>
              <p>{profile.note}</p>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={openModal} className="text-white hover:bg-primary2">
            Edit Profile
          </Button>
        </CardFooter>
      </Card>
      <EditProfileModal
        isOpen={isModalOpen}
        onClose={closeModal}
        profile={profile}
        updateProfile={updateProfile}
      />
    </div>
  );
}
