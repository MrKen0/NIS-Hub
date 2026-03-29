import Card from './Card';

interface PlaceholderSectionProps {
  title: string;
  description: string;
  children?: React.ReactNode;
}

export default function PlaceholderSection({ title, description, children }: PlaceholderSectionProps) {
  return (
    <Card title={title} subtitle={description}>
      <div className="space-y-3">
        {children}
        <p className="text-xs uppercase tracking-wide text-slate-400">Section is placeholder / UI scaffold only</p>
      </div>
    </Card>
  );
}
