export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container relative h-[calc(100vh-8rem)] flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-primary/20 mix-blend-multiply" />
        <img 
          src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=1200" 
          alt="Authentication background" 
          className="absolute inset-0 h-full w-full object-cover grayscale opacity-20"
        />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <div className="bg-primary text-primary-foreground p-1 rounded-md mr-2 font-bold flex items-center justify-center w-8 h-8">
            SC
          </div>
          StudentConnect
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              &ldquo;This platform completely changed how I connect with other students and
              showcase my projects to potential employers.&rdquo;
            </p>
            <footer className="text-sm">Sofia Davis</footer>
          </blockquote>
        </div>
      </div>
      <div className="lg:p-8 flex items-center justify-center h-full">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:max-w-md sm:w-full px-2">
          {children}
        </div>
      </div>
    </div>
  );
}
