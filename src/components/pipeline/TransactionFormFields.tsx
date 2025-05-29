
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';
import { etapes } from './types';

interface Agent {
  id: string;
  nom: string;
  email: string;
  telephone: string;
  statut: string;
}

interface TransactionFormFieldsProps {
  formData: {
    valeur: string;
    agent: string;
    etape: string;
    notes: string;
    source?: string;
  };
  onFieldChange: (field: string, value: string) => void;
  agents: Agent[];
}

const TransactionFormFields = ({ formData, onFieldChange, agents }: TransactionFormFieldsProps) => {
  const activeAgents = agents.filter(agent => agent.statut === 'actif').sort((a, b) => a.nom.localeCompare(b.nom));

  return (
    <>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="valeur">Budget client (FCFA)</Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-gray-400" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Budget maximum indiqué par le client</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Input 
          id="valeur" 
          type="number" 
          value={formData.valeur}
          onChange={(e) => onFieldChange('valeur', e.target.value)}
          placeholder="Saisir le budget client"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="agent">Agent responsable *</Label>
        <Select 
          value={formData.agent} 
          onValueChange={(value) => onFieldChange('agent', value)}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner un agent" />
          </SelectTrigger>
          <SelectContent>
            {activeAgents.map((agent) => (
              <SelectItem key={agent.id} value={agent.nom}>
                {agent.nom}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="etape">Étape actuelle</Label>
        <Select value={formData.etape} onValueChange={(value) => onFieldChange('etape', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Étape" />
          </SelectTrigger>
          <SelectContent>
            {etapes.map((etape) => (
              <SelectItem key={etape.key} value={etape.key}>
                {etape.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="source">Source de la transaction</Label>
        <Select 
          value={formData.source || ''} 
          onValueChange={(value) => onFieldChange('source', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner une source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="site_web">Site web</SelectItem>
            <SelectItem value="recommandation">Recommandation</SelectItem>
            <SelectItem value="prospection">Prospection</SelectItem>
            <SelectItem value="partenaire">Partenaire</SelectItem>
            <SelectItem value="publicite">Publicité</SelectItem>
            <SelectItem value="autre">Autre</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea 
          id="notes" 
          placeholder="Notes sur la transaction..." 
          value={formData.notes}
          onChange={(e) => onFieldChange('notes', e.target.value)}
        />
      </div>
    </>
  );
};

export default TransactionFormFields;
