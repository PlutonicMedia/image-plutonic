import { useState } from 'react';
import { FolderOpen, Plus, Trash2, Pencil, Check, X } from 'lucide-react';
import { Client } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface AppSidebarProps {
  clients: Client[];
  selectedClient: Client | null;
  onSelectClient: (client: Client) => void;
  onAddClient: (name: string) => void;
  onRenameClient: (id: string, name: string) => void;
  onDeleteClient: (id: string) => void;
}

export function AppSidebar({
  clients,
  selectedClient,
  onSelectClient,
  onAddClient,
  onRenameClient,
  onDeleteClient,
}: AppSidebarProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleAdd = () => {
    if (newName.trim()) {
      onAddClient(newName.trim());
      setNewName('');
      setIsAdding(false);
    }
  };

  const handleRename = (id: string) => {
    if (editName.trim()) {
      onRenameClient(id, editName.trim());
      setEditingId(null);
    }
  };

  return (
    <aside className="w-[260px] shrink-0 border-r border-sidebar-border bg-sidebar flex flex-col h-screen">
      {/* Brand Header */}
      <div className="p-6 border-b border-sidebar-border">
        <h1 className="text-lg font-display font-bold text-sidebar-foreground tracking-tight">
          Plutonic Media
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">Creative Engine</p>
      </div>

      {/* Client List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin p-3">
        <div className="flex items-center justify-between px-3 mb-2">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Clients
          </span>
          <button
            onClick={() => setIsAdding(true)}
            className="p-1 rounded-md hover:bg-sidebar-accent transition-colors text-muted-foreground hover:text-sidebar-foreground"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {isAdding && (
          <div className="flex items-center gap-1.5 px-2 mb-2">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Client name..."
              className="h-8 text-sm"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            />
            <button onClick={handleAdd} className="p-1.5 rounded-md hover:bg-sidebar-accent text-primary">
              <Check className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => { setIsAdding(false); setNewName(''); }} className="p-1.5 rounded-md hover:bg-sidebar-accent text-muted-foreground">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <div className="space-y-0.5">
          {clients.map((client) => (
            <div
              key={client.id}
              className={cn(
                'group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all duration-150',
                selectedClient?.id === client.id
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
              )}
              onClick={() => onSelectClient(client)}
            >
              <FolderOpen className="w-4 h-4 shrink-0" />

              {editingId === client.id ? (
                <div className="flex items-center gap-1 flex-1 min-w-0">
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="h-6 text-sm px-1 py-0"
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => {
                      e.stopPropagation();
                      if (e.key === 'Enter') handleRename(client.id);
                      if (e.key === 'Escape') setEditingId(null);
                    }}
                  />
                  <button onClick={(e) => { e.stopPropagation(); handleRename(client.id); }} className="p-0.5">
                    <Check className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <>
                  <span className="text-sm truncate flex-1">{client.name}</span>
                  <div className="hidden group-hover:flex items-center gap-0.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingId(client.id);
                        setEditName(client.name);
                      }}
                      className="p-1 rounded hover:bg-background/50"
                    >
                      <Pencil className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteClient(client.id);
                      }}
                      className="p-1 rounded hover:bg-destructive/10 text-destructive"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}

          {clients.length === 0 && !isAdding && (
            <div className="px-3 py-8 text-center">
              <FolderOpen className="w-8 h-8 mx-auto text-muted-foreground/40 mb-2" />
              <p className="text-xs text-muted-foreground">No clients yet</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsAdding(true)}
                className="mt-2 text-xs"
              >
                <Plus className="w-3 h-3 mr-1" />
                Add your first client
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <p className="text-[10px] text-muted-foreground/50 text-center">
          © 2026 Plutonic Media
        </p>
      </div>
    </aside>
  );
}
