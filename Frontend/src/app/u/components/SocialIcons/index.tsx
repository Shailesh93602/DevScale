import { Facebook, Twitter, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FC, ReactNode } from "react";

const IconWrapper = ({ children }: { children: ReactNode }) => (
  <Button variant="outline" size="icon" className="h-10 w-10">
    {children}
  </Button>
);

const SocialIcon = ({ Icon }: { Icon: FC<{ className: string }> }) => (
  <IconWrapper>
    <Icon className="h-5 w-5" />
  </IconWrapper>
);

export function SocialIcons() {
  return (
    <div className="flex justify-center space-x-4">
      <SocialIcon Icon={Facebook} />
      <SocialIcon Icon={Twitter} />
      <SocialIcon Icon={Github} />
    </div>
  );
}
