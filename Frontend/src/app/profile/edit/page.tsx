'use client';

import { ArrowLeft, Loader2, Pencil, Save } from 'lucide-react';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ProfileSkeleton } from '../components/ProfileSkeleton';
import { useEditProfile } from './useEditProfile';
import { IdentitySection } from './components/IdentitySection';
import {
  AcademicSection,
  AdditionalDetailsSection,
  OnlinePresenceSection,
  ProfessionalSection,
} from './components/DetailSections';

export default function EditProfilePage() {
  const { router, form, isLoading, isSubmitting, usernameStatus, onSubmit } =
    useEditProfile();

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  return (
    <div className="min-h-screen bg-background/50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="hover:bg-primary/10 group gap-2 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Profile
          </Button>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Edit Profile
          </h1>
        </div>

        <Card className="overflow-hidden border-none bg-card shadow-xl ring-1 ring-border/50">
          <CardHeader className="from-primary/10 via-purple-500/5 border-b border-border/50 bg-gradient-to-r to-transparent p-8">
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 rounded-2xl p-3 text-primary shadow-inner">
                <Pencil className="h-8 w-8" />
              </div>
              <div>
                <CardTitle className="text-3xl font-bold tracking-tight">
                  Your Identity
                </CardTitle>
                <CardDescription className="mt-1 text-balance text-lg text-muted-foreground">
                  Update your professional profile and digital presence.
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-0 text-balance"
              >
                <div className="space-y-12 p-8">
                  <IdentitySection
                    form={form}
                    usernameStatus={usernameStatus}
                  />
                  <Separator className="bg-border/40" />
                  <ProfessionalSection form={form} />
                  <Separator className="bg-border/40" />
                  <AcademicSection form={form} />
                  <Separator className="bg-border/40" />
                  <OnlinePresenceSection form={form} />
                  <Separator className="bg-border/40" />
                  <AdditionalDetailsSection form={form} />
                </div>

                <div className="sticky bottom-0 z-10 flex flex-col justify-end gap-4 rounded-b-3xl border-t border-border/50 bg-background/80 p-8 backdrop-blur-md sm:flex-row">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    className="h-12 rounded-xl border-border/40 px-8 font-medium transition-all hover:bg-muted/50"
                    disabled={isSubmitting}
                  >
                    Discard Changes
                  </Button>
                  <Button
                    type="submit"
                    className="hover:bg-primary/90 shadow-primary/20 h-12 gap-3 rounded-xl bg-primary px-12 text-lg font-bold text-primary-foreground shadow-xl transition-all active:scale-[0.98]"
                    disabled={
                      isSubmitting ||
                      usernameStatus === 'checking' ||
                      usernameStatus === 'taken'
                    }
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Save className="h-5 w-5" />
                    )}
                    Save Profile
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
