import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { LogIn, Mail, Lock, Eye, EyeOff } from "lucide-react";
import bgImage from "../assets/bg.jpg";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await login(email, password);

    if (result.success) {
      navigate("/");
    } else {
      setError(
        result.error?.message || "فشل تسجيل الدخول. تحقق من البيانات المدخلة.",
      );
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />
      {/* Dark Overlay for readability */}
      <div className="absolute inset-0 z-[1] bg-black/40 backdrop-blur-[2px]" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-md px-4">
        {/* Login Card - Glassmorphism */}
        <div
          className="rounded-3xl p-8 shadow-2xl border border-white/20"
          style={{
            background: "rgba(255, 253, 245, 0.85)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
          }}
        >
          {/* Card Header */}
          <div className="text-center mb-8">
            <div
              className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 shadow-lg"
              style={{
                background: "linear-gradient(135deg, #8E741D 0%, #C5A94D 100%)",
              }}
            >
              <LogIn className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-text-black mb-1">
              مرحباً بعودتك
            </h2>
            <p className="text-dark-gray text-sm">
              أدخل بياناتك للوصول إلى لوحة التحكم
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl animate-[shake_0.3s_ease-in-out]">
              <p className="text-sm text-red-600 text-center font-medium">
                {error}
              </p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-text-black mb-2"
              >
                البريد الإلكتروني
              </label>
              <div className="relative">
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-dark-gray/60">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pr-11 pl-4 py-3.5 border-2 border-light-gray/60 rounded-xl bg-white/70 text-text-black placeholder:text-dark-gray/40 focus:outline-none focus:border-secondary focus:ring-4 focus:ring-secondary/10 transition-all duration-300"
                  placeholder="example@domain.com"
                  disabled={loading}
                  dir="ltr"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-text-black mb-2"
              >
                كلمة المرور
              </label>
              <div className="relative">
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-dark-gray/60">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pr-11 pl-12 py-3.5 border-2 border-light-gray/60 rounded-xl bg-white/70 text-text-black placeholder:text-dark-gray/40 focus:outline-none focus:border-secondary focus:ring-4 focus:ring-secondary/10 transition-all duration-300"
                  placeholder="••••••••"
                  disabled={loading}
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-gray/60 hover:text-secondary transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 text-base font-bold text-white rounded-xl shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background:
                  "linear-gradient(135deg, #8E741D 0%, #A6892F 50%, #8E741D 100%)",
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  جاري التحميل...
                </span>
              ) : (
                "تسجيل الدخول"
              )}
            </button>
          </form>

          {/* Bottom Decoration */}
          <div className="mt-6 flex items-center justify-center gap-2">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-secondary/30" />
            <span className="text-xs text-dark-gray/60">لوحة التحكم</span>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-secondary/30" />
          </div>
        </div>

        {/* Copyright */}
        <p className="text-center text-white/60 text-xs mt-6 drop-shadow-md">
          © {new Date().getFullYear()} جميع الحقوق محفوظة
        </p>
      </div>
    </div>
  );
};

export default Login;
