import { useState } from 'react';
import { Plus, Check, X, FolderOpen, ChevronDown } from 'lucide-react';
import { Customer, Project } from '@/types';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface CustomerProjectSelectorProps {
  customers: Customer[];
  selectedCustomer: Customer | null;
  onSelectCustomer: (c: Customer | null) => void;
  onAddCustomer: (name: string) => void;
  projects: Project[];
  selectedProject: Project | null;
  onSelectProject: (p: Project | null) => void;
  onAddProject: (name: string) => void;
}

export function CustomerProjectSelector({
  customers, selectedCustomer, onSelectCustomer, onAddCustomer,
  projects, selectedProject, onSelectProject, onAddProject,
}: CustomerProjectSelectorProps) {
  const [addingCustomer, setAddingCustomer] = useState(false);
  const [addingProject, setAddingProject] = useState(false);
  const [newName, setNewName] = useState('');

  const handleAddCustomer = () => {
    if (newName.trim()) {
      onAddCustomer(newName.trim());
      setNewName('');
      setAddingCustomer(false);
    }
  };

  const handleAddProject = () => {
    if (newName.trim()) {
      onAddProject(newName.trim());
      setNewName('');
      setAddingProject(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Customer */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <Label className="text-xs font-medium text-muted-foreground">Customer</Label>
          <button onClick={() => { setAddingCustomer(true); setAddingProject(false); setNewName(''); }} className="text-xs text-primary hover:underline flex items-center gap-0.5">
            <Plus className="w-3 h-3" /> New
          </button>
        </div>
        {addingCustomer ? (
          <div className="flex gap-1.5">
            <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Customer name..." className="h-8 text-sm" autoFocus onKeyDown={(e) => e.key === 'Enter' && handleAddCustomer()} />
            <button onClick={handleAddCustomer} className="p-1.5 rounded-md hover:bg-accent text-primary"><Check className="w-3.5 h-3.5" /></button>
            <button onClick={() => setAddingCustomer(false)} className="p-1.5 rounded-md hover:bg-accent text-muted-foreground"><X className="w-3.5 h-3.5" /></button>
          </div>
        ) : (
          <Select value={selectedCustomer?.id || ''} onValueChange={(v) => {
            const c = customers.find((c) => c.id === v) || null;
            onSelectCustomer(c);
            onSelectProject(null);
          }}>
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder="Select customer..." />
            </SelectTrigger>
            <SelectContent>
              {customers.map((c) => (
                <SelectItem key={c.id} value={c.id} className="text-sm">
                  <span className="flex items-center gap-2"><FolderOpen className="w-3.5 h-3.5" />{c.name}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Project */}
      {selectedCustomer && (
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Project</Label>
            <button onClick={() => { setAddingProject(true); setAddingCustomer(false); setNewName(''); }} className="text-xs text-primary hover:underline flex items-center gap-0.5">
              <Plus className="w-3 h-3" /> New
            </button>
          </div>
          {addingProject ? (
            <div className="flex gap-1.5">
              <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Project name..." className="h-8 text-sm" autoFocus onKeyDown={(e) => e.key === 'Enter' && handleAddProject()} />
              <button onClick={handleAddProject} className="p-1.5 rounded-md hover:bg-accent text-primary"><Check className="w-3.5 h-3.5" /></button>
              <button onClick={() => setAddingProject(false)} className="p-1.5 rounded-md hover:bg-accent text-muted-foreground"><X className="w-3.5 h-3.5" /></button>
            </div>
          ) : (
            <Select value={selectedProject?.id || ''} onValueChange={(v) => onSelectProject(projects.find((p) => p.id === v) || null)}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="Select project..." />
              </SelectTrigger>
              <SelectContent>
                {projects.map((p) => (
                  <SelectItem key={p.id} value={p.id} className="text-sm">{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      )}
    </div>
  );
}
