import { Button } from "@workspace/ui/components/button";

export function HomePage() {
  return (
    <div className="flex min-h-svh items-center justify-center">
      <div className="flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Hello World</h1>
        <div className="flex gap-2">
          <Button>Button</Button>
          <Button variant="outline">Outline</Button>
        </div>
      </div>
    </div>
  );
}
