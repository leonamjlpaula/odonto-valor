'use client';

import { useState } from 'react';
import { Button } from '@/presentation/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/presentation/components/ui/dialog';
import { deleteAccount } from '@/application/usecases/contaActions';
import { Trash2 } from 'lucide-react';

interface ContaPageProps {
  nome: string;
  email: string;
}

export function ContaPage({ nome, email }: ContaPageProps) {
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setDeleting(true);
    setError(null);
    const result = await deleteAccount();
    if (result?.errors) {
      setError(result.errors.general?.[0] ?? 'Erro ao excluir conta.');
      setDeleting(false);
    }
    // On success, deleteAccount redirects — no state reset needed
  }

  return (
    <div className="max-w-lg space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Minha Conta</h1>
        <p className="text-muted-foreground text-sm mt-1">Gerencie suas informações pessoais</p>
      </div>

      <div className="rounded-lg border p-4 space-y-3">
        <h2 className="font-semibold text-sm">Informações da conta</h2>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Nome</p>
          <p className="text-sm font-medium">{nome}</p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">E-mail</p>
          <p className="text-sm font-medium">{email}</p>
        </div>
      </div>

      <div className="rounded-lg border border-destructive/30 p-4 space-y-3">
        <h2 className="font-semibold text-sm text-destructive">Zona de perigo</h2>
        <p className="text-sm text-muted-foreground">
          Excluir sua conta remove permanentemente todos os seus dados: procedimentos, materiais,
          configurações e registros. Esta ação não pode ser desfeita.
        </p>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="destructive" size="sm" className="gap-2">
              <Trash2 className="h-4 w-4" />
              Excluir minha conta
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tem certeza?</DialogTitle>
              <DialogDescription>
                Esta ação é irreversível. Todos os seus procedimentos, materiais, configurações e
                registros serão excluídos permanentemente. Você não poderá recuperar esses dados.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)} disabled={deleting}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
                {deleting ? 'Excluindo...' : 'Excluir conta'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
