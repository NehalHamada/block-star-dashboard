import { User } from "lucide-react";
import { useAuth } from "../../hooks/useAuth.js";

const Header = () => {
  const { user } = useAuth();

  return (
    <header className="bg-background border-b border-light-gray/20 h-16 flex items-center justify-between px-6 lg:px-10 sticky top-0 z-30">
      <div className="flex items-center space-x-4 space-x-reverse mr-auto">
        <div className="flex items-center gap-3 border-r border-light-gray/20 pr-4">
          <div className="hidden sm:block text-left">
            <p className="text-sm font-medium text-text-black">مستخدم الإدارة</p>
            <p className="text-xs text-dark-gray">{user?.email}</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-light-gray flex items-center justify-center text-dark-gray overflow-hidden">
            <User className="h-6 w-6" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
