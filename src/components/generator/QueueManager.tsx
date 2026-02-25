import { CheckCircle2, Clock, Loader2, AlertCircle } from 'lucide-react';
import { QueueTask } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';

interface QueueManagerProps {
  queue: QueueTask[];
}

export function QueueManager({ queue }: QueueManagerProps) {
  if (queue.length === 0) return null;

  const pending = queue.filter((t) => t.status === 'pending').length;
  const running = queue.filter((t) => t.status === 'running').length;
  const done = queue.filter((t) => t.status === 'done').length;

  return (
    <div className="fixed bottom-4 right-4 z-30 w-72 bg-card rounded-xl shadow-elevated border border-border overflow-hidden">
      <div className="px-3 py-2 border-b border-border flex items-center justify-between">
        <span className="text-xs font-display font-semibold">Generation Queue</span>
        <span className="text-[10px] text-muted-foreground">
          {done}/{queue.length} done
        </span>
      </div>
      <div className="max-h-48 overflow-y-auto scrollbar-thin">
        <AnimatePresence>
          {queue.map((task) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="px-3 py-2 border-b border-border/50 last:border-0 flex items-center gap-2"
            >
              {task.status === 'pending' && <Clock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />}
              {task.status === 'running' && <Loader2 className="w-3.5 h-3.5 text-primary animate-spin shrink-0" />}
              {task.status === 'done' && <CheckCircle2 className="w-3.5 h-3.5 text-green-600 shrink-0" />}
              {task.status === 'error' && <AlertCircle className="w-3.5 h-3.5 text-destructive shrink-0" />}
              <div className="flex-1 min-w-0">
                <p className="text-[11px] truncate">{task.prompt.slice(0, 60)}...</p>
                {task.status === 'running' && (
                  <div className="w-full h-1 bg-muted rounded-full mt-1 overflow-hidden">
                    <motion.div
                      className="h-full bg-primary rounded-full"
                      animate={{ width: `${task.progress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                )}
              </div>
              <span className="text-[10px] text-muted-foreground shrink-0">
                {task.status === 'done' ? `${task.results.length} img` : ''}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
