
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background text-center">
      <h1 className="mb-4 font-headline text-6xl font-bold text-primary">
        404
      </h1>
      <h2 className="mb-4 text-2xl font-semibold text-foreground">
        Page Not Found
      </h2>
      <p className="mb-8 max-w-md text-muted-foreground">
        Sorry, the page you are looking for does not exist or has been moved.
      </p>
      <Button asChild>
        <Link href="/">
          <Home className="mr-2 h-4 w-4" />
          Go back to Home
        </Link>
      </Button>
    </div>
  );
}
